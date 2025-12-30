/**
 * Processing Queue Management
 *
 * Helper functions for managing the PDF processing queue,
 * including batch selection, status tracking, and cost calculation.
 */

import { createClient } from '@/lib/supabase/server';

export interface PendingOpportunity {
  noticeId: string;
  title: string;
  resourceLinks: string[];
  documentCount: number;
}

export interface ProcessingMetrics {
  totalOpportunities: number;
  processedOpportunities: number;
  pendingOpportunities: number;
  failedOpportunities: number;
  successRate: number;
  totalCost: number;
  avgCostPerOpp: number;
  lastBatchAt: string | null;
}

/**
 * Get next batch of opportunities that need PDF processing
 */
export async function getPendingOpportunities(limit: number = 5): Promise<PendingOpportunity[]> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc('get_pending_opportunities_batch', {
    p_limit: limit,
  });

  if (error) {
    console.error('[Processing Queue] Error fetching pending opportunities:', error);
    throw error;
  }

  if (!data || data.length === 0) {
    console.log('[Processing Queue] No pending opportunities found');
    return [];
  }

  console.log(`[Processing Queue] Found ${data.length} opportunities needing processing`);

  return data.map((row: any) => ({
    noticeId: row.notice_id,
    title: row.title,
    resourceLinks: Array.isArray(row.resource_links)
      ? row.resource_links.filter((link: string) => link.toLowerCase().endsWith('.pdf'))
      : [],
    documentCount: row.document_count || 0,
  }));
}

/**
 * Check if an opportunity needs PDF processing
 */
export async function needsPDFProcessing(noticeId: string): Promise<boolean> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc('needs_pdf_processing', {
    p_notice_id: noticeId,
  });

  if (error) {
    console.error(`[Processing Queue] Error checking if ${noticeId} needs processing:`, error);
    return false;
  }

  return data === true;
}

/**
 * Mark opportunity as currently being processed
 */
export async function markAsProcessing(
  opportunityId: string,
  batchId: string
): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase.rpc('mark_opportunity_processing', {
    p_opportunity_id: opportunityId,
    p_batch_id: batchId,
  });

  if (error) {
    console.error(`[Processing Queue] Error marking ${opportunityId} as processing:`, error);
    throw error;
  }

  console.log(`[Processing Queue] Marked ${opportunityId} as processing (batch: ${batchId})`);
}

/**
 * Mark opportunity processing as completed
 */
export async function markAsCompleted(
  opportunityId: string,
  cost: number = 0,
  sectionMetadata: Record<string, any> = {}
): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase.rpc('mark_opportunity_completed', {
    p_opportunity_id: opportunityId,
    p_cost: cost,
    p_section_metadata: sectionMetadata,
  });

  if (error) {
    console.error(`[Processing Queue] Error marking ${opportunityId} as completed:`, error);
    throw error;
  }

  console.log(`[Processing Queue] Marked ${opportunityId} as completed (cost: $${cost.toFixed(4)})`);
}

/**
 * Mark opportunity processing as failed
 */
export async function markAsFailed(
  opportunityId: string,
  errorMessage: string
): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase.rpc('mark_opportunity_failed', {
    p_opportunity_id: opportunityId,
    p_error: errorMessage,
  });

  if (error) {
    console.error(`[Processing Queue] Error marking ${opportunityId} as failed:`, error);
    throw error;
  }

  console.log(`[Processing Queue] Marked ${opportunityId} as failed: ${errorMessage}`);
}

/**
 * Get processing metrics for monitoring
 */
export async function getProcessingMetrics(): Promise<ProcessingMetrics> {
  const supabase = await createClient();

  // Get counts by status
  const { data: statusCounts, error: statusError } = await supabase
    .from('opportunity_documents')
    .select('processing_status, embedding_cost_usd');

  if (statusError) {
    throw statusError;
  }

  const total = statusCounts?.length || 0;
  const completed = statusCounts?.filter((doc) => doc.processing_status === 'completed').length || 0;
  const pending = statusCounts?.filter((doc) => doc.processing_status === 'pending').length || 0;
  const failed = statusCounts?.filter((doc) => doc.processing_status === 'failed').length || 0;

  const totalCost = statusCounts?.reduce((sum, doc) => sum + (Number(doc.embedding_cost_usd) || 0), 0) || 0;

  // Get last batch timestamp
  const { data: lastBatch, error: batchError } = await supabase
    .from('opportunity_documents')
    .select('updated_at')
    .eq('processing_status', 'completed')
    .order('updated_at', { ascending: false })
    .limit(1)
    .single();

  return {
    totalOpportunities: total,
    processedOpportunities: completed,
    pendingOpportunities: pending,
    failedOpportunities: failed,
    successRate: total > 0 ? (completed / total) * 100 : 0,
    totalCost,
    avgCostPerOpp: completed > 0 ? totalCost / completed : 0,
    lastBatchAt: lastBatch?.updated_at || null,
  };
}

/**
 * Generate unique batch ID for tracking
 */
export function generateBatchId(): string {
  const timestamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0];
  const random = Math.random().toString(36).substring(2, 8);
  return `batch_${timestamp}_${random}`;
}

/**
 * Calculate embedding cost for a chunk of text
 * Based on OpenAI text-embedding-3-small pricing: $0.02 per 1M tokens
 */
export function calculateEmbeddingCost(tokenCount: number): number {
  const COST_PER_MILLION_TOKENS = 0.02;
  return (tokenCount / 1_000_000) * COST_PER_MILLION_TOKENS;
}

/**
 * Estimate tokens from text (rough approximation: 1 token ≈ 4 characters)
 */
export function estimateTokenCount(text: string): number {
  return Math.ceil(text.length / 4);
}
