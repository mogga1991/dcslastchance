/**
 * Daily Cron Job: Sync Federal Buildings from IOLP
 *
 * Vercel Cron: Runs daily at 2 AM UTC
 * Manual trigger: GET /api/cron/sync-federal-data?force=true
 *
 * Fetches all federal buildings and leases from IOLP and stores in database
 */

import { NextRequest, NextResponse } from 'next/server';
import { syncIOLPDataToDatabase } from '@/lib/fedspace-integration';

export const maxDuration = 300; // 5 minutes max execution time

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    // Allow manual trigger with force parameter OR valid cron secret
    const force = request.nextUrl.searchParams.get('force') === 'true';

    if (!force && (!cronSecret || authHeader !== `Bearer ${cronSecret}`)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('[CRON] Starting federal data sync...');
    const startTime = Date.now();

    const result = await syncIOLPDataToDatabase();

    const duration = Date.now() - startTime;
    console.log('[CRON] Sync complete:', {
      duration: `${duration}ms`,
      buildingsProcessed: result.buildingsProcessed,
      leasesProcessed: result.leasesProcessed,
      errors: result.errors.length,
    });

    return NextResponse.json({
      success: result.success,
      message: 'Federal data sync completed',
      stats: {
        buildingsProcessed: result.buildingsProcessed,
        leasesProcessed: result.leasesProcessed,
        totalProcessed: result.buildingsProcessed + result.leasesProcessed,
        duration: `${duration}ms`,
        errors: result.errors,
      },
    });
  } catch (error) {
    console.error('[CRON] Fatal error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
