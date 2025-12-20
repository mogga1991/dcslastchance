/**
 * Test AI Summarization API
 *
 * This tests the /api/summarize-opportunity endpoint
 * with a real opportunity from the database.
 */

const { createClient } = require('@supabase/supabase-js');

const PROD_URL = 'https://dcslasttry-j6166vgl7-mogga1991s-projects.vercel.app';
const LOCAL_URL = 'http://localhost:3002';

const BASE_URL = process.env.TEST_PROD === 'true' ? PROD_URL : LOCAL_URL;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

(async () => {
  try {
    console.log('🧪 Testing AI Opportunity Summarization\n');
    console.log(`   Target: ${BASE_URL}\n`);

    // 1. Get a real opportunity from the database
    console.log('📋 Fetching a sample opportunity...');
    const { data: opportunities, error: fetchError } = await supabase
      .from('opportunities')
      .select('id, title, description')
      .limit(1);

    if (fetchError) {
      console.error('❌ Error fetching opportunity:', fetchError.message);
      process.exit(1);
    }

    if (!opportunities || opportunities.length === 0) {
      console.log('❌ No opportunities found in database');
      console.log('   Add some opportunities first before testing');
      process.exit(1);
    }

    const opportunity = opportunities[0];
    console.log(`✅ Found opportunity: ${opportunity.id}`);
    console.log(`   Title: ${opportunity.title}\n`);

    // 2. Test summarization API
    console.log('🤖 Generating AI summary...');
    const startTime = Date.now();

    const response = await fetch(`${BASE_URL}/api/summarize-opportunity`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        opportunityId: opportunity.id,
        forceRefresh: false
      })
    });

    const duration = Date.now() - startTime;
    const data = await response.json();

    if (!response.ok) {
      console.error(`❌ API Error (${response.status}):`, data);
      process.exit(1);
    }

    console.log(`✅ Summary generated in ${duration}ms`);
    console.log(`   Model: ${data.model}`);
    console.log(`   Cached: ${data.cached ? 'Yes' : 'No'}`);

    if (data.tokensUsed) {
      console.log(`   Tokens used: ${data.tokensUsed}`);
      console.log(`   Estimated cost: $${(data.tokensUsed * 0.000003).toFixed(6)}`);
    }

    console.log('\n📊 Summary Structure:');
    console.log(JSON.stringify(data.summary, null, 2));

    console.log('\n🎯 Headline:');
    console.log(`   "${data.summary.headline}"`);

    if (data.summary.location) {
      console.log('\n📍 Location:');
      console.log(`   ${data.summary.location.description}`);
    }

    if (data.summary.space) {
      console.log('\n📏 Space:');
      console.log(`   ${data.summary.space.description}`);
    }

    if (data.summary.brokerTakeaway) {
      console.log('\n💡 Broker Takeaway:');
      console.log(`   ${data.summary.brokerTakeaway}`);
    }

    console.log('\n✅ All tests passed!');

    // 3. Test cache (second request should be instant)
    console.log('\n🔄 Testing cache (second request)...');
    const cacheStart = Date.now();

    const cachedResponse = await fetch(`${BASE_URL}/api/summarize-opportunity?id=${opportunity.id}`);
    const cacheDuration = Date.now() - cacheStart;
    const cachedData = await cachedResponse.json();

    console.log(`✅ Cached response in ${cacheDuration}ms`);
    console.log(`   Cached: ${cachedData.cached ? 'Yes ✓' : 'No (expected Yes)'}`);

    if (cachedData.cached) {
      console.log(`   Speed improvement: ${Math.round(duration / cacheDuration)}x faster`);
    }

  } catch (error) {
    console.error('\n❌ Fatal error:', error.message);
    process.exit(1);
  }
})();
