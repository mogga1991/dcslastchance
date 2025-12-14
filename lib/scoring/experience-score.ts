import { ExperienceProfile, ExperienceBreakdown } from './types';

export function scoreExperience(
  profile: ExperienceProfile
): { score: number; breakdown: ExperienceBreakdown } {
  let score = 30; // Base score for any broker
  const breakdown: ExperienceBreakdown = {
    hasGovExperience: false,
    gsaCertified: false,
    referencesCount: 0,
    flexibility: [],
    notes: [],
  };

  // Government lease experience
  if (profile.governmentLeaseExperience) {
    breakdown.hasGovExperience = true;
    score += 25;
    breakdown.notes.push('Prior government lease experience');

    // Bonus for multiple gov leases
    if (profile.governmentLeasesCount >= 5) {
      score += 15;
      breakdown.notes.push('5+ government leases completed');
    } else if (profile.governmentLeasesCount >= 2) {
      score += 10;
      breakdown.notes.push(
        `${profile.governmentLeasesCount} government leases completed`
      );
    }
  }

  // GSA certified
  if (profile.gsa_certified) {
    breakdown.gsaCertified = true;
    score += 10;
    breakdown.notes.push('GSA certified broker');
  }

  // References
  breakdown.referencesCount = profile.references.length;
  if (profile.references.length >= 3) {
    score += 10;
  } else if (profile.references.length >= 1) {
    score += 5;
  }

  // Flexibility bonuses
  if (profile.willingToBuildToSuit) {
    score += 5;
    breakdown.flexibility.push('Build-to-suit available');
  }
  if (profile.willingToProvideImprovements) {
    score += 5;
    breakdown.flexibility.push('TI allowance available');
  }

  return { score: Math.min(100, score), breakdown };
}
