import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { fetchAllOpportunities, fetchGSALeaseOpportunities } from "@/lib/sam-gov";
import { syncSAMOpportunities } from "@/lib/sam-opportunity-import";

/**
 * GET /api/cron/sync-opportunities
 *
 * Cron job to sync SAM.gov opportunities to database
 * Should be called by Vercel Cron or similar scheduler
 *
 * Query Parameters:
 * - mode: "all" | "leasing" (default: "all")
 * - org_id: Optional organization ID to sync for (if not provided, syncs for all orgs)
 *
 * Authorization:
 * - Requires CRON_SECRET environment variable to match Authorization header
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const mode = searchParams.get("mode") || "all";
    const orgId = searchParams.get("org_id");

    const supabase = await createClient();

    // Get organizations to sync for
    let orgIds: string[] = [];
    if (orgId) {
      orgIds = [orgId];
    } else {
      // Get all active organizations
      const { data: orgs } = await supabase
        .from("orgs")
        .select("id");

      orgIds = orgs?.map((org) => org.id) || [];
    }

    if (orgIds.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No organizations to sync",
        results: [],
      });
    }

    // Fetch opportunities from SAM.gov
    let samData;
    if (mode === "leasing") {
      samData = await fetchGSALeaseOpportunities({ limit: 1000 });
    } else {
      samData = await fetchAllOpportunities({ limit: 1000 });
    }

    const opportunities = samData.opportunitiesData;

    // Sync opportunities for each organization
    const results = [];
    for (const currentOrgId of orgIds) {
      const syncResult = await syncSAMOpportunities(opportunities, currentOrgId);
      results.push({
        org_id: currentOrgId,
        ...syncResult,
      });
    }

    // Calculate totals
    const totals = results.reduce(
      (acc, r) => ({
        total: acc.total + r.total,
        imported: acc.imported + r.imported,
        updated: acc.updated + r.updated,
        failed: acc.failed + r.failed,
      }),
      { total: 0, imported: 0, updated: 0, failed: 0 }
    );

    return NextResponse.json({
      success: true,
      mode,
      organizations_synced: orgIds.length,
      totals,
      results,
      synced_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in cron sync-opportunities:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/cron/sync-opportunities
 *
 * Manual trigger for syncing opportunities
 * Requires authentication as an org member
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get user's organization
    const { data: membership } = await supabase
      .from("org_members")
      .select("org_id")
      .eq("user_id", user.id)
      .single();

    if (!membership) {
      return NextResponse.json(
        { error: "No organization found for user" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { mode = "all", limit = 100 } = body;

    // Fetch opportunities from SAM.gov
    let samData;
    if (mode === "leasing") {
      samData = await fetchGSALeaseOpportunities({ limit });
    } else {
      samData = await fetchAllOpportunities({ limit });
    }

    const opportunities = samData.opportunitiesData;

    // Sync opportunities for user's organization
    const syncResult = await syncSAMOpportunities(
      opportunities,
      membership.org_id
    );

    return NextResponse.json({
      success: true,
      mode,
      ...syncResult,
      synced_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in manual sync-opportunities:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
