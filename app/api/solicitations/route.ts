import { NextRequest, NextResponse } from "next/server";
import { fetchAllOpportunities } from "@/lib/sam-gov";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Extract query parameters
    const limit = parseInt(searchParams.get("limit") || "25");
    const offset = parseInt(searchParams.get("offset") || "0");
    const postedFrom = searchParams.get("postedFrom") || undefined;
    const postedTo = searchParams.get("postedTo") || undefined;
    const state = searchParams.get("state") || undefined;
    const city = searchParams.get("city") || undefined;
    const department = searchParams.get("department") || undefined;
    const noticeTypesParam = searchParams.get("noticeTypes");
    const noticeTypes = noticeTypesParam ? noticeTypesParam.split(",") : undefined;

    // Fetch opportunities from SAM.gov
    const data = await fetchAllOpportunities({
      limit,
      offset,
      postedFrom,
      postedTo,
      state,
      city,
      department,
      noticeTypes,
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching solicitations:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch solicitations" },
      { status: 500 }
    );
  }
}
