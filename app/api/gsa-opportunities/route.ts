import { NextRequest, NextResponse } from "next/server";

const SAM_API_KEY = "SAM-1abfb99d-51f0-4024-9fc4-a495a886c1c0";
const SAM_API_URL = "https://api.sam.gov/opportunities/v2/search";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const page = searchParams.get("page") || "0";
    const limit = searchParams.get("limit") || "10";

    // Calculate date range (last 90 days to today)
    const today = new Date();
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(today.getDate() - 90);

    const formatDate = (date: Date) => {
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const year = date.getFullYear();
      return `${month}/${day}/${year}`;
    };

    // GSA RLP specific filters - Updated to capture all Real Property Lease opportunities
    const params = new URLSearchParams({
      api_key: SAM_API_KEY,
      postedFrom: formatDate(ninetyDaysAgo),
      postedTo: formatDate(today),

      // GSA Department filters
      deptname: "General Services Administration",
      subtier: "Public Buildings Service",

      // PSC codes for Real Property Leasing (PRIMARY filter for RLP)
      // Y1DA = Lease of Real Estate (Office, Warehouse, etc.)
      // Z2DA = Real Property Leasing (Short Term)
      // Z1DA = Maintenance of Real Property
      // X1AA = Lease/Rental of Office Buildings
      psc: "Y1DA,Z2DA,Z1DA,X1AA",

      // NAICS code as secondary filter
      ncode: "531120", // Lessors of Nonresidential Buildings

      // Notice types - all relevant types
      ptype: "o,p,k,r,s,i,g",

      // Response date filter (opportunities due today or later)
      rdlfrom: new Date().toISOString().split('T')[0],

      // Pagination
      limit: limit,
      offset: page,
    });

    const response = await fetch(`${SAM_API_URL}?${params.toString()}`, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`SAM API error: ${response.status}`);
    }

    const data = await response.json();

    // Transform the data to include only relevant fields
    const opportunities = data.opportunitiesData?.map((opp: any) => ({
      id: opp.noticeId,
      title: opp.title,
      solicitationNumber: opp.solicitationNumber,
      department: opp.department || opp.departmentName,
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
      // Extract location coordinates if available
      location: {
        lat: opp.placeOfPerformance?.latitude,
        lng: opp.placeOfPerformance?.longitude,
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
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (error) {
    console.error("Error fetching GSA opportunities:", error);
    return NextResponse.json(
      { error: "Failed to fetch opportunities" },
      { status: 500 }
    );
  }
}
