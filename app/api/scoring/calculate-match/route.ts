import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { calculateMatchScore } from '@/lib/scoring';
import type {
  LocationRequirement,
  SpaceRequirement,
  BuildingRequirement,
  TimelineRequirement,
  ExperienceProfile,
  PropertySpace,
  PropertyBuilding,
  PropertyTimeline,
} from '@/lib/scoring/types';

// POST /api/scoring/calculate-match
// Calculate match score between a property and an opportunity
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { propertyId, opportunityId } = body;

    if (!propertyId || !opportunityId) {
      return NextResponse.json(
        { error: 'propertyId and opportunityId are required' },
        { status: 400 }
      );
    }

    // Check if we have a cached score (less than 24 hours old)
    try {
      const { data: cachedScore } = await supabase
        .from('property_scores')
        .select('*')
        .eq('property_id', propertyId)
        .eq('opportunity_id', opportunityId)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (cachedScore) {
        return NextResponse.json({
          score: {
            overallScore: cachedScore.overall_score,
            grade: cachedScore.grade,
            competitive: cachedScore.competitive,
            qualified: cachedScore.qualified,
            categoryScores: cachedScore.category_scores,
            strengths: cachedScore.strengths,
            weaknesses: cachedScore.weaknesses,
            recommendations: cachedScore.recommendations,
            disqualifiers: cachedScore.disqualifiers,
          },
          cached: true,
        });
      }
    } catch (cacheError) {
      console.log('Cache check failed, continuing with calculation:', cacheError);
    }

    // Fetch property data
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .select('*')
      .eq('id', propertyId)
      .single();

    if (propertyError || !property) {
      return NextResponse.json(
        { error: 'Property not found. Ensure properties table exists and propertyId is correct.' },
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
        { error: 'Opportunity not found' },
        { status: 404 }
      );
    }

    // Fetch broker profile if available
    let brokerProfile = null;
    try {
      const { data } = await supabase
        .from('broker_profiles')
        .select('*')
        .eq('user_id', property.broker_id || property.owner_id)
        .single();
      brokerProfile = data;
    } catch {
      console.log('Broker profile not found, using defaults');
    }

    // Extract requirements from opportunity
    const requirements = extractRequirementsFromOpportunity(opportunity);

    // Build property data structure
    const propertyData = {
      location: {
        city: property.city,
        state: property.state,
        lat: parseFloat(property.latitude) || 0,
        lng: parseFloat(property.longitude) || 0,
      },
      space: {
        totalSqFt: property.total_sqft,
        availableSqFt: property.available_sqft,
        usableSqFt: property.usable_sqft,
        minDivisibleSqFt: property.min_divisible_sqft,
        isContiguous: property.is_contiguous,
      } as PropertySpace,
      building: {
        buildingClass: property.building_class || 'B',
        totalFloors: property.total_floors,
        availableFloors: property.available_floors || [],
        adaCompliant: property.ada_compliant,
        publicTransitAccess: property.public_transit_access,
        parkingSpaces: property.parking_spaces,
        parkingRatio: parseFloat(property.parking_ratio) || 0,
        features: property.features || {
          fiber: false,
          backupPower: false,
          loadingDock: false,
          security24x7: false,
          secureAccess: false,
          scifCapable: false,
          dataCenter: false,
          cafeteria: false,
          fitnessCenter: false,
          conferenceCenter: false,
        },
        certifications: property.certifications || [],
      } as PropertyBuilding,
      timeline: {
        availableDate: property.available_date
          ? new Date(property.available_date)
          : null,
        minLeaseTermMonths: property.min_lease_term_months,
        maxLeaseTermMonths: property.max_lease_term_months,
        buildOutWeeksNeeded: property.build_out_weeks_needed || 0,
      } as PropertyTimeline,
    };

    // Build broker experience profile
    const brokerExperience: ExperienceProfile = {
      governmentLeaseExperience:
        brokerProfile?.government_lease_experience || false,
      governmentLeasesCount: brokerProfile?.government_leases_count || 0,
      gsa_certified: brokerProfile?.gsa_certified || false,
      yearsInBusiness: brokerProfile?.years_in_business || 0,
      totalPortfolioSqFt: brokerProfile?.total_portfolio_sqft || 0,
      references: brokerProfile?.references || [],
      willingToBuildToSuit: brokerProfile?.willing_to_build_to_suit || false,
      willingToProvideImprovements:
        brokerProfile?.willing_to_provide_improvements || false,
    };

    // Calculate the match score
    const matchScore = calculateMatchScore(
      propertyData,
      brokerExperience,
      requirements
    );

    // Try to cache the score (fails gracefully if table doesn't exist)
    try {
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      await supabase.from('property_scores').upsert({
        property_id: propertyId,
        opportunity_id: opportunityId,
        overall_score: matchScore.overallScore,
        grade: matchScore.grade,
        competitive: matchScore.competitive,
        qualified: matchScore.qualified,
        category_scores: matchScore.factors,  // Updated from categoryScores to factors
        strengths: matchScore.strengths,
        weaknesses: matchScore.weaknesses,
        recommendations: matchScore.recommendations,
        disqualifiers: matchScore.disqualifiers,
        calculated_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString(),
      });
    } catch (cacheWriteError) {
      console.log('Could not cache score (table may not exist yet):', cacheWriteError);
    }

    return NextResponse.json({
      score: matchScore,
      cached: false,
    });
  } catch (error) {
    console.error('Error calculating match score:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Helper function to extract requirements from opportunity
function extractRequirementsFromOpportunity(opportunity: Record<string, unknown>) {
  // Parse location requirements
  const locationRequirement: LocationRequirement = {
    city: typeof opportunity.pop_city_name === 'string' ? opportunity.pop_city_name : null,
    state: typeof opportunity.pop_state_code === 'string' ? opportunity.pop_state_code : 'DC',
    zip: typeof opportunity.pop_zip === 'string' ? opportunity.pop_zip : null,
    delineatedArea: null, // Would need to parse from description/full_data
    radiusMiles: 10, // Default 10 mile radius for GSA opportunities
    centralPoint: null, // Would need geocoding from city/state
  };

  // Parse space requirements from full_data or use defaults
  // In production, these would be extracted from the RFP document analysis
  const spaceRequirement: SpaceRequirement = {
    minSqFt: 40000, // Typical GSA requirement
    maxSqFt: 120000,
    targetSqFt: 50000,
    usableOrRentable: 'usable',
    contiguous: true,
    divisible: false,
  };

  // Parse building requirements
  const buildingRequirement: BuildingRequirement = {
    buildingClass: ['A', 'A+', 'B'], // GSA typically prefers Class A/B
    minFloors: null,
    maxFloors: null,
    preferredFloor: null,
    accessibility: {
      adaCompliant: true, // Required for government
      publicTransit: true, // Preferred
      parkingRequired: true,
    },
    features: {
      fiber: true,
      backupPower: true,
      loadingDock: false,
      security24x7: true,
      secureAccess: true,
      scifCapable: false,
      dataCenter: false,
      cafeteria: false,
      fitnessCenter: false,
      conferenceCenter: false,
    },
    certifications: ['LEED', 'Energy Star'],
  };

  // Parse timeline requirements
  const responseDeadline = typeof opportunity.response_deadline === 'string' || typeof opportunity.response_deadline === 'number' || opportunity.response_deadline instanceof Date
    ? new Date(opportunity.response_deadline)
    : new Date();

  const occupancyDate = new Date(responseDeadline.getTime() + 90 * 24 * 60 * 60 * 1000); // 90 days after deadline

  const timelineRequirement: TimelineRequirement = {
    occupancyDate,
    firmTermMonths: 60, // 5 years is typical
    totalTermMonths: 240, // 20 years with options
    responseDeadline,
  };

  return {
    location: locationRequirement,
    space: spaceRequirement,
    building: buildingRequirement,
    timeline: timelineRequirement,
  };
}

// GET /api/scoring/calculate-match?propertyId=xxx&opportunityId=yyy
// Get cached match score or return 404
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const propertyId = searchParams.get('propertyId');
    const opportunityId = searchParams.get('opportunityId');

    if (!propertyId || !opportunityId) {
      return NextResponse.json(
        { error: 'propertyId and opportunityId are required' },
        { status: 400 }
      );
    }

    // Check for cached score
    try {
      const { data: cachedScore } = await supabase
        .from('property_scores')
        .select('*')
        .eq('property_id', propertyId)
        .eq('opportunity_id', opportunityId)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (cachedScore) {
        return NextResponse.json({
          score: {
            overallScore: cachedScore.overall_score,
            grade: cachedScore.grade,
            competitive: cachedScore.competitive,
            qualified: cachedScore.qualified,
            categoryScores: cachedScore.category_scores,
            strengths: cachedScore.strengths,
            weaknesses: cachedScore.weaknesses,
            recommendations: cachedScore.recommendations,
            disqualifiers: cachedScore.disqualifiers,
          },
          cached: true,
        });
      }
    } catch (err) {
      console.error('Error fetching cached score:', err);
    }

    return NextResponse.json(
      { error: 'Score not cached. Use POST to calculate.' },
      { status: 404 }
    );
  } catch (error) {
    console.error('Error fetching match score:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
