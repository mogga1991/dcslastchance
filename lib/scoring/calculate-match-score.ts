import { MatchScoreResult } from './types';
import { scoreLocation } from './location-score';
import { scoreSpace } from './space-score';
import { scoreBuilding } from './building-score';
import { scoreTimeline } from './timeline-score';
import { scoreExperience } from './experience-score';
import type {
  LocationRequirement,
  SpaceRequirement,
  BuildingRequirement,
  TimelineRequirement,
  ExperienceProfile,
  PropertySpace,
  PropertyBuilding,
  PropertyTimeline,
} from './types';

interface PropertyLocation {
  city: string;
  state: string;
  lat: number;
  lng: number;
}

interface PropertyData {
  location: PropertyLocation;
  space: PropertySpace;
  building: PropertyBuilding;
  timeline: PropertyTimeline;
}

interface OpportunityRequirements {
  location: LocationRequirement;
  space: SpaceRequirement;
  building: BuildingRequirement;
  timeline: TimelineRequirement;
}

function generateInsights(
  scores: MatchScoreResult['categoryScores']
): { strengths: string[]; weaknesses: string[]; recommendations: string[] } {
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const recommendations: string[] = [];

  // Location
  if (scores.location.score >= 90) {
    strengths.push('Excellent location - within delineated area');
  } else if (scores.location.score < 60) {
    weaknesses.push('Location may be outside preferred area');
    recommendations.push(
      'Verify property is within delineated area boundaries'
    );
  }

  // Space
  if (scores.space.score >= 90) {
    strengths.push('Space requirements fully met');
  } else if (scores.space.breakdown?.meetsMinimum === false) {
    weaknesses.push(
      `Space is ${Math.abs(scores.space.breakdown?.variance || 0).toLocaleString()} SF short`
    );
    recommendations.push(
      'Consider if government might accept smaller space or if expansion is possible'
    );
  }

  // Building
  if (scores.building.score >= 80) {
    strengths.push('Building meets technical requirements');
  }
  if (scores.building.breakdown?.featuresMissing && scores.building.breakdown.featuresMissing.length > 0) {
    weaknesses.push(
      `Missing features: ${scores.building.breakdown.featuresMissing.join(', ')}`
    );
    recommendations.push('Evaluate cost to add missing features');
  }
  if (scores.building.breakdown?.certificationsMet && scores.building.breakdown.certificationsMet.length > 0) {
    strengths.push(
      `Certifications: ${scores.building.breakdown.certificationsMet.join(', ')}`
    );
  }

  // Timeline
  if (scores.timeline.score >= 90) {
    strengths.push('Available well before required occupancy date');
  } else if (scores.timeline.score < 60) {
    weaknesses.push('Availability timeline is tight or delayed');
    recommendations.push(
      'Communicate realistic timeline and any acceleration options'
    );
  }

  // Experience
  if (scores.experience.breakdown?.hasGovExperience) {
    strengths.push('Prior government lease experience');
  } else {
    recommendations.push(
      'Highlight any institutional or corporate lease experience, or consider partnering with experienced prime contractor'
    );
  }

  return { strengths, weaknesses, recommendations };
}

export function calculateMatchScore(
  property: PropertyData,
  brokerExperience: ExperienceProfile,
  requirements: OpportunityRequirements
): MatchScoreResult {
  // Calculate individual scores
  const location = scoreLocation(property.location, requirements.location);
  const space = scoreSpace(property.space, requirements.space);
  const building = scoreBuilding(property.building, requirements.building);
  const timeline = scoreTimeline(property.timeline, requirements.timeline);
  const experience = scoreExperience(brokerExperience);

  // Apply weights
  const weights = {
    location: 0.3,
    space: 0.25,
    building: 0.2,
    timeline: 0.15,
    experience: 0.1,
  };

  const categoryScores = {
    location: {
      score: location.score,
      weight: weights.location,
      weighted: location.score * weights.location,
      breakdown: location.breakdown,
    },
    space: {
      score: space.score,
      weight: weights.space,
      weighted: space.score * weights.space,
      breakdown: space.breakdown,
    },
    building: {
      score: building.score,
      weight: weights.building,
      weighted: building.score * weights.building,
      breakdown: building.breakdown,
    },
    timeline: {
      score: timeline.score,
      weight: weights.timeline,
      weighted: timeline.score * weights.timeline,
      breakdown: timeline.breakdown,
    },
    experience: {
      score: experience.score,
      weight: weights.experience,
      weighted: experience.score * weights.experience,
      breakdown: experience.breakdown,
    },
  };

  // Calculate overall
  const overallScore = Math.round(
    categoryScores.location.weighted +
      categoryScores.space.weighted +
      categoryScores.building.weighted +
      categoryScores.timeline.weighted +
      categoryScores.experience.weighted
  );

  // Determine grade
  const grade =
    overallScore >= 85
      ? 'A'
      : overallScore >= 70
        ? 'B'
        : overallScore >= 55
          ? 'C'
          : overallScore >= 40
            ? 'D'
            : 'F';

  // Check for disqualifiers
  const disqualifiers: string[] = [];

  if (location.score === 0) {
    disqualifiers.push('Property not in required state');
  }
  if (
    space.breakdown &&
    !space.breakdown.meetsMinimum &&
    space.breakdown.variancePercent &&
    space.breakdown.variancePercent < -20
  ) {
    disqualifiers.push(
      'Property significantly under minimum size requirement'
    );
  }
  if (building.breakdown && !building.breakdown.accessibilityMet) {
    disqualifiers.push('ADA accessibility requirement not met');
  }
  if (
    requirements.building.features?.scifCapable &&
    !property.building.features?.scifCapable
  ) {
    disqualifiers.push('SCIF capability required but not available');
  }

  const qualified = disqualifiers.length === 0;
  const competitive = qualified && overallScore >= 70;

  // Generate insights
  const { strengths, weaknesses, recommendations } =
    generateInsights(categoryScores);

  return {
    overallScore,
    grade,
    competitive,
    qualified,
    categoryScores,
    strengths,
    weaknesses,
    recommendations,
    disqualifiers,
  };
}
