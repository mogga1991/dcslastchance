import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkQualification } from "@/lib/qualification-matcher";
import type { CompanyProfile } from "@/types/company-profile";
import type { SAMOpportunity } from "@/types/sam";

/**
 * POST /api/qualification-check
 * Check if user's company qualifies for an opportunity
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

    const body = await request.json();
    const { opportunity } = body as { opportunity: SAMOpportunity };

    if (!opportunity) {
      return NextResponse.json(
        { error: "opportunity is required" },
        { status: 400 }
      );
    }

    // Fetch user's company profile
    const { data: profileData, error: profileError } = await supabase
      .from("company_profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (profileError || !profileData) {
      return NextResponse.json(
        {
          error: "No company profile found",
          message: "Please create a company profile in Settings to check qualifications",
          has_profile: false,
        },
        { status: 404 }
      );
    }

    const profile = profileData as CompanyProfile;

    // Run qualification check
    const result = checkQualification(profile, opportunity);

    // Optionally save the check result for analytics
    // (could be added later)

    return NextResponse.json({
      success: true,
      qualification: result,
      profile_name: profile.company_name,
      opportunity_title: opportunity.title,
      opportunity_id: opportunity.noticeId,
    });
  } catch (error) {
    console.error("Error checking qualification:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to check qualification",
      },
      { status: 500 }
    );
  }
}
