/**
 * Document Structure Analyzer
 *
 * Detects sections in GSA RFP/solicitation PDFs using:
 * 1. Regex patterns (fast, free, covers common cases)
 * 2. Claude Sonnet 3.5 (for complex documents)
 *
 * Caches results for cost optimization.
 */

import Anthropic from '@anthropic-ai/sdk';

export interface DocumentSection {
  sectionName: string;
  startPage: number;
  endPage: number;
  startCharIndex: number;
  endCharIndex: number;
  confidence: 'high' | 'medium' | 'low';
  keywords: string[];
}

export interface DocumentStructure {
  sections: DocumentSection[];
  detectionMethod: 'regex' | 'claude' | 'hybrid';
  confidence: 'high' | 'medium' | 'low';
}

/**
 * Common GSA RFP section patterns (case-insensitive)
 */
const SECTION_PATTERNS: Record<string, RegExp[]> = {
  'Requirements': [
    /(?:^|\n)\s*(?:SECTION\s+)?([A-Z0-9]+\.?\s+)?REQUIREMENTS?\s*:?\s*$/im,
    /(?:^|\n)\s*(?:SECTION\s+)?([A-Z0-9]+\.?\s+)?PROPERTY\s+REQUIREMENTS?\s*:?\s*$/im,
    /(?:^|\n)\s*(?:SECTION\s+)?([A-Z0-9]+\.?\s+)?SPACE\s+REQUIREMENTS?\s*:?\s*$/im,
    /(?:^|\n)\s*(?:SECTION\s+)?([A-Z0-9]+\.?\s+)?MINIMUM\s+REQUIREMENTS?\s*:?\s*$/im,
  ],
  'Evaluation Criteria': [
    /(?:^|\n)\s*(?:SECTION\s+)?([A-Z0-9]+\.?\s+)?EVALUATION\s+CRITERIA\s*:?\s*$/im,
    /(?:^|\n)\s*(?:SECTION\s+)?([A-Z0-9]+\.?\s+)?EVALUATION\s+FACTORS?\s*:?\s*$/im,
    /(?:^|\n)\s*(?:SECTION\s+)?([A-Z0-9]+\.?\s+)?EVALUATION\s+PROCEDURES?\s*:?\s*$/im,
    /(?:^|\n)\s*(?:SECTION\s+)?([A-Z0-9]+\.?\s+)?BASIS\s+OF\s+AWARD\s*:?\s*$/im,
  ],
  'Submission Instructions': [
    /(?:^|\n)\s*(?:SECTION\s+)?([A-Z0-9]+\.?\s+)?SUBMISSION\s+INSTRUCTIONS?\s*:?\s*$/im,
    /(?:^|\n)\s*(?:SECTION\s+)?([A-Z0-9]+\.?\s+)?PROPOSAL\s+INSTRUCTIONS?\s*:?\s*$/im,
    /(?:^|\n)\s*(?:SECTION\s+)?([A-Z0-9]+\.?\s+)?HOW\s+TO\s+SUBMIT\s*:?\s*$/im,
  ],
  'Technical Specifications': [
    /(?:^|\n)\s*(?:SECTION\s+)?([A-Z0-9]+\.?\s+)?TECHNICAL\s+SPECIFICATIONS?\s*:?\s*$/im,
    /(?:^|\n)\s*(?:SECTION\s+)?([A-Z0-9]+\.?\s+)?TECHNICAL\s+REQUIREMENTS?\s*:?\s*$/im,
    /(?:^|\n)\s*(?:SECTION\s+)?([A-Z0-9]+\.?\s+)?SPECIFICATIONS?\s*:?\s*$/im,
  ],
  'Scope of Work': [
    /(?:^|\n)\s*(?:SECTION\s+)?([A-Z0-9]+\.?\s+)?SCOPE\s+OF\s+WORK\s*:?\s*$/im,
    /(?:^|\n)\s*(?:SECTION\s+)?([A-Z0-9]+\.?\s+)?STATEMENT\s+OF\s+WORK\s*:?\s*$/im,
    /(?:^|\n)\s*(?:SECTION\s+)?([A-Z0-9]+\.?\s+)?SOW\s*:?\s*$/im,
  ],
  'Deliverables': [
    /(?:^|\n)\s*(?:SECTION\s+)?([A-Z0-9]+\.?\s+)?DELIVERABLES?\s*:?\s*$/im,
    /(?:^|\n)\s*(?:SECTION\s+)?([A-Z0-9]+\.?\s+)?DELIVERY\s+REQUIREMENTS?\s*:?\s*$/im,
  ],
  'Security Requirements': [
    /(?:^|\n)\s*(?:SECTION\s+)?([A-Z0-9]+\.?\s+)?SECURITY\s+REQUIREMENTS?\s*:?\s*$/im,
    /(?:^|\n)\s*(?:SECTION\s+)?([A-Z0-9]+\.?\s+)?CLEARANCE\s+REQUIREMENTS?\s*:?\s*$/im,
  ],
  'Contract Terms': [
    /(?:^|\n)\s*(?:SECTION\s+)?([A-Z0-9]+\.?\s+)?CONTRACT\s+TERMS?\s*:?\s*$/im,
    /(?:^|\n)\s*(?:SECTION\s+)?([A-Z0-9]+\.?\s+)?TERMS\s+AND\s+CONDITIONS\s*:?\s*$/im,
  ],
};

/**
 * Keywords associated with each section type
 */
const SECTION_KEYWORDS: Record<string, string[]> = {
  'Requirements': ['minimum', 'square footage', 'parking', 'must', 'shall', 'required'],
  'Evaluation Criteria': ['scoring', 'points', 'weighted', 'evaluation', 'rated', 'factor'],
  'Submission Instructions': ['submit', 'deadline', 'due date', 'proposal', 'format', 'email'],
  'Technical Specifications': ['specifications', 'standards', 'compliance', 'technical', 'system'],
  'Scope of Work': ['deliverables', 'tasks', 'services', 'work', 'responsibilities'],
  'Deliverables': ['deliverables', 'reports', 'documents', 'provide', 'furnish'],
  'Security Requirements': ['clearance', 'security', 'classified', 'background check'],
  'Contract Terms': ['payment', 'invoice', 'warranty', 'liability', 'termination'],
};

/**
 * Analyze document structure using regex patterns (fast and free)
 */
export function detectSectionsWithRegex(
  text: string,
  metadata: { pageCount: number }
): DocumentSection[] {
  const sections: DocumentSection[] = [];
  const charsPerPage = Math.ceil(text.length / metadata.pageCount);

  for (const [sectionName, patterns] of Object.entries(SECTION_PATTERNS)) {
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match.index !== undefined) {
        const startCharIndex = match.index;
        const startPage = Math.floor(startCharIndex / charsPerPage) + 1;

        // Estimate end of section (look for next section or end of document)
        let endCharIndex = text.length;
        let nextSectionMatch: RegExpMatchArray | null = null;
        let minIndex = text.length;

        // Find the next section heading
        for (const [_, otherPatterns] of Object.entries(SECTION_PATTERNS)) {
          for (const otherPattern of otherPatterns) {
            const nextMatch = text.slice(startCharIndex + 100).match(otherPattern); // Skip current match
            if (nextMatch && nextMatch.index !== undefined) {
              const absoluteIndex = startCharIndex + 100 + nextMatch.index;
              if (absoluteIndex < minIndex) {
                minIndex = absoluteIndex;
                nextSectionMatch = nextMatch;
              }
            }
          }
        }

        if (nextSectionMatch) {
          endCharIndex = minIndex;
        }

        const endPage = Math.floor(endCharIndex / charsPerPage) + 1;

        sections.push({
          sectionName,
          startPage,
          endPage,
          startCharIndex,
          endCharIndex,
          confidence: 'high', // Regex matches are high confidence
          keywords: SECTION_KEYWORDS[sectionName] || [],
        });

        break; // Found this section, move to next section type
      }
    }
  }

  return sections;
}

/**
 * Analyze document structure using Claude Sonnet 3.5 (for complex documents)
 */
export async function detectSectionsWithClaude(
  text: string,
  metadata: { pageCount: number }
): Promise<DocumentSection[]> {
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  // Truncate text if too long (Claude input limit)
  const maxChars = 100000; // ~25k tokens
  const truncatedText = text.length > maxChars ? text.substring(0, maxChars) + '\n\n[Document truncated...]' : text;

  const prompt = `Analyze this GSA lease solicitation document and identify the main sections.

For each section you find, provide:
- Section name
- Approximate page number where it starts
- Key keywords that appear in that section

Focus on these common section types:
- Requirements
- Evaluation Criteria
- Submission Instructions
- Technical Specifications
- Scope of Work
- Deliverables
- Security Requirements
- Contract Terms

Return your answer as a JSON array of objects with this structure:
{
  "sectionName": "Requirements",
  "startPage": 5,
  "keywords": ["minimum", "square footage", "parking"]
}

Document (${metadata.pageCount} pages):
${truncatedText}`;

  const response = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 2048,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  const textContent = response.content.find((c) => c.type === 'text');
  if (!textContent || textContent.type !== 'text') {
    return [];
  }

  try {
    // Extract JSON from response (may be wrapped in markdown)
    let jsonText = textContent.text;
    const jsonMatch = jsonText.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      jsonText = jsonMatch[0];
    }

    const claudeSections: any[] = JSON.parse(jsonText);

    // Convert to DocumentSection format
    const charsPerPage = Math.ceil(text.length / metadata.pageCount);

    return claudeSections.map((section) => {
      const startCharIndex = (section.startPage - 1) * charsPerPage;
      const endCharIndex = Math.min(startCharIndex + charsPerPage * 3, text.length); // Estimate 3 pages per section

      return {
        sectionName: section.sectionName,
        startPage: section.startPage,
        endPage: section.startPage + 2, // Estimate
        startCharIndex,
        endCharIndex,
        confidence: 'medium' as const, // Claude is medium confidence (may hallucinate)
        keywords: section.keywords || [],
      };
    });
  } catch (error) {
    console.error('[Structure Analyzer] Error parsing Claude response:', error);
    return [];
  }
}

/**
 * Main function: Analyze document structure using hybrid approach
 */
export async function analyzeDocumentStructure(
  text: string,
  metadata: { pageCount: number; title?: string }
): Promise<DocumentStructure> {
  console.log(`[Structure Analyzer] Analyzing document structure (${metadata.pageCount} pages)...`);

  // Step 1: Try regex first (fast and free)
  const regexSections = detectSectionsWithRegex(text, metadata);

  if (regexSections.length >= 3) {
    // Found 3+ sections with regex - good enough!
    console.log(`[Structure Analyzer] Found ${regexSections.length} sections using regex (free)`);

    return {
      sections: regexSections,
      detectionMethod: 'regex',
      confidence: 'high',
    };
  }

  // Step 2: Fall back to Claude for complex documents
  console.log('[Structure Analyzer] Regex found < 3 sections, using Claude for analysis...');

  try {
    const claudeSections = await detectSectionsWithClaude(text, metadata);

    if (claudeSections.length > 0) {
      console.log(`[Structure Analyzer] Found ${claudeSections.length} sections using Claude`);

      // Merge regex and Claude results (prefer regex where overlap)
      const mergedSections = [...regexSections];
      for (const claudeSection of claudeSections) {
        const overlap = regexSections.find(
          (r) => r.sectionName.toLowerCase() === claudeSection.sectionName.toLowerCase()
        );
        if (!overlap) {
          mergedSections.push(claudeSection);
        }
      }

      return {
        sections: mergedSections,
        detectionMethod: regexSections.length > 0 ? 'hybrid' : 'claude',
        confidence: regexSections.length > 0 ? 'high' : 'medium',
      };
    }
  } catch (error) {
    console.error('[Structure Analyzer] Error using Claude:', error);
  }

  // Step 3: Fallback - return regex results even if < 3
  if (regexSections.length > 0) {
    console.log('[Structure Analyzer] Claude failed, using regex results as fallback');
    return {
      sections: regexSections,
      detectionMethod: 'regex',
      confidence: 'medium',
    };
  }

  // Step 4: No sections found - return empty
  console.log('[Structure Analyzer] No sections detected');
  return {
    sections: [],
    detectionMethod: 'regex',
    confidence: 'low',
  };
}
