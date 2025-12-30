/**
 * PDF Processing Utilities
 *
 * Downloads, extracts, and chunks PDF documents from SAM.gov
 */

import pdf from 'pdf-parse';
import type { DocumentSection, DocumentStructure } from './document-structure-analyzer';

/**
 * Allowed domains for PDF downloads (security)
 */
const ALLOWED_DOMAINS = ['sam.gov', 'fbo.gov', 'beta.sam.gov'];

/**
 * PDF processing configuration
 */
const MAX_PDF_SIZE = parseInt(process.env.MAX_PDF_SIZE_MB || '50') * 1024 * 1024; // Default 50MB
const DOWNLOAD_TIMEOUT = parseInt(process.env.PDF_PROCESSING_TIMEOUT_MS || '30000'); // Default 30s
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

/**
 * Chunking configuration (based on tokens)
 * Average: 1 token ≈ 0.75 words ≈ 4 characters
 */
const CHUNK_SIZE_TOKENS = 800;
const CHUNK_OVERLAP_TOKENS = 100;
const CHARS_PER_TOKEN = 4;
const CHUNK_SIZE_CHARS = CHUNK_SIZE_TOKENS * CHARS_PER_TOKEN;
const CHUNK_OVERLAP_CHARS = CHUNK_OVERLAP_TOKENS * CHARS_PER_TOKEN;

export interface PDFMetadata {
  pageCount: number;
  title?: string;
  author?: string;
  creationDate?: Date;
}

export interface TextChunk {
  chunkIndex: number;
  chunkText: string;
  tokenCount: number;
  pageNumber?: number;
  startChar: number;
  endChar: number;
  sectionName?: string;      // NEW: Section this chunk belongs to
  sectionKeywords?: string[]; // NEW: Keywords for better search
}

export interface ProcessedDocument {
  documentId: string;
  opportunityId: string;
  text: string;
  metadata: PDFMetadata;
  chunks: TextChunk[];
  processingTimeMs: number;
}

/**
 * Download PDF from URL with retry logic
 */
export async function downloadPDF(url: string): Promise<Buffer> {
  // Validate URL domain
  const urlObj = new URL(url);
  const isAllowedDomain = ALLOWED_DOMAINS.some(domain =>
    urlObj.hostname.endsWith(domain)
  );

  if (!isAllowedDomain) {
    throw new Error(`PDF download restricted to allowed domains: ${ALLOWED_DOMAINS.join(', ')}`);
  }

  return withRetry(async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), DOWNLOAD_TIMEOUT);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'FedSpace/1.0 (GSA Leasing Platform)'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Check content type
      const contentType = response.headers.get('content-type');
      if (contentType && !contentType.includes('pdf')) {
        throw new Error(`Invalid content type: ${contentType}. Expected PDF.`);
      }

      // Check size
      const contentLength = response.headers.get('content-length');
      if (contentLength && parseInt(contentLength) > MAX_PDF_SIZE) {
        throw new Error(`PDF too large: ${contentLength} bytes (max: ${MAX_PDF_SIZE})`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      if (buffer.length > MAX_PDF_SIZE) {
        throw new Error(`PDF too large: ${buffer.length} bytes (max: ${MAX_PDF_SIZE})`);
      }

      return buffer;
    } finally {
      clearTimeout(timeoutId);
    }
  }, MAX_RETRIES, RETRY_DELAY);
}

/**
 * Extract text and metadata from PDF buffer
 */
export async function extractPDFText(buffer: Buffer): Promise<{
  text: string;
  metadata: PDFMetadata;
}> {
  const data = await pdf(buffer);

  const metadata: PDFMetadata = {
    pageCount: data.numpages,
    title: data.info?.Title,
    author: data.info?.Author,
    creationDate: data.info?.CreationDate ? new Date(data.info.CreationDate) : undefined,
  };

  // Clean up extracted text
  const text = data.text
    .replace(/\r\n/g, '\n') // Normalize line endings
    .replace(/\n{3,}/g, '\n\n') // Remove excessive newlines
    .trim();

  return { text, metadata };
}

/**
 * Chunk text into overlapping segments
 *
 * Uses character-based chunking with token estimation
 */
export function chunkText(
  text: string,
  options?: {
    maxTokens?: number;
    overlap?: number;
  }
): TextChunk[] {
  const maxChars = (options?.maxTokens || CHUNK_SIZE_TOKENS) * CHARS_PER_TOKEN;
  const overlapChars = (options?.overlap || CHUNK_OVERLAP_TOKENS) * CHARS_PER_TOKEN;

  const chunks: TextChunk[] = [];
  let startChar = 0;
  let chunkIndex = 0;

  while (startChar < text.length) {
    // Calculate end position
    let endChar = Math.min(startChar + maxChars, text.length);

    // Try to break at sentence boundary (., !, ?)
    if (endChar < text.length) {
      const lastPeriod = text.lastIndexOf('.', endChar);
      const lastExclaim = text.lastIndexOf('!', endChar);
      const lastQuestion = text.lastIndexOf('?', endChar);
      const breakPoint = Math.max(lastPeriod, lastExclaim, lastQuestion);

      // Only use sentence boundary if it's reasonably close
      if (breakPoint > startChar + maxChars * 0.5) {
        endChar = breakPoint + 1;
      }
    }

    const chunkText = text.slice(startChar, endChar).trim();

    if (chunkText.length > 0) {
      chunks.push({
        chunkIndex,
        chunkText,
        tokenCount: Math.ceil(chunkText.length / CHARS_PER_TOKEN),
        startChar,
        endChar,
      });

      chunkIndex++;
    }

    // Move start position with overlap
    startChar = endChar - overlapChars;

    // Prevent infinite loop
    if (startChar >= endChar) {
      startChar = endChar;
    }
  }

  return chunks;
}

/**
 * Chunk text with section awareness (SMART CHUNKING)
 *
 * Uses document structure to create semantically coherent chunks:
 * - Small sections (< 800 tokens): Keep intact
 * - Large sections: Split with context preservation
 * - All chunks tagged with section metadata
 */
export function chunkTextWithSections(
  text: string,
  documentStructure: DocumentStructure,
  options?: {
    maxTokens?: number;
    overlap?: number;
  }
): TextChunk[] {
  const maxChars = (options?.maxTokens || CHUNK_SIZE_TOKENS) * CHARS_PER_TOKEN;
  const overlapChars = (options?.overlap || CHUNK_OVERLAP_TOKENS) * CHARS_PER_TOKEN;

  const chunks: TextChunk[] = [];
  let chunkIndex = 0;

  // If no sections detected, fall back to regular chunking
  if (!documentStructure.sections || documentStructure.sections.length === 0) {
    console.log('[PDF Processor] No sections detected, using regular chunking');
    return chunkText(text, options);
  }

  console.log(`[PDF Processor] Smart chunking with ${documentStructure.sections.length} sections`);

  // Process each section
  for (const section of documentStructure.sections) {
    const sectionText = text.slice(section.startCharIndex, section.endCharIndex).trim();
    const sectionTokens = Math.ceil(sectionText.length / CHARS_PER_TOKEN);

    // Case 1: Small section - keep intact
    if (sectionTokens <= maxChars / CHARS_PER_TOKEN) {
      chunks.push({
        chunkIndex,
        chunkText: sectionText,
        tokenCount: sectionTokens,
        pageNumber: section.startPage,
        startChar: section.startCharIndex,
        endChar: section.endCharIndex,
        sectionName: section.sectionName,
        sectionKeywords: section.keywords,
      });

      chunkIndex++;
      continue;
    }

    // Case 2: Large section - split with context preservation
    let startChar = 0;
    while (startChar < sectionText.length) {
      let endChar = Math.min(startChar + maxChars, sectionText.length);

      // Try to break at sentence boundary
      if (endChar < sectionText.length) {
        const lastPeriod = sectionText.lastIndexOf('.', endChar);
        const lastExclaim = sectionText.lastIndexOf('!', endChar);
        const lastQuestion = sectionText.lastIndexOf('?', endChar);
        const breakPoint = Math.max(lastPeriod, lastExclaim, lastQuestion);

        if (breakPoint > startChar + maxChars * 0.5) {
          endChar = breakPoint + 1;
        }
      }

      const chunkText = sectionText.slice(startChar, endChar).trim();

      if (chunkText.length > 0) {
        chunks.push({
          chunkIndex,
          chunkText,
          tokenCount: Math.ceil(chunkText.length / CHARS_PER_TOKEN),
          pageNumber: section.startPage,
          startChar: section.startCharIndex + startChar,
          endChar: section.startCharIndex + endChar,
          sectionName: section.sectionName,
          sectionKeywords: section.keywords,
        });

        chunkIndex++;
      }

      // Move start position with overlap
      startChar = endChar - overlapChars;

      // Prevent infinite loop
      if (startChar >= endChar) {
        startChar = endChar;
      }
    }
  }

  console.log(`[PDF Processor] Created ${chunks.length} smart chunks from ${documentStructure.sections.length} sections`);

  return chunks;
}

/**
 * Main orchestration: Download → Extract → Chunk
 */
export async function processPDFDocument(
  url: string,
  opportunityId: string,
  documentId: string
): Promise<ProcessedDocument> {
  const startTime = Date.now();

  console.log(`[PDF Processor] Processing document ${documentId} for opportunity ${opportunityId}`);
  console.log(`[PDF Processor] Downloading from: ${url}`);

  // Download PDF
  const buffer = await downloadPDF(url);
  console.log(`[PDF Processor] Downloaded ${buffer.length} bytes`);

  // Extract text and metadata
  const { text, metadata } = await extractPDFText(buffer);
  console.log(`[PDF Processor] Extracted ${text.length} characters, ${metadata.pageCount} pages`);

  // Chunk text
  const chunks = chunkText(text);
  console.log(`[PDF Processor] Created ${chunks.length} chunks`);

  const processingTimeMs = Date.now() - startTime;

  return {
    documentId,
    opportunityId,
    text,
    metadata,
    chunks,
    processingTimeMs,
  };
}

/**
 * Retry helper with exponential backoff
 */
async function withRetry<T>(
  fn: () => Promise<T>,
  maxAttempts: number,
  delayMs: number
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt === maxAttempts) {
        throw lastError;
      }

      // Exponential backoff: 1s, 2s, 4s...
      const backoffDelay = delayMs * Math.pow(2, attempt - 1);
      console.log(`[PDF Processor] Attempt ${attempt}/${maxAttempts} failed, retrying in ${backoffDelay}ms...`);

      await new Promise(resolve => setTimeout(resolve, backoffDelay));
    }
  }

  throw lastError;
}
