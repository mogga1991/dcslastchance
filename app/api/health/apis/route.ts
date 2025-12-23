/**
 * External APIs Health Check Endpoint
 *
 * Verifies connectivity to external services:
 * - SAM.gov API (federal opportunities)
 * - Claude API (AI extraction)
 *
 * Status Levels:
 * - healthy: All APIs responding
 * - degraded: Some APIs down but core functionality works
 * - unhealthy: Critical APIs unavailable
 *
 * Response Format:
 * {
 *   status: "healthy" | "degraded" | "unhealthy",
 *   responseTime: number,
 *   details: {
 *     samGov: { status: "healthy" | "unhealthy", responseTime: number },
 *     claude: { status: "healthy" | "unhealthy", responseTime: number }
 *   }
 * }
 */

import { NextResponse } from 'next/server';
import { trackAPIError } from '@/lib/sentry-utils';

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

interface APIHealthStatus {
  status: 'healthy' | 'unhealthy';
  responseTime: number;
  error?: string;
}

interface APIsHealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime: number;
  details: {
    samGov: APIHealthStatus;
    claude: APIHealthStatus;
  };
}

/**
 * Check SAM.gov API health
 * Uses a lightweight endpoint to minimize cost
 */
async function checkSAMGovAPI(): Promise<APIHealthStatus> {
  const startTime = Date.now();

  try {
    if (!process.env.SAM_API_KEY) {
      return {
        status: 'unhealthy',
        responseTime: 0,
        error: 'SAM_API_KEY not configured',
      };
    }

    // Use a simple API call with minimal data
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(
      'https://api.sam.gov/opportunities/v2/search?limit=1&api_key=' + process.env.SAM_API_KEY,
      {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    clearTimeout(timeoutId);

    const responseTime = Date.now() - startTime;

    if (!response.ok) {
      return {
        status: 'unhealthy',
        responseTime,
        error: `HTTP ${response.status}`,
      };
    }

    return {
      status: 'healthy',
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
 * Check Claude API health
 * Uses a minimal request to verify API key validity
 */
async function checkClaudeAPI(): Promise<APIHealthStatus> {
  const startTime = Date.now();

  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return {
        status: 'unhealthy',
        responseTime: 0,
        error: 'ANTHROPIC_API_KEY not configured (AI features disabled)',
      };
    }

    // Use a very small request to check API key validity
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-opus-20240229',
        max_tokens: 10,
        messages: [
          {
            role: 'user',
            content: 'health',
          },
        ],
      }),
    });

    clearTimeout(timeoutId);

    const responseTime = Date.now() - startTime;

    // 400 or 200 means API key is valid (just checking connectivity)
    if (response.ok || response.status === 400) {
      return {
        status: 'healthy',
        responseTime,
      };
    }

    // 401 means invalid API key
    if (response.status === 401) {
      return {
        status: 'unhealthy',
        responseTime,
        error: 'Invalid API key',
      };
    }

    return {
      status: 'unhealthy',
      responseTime,
      error: `HTTP ${response.status}`,
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
 * GET /api/health/apis
 *
 * Checks health of all external APIs
 */
export async function GET() {
  const startTime = Date.now();

  try {
    // Check all APIs in parallel
    const [samGov, claude] = await Promise.all([
      checkSAMGovAPI(),
      checkClaudeAPI(),
    ]);

    const responseTime = Date.now() - startTime;

    // Determine overall status
    let overallStatus: 'healthy' | 'degraded' | 'unhealthy';

    if (samGov.status === 'unhealthy') {
      // SAM.gov is critical - without it, core functionality breaks
      overallStatus = 'unhealthy';
    } else if (claude.status === 'unhealthy') {
      // Claude is optional - system falls back to regex extraction
      overallStatus = 'degraded';
    } else {
      overallStatus = 'healthy';
    }

    // Track API errors
    if (samGov.status === 'unhealthy') {
      trackAPIError(new Error(`SAM.gov API unhealthy: ${samGov.error}`), {
        endpoint: 'https://api.sam.gov/opportunities/v2/search',
        method: 'GET',
        statusCode: 0,
      });
    }

    if (claude.status === 'unhealthy' && process.env.ANTHROPIC_API_KEY) {
      // Only track if API key is configured (otherwise it's expected)
      trackAPIError(new Error(`Claude API unhealthy: ${claude.error}`), {
        endpoint: 'https://api.anthropic.com/v1/messages',
        method: 'POST',
        statusCode: 0,
      });
    }

    const response: APIsHealthResponse = {
      status: overallStatus,
      responseTime,
      details: {
        samGov,
        claude,
      },
    };

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

    return NextResponse.json(
      {
        status: 'unhealthy',
        responseTime,
        details: {
          samGov: {
            status: 'unhealthy',
            responseTime: 0,
            error: 'Health check failed',
          },
          claude: {
            status: 'unhealthy',
            responseTime: 0,
            error: 'Health check failed',
          },
        },
      } as APIsHealthResponse,
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
