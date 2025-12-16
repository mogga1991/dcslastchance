/**
 * SAM.gov Opportunity Import Utilities
 *
 * Helper functions to import SAM.gov opportunities into the database
 * and trigger analysis workflows
 */

import { createClient } from "@/lib/supabase/server";
import { SAMOpportunity } from "@/lib/sam-gov";

export interface ImportResult {
  success: boolean;
  opportunity_id?: string;
  is_new?: boolean;
  error?: string;
}

/**
 * Import a SAM.gov opportunity into the opportunities table
 *
 * @param samOpportunity - The SAM.gov opportunity data
 * @param orgId - The organization ID to associate with
 * @param userId - Optional user ID for tracking who imported
 * @returns ImportResult with opportunity_id if successful
 */
export async function importSAMOpportunity(
  samOpportunity: SAMOpportunity,
  orgId: string,
  userId?: string
): Promise<ImportResult> {
  try {
    const supabase = await createClient();

    // Check if opportunity already exists
    const { data: existing } = await supabase
      .from("opportunities")
      .select("id")
      .eq("org_id", orgId)
      .eq("notice_id", samOpportunity.noticeId)
      .single();

    if (existing) {
      // Update existing opportunity
      const { error: updateError } = await supabase
        .from("opportunities")
        .update({
          title: samOpportunity.title,
          solicitation_number: samOpportunity.solicitationNumber,
          agency: samOpportunity.department,
          posted_date: samOpportunity.postedDate,
          due_date: samOpportunity.responseDeadLine,
          raw: samOpportunity,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id);

      if (updateError) {
        return {
          success: false,
          error: `Failed to update opportunity: ${updateError.message}`,
        };
      }

      return {
        success: true,
        opportunity_id: existing.id,
        is_new: false,
      };
    }

    // Create new opportunity
    const { data: newOpp, error: insertError } = await supabase
      .from("opportunities")
      .insert({
        org_id: orgId,
        source: "SAM",
        notice_id: samOpportunity.noticeId,
        solicitation_number: samOpportunity.solicitationNumber,
        title: samOpportunity.title,
        agency: samOpportunity.department,
        posted_date: samOpportunity.postedDate,
        due_date: samOpportunity.responseDeadLine,
        status: "new",
        raw: samOpportunity,
      })
      .select()
      .single();

    if (insertError || !newOpp) {
      return {
        success: false,
        error: `Failed to create opportunity: ${insertError?.message}`,
      };
    }

    return {
      success: true,
      opportunity_id: newOpp.id,
      is_new: true,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Batch import multiple SAM.gov opportunities
 *
 * @param opportunities - Array of SAM.gov opportunities
 * @param orgId - The organization ID
 * @param userId - Optional user ID
 * @returns Array of import results
 */
export async function batchImportSAMOpportunities(
  opportunities: SAMOpportunity[],
  orgId: string,
  userId?: string
): Promise<ImportResult[]> {
  const results: ImportResult[] = [];

  for (const opp of opportunities) {
    const result = await importSAMOpportunity(opp, orgId, userId);
    results.push(result);
  }

  return results;
}

/**
 * Check if an opportunity already exists in the database
 *
 * @param noticeId - SAM.gov notice ID
 * @param orgId - Organization ID
 * @returns The opportunity ID if it exists, null otherwise
 */
export async function checkOpportunityExists(
  noticeId: string,
  orgId: string
): Promise<string | null> {
  try {
    const supabase = await createClient();

    const { data } = await supabase
      .from("opportunities")
      .select("id")
      .eq("org_id", orgId)
      .eq("notice_id", noticeId)
      .single();

    return data?.id || null;
  } catch {
    return null;
  }
}

/**
 * Get analysis count for an opportunity
 *
 * @param opportunityId - The opportunity ID
 * @returns Number of analyses for this opportunity
 */
export async function getOpportunityAnalysisCount(
  opportunityId: string
): Promise<number> {
  try {
    const supabase = await createClient();

    const { count } = await supabase
      .from("opportunity_analysis")
      .select("*", { count: "exact", head: true })
      .eq("opportunity_id", opportunityId);

    return count || 0;
  } catch {
    return 0;
  }
}

/**
 * Sync opportunities from SAM.gov to database
 * This can be used in a cron job to keep opportunities up to date
 *
 * @param opportunities - Array of SAM opportunities from API
 * @param orgId - Organization ID
 * @returns Summary of sync results
 */
export async function syncSAMOpportunities(
  opportunities: SAMOpportunity[],
  orgId: string
): Promise<{
  total: number;
  imported: number;
  updated: number;
  failed: number;
  errors: string[];
}> {
  const results = await batchImportSAMOpportunities(opportunities, orgId);

  const summary = {
    total: opportunities.length,
    imported: results.filter((r) => r.success && r.is_new).length,
    updated: results.filter((r) => r.success && !r.is_new).length,
    failed: results.filter((r) => !r.success).length,
    errors: results.filter((r) => !r.success && r.error).map((r) => r.error!),
  };

  return summary;
}
