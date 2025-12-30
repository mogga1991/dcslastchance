/**
 * One-time Pinecone Index Setup Script
 * Run: npx tsx scripts/setup-pinecone-index.ts
 */

import dotenv from 'dotenv';
import { getPineconeClient, PINECONE_INDEX_NAME, EMBEDDING_DIMENSION, SIMILARITY_METRIC } from '../lib/embeddings/pinecone-client';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

async function setupPineconeIndex() {
  try {
    console.log('🔧 Setting up Pinecone index...\n');

    const pc = getPineconeClient();

    // Check if index already exists
    console.log('📋 Checking for existing indexes...');
    const indexes = await pc.listIndexes();
    const indexExists = indexes.indexes?.some(idx => idx.name === PINECONE_INDEX_NAME);

    if (indexExists) {
      console.log(`✅ Index "${PINECONE_INDEX_NAME}" already exists\n`);

      // Get index stats
      const index = pc.index(PINECONE_INDEX_NAME);
      const stats = await index.describeIndexStats();

      console.log('📊 Index Statistics:');
      console.log(`   - Total vectors: ${stats.totalRecordCount || 0}`);
      console.log(`   - Dimension: ${stats.dimension || EMBEDDING_DIMENSION}`);
      console.log(`   - Index fullness: ${((stats.indexFullness || 0) * 100).toFixed(2)}%`);

      if (stats.namespaces) {
        console.log(`   - Namespaces: ${Object.keys(stats.namespaces).length}`);
      }
    } else {
      console.log(`📝 Creating new index: "${PINECONE_INDEX_NAME}"...`);

      await pc.createIndex({
        name: PINECONE_INDEX_NAME,
        dimension: EMBEDDING_DIMENSION,
        metric: SIMILARITY_METRIC,
        spec: {
          serverless: {
            cloud: 'aws',
            region: 'us-east-1'  // Same region as Supabase for low latency
          }
        }
      });

      console.log('✅ Index created successfully!');
      console.log('⏳ Waiting for index to be ready...\n');

      // Wait for index to be ready
      let isReady = false;
      let attempts = 0;
      const maxAttempts = 30;

      while (!isReady && attempts < maxAttempts) {
        try {
          const index = pc.index(PINECONE_INDEX_NAME);
          const stats = await index.describeIndexStats();

          if (stats) {
            isReady = true;
            console.log('✅ Index is ready!\n');
            console.log('📊 Initial Statistics:');
            console.log(`   - Dimension: ${stats.dimension}`);
            console.log(`   - Total vectors: ${stats.totalRecordCount || 0}`);
          }
        } catch (error) {
          attempts++;
          console.log(`   Attempt ${attempts}/${maxAttempts}...`);
          await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
        }
      }

      if (!isReady) {
        throw new Error('Index creation timed out. Please check Pinecone dashboard.');
      }
    }

    console.log('\n✨ Setup complete!');
    console.log(`\nYou can now use the index: "${PINECONE_INDEX_NAME}"`);
    console.log('Next step: Test with a sample document\n');

  } catch (error) {
    console.error('\n❌ Error setting up Pinecone index:');
    console.error(error);
    process.exit(1);
  }
}

// Run setup
setupPineconeIndex();
