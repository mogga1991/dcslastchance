/**
 * Main Health Check Endpoint
 *
 * Returns overall system health by aggregating all sub-health checks.
 * Used for:
 * - Vercel deployment validation
 * - External monitoring tools (UptimeRobot, etc.)
 * - Load balancer health checks
 *
 * Response Format:
 * {
 *   status: "healthy" | "degraded" | "unhealthy",
 *   timestamp: ISO 8601 string,
 *   version: string,
 *   checks: {
 *     database: { status: "healthy" | "unhealthy", responseTime: number },
 *     apis: { status: "healthy" | "degraded" | "unhealthy", ... },
 *     cache: { status: "healthy" | "unhealthy", ... }
 *   }
 * }
 */

import { NextResponse } from 'next/server';
import { trackError } from '@/lib/sentry-utils';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime?: number;
  error?: string;
  details?: Record<string, any>;
}

interface HealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  environment: string;
  checks: {
    database: HealthCheckResult;
    apis: HealthCheckResult;
    cache: HealthCheckResult;
  };
}

/**
 * Fetch health check from a sub-endpoint with timeout
 */
async function fetchHealthCheck(
  endpoint: string,
  timeout: number = 5000
): Promise<HealthCheckResult> {
  const startTime = Date.now();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3002';

    const response = await fetch(`${baseUrl}/api/health/${endpoint}`, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'FedSpace-Health-Check/1.0',
      },
    });

    clearTimeout(timeoutId);

    const responseTime = Date.now() - startTime;

    if (!response.ok) {
      return {
        status: 'unhealthy',
        responseTime,
        error: `HTTP ${response.status}`,
      };
    }

    const data = await response.json();

    return {
      ...data,
      responseTime,
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;

    if (error instanceof Error && error.name === 'AbortError') {
      return {
        status: 'unhealthy',
        responseTime,
        error: 'Timeout exceeded',
      };
    }

    return {
      status: 'unhealthy',
      responseTime,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Determine overall status from individual checks
 */
function calculateOverallStatus(checks: {
  database: HealthCheckResult;
  apis: HealthCheckResult;
  cache: HealthCheckResult;
}): 'healthy' | 'degraded' | 'unhealthy' {
  const statuses = [checks.database.status, checks.apis.status, checks.cache.status];

  // If any critical service is unhealthy, overall is unhealthy
  if (checks.database.status === 'unhealthy') {
    return 'unhealthy';
  }

  // If APIs are unhealthy (not just degraded), system is unhealthy
  if (checks.apis.status === 'unhealthy') {
    return 'unhealthy';
  }

  // If any service is degraded, overall is degraded
  if (statuses.includes('degraded')) {
    return 'degraded';
  }

  // If cache is unhealthy but database and APIs are healthy, we're degraded
  if (checks.cache.status === 'unhealthy') {
    return 'degraded';
  }

  return 'healthy';
}

/**
 * GET /api/health
 *
 * Returns overall system health
 */
export async function GET() {
  const startTime = Date.now();

  try {
    // Run all health checks in parallel
    const [database, apis, cache] = await Promise.all([
      fetchHealthCheck('database'),
      fetchHealthCheck('apis'),
      fetchHealthCheck('cache'),
    ]);

    const overallStatus = calculateOverallStatus({ database, apis, cache });

    const response: HealthResponse = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      version: process.env.VERCEL_GIT_COMMIT_SHA?.substring(0, 7) || 'dev',
      environment: process.env.VERCEL_ENV || process.env.NODE_ENV || 'development',
      checks: {
        database,
        apis,
        cache,
      },
    };

    const responseTime = Date.now() - startTime;

    // Log slow health checks
    if (responseTime > 3000) {
      console.warn(`[Health Check] Slow response: ${responseTime}ms`);
    }

    // Return appropriate HTTP status code
    const statusCode = overallStatus === 'healthy' ? 200 : overallStatus === 'degraded' ? 207 : 503;

    return NextResponse.json(response, {
      status: statusCode,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'X-Response-Time': `${responseTime}ms`,
      },
    });
  } catch (error) {
    const responseTime = Date.now() - startTime;

    // Track health check failures
    trackError(error as Error, {
      endpoint: '/api/health',
      responseTime,
    });

    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        version: process.env.VERCEL_GIT_COMMIT_SHA?.substring(0, 7) || 'dev',
        environment: process.env.VERCEL_ENV || process.env.NODE_ENV || 'development',
        error: error instanceof Error ? error.message : 'Unknown error',
        checks: {
          database: { status: 'unhealthy', error: 'Health check failed' },
          apis: { status: 'unhealthy', error: 'Health check failed' },
          cache: { status: 'unhealthy', error: 'Health check failed' },
        },
      } as HealthResponse,
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
