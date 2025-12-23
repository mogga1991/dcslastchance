#!/usr/bin/env node
/**
 * Performance Monitoring Script
 * 🚀 PERF-007: Production performance monitoring
 *
 * Monitors production API performance and tracks metrics over time.
 * Use this to validate performance improvements and detect regressions.
 *
 * Usage:
 *   node scripts/monitor-performance.js
 *   PRODUCTION_URL=https://fedspace.ai node scripts/monitor-performance.js
 *   node scripts/monitor-performance.js --duration=3600 --interval=60
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Configuration
const PRODUCTION_URL = process.env.PRODUCTION_URL || 'https://dcslasttry-2hpwm5fhk-mogga1991s-projects.vercel.app';
const MONITOR_DURATION = parseInt(process.env.MONITOR_DURATION || '3600'); // 1 hour default
const CHECK_INTERVAL = parseInt(process.env.CHECK_INTERVAL || '60'); // 60 seconds default
const RESULTS_FILE = path.join(__dirname, '..', 'performance-monitoring.json');

// Colors
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

// Metrics storage
const metrics = {
  startTime: new Date().toISOString(),
  endTime: null,
  checks: [],
  summary: {
    totalChecks: 0,
    successfulChecks: 0,
    failedChecks: 0,
    avgResponseTime: 0,
    p95ResponseTime: 0,
    p99ResponseTime: 0,
    minResponseTime: Infinity,
    maxResponseTime: 0,
    errors: [],
  },
};

/**
 * Make HTTP request with timing
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
      timeout: 30000,
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
 * Perform health check
 */
async function performHealthCheck() {
  try {
    const response = await makeRequest(`${PRODUCTION_URL}/api/health`);

    return {
      timestamp: new Date().toISOString(),
      endpoint: '/api/health',
      success: response.statusCode === 200,
      statusCode: response.statusCode,
      responseTime: response.duration,
      error: null,
    };
  } catch (error) {
    return {
      timestamp: new Date().toISOString(),
      endpoint: '/api/health',
      success: false,
      statusCode: null,
      responseTime: null,
      error: error.message,
    };
  }
}

/**
 * Perform opportunities API check
 */
async function performOpportunitiesCheck() {
  try {
    const response = await makeRequest(`${PRODUCTION_URL}/api/opportunities`);

    return {
      timestamp: new Date().toISOString(),
      endpoint: '/api/opportunities',
      success: response.statusCode === 200 || response.statusCode === 401,
      statusCode: response.statusCode,
      responseTime: response.duration,
      error: null,
    };
  } catch (error) {
    return {
      timestamp: new Date().toISOString(),
      endpoint: '/api/opportunities',
      success: false,
      statusCode: null,
      responseTime: null,
      error: error.message,
    };
  }
}

/**
 * Perform match properties API check
 */
async function performMatchPropertiesCheck() {
  try {
    const response = await makeRequest(`${PRODUCTION_URL}/api/match-properties`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ minScore: 40, chunkSize: 50 }),
    });

    return {
      timestamp: new Date().toISOString(),
      endpoint: '/api/match-properties',
      success: [200, 401, 403].includes(response.statusCode),
      statusCode: response.statusCode,
      responseTime: response.duration,
      error: null,
    };
  } catch (error) {
    return {
      timestamp: new Date().toISOString(),
      endpoint: '/api/match-properties',
      success: false,
      statusCode: null,
      responseTime: null,
      error: error.message,
    };
  }
}

/**
 * Run all checks
 */
async function runChecks() {
  const checkResults = await Promise.all([
    performHealthCheck(),
    performOpportunitiesCheck(),
    performMatchPropertiesCheck(),
  ]);

  metrics.checks.push(...checkResults);

  // Update summary
  metrics.summary.totalChecks = metrics.checks.length;
  metrics.summary.successfulChecks = metrics.checks.filter(c => c.success).length;
  metrics.summary.failedChecks = metrics.checks.filter(c => !c.success).length;

  // Calculate response time metrics
  const responseTimes = metrics.checks
    .filter(c => c.responseTime !== null)
    .map(c => c.responseTime)
    .sort((a, b) => a - b);

  if (responseTimes.length > 0) {
    metrics.summary.avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
    metrics.summary.minResponseTime = Math.min(...responseTimes);
    metrics.summary.maxResponseTime = Math.max(...responseTimes);

    // Calculate percentiles
    const p95Index = Math.floor(responseTimes.length * 0.95);
    const p99Index = Math.floor(responseTimes.length * 0.99);
    metrics.summary.p95ResponseTime = responseTimes[p95Index] || responseTimes[responseTimes.length - 1];
    metrics.summary.p99ResponseTime = responseTimes[p99Index] || responseTimes[responseTimes.length - 1];
  }

  // Track unique errors
  const errors = metrics.checks
    .filter(c => c.error)
    .map(c => c.error);

  metrics.summary.errors = [...new Set(errors)];

  return checkResults;
}

/**
 * Display live metrics
 */
function displayMetrics(checkResults) {
  const successRate = metrics.summary.totalChecks > 0
    ? ((metrics.summary.successfulChecks / metrics.summary.totalChecks) * 100).toFixed(1)
    : 0;

  // Clear console (optional, comment out if you want scrolling)
  // console.clear();

  console.log(`\n${colors.bright}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}📊 PERFORMANCE MONITORING${colors.reset}`);
  console.log(`${colors.bright}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

  console.log(`${colors.cyan}Target:${colors.reset} ${PRODUCTION_URL}`);
  console.log(`${colors.cyan}Started:${colors.reset} ${new Date(metrics.startTime).toLocaleString()}`);
  console.log(`${colors.cyan}Duration:${colors.reset} ${Math.floor((Date.now() - new Date(metrics.startTime).getTime()) / 1000)}s / ${MONITOR_DURATION}s\n`);

  console.log(`${colors.bright}Latest Checks:${colors.reset}`);
  checkResults.forEach(result => {
    const icon = result.success ? `${colors.green}✅` : `${colors.red}❌`;
    const time = result.responseTime ? `${result.responseTime}ms` : 'N/A';
    const status = result.statusCode ? `[${result.statusCode}]` : '[ERR]';

    console.log(`${icon} ${result.endpoint}${colors.reset} ${time} ${status}`);
    if (result.error) {
      console.log(`   ${colors.red}Error: ${result.error}${colors.reset}`);
    }
  });

  console.log(`\n${colors.bright}Summary Statistics:${colors.reset}`);
  console.log(`${colors.cyan}Total Checks:${colors.reset} ${metrics.summary.totalChecks}`);
  console.log(`${colors.green}Successful:${colors.reset} ${metrics.summary.successfulChecks} (${successRate}%)`);
  console.log(`${colors.red}Failed:${colors.reset} ${metrics.summary.failedChecks}`);

  if (metrics.summary.avgResponseTime > 0) {
    console.log(`\n${colors.bright}Response Times:${colors.reset}`);
    console.log(`${colors.cyan}Average:${colors.reset} ${metrics.summary.avgResponseTime.toFixed(0)}ms`);
    console.log(`${colors.cyan}Min:${colors.reset} ${metrics.summary.minResponseTime}ms`);
    console.log(`${colors.cyan}Max:${colors.reset} ${metrics.summary.maxResponseTime}ms`);
    console.log(`${colors.cyan}P95:${colors.reset} ${metrics.summary.p95ResponseTime}ms`);
    console.log(`${colors.cyan}P99:${colors.reset} ${metrics.summary.p99ResponseTime}ms`);

    // Performance warnings
    if (metrics.summary.p95ResponseTime > 5000) {
      console.log(`\n${colors.yellow}⚠️  WARNING: P95 latency exceeds 5s target (${metrics.summary.p95ResponseTime}ms)${colors.reset}`);
    }

    if (metrics.summary.avgResponseTime > 3000) {
      console.log(`${colors.yellow}⚠️  WARNING: Average latency is high (${metrics.summary.avgResponseTime.toFixed(0)}ms)${colors.reset}`);
    }
  }

  if (metrics.summary.errors.length > 0) {
    console.log(`\n${colors.red}Errors encountered:${colors.reset}`);
    metrics.summary.errors.forEach(error => {
      console.log(`  • ${error}`);
    });
  }

  console.log(`\n${colors.bright}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
}

/**
 * Save metrics to file
 */
function saveMetrics() {
  metrics.endTime = new Date().toISOString();

  try {
    fs.writeFileSync(RESULTS_FILE, JSON.stringify(metrics, null, 2));
    console.log(`\n${colors.green}📁 Metrics saved to: ${RESULTS_FILE}${colors.reset}`);
  } catch (error) {
    console.error(`${colors.red}Failed to save metrics: ${error.message}${colors.reset}`);
  }
}

/**
 * Generate final report
 */
function generateFinalReport() {
  console.log(`\n\n${colors.bright}${colors.blue}═══════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.bright}${colors.blue}           PERFORMANCE MONITORING COMPLETE${colors.reset}`);
  console.log(`${colors.bright}${colors.blue}═══════════════════════════════════════════════════════${colors.reset}\n`);

  const duration = Math.floor((new Date(metrics.endTime).getTime() - new Date(metrics.startTime).getTime()) / 1000);
  const successRate = ((metrics.summary.successfulChecks / metrics.summary.totalChecks) * 100).toFixed(1);

  console.log(`${colors.cyan}Monitoring Duration:${colors.reset} ${duration}s`);
  console.log(`${colors.cyan}Total API Calls:${colors.reset} ${metrics.summary.totalChecks}`);
  console.log(`${colors.cyan}Success Rate:${colors.reset} ${successRate}%\n`);

  console.log(`${colors.bright}Performance Metrics:${colors.reset}`);
  console.log(`  Average Response Time: ${metrics.summary.avgResponseTime.toFixed(0)}ms`);
  console.log(`  P95 Response Time: ${metrics.summary.p95ResponseTime}ms`);
  console.log(`  P99 Response Time: ${metrics.summary.p99ResponseTime}ms`);
  console.log(`  Min Response Time: ${metrics.summary.minResponseTime}ms`);
  console.log(`  Max Response Time: ${metrics.summary.maxResponseTime}ms\n`);

  // Performance verdict
  if (metrics.summary.p95ResponseTime < 5000 && successRate >= 99) {
    console.log(`${colors.green}${colors.bright}🎉 EXCELLENT: System is performing within targets!${colors.reset}`);
  } else if (metrics.summary.p95ResponseTime < 8000 && successRate >= 95) {
    console.log(`${colors.yellow}${colors.bright}⚠️  ACCEPTABLE: System is stable but could be optimized${colors.reset}`);
  } else {
    console.log(`${colors.red}${colors.bright}❌ POOR: System performance needs attention${colors.reset}`);
  }

  console.log(`\n${colors.cyan}Full metrics saved to: ${RESULTS_FILE}${colors.reset}\n`);
}

/**
 * Main monitoring loop
 */
async function monitor() {
  console.log(`${colors.bright}${colors.blue}🚀 Starting Performance Monitoring${colors.reset}`);
  console.log(`${colors.cyan}Target: ${PRODUCTION_URL}${colors.reset}`);
  console.log(`${colors.cyan}Duration: ${MONITOR_DURATION}s${colors.reset}`);
  console.log(`${colors.cyan}Check Interval: ${CHECK_INTERVAL}s${colors.reset}\n`);

  const startTime = Date.now();
  const endTime = startTime + (MONITOR_DURATION * 1000);

  while (Date.now() < endTime) {
    const checkResults = await runChecks();
    displayMetrics(checkResults);

    // Wait for next interval
    const nextCheck = Date.now() + (CHECK_INTERVAL * 1000);
    while (Date.now() < nextCheck && Date.now() < endTime) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  saveMetrics();
  generateFinalReport();
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log(`\n\n${colors.yellow}Monitoring interrupted by user${colors.reset}`);
  saveMetrics();
  generateFinalReport();
  process.exit(0);
});

// Start monitoring
monitor().catch(error => {
  console.error(`${colors.red}Fatal error:${colors.reset}`, error);
  saveMetrics();
  process.exit(1);
});
