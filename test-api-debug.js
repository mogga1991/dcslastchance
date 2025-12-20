require('dotenv').config({ path: '.env.local' });

const PROD_URL = 'https://dcslasttry-j6166vgl7-mogga1991s-projects.vercel.app';

(async () => {
  console.log('🔍 Debugging AI Summary API\n');

  const opportunityId = 'fake-gsa-2025-DC-001';

  console.log(`Testing: POST ${PROD_URL}/api/summarize-opportunity`);
  console.log(`Opportunity ID: ${opportunityId}\n`);

  try {
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

    console.log(`Status: ${response.status} ${response.statusText}`);
    console.log(`Headers:`, Object.fromEntries(response.headers.entries()));

    const text = await response.text();
    console.log(`\nResponse body (first 500 chars):`);
    console.log(text.substring(0, 500));

    if (response.headers.get('content-type')?.includes('application/json')) {
      console.log('\nParsed JSON:');
      console.log(JSON.parse(text));
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  }
})();
