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
  factors: MatchScoreResult['factors']
): { strengths: string[]; weaknesses: string[]; recommendations: string[] } {
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const recommendations: string[] = [];

  // Location
  if (factors.location.score >= 90) {
    strengths.push('Excellent location - within delineated area');
  } else if (factors.location.score < 60) {
    weaknesses.push('Location may be outside preferred area');
    recommendations.push(
      'Verify property is within delineated area boundaries'
    );
  }

  // Space
  if (factors.space.score >= 90) {
    strengths.push('Space requirements fully met');
  } else if (factors.space.details?.meetsMinimum === false) {
    weaknesses.push(
      `Space is ${Math.abs(factors.space.details?.variance || 0).toLocaleString()} SF short`
    );
    recommendations.push(
      'Consider if government might accept smaller space or if expansion is possible'
    );
  }

  // Building
  if (factors.building.score >= 80) {
    strengths.push('Building meets technical requirements');
  }
  if (factors.building.details?.featuresMissing && factors.building.details.featuresMissing.length > 0) {
    weaknesses.push(
      `Missing features: ${factors.building.details.featuresMissing.join(', ')}`
    );
    recommendations.push('Evaluate cost to add missing features');
  }
  if (factors.building.details?.certificationsMet && factors.building.details.certificationsMet.length > 0) {
    strengths.push(
      `Certifications: ${factors.building.details.certificationsMet.join(', ')}`
    );
  }

  // Timeline
  if (factors.timeline.score >= 90) {
    strengths.push('Available well before required occupancy date');
  } else if (factors.timeline.score < 60) {
    weaknesses.push('Availability timeline is tight or delayed');
    recommendations.push(
      'Communicate realistic timeline and any acceleration options'
    );
  }

  // Experience
  if (factors.experience.details?.hasGovExperience) {
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

  // NEW FORMAT: factors with name and details (for UI component)
  const factors = {
    location: {
      name: 'Location',
      score: location.score,
      weight: weights.location,
      weighted: location.score * weights.location,
      details: location.breakdown,
    },
    space: {
      name: 'Space',
      score: space.score,
      weight: weights.space,
      weighted: space.score * weights.space,
      details: space.breakdown,
    },
    building: {
      name: 'Building',
      score: building.score,
      weight: weights.building,
      weighted: building.score * weights.building,
      details: building.breakdown,
    },
    timeline: {
      name: 'Timeline',
      score: timeline.score,
      weight: weights.timeline,
      weighted: timeline.score * weights.timeline,
      details: timeline.breakdown,
    },
    experience: {
      name: 'Experience',
      score: experience.score,
      weight: weights.experience,
      weighted: experience.score * weights.experience,
      details: experience.breakdown,
    },
  };

  // Calculate overall
  const overallScore = Math.round(
    factors.location.weighted +
      factors.space.weighted +
      factors.building.weighted +
      factors.timeline.weighted +
      factors.experience.weighted
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
    generateInsights(factors);

  return {
    overallScore,
    grade,
    competitive,
    qualified,
    factors,  // NEW FORMAT: renamed from categoryScores
    strengths,
    weaknesses,
    recommendations,
    disqualifiers,
  };
}
