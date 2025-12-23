/**
 * A/B Testing Framework for Extraction Accuracy
 *
 * Compares AI extraction vs regex extraction against ground truth data
 * to validate 90% accuracy target
 */

import type { SAMOpportunity } from '@/lib/sam-gov';
import { extractRequirementsWithAI, extractRequirementsWithRegex } from './extract-requirements';
import type { ExtractedRequirements } from './extract-requirements';

// =============================================================================
// TYPES
// =============================================================================

export interface GroundTruthRequirements {
  noticeId: string;
  manualReview: {
    location: {
      state: string;
      city?: string | null;
      hasDelineatedArea: boolean;
    };
    space: {
      minSqFt?: number | null;
      maxSqFt?: number | null;
      targetSqFt?: number | null;
      isRentable?: boolean;
      isContiguous?: boolean;
    };
    building: {
      classes?: string[];
      requiresADA?: boolean;
      requiresLEED?: boolean;
      requiresSCIF?: boolean;
    };
    timeline: {
      occupancyDate?: string | null;
      firmTermMonths?: number | null;
    };
  };
  reviewer: string;
  reviewDate: string;
  notes?: string;
}

export interface AccuracyScore {
  field: string;
  correct: boolean;
  predicted: any;
  actual: any;
  partialCredit?: number; // 0-1 for fuzzy matches
}

export interface MethodComparison {
  noticeId: string;
  aiAccuracy: number;
  regexAccuracy: number;
  aiScores: AccuracyScore[];
  regexScores: AccuracyScore[];
  aiTokensUsed: number;
  aiCost: number;
  aiTime: number;
  regexTime: number;
  winner: 'ai' | 'regex' | 'tie';
}

export interface ABTestResults {
  totalSamples: number;
  aiOverallAccuracy: number;
  regexOverallAccuracy: number;
  aiWins: number;
  regexWins: number;
  ties: number;
  totalAICost: number;
  avgAITime: number;
  avgRegexTime: number;
  fieldAccuracy: {
    ai: Record<string, number>;
    regex: Record<string, number>;
  };
  comparisons: MethodComparison[];
  passesTarget: boolean; // True if AI >= 90% accuracy
}

// =============================================================================
// ACCURACY SCORING
// =============================================================================

function scoreExtraction(
  extracted: ExtractedRequirements,
  groundTruth: GroundTruthRequirements
): AccuracyScore[] {
  const scores: AccuracyScore[] = [];

  // Location scoring
  scores.push({
    field: 'location.state',
    correct: extracted.location.state === groundTruth.manualReview.location.state,
    predicted: extracted.location.state,
    actual: groundTruth.manualReview.location.state
  });

  if (groundTruth.manualReview.location.city) {
    const predictedCity = extracted.location.city?.toLowerCase() || '';
    const actualCity = groundTruth.manualReview.location.city.toLowerCase();
    scores.push({
      field: 'location.city',
      correct: predictedCity === actualCity,
      predicted: extracted.location.city,
      actual: groundTruth.manualReview.location.city
    });
  }

  scores.push({
    field: 'location.delineatedArea',
    correct: (!!extracted.location.delineatedArea) === groundTruth.manualReview.location.hasDelineatedArea,
    predicted: !!extracted.location.delineatedArea,
    actual: groundTruth.manualReview.location.hasDelineatedArea
  });

  // Space scoring
  if (groundTruth.manualReview.space.minSqFt) {
    const predicted = extracted.space.minSqFt || 0;
    const actual = groundTruth.manualReview.space.minSqFt;
    const withinTolerance = Math.abs(predicted - actual) / actual <= 0.1; // 10% tolerance

    scores.push({
      field: 'space.minSqFt',
      correct: withinTolerance,
      predicted,
      actual,
      partialCredit: withinTolerance ? 1 : Math.max(0, 1 - Math.abs(predicted - actual) / actual)
    });
  }

  if (groundTruth.manualReview.space.maxSqFt) {
    const predicted = extracted.space.maxSqFt || 0;
    const actual = groundTruth.manualReview.space.maxSqFt;
    const withinTolerance = Math.abs(predicted - actual) / actual <= 0.1;

    scores.push({
      field: 'space.maxSqFt',
      correct: withinTolerance,
      predicted,
      actual,
      partialCredit: withinTolerance ? 1 : Math.max(0, 1 - Math.abs(predicted - actual) / actual)
    });
  }

  if (groundTruth.manualReview.space.targetSqFt) {
    const predicted = extracted.space.targetSqFt || 0;
    const actual = groundTruth.manualReview.space.targetSqFt;
    const withinTolerance = Math.abs(predicted - actual) / actual <= 0.1;

    scores.push({
      field: 'space.targetSqFt',
      correct: withinTolerance,
      predicted,
      actual,
      partialCredit: withinTolerance ? 1 : Math.max(0, 1 - Math.abs(predicted - actual) / actual)
    });
  }

  if (groundTruth.manualReview.space.isRentable !== undefined) {
    scores.push({
      field: 'space.usableOrRentable',
      correct: (extracted.space.usableOrRentable === 'rentable') === groundTruth.manualReview.space.isRentable,
      predicted: extracted.space.usableOrRentable,
      actual: groundTruth.manualReview.space.isRentable ? 'rentable' : 'usable'
    });
  }

  if (groundTruth.manualReview.space.isContiguous !== undefined) {
    scores.push({
      field: 'space.contiguous',
      correct: extracted.space.contiguous === groundTruth.manualReview.space.isContiguous,
      predicted: extracted.space.contiguous,
      actual: groundTruth.manualReview.space.isContiguous
    });
  }

  // Building scoring
  if (groundTruth.manualReview.building.classes && groundTruth.manualReview.building.classes.length > 0) {
    const extractedClasses = extracted.building.buildingClass || [];
    const actualClasses = groundTruth.manualReview.building.classes;

    // Check if there's any overlap in acceptable classes
    const hasOverlap = extractedClasses.some(c => actualClasses.includes(c));

    scores.push({
      field: 'building.buildingClass',
      correct: hasOverlap,
      predicted: extractedClasses,
      actual: actualClasses,
      partialCredit: hasOverlap ? 1 : 0
    });
  }

  if (groundTruth.manualReview.building.requiresADA !== undefined) {
    scores.push({
      field: 'building.accessibility.adaCompliant',
      correct: extracted.building.accessibility.adaCompliant === groundTruth.manualReview.building.requiresADA,
      predicted: extracted.building.accessibility.adaCompliant,
      actual: groundTruth.manualReview.building.requiresADA
    });
  }

  if (groundTruth.manualReview.building.requiresLEED !== undefined) {
    const hasLEED = extracted.building.certifications.some(c => c.includes('LEED'));
    scores.push({
      field: 'building.certifications.LEED',
      correct: hasLEED === groundTruth.manualReview.building.requiresLEED,
      predicted: hasLEED,
      actual: groundTruth.manualReview.building.requiresLEED
    });
  }

  if (groundTruth.manualReview.building.requiresSCIF !== undefined) {
    scores.push({
      field: 'building.features.scifCapable',
      correct: extracted.building.features.scifCapable === groundTruth.manualReview.building.requiresSCIF,
      predicted: extracted.building.features.scifCapable,
      actual: groundTruth.manualReview.building.requiresSCIF
    });
  }

  // Timeline scoring
  if (groundTruth.manualReview.timeline.firmTermMonths) {
    const predicted = extracted.timeline.firmTermMonths || 0;
    const actual = groundTruth.manualReview.timeline.firmTermMonths;
    const withinTolerance = Math.abs(predicted - actual) / actual <= 0.05; // 5% tolerance

    scores.push({
      field: 'timeline.firmTermMonths',
      correct: withinTolerance,
      predicted,
      actual,
      partialCredit: withinTolerance ? 1 : 0
    });
  }

  return scores;
}

function calculateAccuracy(scores: AccuracyScore[]): number {
  if (scores.length === 0) return 0;

  const totalScore = scores.reduce((sum, score) => {
    if (score.partialCredit !== undefined) {
      return sum + score.partialCredit;
    }
    return sum + (score.correct ? 1 : 0);
  }, 0);

  return (totalScore / scores.length) * 100;
}

// =============================================================================
// A/B COMPARISON
// =============================================================================

export async function compareExtractionMethods(
  opportunity: SAMOpportunity,
  groundTruth: GroundTruthRequirements
): Promise<MethodComparison> {
  // Run both extraction methods in parallel
  const [aiResult, regexResult] = await Promise.all([
    extractRequirementsWithAI(opportunity).catch(err => {
      console.error('AI extraction failed:', err);
      return null;
    }),
    Promise.resolve(extractRequirementsWithRegex(opportunity))
  ]);

  // Score AI extraction
  const aiScores = aiResult ? scoreExtraction(aiResult.requirements, groundTruth) : [];
  const aiAccuracy = aiResult ? calculateAccuracy(aiScores) : 0;

  // Score regex extraction
  const regexScores = scoreExtraction(regexResult.requirements, groundTruth);
  const regexAccuracy = calculateAccuracy(regexScores);

  // Determine winner
  let winner: 'ai' | 'regex' | 'tie';
  const diff = Math.abs(aiAccuracy - regexAccuracy);

  if (diff < 5) { // Less than 5% difference = tie
    winner = 'tie';
  } else if (aiAccuracy > regexAccuracy) {
    winner = 'ai';
  } else {
    winner = 'regex';
  }

  return {
    noticeId: groundTruth.noticeId,
    aiAccuracy,
    regexAccuracy,
    aiScores,
    regexScores,
    aiTokensUsed: aiResult?.tokensUsed || 0,
    aiCost: aiResult?.cost || 0,
    aiTime: aiResult?.extractionTimeMs || 0,
    regexTime: regexResult.extractionTimeMs,
    winner
  };
}

// =============================================================================
// BATCH A/B TESTING
// =============================================================================

export async function runABTest(
  opportunities: SAMOpportunity[],
  groundTruths: GroundTruthRequirements[],
  options?: {
    onProgress?: (current: number, total: number) => void;
  }
): Promise<ABTestResults> {
  const comparisons: MethodComparison[] = [];
  let totalAICost = 0;
  let totalAITime = 0;
  let totalRegexTime = 0;

  // Create lookup map for ground truths
  const groundTruthMap = new Map(
    groundTruths.map(gt => [gt.noticeId, gt])
  );

  // Run comparisons
  for (let i = 0; i < opportunities.length; i++) {
    const opp = opportunities[i];
    const groundTruth = groundTruthMap.get(opp.noticeId || '');

    if (!groundTruth) {
      console.warn(`No ground truth for ${opp.noticeId}, skipping`);
      continue;
    }

    try {
      const comparison = await compareExtractionMethods(opp, groundTruth);
      comparisons.push(comparison);

      totalAICost += comparison.aiCost;
      totalAITime += comparison.aiTime;
      totalRegexTime += comparison.regexTime;

      options?.onProgress?.(i + 1, opportunities.length);
    } catch (error) {
      console.error(`Failed to compare ${opp.noticeId}:`, error);
    }

    // Rate limiting (1 request per second to avoid API throttling)
    if (i < opportunities.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  // Calculate aggregated metrics
  const aiAccuracies = comparisons.map(c => c.aiAccuracy);
  const regexAccuracies = comparisons.map(c => c.regexAccuracy);

  const aiOverallAccuracy = aiAccuracies.reduce((sum, acc) => sum + acc, 0) / aiAccuracies.length;
  const regexOverallAccuracy = regexAccuracies.reduce((sum, acc) => sum + acc, 0) / regexAccuracies.length;

  const aiWins = comparisons.filter(c => c.winner === 'ai').length;
  const regexWins = comparisons.filter(c => c.winner === 'regex').length;
  const ties = comparisons.filter(c => c.winner === 'tie').length;

  // Calculate field-level accuracy
  const aiFieldAccuracy: Record<string, number> = {};
  const regexFieldAccuracy: Record<string, number> = {};

  for (const comparison of comparisons) {
    for (const score of comparison.aiScores) {
      if (!aiFieldAccuracy[score.field]) {
        aiFieldAccuracy[score.field] = 0;
      }
      aiFieldAccuracy[score.field] += score.partialCredit !== undefined
        ? score.partialCredit
        : (score.correct ? 1 : 0);
    }

    for (const score of comparison.regexScores) {
      if (!regexFieldAccuracy[score.field]) {
        regexFieldAccuracy[score.field] = 0;
      }
      regexFieldAccuracy[score.field] += score.partialCredit !== undefined
        ? score.partialCredit
        : (score.correct ? 1 : 0);
    }
  }

  // Average field accuracies
  for (const field in aiFieldAccuracy) {
    aiFieldAccuracy[field] = (aiFieldAccuracy[field] / comparisons.length) * 100;
  }
  for (const field in regexFieldAccuracy) {
    regexFieldAccuracy[field] = (regexFieldAccuracy[field] / comparisons.length) * 100;
  }

  return {
    totalSamples: comparisons.length,
    aiOverallAccuracy,
    regexOverallAccuracy,
    aiWins,
    regexWins,
    ties,
    totalAICost,
    avgAITime: totalAITime / comparisons.length,
    avgRegexTime: totalRegexTime / comparisons.length,
    fieldAccuracy: {
      ai: aiFieldAccuracy,
      regex: regexFieldAccuracy
    },
    comparisons,
    passesTarget: aiOverallAccuracy >= 90
  };
}

// =============================================================================
// GROUND TRUTH HELPERS
// =============================================================================

/**
 * Helper to create ground truth from manual review
 */
export function createGroundTruth(data: {
  noticeId: string;
  reviewer: string;
  state: string;
  city?: string;
  hasDelineatedArea?: boolean;
  minSqFt?: number;
  maxSqFt?: number;
  targetSqFt?: number;
  isRentable?: boolean;
  isContiguous?: boolean;
  buildingClasses?: string[];
  requiresADA?: boolean;
  requiresLEED?: boolean;
  requiresSCIF?: boolean;
  occupancyDate?: string;
  firmTermMonths?: number;
  notes?: string;
}): GroundTruthRequirements {
  return {
    noticeId: data.noticeId,
    manualReview: {
      location: {
        state: data.state,
        city: data.city || null,
        hasDelineatedArea: data.hasDelineatedArea || false
      },
      space: {
        minSqFt: data.minSqFt || null,
        maxSqFt: data.maxSqFt || null,
        targetSqFt: data.targetSqFt || null,
        isRentable: data.isRentable,
        isContiguous: data.isContiguous
      },
      building: {
        classes: data.buildingClasses,
        requiresADA: data.requiresADA,
        requiresLEED: data.requiresLEED,
        requiresSCIF: data.requiresSCIF
      },
      timeline: {
        occupancyDate: data.occupancyDate || null,
        firmTermMonths: data.firmTermMonths || null
      }
    },
    reviewer: data.reviewer,
    reviewDate: new Date().toISOString(),
    notes: data.notes
  };
}

export default runABTest;
