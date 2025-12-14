import { NextRequest, NextResponse } from "next/server";
import { requireAuth, AuthError } from "@/lib/auth-guards";
import { getTotalCredits } from "@/lib/services";
import { sql } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import { getSubscriptionDetails } from "@/lib/subscription";

export interface UsageStats {
  analysesUsed: number;
  analysesLimit: number;
  planName: string;
  daysUntilReset: number;
  credits: number;
  creditsActive: boolean;
  upcomingDeadlines: number;
  nextDeadlineDate: string | null;
  nextDeadlineName: string | null;
  daysUntilNextDeadline: number | null;
  avgBidScore: number;
  totalAnalyses: number;
}

// GET /api/user/usage-stats - Get comprehensive usage statistics for sidebar
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    const supabase = await createClient();

    // Fetch all required data in parallel
    const [credits, subscriptionResult, analysisStats, deadlineStats] = await Promise.all([
      // Get user's credits
      getTotalCredits(session.userId),

      // Get subscription details
      getSubscriptionDetails(),

      // Get analysis stats (completed analyses and avg bid score)
      sql`
        SELECT
          COUNT(*) as total_analyses,
          AVG(CASE
            WHEN bid_score IS NOT NULL AND bid_score > 0 THEN bid_score
            ELSE NULL
          END) as avg_bid_score
        FROM analysis a
        JOIN "user" u ON a.user_id = u.id
        WHERE u.id = ${session.userId}
          AND a.status = 'completed'
          AND a.created_at >= NOW() - INTERVAL '30 days'
      `,

      // Get upcoming deadlines from saved opportunities
      supabase
        .from("saved_opportunities")
        .select("opportunity_data")
        .eq("user_id", session.userId)
        .order("opportunity_data->response_deadline", { ascending: true })
        .limit(10),
    ]);

    // Process subscription data
    const subscription = subscriptionResult.subscription;
    let planName = "Free";
    let analysesLimit = 1;
    let daysUntilReset = 0;

    if (subscription && subscription.status === "active") {
      // Map product ID to plan name and limits
      const productId = subscription.productId;
      if (productId.includes("starter")) {
        planName = "Starter";
        analysesLimit = 5;
      } else if (productId.includes("pro")) {
        planName = "Pro";
        analysesLimit = 15;
      } else if (productId.includes("team")) {
        planName = "Team";
        analysesLimit = 30;
      } else if (productId.includes("enterprise")) {
        planName = "Enterprise";
        analysesLimit = 9999; // Unlimited
      }

      // Calculate days until reset
      const now = new Date();
      const periodEnd = new Date(subscription.currentPeriodEnd);
      daysUntilReset = Math.ceil((periodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    }

    // Get analyses used this period
    const analysesUsedResult = await sql`
      SELECT COUNT(*) as analyses_used
      FROM analysis a
      WHERE a.user_id = ${session.userId}
        AND a.created_at >= ${subscription?.currentPeriodStart || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)}
    `;
    const analysesUsed = Number(analysesUsedResult[0].analyses_used);

    // Process upcoming deadlines
    let upcomingDeadlines = 0;
    let nextDeadlineDate: string | null = null;
    let nextDeadlineName: string | null = null;
    let daysUntilNextDeadline: number | null = null;

    if (deadlineStats.data && deadlineStats.data.length > 0) {
      const now = new Date();
      const futureDeadlines = deadlineStats.data
        .filter((opp: any) => {
          const deadline = opp.opportunity_data?.response_deadline;
          if (!deadline) return false;
          return new Date(deadline) > now;
        })
        .sort((a: any, b: any) => {
          const dateA = new Date(a.opportunity_data?.response_deadline);
          const dateB = new Date(b.opportunity_data?.response_deadline);
          return dateA.getTime() - dateB.getTime();
        });

      upcomingDeadlines = futureDeadlines.length;

      if (futureDeadlines.length > 0) {
        const nextOpportunity = futureDeadlines[0];
        const deadline = new Date(nextOpportunity.opportunity_data.response_deadline);
        nextDeadlineDate = deadline.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
        nextDeadlineName = nextOpportunity.opportunity_data?.title || "Opportunity";
        daysUntilNextDeadline = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      }
    }

    // Get avg bid score
    const avgBidScore = analysisStats[0].avg_bid_score ? Math.round(Number(analysisStats[0].avg_bid_score)) : 0;
    const totalAnalyses = Number(analysisStats[0].total_analyses);

    const stats: UsageStats = {
      analysesUsed,
      analysesLimit,
      planName,
      daysUntilReset,
      credits,
      creditsActive: credits > 0,
      upcomingDeadlines,
      nextDeadlineDate,
      nextDeadlineName,
      daysUntilNextDeadline,
      avgBidScore,
      totalAnalyses,
    };

    return NextResponse.json(stats);
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }
    console.error("Error fetching usage stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
