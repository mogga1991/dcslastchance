import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

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

    // Fetch contractor profile
    const { data: profile, error } = await supabase
      .from("contractor_profiles")
      .select("*")
      .eq("org_id", user.id)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 is "not found" error
      console.error("Error fetching contractor profile:", error);
      return NextResponse.json(
        { error: "Failed to fetch contractor profile" },
        { status: 500 }
      );
    }

    return NextResponse.json({ profile: profile || null });
  } catch (error) {
    console.error("Contractor profile API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
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

    // Check if profile exists
    const { data: existing } = await supabase
      .from("contractor_profiles")
      .select("id")
      .eq("org_id", user.id)
      .single();

    let result;
    if (existing) {
      // Update existing profile
      const { data, error } = await supabase
        .from("contractor_profiles")
        .update({
          ...body,
          org_id: user.id, // Ensure org_id doesn't change
        })
        .eq("org_id", user.id)
        .select()
        .single();

      if (error) {
        console.error("Error updating contractor profile:", error);
        return NextResponse.json(
          { error: "Failed to update contractor profile" },
          { status: 500 }
        );
      }
      result = data;
    } else {
      // Create new profile
      const { data, error } = await supabase
        .from("contractor_profiles")
        .insert({
          ...body,
          org_id: user.id,
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating contractor profile:", error);
        return NextResponse.json(
          { error: "Failed to create contractor profile" },
          { status: 500 }
        );
      }
      result = data;
    }

    return NextResponse.json({ profile: result });
  } catch (error) {
    console.error("Contractor profile API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
