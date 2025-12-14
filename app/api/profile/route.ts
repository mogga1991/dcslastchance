import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  getCompanyProfile,
  createCompanyProfile,
  updateCompanyProfile,
} from "@/lib/services";

// GET /api/profile - Get user's company profile
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = user.id;

    const profile = await getCompanyProfile(userId);

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json({ profile });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/profile - Create company profile
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = user.id;

    // Check if profile already exists
    const existingProfile = await getCompanyProfile(userId);
    if (existingProfile) {
      return NextResponse.json(
        { error: "Profile already exists" },
        { status: 400 }
      );
    }

    const body = await request.json();

    const profile = await createCompanyProfile({
      user_id: userId,
      organization_id: body.organization_id,
      naics_codes: body.naics_codes || [],
      primary_naics: body.primary_naics,
      set_asides: body.set_asides || [],
      core_competencies: body.core_competencies || [],
      keywords: body.keywords || [],
      service_areas: body.service_areas || [],
      certifications: body.certifications || [],
      is_small_business: body.is_small_business,
      employee_count: body.employee_count || 0,
      annual_revenue: body.annual_revenue,
      preferred_agencies: body.preferred_agencies || [],
      excluded_agencies: body.excluded_agencies || [],
      min_contract_value: body.min_contract_value || 0,
      max_contract_value: body.max_contract_value || 0,
      preferred_states: body.preferred_states || [],
      remote_work_capable: body.remote_work_capable,
      current_contracts: body.current_contracts || 0,
      max_concurrent_contracts: body.max_concurrent_contracts,
    });

    return NextResponse.json({ profile }, { status: 201 });
  } catch (error) {
    console.error("Error creating profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/profile - Update company profile
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = user.id;

    const body = await request.json();

    const profile = await updateCompanyProfile(userId, body);

    return NextResponse.json({ profile });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
