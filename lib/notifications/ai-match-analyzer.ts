/**
 * AI Match Analyzer
 * Uses Claude to analyze top property-opportunity matches
 * and generate personalized insights for brokers
 */

import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';

export interface MatchAnalysisInput {
  propertyId: string;
  opportunityId: string;
  matchScore: number;
  grade: string;
  factors: {
    location: { score: number; explanation: string };
    space: { score: number; explanation: string };
    building: { score: number; explanation: string };
    timeline: { score: number; explanation: string };
    experience: { score: number; explanation: string };
  };
  property: any;  // From broker_listings
  opportunity: any;  // From opportunities
}

export interface MatchInsight {
  summary: string;                    // 1-2 sentence overview
  keyStrengths: string[];             // Top 3 strengths
  potentialConcerns: string[];        // Areas to address
  actionItems: string[];              // Specific next steps
  competitiveEdge: string;            // What makes this match stand out
  estimatedWinProbability?: string;   // e.g., "High (70-85%)"
}

const MATCH_ANALYSIS_PROMPT = `You are a commercial real estate expert analyzing property-opportunity matches for GSA (federal government) leases.

Given a property and GSA lease opportunity with match scores, provide actionable insights for the broker.

IMPORTANT:
- Be concise and broker-focused (not government jargon)
- Highlight specific strengths that meet GSA requirements
- Point out potential gaps the broker should address BEFORE submitting
- Give concrete next steps

Return ONLY valid JSON with this structure:
{
  "summary": "One compelling sentence about this match",
  "keyStrengths": ["Strength 1", "Strength 2", "Strength 3"],
  "potentialConcerns": ["Concern 1 if any", "Concern 2"],
  "actionItems": ["Next step 1", "Next step 2", "Next step 3"],
  "competitiveEdge": "Why this property stands out",
  "estimatedWinProbability": "High (70-85%)" or "Medium (40-70%)" or "Low (<40%)"
}`;

export class AIMatchAnalyzer {
  private anthropic: Anthropic;
  private supabase;

  constructor(
    anthropicApiKey: string,
    supabaseUrl: string,
    supabaseKey: string
  ) {
    this.anthropic = new Anthropic({ apiKey: anthropicApiKey });
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  /**
   * Analyze a single match with Claude
   */
  async analyzeMatch(input: MatchAnalysisInput): Promise<MatchInsight> {
    const prompt = this.buildAnalysisPrompt(input);

    const response = await this.anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `${MATCH_ANALYSIS_PROMPT}\n\n---\n\n${prompt}`,
        },
      ],
    });

    const textContent = response.content.find(c => c.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text response from Claude');
    }

    // Parse JSON response
    let insight: MatchInsight;
    try {
      let jsonText = textContent.text.trim();
      // Clean potential markdown
      if (jsonText.startsWith('```json')) jsonText = jsonText.slice(7);
      if (jsonText.startsWith('```')) jsonText = jsonText.slice(3);
      if (jsonText.endsWith('```')) jsonText = jsonText.slice(0, -3);

      insight = JSON.parse(jsonText.trim());
    } catch (e) {
      console.error('Failed to parse Claude response:', textContent.text);
      throw new Error(`Failed to parse AI insight: ${e}`);
    }

    return insight;
  }

  /**
   * Build analysis prompt from match data
   */
  private buildAnalysisPrompt(input: MatchAnalysisInput): string {
    const { property, opportunity, matchScore, grade, factors } = input;

    return `
PROPERTY DETAILS:
- Location: ${property.city}, ${property.state}
- Size: ${property.available_sf?.toLocaleString()} SF available
- Class: ${property.building_class || 'Not specified'}
- Features: ${this.extractPropertyFeatures(property)}

OPPORTUNITY DETAILS:
- Title: ${opportunity.title}
- Agency: ${opportunity.office || 'GSA'}
- Location: ${opportunity.pop_city_name}, ${opportunity.pop_state_code}
- Response Deadline: ${opportunity.response_deadline}

MATCH SCORES (0-100):
- Overall: ${matchScore} (Grade ${grade})
- Location: ${factors.location.score} - ${factors.location.explanation}
- Space: ${factors.space.score} - ${factors.space.explanation}
- Building: ${factors.building.score} - ${factors.building.explanation}
- Timeline: ${factors.timeline.score} - ${factors.timeline.explanation}
- Experience: ${factors.experience.score} - ${factors.experience.explanation}

Based on this analysis, provide broker insights.
    `.trim();
  }

  /**
   * Extract relevant property features for prompt
   */
  private extractPropertyFeatures(property: any): string {
    const features: string[] = [];

    if (property.ada_compliant) features.push('ADA compliant');
    if (property.has_fiber) features.push('Fiber');
    if (property.has_backup_power) features.push('Backup power');
    if (property.leed_certified) features.push('LEED certified');
    if (property.energy_star) features.push('Energy Star');
    if (property.parking_ratio) features.push(`${property.parking_ratio}:1000 parking`);

    return features.length > 0 ? features.join(', ') : 'Standard office features';
  }

  /**
   * Batch analyze top matches (with rate limiting)
   */
  async analyzeTopMatches(
    matches: MatchAnalysisInput[],
    options: { concurrency?: number; delayMs?: number } = {}
  ): Promise<Map<string, MatchInsight>> {
    const concurrency = options.concurrency || 2;
    const delayMs = options.delayMs || 500;

    const results = new Map<string, MatchInsight>();

    for (let i = 0; i < matches.length; i += concurrency) {
      const batch = matches.slice(i, i + concurrency);

      const batchResults = await Promise.allSettled(
        batch.map(match => this.analyzeMatch(match))
      );

      batchResults.forEach((result, idx) => {
        const match = batch[idx];
        const key = match.propertyId + ':' + match.opportunityId;

        if (result.status === 'fulfilled') {
          results.set(key, result.value);
        } else {
          console.error(`Failed to analyze match ${key}:`, result.reason);
        }
      });

      // Rate limit
      if (i + concurrency < matches.length) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }

    return results;
  }
}
