require('dotenv').config({ path: '.env.local' });

const PROD_URL = 'https://dcslasttry-j6166vgl7-mogga1991s-projects.vercel.app';

(async () => {
  console.log('🧪 Testing AI Summary API\n');

  // Use a test opportunity ID (from our seed data)
  const opportunityId = 'fake-gsa-2025-DC-001';

  console.log(`📋 Testing with opportunity: ${opportunityId}\n`);

  try {
    console.log('🤖 Generating AI summary...');
    const startTime = Date.now();

    const response = await fetch(`${PROD_URL}/api/summarize-opportunity`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        opportunityId: opportunityId,
        forceRefresh: false
      })
    });

    const duration = Date.now() - startTime;
    const data = await response.json();

    if (!response.ok) {
      console.error(`❌ API Error (${response.status}):`, JSON.stringify(data, null, 2));
      process.exit(1);
    }

    console.log(`\n✅ Summary generated in ${duration}ms`);
    console.log(`   Model: ${data.model}`);
    console.log(`   Cached: ${data.cached ? 'Yes' : 'No'}`);

    if (data.tokensUsed) {
      console.log(`   Tokens used: ${data.tokensUsed}`);
      console.log(`   Estimated cost: $${(data.tokensUsed * 0.000003).toFixed(6)}`);
    }

    console.log('\n📊 Summary:');
    console.log(JSON.stringify(data.summary, null, 2));

    console.log('\n🎯 Key Fields:');
    console.log(`   Headline: "${data.summary.headline}"`);
    if (data.summary.location) {
      console.log(`   Location: ${data.summary.location.description}`);
    }
    if (data.summary.space) {
      console.log(`   Space: ${data.summary.space.description}`);
    }
    if (data.summary.brokerTakeaway) {
      console.log(`   Takeaway: ${data.summary.brokerTakeaway}`);
    }

    console.log('\n✅ Test completed successfully!');

  } catch (error) {
    console.error('\n❌ Fatal error:', error.message);
    console.error(error);
    process.exit(1);
  }
})();
