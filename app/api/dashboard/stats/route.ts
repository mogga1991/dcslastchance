import { NextRequest, NextResponse } from "next/server";
import { requireAuth, AuthError } from "@/lib/auth-guards";
import { getTotalCredits } from "@/lib/services";
import { sql } from "@/lib/db";

// GET /api/dashboard/stats - Get dashboard statistics
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();

    // ✅ UPDATED - Org-wide stats instead of just user's
    const [analyses, credits, teamStats] = await Promise.all([
      // Analysis stats for the organization
      sql`
        SELECT
          COUNT(*) as total_analyses,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_analyses,
          COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft_analyses,
          COUNT(CASE WHEN status = 'processing' THEN 1 END) as processing_analyses,
          COUNT(CASE WHEN bid_recommendation LIKE '%STRONG%' THEN 1 END) as strong_bids
        FROM analysis a
        JOIN "user" u ON a.user_id = u.id
        WHERE u.organization_id = ${session.organizationId || session.userId}
      `,

      // User's personal credits
      getTotalCredits(session.userId),

      // Team member count and org info
      sql`
        SELECT
          COUNT(*) as team_members,
          MAX(o.name) as org_name
        FROM "user" u
        LEFT JOIN organization o ON u.organization_id = o.id
        WHERE u.organization_id = ${session.organizationId || session.userId}
      `
    ]);

    return NextResponse.json({
      stats: {
        // Org-wide analysis stats
        total_analyses: Number(analyses[0].total_analyses),
        completed_analyses: Number(analyses[0].completed_analyses),
        draft_analyses: Number(analyses[0].draft_analyses),
        processing_analyses: Number(analyses[0].processing_analyses),
        strong_bids: Number(analyses[0].strong_bids),

        // User's personal stats
        credits_remaining: credits,

        // Team/org stats
        team_members: session.organizationId ? Number(teamStats[0].team_members) : 1,
        organization_name: teamStats[0]?.org_name || null,
      }
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
