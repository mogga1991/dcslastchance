import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/cron/cleanup-cache
 *
 * 🔴 DATA RISK MITIGATION: Cache cleanup cron job
 *
 * Removes expired cache entries from:
 * - federal_neighborhood_scores (PATENT #1)
 * - property_match_scores (PATENT #2)
 *
 * Both tables have 24-hour TTL. This job prevents indefinite accumulation.
 *
 * Scheduled: Daily at 3:00 AM UTC (vercel.json)
 *
 * Authorization:
 * - Requires CRON_SECRET environment variable to match Authorization header
 * - Format: Authorization: Bearer ${CRON_SECRET}
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    // ============================================================================
    // SECURITY: Verify CRON_SECRET
    // ============================================================================
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      console.error("❌ Cache cleanup: Unauthorized access attempt", {
        hasAuthHeader: !!authHeader,
        hasCronSecret: !!cronSecret,
        timestamp: new Date().toISOString(),
      });

      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    console.log("🧹 Cache cleanup: Starting...", {
      timestamp: new Date().toISOString(),
    });

    // ============================================================================
    // DATABASE: Call cleanup function
    // ============================================================================
    const supabase = await createClient();

    const { data, error } = await supabase.rpc("cleanup_expired_cache");

    if (error) {
      console.error("❌ Cache cleanup: Database error", {
        error: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });

      return NextResponse.json(
        {
          success: false,
          error: "Database cleanup failed",
          details: error.message,
        },
        { status: 500 }
      );
    }

    const deletedCount = data as number;
    const duration = Date.now() - startTime;

    // ============================================================================
    // ANALYTICS: Get cache statistics (for monitoring trends)
    // ============================================================================
    const { data: neighborhoodStats } = await supabase
      .from("federal_neighborhood_scores")
      .select("id", { count: "exact", head: true });

    const { data: matchStats } = await supabase
      .from("property_match_scores")
      .select("id", { count: "exact", head: true });

    const neighborhoodCount = neighborhoodStats || 0;
    const matchCount = matchStats || 0;
    const totalRemaining = (neighborhoodCount as any) + (matchCount as any);

    // ============================================================================
    // LOGGING: Success with detailed metrics
    // ============================================================================
    console.log("✅ Cache cleanup: Completed successfully", {
      deleted_records: deletedCount,
      remaining_records: totalRemaining,
      duration_ms: duration,
      timestamp: new Date().toISOString(),
      performance: deletedCount > 0 ? `${(duration / deletedCount).toFixed(2)}ms per record` : "N/A",
    });

    return NextResponse.json({
      success: true,
      deleted_records: deletedCount,
      remaining_cache_entries: {
        federal_neighborhood_scores: neighborhoodCount,
        property_match_scores: matchCount,
        total: totalRemaining,
      },
      performance: {
        duration_ms: duration,
        avg_ms_per_record: deletedCount > 0 ? Number((duration / deletedCount).toFixed(2)) : 0,
      },
      timestamp: new Date().toISOString(),
      next_run: "Daily at 3:00 AM UTC",
    });

  } catch (error) {
    const duration = Date.now() - startTime;

    console.error("💥 Cache cleanup: Fatal error", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      duration_ms: duration,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
        duration_ms: duration,
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/cron/cleanup-cache
 *
 * Manual trigger for cache cleanup (for testing and admin use)
 *
 * Requires authentication as a service admin.
 * Useful for:
 * - Testing the cleanup function
 * - Manual cleanup during development
 * - Emergency cleanup if cron fails
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const supabase = await createClient();

    // ============================================================================
    // SECURITY: Require authenticated user (for manual cleanup)
    // ============================================================================
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized - Authentication required" },
        { status: 401 }
      );
    }

    console.log("🧹 Cache cleanup: Manual trigger by user", {
      user_id: user.id,
      user_email: user.email,
      timestamp: new Date().toISOString(),
    });

    // ============================================================================
    // DATABASE: Call cleanup function
    // ============================================================================
    const { data, error } = await supabase.rpc("cleanup_expired_cache");

    if (error) {
      console.error("❌ Cache cleanup (manual): Database error", {
        error: error.message,
        user_id: user.id,
      });

      return NextResponse.json(
        {
          success: false,
          error: "Database cleanup failed",
          details: error.message,
        },
        { status: 500 }
      );
    }

    const deletedCount = data as number;
    const duration = Date.now() - startTime;

    // ============================================================================
    // ANALYTICS: Get remaining cache counts
    // ============================================================================
    const { data: neighborhoodStats } = await supabase
      .from("federal_neighborhood_scores")
      .select("id", { count: "exact", head: true });

    const { data: matchStats } = await supabase
      .from("property_match_scores")
      .select("id", { count: "exact", head: true });

    console.log("✅ Cache cleanup (manual): Completed", {
      deleted_records: deletedCount,
      duration_ms: duration,
      user_id: user.id,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      deleted_records: deletedCount,
      remaining_cache_entries: {
        federal_neighborhood_scores: neighborhoodStats || 0,
        property_match_scores: matchStats || 0,
      },
      performance: {
        duration_ms: duration,
      },
      triggered_by: user.email,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    const duration = Date.now() - startTime;

    console.error("💥 Cache cleanup (manual): Fatal error", {
      error: error instanceof Error ? error.message : "Unknown error",
      duration_ms: duration,
    });

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
