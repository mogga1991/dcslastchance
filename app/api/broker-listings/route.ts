import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { iolpAdapter } from '@/lib/iolp';
import type { BrokerListingInput, BrokerListingFilters } from '@/types/broker-listing';
import { Pool } from '@neondatabase/serverless';

/**
 * GET /api/broker-listings
 * List broker listings with optional filters
 *
 * Query params (all optional):
 * - status: string | string[] (listing_status enum)
 * - property_type: string | string[] (property_type enum)
 * - state: string (2-letter state code)
 * - city: string
 * - min_sf: number
 * - max_sf: number
 * - min_rent: number (annual rate per SF)
 * - max_rent: number (annual rate per SF)
 * - gsa_eligible: boolean
 * - search: string (full-text search)
 * - limit: number (default 50, max 100)
 * - offset: number (default 0)
 * - sort_by: string (created_at, updated_at, asking_rent_sf, available_sf, federal_score)
 * - sort_order: 'asc' | 'desc' (default 'desc')
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized", listings: [] },
        { status: 401 }
      );
    }

    // Connect to Neon database
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });

    // Get user's email from Supabase
    const userEmail = user.email;

    // Find user in Neon by email
    const userResult = await pool.query(
      'SELECT id FROM "user" WHERE email = $1 LIMIT 1',
      [userEmail]
    );

    if (!userResult.rows[0]) {
      await pool.end();
      return NextResponse.json({
        success: true,
        data: [],
        count: 0
      });
    }

    const neonUserId = userResult.rows[0].id;

    // Fetch properties from Neon
    const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 100);

    const result = await pool.query(
      'SELECT id, address, city, state, total_sf, available_sf FROM property WHERE broker_id = $1 LIMIT $2',
      [neonUserId, limit]
    );

    await pool.end();

    return NextResponse.json({
      success: true,
      data: result.rows || [],
      meta: {
        total: result.rows.length,
        limit,
        offset: 0,
        hasMore: false
      }
    });
  } catch (error) {
    console.error('Error in GET /api/broker-listings:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        data: []
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/broker-listings
 * Create a new broker listing
 *
 * Body: BrokerListingInput
 * Requires authentication
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication required'
        },
        { status: 401 }
      );
    }

    // Parse request body
    const input: BrokerListingInput = await request.json();

    // Validate required MVP fields only
    if (!input.street_address || !input.city || !input.state || !input.zipcode ||
        !input.total_sf || !input.available_date ||
        !input.building_class || !input.broker_email) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: street_address, city, state, zipcode, total_sf, available_date, building_class, broker_email'
        },
        { status: 400 }
      );
    }

    // Validate building_class
    const validBuildingClasses = ['class_a', 'class_b', 'class_c'];
    if (!validBuildingClasses.includes(input.building_class)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid building_class. Must be one of: class_a, class_b, class_c'
        },
        { status: 400 }
      );
    }

    // Auto-generate title from address if not provided
    const title = input.title || `${input.street_address}, ${input.city}, ${input.state}`;

    // Auto-generate description from notes if not provided
    const description = input.description || input.notes || `${input.total_sf} RSF available at ${input.street_address}`;

    // Calculate federal score with coordinates (if provided)
    let federalScore: number | undefined;
    let federalScoreData: any;
    let latitude = input.latitude;
    let longitude = input.longitude;

    // If coordinates not provided, try to geocode the address
    if (!latitude || !longitude) {
      try {
        const { geocodeAddress } = await import('@/lib/geocode');
        const geocodeResult = await geocodeAddress(
          input.street_address,
          input.city,
          input.state,
          input.zipcode
        );
        if (geocodeResult) {
          latitude = geocodeResult.coordinates.lat;
          longitude = geocodeResult.coordinates.lng;
        }
      } catch (error) {
        console.error('Geocoding error:', error);
        // Continue without coordinates - federal score will be null
      }
    }

    // Calculate federal score if we have coordinates
    if (latitude && longitude) {
      try {
        const score = await iolpAdapter.calculateFederalNeighborhoodScore(
          latitude,
          longitude,
          5 // 5 mile radius
        );
        federalScore = score.score;
        federalScoreData = score;
      } catch (error) {
        console.error('Federal score calculation error:', error);
        // Continue without federal score
      }
    }

    // Prepare insert data with MVP fields
    const insertData = {
      user_id: user.id,
      // Contact info
      broker_email: input.broker_email,
      broker_name: input.broker_name || user.email?.split('@')[0] || 'Unknown',
      broker_company: input.broker_company || 'Independent',
      broker_phone: input.broker_phone || '',
      lister_role: input.lister_role || 'owner',
      license_number: input.license_number,
      brokerage_company: input.brokerage_company,
      // Listing details
      title,
      description,
      property_type: input.property_type || 'office',
      status: input.status || 'active',
      // Location
      street_address: input.street_address,
      suite_unit: input.suite_unit,
      city: input.city,
      state: input.state.toUpperCase(),
      zipcode: input.zipcode,
      latitude,
      longitude,
      // Space details
      total_sf: input.total_sf,
      available_sf: input.available_sf || input.total_sf,
      min_divisible_sf: input.min_divisible_sf,
      // Pricing
      asking_rent_sf: input.asking_rent_sf || 0,
      lease_type: input.lease_type || 'full_service',
      // Availability
      available_date: input.available_date,
      // MVP fields
      building_class: input.building_class,
      ada_accessible: input.ada_accessible || false,
      parking_spaces: input.parking_spaces,
      leed_certified: input.leed_certified || false,
      year_built: input.year_built,
      notes: input.notes,
      // Legacy fields
      features: input.features || [],
      amenities: input.amenities || [],
      gsa_eligible: input.gsa_eligible || false,
      set_aside_eligible: input.set_aside_eligible || [],
      federal_score: federalScore,
      federal_score_data: federalScoreData,
      images: input.images || []
    };

    // Insert listing
    const { data, error } = await supabase
      .from('broker_listings')
      .insert([insertData])
      .select()
      .single();

    if (error) {
      console.error('Error creating broker listing:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to create broker listing'
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in POST /api/broker-listings:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}
