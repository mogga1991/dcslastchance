/**
 * FedSpace Integration Layer
 *
 * Bridges existing SAM.gov and IOLP code with patent-pending algorithms
 * Provides data synchronization and backward compatibility
 */

import { iolpAdapter, type IOLPFeatureCollection } from './iolp';
import {
  calculateFederalNeighborhoodScore,
  calculatePropertyOpportunityMatch,
  FederalPropertyRTree,
  getSpatialIndex,
} from './fedspace';
import type {
  FederalProperty,
  PropertyData,
  OpportunityRequirements,
  BrokerExperience,
} from './fedspace/types';
import { createClient } from './supabase/server';

/**
 * Sync IOLP data to federal_buildings table
 * Should be run periodically (e.g., daily via cron job)
 */
export async function syncIOLPDataToDatabase(): Promise<{
  success: boolean;
  buildingsProcessed: number;
  leasesProcessed: number;
  errors: string[];
}> {
  const errors: string[] = [];
  let buildingsProcessed = 0;
  let leasesProcessed = 0;

  try {
    const supabase = await createClient();

    // Fetch all buildings (paginated for large datasets)
    const buildings = await fetchAllIOLPBuildings();

    // Fetch all leases
    const leases = await fetchAllIOLPLeases();

    // Process buildings
    for (const feature of buildings.features) {
      try {
        const { attributes } = feature;

        if (!attributes.latitude || !attributes.longitude) {
          continue; // Skip features without coordinates
        }

        await supabase.from('federal_buildings').upsert({
          source_type: 'iolp_building',
          source_id: `building_${attributes.OBJECTID}`,
          latitude: attributes.latitude,
          longitude: attributes.longitude,
          address: attributes.address,
          city: attributes.city,
          state: attributes.state,
          zipcode: attributes.zipcode,
          rsf: attributes.building_rsf || 0,
          vacant: attributes.vacant_rsf ? attributes.vacant_rsf > 0 : false,
          vacant_rsf: attributes.vacant_rsf || 0,
          property_type: attributes.owned_or_leased_indicator === 'F' ? 'owned' : 'leased',
          construction_year: attributes.year_constructed,
          agency: attributes.agency_abbr,
          source_data: attributes,
          last_synced_at: new Date().toISOString(),
        }, {
          onConflict: 'source_type,source_id',
        });

        buildingsProcessed++;
      } catch (error) {
        errors.push(`Error processing building ${feature.attributes.OBJECTID}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Process leases
    for (const feature of leases.features) {
      try {
        const { attributes } = feature;

        if (!attributes.latitude || !attributes.longitude) {
          continue;
        }

        await supabase.from('federal_buildings').upsert({
          source_type: 'iolp_lease',
          source_id: `lease_${attributes.OBJECTID}`,
          latitude: attributes.latitude,
          longitude: attributes.longitude,
          address: attributes.address,
          city: attributes.city,
          state: attributes.state,
          zipcode: attributes.zipcode,
          rsf: attributes.building_rsf || 0,
          property_type: 'leased',
          lease_expiration_date: attributes.lease_expiration_date,
          agency: attributes.agency_abbr,
          source_data: attributes,
          last_synced_at: new Date().toISOString(),
        }, {
          onConflict: 'source_type,source_id',
        });

        leasesProcessed++;
      } catch (error) {
        errors.push(`Error processing lease ${feature.attributes.OBJECTID}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return {
      success: errors.length === 0,
      buildingsProcessed,
      leasesProcessed,
      errors,
    };
  } catch (error) {
    errors.push(`Fatal error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return {
      success: false,
      buildingsProcessed,
      leasesProcessed,
      errors,
    };
  }
}

/**
 * Fetch all IOLP buildings (handles pagination)
 */
async function fetchAllIOLPBuildings(): Promise<IOLPFeatureCollection> {
  // For now, fetch a large batch
  // In production, implement proper pagination
  const queryString = [
    'where=1=1',
    'outFields=*',
    'returnGeometry=true',
    'resultRecordCount=5000',
    'f=json'
  ].join('&');

  return iolpAdapter.queryBuildings(queryString);
}

/**
 * Fetch all IOLP leases (handles pagination)
 */
async function fetchAllIOLPLeases(): Promise<IOLPFeatureCollection> {
  const queryString = [
    'where=1=1',
    'outFields=*',
    'returnGeometry=true',
    'resultRecordCount=5000',
    'f=json'
  ].join('&');

  return iolpAdapter.queryLeases(queryString);
}

/**
 * Build spatial index from database
 * Used for O(log n) federal score calculations
 */
export async function buildSpatialIndexFromDatabase(): Promise<FederalPropertyRTree> {
  const supabase = await createClient();

  const { data: buildings, error } = await supabase
    .from('federal_buildings')
    .select('*')
    .not('latitude', 'is', null)
    .not('longitude', 'is', null);

  if (error || !buildings) {
    throw new Error('Failed to fetch federal buildings from database');
  }

  const properties: FederalProperty[] = buildings.map(building => ({
    id: building.id,
    latitude: parseFloat(building.latitude),
    longitude: parseFloat(building.longitude),
    rsf: building.rsf || 0,
    type: building.property_type === 'owned' ? 'owned' : 'leased',
    vacant: building.vacant || false,
    vacantRSF: building.vacant_rsf || 0,
    leaseExpiration: building.lease_expiration_date ? new Date(building.lease_expiration_date) : undefined,
    constructionYear: building.construction_year,
    agency: building.agency,
    city: building.city,
    state: building.state,
    zipcode: building.zipcode,
  }));

  const index = new FederalPropertyRTree();
  index.bulkLoad(properties);

  return index;
}

/**
 * Enhanced federal score using patent-pending algorithm
 * Falls back to existing IOLP algorithm if database not synced
 */
export async function calculateEnhancedFederalScore(
  latitude: number,
  longitude: number,
  radiusMiles: number = 5
): Promise<any> {
  try {
    // Try to use patent-pending algorithm with spatial index
    const index = await buildSpatialIndexFromDatabase();
    return await calculateFederalNeighborhoodScore(latitude, longitude, radiusMiles, index);
  } catch (error) {
    console.warn('Falling back to existing IOLP algorithm:', error);
    // Fallback to existing IOLP algorithm
    return await iolpAdapter.calculateFederalNeighborhoodScore(latitude, longitude, radiusMiles);
  }
}

/**
 * Extract opportunity requirements from SAM.gov opportunity data
 */
export function extractOpportunityRequirements(
  opportunity: any
): OpportunityRequirements {
  // Handle both raw SAM.gov data and database records
  const fullData = opportunity.full_data || opportunity;
  const description = opportunity.description || fullData.description || '';

  // Extract requirements from description using pattern matching
  const requirements = parseRequirementsFromDescription(description);

  return {
    noticeId: opportunity.notice_id || opportunity.noticeId || '',
    title: opportunity.title || '',
    agency: opportunity.department || fullData.department || '',
    state: opportunity.pop_state_code || fullData.placeOfPerformance?.state?.code || '',
    city: opportunity.pop_city_name || fullData.placeOfPerformance?.city?.name,
    minimumRSF: requirements.minimumRSF || 10000,
    maximumRSF: requirements.maximumRSF,
    contiguousRequired: requirements.contiguousRequired || false,
    setAside: opportunity.type_of_set_aside || fullData.typeOfSetAside,
    adaRequired: requirements.adaRequired !== false, // Default true
    buildingClass: requirements.buildingClass,
    clearanceRequired: requirements.clearanceRequired,
    scifRequired: requirements.scifRequired || false,
    fiber: requirements.fiber || false,
    backupPower: requirements.backupPower || false,
    parkingRatio: requirements.parkingRatio,
    occupancyDate: opportunity.response_deadline ? new Date(opportunity.response_deadline) : undefined,
    leaseTermYears: requirements.leaseTermYears,
    responseDeadline: opportunity.response_deadline ? new Date(opportunity.response_deadline) : undefined,
    naicsCode: opportunity.naics_code,
    delineatedArea: requirements.delineatedArea,
  };
}

/**
 * Parse requirements from opportunity description
 * Uses regex patterns to extract common requirements
 */
function parseRequirementsFromDescription(description: string): any {
  const requirements: any = {};

  // Extract square footage requirements
  const sfRegex = /(\d{1,3}(?:,\d{3})*)\s*(?:to|[-–])\s*(\d{1,3}(?:,\d{3})*)\s*(?:RSF|SF|square feet|sq\.?\s*ft\.?)/i;
  const sfMatch = description.match(sfRegex);
  if (sfMatch) {
    requirements.minimumRSF = parseInt(sfMatch[1]!.replace(/,/g, ''));
    requirements.maximumRSF = parseInt(sfMatch[2]!.replace(/,/g, ''));
  }

  // Single SF requirement
  const singleSfRegex = /(?:minimum|at least)\s*(\d{1,3}(?:,\d{3})*)\s*(?:RSF|SF|square feet)/i;
  const singleSfMatch = description.match(singleSfRegex);
  if (singleSfMatch && !requirements.minimumRSF) {
    requirements.minimumRSF = parseInt(singleSfMatch[1]!.replace(/,/g, ''));
  }

  // Building class
  if (/Class\s*A\+/i.test(description)) {
    requirements.buildingClass = ['A+'];
  } else if (/Class\s*A/i.test(description)) {
    requirements.buildingClass = ['A+', 'A'];
  }

  // ADA compliance
  requirements.adaRequired = /ADA|Americans with Disabilities Act|accessible/i.test(description);

  // SCIF requirement
  requirements.scifRequired = /SCIF|Sensitive Compartmented Information Facility/i.test(description);

  // Clearance requirements
  if (/Top Secret|TS\/SCI/i.test(description)) {
    requirements.clearanceRequired = 'top_secret';
  } else if (/Secret clearance/i.test(description)) {
    requirements.clearanceRequired = 'secret';
  }

  // Features
  requirements.fiber = /fiber|high-speed internet|broadband/i.test(description);
  requirements.backupPower = /backup power|generator|UPS|uninterruptible power/i.test(description);

  // Parking ratio
  const parkingRegex = /(\d+\.?\d*)\s*spaces?\s*per\s*1,?000\s*(?:RSF|SF)/i;
  const parkingMatch = description.match(parkingRegex);
  if (parkingMatch) {
    requirements.parkingRatio = parseFloat(parkingMatch[1]!);
  }

  // Lease term
  const leaseTermRegex = /(\d+)\s*year\s*(?:lease|term)/i;
  const leaseTermMatch = description.match(leaseTermRegex);
  if (leaseTermMatch) {
    requirements.leaseTermYears = parseInt(leaseTermMatch[1]!);
  }

  // Contiguous requirement
  requirements.contiguousRequired = /contiguous|single floor|entire floor/i.test(description);

  return requirements;
}

/**
 * Batch calculate federal scores for multiple properties
 */
export async function batchCalculateFederalScores(
  properties: Array<{ latitude: number; longitude: number; id: string }>,
  radiusMiles: number = 5
): Promise<Map<string, any>> {
  const results = new Map();

  try {
    // Build spatial index once for all calculations
    const index = await buildSpatialIndexFromDatabase();

    for (const property of properties) {
      try {
        const score = await calculateFederalNeighborhoodScore(
          property.latitude,
          property.longitude,
          radiusMiles,
          index
        );
        results.set(property.id, score);
      } catch (error) {
        console.error(`Error calculating score for property ${property.id}:`, error);
        results.set(property.id, null);
      }
    }
  } catch (error) {
    console.error('Error building spatial index:', error);
  }

  return results;
}

/**
 * Batch calculate match scores for property-opportunity pairs
 */
export async function batchCalculateMatchScores(
  pairs: Array<{
    propertyId: string;
    opportunityId: string;
    property: PropertyData;
    opportunity: OpportunityRequirements;
    experience: BrokerExperience;
  }>
): Promise<Map<string, any>> {
  const results = new Map();

  for (const pair of pairs) {
    try {
      const matchResult = calculatePropertyOpportunityMatch(
        pair.property,
        pair.opportunity,
        pair.experience
      );

      const key = `${pair.propertyId}:${pair.opportunityId}`;
      results.set(key, matchResult);
    } catch (error) {
      console.error(`Error calculating match for ${pair.propertyId}:${pair.opportunityId}:`, error);
      results.set(`${pair.propertyId}:${pair.opportunityId}`, null);
    }
  }

  return results;
}

/**
 * Update broker listing with federal score
 */
export async function updateBrokerListingFederalScore(
  listingId: string,
  latitude: number,
  longitude: number,
  radiusMiles: number = 5
): Promise<void> {
  const supabase = await createClient();

  try {
    const score = await calculateEnhancedFederalScore(latitude, longitude, radiusMiles);

    await supabase
      .from('broker_listings')
      .update({
        federal_score: score.score,
        federal_score_data: score,
      })
      .eq('id', listingId);
  } catch (error) {
    console.error(`Error updating federal score for listing ${listingId}:`, error);
    throw error;
  }
}

/**
 * Find best matching properties for an opportunity
 */
export async function findBestMatchingProperties(
  opportunityId: string,
  limit: number = 10
): Promise<Array<{ propertyId: string; score: number; matchData: any }>> {
  const supabase = await createClient();

  // Get opportunity
  const { data: opportunity, error: oppError } = await supabase
    .from('opportunities')
    .select('*')
    .eq('id', opportunityId)
    .single();

  if (oppError || !opportunity) {
    throw new Error('Opportunity not found');
  }

  // Extract requirements
  const requirements = extractOpportunityRequirements(opportunity);

  // Get properties in the same state (first-level filter)
  const { data: properties, error: propError } = await supabase
    .from('broker_listings')
    .select('*, broker_profiles(*)')
    .eq('state', requirements.state)
    .eq('status', 'active');

  if (propError || !properties) {
    return [];
  }

  // Calculate match scores for all properties
  const matches: Array<{ propertyId: string; score: number; matchData: any }> = [];

  for (const property of properties) {
    try {
      const propertyData: PropertyData = {
        latitude: property.latitude,
        longitude: property.longitude,
        address: property.street_address,
        city: property.city,
        state: property.state,
        zipcode: property.zipcode,
        totalSqft: property.total_sf,
        availableSqft: property.available_sf,
        minDivisibleSqft: property.min_divisible_sf,
        buildingClass: property.building_class || 'B',
        adaCompliant: property.ada_compliant || false,
        scifCapable: property.scif_capable || false,
        securityClearance: property.security_clearance,
        fiber: property.fiber_connectivity || false,
        backupPower: property.backup_power || false,
        parking: property.parking_spaces ? {
          spaces: property.parking_spaces,
          ratio: property.parking_ratio || 0,
        } : undefined,
        availableDate: property.available_date ? new Date(property.available_date) : new Date(),
        leaseTermYears: property.lease_term_years,
        buildToSuit: property.build_to_suit || false,
        setAsideEligible: property.set_aside_eligible || [],
      };

      const experience: BrokerExperience = {
        governmentLeaseExperience: property.broker_profiles?.government_lease_experience || false,
        governmentLeasesCount: property.broker_profiles?.government_leases_count || 0,
        gsaCertified: property.broker_profiles?.gsa_certified || false,
        yearsInBusiness: property.broker_profiles?.years_in_business || 0,
        totalPortfolioSqft: property.broker_profiles?.total_portfolio_sqft || 0,
        references: property.broker_profiles?.gov_references || [],
        willingToBuildToSuit: property.broker_profiles?.willing_to_build_to_suit || false,
      };

      const matchResult = calculatePropertyOpportunityMatch(
        propertyData,
        requirements,
        experience
      );

      // Only include qualified properties
      if (matchResult.qualified) {
        matches.push({
          propertyId: property.id,
          score: matchResult.score,
          matchData: matchResult,
        });
      }
    } catch (error) {
      console.error(`Error matching property ${property.id}:`, error);
    }
  }

  // Sort by score and return top matches
  return matches
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
