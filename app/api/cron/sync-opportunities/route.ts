import { NextRequest, NextResponse } from "next/server";
import postgres from "postgres";

/**
 * POST /api/cron/sync-opportunities
 *
 * Fetches opportunities from SAM.gov and stores them in the database
 * This endpoint is called by Vercel Cron daily
 *
 * Query Parameters:
 * - source: "gsa_leasing" or "all" (default: both)
 * - Authorization header with cron secret for security
 */
export async function POST(request: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = request.nextUrl;
    const source = searchParams.get("source") || "both";

    const results = {
      gsa_leasing: { synced: 0, errors: 0 },
      all: { synced: 0, errors: 0 },
    };

    // Connect to database
    const sql = postgres(process.env.DATABASE_URL!);

    try {
      // Hardcode the correct key for now
      const apiKey = "SAM-1abfb99d-51f0-4024-9fc4-a495a886c1c0";

      // Sync GSA Leasing opportunities
      if (source === "gsa_leasing" || source === "both") {
        console.log("Fetching GSA leasing opportunities...");

        // Build GSA leasing query
        const today = new Date();
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(today.getDate() - 90);

        const formatDate = (date: Date) => {
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          const year = date.getFullYear();
          return `${month}/${day}/${year}`;
        };

        const gsaUrl = new URL("https://api.sam.gov/opportunities/v2/search");
        gsaUrl.searchParams.set("api_key", apiKey);
        gsaUrl.searchParams.set("limit", "100");
        gsaUrl.searchParams.set("postedFrom", formatDate(ninetyDaysAgo));
        gsaUrl.searchParams.set("postedTo", formatDate(today));
        gsaUrl.searchParams.set("deptname", "General Services Administration");
        gsaUrl.searchParams.set("subtier", "Public Buildings Service");
        gsaUrl.searchParams.set("ncode", "531120");

        console.log("API Key being used:", apiKey);
        console.log("Fetching URL:", gsaUrl.toString());

        const gsaResponse = await fetch(gsaUrl.toString());

        if (!gsaResponse.ok) {
          const errorText = await gsaResponse.text();
          throw new Error(`SAM.gov API error: ${gsaResponse.status} - ${errorText}`);
        }

        const gsaData = await gsaResponse.json();

        for (const opp of gsaData.opportunitiesData || []) {
          try {
            await upsertOpportunity(sql, opp, "gsa_leasing");
            results.gsa_leasing.synced++;
          } catch (error) {
            console.error(`Error upserting GSA opportunity ${opp.noticeId}:`, error);
            results.gsa_leasing.errors++;
          }
        }
      }

      // Sync all opportunities
      if (source === "all" || source === "both") {
        console.log("Fetching all opportunities...");

        const today = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(today.getDate() - 30);

        const formatDate = (date: Date) => {
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          const year = date.getFullYear();
          return `${month}/${day}/${year}`;
        };

        const allUrl = new URL("https://api.sam.gov/opportunities/v2/search");
        allUrl.searchParams.set("api_key", apiKey);
        allUrl.searchParams.set("limit", "100");
        allUrl.searchParams.set("postedFrom", formatDate(thirtyDaysAgo));
        allUrl.searchParams.set("postedTo", formatDate(today));

        const allResponse = await fetch(allUrl.toString());

        if (!allResponse.ok) {
          const errorText = await allResponse.text();
          throw new Error(`SAM.gov API error: ${allResponse.status} - ${errorText}`);
        }

        const allData = await allResponse.json();

        for (const opp of allData.opportunitiesData || []) {
          try {
            await upsertOpportunity(sql, opp, "all");
            results.all.synced++;
          } catch (error) {
            console.error(`Error upserting opportunity ${opp.noticeId}:`, error);
            results.all.errors++;
          }
        }
      }

      // Clean up old opportunities (archive after 90 days past deadline)
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

      await sql`
        DELETE FROM opportunities
        WHERE response_deadline < ${ninetyDaysAgo.toISOString()}
      `;

      await sql.end();

      return NextResponse.json(
        {
          success: true,
          results,
          message: "Opportunities synced successfully",
        },
        { status: 200 }
      );
    } catch (error) {
      await sql.end();
      throw error;
    }
  } catch (error) {
    console.error("Cron sync error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to sync opportunities",
      },
      { status: 500 }
    );
  }
}

/**
 * Upserts an opportunity into the database
 */
async function upsertOpportunity(
  sql: any,
  opp: SAMOpportunity,
  source: string
) {
  await sql`
    INSERT INTO opportunities (
      notice_id,
      title,
      solicitation_number,
      department,
      sub_tier,
      office,
      posted_date,
      type,
      base_type,
      archive_type,
      archive_date,
      type_of_set_aside,
      type_of_set_aside_description,
      response_deadline,
      naics_code,
      classification_code,
      active,
      description,
      organization_type,
      office_zipcode,
      office_city,
      office_country_code,
      office_state,
      pop_street_address,
      pop_city_code,
      pop_city_name,
      pop_state_code,
      pop_state_name,
      pop_zip,
      pop_country_code,
      pop_country_name,
      additional_info_link,
      ui_link,
      full_data,
      source,
      last_synced_at
    ) VALUES (
      ${opp.noticeId},
      ${opp.title},
      ${opp.solicitationNumber || null},
      ${opp.department || null},
      ${opp.subTier || null},
      ${opp.office || null},
      ${opp.postedDate ? new Date(opp.postedDate).toISOString() : null},
      ${opp.type || null},
      ${opp.baseType || null},
      ${opp.archiveType || null},
      ${opp.archiveDate ? new Date(opp.archiveDate).toISOString() : null},
      ${opp.typeOfSetAside || null},
      ${opp.typeOfSetAsideDescription || null},
      ${opp.responseDeadLine ? new Date(opp.responseDeadLine).toISOString() : null},
      ${opp.naicsCode || null},
      ${opp.classificationCode || null},
      ${opp.active || null},
      ${opp.description || null},
      ${opp.organizationType || null},
      ${opp.officeAddress?.zipcode || null},
      ${opp.officeAddress?.city || null},
      ${opp.officeAddress?.countryCode || null},
      ${opp.officeAddress?.state || null},
      ${opp.placeOfPerformance?.streetAddress || null},
      ${opp.placeOfPerformance?.city?.code || null},
      ${opp.placeOfPerformance?.city?.name || null},
      ${opp.placeOfPerformance?.state?.code || null},
      ${opp.placeOfPerformance?.state?.name || null},
      ${opp.placeOfPerformance?.zip || null},
      ${opp.placeOfPerformance?.country?.code || null},
      ${opp.placeOfPerformance?.country?.name || null},
      ${opp.additionalInfoLink || null},
      ${opp.uiLink || null},
      ${JSON.stringify(opp)},
      ${source},
      NOW()
    )
    ON CONFLICT (notice_id)
    DO UPDATE SET
      title = EXCLUDED.title,
      solicitation_number = EXCLUDED.solicitation_number,
      department = EXCLUDED.department,
      sub_tier = EXCLUDED.sub_tier,
      office = EXCLUDED.office,
      posted_date = EXCLUDED.posted_date,
      type = EXCLUDED.type,
      base_type = EXCLUDED.base_type,
      archive_type = EXCLUDED.archive_type,
      archive_date = EXCLUDED.archive_date,
      type_of_set_aside = EXCLUDED.type_of_set_aside,
      type_of_set_aside_description = EXCLUDED.type_of_set_aside_description,
      response_deadline = EXCLUDED.response_deadline,
      naics_code = EXCLUDED.naics_code,
      classification_code = EXCLUDED.classification_code,
      active = EXCLUDED.active,
      description = EXCLUDED.description,
      organization_type = EXCLUDED.organization_type,
      office_zipcode = EXCLUDED.office_zipcode,
      office_city = EXCLUDED.office_city,
      office_country_code = EXCLUDED.office_country_code,
      office_state = EXCLUDED.office_state,
      pop_street_address = EXCLUDED.pop_street_address,
      pop_city_code = EXCLUDED.pop_city_code,
      pop_city_name = EXCLUDED.pop_city_name,
      pop_state_code = EXCLUDED.pop_state_code,
      pop_state_name = EXCLUDED.pop_state_name,
      pop_zip = EXCLUDED.pop_zip,
      pop_country_code = EXCLUDED.pop_country_code,
      pop_country_name = EXCLUDED.pop_country_name,
      additional_info_link = EXCLUDED.additional_info_link,
      ui_link = EXCLUDED.ui_link,
      full_data = EXCLUDED.full_data,
      source = EXCLUDED.source,
      last_synced_at = NOW()
  `;
}

// Allow GET for manual testing (remove in production)
export async function GET(request: NextRequest) {
  return POST(request);
}
