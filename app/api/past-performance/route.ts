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

    // Fetch past performance projects
    const { data: projects, error } = await supabase
      .from("past_performance_projects")
      .select("*")
      .eq("org_id", user.id)
      .order("pop_end", { ascending: false, nullsFirst: false });

    if (error) {
      console.error("Error fetching past performance:", error);
      return NextResponse.json(
        { error: "Failed to fetch past performance" },
        { status: 500 }
      );
    }

    return NextResponse.json({ projects });
  } catch (error) {
    console.error("Past performance API error:", error);
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

    // Validate required fields
    if (!body.customer_name || !body.scope_summary) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create past performance project
    const { data: project, error } = await supabase
      .from("past_performance_projects")
      .insert({
        ...body,
        org_id: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating past performance project:", error);
      return NextResponse.json(
        { error: "Failed to create past performance project" },
        { status: 500 }
      );
    }

    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    console.error("Past performance API error:", error);
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
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Missing project ID" },
        { status: 400 }
      );
    }

    // Update past performance project
    const { data: project, error } = await supabase
      .from("past_performance_projects")
      .update(updateData)
      .eq("id", id)
      .eq("org_id", user.id)
      .select()
      .single();

    if (error) {
      console.error("Error updating past performance project:", error);
      return NextResponse.json(
        { error: "Failed to update past performance project" },
        { status: 500 }
      );
    }

    return NextResponse.json({ project });
  } catch (error) {
    console.error("Past performance API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

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

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Missing project ID" },
        { status: 400 }
      );
    }

    // Delete past performance project
    const { error } = await supabase
      .from("past_performance_projects")
      .delete()
      .eq("id", id)
      .eq("org_id", user.id);

    if (error) {
      console.error("Error deleting past performance project:", error);
      return NextResponse.json(
        { error: "Failed to delete past performance project" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Past performance API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
