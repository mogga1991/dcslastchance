import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { iolpAdapter } from '@/lib/iolp';
import type { BrokerListingInput, PublicBrokerListing } from '@/types/broker-listing';

/**
 * List of public fields (excludes private broker contact information)
 */
const PUBLIC_LISTING_FIELDS = `
  id,
  user_id,
  lister_role,
  title,
  description,
  property_type,
  status,
  street_address,
  suite_unit,
  city,
  state,
  zipcode,
  latitude,
  longitude,
  total_sf,
  available_sf,
  min_divisible_sf,
  asking_rent_sf,
  lease_type,
  available_date,
  building_class,
  ada_accessible,
  parking_spaces,
  leed_certified,
  year_built,
  notes,
  features,
  amenities,
  gsa_eligible,
  set_aside_eligible,
  federal_score,
  federal_score_data,
  images,
  views_count,
  created_at,
  updated_at,
  published_at
`.trim();

/**
 * GET /api/broker-listings/[id]
 * Get a single broker listing by ID (PUBLIC - excludes contact info)
 * Also increments the views_count
 *
 * SECURITY: Broker contact information (name, company, email, phone) is NEVER
 * returned in public API responses. Contact info is only accessible to:
 * - The listing owner (via authenticated endpoints)
 * - FedSpace admin staff (via internal admin tools)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    // Fetch the listing - EXCLUDE private contact fields
    const { data, error } = await supabase
      .from('broker_listings')
      .select(PUBLIC_LISTING_FIELDS)
      .eq('id', id)
      .single();

    if (error || !data) {
      return NextResponse.json(
        {
          success: false,
          error: 'Listing not found'
        },
        { status: 404 }
      );
    }

    // Type assertion for Supabase data
    const listing = data as unknown as PublicBrokerListing;

    // Increment views count (fire and forget - don't wait for result)
    void supabase
      .from('broker_listings')
      .update({ views_count: (listing.views_count || 0) + 1 })
      .eq('id', id);

    return NextResponse.json({
      success: true,
      data: listing
    });
  } catch (error) {
    console.error('Error in GET /api/broker-listings/[id]:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/broker-listings/[id]
 * Update a broker listing
 * Only the owner can update
 * Recalculates federal_score if coordinates changed
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

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

    // Check ownership
    const { data: existing, error: fetchError } = await supabase
      .from('broker_listings')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json(
        {
          success: false,
          error: 'Listing not found'
        },
        { status: 404 }
      );
    }

    if (existing.user_id !== user.id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized: You can only update your own listings'
        },
        { status: 403 }
      );
    }

    // Parse request body
    const input: Partial<BrokerListingInput> = await request.json();

    // Check if coordinates changed
    const coordsChanged =
      (input.latitude && input.latitude !== existing.latitude) ||
      (input.longitude && input.longitude !== existing.longitude);

    let federalScore: number | undefined;
    let federalScoreData: Record<string, unknown> | undefined;

    if (coordsChanged && input.latitude && input.longitude) {
      // Recalculate federal score
      const score = await iolpAdapter.calculateFederalNeighborhoodScore(
        input.latitude,
        input.longitude,
        5
      );
      federalScore = score.score;
      federalScoreData = score;
    }

    // Prepare update data (only include provided fields)
    const updateData: Record<string, unknown> = {};

    if (input.broker_name !== undefined) updateData.broker_name = input.broker_name;
    if (input.broker_company !== undefined) updateData.broker_company = input.broker_company;
    if (input.broker_email !== undefined) updateData.broker_email = input.broker_email;
    if (input.broker_phone !== undefined) updateData.broker_phone = input.broker_phone;
    if (input.title !== undefined) updateData.title = input.title;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.property_type !== undefined) updateData.property_type = input.property_type;
    if (input.status !== undefined) updateData.status = input.status;
    if (input.street_address !== undefined) updateData.street_address = input.street_address;
    if (input.suite_unit !== undefined) updateData.suite_unit = input.suite_unit;
    if (input.city !== undefined) updateData.city = input.city;
    if (input.state !== undefined) updateData.state = input.state.toUpperCase();
    if (input.zipcode !== undefined) updateData.zipcode = input.zipcode;
    if (input.latitude !== undefined) updateData.latitude = input.latitude;
    if (input.longitude !== undefined) updateData.longitude = input.longitude;
    if (input.total_sf !== undefined) updateData.total_sf = input.total_sf;
    if (input.available_sf !== undefined) updateData.available_sf = input.available_sf;
    if (input.min_divisible_sf !== undefined) updateData.min_divisible_sf = input.min_divisible_sf;
    if (input.asking_rent_sf !== undefined) updateData.asking_rent_sf = input.asking_rent_sf;
    if (input.lease_type !== undefined) updateData.lease_type = input.lease_type;
    if (input.available_date !== undefined) updateData.available_date = input.available_date;
    if (input.features !== undefined) updateData.features = input.features;
    if (input.amenities !== undefined) updateData.amenities = input.amenities;
    if (input.gsa_eligible !== undefined) updateData.gsa_eligible = input.gsa_eligible;
    if (input.set_aside_eligible !== undefined) updateData.set_aside_eligible = input.set_aside_eligible;
    if (input.images !== undefined) updateData.images = input.images;

    if (coordsChanged) {
      updateData.federal_score = federalScore;
      updateData.federal_score_data = federalScoreData;
    }

    // Update listing
    const { data, error } = await supabase
      .from('broker_listings')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating broker listing:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to update broker listing'
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error in PATCH /api/broker-listings/[id]:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/broker-listings/[id]
 * Delete a broker listing
 * Only the owner can delete
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

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

    // Check ownership
    const { data: existing, error: fetchError } = await supabase
      .from('broker_listings')
      .select('user_id')
      .eq('id', id)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json(
        {
          success: false,
          error: 'Listing not found'
        },
        { status: 404 }
      );
    }

    if (existing.user_id !== user.id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized: You can only delete your own listings'
        },
        { status: 403 }
      );
    }

    // Delete listing
    const { error } = await supabase
      .from('broker_listings')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting broker listing:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to delete broker listing'
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { id }
    });
  } catch (error) {
    console.error('Error in DELETE /api/broker-listings/[id]:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}
