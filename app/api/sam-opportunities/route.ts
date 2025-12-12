import { NextRequest, NextResponse } from "next/server";
import { fetchGSALeaseOpportunities, fetchOpportunityById } from "@/lib/sam-gov";

/**
 * GET /api/sam-opportunities
 *
 * Fetches GSA lease contract opportunities from SAM.gov
 *
 * Query Parameters:
 * - limit: Number of records to return (default: 100, max: 100)
 * - offset: Pagination offset (default: 0)
 * - state: Filter by state code (e.g., "CA", "TX")
 * - city: Filter by city name
 * - postedFrom: Filter by posted date (YYYY-MM-DD)
 * - postedTo: Filter by posted date (YYYY-MM-DD)
 * - noticeId: Fetch a specific opportunity by ID
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Check if requesting a specific opportunity
    const noticeId = searchParams.get("noticeId");
    if (noticeId) {
      const opportunity = await fetchOpportunityById(noticeId);
      return NextResponse.json(
        {
          success: true,
          data: opportunity,
        },
        { status: 200 }
      );
    }

    // Fetch filtered opportunities
    const limit = Math.min(
      parseInt(searchParams.get("limit") || "100"),
      100
    );
    const offset = parseInt(searchParams.get("offset") || "0");
    const state = searchParams.get("state") || undefined;
    const city = searchParams.get("city") || undefined;
    const postedFrom = searchParams.get("postedFrom") || undefined;
    const postedTo = searchParams.get("postedTo") || undefined;

    const data = await fetchGSALeaseOpportunities({
      limit,
      offset,
      state,
      city,
      postedFrom,
      postedTo,
    });

    return NextResponse.json(
      {
        success: true,
        data: data.opportunitiesData,
        totalRecords: data.totalRecords,
        limit: data.limit,
        offset: data.offset,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      }
    );
  } catch (error) {
    console.error("SAM.gov API error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch opportunities",
      },
      { status: 500 }
    );
  }
}
