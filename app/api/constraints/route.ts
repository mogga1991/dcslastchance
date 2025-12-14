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

    // Fetch constraints
    const { data: constraints, error } = await supabase
      .from("constraints_policies")
      .select("*")
      .eq("org_id", user.id)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Error fetching constraints:", error);
      return NextResponse.json(
        { error: "Failed to fetch constraints" },
        { status: 500 }
      );
    }

    return NextResponse.json({ constraints: constraints || null });
  } catch (error) {
    console.error("Constraints API error:", error);
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

    // Check if constraints exist
    const { data: existing } = await supabase
      .from("constraints_policies")
      .select("id")
      .eq("org_id", user.id)
      .single();

    let result;
    if (existing) {
      // Update existing constraints
      const { data, error } = await supabase
        .from("constraints_policies")
        .update({
          ...body,
          org_id: user.id,
        })
        .eq("org_id", user.id)
        .select()
        .single();

      if (error) {
        console.error("Error updating constraints:", error);
        return NextResponse.json(
          { error: "Failed to update constraints" },
          { status: 500 }
        );
      }
      result = data;
    } else {
      // Create new constraints
      const { data, error } = await supabase
        .from("constraints_policies")
        .insert({
          ...body,
          org_id: user.id,
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating constraints:", error);
        return NextResponse.json(
          { error: "Failed to create constraints" },
          { status: 500 }
        );
      }
      result = data;
    }

    return NextResponse.json({ constraints: result });
  } catch (error) {
    console.error("Constraints API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
