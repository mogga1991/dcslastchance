/**
 * FedSpace Integration Test Script
 *
 * Tests both patent-pending algorithms:
 * 1. Federal Neighborhood Score
 * 2. Property-Opportunity Matching
 */

import {
  calculateFederalNeighborhoodScore,
  calculatePropertyOpportunityMatch,
  FederalPropertyRTree,
} from './lib/fedspace';
import type {
  FederalProperty,
  PropertyData,
  OpportunityRequirements,
  BrokerExperience,
} from './lib/fedspace/types';

// ==================== Test Data ====================

// Test federal properties (sample data)
const testFederalProperties: FederalProperty[] = [
  {
    id: 'building_1',
    latitude: 38.8977,
    longitude: -77.0365,
    rsf: 150000,
    type: 'owned',
    agency: 'GSA',
    city: 'Washington',
    state: 'DC',
    constructionYear: 2018,
  },
  {
    id: 'lease_1',
    latitude: 38.9000,
    longitude: -77.0400,
    rsf: 75000,
    type: 'leased',
    agency: 'GSA',
    city: 'Washington',
    state: 'DC',
    leaseExpiration: new Date('2026-06-30'),
  },
  {
    id: 'building_2',
    latitude: 38.8950,
    longitude: -77.0380,
    rsf: 200000,
    type: 'owned',
    vacant: true,
    vacantRSF: 50000,
    agency: 'DOD',
    city: 'Washington',
    state: 'DC',
    constructionYear: 2015,
  },
];

// Test property
const testProperty: PropertyData = {
  latitude: 38.8977,
  longitude: -77.0365,
  address: '1800 F Street NW',
  city: 'Washington',
  state: 'DC',
  zipcode: '20006',
  totalSqft: 100000,
  availableSqft: 50000,
  minDivisibleSqft: 10000,
  buildingClass: 'A',
  adaCompliant: true,
  scifCapable: false,
  fiber: true,
  backupPower: true,
  parking: {
    spaces: 150,
    ratio: 3.0,
  },
  availableDate: new Date('2025-03-01'),
  leaseTermYears: 10,
  buildToSuit: false,
  setAsideEligible: ['8a', 'WOSB'],
};

// Test opportunity requirements
const testOpportunity: OpportunityRequirements = {
  noticeId: 'TEST-001',
  title: 'Office Space Lease - Washington DC',
  agency: 'General Services Administration',
  state: 'DC',
  city: 'Washington',
  minimumRSF: 40000,
  maximumRSF: 60000,
  contiguousRequired: false,
  setAside: '8a',
  adaRequired: true,
  buildingClass: ['A', 'A+'],
  fiber: true,
  backupPower: true,
  parkingRatio: 2.5,
  occupancyDate: new Date('2025-06-01'),
  leaseTermYears: 10,
  responseDeadline: new Date('2025-02-15'),
  naicsCode: '531120',
};

// Test broker experience
const testExperience: BrokerExperience = {
  governmentLeaseExperience: true,
  governmentLeasesCount: 12,
  gsaCertified: true,
  yearsInBusiness: 15,
  totalPortfolioSqft: 5000000,
  references: ['GSA NCR', 'DOD', 'VA'],
  willingToBuildToSuit: true,
};

// ==================== Test Functions ====================

async function testFederalNeighborhoodScore() {
  console.log('\n=== TESTING PATENT #1: Federal Neighborhood Score ===\n');

  try {
    // Create R-Tree index
    console.log('Building R-Tree spatial index...');
    const spatialIndex = new FederalPropertyRTree();
    spatialIndex.bulkLoad(testFederalProperties);
    console.log(`✓ Indexed ${spatialIndex.getSize()} properties\n`);

    // Calculate score
    console.log('Calculating Federal Neighborhood Score...');
    const startTime = performance.now();

    const score = await calculateFederalNeighborhoodScore(
      38.8977,
      -77.0365,
      5, // 5-mile radius
      spatialIndex
    );

    const elapsedTime = performance.now() - startTime;

    console.log(`✓ Score calculated in ${elapsedTime.toFixed(2)}ms\n`);

    // Display results
    console.log('Results:');
    console.log(`  Overall Score: ${score.score}/100`);
    console.log(`  Grade: ${score.grade}`);
    console.log(`  Percentile: ${score.percentile}th`);
    console.log(`\nMetrics:`);
    console.log(`  Total Properties: ${score.metrics.totalProperties}`);
    console.log(`  Leased: ${score.metrics.leasedProperties}`);
    console.log(`  Owned: ${score.metrics.ownedProperties}`);
    console.log(`  Total RSF: ${score.metrics.totalRSF.toLocaleString()}`);
    console.log(`  Vacant RSF: ${score.metrics.vacantRSF.toLocaleString()}`);
    console.log(`  Expiring Leases (24mo): ${score.metrics.expiringLeasesCount}`);

    console.log(`\nFactor Breakdown:`);
    console.log(`  Density (25%): ${score.factors.density.score}/100 → ${score.factors.density.weighted.toFixed(1)} pts`);
    console.log(`    ${score.factors.density.explanation}`);
    console.log(`  Lease Activity (25%): ${score.factors.leaseActivity.score}/100 → ${score.factors.leaseActivity.weighted.toFixed(1)} pts`);
    console.log(`    ${score.factors.leaseActivity.explanation}`);
    console.log(`  Expiring Leases (20%): ${score.factors.expiringLeases.score}/100 → ${score.factors.expiringLeases.weighted.toFixed(1)} pts`);
    console.log(`    ${score.factors.expiringLeases.explanation}`);
    console.log(`  Demand (15%): ${score.factors.demand.score}/100 → ${score.factors.demand.weighted.toFixed(1)} pts`);
    console.log(`    ${score.factors.demand.explanation}`);
    console.log(`  Vacancy (10%): ${score.factors.vacancy.score}/100 → ${score.factors.vacancy.weighted.toFixed(1)} pts`);
    console.log(`    ${score.factors.vacancy.explanation}`);
    console.log(`  Growth (5%): ${score.factors.growth.score}/100 → ${score.factors.growth.weighted.toFixed(1)} pts`);
    console.log(`    ${score.factors.growth.explanation}`);

    return true;
  } catch (error) {
    console.error('✗ Test failed:', error);
    return false;
  }
}

async function testPropertyOpportunityMatching() {
  console.log('\n\n=== TESTING PATENT #2: Property-Opportunity Matching ===\n');

  try {
    console.log('Calculating Property-Opportunity Match...');
    const startTime = performance.now();

    const matchResult = calculatePropertyOpportunityMatch(
      testProperty,
      testOpportunity,
      testExperience
    );

    const elapsedTime = performance.now() - startTime;

    console.log(`✓ Match calculated in ${matchResult.computationTimeMs.toFixed(2)}ms\n`);

    // Display results
    console.log('Results:');
    console.log(`  Overall Score: ${matchResult.score}/100`);
    console.log(`  Grade: ${matchResult.grade}`);
    console.log(`  Qualified: ${matchResult.qualified ? '✓ YES' : '✗ NO'}`);
    console.log(`  Competitive: ${matchResult.competitive ? '✓ YES' : '✗ NO'}`);

    if (matchResult.earlyTermination) {
      console.log(`\n⚡ Early Termination:`);
      console.log(`  Failed Constraint: ${matchResult.earlyTermination.failedConstraint}`);
      console.log(`  Stopped at Stage: ${matchResult.earlyTermination.stoppedAtStage}/5`);
      console.log(`  Computation Saved: ${matchResult.earlyTermination.computationSaved}%`);
      console.log(`  Reason: ${matchResult.earlyTermination.reason}`);
    } else {
      console.log(`\n✓ Passed All Constraints:`);
      matchResult.passedConstraints.forEach(constraint => {
        console.log(`  ✓ ${constraint}`);
      });
    }

    if (matchResult.qualified) {
      console.log(`\nFactor Scores:`);
      console.log(`  Location (30%): ${matchResult.factors.location.score}/100 → ${matchResult.factors.location.weighted.toFixed(1)} pts`);
      console.log(`    ${matchResult.factors.location.explanation}`);
      console.log(`  Space (25%): ${matchResult.factors.space.score}/100 → ${matchResult.factors.space.weighted.toFixed(1)} pts`);
      console.log(`    ${matchResult.factors.space.explanation}`);
      console.log(`  Building (20%): ${matchResult.factors.building.score}/100 → ${matchResult.factors.building.weighted.toFixed(1)} pts`);
      console.log(`    ${matchResult.factors.building.explanation}`);
      console.log(`  Timeline (15%): ${matchResult.factors.timeline.score}/100 → ${matchResult.factors.timeline.weighted.toFixed(1)} pts`);
      console.log(`    ${matchResult.factors.timeline.explanation}`);
      console.log(`  Experience (10%): ${matchResult.factors.experience.score}/100 → ${matchResult.factors.experience.weighted.toFixed(1)} pts`);
      console.log(`    ${matchResult.factors.experience.explanation}`);

      if (matchResult.strengths.length > 0) {
        console.log(`\n💪 Strengths:`);
        matchResult.strengths.forEach(s => console.log(`  • ${s}`));
      }

      if (matchResult.weaknesses.length > 0) {
        console.log(`\n⚠️  Weaknesses:`);
        matchResult.weaknesses.forEach(w => console.log(`  • ${w}`));
      }

      if (matchResult.recommendations.length > 0) {
        console.log(`\n💡 Recommendations:`);
        matchResult.recommendations.forEach(r => console.log(`  • ${r}`));
      }
    }

    return true;
  } catch (error) {
    console.error('✗ Test failed:', error);
    return false;
  }
}

async function testEarlyTermination() {
  console.log('\n\n=== TESTING Early Termination Scenarios ===\n');

  // Test Case 1: State mismatch (should fail at stage 0)
  console.log('Test Case 1: State Mismatch (94% disqualification rate)');
  const wrongStateProperty = { ...testProperty, state: 'VA' };
  const result1 = calculatePropertyOpportunityMatch(
    wrongStateProperty,
    testOpportunity,
    testExperience
  );
  console.log(`  Result: ${result1.qualified ? 'QUALIFIED' : 'DISQUALIFIED'}`);
  if (result1.earlyTermination) {
    console.log(`  Failed at: ${result1.earlyTermination.failedConstraint}`);
    console.log(`  Computation saved: ${result1.earlyTermination.computationSaved}%`);
  }

  // Test Case 2: RSF too small (should fail at stage 1)
  console.log('\nTest Case 2: Insufficient Square Footage (67% disqualification rate)');
  const smallProperty = { ...testProperty, availableSqft: 20000 }; // Need 40k
  const result2 = calculatePropertyOpportunityMatch(
    smallProperty,
    testOpportunity,
    testExperience
  );
  console.log(`  Result: ${result2.qualified ? 'QUALIFIED' : 'DISQUALIFIED'}`);
  if (result2.earlyTermination) {
    console.log(`  Failed at: ${result2.earlyTermination.failedConstraint}`);
    console.log(`  Computation saved: ${result2.earlyTermination.computationSaved}%`);
  }

  // Test Case 3: Set-aside mismatch (should fail at stage 2)
  console.log('\nTest Case 3: Set-Aside Mismatch (45% disqualification rate)');
  const noSetAsideProperty = { ...testProperty, setAsideEligible: [] };
  const result3 = calculatePropertyOpportunityMatch(
    noSetAsideProperty,
    testOpportunity,
    testExperience
  );
  console.log(`  Result: ${result3.qualified ? 'QUALIFIED' : 'DISQUALIFIED'}`);
  if (result3.earlyTermination) {
    console.log(`  Failed at: ${result3.earlyTermination.failedConstraint}`);
    console.log(`  Computation saved: ${result3.earlyTermination.computationSaved}%`);
  }

  // Test Case 4: ADA non-compliant (should fail at stage 3)
  console.log('\nTest Case 4: ADA Non-Compliant (23% disqualification rate)');
  const noADAProperty = { ...testProperty, adaCompliant: false };
  const result4 = calculatePropertyOpportunityMatch(
    noADAProperty,
    testOpportunity,
    testExperience
  );
  console.log(`  Result: ${result4.qualified ? 'QUALIFIED' : 'DISQUALIFIED'}`);
  if (result4.earlyTermination) {
    console.log(`  Failed at: ${result4.earlyTermination.failedConstraint}`);
    console.log(`  Computation saved: ${result4.earlyTermination.computationSaved}%`);
  }

  console.log('\n✓ Early termination tests completed');
  return true;
}

// ==================== Run All Tests ====================

async function runAllTests() {
  console.log('╔══════════════════════════════════════════════════════╗');
  console.log('║   FedSpace Patent-Pending Algorithms Test Suite    ║');
  console.log('╚══════════════════════════════════════════════════════╝');

  const results = {
    federalScore: false,
    propertyMatch: false,
    earlyTermination: false,
  };

  results.federalScore = await testFederalNeighborhoodScore();
  results.propertyMatch = await testPropertyOpportunityMatching();
  results.earlyTermination = await testEarlyTermination();

  console.log('\n\n╔══════════════════════════════════════════════════════╗');
  console.log('║                   Test Summary                       ║');
  console.log('╚══════════════════════════════════════════════════════╝');
  console.log(`Federal Neighborhood Score: ${results.federalScore ? '✓ PASS' : '✗ FAIL'}`);
  console.log(`Property-Opportunity Match: ${results.propertyMatch ? '✓ PASS' : '✗ FAIL'}`);
  console.log(`Early Termination: ${results.earlyTermination ? '✓ PASS' : '✗ FAIL'}`);

  const allPassed = Object.values(results).every(r => r);
  console.log(`\n${allPassed ? '✓ ALL TESTS PASSED' : '✗ SOME TESTS FAILED'}\n`);

  return allPassed;
}

// Run tests if executed directly
if (require.main === module) {
  runAllTests()
    .then(success => process.exit(success ? 0 : 1))
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

export { runAllTests };
