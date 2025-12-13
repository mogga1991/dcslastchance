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

    // Fetch team members
    const { data: teamMembers, error } = await supabase
      .from("team_members")
      .select("*")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching team members:", error);
      return NextResponse.json(
        { error: "Failed to fetch team members" },
        { status: 500 }
      );
    }

    return NextResponse.json({ teamMembers });
  } catch (error) {
    console.error("Team members API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

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
    const { full_name, email, role, phone } = body;

    // Validate required fields
    if (!full_name || !email || !role) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate role
    const validRoles = ["broker", "realtor", "salesman", "owner"];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // Check if team member already exists
    const { data: existing } = await supabase
      .from("team_members")
      .select("id")
      .eq("owner_id", user.id)
      .eq("email", email)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "Team member with this email already exists" },
        { status: 409 }
      );
    }

    // Create team member
    const { data: teamMember, error } = await supabase
      .from("team_members")
      .insert({
        owner_id: user.id,
        full_name,
        email,
        role,
        phone,
        status: "active",
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating team member:", error);
      return NextResponse.json(
        { error: "Failed to create team member" },
        { status: 500 }
      );
    }

    return NextResponse.json({ teamMember }, { status: 201 });
  } catch (error) {
    console.error("Team members API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
