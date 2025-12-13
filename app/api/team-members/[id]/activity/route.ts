import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify team member belongs to user
    const { data: teamMember } = await supabase
      .from("team_members")
      .select("id")
      .eq("id", id)
      .eq("owner_id", user.id)
      .single();

    if (!teamMember) {
      return NextResponse.json(
        { error: "Team member not found" },
        { status: 404 }
      );
    }

    // Fetch activity logs
    const { data: activities, error } = await supabase
      .from("team_activity_log")
      .select("*")
      .eq("team_member_id", id)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("Error fetching activity logs:", error);
      return NextResponse.json(
        { error: "Failed to fetch activity logs" },
        { status: 500 }
      );
    }

    return NextResponse.json({ activities });
  } catch (error) {
    console.error("Activity API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
