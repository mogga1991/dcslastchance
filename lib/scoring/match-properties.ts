/**
 * Batch property-opportunity matching engine
 *
 * Matches all active broker listings against GSA lease opportunities,
 * calculates scores, and stores results in property_matches table.
 */

import { createClient } from '@supabase/supabase-js';
import { calculateMatchScore } from './calculate-match-score';
import { parseOpportunityRequirements, hasValidRequirements } from './parse-opportunity';
import type { SAMOpportunity } from '../sam-gov';
import { PerformanceTracker, type PerformanceMetrics } from './performance-tracker';

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
  earlyTerminated: number;
  earlyTerminationReasons: {
    STATE_MISMATCH: number;
    SPACE_TOO_SMALL: number;
    INVALID_REQUIREMENTS: number;
  };
  errors: string[];
  startTime: Date;
  endTime: Date;
  durationMs: number;
  performanceMetrics?: PerformanceMetrics;
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
 * Process all opportunity matches for a single property
 * 🚀 PERF-002: Extracted for parallel processing
 *
 * @returns Object containing matches and stats for this property
 */
async function processPropertyMatches(
  property: BrokerListing,
  opportunities: any[],
  minScore: number
): Promise<{
  matches: MatchResult[];
  stats: {
    processed: number;
    matched: number;
    skipped: number;
    earlyTerminated: number;
    earlyTerminationReasons: {
      STATE_MISMATCH: number;
      SPACE_TOO_SMALL: number;
      INVALID_REQUIREMENTS: number;
    };
    errors: string[];
  };
}> {
  const matches: MatchResult[] = [];
  const stats = {
    processed: 0,
    matched: 0,
    skipped: 0,
    earlyTerminated: 0,
    earlyTerminationReasons: {
      STATE_MISMATCH: 0,
      SPACE_TOO_SMALL: 0,
      INVALID_REQUIREMENTS: 0,
    },
    errors: [] as string[],
  };

  const propertyData = convertToPropertyData(property);

  for (const opportunity of opportunities) {
    try {
      stats.processed++;

      // Parse opportunity requirements
      const requirements = parseOpportunityRequirements(opportunity as SAMOpportunity);

      // 🚀 PERF-001: Early termination check #1 - Invalid requirements
      if (!hasValidRequirements(requirements)) {
        stats.skipped++;
        stats.earlyTerminated++;
        stats.earlyTerminationReasons.INVALID_REQUIREMENTS++;
        continue;
      }

      // 🚀 PERF-001: Early termination check #2 - State mismatch
      // This is the highest-value optimization: 80% of opportunities are in different states
      if (property.state !== requirements.location.state) {
        stats.skipped++;
        stats.earlyTerminated++;
        stats.earlyTerminationReasons.STATE_MISMATCH++;
        continue; // Skip expensive calculateMatchScore call
      }

      // 🚀 PERF-001: Early termination check #3 - Severe space shortage
      // Skip if property is >30% below minimum space requirement
      if (requirements.space.minSqFt && property.available_sf < requirements.space.minSqFt * 0.7) {
        stats.skipped++;
        stats.earlyTerminated++;
        stats.earlyTerminationReasons.SPACE_TOO_SMALL++;
        continue; // Skip expensive calculateMatchScore call
      }

      // Only calculate full match score if passed all early checks
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

  return { matches, stats };
}

/**
 * Splits array into chunks of specified size
 * 🚀 PERF-003: Helper for chunked batch processing
 */
function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

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
 * @param chunkSize - Number of properties to process in parallel per chunk (default: 50)
 */
export async function matchPropertiesWithOpportunities(
  supabaseUrl: string,
  supabaseServiceKey: string,
  minScore: number = 40,
  chunkSize: number = 50
): Promise<MatchStats> {
  const startTime = new Date();
  const stats: MatchStats = {
    processed: 0,
    matched: 0,
    skipped: 0,
    earlyTerminated: 0,
    earlyTerminationReasons: {
      STATE_MISMATCH: 0,
      SPACE_TOO_SMALL: 0,
      INVALID_REQUIREMENTS: 0,
    },
    errors: [],
    startTime,
    endTime: new Date(),
    durationMs: 0,
  };

  // 🚀 PERF-004: Initialize performance tracker
  const perfTracker = new PerformanceTracker();

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

    const totalChunks = Math.ceil(properties.length / chunkSize);

    console.log(`
🚀 Starting Property Matching (PERF-001 + PERF-002 + PERF-003)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Properties: ${properties.length}
   Opportunities: ${opportunities.length}
   Total Combinations: ${properties.length * opportunities.length}
   Min Score Threshold: ${minScore}
   Processing Mode: CHUNKED PARALLEL
   Chunk Size: ${chunkSize} properties
   Total Chunks: ${totalChunks}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `);

    // 3. 🚀 PERF-003: Split properties into chunks for memory-efficient parallel processing
    const propertyChunks = chunkArray(properties as BrokerListing[], chunkSize);
    const matches: MatchResult[] = [];

    // 4. Process each chunk sequentially (each chunk processes in parallel internally)
    for (let chunkIndex = 0; chunkIndex < propertyChunks.length; chunkIndex++) {
      const chunk = propertyChunks[chunkIndex];

      // 🚀 PERF-004: Track chunk performance
      const chunkData = perfTracker.startChunk(chunkIndex, chunk.length);

      console.log(`\n📦 Processing chunk ${chunkIndex + 1}/${propertyChunks.length} (${chunk.length} properties)...`);

      // Process properties in this chunk in parallel
      const chunkResults = await Promise.all(
        chunk.map(property => processPropertyMatches(property, opportunities, minScore))
      );

      // Aggregate results from this chunk
      for (const result of chunkResults) {
        matches.push(...result.matches);

        // Aggregate stats
        stats.processed += result.stats.processed;
        stats.matched += result.stats.matched;
        stats.skipped += result.stats.skipped;
        stats.earlyTerminated += result.stats.earlyTerminated;
        stats.earlyTerminationReasons.STATE_MISMATCH += result.stats.earlyTerminationReasons.STATE_MISMATCH;
        stats.earlyTerminationReasons.SPACE_TOO_SMALL += result.stats.earlyTerminationReasons.SPACE_TOO_SMALL;
        stats.earlyTerminationReasons.INVALID_REQUIREMENTS += result.stats.earlyTerminationReasons.INVALID_REQUIREMENTS;
        stats.errors.push(...result.stats.errors);
      }

      // 🚀 PERF-004: End chunk tracking
      perfTracker.endChunk(chunkData);

      const chunkMetrics = perfTracker.getMetrics(stats).chunkMetrics[chunkIndex];
      const chunkMatches = chunkResults.reduce((sum, r) => sum + r.matches.length, 0);

      console.log(`✅ Chunk ${chunkIndex + 1} complete in ${chunkMetrics.durationMs}ms (${chunkMetrics.avgMsPerProperty.toFixed(0)}ms per property)`);
      console.log(`   Matches found in chunk: ${chunkMatches}`);
      console.log(`   Total matches so far: ${matches.length}`);
    }

    // Calculate performance metrics
    const calculationsSkipped = stats.earlyTerminated;
    const calculationsPerformed = stats.processed - stats.earlyTerminated;
    const computationSaved = stats.processed > 0
      ? Math.round((calculationsSkipped / stats.processed) * 100)
      : 0;

    console.log(`
✅ Matching Complete
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Results:
   Total Processed: ${stats.processed}
   Matches Found: ${stats.matched}
   Skipped (Low Score): ${stats.skipped - stats.earlyTerminated}

Early Termination Statistics:
   Total Early Terminations: ${stats.earlyTerminated}
   - State Mismatch: ${stats.earlyTerminationReasons.STATE_MISMATCH}
   - Space Too Small: ${stats.earlyTerminationReasons.SPACE_TOO_SMALL}
   - Invalid Requirements: ${stats.earlyTerminationReasons.INVALID_REQUIREMENTS}

Performance Impact:
   Full Calculations Performed: ${calculationsPerformed}
   Calculations Skipped: ${calculationsSkipped}
   Computation Saved: ${computationSaved}%
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `);

    // 4. Upsert matches to database (batch insert with conflict handling)
    if (matches.length > 0) {
      console.log(`💾 Upserting ${matches.length} matches to database...`);

      const { error: upsertError } = await supabase
        .from('property_matches')
        .upsert(matches, { onConflict: 'property_id,opportunity_id' });

      if (upsertError) {
        stats.errors.push(`Error upserting matches: ${upsertError.message}`);
        console.log(`❌ Database Error: ${upsertError.message}`);
      } else {
        console.log(`✅ Successfully stored ${matches.length} matches`);
      }
    } else {
      console.log('⚠️ No matches met the minimum score threshold');
    }

    // 🚀 PERF-004: Calculate and log final performance metrics
    const performanceMetrics = perfTracker.getMetrics(stats);
    perfTracker.logMetrics(performanceMetrics, stats);

    // Add performance metrics to stats
    stats.performanceMetrics = performanceMetrics;

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
