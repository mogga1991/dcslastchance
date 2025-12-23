/**
 * AI Extraction Metrics API Endpoint
 *
 * Provides aggregated metrics about AI extraction usage:
 * - Total extractions count
 * - Total cost (sum of all extraction costs)
 * - Average cost per extraction
 * - Average confidence score
 * - Success rate (AI vs fallback)
 * - Fallback rate
 *
 * Response Format:
 * {
 *   totalExtractions: number;
 *   totalCost: number;
 *   avgCostPerExtraction: number;
 *   avgConfidence: number;
 *   successRate: number;
 *   fallbackRate: number;
 * }
 */

import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { trackAPIError } from '@/lib/sentry-utils';

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

interface AIMetricsResponse {
  totalExtractions: number;
  totalCost: number;
  avgCostPerExtraction: number;
  avgConfidence: number;
  successRate: number;
  fallbackRate: number;
  period: {
    start: string;
    end: string;
  };
}

/**
 * GET /api/monitoring/ai-metrics
 *
 * Returns AI extraction metrics for the past 30 days
 */
export async function GET(request: Request) {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        {
          totalExtractions: 0,
          totalCost: 0,
          avgCostPerExtraction: 0,
          avgConfidence: 0,
          successRate: 0,
          fallbackRate: 0,
          period: {
            start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            end: new Date().toISOString(),
          },
        } as AIMetricsResponse,
        {
          status: 200,
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate',
          },
        }
      );
    }

    const sql = neon(process.env.DATABASE_URL);

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30', 10);

    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const endDate = new Date();

    // Query extraction metrics from opportunities table
    // Note: AI extraction will be integrated in a future sprint
    // For now, return placeholder data based on opportunities processed
    const metricsResult = await sql`
      WITH extraction_stats AS (
        SELECT
          COUNT(*) as total_extractions,
          0 as total_cost,
          0 as avg_confidence,
          0 as ai_count,
          0 as fallback_count
        FROM opportunities
        WHERE created_at >= ${startDate.toISOString()}
          AND created_at <= ${endDate.toISOString()}
      )
      SELECT
        total_extractions,
        total_cost,
        CASE
          WHEN total_extractions > 0
          THEN total_cost::FLOAT / total_extractions
          ELSE 0
        END as avg_cost_per_extraction,
        avg_confidence,
        CASE
          WHEN total_extractions > 0
          THEN (ai_count::FLOAT / total_extractions * 100)
          ELSE 0
        END as success_rate,
        CASE
          WHEN total_extractions > 0
          THEN (fallback_count::FLOAT / total_extractions * 100)
          ELSE 0
        END as fallback_rate
      FROM extraction_stats
    `;

    const metrics = metricsResult[0] || {
      total_extractions: 0,
      total_cost: 0,
      avg_cost_per_extraction: 0,
      avg_confidence: 0,
      success_rate: 0,
      fallback_rate: 0,
    };

    const response: AIMetricsResponse = {
      totalExtractions: Number(metrics.total_extractions || 0),
      totalCost: Number(metrics.total_cost || 0),
      avgCostPerExtraction: Number(metrics.avg_cost_per_extraction || 0),
      avgConfidence: Number(metrics.avg_confidence || 0),
      successRate: Number(metrics.success_rate || 0),
      fallbackRate: Number(metrics.fallback_rate || 0),
      period: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
      },
    };

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (error) {
    trackAPIError(error as Error, {
      endpoint: '/api/monitoring/ai-metrics',
      method: 'GET',
      statusCode: 500,
    });

    return NextResponse.json(
      {
        totalExtractions: 0,
        totalCost: 0,
        avgCostPerExtraction: 0,
        avgConfidence: 0,
        successRate: 0,
        fallbackRate: 0,
        period: {
          start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          end: new Date().toISOString(),
        },
        error: error instanceof Error ? error.message : 'Unknown error',
      } as AIMetricsResponse & { error: string },
      {
        status: 500,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  }
}
