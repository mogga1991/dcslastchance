import { NextRequest, NextResponse } from "next/server";
import { fetchGSALeaseOpportunities } from "@/lib/sam-gov";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const offset = parseInt(searchParams.get("offset") || "0");
    const limit = parseInt(searchParams.get("limit") || "100");
    const state = searchParams.get("state") || undefined;
    const city = searchParams.get("city") || undefined;

    // Use the properly implemented fetchGSALeaseOpportunities function
    const data = await fetchGSALeaseOpportunities({
      limit,
      offset,
      state,
      city,
    });

    // Transform the data to include only relevant fields
    const opportunities = data.opportunitiesData?.map((opp) => ({
      id: opp.noticeId,
      title: opp.title,
      solicitationNumber: opp.solicitationNumber,
      department: opp.department,
      agency: opp.subTier || opp.office,
      postedDate: opp.postedDate,
      responseDeadline: opp.responseDeadLine,
      type: opp.type,
      description: opp.description,
      placeOfPerformance: {
        city: opp.placeOfPerformance?.city?.name,
        state: opp.placeOfPerformance?.state?.name,
        zip: opp.placeOfPerformance?.zip,
        country: opp.placeOfPerformance?.country?.name,
      },
      naicsCode: opp.naicsCode,
      classificationCode: opp.classificationCode,
      active: opp.active,
      award: opp.award,
      pointOfContact: opp.pointOfContact,
      links: opp.links,
      uiLink: opp.uiLink,
    })) || [];

    return NextResponse.json({
      opportunities,
      totalRecords: data.totalRecords || 0,
      offset: offset,
      limit: limit,
    });
  } catch (error) {
    console.error("Error fetching GSA opportunities:", error);
    return NextResponse.json(
      { error: "Failed to fetch opportunities" },
      { status: 500 }
    );
  }
}
