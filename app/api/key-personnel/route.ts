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

    // Fetch key personnel
    const { data: personnel, error } = await supabase
      .from("key_personnel")
      .select("*")
      .eq("org_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching key personnel:", error);
      return NextResponse.json(
        { error: "Failed to fetch key personnel" },
        { status: 500 }
      );
    }

    return NextResponse.json({ personnel });
  } catch (error) {
    console.error("Key personnel API error:", error);
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
    if (!body.name || !body.role) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create key personnel
    const { data: person, error } = await supabase
      .from("key_personnel")
      .insert({
        ...body,
        org_id: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating key personnel:", error);
      return NextResponse.json(
        { error: "Failed to create key personnel" },
        { status: 500 }
      );
    }

    return NextResponse.json({ person }, { status: 201 });
  } catch (error) {
    console.error("Key personnel API error:", error);
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
        { error: "Missing personnel ID" },
        { status: 400 }
      );
    }

    // Update key personnel
    const { data: person, error } = await supabase
      .from("key_personnel")
      .update(updateData)
      .eq("id", id)
      .eq("org_id", user.id)
      .select()
      .single();

    if (error) {
      console.error("Error updating key personnel:", error);
      return NextResponse.json(
        { error: "Failed to update key personnel" },
        { status: 500 }
      );
    }

    return NextResponse.json({ person });
  } catch (error) {
    console.error("Key personnel API error:", error);
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
        { error: "Missing personnel ID" },
        { status: 400 }
      );
    }

    // Delete key personnel
    const { error } = await supabase
      .from("key_personnel")
      .delete()
      .eq("id", id)
      .eq("org_id", user.id);

    if (error) {
      console.error("Error deleting key personnel:", error);
      return NextResponse.json(
        { error: "Failed to delete key personnel" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Key personnel API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
