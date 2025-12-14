// Test SAM.gov API directly
require('dotenv').config({ path: '.env.local' });

async function testSAMAPI() {
  const apiKey = process.env.SAM_API_KEY || process.env.VITE_SAMGOV_API_KEY;

  console.log('Testing SAM.gov API...');
  console.log('API Key present:', apiKey ? 'YES' : 'NO');
  console.log('API Key (full):', apiKey);
  console.log('API Key length:', apiKey?.length);

  if (!apiKey) {
    console.error('ERROR: No API key found');
    return;
  }

  const baseUrl = "https://api.sam.gov/opportunities/v2/search";

  // Calculate default date range (last 30 days to today)
  const today = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(today.getDate() - 30);

  const formatDate = (date) => {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };

  console.log('Date range:', formatDate(thirtyDaysAgo), 'to', formatDate(today));

  const queryParams = new URLSearchParams({
    api_key: apiKey,
    postedFrom: '11/14/2024', // Hardcode 2024 to test
    postedTo: '12/14/2024',
    ptype: 'o,p,k,r,s',
    // rdlfrom: '12/14/2024', // Try without this param first
    limit: '10',
    offset: '0',
  });

  const url = `${baseUrl}?${queryParams.toString()}`;
  console.log('\nRequest URL:', url.replace(apiKey, 'API_KEY_HIDDEN'));

  try {
    console.log('\nMaking request...');
    const startTime = Date.now();

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    const elapsed = Date.now() - startTime;
    console.log(`Response received in ${elapsed}ms`);
    console.log('Status:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      return;
    }

    const data = await response.json();
    console.log('\nSuccess!');
    console.log('Total Records:', data.totalRecords);
    console.log('Returned:', data.opportunitiesData?.length || 0);

    if (data.opportunitiesData?.length > 0) {
      console.log('\nFirst opportunity:');
      const opp = data.opportunitiesData[0];
      console.log('- Title:', opp.title);
      console.log('- Notice ID:', opp.noticeId);
      console.log('- Department:', opp.department);
      console.log('- Posted:', opp.postedDate);
    }

  } catch (error) {
    console.error('\nError:', error.message);
    if (error.name === 'AbortError') {
      console.error('Request timed out after 10 seconds');
    }
  }
}

testSAMAPI();
