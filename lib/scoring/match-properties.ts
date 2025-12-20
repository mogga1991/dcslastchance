/**
 * Batch property-opportunity matching engine
 *
 * Matches all active broker listings against GSA lease opportunities,
 * calculates scores, and stores results in property_matches table.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { calculateMatchScore } from './calculate-match-score';
import { parseOpportunityRequirements, hasValidRequirements } from './parse-opportunity';
import type { SAMOpportunity } from '../sam-gov';

interface BrokerListing {
  id: string;
  user_id: string;

  // Location
  city: string;
  state: string;
  lat: number;
  lng: number;

  // Space
  total_sf: number;
  available_sf: number;
  usable_sf: number | null;
  min_divisible_sf: number | null;

  // Building
  building_class: 'A' | 'A+' | 'B' | 'C' | null;
  total_floors: number | null;
  ada_compliant: boolean | null;
  parking_spaces: number | null;
  parking_ratio: number | null;
  has_fiber: boolean | null;
  has_backup_power: boolean | null;
  has_loading_dock: boolean | null;
  has_24_7_security: boolean | null;
  leed_certified: boolean | null;
  energy_star: boolean | null;

  // Timeline
  available_date: string;
  min_lease_term: number | null;
  max_lease_term: number | null;

  // Status
  status: string;
}

interface MatchResult {
  property_id: string;
  opportunity_id: string;
  overall_score: number;
  grade: string;
  competitive: boolean;
  qualified: boolean;
  location_score: number;
  space_score: number;
  building_score: number;
  timeline_score: number;
  experience_score: number;
  score_breakdown: object;
}

export interface MatchStats {
  processed: number;
  matched: number;
  skipped: number;
  errors: string[];
  startTime: Date;
  endTime: Date;
  durationMs: number;
}

/**
 * Hardcoded broker experience profile for MVP
 * In v2, this will be fetched from user/company profiles
 */
const DEFAULT_BROKER_EXPERIENCE = {
  governmentLeaseExperience: false, // Conservative default
  governmentLeasesCount: 0,
  gsa_certified: false,
  yearsInBusiness: 5, // Assume mid-level
  totalPortfolioSqFt: 500000, // Moderate portfolio
  references: [],
  willingToBuildToSuit: true,
  willingToProvideImprovements: true,
};

/**
 * Converts broker_listings row to PropertyData format for scoring
 */
function convertToPropertyData(listing: BrokerListing) {
  return {
    location: {
      city: listing.city,
      state: listing.state,
      lat: listing.lat || 0,
      lng: listing.lng || 0,
    },
    space: {
      totalSqFt: listing.total_sf,
      availableSqFt: listing.available_sf,
      usableSqFt: listing.usable_sf || Math.round(listing.available_sf * 0.9),
      minDivisibleSqFt: listing.min_divisible_sf,
      isContiguous: true, // Assume contiguous unless specified
    },
    building: {
      buildingClass: listing.building_class || 'B',
      totalFloors: listing.total_floors || 1,
      availableFloors: [1], // Simplified for MVP
      adaCompliant: listing.ada_compliant !== false, // Default true for federal
      publicTransitAccess: false, // TODO: Geocode in v2
      parkingSpaces: listing.parking_spaces || 0,
      parkingRatio: listing.parking_ratio || 0,
      features: {
        fiber: listing.has_fiber || false,
        backupPower: listing.has_backup_power || false,
        loadingDock: listing.has_loading_dock || false,
        security24x7: listing.has_24_7_security || false,
        secureAccess: listing.has_24_7_security || false,
        scifCapable: false, // Rare feature
        dataCenter: false,
        cafeteria: false,
        fitnessCenter: false,
        conferenceCenter: false,
      },
      certifications: [
        ...(listing.leed_certified ? ['LEED Gold'] : []),
        ...(listing.energy_star ? ['Energy Star'] : []),
      ],
    },
    timeline: {
      availableDate: listing.available_date ? new Date(listing.available_date) : new Date(),
      minLeaseTermMonths: listing.min_lease_term || 12,
      maxLeaseTermMonths: listing.max_lease_term || 240,
      buildOutWeeksNeeded: 8, // Standard buildout time
    },
  };
}

/**
 * Main batch matching function
 *
 * @param supabaseUrl - Supabase project URL
 * @param supabaseServiceKey - Service role key (required for batch operations)
 * @param minScore - Minimum score threshold (default: 40)
 */
export async function matchPropertiesWithOpportunities(
  supabaseUrl: string,
  supabaseServiceKey: string,
  minScore: number = 40
): Promise<MatchStats> {
  const startTime = new Date();
  const stats: MatchStats = {
    processed: 0,
    matched: 0,
    skipped: 0,
    errors: [],
    startTime,
    endTime: new Date(),
    durationMs: 0,
  };

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // 1. Fetch all active broker listings
    const { data: properties, error: propsError } = await supabase
      .from('broker_listings')
      .select('*')
      .eq('status', 'active');

    if (propsError) {
      stats.errors.push(`Error fetching properties: ${propsError.message}`);
      return finishStats(stats);
    }

    if (!properties || properties.length === 0) {
      stats.errors.push('No active properties found');
      return finishStats(stats);
    }

    // 2. Fetch all active GSA opportunities
    const { data: opportunities, error: oppsError } = await supabase
      .from('opportunities')
      .select('*')
      .eq('active', 'Yes')
      .gte('response_deadline', new Date().toISOString());

    if (oppsError) {
      stats.errors.push(`Error fetching opportunities: ${oppsError.message}`);
      return finishStats(stats);
    }

    if (!opportunities || opportunities.length === 0) {
      stats.errors.push('No active opportunities found');
      return finishStats(stats);
    }

    console.log(`🔄 Matching ${properties.length} properties against ${opportunities.length} opportunities...`);

    // 3. Match each property against all opportunities
    const matches: MatchResult[] = [];

    for (const property of properties as BrokerListing[]) {
      const propertyData = convertToPropertyData(property);

      for (const opportunity of opportunities) {
        try {
          stats.processed++;

          // Parse opportunity requirements
          const requirements = parseOpportunityRequirements(opportunity as SAMOpportunity);

          // Skip if requirements are invalid
          if (!hasValidRequirements(requirements)) {
            stats.skipped++;
            continue;
          }

          // Calculate match score
          const scoreResult = calculateMatchScore(
            propertyData,
            DEFAULT_BROKER_EXPERIENCE,
            requirements
          );

          // Only store matches meeting minimum threshold
          if (scoreResult.overallScore >= minScore) {
            matches.push({
              property_id: property.id,
              opportunity_id: opportunity.id,
              overall_score: scoreResult.overallScore,
              grade: scoreResult.grade,
              competitive: scoreResult.competitive,
              qualified: scoreResult.qualified,
              location_score: scoreResult.factors.location.score,
              space_score: scoreResult.factors.space.score,
              building_score: scoreResult.factors.building.score,
              timeline_score: scoreResult.factors.timeline.score,
              experience_score: scoreResult.factors.experience.score,
              score_breakdown: scoreResult,
            });
            stats.matched++;
          } else {
            stats.skipped++;
          }
        } catch (error) {
          const err = error as Error;
          stats.errors.push(
            `Error matching property ${property.id} with opportunity ${opportunity.id}: ${err.message}`
          );
        }
      }
    }

    // 4. Upsert matches to database (batch insert with conflict handling)
    if (matches.length > 0) {
      const { error: upsertError } = await supabase
        .from('property_matches')
        .upsert(matches, { onConflict: 'property_id,opportunity_id' });

      if (upsertError) {
        stats.errors.push(`Error upserting matches: ${upsertError.message}`);
      } else {
        console.log(`✅ Successfully stored ${matches.length} matches`);
      }
    } else {
      console.log('⚠️ No matches met the minimum score threshold');
    }

    return finishStats(stats);
  } catch (error) {
    const err = error as Error;
    stats.errors.push(`Fatal error: ${err.message}`);
    return finishStats(stats);
  }
}

function finishStats(stats: MatchStats): MatchStats {
  stats.endTime = new Date();
  stats.durationMs = stats.endTime.getTime() - stats.startTime.getTime();
  return stats;
}
