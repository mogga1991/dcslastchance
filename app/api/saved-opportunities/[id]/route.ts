import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { UpdateSavedOpportunityInput, SavedOpportunity } from "@/types/saved-opportunity";

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

    const { data, error } = await supabase
      .from("saved_opportunities")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Opportunity not found" }, { status: 404 });
      }
      throw error;
    }

    return NextResponse.json(data as SavedOpportunity);
  } catch (error) {
    console.error("Error fetching saved opportunity:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch saved opportunity" },
      { status: 500 }
    );
  }
}

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

    const body: UpdateSavedOpportunityInput = await request.json();

    const { data, error } = await supabase
      .from("saved_opportunities")
      .update(body)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Opportunity not found" }, { status: 404 });
      }
      throw error;
    }

    return NextResponse.json(data as SavedOpportunity);
  } catch (error) {
    console.error("Error updating saved opportunity:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update saved opportunity" },
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

    const { error } = await supabase
      .from("saved_opportunities")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting saved opportunity:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete saved opportunity" },
      { status: 500 }
    );
  }
}
