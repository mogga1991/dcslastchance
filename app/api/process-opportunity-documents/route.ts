/**
 * Process Opportunity Documents API
 *
 * Downloads PDFs from SAM.gov, extracts text, generates embeddings,
 * and stores vectors in Pinecone for RAG-powered chat.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  downloadPDF,
  extractPDFText,
  chunkTextWithSections,
  chunkText,
} from '@/lib/pdf-processor';
import { getEmbeddingService } from '@/lib/embeddings/pinecone-service';
import { analyzeDocumentStructure } from '@/lib/document-structure-analyzer';
import { calculateEmbeddingCost, estimateTokenCount } from '@/lib/processing-queue';

const MAX_CONCURRENT_DOWNLOADS = parseInt(
  process.env.MAX_CONCURRENT_PDF_DOWNLOADS || '3'
);

interface ProcessDocumentsRequest {
  opportunityId: string;
  resourceLinks: string[];
  userId: string;
  batchProcessing?: boolean; // Set to true when called by cron job
}

interface ProcessingResult {
  url: string;
  documentId: string;
  success: boolean;
  chunksCreated: number;
  processingTimeMs: number;
  sectionsDetected?: number;
  detectionMethod?: 'regex' | 'claude' | 'hybrid';
  embeddingCost?: number;
  error?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ProcessDocumentsRequest = await request.json();
    const { opportunityId, resourceLinks, userId, batchProcessing } = body;

    console.log('[Process Documents API] Starting processing:', {
      opportunityId,
      documentCount: resourceLinks.length,
      userId,
      batchProcessing,
    });

    // Validate request
    if (!opportunityId || !resourceLinks || resourceLinks.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields: opportunityId, resourceLinks' },
        { status: 400 }
      );
    }

    // Check if feature is enabled
    if (process.env.ENABLE_PDF_ANALYSIS !== 'true') {
      return NextResponse.json(
        { error: 'PDF analysis feature is not enabled' },
        { status: 503 }
      );
    }

    // Get Supabase client
    const supabase = await createClient();

    // Verify user authentication (skip for batch processing)
    if (!batchProcessing) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
    }

    // Filter for PDF URLs only
    const pdfUrls = resourceLinks.filter((url) =>
      url.toLowerCase().endsWith('.pdf')
    );

    if (pdfUrls.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No PDF documents to process',
        documentsProcessed: 0,
        totalChunks: 0,
      });
    }

    console.log(`[Process Documents API] Found ${pdfUrls.length} PDF URLs`);

    // Get embedding service
    const embeddingService = getEmbeddingService();

    // Process PDFs in parallel (with concurrency limit)
    const results: ProcessingResult[] = [];
    const totalStartTime = Date.now();

    for (let i = 0; i < pdfUrls.length; i += MAX_CONCURRENT_DOWNLOADS) {
      const batch = pdfUrls.slice(i, i + MAX_CONCURRENT_DOWNLOADS);
      console.log(
        `[Process Documents API] Processing batch ${Math.floor(i / MAX_CONCURRENT_DOWNLOADS) + 1} (${batch.length} PDFs)`
      );

      const batchPromises = batch.map(async (url) => {
        try {
          const docStartTime = Date.now();

          // Generate unique document ID
          const documentId = `${opportunityId}_${Date.now()}_${Math.random().toString(36).substring(7)}`;

          console.log(`[Process Documents API] Processing ${url}`);

          // Step 1: Download PDF
          const buffer = await downloadPDF(url);
          console.log(`[Process Documents API] Downloaded ${buffer.length} bytes`);

          // Step 2: Extract text and metadata
          const { text, metadata } = await extractPDFText(buffer);
          console.log(
            `[Process Documents API] Extracted ${text.length} characters, ${metadata.pageCount} pages`
          );

          // Step 3: Analyze document structure (regex + Claude fallback)
          const documentStructure = await analyzeDocumentStructure(text, metadata);
          console.log(
            `[Process Documents API] Structure analysis: ${documentStructure.sections.length} sections via ${documentStructure.detectionMethod}`
          );

          // Step 4: Smart chunking with section awareness
          const chunks =
            documentStructure.sections.length > 0
              ? chunkTextWithSections(text, documentStructure)
              : chunkText(text);

          console.log(`[Process Documents API] Created ${chunks.length} chunks`);

          // Step 5: Calculate embedding cost
          const totalTokens = chunks.reduce((sum, chunk) => sum + chunk.tokenCount, 0);
          const embeddingCost = calculateEmbeddingCost(totalTokens);

          console.log(
            `[Process Documents API] Total tokens: ${totalTokens}, Estimated cost: $${embeddingCost.toFixed(4)}`
          );

          // Step 6: Generate embeddings and upsert to Pinecone
          await embeddingService.upsertChunks(chunks, documentId, opportunityId);

          // Step 7: Store metadata in Supabase
          try {
            const sectionMetadata = {
              sections: documentStructure.sections.map((s) => ({
                name: s.sectionName,
                startPage: s.startPage,
                endPage: s.endPage,
                keywords: s.keywords,
                confidence: s.confidence,
              })),
              detectionMethod: documentStructure.detectionMethod,
              confidence: documentStructure.confidence,
            };

            const { error: dbError } = await supabase
              .from('opportunity_documents')
              .upsert({
                id: documentId,
                opportunity_id: opportunityId,
                url,
                page_count: metadata.pageCount,
                title: metadata.title,
                chunk_count: chunks.length,
                processing_status: 'completed',
                processed_at: new Date().toISOString(),
                section_metadata: sectionMetadata,
                document_structure: documentStructure,
                embedding_cost_usd: embeddingCost,
              });

            if (dbError) {
              console.warn(
                '[Process Documents API] Failed to store metadata in Supabase:',
                dbError
              );
              // Continue anyway - vectors are the critical part
            }
          } catch (dbError) {
            console.warn(
              '[Process Documents API] Supabase error (table may not exist yet):',
              dbError
            );
          }

          const processingTimeMs = Date.now() - docStartTime;

          console.log(
            `[Process Documents API] Successfully processed ${url} in ${processingTimeMs}ms`
          );

          return {
            url,
            documentId,
            success: true,
            chunksCreated: chunks.length,
            processingTimeMs,
            sectionsDetected: documentStructure.sections.length,
            detectionMethod: documentStructure.detectionMethod,
            embeddingCost,
          } as ProcessingResult;
        } catch (error) {
          console.error(`[Process Documents API] Error processing ${url}:`, error);

          return {
            url,
            documentId: '',
            success: false,
            chunksCreated: 0,
            processingTimeMs: 0,
            error: error instanceof Error ? error.message : 'Unknown error',
          } as ProcessingResult;
        }
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
    }

    const totalProcessingTime = Date.now() - totalStartTime;

    // Calculate summary
    const successfulDocs = results.filter((r) => r.success).length;
    const totalChunks = results.reduce((sum, r) => sum + r.chunksCreated, 0);
    const totalCost = results
      .filter((r) => r.success)
      .reduce((sum, r) => sum + (r.embeddingCost || 0), 0);
    const totalSections = results
      .filter((r) => r.success)
      .reduce((sum, r) => sum + (r.sectionsDetected || 0), 0);
    const failedDocs = results.filter((r) => !r.success);

    // Aggregate section metadata for all processed documents
    const sectionMetadata = {
      totalSections,
      avgSectionsPerDoc:
        successfulDocs > 0 ? (totalSections / successfulDocs).toFixed(1) : 0,
      detectionMethods: results
        .filter((r) => r.success && r.detectionMethod)
        .reduce(
          (acc, r) => {
            acc[r.detectionMethod!] = (acc[r.detectionMethod!] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>
        ),
    };

    console.log('[Process Documents API] Processing complete:', {
      totalDocs: results.length,
      successful: successfulDocs,
      failed: failedDocs.length,
      totalChunks,
      totalCost: `$${totalCost.toFixed(4)}`,
      totalSections,
      totalTimeMs: totalProcessingTime,
    });

    return NextResponse.json({
      success: true,
      documentsProcessed: successfulDocs,
      documentsFailed: failedDocs.length,
      totalChunks,
      totalCost,
      sectionMetadata,
      processingTimeMs: totalProcessingTime,
      results,
    });
  } catch (error) {
    console.error('[Process Documents API] Unexpected error:', error);

    return NextResponse.json(
      {
        error: 'Failed to process documents',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to check processing status
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const opportunityId = searchParams.get('opportunityId');

    if (!opportunityId) {
      return NextResponse.json(
        { error: 'Missing opportunityId parameter' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Check if documents have been processed
    const { data: documents, error } = await supabase
      .from('opportunity_documents')
      .select('*')
      .eq('opportunity_id', opportunityId);

    if (error) {
      console.error('[Process Documents API] Error fetching documents:', error);
      return NextResponse.json(
        { error: 'Database error' },
        { status: 500 }
      );
    }

    const allProcessed = documents?.every(
      (doc) => doc.processing_status === 'completed'
    );
    const anyProcessing = documents?.some(
      (doc) => doc.processing_status === 'processing'
    );
    const totalChunks = documents?.reduce(
      (sum, doc) => sum + (doc.chunk_count || 0),
      0
    );

    return NextResponse.json({
      opportunityId,
      documentCount: documents?.length || 0,
      allProcessed,
      anyProcessing,
      totalChunks,
      documents,
    });
  } catch (error) {
    console.error('[Process Documents API] Unexpected error:', error);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
