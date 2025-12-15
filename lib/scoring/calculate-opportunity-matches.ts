import type { SAMOpportunity } from '@/lib/sam-gov';
import type { BrokerListing } from '@/types/broker-listing';
import { calculateMatchScore } from './calculate-match-score';
import { extractOpportunityRequirements } from './extract-opportunity-requirements';
import type { MatchScoreResult, ExperienceProfile } from './types';

/**
 * Calculates match scores for all broker listings against a specific opportunity
 * Returns the best match score for the opportunity
 */
export function calculateOpportunityMatchScores(
  opportunity: SAMOpportunity,
  listings: BrokerListing[]
): {
  bestMatch: MatchScoreResult | null;
  matchingListings: Array<{ listing: BrokerListing; score: MatchScoreResult }>;
} {
  if (listings.length === 0) {
    return { bestMatch: null, matchingListings: [] };
  }

  // Extract requirements from opportunity
  const requirements = extractOpportunityRequirements(opportunity);

  // Calculate scores for each listing
  const matchingListings = listings
    .map((listing) => {
      // Convert broker listing to property data
      const propertyData = {
        location: {
          city: listing.city,
          state: listing.state,
          lat: listing.latitude,
          lng: listing.longitude,
        },
        space: {
          totalSF: listing.total_sf,
          availableSF: listing.available_sf,
          minDivisibleSF: listing.min_divisible_sf,
        },
        building: {
          class: 'A' as const, // Default to Class A
          yearBuilt: 2000, // Default
          features: {
            parking: listing.features.includes('parking'),
            ada: listing.features.includes('ada') || listing.features.includes('accessible'),
            security: listing.features.includes('security'),
            hvac: listing.features.includes('hvac'),
            elevator: listing.features.includes('elevator'),
            loading: listing.features.includes('loading_dock'),
            generator: listing.features.includes('generator'),
            scifCapable: listing.features.includes('scif'),
          },
          certifications: {
            leed: listing.features.includes('leed'),
            energyStar: listing.features.includes('energy_star'),
          },
        },
        timeline: {
          availableDate: new Date(listing.available_date),
        },
      };

      // Broker experience profile (simplified)
      const brokerExperience: ExperienceProfile = {
        totalDeals: 10, // Would come from broker profile
        govDeals: listing.gsa_eligible ? 5 : 0,
        avgDealSize: listing.total_sf,
        yearsExperience: 5,
        certifications: [],
      };

      const score = calculateMatchScore(
        propertyData,
        brokerExperience,
        requirements
      );

      return { listing, score };
    })
    .sort((a, b) => b.score.overallScore - a.score.overallScore);

  return {
    bestMatch: matchingListings.length > 0 ? matchingListings[0].score : null,
    matchingListings,
  };
}

/**
 * Calculates match scores for multiple opportunities against broker listings
 * Returns a map of opportunity ID to best match score
 */
export function calculateAllOpportunityMatches(
  opportunities: SAMOpportunity[],
  listings: BrokerListing[]
): Map<string, MatchScoreResult> {
  const matchMap = new Map<string, MatchScoreResult>();

  for (const opp of opportunities) {
    const { bestMatch } = calculateOpportunityMatchScores(opp, listings);
    if (bestMatch) {
      matchMap.set(opp.noticeId, bestMatch);
    }
  }

  return matchMap;
}
