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
          totalSqFt: listing.total_sf,
          availableSqFt: listing.available_sf,
          usableSqFt: null,
          minDivisibleSqFt: listing.min_divisible_sf ?? null,
          isContiguous: true,
        },
        building: {
          buildingClass: 'A' as const,
          totalFloors: 5,
          availableFloors: [1],
          adaCompliant: listing.features?.includes('ada') || listing.features?.includes('accessible') || false,
          publicTransitAccess: listing.features?.includes('transit') || false,
          parkingSpaces: 100,
          parkingRatio: 4.0,
          features: {
            fiber: listing.features?.includes('fiber') || false,
            backupPower: listing.features?.includes('generator') || listing.features?.includes('backup_power') || false,
            loadingDock: listing.features?.includes('loading_dock') || false,
            security24x7: listing.features?.includes('security') || false,
            secureAccess: listing.features?.includes('secure_access') || false,
            scifCapable: listing.features?.includes('scif') || false,
            dataCenter: listing.features?.includes('data_center') || false,
            cafeteria: listing.features?.includes('cafeteria') || false,
            fitnessCenter: listing.features?.includes('fitness') || false,
            conferenceCenter: listing.features?.includes('conference') || false,
          },
          certifications: [
            ...(listing.features?.includes('leed') ? ['LEED'] : []),
            ...(listing.features?.includes('energy_star') ? ['Energy Star'] : []),
          ],
        },
        timeline: {
          availableDate: new Date(listing.available_date),
          minLeaseTermMonths: null,
          maxLeaseTermMonths: null,
          buildOutWeeksNeeded: 0,
        },
      };

      // Broker experience profile (simplified)
      const brokerExperience: ExperienceProfile = {
        governmentLeaseExperience: listing.gsa_eligible,
        governmentLeasesCount: listing.gsa_eligible ? 5 : 0,
        gsa_certified: listing.gsa_eligible,
        yearsInBusiness: 5,
        totalPortfolioSqFt: listing.total_sf,
        references: [],
        willingToBuildToSuit: false,
        willingToProvideImprovements: false,
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
