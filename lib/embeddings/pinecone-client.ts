/**
 * Pinecone Client Initialization
 * Singleton pattern to reuse connection across API calls
 */

import { Pinecone } from '@pinecone-database/pinecone';

// Singleton instance
let pineconeClient: Pinecone | null = null;

/**
 * Get or create Pinecone client instance
 */
export function getPineconeClient(): Pinecone {
  if (!pineconeClient) {
    const apiKey = process.env.PINECONE_API_KEY;

    if (!apiKey) {
      throw new Error('PINECONE_API_KEY environment variable is not set');
    }

    pineconeClient = new Pinecone({
      apiKey,
    });
  }

  return pineconeClient;
}

/**
 * Index naming convention
 * Development: fedspace-development
 * Production: fedspace-production
 */
export const PINECONE_INDEX_NAME =
  process.env.NODE_ENV === 'production'
    ? 'fedspace-production'
    : 'fedspace-development';

/**
 * OpenAI text-embedding-3-small dimension
 */
export const EMBEDDING_DIMENSION = 1536;

/**
 * Vector similarity metric
 */
export const SIMILARITY_METRIC = 'cosine';
