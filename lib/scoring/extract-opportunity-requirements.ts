import type { SAMOpportunity } from '@/lib/sam-gov';
import type {
  LocationRequirement,
  SpaceRequirement,
  BuildingRequirement,
  TimelineRequirement,
} from './types';

interface OpportunityRequirements {
  location: LocationRequirement;
  space: SpaceRequirement;
  building: BuildingRequirement;
  timeline: TimelineRequirement;
}

/**
 * Extracts requirements from a GSA lease opportunity
 * Parses the description to find RSF, location, timeline, and building requirements
 */
export function extractOpportunityRequirements(
  opportunity: SAMOpportunity
): OpportunityRequirements {
  const description = opportunity.description || '';
  const title = opportunity.title || '';
  const fullText = `${title} ${description}`.toLowerCase();

  // Extract space requirements (RSF)
  const space = extractSpaceRequirements(fullText);

  // Extract location requirements
  const location = extractLocationRequirements(opportunity);

  // Extract building requirements
  const building = extractBuildingRequirements(fullText);

  // Extract timeline requirements
  const timeline = extractTimelineRequirements(opportunity, fullText);

  return {
    location,
    space,
    building,
    timeline,
  };
}

function extractSpaceRequirements(text: string): SpaceRequirement {
  // Look for patterns like "10,000 RSF", "10000 SF", "10,000 square feet"
  const rsfPatterns = [
    /(\d{1,3}(?:,\d{3})*)\s*(?:rsf|sf|square\s+feet|sq\s+ft)/gi,
    /rentable\s+square\s+feet[:\s]+(\d{1,3}(?:,\d{3})*)/gi,
    /minimum[:\s]+(\d{1,3}(?:,\d{3})*)\s*(?:rsf|sf)/gi,
  ];

  let minRSF = 0;
  let maxRSF = 0;

  for (const pattern of rsfPatterns) {
    const matches = Array.from(text.matchAll(pattern));
    const numbers = matches.map((m) => parseInt(m[1].replace(/,/g, '')));

    if (numbers.length > 0) {
      // If multiple numbers, assume min/max range
      minRSF = Math.min(...numbers);
      maxRSF = Math.max(...numbers);
      break;
    }
  }

  // If no range found, set defaults based on typical GSA lease sizes
  if (minRSF === 0) {
    minRSF = 5000; // Default minimum
    maxRSF = 50000; // Default maximum
  } else if (maxRSF === minRSF) {
    // If only one number, allow 10% variance
    maxRSF = Math.round(minRSF * 1.1);
    minRSF = Math.round(minRSF * 0.9);
  }

  return {
    minimumSF: minRSF,
    maximumSF: maxRSF,
    preferredSF: Math.round((minRSF + maxRSF) / 2),
  };
}

function extractLocationRequirements(
  opportunity: SAMOpportunity
): LocationRequirement {
  const pop = opportunity.placeOfPerformance;
  const city = pop?.city?.name || '';
  const state = pop?.state?.code || '';

  // Extract delineated area coordinates if available in description
  // For now, we'll use the city/state as the center point
  // In a production system, you'd parse the actual delineated area from the description

  return {
    state,
    city,
    delineatedArea: {
      type: 'circle',
      center: { lat: 0, lng: 0 }, // Would need geocoding
      radiusMiles: 10, // Default 10-mile radius
    },
  };
}

function extractBuildingRequirements(text: string): BuildingRequirement {
  // Check for common GSA requirements
  const features = {
    parking: /parking/i.test(text),
    ada: /\bada\b|accessibility|accessible/i.test(text),
    security: /security|controlled\s+access|card\s+access/i.test(text),
    hvac: /hvac|heating|cooling|air\s+conditioning/i.test(text),
    elevator: /elevator|lift/i.test(text),
    loading: /loading\s+dock|loading\s+area/i.test(text),
    generator: /generator|backup\s+power|emergency\s+power/i.test(text),
    scifCapable: /scif|sensitive\s+compartmented/i.test(text),
  };

  const certifications = {
    leed: /leed/i.test(text),
    energyStar: /energy\s+star/i.test(text),
  };

  return {
    class: 'A', // Default to Class A for GSA
    yearBuilt: {
      minimum: 1980, // Default minimum year
    },
    features,
    certifications,
  };
}

function extractTimelineRequirements(
  opportunity: SAMOpportunity,
  text: string
): TimelineRequirement {
  // Try to extract occupancy date from description
  let occupancyDate: Date | null = null;

  // Look for patterns like "occupancy by MM/DD/YYYY" or "move-in date: MM/DD/YYYY"
  const datePatterns = [
    /occupancy\s+(?:by|on|date)[:\s]+(\d{1,2}\/\d{1,2}\/\d{2,4})/i,
    /move-?in\s+date[:\s]+(\d{1,2}\/\d{1,2}\/\d{2,4})/i,
    /available[:\s]+(\d{1,2}\/\d{1,2}\/\d{2,4})/i,
  ];

  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (match) {
      occupancyDate = new Date(match[1]);
      break;
    }
  }

  // If no date found, estimate based on response deadline (typically 6-12 months out)
  if (!occupancyDate && opportunity.responseDeadLine) {
    occupancyDate = new Date(opportunity.responseDeadLine);
    occupancyDate.setMonth(occupancyDate.getMonth() + 9); // Add 9 months
  }

  return {
    occupancyDate: occupancyDate || new Date(),
    leaseTerm: {
      years: 10, // Default GSA lease term
      monthsOption: 60, // 5-year option period
    },
  };
}
