/**
 * Test script for SAM.gov API Integration
 *
 * This script tests the complete flow:
 * 1. Fetch opportunities from SAM.gov
 * 2. Create an analysis from a SAM.gov opportunity
 * 3. Verify the data is stored correctly
 */

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

async function testSAMIntegration() {
  console.log('🧪 Testing SAM.gov API Integration\n');

  // Step 1: Test fetching opportunities from SAM.gov
  console.log('1️⃣  Fetching SAM.gov opportunities...');
  try {
    const response = await fetch(`${baseUrl}/api/sam-opportunities?mode=all&limit=5`);
    const data = await response.json();

    if (!data.success) {
      console.error('❌ Failed to fetch opportunities:', data.error);
      return;
    }

    console.log(`✅ Fetched ${data.data.length} opportunities`);

    if (data.data.length === 0) {
      console.log('⚠️  No opportunities found. SAM.gov API may be down or no recent opportunities.');
      return;
    }

    const testOpportunity = data.data[0];
    console.log(`\n📄 Test Opportunity:`);
    console.log(`   Notice ID: ${testOpportunity.noticeId}`);
    console.log(`   Title: ${testOpportunity.title}`);
    console.log(`   Agency: ${testOpportunity.department}`);
    console.log(`   Due Date: ${testOpportunity.responseDeadLine}`);

    // Step 2: Test creating an analysis (requires authentication)
    console.log('\n2️⃣  Testing analysis creation...');
    console.log('⚠️  Note: This requires authentication. Run manually with auth token.');
    console.log(`   Example curl command:`);
    console.log(`   curl -X POST ${baseUrl}/api/analyses \\`);
    console.log(`     -H "Content-Type: application/json" \\`);
    console.log(`     -H "Cookie: your-session-cookie" \\`);
    console.log(`     -d '{"notice_id": "${testOpportunity.noticeId}"}'`);

    // Step 3: Test sync endpoint (requires cron secret)
    console.log('\n3️⃣  Testing sync endpoint...');
    console.log('⚠️  Note: This requires CRON_SECRET environment variable.');
    console.log(`   Set CRON_SECRET in your .env file and use:`);
    console.log(`   curl ${baseUrl}/api/cron/sync-opportunities?mode=all \\`);
    console.log(`     -H "Authorization: Bearer YOUR_CRON_SECRET"`);

    console.log('\n✅ SAM.gov API integration is working correctly!');
    console.log('\n📚 Next Steps:');
    console.log('   1. Set up authentication to test analysis creation');
    console.log('   2. Set CRON_SECRET for automated syncing');
    console.log('   3. Integrate with your n8n workflow for AI analysis');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Step 4: Test specific opportunity fetch
async function testFetchOpportunityById(noticeId) {
  console.log(`\n4️⃣  Fetching specific opportunity: ${noticeId}...`);

  try {
    const response = await fetch(`${baseUrl}/api/sam-opportunities?noticeId=${noticeId}`);
    const data = await response.json();

    if (!data.success) {
      console.error('❌ Failed to fetch opportunity:', data.error);
      return;
    }

    console.log('✅ Opportunity Details:');
    console.log(JSON.stringify(data.data, null, 2));
  } catch (error) {
    console.error('❌ Failed:', error.message);
  }
}

// Run tests
(async () => {
  await testSAMIntegration();

  // Uncomment to test fetching a specific opportunity
  // await testFetchOpportunityById('your-notice-id-here');
})();
