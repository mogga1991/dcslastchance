/**
 * Pinecone Embedding Service
 *
 * Handles embedding generation with OpenAI and vector operations with Pinecone
 */

import OpenAI from 'openai';
import { getPineconeClient, PINECONE_INDEX_NAME } from './pinecone-client';
import type { TextChunk } from '../pdf-processor';

/**
 * OpenAI embedding model configuration
 */
const EMBEDDING_MODEL = 'text-embedding-3-small';
const EMBEDDING_DIMENSION = 1536;
const MAX_BATCH_SIZE = 100; // OpenAI accepts up to 2048, but we'll be conservative

/**
 * Document chunk with embedding
 */
export interface DocumentChunk extends TextChunk {
  documentId: string;
  opportunityId: string;
  embedding?: number[];
  similarity?: number;
}

/**
 * Pinecone vector metadata
 */
interface PineconeMetadata {
  documentId: string;
  opportunityId: string;
  chunkIndex: number;
  chunkText: string;
  tokenCount: number;
  pageNumber?: number;
  sectionName?: string;      // NEW: Section this chunk belongs to
  sectionKeywords?: string[]; // NEW: Keywords for better filtering
}

/**
 * Search options
 */
export interface SearchOptions {
  topK?: number;
  similarityThreshold?: number;
  filter?: Record<string, any>;
}

/**
 * Embedding Service Class
 */
export class EmbeddingService {
  private openai: OpenAI;
  private pineconeIndex: any;

  constructor(apiKey?: string) {
    this.openai = new OpenAI({
      apiKey: apiKey || process.env.OPENAI_API_KEY,
    });

    const pc = getPineconeClient();
    this.pineconeIndex = pc.index(PINECONE_INDEX_NAME);
  }

  /**
   * Generate embeddings for multiple text chunks
   */
  async generateEmbeddings(texts: string[]): Promise<number[][]> {
    const allEmbeddings: number[][] = [];

    // Process in batches to avoid rate limits
    for (let i = 0; i < texts.length; i += MAX_BATCH_SIZE) {
      const batch = texts.slice(i, i + MAX_BATCH_SIZE);

      console.log(
        `[Embedding Service] Generating embeddings for batch ${Math.floor(i / MAX_BATCH_SIZE) + 1} (${batch.length} texts)`
      );

      const response = await this.openai.embeddings.create({
        model: EMBEDDING_MODEL,
        input: batch,
        encoding_format: 'float',
      });

      const batchEmbeddings = response.data.map((item) => item.embedding);
      allEmbeddings.push(...batchEmbeddings);
    }

    return allEmbeddings;
  }

  /**
   * Generate embedding for a single text (helper method)
   */
  async generateEmbedding(text: string): Promise<number[]> {
    const [embedding] = await this.generateEmbeddings([text]);
    return embedding;
  }

  /**
   * Upsert document chunks with embeddings to Pinecone
   */
  async upsertChunks(
    chunks: DocumentChunk[],
    documentId: string,
    opportunityId: string
  ): Promise<void> {
    console.log(`[Embedding Service] Upserting ${chunks.length} chunks for document ${documentId}`);

    // Generate embeddings for all chunks
    const texts = chunks.map((chunk) => chunk.chunkText);
    const embeddings = await this.generateEmbeddings(texts);

    // Prepare vectors for Pinecone
    const vectors = chunks.map((chunk, index) => ({
      id: `${documentId}_chunk_${chunk.chunkIndex}`,
      values: embeddings[index],
      metadata: {
        documentId,
        opportunityId,
        chunkIndex: chunk.chunkIndex,
        chunkText: chunk.chunkText,
        tokenCount: chunk.tokenCount,
        pageNumber: chunk.pageNumber,
      } as PineconeMetadata,
    }));

    // Upsert to Pinecone in batches
    const UPSERT_BATCH_SIZE = 100;
    for (let i = 0; i < vectors.length; i += UPSERT_BATCH_SIZE) {
      const batch = vectors.slice(i, i + UPSERT_BATCH_SIZE);

      await this.pineconeIndex.upsert(batch);

      console.log(
        `[Embedding Service] Upserted batch ${Math.floor(i / UPSERT_BATCH_SIZE) + 1} (${batch.length} vectors)`
      );
    }

    console.log(`[Embedding Service] Successfully upserted ${vectors.length} vectors`);
  }

  /**
   * Search for similar document chunks
   */
  async searchSimilarChunks(
    query: string,
    opportunityId: string,
    options: SearchOptions = {}
  ): Promise<DocumentChunk[]> {
    const {
      topK = 5,
      similarityThreshold = 0.7,
      filter = {},
    } = options;

    console.log(`[Embedding Service] Searching for chunks similar to: "${query.substring(0, 50)}..."`);

    // Generate query embedding
    const queryEmbedding = await this.generateEmbedding(query);

    // Search Pinecone with opportunityId filter
    const searchFilter = {
      ...filter,
      opportunityId: { $eq: opportunityId },
    };

    const queryResponse = await this.pineconeIndex.query({
      vector: queryEmbedding,
      topK,
      filter: searchFilter,
      includeMetadata: true,
    });

    // Convert Pinecone results to DocumentChunk format
    const results: DocumentChunk[] = queryResponse.matches
      .filter((match: any) => match.score >= similarityThreshold)
      .map((match: any) => {
        const metadata = match.metadata as PineconeMetadata;
        return {
          documentId: metadata.documentId,
          opportunityId: metadata.opportunityId,
          chunkIndex: metadata.chunkIndex,
          chunkText: metadata.chunkText,
          tokenCount: metadata.tokenCount,
          pageNumber: metadata.pageNumber,
          startChar: 0, // Not stored in Pinecone
          endChar: metadata.chunkText.length,
          similarity: match.score,
        };
      });

    console.log(`[Embedding Service] Found ${results.length} chunks above ${similarityThreshold} similarity`);

    return results;
  }

  /**
   * Delete all chunks for a specific document
   */
  async deleteDocumentChunks(documentId: string): Promise<void> {
    console.log(`[Embedding Service] Deleting chunks for document ${documentId}`);

    try {
      // Pinecone doesn't support delete by metadata filter directly
      // We need to fetch IDs first, then delete
      const allMatches = await this.pineconeIndex.query({
        vector: new Array(EMBEDDING_DIMENSION).fill(0), // Dummy vector
        topK: 10000, // Max results
        filter: {
          documentId: { $eq: documentId },
        },
        includeMetadata: false,
      });

      if (allMatches.matches.length === 0) {
        console.log(`[Embedding Service] No chunks found for document ${documentId}`);
        return;
      }

      const idsToDelete = allMatches.matches.map((match: any) => match.id);

      await this.pineconeIndex.deleteMany(idsToDelete);

      console.log(`[Embedding Service] Deleted ${idsToDelete.length} chunks`);
    } catch (error) {
      console.error(`[Embedding Service] Error deleting chunks:`, error);
      throw error;
    }
  }

  /**
   * Delete all chunks for a specific opportunity
   */
  async deleteOpportunityChunks(opportunityId: string): Promise<void> {
    console.log(`[Embedding Service] Deleting all chunks for opportunity ${opportunityId}`);

    try {
      const allMatches = await this.pineconeIndex.query({
        vector: new Array(EMBEDDING_DIMENSION).fill(0), // Dummy vector
        topK: 10000, // Max results
        filter: {
          opportunityId: { $eq: opportunityId },
        },
        includeMetadata: false,
      });

      if (allMatches.matches.length === 0) {
        console.log(`[Embedding Service] No chunks found for opportunity ${opportunityId}`);
        return;
      }

      const idsToDelete = allMatches.matches.map((match: any) => match.id);

      await this.pineconeIndex.deleteMany(idsToDelete);

      console.log(`[Embedding Service] Deleted ${idsToDelete.length} chunks`);
    } catch (error) {
      console.error(`[Embedding Service] Error deleting chunks:`, error);
      throw error;
    }
  }

  /**
   * Get index statistics
   */
  async getIndexStats(): Promise<any> {
    return await this.pineconeIndex.describeIndexStats();
  }
}

/**
 * Singleton instance (optional - can also create new instances)
 */
let embeddingServiceInstance: EmbeddingService | null = null;

export function getEmbeddingService(): EmbeddingService {
  if (!embeddingServiceInstance) {
    embeddingServiceInstance = new EmbeddingService();
  }
  return embeddingServiceInstance;
}
