/**
 * k6 Load Test for Property Matching API
 * 🚀 PERF-006: Load testing and performance validation
 *
 * Run with:
 * k6 run load-tests/match-properties.js
 *
 * Environment variables:
 * - API_URL: Base URL for the API (default: http://localhost:3002)
 * - API_TOKEN: Authentication token (required)
 */

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const matchDuration = new Trend('match_duration');
const matchesFound = new Trend('matches_found');
const earlyTerminations = new Trend('early_terminations');
const apiErrors = new Counter('api_errors');

// Test configuration
export const options = {
  stages: [
    { duration: '30s', target: 2 },   // Warm up: 2 users
    { duration: '1m', target: 5 },    // Ramp up to 5 users
    { duration: '2m', target: 10 },   // Stress test: 10 users
    { duration: '1m', target: 15 },   // Peak: 15 users
    { duration: '1m', target: 10 },   // Scale down
    { duration: '30s', target: 0 },   // Cool down
  ],
  thresholds: {
    // Overall thresholds
    'http_req_duration': ['p(95)<5000', 'p(99)<8000'], // 95% < 5s, 99% < 8s
    'http_req_failed': ['rate<0.01'],                   // <1% failure rate
    'errors': ['rate<0.05'],                            // <5% errors

    // Custom thresholds
    'match_duration': ['p(95)<4000'],                   // 95% matches < 4s
    'matches_found': ['avg>0'],                         // Should find matches
  },
  ext: {
    loadimpact: {
      name: 'Property Matching API Load Test',
      projectID: 3000000, // Replace with your k6 Cloud project ID
    },
  },
};

// Configuration
const BASE_URL = __ENV.API_URL || 'http://localhost:3002';
const API_TOKEN = __ENV.API_TOKEN || '';

export default function () {
  // Test 1: Basic health check
  group('Health Check', () => {
    const healthRes = http.get(`${BASE_URL}/api/health`);

    check(healthRes, {
      'health check status is 200': (r) => r.status === 200,
      'health check responds quickly': (r) => r.timings.duration < 500,
    }) || errorRate.add(1);
  });

  sleep(1);

  // Test 2: Match properties API (main workload)
  group('Match Properties API', () => {
    const payload = JSON.stringify({
      minScore: 40,
      chunkSize: 50,
    });

    const params = {
      headers: {
        'Content-Type': 'application/json',
        ...(API_TOKEN && { 'Authorization': `Bearer ${API_TOKEN}` }),
      },
      timeout: '30s', // Allow up to 30s for complex matching
    };

    const startTime = new Date().getTime();
    const res = http.post(`${BASE_URL}/api/match-properties`, payload, params);
    const endTime = new Date().getTime();
    const duration = endTime - startTime;

    // Record metrics
    matchDuration.add(duration);

    const checkResults = check(res, {
      'status is 200 or 202': (r) => r.status === 200 || r.status === 202,
      'response has stats': (r) => {
        try {
          const body = JSON.parse(r.body);
          return body.stats !== undefined;
        } catch {
          return false;
        }
      },
      'duration < 5s (P95 target)': (r) => r.timings.duration < 5000,
      'duration < 8s (P99 target)': (r) => r.timings.duration < 8000,
      'no server errors': (r) => r.status < 500,
    });

    if (!checkResults) {
      errorRate.add(1);
      apiErrors.add(1);
    }

    // Extract and record match statistics
    try {
      const body = JSON.parse(res.body);
      if (body.stats) {
        if (body.stats.matched !== undefined) {
          matchesFound.add(body.stats.matched);
        }
        if (body.stats.earlyTerminated !== undefined) {
          earlyTerminations.add(body.stats.earlyTerminated);
        }
      }
    } catch (e) {
      console.error('Failed to parse response:', e);
    }
  });

  sleep(2);

  // Test 3: Query existing matches (database read performance)
  group('Query Matches', () => {
    const queryRes = http.get(`${BASE_URL}/api/property-matches`, {
      headers: {
        ...(API_TOKEN && { 'Authorization': `Bearer ${API_TOKEN}` }),
      },
    });

    check(queryRes, {
      'query status is 200': (r) => r.status === 200,
      'query responds quickly': (r) => r.timings.duration < 1000,
      'query returns data': (r) => {
        try {
          const body = JSON.parse(r.body);
          return Array.isArray(body) || body.data !== undefined;
        } catch {
          return false;
        }
      },
    }) || errorRate.add(1);
  });

  sleep(1);
}

// Setup function (runs once per VU)
export function setup() {
  console.log('🚀 Starting Load Test');
  console.log(`   Base URL: ${BASE_URL}`);
  console.log(`   Authentication: ${API_TOKEN ? 'Enabled' : 'Disabled'}`);
  console.log(`   Target: 15 concurrent users`);
  console.log(`   Duration: ~6 minutes`);

  return {
    startTime: new Date().toISOString(),
  };
}

// Teardown function (runs once after all VUs complete)
export function teardown(data) {
  console.log('✅ Load Test Complete');
  console.log(`   Started: ${data.startTime}`);
  console.log(`   Ended: ${new Date().toISOString()}`);
}
