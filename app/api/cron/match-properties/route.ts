import { NextRequest, NextResponse } from 'next/server';
import { matchPropertiesWithOpportunities } from '@/lib/scoring/match-properties';

/**
 * Cron job endpoint for daily property-opportunity matching
 *
 * Runs daily at 2 AM (configured in vercel.json)
 * Protected by CRON_SECRET environment variable
 *
 * Usage:
 * - Vercel Cron: Automatically triggered by Vercel's cron scheduler
 * - Manual testing: curl -H "Authorization: Bearer $CRON_SECRET" https://your-domain.com/api/cron/match-properties
 */
export async function GET(request: NextRequest) {
  try {
    // 1. Verify cron secret
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      console.error('[Cron] CRON_SECRET not configured in environment variables');
      return NextResponse.json(
        { error: 'Cron job not configured' },
        { status: 500 }
      );
    }

    // Vercel Cron sends: "Bearer <CRON_SECRET>"
    const expectedAuth = `Bearer ${cronSecret}`;
    if (authHeader !== expectedAuth) {
      console.error('[Cron] Unauthorized access attempt');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('[Cron] Starting daily property matching job...');
    const startTime = Date.now();

    // 2. Get Supabase credentials
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      console.error('[Cron] Missing Supabase credentials');
      return NextResponse.json(
        { error: 'Supabase not configured' },
        { status: 500 }
      );
    }

    // 3. Run batch matching (min score 40 - qualified threshold)
    const stats = await matchPropertiesWithOpportunities(
      supabaseUrl,
      serviceRoleKey,
      40
    );

    const duration = Date.now() - startTime;

    console.log('[Cron] Daily matching job completed:', {
      ...stats,
      durationSeconds: (duration / 1000).toFixed(2)
    });

    // 4. Return success with stats
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      stats: {
        ...stats,
        durationMs: duration
      }
    });

  } catch (error) {
    console.error('[Cron] Fatal error in daily matching job:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
