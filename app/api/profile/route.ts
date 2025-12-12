import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  getCompanyProfile,
  createCompanyProfile,
  updateCompanyProfile,
} from "@/lib/services";

// GET /api/profile - Get user's company profile
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
      company_name: body.company_name,
      naics_codes: body.naics_codes || [],
      set_asides: body.set_asides || [],
      core_capabilities: body.core_capabilities || [],
      past_performance: body.past_performance || "",
      security_clearances: body.security_clearances || [],
      certifications: body.certifications || [],
      geographic_focus: body.geographic_focus || [],
      contract_value_range: body.contract_value_range || { min: 0, max: 0 },
      preferred_agencies: body.preferred_agencies || [],
      team_size: body.team_size || 0,
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
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
