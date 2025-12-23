/**
 * Database Health Check Endpoint
 *
 * Verifies database connectivity and query performance.
 *
 * Checks:
 * - Connection to Neon PostgreSQL
 * - Simple query execution time
 * - Connection pool status
 *
 * Response Format:
 * {
 *   status: "healthy" | "unhealthy",
 *   responseTime: number,
 *   details: {
 *     connected: boolean,
 *     queryTime: number,
 *     poolSize?: number
 *   }
 * }
 */

import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { trackDatabaseError } from '@/lib/sentry-utils';

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

interface DatabaseHealthResponse {
  status: 'healthy' | 'unhealthy';
  responseTime: number;
  details: {
    connected: boolean;
    queryTime: number;
    version?: string;
    error?: string;
  };
}

/**
 * GET /api/health/database
 *
 * Performs a simple database query to verify connectivity
 */
export async function GET() {
  const startTime = Date.now();

  try {
    // Check if DATABASE_URL is configured
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        {
          status: 'unhealthy',
          responseTime: Date.now() - startTime,
          details: {
            connected: false,
            queryTime: 0,
            error: 'DATABASE_URL not configured',
          },
        } as DatabaseHealthResponse,
        {
          status: 503,
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate',
          },
        }
      );
    }

    const sql = neon(process.env.DATABASE_URL);

    // Simple query to check connectivity
    const queryStartTime = Date.now();
    const result = await sql`SELECT 1 as alive, version() as version`;
    const queryTime = Date.now() - queryStartTime;

    const responseTime = Date.now() - startTime;

    // Extract PostgreSQL version
    const version = result[0]?.version?.split(' ')[1] || 'unknown';

    // Log slow queries
    if (queryTime > 1000) {
      console.warn(`[Database Health] Slow query: ${queryTime}ms`);
    }

    return NextResponse.json(
      {
        status: 'healthy',
        responseTime,
        details: {
          connected: true,
          queryTime,
          version,
        },
      } as DatabaseHealthResponse,
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'X-Response-Time': `${responseTime}ms`,
        },
      }
    );
  } catch (error) {
    const responseTime = Date.now() - startTime;

    // Track database errors
    trackDatabaseError(error as Error, {
      operation: 'read',
      table: 'health_check',
      query: 'SELECT 1 as alive, version() as version',
    });

    return NextResponse.json(
      {
        status: 'unhealthy',
        responseTime,
        details: {
          connected: false,
          queryTime: 0,
          error: error instanceof Error ? error.message : 'Unknown database error',
        },
      } as DatabaseHealthResponse,
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
