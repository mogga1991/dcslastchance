import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { transformDBToOpportunity } from "@/lib/sync-opportunities";

/**
 * Fetch GSA lease opportunities from database (cached from SAM.gov)
 *
 * This endpoint reads from the local database which is synced 2x per week
 * from SAM.gov, providing much faster response times (~100ms vs 4.5s)
 *
 * Uses service role key to bypass RLS since opportunities are public data
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Use service role client to bypass RLS for public opportunities data
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Extract query parameters
    const limit = Math.min(parseInt(searchParams.get("limit") || "1000"), 1000);
    const offset = parseInt(searchParams.get("offset") || "0");
    const state = searchParams.get("state") || undefined;
    const city = searchParams.get("city") || undefined;

    // Build query
    let query = supabase
      .from("opportunities")
      .select("*", { count: "exact" })
      .eq("source", "gsa_leasing")
      .order("posted_date", { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (state) {
      query = query.eq("pop_state_code", state);
    }
    if (city) {
      query = query.ilike("pop_city_name", `%${city}%`);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error("Database error:", error);
      throw error;
    }

    // Transform database records to SAMOpportunity format
    const opportunities = (data || []).map(transformDBToOpportunity);

    return NextResponse.json({
      totalRecords: count || 0,
      limit,
      offset,
      opportunitiesData: opportunities,
    });
  } catch (error) {
    console.error("Error fetching GSA lease opportunities:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch GSA lease opportunities" },
      { status: 500 }
    );
  }
}
