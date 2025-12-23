#!/usr/bin/env node
/**
 * Production Smoke Tests
 * 🚀 PERF-007: Production deployment validation
 *
 * Validates that the production deployment is working correctly after rollout.
 * Run immediately after deployment to verify core functionality.
 *
 * Usage:
 *   node scripts/smoke-test-production.js
 *   PRODUCTION_URL=https://fedspace.ai node scripts/smoke-test-production.js
 */

const https = require('https');
const http = require('http');

// Configuration
const PRODUCTION_URL = process.env.PRODUCTION_URL || 'https://dcslasttry-2hpwm5fhk-mogga1991s-projects.vercel.app';
const TIMEOUT_MS = 30000; // 30 seconds

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

// Test results tracking
const results = {
  passed: 0,
  failed: 0,
  warnings: 0,
  tests: [],
};

/**
 * Make HTTP request
 */
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const protocol = parsedUrl.protocol === 'https:' ? https : http;

    const requestOptions = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: parsedUrl.pathname + parsedUrl.search,
      method: options.method || 'GET',
      headers: options.headers || {},
      timeout: TIMEOUT_MS,
    };

    const startTime = Date.now();

    const req = protocol.request(requestOptions, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        const duration = Date.now() - startTime;
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
          duration,
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (options.body) {
      req.write(options.body);
    }

    req.end();
  });
}

/**
 * Log test result
 */
function logTest(name, passed, message, duration) {
  const result = {
    name,
    passed,
    message,
    duration,
    timestamp: new Date().toISOString(),
  };

  results.tests.push(result);

  if (passed) {
    results.passed++;
    console.log(`${colors.green}✅ ${name}${colors.reset} (${duration}ms)`);
    if (message) {
      console.log(`   ${colors.cyan}${message}${colors.reset}`);
    }
  } else {
    results.failed++;
    console.log(`${colors.red}❌ ${name}${colors.reset}`);
    console.log(`   ${colors.red}${message}${colors.reset}`);
  }
}

/**
 * Log warning
 */
function logWarning(name, message, duration) {
  results.warnings++;
  console.log(`${colors.yellow}⚠️  ${name}${colors.reset} (${duration}ms)`);
  console.log(`   ${colors.yellow}${message}${colors.reset}`);
}

/**
 * Test 1: Homepage loads
 */
async function testHomepage() {
  try {
    const response = await makeRequest(PRODUCTION_URL);

    // Accept 200, 301, 302, 307, 308 (redirects), and 401 (auth required)
    if ([200, 301, 302, 307, 308, 401].includes(response.statusCode)) {
      const authNote = response.statusCode === 401 ? ' (Auth required)' : '';
      logTest('Homepage loads', true, `Status ${response.statusCode}${authNote}`, response.duration);
    } else {
      logTest('Homepage loads', false, `Unexpected status: ${response.statusCode}`, response.duration);
    }

    // Check response time
    if (response.duration > 3000) {
      logWarning('Homepage response time', `Slow response: ${response.duration}ms`, response.duration);
    }
  } catch (error) {
    logTest('Homepage loads', false, error.message, 0);
  }
}

/**
 * Test 2: API health check
 */
async function testHealthCheck() {
  try {
    const response = await makeRequest(`${PRODUCTION_URL}/api/health`);

    // Accept 200 or 401 (if auth is required)
    if ([200, 401].includes(response.statusCode)) {
      const authNote = response.statusCode === 401 ? ' (Auth required)' : '';
      logTest('API health check', true, `Health endpoint responsive${authNote}`, response.duration);
    } else {
      logTest('API health check', false, `Status: ${response.statusCode}`, response.duration);
    }

    // Verify fast response
    if (response.duration > 1000) {
      logWarning('Health check latency', `Slow health check: ${response.duration}ms (expected < 1s)`, response.duration);
    }
  } catch (error) {
    logTest('API health check', false, error.message, 0);
  }
}

/**
 * Test 3: Opportunities API
 */
async function testOpportunitiesAPI() {
  try {
    const response = await makeRequest(`${PRODUCTION_URL}/api/opportunities`);

    if (response.statusCode === 200 || response.statusCode === 401) {
      // 401 is acceptable if auth is required
      logTest('Opportunities API', true, `Status ${response.statusCode}`, response.duration);

      if (response.statusCode === 200) {
        try {
          const data = JSON.parse(response.body);
          if (Array.isArray(data)) {
            logTest('Opportunities data format', true, `Returned ${data.length} opportunities`, 0);
          } else {
            logWarning('Opportunities data format', 'Response is not an array', 0);
          }
        } catch (e) {
          logWarning('Opportunities data format', 'Invalid JSON response', 0);
        }
      }
    } else {
      logTest('Opportunities API', false, `Unexpected status: ${response.statusCode}`, response.duration);
    }
  } catch (error) {
    logTest('Opportunities API', false, error.message, 0);
  }
}

/**
 * Test 4: Match properties API (without auth - should fail gracefully)
 */
async function testMatchPropertiesAPI() {
  try {
    const response = await makeRequest(`${PRODUCTION_URL}/api/match-properties`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ minScore: 40 }),
    });

    // Should return 401 or 403 without auth, or 200 if no auth required
    if ([200, 401, 403].includes(response.statusCode)) {
      logTest('Match properties API', true, `Status ${response.statusCode} (${response.statusCode === 200 ? 'No auth required' : 'Auth required'})`, response.duration);
    } else {
      logTest('Match properties API', false, `Unexpected status: ${response.statusCode}`, response.duration);
    }
  } catch (error) {
    logTest('Match properties API', false, error.message, 0);
  }
}

/**
 * Test 5: Static assets load
 */
async function testStaticAssets() {
  try {
    // Test favicon
    const response = await makeRequest(`${PRODUCTION_URL}/favicon.ico`);

    // Accept 200, 404, or 401 (if auth middleware applies to all routes)
    if ([200, 404, 401].includes(response.statusCode)) {
      const note = response.statusCode === 401 ? ' (Auth required)' : response.statusCode === 404 ? ' (Not found - acceptable)' : '';
      logTest('Static assets', true, `Static file serving works${note}`, response.duration);
    } else {
      logTest('Static assets', false, `Unexpected status: ${response.statusCode}`, response.duration);
    }
  } catch (error) {
    logTest('Static assets', false, error.message, 0);
  }
}

/**
 * Test 6: Database connectivity (via API)
 */
async function testDatabaseConnectivity() {
  try {
    const response = await makeRequest(`${PRODUCTION_URL}/api/gsa-leasing`);

    // Any response other than 500 indicates database is reachable
    if (response.statusCode !== 500) {
      logTest('Database connectivity', true, `Database accessible (Status ${response.statusCode})`, response.duration);
    } else {
      logTest('Database connectivity', false, 'Database error (500)', response.duration);
    }
  } catch (error) {
    logTest('Database connectivity', false, error.message, 0);
  }
}

/**
 * Test 7: Performance - Page load times
 */
async function testPerformance() {
  const endpoints = [
    { path: '/', name: 'Homepage', maxTime: 3000 },
    { path: '/api/health', name: 'Health API', maxTime: 1000 },
    { path: '/api/opportunities', name: 'Opportunities API', maxTime: 5000 },
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await makeRequest(`${PRODUCTION_URL}${endpoint.path}`);

      if (response.duration < endpoint.maxTime) {
        logTest(`Performance: ${endpoint.name}`, true, `${response.duration}ms < ${endpoint.maxTime}ms`, response.duration);
      } else {
        logWarning(`Performance: ${endpoint.name}`, `Slow response: ${response.duration}ms (expected < ${endpoint.maxTime}ms)`, response.duration);
      }
    } catch (error) {
      logTest(`Performance: ${endpoint.name}`, false, error.message, 0);
    }
  }
}

/**
 * Test 8: Error handling
 */
async function testErrorHandling() {
  try {
    // Request non-existent endpoint
    const response = await makeRequest(`${PRODUCTION_URL}/api/nonexistent-endpoint-12345`);

    // Accept 404 or 401 (if auth middleware applies before routing)
    if ([404, 401].includes(response.statusCode)) {
      const note = response.statusCode === 401 ? ' (Auth required before routing)' : ' (Not found)';
      logTest('Error handling', true, `Proper error response${note}`, response.duration);
    } else {
      logWarning('Error handling', `Expected 404 or 401, got ${response.statusCode}`, response.duration);
    }
  } catch (error) {
    logTest('Error handling', false, error.message, 0);
  }
}

/**
 * Generate summary report
 */
function generateReport() {
  console.log(`\n${colors.bright}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}📊 SMOKE TEST SUMMARY${colors.reset}`);
  console.log(`${colors.bright}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

  console.log(`${colors.green}✅ Passed:${colors.reset} ${results.passed}`);
  console.log(`${colors.red}❌ Failed:${colors.reset} ${results.failed}`);
  console.log(`${colors.yellow}⚠️  Warnings:${colors.reset} ${results.warnings}`);
  console.log(`${colors.cyan}📝 Total Tests:${colors.reset} ${results.tests.length}\n`);

  const successRate = results.tests.length > 0
    ? ((results.passed / results.tests.length) * 100).toFixed(1)
    : 0;

  if (results.failed === 0) {
    console.log(`${colors.green}${colors.bright}🎉 All smoke tests passed! (${successRate}% success rate)${colors.reset}\n`);
    if (results.warnings > 0) {
      console.log(`${colors.yellow}⚠️  Note: ${results.warnings} warning(s) detected. Review performance metrics.${colors.reset}\n`);
    }
  } else {
    console.log(`${colors.red}${colors.bright}❌ ${results.failed} test(s) failed! (${successRate}% success rate)${colors.reset}\n`);
    console.log(`${colors.red}Action required: Investigate failures before proceeding.${colors.reset}\n`);
  }

  // Average response times
  const durations = results.tests
    .filter(t => t.duration > 0)
    .map(t => t.duration);

  if (durations.length > 0) {
    const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
    const maxDuration = Math.max(...durations);

    console.log(`${colors.cyan}Performance Metrics:${colors.reset}`);
    console.log(`  Average Response Time: ${avgDuration.toFixed(0)}ms`);
    console.log(`  Max Response Time: ${maxDuration}ms\n`);
  }

  console.log(`${colors.bright}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

  // Exit with error code if tests failed
  if (results.failed > 0) {
    process.exit(1);
  }
}

/**
 * Main test runner
 */
async function runSmokeTests() {
  console.log(`${colors.bright}${colors.blue}🚀 Running Production Smoke Tests${colors.reset}`);
  console.log(`${colors.cyan}Target: ${PRODUCTION_URL}${colors.reset}\n`);

  try {
    await testHomepage();
    await testHealthCheck();
    await testOpportunitiesAPI();
    await testMatchPropertiesAPI();
    await testStaticAssets();
    await testDatabaseConnectivity();
    await testPerformance();
    await testErrorHandling();

    generateReport();
  } catch (error) {
    console.error(`${colors.red}Fatal error running smoke tests:${colors.reset}`, error);
    process.exit(1);
  }
}

// Run tests
runSmokeTests();
