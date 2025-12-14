import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type {
  CompanyProfile,
  CreateCompanyProfileInput,
  UpdateCompanyProfileInput,
} from "@/types/company-profile";

/**
 * GET /api/company-profile
 * Fetch the current user's company profile
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch company profile
    const { data, error } = await supabase
      .from("company_profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (error) {
      // User doesn't have a profile yet
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "No company profile found", has_profile: false },
          { status: 404 }
        );
      }
      throw error;
    }

    return NextResponse.json({ profile: data as CompanyProfile, has_profile: true });
  } catch (error) {
    console.error("Error fetching company profile:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch company profile" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/company-profile
 * Create a new company profile for the current user
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: CreateCompanyProfileInput = await request.json();

    // Validate required fields
    if (!body.company_name) {
      return NextResponse.json(
        { error: "company_name is required" },
        { status: 400 }
      );
    }

    // Validate primary NAICS format if provided
    if (body.primary_naics && !/^\d{6}$/.test(body.primary_naics)) {
      return NextResponse.json(
        { error: "primary_naics must be a 6-digit code" },
        { status: 400 }
      );
    }

    // Create company profile
    const { data, error } = await supabase
      .from("company_profiles")
      .insert({
        user_id: user.id,
        company_name: body.company_name,
        primary_naics: body.primary_naics || null,
        duns_number: body.duns_number || null,
        uei_number: body.uei_number || null,
        cage_code: body.cage_code || null,
        business_types: body.business_types || [],
        set_aside_certifications: body.set_aside_certifications || [],
        naics_codes: body.naics_codes || [],
        years_in_business: body.years_in_business || null,
        federal_experience_years: body.federal_experience_years || null,
        clearance_level: body.clearance_level || null,
        geographic_coverage: body.geographic_coverage || [],
        employee_count: body.employee_count || null,
      })
      .select()
      .single();

    if (error) {
      // Check for unique constraint violation (user already has a profile)
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "Company profile already exists. Use PATCH to update." },
          { status: 409 }
        );
      }
      throw error;
    }

    return NextResponse.json(
      { profile: data as CompanyProfile, message: "Company profile created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating company profile:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create company profile" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/company-profile
 * Update the current user's company profile
 */
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: UpdateCompanyProfileInput = await request.json();

    // Validate primary NAICS format if provided
    if (body.primary_naics && !/^\d{6}$/.test(body.primary_naics)) {
      return NextResponse.json(
        { error: "primary_naics must be a 6-digit code" },
        { status: 400 }
      );
    }

    // Update company profile
    const { data, error } = await supabase
      .from("company_profiles")
      .update(body)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      // User doesn't have a profile
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "No company profile found. Use POST to create one." },
          { status: 404 }
        );
      }
      throw error;
    }

    return NextResponse.json({
      profile: data as CompanyProfile,
      message: "Company profile updated successfully",
    });
  } catch (error) {
    console.error("Error updating company profile:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update company profile" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/company-profile
 * Delete the current user's company profile
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Delete company profile
    const { error } = await supabase
      .from("company_profiles")
      .delete()
      .eq("user_id", user.id);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: "Company profile deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting company profile:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete company profile" },
      { status: 500 }
    );
  }
}
