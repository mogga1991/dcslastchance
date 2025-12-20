/**
 * AI Opportunity Summarization
 * Converts dense GSA solicitation text into broker-friendly structured summaries
 */

import Anthropic from '@anthropic-ai/sdk';

// =============================================================================
// TYPES
// =============================================================================

export interface OpportunitySummary {
  headline: string;
  location: {
    description: string;
    delineatedArea?: string;
    state?: string;
    city?: string;
  };
  space: {
    minSF?: number;
    maxSF?: number;
    description: string;
  };
  propertyRequirements: {
    type: string;
    class?: string;
    features: string[];
  };
  specialConditions: string[];
  dates: {
    responseDeadline?: string;
    anticipatedOccupancy?: string;
    leaseTerm?: string;
  };
  evaluationCriteria: string[];
  brokerTakeaway: string;
}

export interface SummarizationResult {
  summary: OpportunitySummary;
  model: string;
  tokensUsed: number;
  generationTimeMs: number;
  promptVersion: string;
}

export interface OpportunityInput {
  title: string;
  description: string;
  solicitationNumber?: string;
  placeOfPerformance?: {
    state?: string;
    city?: string;
    streetAddress?: string;
    zip?: string;
  };
  responseDeadline?: string;
  postedDate?: string;
}

// =============================================================================
// PROMPT
// =============================================================================

const SUMMARIZATION_PROMPT = `You are an expert at analyzing GSA (General Services Administration) lease solicitations and extracting key information for commercial real estate brokers.

Given a GSA lease opportunity description, extract and summarize the following information in a structured format. Be concise and broker-focused.

IMPORTANT GUIDELINES:
- Use plain language, not government jargon
- If information is not explicitly stated, mark as null or omit
- Square footage should be numbers only (no commas in the JSON)
- Dates should be in YYYY-MM-DD format when possible
- Focus on what matters to a broker trying to match a property

Return a JSON object with this exact structure:
{
  "headline": "One-sentence summary suitable for a card header (max 100 chars)",
  "location": {
    "description": "Human-readable location description",
    "delineatedArea": "The specific area/boundaries if mentioned",
    "state": "Two-letter state code",
    "city": "City name"
  },
  "space": {
    "minSF": <number or null>,
    "maxSF": <number or null>,
    "description": "Human-readable space requirements"
  },
  "propertyRequirements": {
    "type": "Office, Warehouse, etc.",
    "class": "A, B, C, or null if not specified",
    "features": ["Array of required features like ADA, LEED, parking, etc."]
  },
  "specialConditions": ["Array of special requirements or conditions"],
  "dates": {
    "responseDeadline": "YYYY-MM-DD or null",
    "anticipatedOccupancy": "YYYY-MM-DD or descriptive string",
    "leaseTerm": "e.g., '15 years' or '10 years firm, 5 years option'"
  },
  "evaluationCriteria": ["Array of evaluation factors if mentioned"],
  "brokerTakeaway": "1-2 sentence actionable insight for brokers"
}

Return ONLY valid JSON, no markdown code blocks or additional text.`;

// =============================================================================
// SUMMARIZATION FUNCTION
// =============================================================================

export async function summarizeOpportunity(
  opportunity: OpportunityInput,
  options?: {
    apiKey?: string;
    model?: string;
  }
): Promise<SummarizationResult> {
  const startTime = performance.now();
  
  const apiKey = options?.apiKey || process.env.ANTHROPIC_API_KEY;
  const model = options?.model || 'claude-3-5-sonnet-20241022';
  
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY is required');
  }
  
  const anthropic = new Anthropic({ apiKey });
  
  // Build context from opportunity data
  const contextParts: string[] = [
    `Title: ${opportunity.title}`,
    `Solicitation: ${opportunity.solicitationNumber || 'N/A'}`,
  ];
  
  if (opportunity.placeOfPerformance) {
    const pop = opportunity.placeOfPerformance;
    contextParts.push(
      `Location: ${[pop.city, pop.state, pop.zip].filter(Boolean).join(', ')}`
    );
  }
  
  if (opportunity.responseDeadline) {
    contextParts.push(`Response Deadline: ${opportunity.responseDeadline}`);
  }
  
  contextParts.push(`\nFull Description:\n${opportunity.description}`);
  
  const userMessage = contextParts.join('\n');
  
  // Call Claude API
  const response = await anthropic.messages.create({
    model,
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: `${SUMMARIZATION_PROMPT}\n\n---\n\n${userMessage}`
      }
    ]
  });
  
  const generationTimeMs = Math.round(performance.now() - startTime);
  
  // Extract text from response
  const textContent = response.content.find(c => c.type === 'text');
  if (!textContent || textContent.type !== 'text') {
    throw new Error('No text response from Claude');
  }
  
  // Parse JSON response
  let summary: OpportunitySummary;
  try {
    // Clean potential markdown code blocks
    let jsonText = textContent.text.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.slice(7);
    }
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.slice(3);
    }
    if (jsonText.endsWith('```')) {
      jsonText = jsonText.slice(0, -3);
    }
    
    summary = JSON.parse(jsonText.trim());
  } catch (e) {
    console.error('Failed to parse Claude response:', textContent.text);
    throw new Error(`Failed to parse summary JSON: ${e}`);
  }
  
  // Calculate tokens
  const tokensUsed = (response.usage?.input_tokens || 0) + (response.usage?.output_tokens || 0);
  
  return {
    summary,
    model,
    tokensUsed,
    generationTimeMs,
    promptVersion: 'v1'
  };
}

// =============================================================================
// BATCH SUMMARIZATION (with rate limiting)
// =============================================================================

export async function summarizeOpportunities(
  opportunities: OpportunityInput[],
  options?: {
    apiKey?: string;
    model?: string;
    concurrency?: number;
    delayMs?: number;
  }
): Promise<Map<string, SummarizationResult>> {
  const concurrency = options?.concurrency || 2;
  const delayMs = options?.delayMs || 500;
  
  const results = new Map<string, SummarizationResult>();
  
  // Process in batches
  for (let i = 0; i < opportunities.length; i += concurrency) {
    const batch = opportunities.slice(i, i + concurrency);
    
    const batchResults = await Promise.allSettled(
      batch.map(opp => summarizeOpportunity(opp, options))
    );
    
    batchResults.forEach((result, idx) => {
      const opp = batch[idx];
      const key = opp.solicitationNumber || opp.title;
      
      if (result.status === 'fulfilled') {
        results.set(key, result.value);
      } else {
        console.error(`Failed to summarize ${key}:`, result.reason);
      }
    });
    
    // Rate limit delay
    if (i + concurrency < opportunities.length) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
  
  return results;
}

// =============================================================================
// FALLBACK SUMMARY (when AI unavailable or for cost savings)
// =============================================================================

export function generateFallbackSummary(opportunity: OpportunityInput): OpportunitySummary {
  const pop = opportunity.placeOfPerformance;
  
  // Extract SF from description using regex
  const sfMatch = opportunity.description.match(/(\d{1,3}(?:,\d{3})*)\s*(?:to|-)\s*(\d{1,3}(?:,\d{3})*)\s*(?:SF|sq\.?\s*ft|square\s*feet)/i);
  const singleSfMatch = opportunity.description.match(/(\d{1,3}(?:,\d{3})*)\s*(?:SF|sq\.?\s*ft|square\s*feet)/i);
  
  let minSF: number | undefined;
  let maxSF: number | undefined;
  
  if (sfMatch) {
    minSF = parseInt(sfMatch[1].replace(/,/g, ''));
    maxSF = parseInt(sfMatch[2].replace(/,/g, ''));
  } else if (singleSfMatch) {
    const sf = parseInt(singleSfMatch[1].replace(/,/g, ''));
    minSF = Math.round(sf * 0.9);
    maxSF = Math.round(sf * 1.1);
  }
  
  // Extract building class
  const classMatch = opportunity.description.match(/class\s+([ABC])/i);
  const buildingClass = classMatch ? classMatch[1].toUpperCase() : undefined;
  
  return {
    headline: opportunity.title.slice(0, 100),
    location: {
      description: pop 
        ? [pop.city, pop.state].filter(Boolean).join(', ')
        : 'See solicitation for details',
      state: pop?.state,
      city: pop?.city
    },
    space: {
      minSF,
      maxSF,
      description: minSF && maxSF 
        ? `${minSF.toLocaleString()} - ${maxSF.toLocaleString()} SF`
        : 'See solicitation for requirements'
    },
    propertyRequirements: {
      type: 'Office',
      class: buildingClass,
      features: []
    },
    specialConditions: [],
    dates: {
      responseDeadline: opportunity.responseDeadline
    },
    evaluationCriteria: [],
    brokerTakeaway: 'Review full solicitation for detailed requirements.'
  };
}

export default summarizeOpportunity;
