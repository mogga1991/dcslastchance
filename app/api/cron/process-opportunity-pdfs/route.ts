/**
 * Background PDF Processing Cron Job
 *
 * Runs every 10 minutes during the 2-4 AM window (Mon/Thu)
 * Processes 5 opportunities per batch to stay within Vercel timeout limits
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getPendingOpportunities,
  generateBatchId,
  markAsProcessing,
  markAsCompleted,
  markAsFailed,
  getProcessingMetrics,
} from '@/lib/processing-queue';

/**
 * POST /api/cron/process-opportunity-pdfs
 *
 * Triggered by Vercel Cron (every 10 min, 2-4 AM, Mon/Thu)
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  // Verify cron secret for security
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    console.error('[Cron] Unauthorized request - invalid secret');
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const batchId = generateBatchId();
  console.log(`[Cron] Starting batch ${batchId}`);

  try {
    // Fetch next batch of pending opportunities (5 at a time)
    const pendingOpps = await getPendingOpportunities(5);

    if (pendingOpps.length === 0) {
      console.log('[Cron] No pending opportunities found');
      const metrics = await getProcessingMetrics();
      return NextResponse.json({
        success: true,
        message: 'No pending opportunities',
        batchId,
        processed: 0,
        metrics,
      });
    }

    console.log(`[Cron] Processing ${pendingOpps.length} opportunities in batch ${batchId}`);

    // Process each opportunity
    const results = await Promise.allSettled(
      pendingOpps.map(async (opp) => {
        try {
          // Mark as processing
          await markAsProcessing(opp.noticeId, batchId);

          // Call the existing processing API
          const baseUrl = process.env.NEXT_PUBLIC_VERCEL_URL
            ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
            : 'http://localhost:3002';

          console.log(`[Cron] Processing opportunity ${opp.noticeId}: ${opp.title}`);

          const response = await fetch(`${baseUrl}/api/process-opportunity-documents`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-batch-id': batchId,
            },
            body: JSON.stringify({
              opportunityId: opp.noticeId,
              resourceLinks: opp.resourceLinks,
              userId: 'system', // Background job
              batchProcessing: true,
            }),
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Processing API failed: ${response.status} - ${errorText}`);
          }

          const result = await response.json();

          // Mark as completed (cost tracking happens in the processing API)
          await markAsCompleted(
            opp.noticeId,
            result.totalCost || 0,
            result.sectionMetadata || {}
          );

          console.log(`[Cron] Successfully processed ${opp.noticeId}`);

          return {
            noticeId: opp.noticeId,
            title: opp.title,
            status: 'success',
            documentsProcessed: result.documentsProcessed || 0,
            cost: result.totalCost || 0,
          };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          console.error(`[Cron] Failed to process ${opp.noticeId}:`, errorMessage);

          // Mark as failed (with retry logic)
          await markAsFailed(opp.noticeId, errorMessage);

          return {
            noticeId: opp.noticeId,
            title: opp.title,
            status: 'failed',
            error: errorMessage,
          };
        }
      })
    );

    // Collect results
    const successful = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.filter((r) => r.status === 'rejected').length;
    const totalCost = results
      .filter((r) => r.status === 'fulfilled')
      .reduce((sum, r: any) => sum + (r.value?.cost || 0), 0);

    const processingTimeMs = Date.now() - startTime;

    console.log(`[Cron] Batch ${batchId} complete: ${successful} succeeded, ${failed} failed (${processingTimeMs}ms)`);

    // Get updated metrics
    const metrics = await getProcessingMetrics();

    return NextResponse.json({
      success: true,
      batchId,
      processed: pendingOpps.length,
      successful,
      failed,
      totalCost,
      processingTimeMs,
      metrics,
      results: results.map((r) => (r.status === 'fulfilled' ? r.value : { error: 'Promise rejected' })),
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[Cron] Batch ${batchId} failed:`, errorMessage);

    return NextResponse.json(
      {
        success: false,
        batchId,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/cron/process-opportunity-pdfs (for manual testing)
 */
export async function GET(request: NextRequest) {
  // Allow GET for manual testing in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Method not allowed in production' },
      { status: 405 }
    );
  }

  console.log('[Cron] Manual trigger via GET request');
  return POST(request);
}
