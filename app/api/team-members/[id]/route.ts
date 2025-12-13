import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
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

    const body = await request.json();
    const { full_name, email, role, phone, status } = body;

    // Build update object
    const updates: any = {};
    if (full_name !== undefined) updates.full_name = full_name;
    if (email !== undefined) updates.email = email;
    if (role !== undefined) {
      const validRoles = ["broker", "realtor", "salesman", "owner"];
      if (!validRoles.includes(role)) {
        return NextResponse.json({ error: "Invalid role" }, { status: 400 });
      }
      updates.role = role;
    }
    if (phone !== undefined) updates.phone = phone;
    if (status !== undefined) {
      const validStatuses = ["active", "inactive", "pending"];
      if (!validStatuses.includes(status)) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
      }
      updates.status = status;
    }

    // Update team member
    const { data: teamMember, error } = await supabase
      .from("team_members")
      .update(updates)
      .eq("id", id)
      .eq("owner_id", user.id)
      .select()
      .single();

    if (error) {
      console.error("Error updating team member:", error);
      return NextResponse.json(
        { error: "Failed to update team member" },
        { status: 500 }
      );
    }

    if (!teamMember) {
      return NextResponse.json(
        { error: "Team member not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ teamMember });
  } catch (error) {
    console.error("Team member update API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    // Delete team member
    const { error } = await supabase
      .from("team_members")
      .delete()
      .eq("id", id)
      .eq("owner_id", user.id);

    if (error) {
      console.error("Error deleting team member:", error);
      return NextResponse.json(
        { error: "Failed to delete team member" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Team member delete API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

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

    // Fetch team member with earnings
    const { data: teamMember, error } = await supabase
      .from("team_members")
      .select(
        `
        *,
        team_earnings (
          id,
          deal_name,
          amount,
          commission_percentage,
          status,
          completed_at,
          created_at
        )
      `
      )
      .eq("id", id)
      .eq("owner_id", user.id)
      .single();

    if (error) {
      console.error("Error fetching team member:", error);
      return NextResponse.json(
        { error: "Failed to fetch team member" },
        { status: 500 }
      );
    }

    if (!teamMember) {
      return NextResponse.json(
        { error: "Team member not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ teamMember });
  } catch (error) {
    console.error("Team member API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
