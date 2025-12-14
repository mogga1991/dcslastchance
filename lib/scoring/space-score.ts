import { SpaceRequirement, PropertySpace, SpaceBreakdown } from './types';

export function scoreSpace(
  property: PropertySpace,
  requirement: SpaceRequirement
): { score: number; breakdown: SpaceBreakdown } {
  const breakdown: SpaceBreakdown = {
    meetsMinimum: false,
    meetsMaximum: true,
    meetsContiguous: true,
    availableSqFt: property.availableSqFt,
    requiredSqFt: requirement.minSqFt,
    variance: null,
    variancePercent: null,
    notes: [],
  };

  const available = property.availableSqFt || property.totalSqFt;
  const minReq = requirement.minSqFt || 0;
  const maxReq = requirement.maxSqFt || Infinity;

  // Check contiguous requirement
  if (requirement.contiguous && !property.isContiguous) {
    breakdown.meetsContiguous = false;
    breakdown.notes.push('Space is not contiguous as required');
    return { score: 30, breakdown }; // Major penalty
  }

  // Check minimum
  if (available >= minReq) {
    breakdown.meetsMinimum = true;
  } else {
    breakdown.meetsMinimum = false;
    breakdown.variance = available - minReq;
    breakdown.variancePercent = ((available - minReq) / minReq) * 100;
    breakdown.notes.push(
      `${Math.abs(breakdown.variance).toLocaleString()} SF short of minimum`
    );
  }

  // Check maximum
  if (available <= maxReq) {
    breakdown.meetsMaximum = true;
  } else {
    breakdown.meetsMaximum = false;
    breakdown.notes.push(
      `${(available - maxReq).toLocaleString()} SF over maximum`
    );
  }

  // Calculate score
  let score = 0;

  if (breakdown.meetsMinimum && breakdown.meetsMaximum) {
    // Perfect fit
    score = 100;

    // Bonus for being close to target
    if (requirement.targetSqFt) {
      const targetVariance =
        Math.abs(available - requirement.targetSqFt) / requirement.targetSqFt;
      if (targetVariance <= 0.05) {
        breakdown.notes.push('Within 5% of target size');
      } else if (targetVariance <= 0.15) {
        score -= 5;
      } else if (targetVariance <= 0.25) {
        score -= 10;
      }
    }
  } else if (breakdown.meetsMinimum && !breakdown.meetsMaximum) {
    // Over maximum - can sometimes work with divisibility
    if (property.minDivisibleSqFt && property.minDivisibleSqFt <= maxReq) {
      score = 80;
      breakdown.notes.push('Can subdivide to meet maximum');
    } else {
      score = 50;
      breakdown.notes.push('Exceeds maximum, not easily divisible');
    }
  } else {
    // Under minimum
    const shortfallPercent = Math.abs(breakdown.variancePercent || 0);

    if (shortfallPercent <= 5) {
      score = 80;
      breakdown.notes.push('Within 5% of minimum - may qualify');
    } else if (shortfallPercent <= 10) {
      score = 60;
      breakdown.notes.push('Within 10% of minimum - negotiate');
    } else if (shortfallPercent <= 20) {
      score = 40;
    } else {
      score = 20;
      breakdown.notes.push('Significantly under minimum requirement');
    }
  }

  return { score, breakdown };
}
