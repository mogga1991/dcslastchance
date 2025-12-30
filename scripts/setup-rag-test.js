const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://clxqdctofuxqjjonvytm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNseHFkY3RvZnV4cWpqb252eXRtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTQ5Njg0MywiZXhwIjoyMDgxMDcyODQzfQ.rsFGPYgHdy4SjTjp-pL_0pZdM6s41xkodaAOZMwDCPk'
);

async function setupRAG() {
  console.log('🚀 Quick RAG Testing Setup\n');

  // Step 1: Sync opportunities from SAM.gov
  console.log('📥 Step 1: Fetching real GSA opportunities from SAM.gov...');
  try {
    const syncResp = await fetch('http://localhost:3002/api/sync-opportunities', {
      method: 'POST',
    });
    if (syncResp.ok) {
      const syncData = await syncResp.json();
      console.log(`✅ Sync complete: ${syncData.imported || 0} new, ${syncData.updated || 0} updated\n`);
    } else {
      console.log(`⚠️  Sync response: ${syncResp.status}\n`);
    }
  } catch (error) {
    console.log(`⚠️  Sync error: ${error.message}\n`);
  }

  // Step 2: Find opportunity with PDF
  console.log('🔍 Step 2: Finding opportunities with PDF attachments...');
  const { data, error } = await supabase
    .from('opportunities')
    .select('notice_id, title, full_data')
    .not('full_data', 'is', null)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error || !data) {
    console.log('❌ Error fetching opportunities:', error);
    return;
  }

  const oppWithPDF = data.find(opp => {
    const links = opp.full_data?.resourceLinks || [];
    return links.some(l => l && typeof l === 'string' && l.toLowerCase().endsWith('.pdf'));
  });

  if (!oppWithPDF) {
    console.log('❌ No opportunities with PDFs found. The sync may not have found GSA leases with attachments.');
    console.log('   Try again in a few minutes or check SAM.gov directly.');
    return;
  }

  const pdfLinks = (oppWithPDF.full_data?.resourceLinks || [])
    .filter(l => l && typeof l === 'string' && l.toLowerCase().endsWith('.pdf'));

  console.log(`✅ Found opportunity with ${pdfLinks.length} PDF(s)`);
  console.log(`   Title: ${oppWithPDF.title.substring(0, 60)}...`);
  console.log(`   Notice ID: ${oppWithPDF.notice_id}\n`);

  // Step 3: Process PDFs
  console.log('⚙️  Step 3: Processing PDF documents (this may take 30-60 seconds)...\n');

  const response = await fetch('http://localhost:3002/api/process-opportunity-documents', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      opportunityId: oppWithPDF.notice_id,
      resourceLinks: pdfLinks,
      userId: 'test-script',
      batchProcessing: true,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.log(`❌ Processing failed: ${errorText}`);
    return;
  }

  const result = await response.json();
  console.log(`✅ Processing Complete!\n`);
  console.log(`📊 Results:`);
  console.log(`   Documents processed: ${result.documentsProcessed}/${pdfLinks.length}`);
  console.log(`   Total chunks created: ${result.totalChunks}`);
  console.log(`   Sections detected: ${result.sectionMetadata?.totalSections || 0}`);
  console.log(`   Detection methods: ${JSON.stringify(result.sectionMetadata?.detectionMethods || {})}`);
  console.log(`   Embedding cost: $${result.totalCost.toFixed(4)}`);
  console.log(`   Processing time: ${(result.processingTimeMs / 1000).toFixed(2)}s\n`);

  console.log('🎉 RAG System is Ready for Testing!\n');
  console.log(`🔗 Test it here: http://localhost:3002/dashboard/gsa-leasing`);
  console.log(`   1. Find the opportunity: "${oppWithPDF.title.substring(0, 50)}..."`);
  console.log(`   2. Click to open the opportunity details`);
  console.log(`   3. Try the chat feature - it now has access to the PDFs!`);
  console.log(`   4. Ask questions like:`);
  console.log(`      - "What are the square footage requirements?"`);
  console.log(`      - "What are the evaluation criteria?"`);
  console.log(`      - "When is the proposal deadline?"`);
}

setupRAG().catch(console.error);
