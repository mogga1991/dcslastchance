/**
 * Parses GSA lease opportunities to extract property requirements
 *
 * Uses regex + structured SAM.gov fields for MVP.
 * Designed for easy AI extraction swap in v2.
 */

import type { SAMOpportunity } from '../sam-gov';
import type {
  LocationRequirement,
  SpaceRequirement,
  BuildingRequirement,
  TimelineRequirement,
} from './types';

export interface OpportunityRequirements {
  location: LocationRequirement;
  space: SpaceRequirement;
  building: BuildingRequirement;
  timeline: TimelineRequirement;

  // AI-extracted fields (null for MVP, populated in v2)
  specialRequirements?: string[] | null;
  certifications?: string[] | null;
  parkingRequired?: number | null;
}

/**
 * Extracts square footage from description text
 * Matches patterns like: "25,000 SF", "40000 sq ft", "75,000 RSF"
 */
function extractSquareFootage(description: string): { min: number; max: number; target: number | null } | null {
  if (!description) return null;

  // Pattern: number with optional commas + space + (SF|sq ft|RSF|square feet)
  // Also handles "approximately X square feet" pattern
  const sfPatterns = [
    /(\d{1,3}(?:,\d{3})*)\s*(?:to|[-–])\s*(\d{1,3}(?:,\d{3})*)\s*(?:sq\.?\s*ft|SF|RSF|square feet)/i,
    /(?:approximately|about|roughly)?\s*(\d{1,3}(?:,\d{3})*)\s*(?:rentable|usable)?\s*(?:sq\.?\s*ft|square feet|SF|RSF)/gi,
    /(\d{1,3}(?:,\d{3})*)\s*(?:sq\.?\s*ft|SF|RSF|square feet)/gi,
  ];

  // Try range pattern first (e.g., "25,000 to 50,000 SF")
  const rangeMatch = description.match(sfPatterns[0]);
  if (rangeMatch) {
    const min = parseInt(rangeMatch[1].replace(/,/g, ''));
    const max = parseInt(rangeMatch[2].replace(/,/g, ''));
    return { min, max, target: Math.round((min + max) / 2) };
  }

  // Try single value patterns (try pattern [1] first for "approximately" matches)
  const values: number[] = [];

  for (let i = 1; i < sfPatterns.length; i++) {
    const matches = description.matchAll(sfPatterns[i]);
    for (const match of matches) {
      const value = parseInt(match[1].replace(/,/g, ''));
      if (value > 1000 && value < 1000000) { // Sanity check (1K - 1M SF)
        values.push(value);
      }
    }
    if (values.length > 0) break; // Stop after first successful pattern
  }

  if (values.length === 0) return null;

  // If multiple values found, use first as target, add ±20% buffer
  const target = values[0];
  return {
    min: Math.round(target * 0.8),
    max: Math.round(target * 1.2),
    target,
  };
}

/**
 * Extracts building class from description
 * Matches: "Class A", "Class B", "Class C"
 */
function extractBuildingClass(description: string): ('A' | 'A+' | 'B' | 'C')[] | null {
  if (!description) return null;

  const classPattern = /class\s+([ABC][\+]?)/gi;
  const matches = description.matchAll(classPattern);
  const classes = new Set<'A' | 'A+' | 'B' | 'C'>();

  for (const match of matches) {
    const cls = match[1].toUpperCase();
    if (cls === 'A+' || cls === 'A' || cls === 'B' || cls === 'C') {
      classes.add(cls as 'A' | 'A+' | 'B' | 'C');
    }
  }

  if (classes.size === 0) {
    // Default to Class A and B for federal leases
    return ['A', 'B'];
  }

  return Array.from(classes);
}

/**
 * Checks if description mentions LEED certification
 */
function hasLEEDRequirement(description: string): boolean {
  if (!description) return false;
  return /LEED/i.test(description);
}

/**
 * Checks if description mentions Energy Star
 */
function hasEnergyStarRequirement(description: string): boolean {
  if (!description) return false;
  return /Energy Star/i.test(description);
}

/**
 * Main parser: Converts SAM.gov opportunity to property requirements
 */
export function parseOpportunityRequirements(
  opportunity: SAMOpportunity
): OpportunityRequirements {
  const description = opportunity.description || '';

  // LOCATION: Use structured placeOfPerformance fields
  // Handle both SAM.gov API format (nested) and DB format (flat fields with pop_ prefix)
  const oppAny = opportunity as any;
  const location: LocationRequirement = {
    state: opportunity.placeOfPerformance?.state?.code ||
           oppAny.pop_state_code ||
           opportunity.officeAddress?.state ||
           oppAny.office_state ||
           '',
    city: opportunity.placeOfPerformance?.city?.name ||
          oppAny.pop_city_name ||
          opportunity.officeAddress?.city ||
          oppAny.office_city ||
          null,
    zip: opportunity.placeOfPerformance?.zip ||
         oppAny.pop_zip ||
         opportunity.officeAddress?.zipcode ||
         oppAny.office_zipcode ||
         null,
    delineatedArea: null, // TODO: Extract from description in v2 with AI
    radiusMiles: null, // TODO: Default to 10 miles for city-based requirements?
    centralPoint: null, // TODO: Geocode city/state in v2
  };

  // SPACE: Extract from description using regex
  const sfData = extractSquareFootage(description);
  const space: SpaceRequirement = {
    minSqFt: sfData?.min || null,
    maxSqFt: sfData?.max || null,
    targetSqFt: sfData?.target || null,
    usableOrRentable: description.match(/\bRSF\b/i) ? 'rentable' : 'usable',
    contiguous: /contiguous/i.test(description),
    divisible: /divisible/i.test(description),
  };

  // BUILDING: Extract class and basic requirements
  const buildingClass = extractBuildingClass(description);
  const building: BuildingRequirement = {
    buildingClass: buildingClass || ['A', 'B'],
    minFloors: null,
    maxFloors: null,
    preferredFloor: null,
    accessibility: {
      adaCompliant: true, // Federal leases require ADA
      publicTransit: /transit|metro|subway/i.test(description),
      parkingRequired: /parking/i.test(description),
    },
    features: {
      fiber: /fiber|high-speed internet/i.test(description),
      backupPower: /backup power|generator/i.test(description),
      loadingDock: /loading dock/i.test(description),
      security24x7: /security|24.?7/i.test(description),
      secureAccess: /secure access|access control/i.test(description),
      scifCapable: /SCIF/i.test(description),
      dataCenter: /data center/i.test(description),
      cafeteria: /cafeteria|food service/i.test(description),
      fitnessCenter: /fitness|gym/i.test(description),
      conferenceCenter: /conference|meeting space/i.test(description),
    },
    certifications: [
      ...(hasLEEDRequirement(description) ? ['LEED Gold', 'LEED Platinum'] : []),
      ...(hasEnergyStarRequirement(description) ? ['Energy Star'] : []),
    ],
  };

  // TIMELINE: Use structured response deadline
  const timeline: TimelineRequirement = {
    occupancyDate: new Date(opportunity.responseDeadLine), // Assume occupancy ~6 months after deadline
    firmTermMonths: 120, // Standard GSA lease: 10 years firm
    totalTermMonths: 240, // 20 years total (10 firm + 10 option)
    responseDeadline: new Date(opportunity.responseDeadLine),
  };

  // Adjust occupancy date to 6 months after response deadline
  timeline.occupancyDate.setMonth(timeline.occupancyDate.getMonth() + 6);

  return {
    location,
    space,
    building,
    timeline,

    // Placeholders for AI extraction (v2)
    specialRequirements: null,
    certifications: null,
    parkingRequired: null,
  };
}

/**
 * Validates if extracted requirements are sufficient for matching
 */
export function hasValidRequirements(requirements: OpportunityRequirements): boolean {
  // Must have at minimum: state and some space requirement
  return (
    !!requirements.location.state &&
    (requirements.space.minSqFt !== null ||
     requirements.space.maxSqFt !== null ||
     requirements.space.targetSqFt !== null)
  );
}
