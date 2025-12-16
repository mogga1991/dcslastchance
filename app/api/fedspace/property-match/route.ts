/**
 * Property-Opportunity Match Score API Endpoint
 *
 * PATENT #2: Early-Termination Disqualification Pipeline
 * - 73% computation reduction through optimized constraint ordering
 * - 5-factor weighted matching (location, space, building, timeline, experience)
 *
 * POST /api/fedspace/property-match
 * GET /api/fedspace/property-match?propertyId=xxx&opportunityId=yyy
 */

import { NextRequest, NextResponse } from 'next/server';
import { calculatePropertyOpportunityMatch } from '@/lib/fedspace';
import { createClient } from '@/lib/supabase/server';
import type {
  PropertyData,
  OpportunityRequirements,
  BrokerExperience,
} from '@/lib/fedspace/types';

/**
 * GET: Retrieve cached match score or calculate if not cached
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const propertyId = searchParams.get('propertyId');
    const opportunityId = searchParams.get('opportunityId');

    if (!propertyId || !opportunityId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required parameters: propertyId, opportunityId',
        },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Check cache first
    const { data: cached, error: cacheError } = await supabase
      .from('property_match_scores')
      .select('score_data, hit_count')
      .eq('property_id', propertyId)
      .eq('opportunity_id', opportunityId)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (cached && !cacheError) {
      // Update hit count
      await supabase
        .from('property_match_scores')
        .update({
          hit_count: (cached.hit_count || 0) + 1,
          last_accessed_at: new Date().toISOString(),
        })
        .eq('property_id', propertyId)
        .eq('opportunity_id', opportunityId);

      return NextResponse.json({
        success: true,
        data: cached.score_data,
        cached: true,
      });
    }

    // Need to calculate - fetch property and opportunity data
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch property data
    const { data: property, error: propertyError } = await supabase
      .from('broker_listings')
      .select('*')
      .eq('id', propertyId)
      .single();

    if (propertyError || !property) {
      return NextResponse.json(
        { success: false, error: 'Property not found' },
        { status: 404 }
      );
    }

    // Fetch opportunity data
    const { data: opportunity, error: opportunityError } = await supabase
      .from('opportunities')
      .select('*')
      .eq('id', opportunityId)
      .single();

    if (opportunityError || !opportunity) {
      return NextResponse.json(
        { success: false, error: 'Opportunity not found' },
        { status: 404 }
      );
    }

    // Fetch broker experience
    const { data: brokerProfile } = await supabase
      .from('broker_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // Transform data to match algorithm types
    const propertyData = transformPropertyData(property);
    const requirementsData = transformOpportunityData(opportunity);
    const experienceData = transformBrokerExperience(brokerProfile);

    // Calculate match score
    const matchResult = calculatePropertyOpportunityMatch(
      propertyData,
      requirementsData,
      experienceData
    );

    // Store in cache
    await storeMatchScore(
      supabase,
      propertyId,
      opportunityId,
      opportunity.notice_id,
      matchResult
    );

    return NextResponse.json({
      success: true,
      data: matchResult,
      cached: false,
    });
  } catch (error) {
    console.error('Error calculating property match:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST: Calculate match score with custom data
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { property, opportunity, experience, propertyId, opportunityId } = body;

    if (!property || !opportunity) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: property, opportunity',
        },
        { status: 400 }
      );
    }

    // Use provided experience or fetch from profile
    let experienceData = experience;
    if (!experienceData) {
      const { data: brokerProfile } = await supabase
        .from('broker_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      experienceData = transformBrokerExperience(brokerProfile);
    }

    // Calculate match score
    const matchResult = calculatePropertyOpportunityMatch(
      property,
      opportunity,
      experienceData
    );

    // Store in cache if IDs provided
    if (propertyId && opportunityId) {
      await storeMatchScore(
        supabase,
        propertyId,
        opportunityId,
        opportunity.noticeId,
        matchResult
      );
    }

    return NextResponse.json({
      success: true,
      data: matchResult,
      cached: false,
    });
  } catch (error) {
    console.error('Error calculating property match:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE: Clear cached match score
 */
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const propertyId = searchParams.get('propertyId');
    const opportunityId = searchParams.get('opportunityId');

    if (!propertyId || !opportunityId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required parameters: propertyId, opportunityId',
        },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await supabase
      .from('property_match_scores')
      .delete()
      .eq('property_id', propertyId)
      .eq('opportunity_id', opportunityId);

    return NextResponse.json({
      success: true,
      message: 'Cache cleared',
    });
  } catch (error) {
    console.error('Error deleting match score cache:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// ==================== Helper Functions ====================

function transformPropertyData(property: any): PropertyData {
  return {
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
    parking: property.parking_spaces
      ? {
          spaces: property.parking_spaces,
          ratio: property.parking_ratio || 0,
        }
      : undefined,
    availableDate: property.available_date
      ? new Date(property.available_date)
      : new Date(),
    leaseTermYears: property.lease_term_years,
    buildToSuit: property.build_to_suit || false,
    setAsideEligible: property.set_aside_eligible || [],
  };
}

function transformOpportunityData(opportunity: any): OpportunityRequirements {
  // Parse full_data JSONB if available
  const fullData = opportunity.full_data || {};

  return {
    noticeId: opportunity.notice_id,
    title: opportunity.title,
    agency: opportunity.department || fullData.department || '',
    state: opportunity.pop_state_code || fullData.placeOfPerformance?.state?.code || '',
    city: opportunity.pop_city_name || fullData.placeOfPerformance?.city?.name,
    minimumRSF: fullData.minimumRSF || 10000,
    maximumRSF: fullData.maximumRSF,
    contiguousRequired: fullData.contiguousRequired || false,
    setAside: opportunity.type_of_set_aside || fullData.typeOfSetAside,
    adaRequired: fullData.adaRequired || true,
    buildingClass: fullData.buildingClass,
    clearanceRequired: fullData.clearanceRequired,
    scifRequired: fullData.scifRequired || false,
    fiber: fullData.fiber || false,
    backupPower: fullData.backupPower || false,
    parkingRatio: fullData.parkingRatio,
    occupancyDate: opportunity.response_deadline
      ? new Date(opportunity.response_deadline)
      : undefined,
    leaseTermYears: fullData.leaseTermYears,
    responseDeadline: opportunity.response_deadline
      ? new Date(opportunity.response_deadline)
      : undefined,
    naicsCode: opportunity.naics_code,
    delineatedArea: fullData.delineatedArea
      ? {
          latitude: fullData.delineatedArea.latitude,
          longitude: fullData.delineatedArea.longitude,
          radiusMiles: fullData.delineatedArea.radiusMiles,
        }
      : undefined,
  };
}

function transformBrokerExperience(profile: any): BrokerExperience {
  if (!profile) {
    return {
      governmentLeaseExperience: false,
      governmentLeasesCount: 0,
      gsaCertified: false,
      yearsInBusiness: 0,
      totalPortfolioSqft: 0,
    };
  }

  return {
    governmentLeaseExperience: profile.government_lease_experience || false,
    governmentLeasesCount: profile.government_leases_count || 0,
    gsaCertified: profile.gsa_certified || false,
    yearsInBusiness: profile.years_in_business || 0,
    totalPortfolioSqft: profile.total_portfolio_sqft || 0,
    references: profile.gov_references || [],
    willingToBuildToSuit: profile.willing_to_build_to_suit || false,
  };
}

async function storeMatchScore(
  supabase: any,
  propertyId: string,
  opportunityId: string,
  noticeId: string,
  matchResult: any
) {
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  await supabase.from('property_match_scores').upsert(
    {
      property_id: propertyId,
      opportunity_id: opportunityId,
      notice_id: noticeId,
      score_data: matchResult,
      overall_score: matchResult.score,
      grade: matchResult.grade,
      qualified: matchResult.qualified,
      competitive: matchResult.competitive,
      early_terminated: !!matchResult.earlyTermination,
      failed_constraint: matchResult.earlyTermination?.failedConstraint,
      computation_saved_pct: matchResult.earlyTermination?.computationSaved,
      location_score: matchResult.factors.location.score,
      space_score: matchResult.factors.space.score,
      building_score: matchResult.factors.building.score,
      timeline_score: matchResult.factors.timeline.score,
      experience_score: matchResult.factors.experience.score,
      computation_time_ms: matchResult.computationTimeMs,
      expires_at: expiresAt.toISOString(),
    },
    {
      onConflict: 'property_id,opportunity_id',
    }
  );
}
