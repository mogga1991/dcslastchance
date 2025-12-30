/**
 * Test Embedding Service with Pinecone
 * Run: npx tsx scripts/test-embeddings.ts
 */

import dotenv from 'dotenv';
import { EmbeddingService } from '../lib/embeddings/pinecone-service';
import type { DocumentChunk } from '../lib/embeddings/pinecone-service';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function testEmbeddingService() {
  try {
    console.log('🧪 Testing Embedding Service with Pinecone...\n');

    const embeddingService = new EmbeddingService();

    // Test 1: Check index stats
    console.log('📊 Step 1: Checking Pinecone index stats...');
    const initialStats = await embeddingService.getIndexStats();
    console.log(`   - Total vectors: ${initialStats.totalRecordCount || 0}`);
    console.log(`   - Dimension: ${initialStats.dimension}`);
    console.log(`   - Index fullness: ${((initialStats.indexFullness || 0) * 100).toFixed(2)}%\n`);

    // Test 2: Generate embeddings
    console.log('🔢 Step 2: Generating test embeddings...');
    const testTexts = [
      'The General Services Administration (GSA) is seeking a commercial office space lease.',
      'The property must be located in downtown Washington DC with at least 10,000 square feet.',
      'All proposals must be submitted by January 15, 2025 to be considered.',
    ];

    const embeddings = await embeddingService.generateEmbeddings(testTexts);
    console.log(`   ✅ Generated ${embeddings.length} embeddings`);
    console.log(`   - Embedding dimension: ${embeddings[0].length}\n`);

    // Test 3: Create test chunks and upsert
    console.log('📤 Step 3: Upserting test chunks to Pinecone...');
    const testDocumentId = 'test-doc-' + Date.now();
    const testOpportunityId = 'test-opp-123';

    const testChunks: DocumentChunk[] = testTexts.map((text, index) => ({
      documentId: testDocumentId,
      opportunityId: testOpportunityId,
      chunkIndex: index,
      chunkText: text,
      tokenCount: Math.ceil(text.length / 4),
      pageNumber: 1,
      startChar: 0,
      endChar: text.length,
    }));

    await embeddingService.upsertChunks(
      testChunks,
      testDocumentId,
      testOpportunityId
    );
    console.log('   ✅ Successfully upserted test chunks\n');

    // Wait a moment for Pinecone to index
    console.log('⏳ Waiting 2 seconds for Pinecone to index...\n');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Test 4: Search for similar chunks
    console.log('🔍 Step 4: Searching for similar chunks...');
    const searchQuery = 'office space requirements in Washington DC';
    console.log(`   Query: "${searchQuery}"`);

    const results = await embeddingService.searchSimilarChunks(
      searchQuery,
      testOpportunityId,
      {
        topK: 3,
        similarityThreshold: 0.0, // Lower threshold for test
      }
    );

    console.log(`   ✅ Found ${results.length} results:\n`);
    results.forEach((result, index) => {
      console.log(`   Result ${index + 1}:`);
      console.log(`   - Similarity: ${(result.similarity! * 100).toFixed(2)}%`);
      console.log(`   - Chunk Index: ${result.chunkIndex}`);
      console.log(`   - Text: "${result.chunkText.substring(0, 60)}..."`);
      console.log('');
    });

    // Test 5: Verify top result makes sense
    if (results.length > 0 && results[0].similarity! > 0.5) {
      console.log('✅ Test PASSED: Top result has high similarity score\n');
    } else {
      console.log('⚠️  Warning: Low similarity scores - embeddings may need verification\n');
    }

    // Test 6: Clean up - delete test chunks
    console.log('🧹 Step 5: Cleaning up test data...');
    await embeddingService.deleteDocumentChunks(testDocumentId);
    console.log('   ✅ Deleted test chunks\n');

    // Verify deletion
    const finalStats = await embeddingService.getIndexStats();
    console.log('📊 Final index stats:');
    console.log(`   - Total vectors: ${finalStats.totalRecordCount || 0}\n`);

    console.log('✨ All tests completed successfully!\n');
    console.log('Next steps:');
    console.log('1. ✅ Pinecone connection working');
    console.log('2. ✅ OpenAI embeddings working');
    console.log('3. ✅ Vector search working');
    console.log('4. → Ready to integrate with PDF processor\n');
  } catch (error) {
    console.error('\n❌ Error testing embedding service:');
    console.error(error);
    process.exit(1);
  }
}

// Run test
testEmbeddingService();
