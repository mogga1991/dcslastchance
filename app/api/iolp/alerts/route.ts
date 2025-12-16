import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/iolp/alerts
 * Get all lease expiration alerts for the authenticated user
 */
export async function GET() {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Fetch alerts
    const { data: alerts, error } = await supabase
      .from('lease_expiration_alerts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching alerts:', error);
      return NextResponse.json(
        { error: 'Failed to fetch alerts' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      alerts: alerts || []
    });
  } catch (error) {
    console.error("Error in GET /api/iolp/alerts:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/iolp/alerts
 * Create a new lease expiration alert
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      location_code,
      building_name,
      address,
      city,
      state,
      lease_expiration_date,
      building_rsf,
      agency_abbr,
      latitude,
      longitude
    } = body;

    if (!location_code) {
      return NextResponse.json(
        { error: "location_code is required" },
        { status: 400 }
      );
    }

    // Check if alert already exists for this property
    const { data: existing } = await supabase
      .from('lease_expiration_alerts')
      .select('id')
      .eq('user_id', user.id)
      .eq('location_code', location_code)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "Alert already exists for this property" },
        { status: 409 }
      );
    }

    // Create alert
    const { data: alert, error } = await supabase
      .from('lease_expiration_alerts')
      .insert({
        user_id: user.id,
        location_code,
        building_name,
        address,
        city,
        state,
        lease_expiration_date,
        building_rsf,
        agency_abbr,
        latitude,
        longitude,
        is_active: true
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating alert:', error);
      return NextResponse.json(
        { error: 'Failed to create alert' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      alert
    });
  } catch (error) {
    console.error("Error in POST /api/iolp/alerts:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/iolp/alerts
 * Delete a lease expiration alert
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { searchParams } = request.nextUrl;
    const alertId = searchParams.get('id');
    const locationCode = searchParams.get('location_code');

    if (!alertId && !locationCode) {
      return NextResponse.json(
        { error: "id or location_code is required" },
        { status: 400 }
      );
    }

    // Delete alert
    let query = supabase
      .from('lease_expiration_alerts')
      .delete()
      .eq('user_id', user.id);

    if (alertId) {
      query = query.eq('id', alertId);
    } else if (locationCode) {
      query = query.eq('location_code', locationCode);
    }

    const { error } = await query;

    if (error) {
      console.error('Error deleting alert:', error);
      return NextResponse.json(
        { error: 'Failed to delete alert' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true
    });
  } catch (error) {
    console.error("Error in DELETE /api/iolp/alerts:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
