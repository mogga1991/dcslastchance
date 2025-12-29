/**
 * Sync SAM.gov opportunities to Supabase database
 *
 * This service fetches opportunities from SAM.gov and stores them in the database
 * for faster page loads and reduced API calls.
 */

import { fetchGSALeaseOpportunities, SAMOpportunity } from "./sam-gov";
import { createClient } from "@supabase/supabase-js";

export interface SyncResult {
  success: boolean;
  message: string;
  stats: {
    total: number;
    inserted: number;
    updated: number;
    errors: number;
  };
}

/**
 * Sync opportunities from SAM.gov to database
 */
export async function syncOpportunitiesFromSAM(): Promise<SyncResult> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Missing Supabase credentials");
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const stats = {
    total: 0,
    inserted: 0,
    updated: 0,
    errors: 0,
  };

  try {
    console.log("🔄 Starting SAM.gov opportunities sync...");

    // Fetch all opportunities using pagination
    let allOpportunities: any[] = [];
    let offset = 0;
    const limit = 1000; // SAM.gov max limit per request
    let hasMore = true;

    while (hasMore) {
      console.log(`📥 Fetching opportunities (offset: ${offset})...`);
      const samData = await fetchGSALeaseOpportunities({ limit, offset });

      if (samData.opportunitiesData.length > 0) {
        allOpportunities = allOpportunities.concat(samData.opportunitiesData);
        offset += samData.opportunitiesData.length;

        // Check if there are more results
        hasMore = samData.opportunitiesData.length === limit && offset < samData.totalRecords;

        console.log(`   Got ${samData.opportunitiesData.length} opportunities (total so far: ${allOpportunities.length}/${samData.totalRecords})`);
      } else {
        hasMore = false;
      }
    }

    stats.total = allOpportunities.length;
    console.log(`📥 Fetched ${stats.total} total opportunities from SAM.gov`);

    // Process each opportunity
    for (const opp of allOpportunities) {
      try {
        const dbRecord = transformOpportunityForDB(opp);

        // Upsert (insert or update if exists)
        const { error } = await supabase
          .from("opportunities")
          .upsert(dbRecord, {
            onConflict: "notice_id",
            ignoreDuplicates: false,
          });

        if (error) {
          console.error(`Error upserting opportunity ${opp.noticeId}:`, error);
          stats.errors++;
        } else {
          // Check if it was an insert or update
          const { data: existing } = await supabase
            .from("opportunities")
            .select("created_at, updated_at")
            .eq("notice_id", opp.noticeId)
            .single();

          if (existing && existing.created_at === existing.updated_at) {
            stats.inserted++;
          } else {
            stats.updated++;
          }
        }
      } catch (err) {
        console.error(`Error processing opportunity ${opp.noticeId}:`, err);
        stats.errors++;
      }
    }

    console.log(`✅ Sync completed:`, stats);

    return {
      success: true,
      message: `Synced ${stats.total} opportunities (${stats.inserted} new, ${stats.updated} updated, ${stats.errors} errors)`,
      stats,
    };
  } catch (error) {
    console.error("❌ Sync failed:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error during sync",
      stats,
    };
  }
}

/**
 * Transform SAM.gov opportunity to database record
 */
function transformOpportunityForDB(opp: SAMOpportunity) {
  return {
    notice_id: opp.noticeId,
    title: opp.title,
    solicitation_number: opp.solicitationNumber,
    department: opp.department,
    sub_tier: opp.subTier,
    office: opp.office,
    posted_date: opp.postedDate ? new Date(opp.postedDate).toISOString() : null,
    type: opp.type,
    base_type: opp.baseType,
    archive_type: opp.archiveType,
    archive_date: opp.archiveDate ? new Date(opp.archiveDate).toISOString() : null,
    type_of_set_aside: opp.typeOfSetAside,
    type_of_set_aside_description: opp.typeOfSetAsideDescription,
    response_deadline: opp.responseDeadLine ? new Date(opp.responseDeadLine).toISOString() : null,
    naics_code: opp.naicsCode,
    classification_code: opp.classificationCode,
    active: opp.active,
    description: opp.description,
    organization_type: opp.organizationType,

    // Office Address
    office_zipcode: opp.officeAddress?.zipcode,
    office_city: opp.officeAddress?.city,
    office_country_code: opp.officeAddress?.countryCode,
    office_state: opp.officeAddress?.state,

    // Place of Performance
    pop_street_address: opp.placeOfPerformance?.streetAddress,
    pop_city_code: opp.placeOfPerformance?.city?.code,
    pop_city_name: opp.placeOfPerformance?.city?.name,
    pop_state_code: opp.placeOfPerformance?.state?.code,
    pop_state_name: opp.placeOfPerformance?.state?.name,
    pop_zip: opp.placeOfPerformance?.zip,
    pop_country_code: opp.placeOfPerformance?.country?.code,
    pop_country_name: opp.placeOfPerformance?.country?.name,

    // Links
    additional_info_link: opp.additionalInfoLink,
    ui_link: opp.uiLink,

    // Store full JSON for reference
    full_data: opp,

    // Source
    source: "gsa_leasing",

    // Update sync timestamp
    last_synced_at: new Date().toISOString(),
  };
}

/**
 * Transform database record back to SAMOpportunity format
 */
export function transformDBToOpportunity(dbRecord: any): SAMOpportunity {
  return {
    noticeId: dbRecord.notice_id,
    title: dbRecord.title,
    solicitationNumber: dbRecord.solicitation_number,
    department: dbRecord.department,
    subTier: dbRecord.sub_tier,
    office: dbRecord.office,
    postedDate: dbRecord.posted_date,
    type: dbRecord.type,
    baseType: dbRecord.base_type,
    archiveType: dbRecord.archive_type,
    archiveDate: dbRecord.archive_date,
    typeOfSetAside: dbRecord.type_of_set_aside,
    typeOfSetAsideDescription: dbRecord.type_of_set_aside_description,
    responseDeadLine: dbRecord.response_deadline,
    naicsCode: dbRecord.naics_code,
    classificationCode: dbRecord.classification_code,
    active: dbRecord.active,
    description: dbRecord.description,
    organizationType: dbRecord.organization_type,
    officeAddress: {
      zipcode: dbRecord.office_zipcode,
      city: dbRecord.office_city,
      countryCode: dbRecord.office_country_code,
      state: dbRecord.office_state,
    },
    placeOfPerformance: {
      streetAddress: dbRecord.pop_street_address,
      city: {
        code: dbRecord.pop_city_code,
        name: dbRecord.pop_city_name,
      },
      state: {
        code: dbRecord.pop_state_code,
        name: dbRecord.pop_state_name,
      },
      zip: dbRecord.pop_zip,
      country: {
        code: dbRecord.pop_country_code,
        name: dbRecord.pop_country_name,
      },
    },
    additionalInfoLink: dbRecord.additional_info_link,
    uiLink: dbRecord.ui_link,
    links: dbRecord.full_data?.links || [],
    resourceLinks: dbRecord.full_data?.resourceLinks || [],
    pointOfContact: dbRecord.full_data?.pointOfContact || [],
    award: dbRecord.full_data?.award,
    fullParentPathName: dbRecord.full_data?.fullParentPathName,
    modifiedDate: dbRecord.full_data?.modifiedDate,
  };
}
