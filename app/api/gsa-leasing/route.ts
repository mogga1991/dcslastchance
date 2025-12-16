import { NextRequest, NextResponse } from "next/server";
import { fetchGSALeaseOpportunities, fetchOpportunitiesByKeyword, SAMOpportunity } from "@/lib/sam-gov";

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

    // First, try to fetch GSA-specific lease opportunities
    const gsaData = await fetchGSALeaseOpportunities({
      limit,
      offset,
      postedFrom,
      postedTo,
      state,
      city,
    });

    // If we got enough GSA results, return them
    if (gsaData.opportunitiesData && gsaData.opportunitiesData.length >= 10) {
      return NextResponse.json(gsaData);
    }

    // Otherwise, also search for broader "lease" opportunities and combine
    try {
      const leaseKeywordData = await fetchOpportunitiesByKeyword("lease", {
        limit: Math.max(limit - (gsaData.opportunitiesData?.length || 0), 50),
        offset: 0,
        postedFrom,
        postedTo,
        state,
        city,
      });

      // Combine and deduplicate by noticeId
      const allOpportunities: SAMOpportunity[] = [
        ...(gsaData.opportunitiesData || []),
      ];

      const existingIds = new Set(allOpportunities.map(o => o.noticeId));

      for (const opp of (leaseKeywordData.opportunitiesData || [])) {
        if (!existingIds.has(opp.noticeId)) {
          allOpportunities.push(opp);
          existingIds.add(opp.noticeId);
        }
      }

      // Sort by posted date (newest first)
      allOpportunities.sort((a, b) => {
        const aDate = a.postedDate ? new Date(a.postedDate).getTime() : 0;
        const bDate = b.postedDate ? new Date(b.postedDate).getTime() : 0;
        return bDate - aDate;
      });

      return NextResponse.json({
        totalRecords: allOpportunities.length,
        limit,
        offset,
        opportunitiesData: allOpportunities.slice(0, limit),
      });
    } catch (keywordError) {
      // If keyword search fails, return the GSA results we have
      console.error("Keyword search failed, returning GSA results:", keywordError);
      return NextResponse.json(gsaData);
    }
  } catch (error) {
    console.error("Error fetching GSA lease opportunities:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch GSA lease opportunities" },
      { status: 500 }
    );
  }
}
