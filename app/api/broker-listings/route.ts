import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { iolpAdapter } from '@/lib/iolp';
import type { BrokerListingInput, BrokerListingFilters } from '@/types/broker-listing';

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

    // Build query
    let query = supabase
      .from('broker_listings')
      .select('*', { count: 'exact' });

    // Apply filters
    const status = searchParams.get('status');
    if (status) {
      const statuses = status.split(',');
      query = query.in('status', statuses);
    } else {
      // Default to active listings only
      query = query.eq('status', 'active');
    }

    const propertyType = searchParams.get('property_type');
    if (propertyType) {
      const types = propertyType.split(',');
      query = query.in('property_type', types);
    }

    const state = searchParams.get('state');
    if (state) {
      query = query.eq('state', state.toUpperCase());
    }

    const city = searchParams.get('city');
    if (city) {
      query = query.ilike('city', `%${city}%`);
    }

    const minSf = searchParams.get('min_sf');
    if (minSf) {
      query = query.gte('available_sf', parseInt(minSf));
    }

    const maxSf = searchParams.get('max_sf');
    if (maxSf) {
      query = query.lte('available_sf', parseInt(maxSf));
    }

    const minRent = searchParams.get('min_rent');
    if (minRent) {
      query = query.gte('asking_rent_sf', parseFloat(minRent));
    }

    const maxRent = searchParams.get('max_rent');
    if (maxRent) {
      query = query.lte('asking_rent_sf', parseFloat(maxRent));
    }

    const gsaEligible = searchParams.get('gsa_eligible');
    if (gsaEligible === 'true') {
      query = query.eq('gsa_eligible', true);
    }

    const search = searchParams.get('search');
    if (search) {
      // Full-text search on title, description, and address
      query = query.or(
        `title.ilike.%${search}%,description.ilike.%${search}%,street_address.ilike.%${search}%,city.ilike.%${search}%`
      );
    }

    // Pagination
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    // Sorting
    const sortBy = searchParams.get('sort_by') || 'created_at';
    const sortOrder = searchParams.get('sort_order') || 'desc';
    const ascending = sortOrder === 'asc';

    query = query.order(sortBy as any, { ascending });

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    // Execute query
    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching broker listings:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to fetch broker listings',
          data: []
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data || [],
      meta: {
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit
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

    // Validate required fields
    if (!input.title || !input.description || !input.property_type ||
        !input.street_address || !input.city || !input.state || !input.zipcode ||
        !input.total_sf || !input.available_sf || !input.asking_rent_sf ||
        !input.lease_type || !input.available_date ||
        !input.broker_name || !input.broker_company ||
        !input.broker_email || !input.broker_phone ||
        !input.lister_role) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields'
        },
        { status: 400 }
      );
    }

    // Validate lister_role is one of the allowed values
    const validRoles = ['owner', 'broker', 'agent', 'salesperson'];
    if (!validRoles.includes(input.lister_role)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid lister_role. Must be one of: owner, broker, agent, salesperson'
        },
        { status: 400 }
      );
    }

    // Validate conditional fields based on role
    if (input.lister_role === 'broker' || input.lister_role === 'agent') {
      if (!input.license_number) {
        return NextResponse.json(
          {
            success: false,
            error: 'license_number is required for brokers and agents'
          },
          { status: 400 }
        );
      }
      if (!input.brokerage_company) {
        return NextResponse.json(
          {
            success: false,
            error: 'brokerage_company is required for brokers and agents'
          },
          { status: 400 }
        );
      }
    }

    // Validate coordinates are provided (required for map display)
    if (!input.latitude || !input.longitude) {
      return NextResponse.json(
        {
          success: false,
          error: 'Property coordinates are required. Please verify the address using the "Locate on Map" button.'
        },
        { status: 400 }
      );
    }

    // Validate coordinates are valid numbers
    if (
      typeof input.latitude !== 'number' ||
      typeof input.longitude !== 'number' ||
      isNaN(input.latitude) ||
      isNaN(input.longitude) ||
      input.latitude < -90 ||
      input.latitude > 90 ||
      input.longitude < -180 ||
      input.longitude > 180
    ) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid coordinates. Please verify the property location.'
        },
        { status: 400 }
      );
    }

    // Calculate federal score with coordinates
    let federalScore: number | undefined;
    let federalScoreData: any;

    const score = await iolpAdapter.calculateFederalNeighborhoodScore(
      input.latitude,
      input.longitude,
      5 // 5 mile radius
    );
    federalScore = score.score;
    federalScoreData = score;

    // Prepare insert data
    const insertData = {
      user_id: user.id,
      lister_role: input.lister_role,
      broker_name: input.broker_name,
      broker_company: input.broker_company,
      broker_email: input.broker_email,
      broker_phone: input.broker_phone,
      license_number: input.license_number,
      brokerage_company: input.brokerage_company,
      title: input.title,
      description: input.description,
      property_type: input.property_type,
      status: input.status || 'draft',
      street_address: input.street_address,
      suite_unit: input.suite_unit,
      city: input.city,
      state: input.state.toUpperCase(),
      zipcode: input.zipcode,
      latitude: input.latitude,
      longitude: input.longitude,
      total_sf: input.total_sf,
      available_sf: input.available_sf,
      min_divisible_sf: input.min_divisible_sf,
      asking_rent_sf: input.asking_rent_sf,
      lease_type: input.lease_type,
      available_date: input.available_date,
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
