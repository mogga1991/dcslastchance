import { NextRequest, NextResponse } from "next/server";
import { syncOpportunitiesFromSAM } from "@/lib/sync-opportunities";

/**
 * API endpoint to sync opportunities from SAM.gov to database
 *
 * Protected by CRON_SECRET to ensure only authorized requests
 * Can be triggered by:
 * 1. Vercel Cron (automated 2x per week)
 * 2. Manual refresh button (with admin check)
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authorization - allow either cron secret OR authenticated user
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    const isValidCronRequest = authHeader === `Bearer ${cronSecret}`;

    // Check if user is authenticated (for manual refresh from UI)
    let isAuthenticatedUser = false;
    if (!isValidCronRequest) {
      try {
        const { createClient } = await import("@/lib/supabase/server");
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        isAuthenticatedUser = !!user;
      } catch (error) {
        console.error("Error checking user auth:", error);
      }
    }

    // Require either cron secret or authenticated user
    if (!isValidCronRequest && !isAuthenticatedUser) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    console.log(`🚀 Sync triggered via ${isValidCronRequest ? 'CRON' : 'manual UI'}`);

    // Perform the sync
    const result = await syncOpportunitiesFromSAM();

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message,
        stats: result.stats,
        timestamp: new Date().toISOString(),
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.message,
          stats: result.stats,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in sync endpoint:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Sync failed",
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to check last sync status
 */
export async function GET(request: NextRequest) {
  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();

    // Get the most recent sync timestamp
    const { data, error } = await supabase
      .from("opportunities")
      .select("last_synced_at")
      .order("last_synced_at", { ascending: false })
      .limit(1)
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch sync status" },
        { status: 500 }
      );
    }

    // Get total count
    const { count } = await supabase
      .from("opportunities")
      .select("*", { count: "exact", head: true });

    return NextResponse.json({
      lastSyncedAt: data?.last_synced_at,
      totalOpportunities: count,
    });
  } catch (error) {
    console.error("Error fetching sync status:", error);
    return NextResponse.json(
      { error: "Failed to fetch sync status" },
      { status: 500 }
    );
  }
}
