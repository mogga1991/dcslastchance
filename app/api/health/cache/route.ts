/**
 * Cache Cleanup Health Check Endpoint
 *
 * Verifies cache cleanup cron job is functioning correctly.
 *
 * Checks:
 * - Last cleanup execution time
 * - Number of stale records
 * - Cleanup job status
 *
 * Response Format:
 * {
 *   status: "healthy" | "unhealthy",
 *   responseTime: number,
 *   details: {
 *     lastCleanup: string | null,
 *     staleRecords: number,
 *     cleanupOverdue: boolean
 *   }
 * }
 */

import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { trackCacheCleanupError } from '@/lib/sentry-utils';

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

interface CacheHealthResponse {
  status: 'healthy' | 'unhealthy';
  responseTime: number;
  details: {
    lastCleanup: string | null;
    staleRecords: number;
    cleanupOverdue: boolean;
    error?: string;
  };
}

/**
 * GET /api/health/cache
 *
 * Checks cache cleanup job health
 */
export async function GET() {
  const startTime = Date.now();

  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        {
          status: 'unhealthy',
          responseTime: Date.now() - startTime,
          details: {
            lastCleanup: null,
            staleRecords: 0,
            cleanupOverdue: false,
            error: 'DATABASE_URL not configured',
          },
        } as CacheHealthResponse,
        {
          status: 503,
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate',
          },
        }
      );
    }

    const sql = neon(process.env.DATABASE_URL);

    // Get last cleanup time from opportunities table
    // (We can infer last cleanup from the most recent created_at timestamp)
    const lastCleanupResult = await sql`
      SELECT MAX(created_at) as last_cleanup
      FROM opportunities
      WHERE created_at > NOW() - INTERVAL '7 days'
    `;

    const lastCleanup = lastCleanupResult[0]?.last_cleanup as string | null;

    // Count stale opportunities (older than 7 days)
    const staleResult = await sql`
      SELECT COUNT(*) as count
      FROM opportunities
      WHERE created_at < NOW() - INTERVAL '7 days'
    `;

    const staleRecords = Number(staleResult[0]?.count || 0);

    // Cleanup is overdue if:
    // 1. No cleanup in last 25 hours (should run daily)
    // 2. Stale records > 1000 (backlog building up)
    const cleanupOverdue =
      (!lastCleanup || new Date(lastCleanup) < new Date(Date.now() - 25 * 60 * 60 * 1000)) ||
      staleRecords > 1000;

    const responseTime = Date.now() - startTime;

    // System is unhealthy if cleanup is significantly overdue
    const status = cleanupOverdue && staleRecords > 5000 ? 'unhealthy' : 'healthy';

    // Track if cleanup is overdue
    if (cleanupOverdue) {
      console.warn(`[Cache Health] Cleanup overdue. Stale records: ${staleRecords}`);

      if (staleRecords > 5000) {
        trackCacheCleanupError(new Error('Cache cleanup significantly overdue'), {
          recordsDeleted: 0,
          executionTime: 0,
        });
      }
    }

    return NextResponse.json(
      {
        status,
        responseTime,
        details: {
          lastCleanup: lastCleanup || null,
          staleRecords,
          cleanupOverdue,
        },
      } as CacheHealthResponse,
      {
        status: status === 'healthy' ? 200 : 503,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'X-Response-Time': `${responseTime}ms`,
        },
      }
    );
  } catch (error) {
    const responseTime = Date.now() - startTime;

    trackCacheCleanupError(error as Error, {
      recordsDeleted: 0,
      executionTime: responseTime,
    });

    return NextResponse.json(
      {
        status: 'unhealthy',
        responseTime,
        details: {
          lastCleanup: null,
          staleRecords: 0,
          cleanupOverdue: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      } as CacheHealthResponse,
      {
        status: 503,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'X-Response-Time': `${responseTime}ms`,
        },
      }
    );
  }
}
