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

    // Call the database function to get completeness
    const { data, error } = await supabase.rpc(
      "get_contractor_profile_completeness",
      {
        user_org_id: user.id,
      }
    );

    if (error) {
      console.error("Error fetching profile completeness:", error);
      return NextResponse.json(
        { error: "Failed to fetch profile completeness" },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Completeness API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
