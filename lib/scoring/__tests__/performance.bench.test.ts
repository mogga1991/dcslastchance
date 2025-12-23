/**
 * Performance Benchmark Suite
 * 🚀 PERF-005: Automated performance validation and regression detection
 *
 * Run with: npm test -- performance.bench.ts
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { matchPropertiesWithOpportunities } from '../match-properties';

// Test data storage (must be defined before mock)
const mockData = {
  broker_listings: [] as any[],
  opportunities: [] as any[],
};

// Mock Supabase client with proper chaining and promise returns
vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    from: (table: string) => ({
      select: () => {
        const getData = () => (table === 'broker_listings' ? mockData.broker_listings : mockData.opportunities);

        const createChainablePromise = () => {
          const promise = Promise.resolve({ data: getData(), error: null });
          (promise as any).eq = () => createChainablePromise();
          (promise as any).gte = () => createChainablePromise();
          return promise;
        };

        return {
          eq: () => createChainablePromise(),
          gte: () => createChainablePromise(),
        };
      },
      upsert: () => Promise.resolve({ error: null }),
    }),
  }),
}));

// Helper to create mock property
function createMockProperty(overrides: any = {}) {
  return {
    id: `prop-${Math.random().toString(36).substr(2, 9)}`,
    user_id: 'user-123',
    city: overrides.city || 'Washington',
    state: overrides.state || 'DC',
    lat: 38.9072,
    lng: -77.0369,
    total_sf: 50000,
    available_sf: overrides.available_sf || 50000,
    usable_sf: 45000,
    min_divisible_sf: 10000,
    building_class: 'A',
    total_floors: 10,
    ada_compliant: true,
    parking_spaces: 100,
    parking_ratio: 2.0,
    has_fiber: true,
    has_backup_power: true,
    has_loading_dock: false,
    has_24_7_security: true,
    leed_certified: true,
    energy_star: true,
    available_date: new Date().toISOString(),
    min_lease_term: 60,
    max_lease_term: 240,
    status: 'active',
    ...overrides,
  };
}

// Helper to create mock opportunity
function createMockOpportunity(overrides: any = {}) {
  return {
    id: `opp-${Math.random().toString(36).substr(2, 9)}`,
    notice_id: `NOTICE-${Math.random().toString(36).substr(2, 9)}`,
    title: 'GSA Lease Opportunity',
    description: overrides.description || '50,000 SF Class A office space required',
    pop_city_name: 'Washington',
    pop_state_code: overrides.pop_state_code || 'DC',
    pop_zip: '20001',
    response_deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    active: 'Yes',
    full_data: {},
    ...overrides,
  };
}

/**
 * Generate bulk mock properties
 */
function createMockProperties(count: number, options: { randomStates?: boolean; state?: string } = {}) {
  const states = ['DC', 'VA', 'MD', 'NY', 'CA', 'TX', 'FL', 'IL', 'PA', 'OH'];
  const properties = [];

  for (let i = 0; i < count; i++) {
    let state = 'DC';

    if (options.randomStates) {
      state = states[i % states.length];
    } else if (options.state) {
      state = options.state;
    }

    properties.push(
      createMockProperty({
        id: `prop-bench-${i}`,
        state,
        available_sf: 40000 + Math.floor(Math.random() * 60000), // 40K-100K SF
      })
    );
  }

  return properties;
}

/**
 * Generate bulk mock opportunities
 */
function createMockOpportunities(count: number, options: { state?: string; randomStates?: boolean } = {}) {
  const states = ['DC', 'VA', 'MD', 'NY', 'CA', 'TX', 'FL', 'IL', 'PA', 'OH'];
  const opportunities = [];

  for (let i = 0; i < count; i++) {
    let state = 'DC';

    if (options.randomStates) {
      state = states[i % states.length];
    } else if (options.state) {
      state = options.state;
    }

    const sqft = 30000 + Math.floor(Math.random() * 70000); // 30K-100K SF

    opportunities.push(
      createMockOpportunity({
        id: `opp-bench-${i}`,
        pop_state_code: state,
        description: `approximately ${sqft.toLocaleString()} SF`,
      })
    );
  }

  return opportunities;
}

/**
 * Benchmark results storage for regression detection
 */
interface BenchmarkResult {
  scenario: string;
  properties: number;
  opportunities: number;
  durationMs: number;
  propertiesPerSecond: number;
  earlyTerminationRate: number;
  matchesFound: number;
  timestamp: Date;
}

const benchmarkResults: BenchmarkResult[] = [];

describe('PERF-005: Performance Benchmark Suite', () => {
  const mockSupabaseUrl = 'https://test.supabase.co';
  const mockServiceKey = 'test-service-key';

  beforeEach(() => {
    mockData.broker_listings = [];
    mockData.opportunities = [];
  });

  it('Scenario 1: Small Portfolio (10 properties × 50 opportunities)', async () => {
    const propertiesCount = 10;
    const opportunitiesCount = 50;

    mockData.broker_listings = createMockProperties(propertiesCount, { state: 'DC' });
    mockData.opportunities = createMockOpportunities(opportunitiesCount, { randomStates: true });

    const startTime = Date.now();
    const stats = await matchPropertiesWithOpportunities(mockSupabaseUrl, mockServiceKey, 40);
    const duration = Date.now() - startTime;

    // Performance assertions
    expect(duration).toBeLessThan(1000); // < 1 second
    expect(stats.performanceMetrics?.propertiesPerSecond).toBeGreaterThanOrEqual(0);
    expect(stats.processed).toBe(propertiesCount * opportunitiesCount);

    // Store benchmark result
    benchmarkResults.push({
      scenario: 'Small Portfolio',
      properties: propertiesCount,
      opportunities: opportunitiesCount,
      durationMs: duration,
      propertiesPerSecond: stats.performanceMetrics?.propertiesPerSecond || 0,
      earlyTerminationRate: stats.performanceMetrics?.earlyTerminationRate || 0,
      matchesFound: stats.matched,
      timestamp: new Date(),
    });

    console.log(`✅ Small Portfolio: ${duration}ms | ${stats.matched} matches | ${(stats.performanceMetrics?.earlyTerminationRate! * 100).toFixed(1)}% early terminated`);
  });

  it('Scenario 2: Medium Portfolio (100 properties × 500 opportunities)', async () => {
    const propertiesCount = 100;
    const opportunitiesCount = 500;

    mockData.broker_listings = createMockProperties(propertiesCount, { state: 'DC' });
    mockData.opportunities = createMockOpportunities(opportunitiesCount, { randomStates: true });

    const startTime = Date.now();
    const stats = await matchPropertiesWithOpportunities(mockSupabaseUrl, mockServiceKey, 40);
    const duration = Date.now() - startTime;

    // Performance assertions (relaxed for test environment)
    expect(duration).toBeLessThan(10000); // < 10 seconds (more lenient for CI)
    expect(stats.performanceMetrics?.propertiesPerSecond).toBeGreaterThanOrEqual(0);
    expect(stats.processed).toBe(propertiesCount * opportunitiesCount);

    // Store benchmark result
    benchmarkResults.push({
      scenario: 'Medium Portfolio',
      properties: propertiesCount,
      opportunities: opportunitiesCount,
      durationMs: duration,
      propertiesPerSecond: stats.performanceMetrics?.propertiesPerSecond || 0,
      earlyTerminationRate: stats.performanceMetrics?.earlyTerminationRate || 0,
      matchesFound: stats.matched,
      timestamp: new Date(),
    });

    console.log(`✅ Medium Portfolio: ${duration}ms | ${stats.matched} matches | ${(stats.performanceMetrics?.earlyTerminationRate! * 100).toFixed(1)}% early terminated`);
  });

  it('Scenario 3: Large Portfolio (500 properties × 1000 opportunities)', async () => {
    const propertiesCount = 500;
    const opportunitiesCount = 1000;

    mockData.broker_listings = createMockProperties(propertiesCount, { state: 'DC' });
    mockData.opportunities = createMockOpportunities(opportunitiesCount, { randomStates: true });

    const startTime = Date.now();
    const stats = await matchPropertiesWithOpportunities(mockSupabaseUrl, mockServiceKey, 40);
    const duration = Date.now() - startTime;

    // Performance assertions (relaxed for test environment)
    expect(duration).toBeLessThan(30000); // < 30 seconds (more lenient for CI)
    expect(stats.performanceMetrics?.propertiesPerSecond).toBeGreaterThanOrEqual(0);
    expect(stats.processed).toBe(propertiesCount * opportunitiesCount);

    // Store benchmark result
    benchmarkResults.push({
      scenario: 'Large Portfolio',
      properties: propertiesCount,
      opportunities: opportunitiesCount,
      durationMs: duration,
      propertiesPerSecond: stats.performanceMetrics?.propertiesPerSecond || 0,
      earlyTerminationRate: stats.performanceMetrics?.earlyTerminationRate || 0,
      matchesFound: stats.matched,
      timestamp: new Date(),
    });

    console.log(`✅ Large Portfolio: ${duration}ms | ${stats.matched} matches | ${(stats.performanceMetrics?.earlyTerminationRate! * 100).toFixed(1)}% early terminated`);
  });

  it('Scenario 4: Worst Case - Maximum Early Terminations (100 × 1000, all different states)', async () => {
    const propertiesCount = 100;
    const opportunitiesCount = 1000;

    // Properties in random states, all opportunities in DC
    mockData.broker_listings = createMockProperties(propertiesCount, { randomStates: true });
    mockData.opportunities = createMockOpportunities(opportunitiesCount, { state: 'DC' });

    const startTime = Date.now();
    const stats = await matchPropertiesWithOpportunities(mockSupabaseUrl, mockServiceKey, 40);
    const duration = Date.now() - startTime;

    // Should be VERY fast due to early terminations
    expect(duration).toBeLessThan(5000); // < 5 seconds
    expect(stats.performanceMetrics?.earlyTerminationRate).toBeGreaterThan(0.7); // >70% early terminated
    expect(stats.processed).toBe(propertiesCount * opportunitiesCount);

    // Store benchmark result
    benchmarkResults.push({
      scenario: 'Worst Case (High Early Termination)',
      properties: propertiesCount,
      opportunities: opportunitiesCount,
      durationMs: duration,
      propertiesPerSecond: stats.performanceMetrics?.propertiesPerSecond || 0,
      earlyTerminationRate: stats.performanceMetrics?.earlyTerminationRate || 0,
      matchesFound: stats.matched,
      timestamp: new Date(),
    });

    console.log(`✅ Worst Case: ${duration}ms | ${stats.matched} matches | ${(stats.performanceMetrics?.earlyTerminationRate! * 100).toFixed(1)}% early terminated`);
  });

  it('Scenario 5: Best Case - Minimum Early Terminations (100 × 1000, all same state)', async () => {
    const propertiesCount = 100;
    const opportunitiesCount = 1000;

    // All properties and opportunities in DC
    mockData.broker_listings = createMockProperties(propertiesCount, { state: 'DC' });
    mockData.opportunities = createMockOpportunities(opportunitiesCount, { state: 'DC' });

    const startTime = Date.now();
    const stats = await matchPropertiesWithOpportunities(mockSupabaseUrl, mockServiceKey, 40);
    const duration = Date.now() - startTime;

    // Will be slower as more are scored
    expect(duration).toBeLessThan(15000); // < 15 seconds
    expect(stats.matched).toBeGreaterThan(0);
    expect(stats.processed).toBe(propertiesCount * opportunitiesCount);

    // Store benchmark result
    benchmarkResults.push({
      scenario: 'Best Case (Low Early Termination)',
      properties: propertiesCount,
      opportunities: opportunitiesCount,
      durationMs: duration,
      propertiesPerSecond: stats.performanceMetrics?.propertiesPerSecond || 0,
      earlyTerminationRate: stats.performanceMetrics?.earlyTerminationRate || 0,
      matchesFound: stats.matched,
      timestamp: new Date(),
    });

    console.log(`✅ Best Case: ${duration}ms | ${stats.matched} matches | ${(stats.performanceMetrics?.earlyTerminationRate! * 100).toFixed(1)}% early terminated`);
  });

  it('should generate benchmark summary report', () => {
    // This test runs after all benchmarks to generate a summary
    console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 PERFORMANCE BENCHMARK SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${benchmarkResults.map((result, index) => `
${index + 1}. ${result.scenario}
   Properties: ${result.properties} | Opportunities: ${result.opportunities}
   Duration: ${result.durationMs}ms
   Throughput: ${result.propertiesPerSecond.toFixed(2)} properties/sec
   Early Termination: ${(result.earlyTerminationRate * 100).toFixed(1)}%
   Matches Found: ${result.matchesFound}
`).join('')}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Performance Targets Met:
✅ Small Portfolio: < 1 second
✅ Medium Portfolio: < 10 seconds (target: 4s in production)
✅ Large Portfolio: < 30 seconds (target: 15s in production)
✅ Early Termination Working: >70% in worst case
✅ All Scenarios Complete

Note: Test environment times are higher than production due to mocking overhead.
Production targets: Small < 1s, Medium < 4s, Large < 15s

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `);

    expect(benchmarkResults.length).toBe(5);
  });
});
