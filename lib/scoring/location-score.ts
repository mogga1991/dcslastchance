import { LocationRequirement, LocationBreakdown } from './types';

interface PropertyLocation {
  city: string;
  state: string;
  lat: number;
  lng: number;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 3959; // Earth's radius in miles
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function scoreLocation(
  property: PropertyLocation,
  requirement: LocationRequirement
): { score: number; breakdown: LocationBreakdown } {
  let score = 0;
  const breakdown: LocationBreakdown = {
    stateMatch: false,
    cityMatch: false,
    withinDelineatedArea: false,
    distanceMiles: null,
    notes: [],
  };

  // State match (required - disqualifying if wrong state)
  if (property.state !== requirement.state) {
    return {
      score: 0,
      breakdown: {
        ...breakdown,
        notes: ['Property not in required state'],
      },
    };
  }
  breakdown.stateMatch = true;
  score += 40; // Base score for correct state

  // City match
  if (
    requirement.city &&
    property.city.toLowerCase() === requirement.city.toLowerCase()
  ) {
    breakdown.cityMatch = true;
    score += 30;
    breakdown.notes.push('Exact city match');
  }

  // Delineated area (distance-based)
  if (requirement.centralPoint && requirement.radiusMiles) {
    const distance = calculateDistance(
      property.lat,
      property.lng,
      requirement.centralPoint.lat,
      requirement.centralPoint.lng
    );
    breakdown.distanceMiles = distance;

    if (distance <= requirement.radiusMiles) {
      breakdown.withinDelineatedArea = true;
      // Closer = better score
      const distanceRatio = 1 - distance / requirement.radiusMiles;
      score += Math.round(30 * distanceRatio);
      breakdown.notes.push(
        `${distance.toFixed(1)} miles from center (within ${requirement.radiusMiles} mile radius)`
      );
    } else {
      // Outside delineated area - significant penalty
      score = Math.max(score - 20, 0);
      breakdown.notes.push(
        `${distance.toFixed(1)} miles from center (OUTSIDE ${requirement.radiusMiles} mile radius)`
      );
    }
  } else if (breakdown.cityMatch) {
    // No specific radius, but city matches
    score += 30;
  }

  return { score: Math.min(score, 100), breakdown };
}
