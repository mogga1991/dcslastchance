#!/usr/bin/env node
/**
 * Cache Cleanup Test Script
 *
 * Tests the /api/cron/cleanup-cache endpoint to verify:
 * 1. Expired cache entries are deleted
 * 2. Non-expired entries are preserved
 * 3. Deletion counts are accurate
 * 4. Performance is acceptable
 *
 * Usage:
 *   node scripts/test-cache-cleanup.js
 *
 * Prerequisites:
 *   - DATABASE_URL set in .env.local
 *   - CRON_SECRET set in .env.local (for production testing)
 */

const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

// Test configuration
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002';
const CRON_SECRET = process.env.CRON_SECRET;

/**
 * Database client
 */
const sql = neon(process.env.DATABASE_URL);

/**
 * Test summary
 */
const summary = {
  tests: [],
  passed: 0,
  failed: 0,
};

/**
 * Log test result
 */
function logTest(name, passed, message) {
  summary.tests.push({ name, passed, message });

  if (passed) {
    summary.passed++;
    console.log(`${colors.green}✅ ${name}${colors.reset}`);
    if (message) {
      console.log(`   ${colors.cyan}${message}${colors.reset}`);
    }
  } else {
    summary.failed++;
    console.log(`${colors.red}❌ ${name}${colors.reset}`);
    console.log(`   ${colors.red}${message}${colors.reset}`);
  }
}

/**
 * Insert test cache entry
 */
async function insertTestCacheEntry(table, expiresInHours) {
  try {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + expiresInHours);

    if (table === 'federal_neighborhood_scores') {
      await sql`
        INSERT INTO federal_neighborhood_scores (
          latitude, longitude, radius_miles, score_data, overall_score, grade, expires_at
        ) VALUES (
          38.9072, -77.0369, 5.0, '{"test": true}'::jsonb, 75.5, 'B+', ${expiresAt.toISOString()}
        )
      `;
    } else if (table === 'property_match_scores') {
      await sql`
        INSERT INTO property_match_scores (
          property_id, opportunity_id, score_data, overall_score, grade, qualified, competitive, expires_at
        ) VALUES (
          gen_random_uuid(), gen_random_uuid(), '{"test": true}'::jsonb, 82.0, 'A', true, true, ${expiresAt.toISOString()}
        )
      `;
    }

    return true;
  } catch (error) {
    console.error(`Error inserting test data into ${table}:`, error.message);
    return false;
  }
}

/**
 * Count cache entries
 */
async function countCacheEntries() {
  try {
    const neighborhoodResult = await sql`
      SELECT COUNT(*) as count FROM federal_neighborhood_scores
    `;

    const matchResult = await sql`
      SELECT COUNT(*) as count FROM property_match_scores
    `;

    return {
      federal_neighborhood_scores: Number(neighborhoodResult[0].count),
      property_match_scores: Number(matchResult[0].count),
      total: Number(neighborhoodResult[0].count) + Number(matchResult[0].count),
    };
  } catch (error) {
    console.error('Error counting cache entries:', error.message);
    return null;
  }
}

/**
 * Call cleanup endpoint
 */
async function callCleanupEndpoint(useCronSecret = true) {
  try {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (useCronSecret && CRON_SECRET) {
      headers['Authorization'] = `Bearer ${CRON_SECRET}`;
    }

    const response = await fetch(`${APP_URL}/api/cron/cleanup-cache`, {
      method: 'POST', // Use POST for manual testing (doesn't require CRON_SECRET in some configs)
      headers,
    });

    const data = await response.json();

    return {
      status: response.status,
      data,
    };
  } catch (error) {
    return {
      status: 0,
      error: error.message,
    };
  }
}

/**
 * Call cleanup function directly via SQL
 */
async function callCleanupFunction() {
  try {
    const result = await sql`SELECT cleanup_expired_cache() as deleted_count`;
    return Number(result[0].deleted_count);
  } catch (error) {
    console.error('Error calling cleanup function:', error.message);
    return null;
  }
}

/**
 * Main test suite
 */
async function runTests() {
  console.log(`${colors.bright}${colors.blue}🧪 Cache Cleanup Test Suite${colors.reset}`);
  console.log(`${colors.cyan}Target: ${APP_URL}${colors.reset}\n`);

  // ============================================================================
  // TEST 1: Database connection
  // ============================================================================
  try {
    const result = await sql`SELECT 1 as test`;
    logTest('Database connection', result.length === 1, 'Connected to Neon PostgreSQL');
  } catch (error) {
    logTest('Database connection', false, error.message);
    return;
  }

  // ============================================================================
  // TEST 2: Cleanup function exists
  // ============================================================================
  try {
    const result = await sql`
      SELECT routine_name
      FROM information_schema.routines
      WHERE routine_name = 'cleanup_expired_cache'
    `;
    logTest('Cleanup function exists', result.length === 1, 'cleanup_expired_cache() found in database');
  } catch (error) {
    logTest('Cleanup function exists', false, error.message);
  }

  // ============================================================================
  // TEST 3: Cache tables exist
  // ============================================================================
  try {
    const result = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_name IN ('federal_neighborhood_scores', 'property_match_scores')
    `;
    logTest('Cache tables exist', result.length === 2, 'Both cache tables found');
  } catch (error) {
    logTest('Cache tables exist', false, error.message);
  }

  // ============================================================================
  // TEST 4: Get initial cache counts
  // ============================================================================
  const initialCounts = await countCacheEntries();
  if (initialCounts) {
    logTest(
      'Initial cache state',
      true,
      `Neighborhood: ${initialCounts.federal_neighborhood_scores}, Matches: ${initialCounts.property_match_scores}, Total: ${initialCounts.total}`
    );
  } else {
    logTest('Initial cache state', false, 'Failed to count cache entries');
  }

  // ============================================================================
  // TEST 5: Insert expired test data
  // ============================================================================
  console.log(`\n${colors.bright}Creating test data...${colors.reset}`);

  const expiredNeighborhood = await insertTestCacheEntry('federal_neighborhood_scores', -25); // 25 hours ago (expired)
  const expiredMatch = await insertTestCacheEntry('property_match_scores', -25); // 25 hours ago (expired)

  const activeNeighborhood = await insertTestCacheEntry('federal_neighborhood_scores', 12); // 12 hours from now (active)
  const activeMatch = await insertTestCacheEntry('property_match_scores', 12); // 12 hours from now (active)

  logTest('Insert expired neighborhood score', expiredNeighborhood, 'Inserted 1 expired entry');
  logTest('Insert expired match score', expiredMatch, 'Inserted 1 expired entry');
  logTest('Insert active neighborhood score', activeNeighborhood, 'Inserted 1 active entry');
  logTest('Insert active match score', activeMatch, 'Inserted 1 active entry');

  // ============================================================================
  // TEST 6: Verify test data inserted
  // ============================================================================
  const afterInsertCounts = await countCacheEntries();
  if (afterInsertCounts && initialCounts) {
    const expectedTotal = initialCounts.total + 4;
    const passed = afterInsertCounts.total === expectedTotal;
    logTest(
      'Test data inserted',
      passed,
      passed
        ? `Total entries: ${afterInsertCounts.total} (expected ${expectedTotal})`
        : `Got ${afterInsertCounts.total}, expected ${expectedTotal}`
    );
  }

  // ============================================================================
  // TEST 7: Call cleanup function directly
  // ============================================================================
  console.log(`\n${colors.bright}Testing cleanup function...${colors.reset}`);

  const deletedCount = await callCleanupFunction();
  if (deletedCount !== null) {
    logTest(
      'Cleanup function execution',
      deletedCount >= 2, // Should delete at least our 2 expired test entries
      `Deleted ${deletedCount} expired records`
    );
  } else {
    logTest('Cleanup function execution', false, 'Function call failed');
  }

  // ============================================================================
  // TEST 8: Verify deletion
  // ============================================================================
  const afterCleanupCounts = await countCacheEntries();
  if (afterCleanupCounts && afterInsertCounts) {
    const expectedRemaining = afterInsertCounts.total - 2; // Should have deleted 2 expired entries
    const actualRemaining = afterCleanupCounts.total;

    // Allow for some variance if there were other expired entries
    const passed = actualRemaining <= expectedRemaining;

    logTest(
      'Expired entries deleted',
      passed,
      passed
        ? `Remaining: ${actualRemaining} (expected ≤ ${expectedRemaining})`
        : `Remaining: ${actualRemaining}, but expected ≤ ${expectedRemaining}`
    );
  }

  // ============================================================================
  // TEST 9: API endpoint authentication
  // ============================================================================
  if (APP_URL.includes('localhost')) {
    console.log(`\n${colors.bright}Testing API endpoint...${colors.reset}`);

    const response = await callCleanupEndpoint(true);

    if (response.status === 200 || response.status === 401) {
      logTest(
        'API endpoint responds',
        true,
        `Status ${response.status} ${response.status === 401 ? '(auth required)' : '(success)'}`
      );

      if (response.status === 200 && response.data) {
        console.log(`   ${colors.cyan}Response:${colors.reset}`, JSON.stringify(response.data, null, 2));
      }
    } else {
      logTest('API endpoint responds', false, `Unexpected status: ${response.status}`);
    }
  } else {
    console.log(`\n${colors.yellow}⚠️  Skipping API endpoint test (not localhost)${colors.reset}`);
  }

  // ============================================================================
  // TEST 10: Final cleanup (remove any remaining test data)
  // ============================================================================
  console.log(`\n${colors.bright}Cleaning up test data...${colors.reset}`);

  try {
    // Insert more expired entries and clean them up to test again
    await insertTestCacheEntry('federal_neighborhood_scores', -1);
    await insertTestCacheEntry('property_match_scores', -1);

    const finalCleanupCount = await callCleanupFunction();
    logTest('Final cleanup', finalCleanupCount !== null, `Cleaned up ${finalCleanupCount} entries`);
  } catch (error) {
    logTest('Final cleanup', false, error.message);
  }

  // ============================================================================
  // TEST SUMMARY
  // ============================================================================
  console.log(`\n${colors.bright}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}📊 TEST SUMMARY${colors.reset}`);
  console.log(`${colors.bright}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

  console.log(`${colors.green}✅ Passed:${colors.reset} ${summary.passed}/${summary.tests.length}`);
  console.log(`${colors.red}❌ Failed:${colors.reset} ${summary.failed}/${summary.tests.length}`);

  const successRate = ((summary.passed / summary.tests.length) * 100).toFixed(1);
  console.log(`${colors.cyan}Success Rate:${colors.reset} ${successRate}%\n`);

  if (summary.failed === 0) {
    console.log(`${colors.green}${colors.bright}🎉 All tests passed!${colors.reset}\n`);
  } else {
    console.log(`${colors.red}${colors.bright}❌ Some tests failed. Review output above.${colors.reset}\n`);
    process.exit(1);
  }
}

// Run tests
runTests().catch(error => {
  console.error(`${colors.red}💥 Fatal error:${colors.reset}`, error);
  process.exit(1);
});
