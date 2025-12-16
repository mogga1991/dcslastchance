/**
 * Test FedSpace API Endpoints
 * Run with: node test-fedspace-api.js
 */

async function testFederalScore() {
  console.log('\n=== Testing Federal Neighborhood Score API ===');

  try {
    const response = await fetch(
      'http://localhost:3000/api/fedspace/neighborhood-score?lat=38.9072&lng=-77.0369&radius=5'
    );

    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));

    if (data.success && data.data) {
      console.log('\n✅ Federal Score:', data.data.score);
      console.log('✅ Grade:', data.data.grade);
      console.log('✅ Percentile:', data.data.percentile);
      console.log('✅ Cached:', data.cached);
    } else {
      console.log('❌ Error:', data.error);
    }
  } catch (error) {
    console.error('❌ Request failed:', error.message);
  }
}

async function testAnalytics() {
  console.log('\n=== Testing Analytics API ===');

  try {
    const response = await fetch(
      'http://localhost:3000/api/fedspace/analytics?type=all'
    );

    const data = await response.json();
    console.log('Status:', response.status);

    if (data.success) {
      console.log('\n✅ Analytics retrieved successfully');
      console.log('Available data:', Object.keys(data.data));
    } else {
      console.log('❌ Error:', data.error);
    }
  } catch (error) {
    console.error('❌ Request failed:', error.message);
  }
}

async function testPropertyMatch() {
  console.log('\n=== Testing Property-Opportunity Match API ===');

  const testData = {
    property: {
      latitude: 38.9072,
      longitude: -77.0369,
      address: "1250 H Street NW",
      city: "Washington",
      state: "DC",
      zipcode: "20005",
      totalSqft: 50000,
      availableSqft: 15000,
      minDivisibleSqft: 5000,
      buildingClass: "A",
      adaCompliant: true,
      fiber: true,
      backupPower: true,
      availableDate: new Date("2025-03-01"),
      leaseTermYears: 5
    },
    opportunity: {
      noticeId: "TEST-001",
      title: "Test Opportunity",
      agency: "GSA",
      state: "DC",
      city: "Washington",
      minimumRSF: 10000,
      maximumRSF: 20000,
      adaRequired: true,
      buildingClass: ["A", "A+"],
      fiber: true,
      backupPower: true,
      leaseTermYears: 5
    },
    experience: {
      governmentLeaseExperience: true,
      governmentLeasesCount: 5,
      gsaCertified: true,
      yearsInBusiness: 10,
      totalPortfolioSqft: 500000
    }
  };

  try {
    const response = await fetch(
      'http://localhost:3000/api/fedspace/property-match',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testData)
      }
    );

    const data = await response.json();
    console.log('Status:', response.status);

    if (data.success && data.data) {
      console.log('\n✅ Match Score:', data.data.score);
      console.log('✅ Grade:', data.data.grade);
      console.log('✅ Qualified:', data.data.qualified);
      console.log('✅ Competitive:', data.data.competitive);
      console.log('✅ Early Terminated:', data.data.earlyTermination ? 'Yes' : 'No');
      console.log('✅ Computation Time:', data.data.computationTimeMs, 'ms');

      if (data.data.factors) {
        console.log('\nFactor Scores:');
        Object.entries(data.data.factors).forEach(([factor, details]) => {
          console.log(`  - ${factor}: ${details.score}`);
        });
      }
    } else {
      console.log('❌ Error:', data.error);
    }
  } catch (error) {
    console.error('❌ Request failed:', error.message);
  }
}

async function runTests() {
  console.log('Starting FedSpace API Tests...');
  console.log('Make sure dev server is running: npm run dev');

  await testFederalScore();
  await testAnalytics();
  await testPropertyMatch();

  console.log('\n=== Tests Complete ===\n');
}

runTests();
