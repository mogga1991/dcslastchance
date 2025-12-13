import { NextRequest, NextResponse } from "next/server";
import postgres from "postgres";

/**
 * GET /api/opportunities
 *
 * Fetches opportunities from the database
 *
 * Query Parameters:
 * - source: "gsa_leasing" or "all" (default: "gsa_leasing")
 * - limit: Number of records to return (default: 100, max: 100)
 * - offset: Pagination offset (default: 0)
 * - state: Filter by state code (e.g., "CA", "TX")
 * - search: Search in title, department, or solicitation number
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Get query parameters
    const source = searchParams.get("source") || "gsa_leasing";
    const limit = Math.min(parseInt(searchParams.get("limit") || "100"), 100);
    const offset = parseInt(searchParams.get("offset") || "0");
    const state = searchParams.get("state");
    const search = searchParams.get("search");

    // Connect to database
    const sql = postgres(process.env.DATABASE_URL!);

    try {
      // Build where conditions
      const conditions = [];
      const params: any = {};

      // Filter by source
      if (source !== "all") {
        conditions.push(sql`source = ${source}`);
      }

      // Filter by state
      if (state) {
        conditions.push(sql`pop_state_code = ${state}`);
      }

      // Search filter
      if (search) {
        const searchPattern = `%${search}%`;
        conditions.push(sql`(
          title ILIKE ${searchPattern}
          OR department ILIKE ${searchPattern}
          OR solicitation_number ILIKE ${searchPattern}
        )`);
      }

      // Only show active opportunities with future deadlines
      const today = new Date().toISOString();
      conditions.push(sql`(response_deadline IS NULL OR response_deadline >= ${today})`);

      // Combine all conditions
      const whereClause = conditions.length > 0
        ? sql` WHERE ${sql.unsafe(conditions.map(() => '?').join(' AND '))}`
        : sql``;

      // Fetch opportunities
      let opportunities;
      let count;

      if (conditions.length > 0) {
        // Build combined WHERE conditions
        if (conditions.length === 1) {
          opportunities = await sql`
            SELECT *
            FROM opportunities
            WHERE ${conditions[0]}
            ORDER BY posted_date DESC
            LIMIT ${limit}
            OFFSET ${offset}
          `;

          const result = await sql`
            SELECT COUNT(*) as count
            FROM opportunities
            WHERE ${conditions[0]}
          `;
          count = result[0].count;
        } else if (conditions.length === 2) {
          opportunities = await sql`
            SELECT *
            FROM opportunities
            WHERE ${conditions[0]} AND ${conditions[1]}
            ORDER BY posted_date DESC
            LIMIT ${limit}
            OFFSET ${offset}
          `;

          const result = await sql`
            SELECT COUNT(*) as count
            FROM opportunities
            WHERE ${conditions[0]} AND ${conditions[1]}
          `;
          count = result[0].count;
        } else if (conditions.length === 3) {
          opportunities = await sql`
            SELECT *
            FROM opportunities
            WHERE ${conditions[0]} AND ${conditions[1]} AND ${conditions[2]}
            ORDER BY posted_date DESC
            LIMIT ${limit}
            OFFSET ${offset}
          `;

          const result = await sql`
            SELECT COUNT(*) as count
            FROM opportunities
            WHERE ${conditions[0]} AND ${conditions[1]} AND ${conditions[2]}
          `;
          count = result[0].count;
        }
      } else {
        opportunities = await sql`
          SELECT *
          FROM opportunities
          ORDER BY posted_date DESC
          LIMIT ${limit}
          OFFSET ${offset}
        `;

        const result = await sql`
          SELECT COUNT(*) as count
          FROM opportunities
        `;
        count = result[0].count;
      }

      await sql.end();

      // Transform database records to match SAMOpportunity interface
      const transformedData = opportunities.map((opp: any) => ({
        noticeId: opp.notice_id,
        title: opp.title,
        solicitationNumber: opp.solicitation_number,
        department: opp.department,
        subTier: opp.sub_tier,
        office: opp.office,
        postedDate: opp.posted_date,
        type: opp.type,
        baseType: opp.base_type,
        archiveType: opp.archive_type,
        archiveDate: opp.archive_date,
        typeOfSetAside: opp.type_of_set_aside,
        typeOfSetAsideDescription: opp.type_of_set_aside_description,
        responseDeadLine: opp.response_deadline,
        naicsCode: opp.naics_code,
        classificationCode: opp.classification_code,
        active: opp.active,
        description: opp.description,
        organizationType: opp.organization_type,
        officeAddress: {
          zipcode: opp.office_zipcode,
          city: opp.office_city,
          countryCode: opp.office_country_code,
          state: opp.office_state,
        },
        placeOfPerformance: {
          streetAddress: opp.pop_street_address,
          city: {
            code: opp.pop_city_code,
            name: opp.pop_city_name,
          },
          state: {
            code: opp.pop_state_code,
            name: opp.pop_state_name,
          },
          zip: opp.pop_zip,
          country: {
            code: opp.pop_country_code,
            name: opp.pop_country_name,
          },
        },
        additionalInfoLink: opp.additional_info_link,
        uiLink: opp.ui_link,
        pointOfContact: opp.full_data?.pointOfContact || [],
        links: opp.full_data?.links || [],
        resourceLinks: opp.full_data?.resourceLinks || [],
      }));

      return NextResponse.json(
        {
          success: true,
          data: transformedData,
          totalRecords: parseInt(count),
          limit,
          offset,
        },
        {
          status: 200,
          headers: {
            "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
          },
        }
      );
    } catch (error) {
      await sql.end();
      throw error;
    }
  } catch (error) {
    console.error("Database error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch opportunities",
      },
      { status: 500 }
    );
  }
}
