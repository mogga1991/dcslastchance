#!/bin/bash

# Quick RAG Test Script
# Fetches real GSA opportunities and processes them for RAG testing

echo "🚀 Quick RAG Testing Setup"
echo "=========================="
echo ""

# Check if development server is running
if ! lsof -i :3002 > /dev/null 2>&1; then
    echo "❌ Development server not running on port 3002"
    echo "Please run 'npm run dev' in another terminal first"
    exit 1
fi

echo "✅ Development server is running"
echo ""

# Step 1: Fetch real opportunities from SAM.gov
echo "📥 Step 1: Fetching real GSA lease opportunities from SAM.gov..."
SYNC_RESPONSE=$(curl -s -X POST http://localhost:3002/api/sync-opportunities \
  -H "Content-Type: application/json")

echo "Sync completed"
echo ""

# Step 2: Find opportunities with PDFs
echo "🔍 Step 2: Finding opportunities with PDF attachments..."
OPPORTUNITIES=$(node -e "
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  'https://clxqdctofuxqjjonvytm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNseHFkY3RvZnV4cWpqb252eXRtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTQ5Njg0MywiZXhwIjoyMDgxMDcyODQzfQ.rsFGPYgHdy4SjTjp-pL_0pZdM6s41xkodaAOZMwDCPk'
);

(async () => {
  const { data } = await supabase
    .from('opportunities')
    .select('notice_id, title, full_data')
    .not('full_data', 'is', null)
    .order('created_at', { ascending: false })
    .limit(10);

  const oppsWithPDFs = data.filter(opp => {
    const links = opp.full_data?.resourceLinks || [];
    return links.some(l => l && l.toLowerCase().endsWith('.pdf'));
  });

  console.log(JSON.stringify(oppsWithPDFs.slice(0, 2)));
})();
")

echo "Found opportunities with PDFs"
echo ""

# Step 3: Process first opportunity
echo "⚙️  Step 3: Processing PDF documents..."
echo ""

node << 'EOF'
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://clxqdctofuxqjjonvytm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNseHFkY3RvZnV4cWpqb252eXRtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTQ5Njg0MywiZXhwIjoyMDgxMDcyODQzfQ.rsFGPYgHdy4SjTjp-pL_0pZdM6s41xkodaAOZMwDCPk'
);

(async () => {
  // Find first opportunity with PDFs
  const { data } = await supabase
    .from('opportunities')
    .select('notice_id, title, full_data')
    .not('full_data', 'is', null)
    .order('created_at', { ascending: false })
    .limit(20);

  const oppWithPDF = data.find(opp => {
    const links = opp.full_data?.resourceLinks || [];
    return links.some(l => l && l.toLowerCase().endsWith('.pdf'));
  });

  if (!oppWithPDF) {
    console.log('❌ No opportunities with PDFs found. Try running the sync again.');
    process.exit(1);
  }

  const pdfLinks = (oppWithPDF.full_data?.resourceLinks || [])
    .filter(l => l && l.toLowerCase().endsWith('.pdf'));

  console.log(`📄 Processing: ${oppWithPDF.title}`);
  console.log(`   Notice ID: ${oppWithPDF.notice_id}`);
  console.log(`   PDFs: ${pdfLinks.length}\n`);

  // Process the PDFs
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
    const error = await response.text();
    console.log(`❌ Error: ${error}`);
    process.exit(1);
  }

  const result = await response.json();
  console.log(`✅ Processing Complete!`);
  console.log(`   Documents processed: ${result.documentsProcessed}`);
  console.log(`   Total chunks: ${result.totalChunks}`);
  console.log(`   Total sections detected: ${result.sectionMetadata?.totalSections || 0}`);
  console.log(`   Cost: $${result.totalCost.toFixed(4)}`);
  console.log(`   Time: ${(result.processingTimeMs / 1000).toFixed(2)}s`);
  console.log('');
  console.log('🎉 RAG system is now ready to test!');
  console.log(`🔗 Test URL: http://localhost:3002/dashboard/gsa-leasing`);
  console.log(`   Click on this opportunity and try the chat feature`);
})();
EOF

echo ""
echo "✨ Setup complete! Your RAG system is ready for testing."
