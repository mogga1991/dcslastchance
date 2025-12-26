/**
 * Direct SAM.gov API Test
 * Tests the SAM_API_KEY by making a direct API call
 */

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

const API_KEY = process.env.SAM_API_KEY;

console.log('=== SAM.gov API Diagnostic Test ===\n');

// Check if API key exists
if (!API_KEY) {
  console.error('❌ ERROR: SAM_API_KEY not found in environment');
  process.exit(1);
}

// Display API key info (masked for security)
const maskedKey = `${API_KEY.substring(0, 8)}...${API_KEY.substring(API_KEY.length - 4)}`;
console.log(`✓ API Key found: ${maskedKey}`);
console.log(`✓ Key length: ${API_KEY.length} characters`);

// Check for newline character
if (API_KEY.includes('\n')) {
  console.error('❌ ERROR: API key contains newline character!');
  console.log('  This is the known issue. Fix by running:');
  console.log('  printf "YOUR_API_KEY" | vercel env add SAM_API_KEY production');
  process.exit(1);
} else {
  console.log('✓ No newline character detected\n');
}

// Make a test API call
async function testSAMAPI() {
  const baseUrl = 'https://api.sam.gov/opportunities/v2/search';

  // Test query - last 364 days (just under 1 year max), GSA lease opportunities, limit 1000 (max)
  const today = new Date();
  const oneYearAgo = new Date();
  oneYearAgo.setDate(today.getDate() - 364); // 364 days to stay under 1 year limit

  const formatDate = (date) => {
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const y = date.getFullYear();
    return `${m}/${d}/${y}`;
  };

  const params = new URLSearchParams({
    api_key: API_KEY,
    postedFrom: formatDate(oneYearAgo),
    postedTo: formatDate(today),
    deptname: 'GENERAL SERVICES ADMINISTRATION',
    subtier: 'PUBLIC BUILDINGS SERVICE',
    ncode: '531120',
    ptype: 'o,p,k,r,s',
    rdlfrom: formatDate(today), // Only active opportunities (response deadline >= today)
    limit: '1000' // Maximum allowed by SAM.gov API
  });

  const url = `${baseUrl}?${params.toString()}`;

  console.log('Making test API call to SAM.gov...');
  console.log(`URL: ${baseUrl}`);
  console.log(`Date range: ${formatDate(oneYearAgo)} to ${formatDate(today)}`);
  console.log(`Limit: 1000 (maximum)`);
  console.log(`Filters: GSA PBS, NAICS 531120, Active RLPs only\n`);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log(`Response Status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('\n❌ API ERROR:');
      console.error(`Status: ${response.status}`);
      console.error(`Message: ${response.statusText}`);
      console.error(`Body: ${errorText}\n`);

      if (response.status === 403) {
        console.error('⚠️  This is likely an API key authentication issue.');
        console.error('   Possible causes:');
        console.error('   1. Invalid API key');
        console.error('   2. API key contains hidden characters (newline)');
        console.error('   3. API key has expired or been revoked');
        console.error('   4. API rate limit exceeded\n');
      }

      process.exit(1);
    }

    const data = await response.json();

    console.log('\n✅ SUCCESS!');
    console.log(`Total records: ${data.totalRecords || 0}`);
    console.log(`Opportunities returned: ${data.opportunitiesData?.length || 0}`);

    if (data.opportunitiesData && data.opportunitiesData.length > 0) {
      console.log('\nFirst opportunity:');
      const opp = data.opportunitiesData[0];
      console.log(`  Title: ${opp.title}`);
      console.log(`  Notice ID: ${opp.noticeId}`);
      console.log(`  Posted: ${opp.postedDate}`);
    }

  } catch (error) {
    console.error('\n❌ FETCH ERROR:');
    console.error(error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  }
}

testSAMAPI();
