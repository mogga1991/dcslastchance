/**
 * Test PDF Processor
 * Run: npx tsx scripts/test-pdf-processor.ts
 */

import dotenv from 'dotenv';
import { processPDFDocument } from '../lib/pdf-processor';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function testPDFProcessor() {
  try {
    console.log('🧪 Testing PDF Processor...\n');

    // Test with a real SAM.gov PDF URL
    // Note: You'll need to replace this with an actual PDF URL from a SAM.gov opportunity
    const testUrl = process.argv[2];

    if (!testUrl) {
      console.log('Usage: npx tsx scripts/test-pdf-processor.ts <pdf-url>');
      console.log('\nExample:');
      console.log('npx tsx scripts/test-pdf-processor.ts "https://sam.gov/...pdf"');
      console.log('\nTo get a test URL:');
      console.log('1. Go to https://sam.gov');
      console.log('2. Find a GSA lease opportunity with PDF attachments');
      console.log('3. Copy the PDF URL and pass it as an argument');
      process.exit(1);
    }

    console.log(`📄 Testing with URL: ${testUrl}\n`);

    const result = await processPDFDocument(
      testUrl,
      'test-opportunity-123',
      'test-document-456'
    );

    console.log('\n✅ PDF Processing Results:\n');
    console.log(`📊 Metadata:`);
    console.log(`   - Page Count: ${result.metadata.pageCount}`);
    console.log(`   - Title: ${result.metadata.title || 'N/A'}`);
    console.log(`   - Author: ${result.metadata.author || 'N/A'}`);
    console.log(`   - Creation Date: ${result.metadata.creationDate?.toISOString() || 'N/A'}`);

    console.log(`\n📝 Text Extraction:`);
    console.log(`   - Total Characters: ${result.text.length}`);
    console.log(`   - Total Words: ~${Math.round(result.text.split(/\s+/).length)}`);
    console.log(`   - Estimated Tokens: ~${Math.round(result.text.length / 4)}`);

    console.log(`\n🧩 Chunking:`);
    console.log(`   - Total Chunks: ${result.chunks.length}`);
    console.log(`   - Avg Chunk Size: ~${Math.round(result.chunks.reduce((sum, c) => sum + c.tokenCount, 0) / result.chunks.length)} tokens`);

    console.log(`\n⏱️  Processing Time: ${result.processingTimeMs}ms`);

    // Show first chunk as example
    if (result.chunks.length > 0) {
      const firstChunk = result.chunks[0];
      console.log(`\n📖 Sample Chunk (Chunk #0):`);
      console.log(`   - Token Count: ${firstChunk.tokenCount}`);
      console.log(`   - Preview: ${firstChunk.chunkText.substring(0, 200)}...`);
    }

    // Show chunk distribution
    console.log(`\n📊 Chunk Size Distribution:`);
    const sizes = result.chunks.map(c => c.tokenCount);
    console.log(`   - Min: ${Math.min(...sizes)} tokens`);
    console.log(`   - Max: ${Math.max(...sizes)} tokens`);
    console.log(`   - Avg: ${Math.round(sizes.reduce((a, b) => a + b, 0) / sizes.length)} tokens`);

    console.log('\n✨ Test complete!\n');
  } catch (error) {
    console.error('\n❌ Error testing PDF processor:');
    console.error(error);
    process.exit(1);
  }
}

// Run test
testPDFProcessor();
