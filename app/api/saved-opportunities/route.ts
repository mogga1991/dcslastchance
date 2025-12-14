import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { CreateSavedOpportunityInput, SavedOpportunity } from "@/types/saved-opportunity";

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

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");

    // Build query
    let query = supabase
      .from("saved_opportunities")
      .select("*")
      .eq("user_id", user.id)
      .order("saved_at", { ascending: false });

    // Apply status filter if provided
    if (status) {
      query = query.eq("status", status);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json(data as SavedOpportunity[]);
  } catch (error) {
    console.error("Error fetching saved opportunities:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch saved opportunities" },
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

    const body: CreateSavedOpportunityInput = await request.json();

    // Create saved opportunity
    const { data, error } = await supabase
      .from("saved_opportunities")
      .insert({
        user_id: user.id,
        notice_id: body.notice_id,
        opportunity_data: body.opportunity_data,
        notes: body.notes || null,
      })
      .select()
      .single();

    if (error) {
      // Check for unique constraint violation
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "Opportunity already saved" },
          { status: 409 }
        );
      }
      throw error;
    }

    return NextResponse.json(data as SavedOpportunity, { status: 201 });
  } catch (error) {
    console.error("Error saving opportunity:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to save opportunity" },
      { status: 500 }
    );
  }
}
