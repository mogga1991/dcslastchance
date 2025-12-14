import { NextRequest, NextResponse } from "next/server";
import { fetchGSALeaseOpportunities } from "@/lib/sam-gov";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Extract query parameters
    const limit = parseInt(searchParams.get("limit") || "100");
    const offset = parseInt(searchParams.get("offset") || "0");
    const postedFrom = searchParams.get("postedFrom") || undefined;
    const postedTo = searchParams.get("postedTo") || undefined;
    const state = searchParams.get("state") || undefined;
    const city = searchParams.get("city") || undefined;

    // Fetch GSA lease opportunities from SAM.gov using official GSA filters
    const data = await fetchGSALeaseOpportunities({
      limit,
      offset,
      postedFrom,
      postedTo,
      state,
      city,
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching GSA lease opportunities:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch GSA lease opportunities" },
      { status: 500 }
    );
  }
}
