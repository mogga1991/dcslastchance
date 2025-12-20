/**
 * Test script for the daily cron job endpoint
 *
 * This simulates what Vercel's cron scheduler will do.
 *
 * Usage:
 *   node test-cron-endpoint.js
 */

const CRON_SECRET = process.env.CRON_SECRET || 'test-secret-123';
const BASE_URL = process.env.BASE_URL || 'http://localhost:3002';

async function testCronEndpoint() {
  console.log('🧪 Testing Cron Endpoint: /api/cron/match-properties\n');
  console.log(`   Base URL: ${BASE_URL}`);
  console.log(`   Using CRON_SECRET: ${CRON_SECRET.substring(0, 10)}...\n`);

  try {
    const response = await fetch(`${BASE_URL}/api/cron/match-properties`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${CRON_SECRET}`
      }
    });

    const data = await response.json();

    console.log(`📊 Response Status: ${response.status}`);
    console.log(`📊 Response Body:\n`, JSON.stringify(data, null, 2));

    if (response.ok) {
      console.log('\n✅ Cron endpoint test PASSED!');
      if (data.stats) {
        console.log('\n📈 Matching Stats:');
        console.log(`   Properties checked: ${data.stats.propertiesChecked}`);
        console.log(`   Opportunities checked: ${data.stats.opportunitiesChecked}`);
        console.log(`   Matches found: ${data.stats.matched}`);
        console.log(`   Duration: ${data.stats.durationMs}ms`);
      }
    } else {
      console.log('\n❌ Cron endpoint test FAILED!');
      console.log(`   Error: ${data.error}`);
      if (data.message) {
        console.log(`   Message: ${data.message}`);
      }
    }

  } catch (error) {
    console.error('\n❌ Fatal error:', error.message);
    process.exit(1);
  }
}

// Test with wrong secret to verify auth works
async function testUnauthorized() {
  console.log('\n🔒 Testing unauthorized access (wrong secret)...\n');

  try {
    const response = await fetch(`${BASE_URL}/api/cron/match-properties`, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer wrong-secret'
      }
    });

    const data = await response.json();

    if (response.status === 401) {
      console.log('✅ Unauthorized test PASSED - endpoint correctly rejects wrong secret');
    } else {
      console.log('❌ Unauthorized test FAILED - endpoint should reject wrong secret');
      console.log(`   Got status: ${response.status}`);
      console.log(`   Got body:`, data);
    }

  } catch (error) {
    console.error('❌ Fatal error in unauthorized test:', error.message);
  }
}

// Run tests
(async () => {
  await testCronEndpoint();
  await testUnauthorized();
})();
