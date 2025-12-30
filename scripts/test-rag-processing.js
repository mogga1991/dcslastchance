/**
 * Test RAG Processing Script
 *
 * Manually processes a few GSA lease opportunities to test the RAG system
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testRAGProcessing() {
  console.log('🔍 Finding opportunities with PDF attachments...\n');

  // Find opportunities with PDF attachments
  const { data: opportunities, error } = await supabase
    .from('opportunities')
    .select('notice_id, title, full_data')
    .not('full_data->resourceLinks', 'is', null)
    .limit(5);

  if (error) {
    console.error('Error fetching opportunities:', error);
    return;
  }

  console.log(`Found ${opportunities.length} opportunities to process\n`);

  for (const opp of opportunities) {
    const resourceLinks = opp.full_data?.resourceLinks || [];
    const pdfLinks = resourceLinks.filter(link =>
      typeof link === 'string' && link.toLowerCase().endsWith('.pdf')
    );

    if (pdfLinks.length === 0) {
      console.log(`⏭️  Skipping ${opp.notice_id} - no PDF attachments`);
      continue;
    }

    console.log(`\n📄 Processing: ${opp.title}`);
    console.log(`   Notice ID: ${opp.notice_id}`);
    console.log(`   PDFs found: ${pdfLinks.length}`);
    console.log(`   Links: ${pdfLinks.join(', ')}\n`);

    // Call the processing API
    try {
      const response = await fetch('http://localhost:3002/api/process-opportunity-documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          opportunityId: opp.notice_id,
          resourceLinks: pdfLinks,
          userId: 'test-script',
          batchProcessing: true,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error(`   ❌ Failed to process: ${error}`);
        continue;
      }

      const result = await response.json();
      console.log(`   ✅ Success!`);
      console.log(`      Documents: ${result.documentsProcessed}/${pdfLinks.length}`);
      console.log(`      Chunks: ${result.totalChunks}`);
      console.log(`      Cost: $${result.totalCost.toFixed(4)}`);
      console.log(`      Sections: ${result.sectionMetadata?.totalSections || 0}`);
      console.log(`      Processing time: ${(result.processingTimeMs / 1000).toFixed(2)}s`);
    } catch (error) {
      console.error(`   ❌ Error processing:`, error.message);
    }
  }

  console.log('\n✨ Test processing complete!');
  console.log('\nYou can now test the RAG chat on these opportunities:');
  opportunities.forEach(opp => {
    console.log(`   - ${opp.title} (${opp.notice_id})`);
  });
}

testRAGProcessing().catch(console.error);
