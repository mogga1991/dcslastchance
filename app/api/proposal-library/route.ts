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

    // Fetch proposal library items
    const { data: items, error } = await supabase
      .from("proposal_library_items")
      .select("*")
      .eq("org_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching proposal library:", error);
      return NextResponse.json(
        { error: "Failed to fetch proposal library" },
        { status: 500 }
      );
    }

    return NextResponse.json({ items });
  } catch (error) {
    console.error("Proposal library API error:", error);
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
    if (!body.category || !body.title || !body.content_rich_text) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate category
    const validCategories = [
      "company_overview",
      "management_approach",
      "qc_plan",
      "staffing_plan",
      "transition_plan",
      "past_performance_narrative",
      "safety_excerpt",
      "cyber_narrative",
      "other",
    ];

    if (!validCategories.includes(body.category)) {
      return NextResponse.json(
        { error: "Invalid category" },
        { status: 400 }
      );
    }

    // Create proposal library item
    const { data: item, error } = await supabase
      .from("proposal_library_items")
      .insert({
        ...body,
        org_id: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating proposal library item:", error);
      return NextResponse.json(
        { error: "Failed to create proposal library item" },
        { status: 500 }
      );
    }

    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    console.error("Proposal library API error:", error);
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
      return NextResponse.json({ error: "Missing item ID" }, { status: 400 });
    }

    // Update proposal library item
    const { data: item, error } = await supabase
      .from("proposal_library_items")
      .update(updateData)
      .eq("id", id)
      .eq("org_id", user.id)
      .select()
      .single();

    if (error) {
      console.error("Error updating proposal library item:", error);
      return NextResponse.json(
        { error: "Failed to update proposal library item" },
        { status: 500 }
      );
    }

    return NextResponse.json({ item });
  } catch (error) {
    console.error("Proposal library API error:", error);
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
      return NextResponse.json({ error: "Missing item ID" }, { status: 400 });
    }

    // Delete proposal library item
    const { error } = await supabase
      .from("proposal_library_items")
      .delete()
      .eq("id", id)
      .eq("org_id", user.id);

    if (error) {
      console.error("Error deleting proposal library item:", error);
      return NextResponse.json(
        { error: "Failed to delete proposal library item" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Proposal library API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
