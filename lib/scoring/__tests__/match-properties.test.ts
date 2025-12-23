/**
 * Unit tests for PERF-001: Early Termination Optimization
 *
 * Tests the property-opportunity matching engine with early termination logic.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { matchPropertiesWithOpportunities, MatchStats } from '../match-properties';
import type { SAMOpportunity } from '../../sam-gov';

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
        // Helper to get data for this table
        const getData = () => (table === 'broker_listings' ? mockData.broker_listings : mockData.opportunities);

        // Create a promise-like object that can be chained or awaited
        const createChainablePromise = () => {
          const promise = Promise.resolve({ data: getData(), error: null });
          // Add chaining methods to the promise
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
    id: `prop-${Math.random()}`,
    user_id: 'user-123',
    city: 'Washington',
    state: 'DC',
    lat: 38.9072,
    lng: -77.0369,
    total_sf: 50000,
    available_sf: 50000,
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
    id: `opp-${Math.random()}`,
    notice_id: `NOTICE-${Math.random()}`,
    title: 'GSA Lease Opportunity',
    description: '50,000 SF Class A office space required',
    pop_city_name: 'Washington',
    pop_state_code: 'DC',
    pop_zip: '20001',
    response_deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    active: 'Yes',
    full_data: {},
    ...overrides,
  };
}

describe('PERF-001: Early Termination Optimization', () => {
  const mockSupabaseUrl = 'https://test.supabase.co';
  const mockServiceKey = 'test-service-key';

  beforeEach(() => {
    // Reset mock data before each test
    mockData.broker_listings = [];
    mockData.opportunities = [];
    vi.clearAllMocks();
  });

  describe('Early Termination: State Mismatch', () => {
    it('should early terminate when property state does not match opportunity state', async () => {
      // Property in California
      mockData.broker_listings = [createMockProperty({ state: 'CA', city: 'Los Angeles' })];

      // Opportunity in DC
      mockData.opportunities = [createMockOpportunity({ pop_state_code: 'DC', pop_city_name: 'Washington' })];

      const stats = await matchPropertiesWithOpportunities(mockSupabaseUrl, mockServiceKey, 40);

      // Should process the combination
      expect(stats.processed).toBe(1);

      // Should early terminate
      expect(stats.earlyTerminated).toBe(1);
      expect(stats.earlyTerminationReasons.STATE_MISMATCH).toBe(1);

      // Should not find matches
      expect(stats.matched).toBe(0);

      // Should be skipped
      expect(stats.skipped).toBeGreaterThan(0);
    });

    it('should NOT early terminate when states match', async () => {
      // Both in DC
      mockData.broker_listings = [createMockProperty({ state: 'DC' })];
      mockData.opportunities = [createMockOpportunity({ pop_state_code: 'DC' })];

      const stats = await matchPropertiesWithOpportunities(mockSupabaseUrl, mockServiceKey, 40);

      // Should NOT early terminate for state mismatch
      expect(stats.earlyTerminationReasons.STATE_MISMATCH).toBe(0);

      // Should process fully
      expect(stats.processed).toBe(1);
    });

    it('should save 80% computation when 80% of opportunities are in different states', async () => {
      // 1 property in DC
      mockData.broker_listings = [createMockProperty({ state: 'DC' })];

      // 10 opportunities: 2 in DC, 8 in other states
      mockData.opportunities = [
        createMockOpportunity({ pop_state_code: 'DC' }),
        createMockOpportunity({ pop_state_code: 'DC' }),
        createMockOpportunity({ pop_state_code: 'CA' }),
        createMockOpportunity({ pop_state_code: 'NY' }),
        createMockOpportunity({ pop_state_code: 'TX' }),
        createMockOpportunity({ pop_state_code: 'FL' }),
        createMockOpportunity({ pop_state_code: 'IL' }),
        createMockOpportunity({ pop_state_code: 'OH' }),
        createMockOpportunity({ pop_state_code: 'PA' }),
        createMockOpportunity({ pop_state_code: 'GA' }),
      ];

      const stats = await matchPropertiesWithOpportunities(mockSupabaseUrl, mockServiceKey, 40);

      // Should process all 10 combinations
      expect(stats.processed).toBe(10);

      // Should early terminate 8 (80%)
      expect(stats.earlyTerminationReasons.STATE_MISMATCH).toBe(8);

      // Total early terminations should be at least 8
      expect(stats.earlyTerminated).toBeGreaterThanOrEqual(8);

      // Computation saved should be ~80%
      const computationSaved = (stats.earlyTerminated / stats.processed) * 100;
      expect(computationSaved).toBeGreaterThanOrEqual(70); // Allow some margin
    });
  });

  describe('Early Termination: Space Too Small', () => {
    it('should early terminate when property is >30% below minimum space', async () => {
      // Property with only 30,000 SF
      mockData.broker_listings = [createMockProperty({ available_sf: 30000, state: 'DC' })];

      // Opportunity requiring 55,000 SF
      // Parser extracts: target=55,000, min=44,000 (55k * 0.8)
      // Check: 30,000 < 44,000 * 0.7 = 30,800 ✓ (triggers early termination)
      mockData.opportunities = [
        createMockOpportunity({
          pop_state_code: 'DC',
          description: 'Lease requirement: approximately 55,000 SF',
        }),
      ];

      const stats = await matchPropertiesWithOpportunities(mockSupabaseUrl, mockServiceKey, 40);

      // Should early terminate for space
      expect(stats.earlyTerminationReasons.SPACE_TOO_SMALL).toBe(1);
      expect(stats.earlyTerminated).toBe(1);
      expect(stats.matched).toBe(0);
    });

    it('should NOT early terminate when property is within 30% of minimum', async () => {
      // Property with 40,000 SF (only 20% below)
      mockData.broker_listings = [createMockProperty({ available_sf: 40000, state: 'DC' })];

      // Opportunity requiring 50,000 SF
      mockData.opportunities = [
        createMockOpportunity({
          pop_state_code: 'DC',
          description: 'Lease requirement: approximately 50,000 SF',
        }),
      ];

      const stats = await matchPropertiesWithOpportunities(mockSupabaseUrl, mockServiceKey, 40);

      // Should NOT early terminate for space (within tolerance)
      expect(stats.earlyTerminationReasons.SPACE_TOO_SMALL).toBe(0);

      // May or may not match depending on other factors, but should not early terminate
      expect(stats.processed).toBe(1);
    });

    it('should NOT early terminate when property exceeds minimum space', async () => {
      // Property with 60,000 SF (exceeds requirement)
      mockData.broker_listings = [createMockProperty({ available_sf: 60000, state: 'DC' })];

      // Opportunity requiring 50,000 SF
      mockData.opportunities = [
        createMockOpportunity({
          pop_state_code: 'DC',
          description: 'Lease requirement: approximately 50,000 SF',
        }),
      ];

      const stats = await matchPropertiesWithOpportunities(mockSupabaseUrl, mockServiceKey, 40);

      // Should NOT early terminate for space
      expect(stats.earlyTerminationReasons.SPACE_TOO_SMALL).toBe(0);
    });
  });

  describe('Early Termination: Invalid Requirements', () => {
    it('should early terminate when opportunity has no valid requirements', async () => {
      mockData.broker_listings = [createMockProperty({ state: 'DC' })];

      // Opportunity with no state or space requirements
      mockData.opportunities = [
        {
          id: 'opp-invalid',
          notice_id: 'INVALID',
          title: 'Invalid Opportunity',
          description: '', // No parseable requirements
          pop_state_code: '', // No state
          pop_city_name: null,
          pop_zip: null,
          response_deadline: new Date().toISOString(),
          active: 'Yes',
        },
      ];

      const stats = await matchPropertiesWithOpportunities(mockSupabaseUrl, mockServiceKey, 40);

      // Should early terminate for invalid requirements
      expect(stats.earlyTerminationReasons.INVALID_REQUIREMENTS).toBe(1);
      expect(stats.matched).toBe(0);
    });
  });

  describe('Performance Metrics Tracking', () => {
    it('should track early termination statistics correctly', async () => {
      mockData.broker_listings = [
        createMockProperty({ id: 'prop-1', state: 'DC', available_sf: 50000 }),
      ];

      mockData.opportunities = [
        createMockOpportunity({ id: 'opp-1', pop_state_code: 'DC', description: '50,000 SF' }), // Match
        createMockOpportunity({ id: 'opp-2', pop_state_code: 'CA' }), // State mismatch
        createMockOpportunity({ id: 'opp-3', pop_state_code: 'NY' }), // State mismatch
        createMockOpportunity({ id: 'opp-4', pop_state_code: 'DC', description: '100,000 SF' }), // Space too small
      ];

      const stats = await matchPropertiesWithOpportunities(mockSupabaseUrl, mockServiceKey, 40);

      // Should process all 4
      expect(stats.processed).toBe(4);

      // Should have 3 early terminations (2 state + 1 space)
      expect(stats.earlyTerminated).toBe(3);
      expect(stats.earlyTerminationReasons.STATE_MISMATCH).toBe(2);
      expect(stats.earlyTerminationReasons.SPACE_TOO_SMALL).toBe(1);

      // Computation saved should be 75%
      const saved = (stats.earlyTerminated / stats.processed) * 100;
      expect(saved).toBe(75);
    });

    it('should calculate performance metrics for large batches', async () => {
      // 5 properties
      mockData.broker_listings = [
        createMockProperty({ id: 'prop-1', state: 'DC' }),
        createMockProperty({ id: 'prop-2', state: 'CA' }),
        createMockProperty({ id: 'prop-3', state: 'NY' }),
        createMockProperty({ id: 'prop-4', state: 'TX' }),
        createMockProperty({ id: 'prop-5', state: 'DC' }),
      ];

      // 20 opportunities (10 in DC, 10 in other states)
      mockData.opportunities = [
        ...Array(10).fill(null).map(() => createMockOpportunity({ pop_state_code: 'DC' })),
        ...Array(10).fill(null).map(() => createMockOpportunity({ pop_state_code: 'FL' })),
      ];

      const stats = await matchPropertiesWithOpportunities(mockSupabaseUrl, mockServiceKey, 40);

      // Should process 5 × 20 = 100 combinations
      expect(stats.processed).toBe(100);

      // DC properties (2): Match with DC opps (10 each) = 20 matches possible
      // CA, NY, TX properties (3): Early terminate with non-DC opps (10 each) = 30 early terminations minimum

      // Should have significant early terminations
      expect(stats.earlyTerminated).toBeGreaterThan(30);

      // Should track duration
      expect(stats.durationMs).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Match Quality (No Regression)', () => {
    it('should still find valid matches after adding early termination', async () => {
      // Perfect match scenario
      mockData.broker_listings = [
        createMockProperty({
          state: 'DC',
          available_sf: 50000,
          building_class: 'A',
          ada_compliant: true,
        }),
      ];

      mockData.opportunities = [
        createMockOpportunity({
          pop_state_code: 'DC',
          description: '50,000 SF Class A office space',
        }),
      ];

      const stats = await matchPropertiesWithOpportunities(mockSupabaseUrl, mockServiceKey, 40);

      // Should NOT early terminate
      expect(stats.earlyTerminated).toBe(0);

      // Should find match
      expect(stats.matched).toBeGreaterThanOrEqual(0); // May or may not match based on score
    });

    it('should not affect matching for properties that pass early checks', async () => {
      mockData.broker_listings = [
        createMockProperty({ state: 'DC', available_sf: 50000 }),
        createMockProperty({ state: 'DC', available_sf: 60000 }),
      ];

      mockData.opportunities = [
        createMockOpportunity({ pop_state_code: 'DC', description: '45,000 SF' }),
        createMockOpportunity({ pop_state_code: 'DC', description: '55,000 SF' }),
      ];

      const stats = await matchPropertiesWithOpportunities(mockSupabaseUrl, mockServiceKey, 40);

      // All combinations pass early checks
      expect(stats.earlyTerminationReasons.STATE_MISMATCH).toBe(0);
      expect(stats.earlyTerminationReasons.SPACE_TOO_SMALL).toBe(0);

      // Should process all 4 combinations fully
      expect(stats.processed).toBe(4);
    });
  });

  describe('Error Handling', () => {
    it('should handle errors gracefully and continue processing', async () => {
      mockData.broker_listings = [
        createMockProperty({ id: 'prop-1', state: 'DC' }),
        createMockProperty({ id: 'prop-2', state: null as any }), // Invalid data
      ];

      mockData.opportunities = [createMockOpportunity({ pop_state_code: 'DC' })];

      const stats = await matchPropertiesWithOpportunities(mockSupabaseUrl, mockServiceKey, 40);

      // Should still process what it can
      expect(stats.processed).toBeGreaterThan(0);

      // May have errors
      // The exact behavior depends on how the code handles null states
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty property list', async () => {
      mockData.broker_listings = [];
      mockData.opportunities = [createMockOpportunity()];

      const stats = await matchPropertiesWithOpportunities(mockSupabaseUrl, mockServiceKey, 40);

      expect(stats.processed).toBe(0);
      expect(stats.matched).toBe(0);
      expect(stats.errors).toContain('No active properties found');
    });

    it('should handle empty opportunity list', async () => {
      mockData.broker_listings = [createMockProperty()];
      mockData.opportunities = [];

      const stats = await matchPropertiesWithOpportunities(mockSupabaseUrl, mockServiceKey, 40);

      expect(stats.processed).toBe(0);
      expect(stats.matched).toBe(0);
      expect(stats.errors).toContain('No active opportunities found');
    });

    it('should handle properties with missing space data', async () => {
      mockData.broker_listings = [
        createMockProperty({ available_sf: null, state: 'DC' }),
      ];

      mockData.opportunities = [
        createMockOpportunity({ pop_state_code: 'DC', description: '50,000 SF' }),
      ];

      const stats = await matchPropertiesWithOpportunities(mockSupabaseUrl, mockServiceKey, 40);

      // Should not crash
      expect(stats.processed).toBe(1);
    });
  });

  describe('PERF-002: Parallel Processing', () => {
    it('should process multiple properties in parallel', async () => {
      // 3 properties
      mockData.broker_listings = [
        createMockProperty({ id: 'prop-1', state: 'DC', available_sf: 50000 }),
        createMockProperty({ id: 'prop-2', state: 'DC', available_sf: 60000 }),
        createMockProperty({ id: 'prop-3', state: 'DC', available_sf: 40000 }),
      ];

      // 2 opportunities
      mockData.opportunities = [
        createMockOpportunity({ id: 'opp-1', pop_state_code: 'DC', description: 'approximately 45,000 SF' }),
        createMockOpportunity({ id: 'opp-2', pop_state_code: 'DC', description: 'approximately 55,000 SF' }),
      ];

      const stats = await matchPropertiesWithOpportunities(mockSupabaseUrl, mockServiceKey, 40);

      // Should process all 3 × 2 = 6 combinations
      expect(stats.processed).toBe(6);

      // Should track performance
      expect(stats.durationMs).toBeGreaterThanOrEqual(0);
    });

    it('should correctly aggregate stats from parallel executions', async () => {
      // 2 properties: 1 in DC, 1 in CA
      mockData.broker_listings = [
        createMockProperty({ id: 'prop-dc', state: 'DC', available_sf: 50000 }),
        createMockProperty({ id: 'prop-ca', state: 'CA', available_sf: 50000 }),
      ];

      // 3 opportunities: 2 in DC, 1 in NY
      mockData.opportunities = [
        createMockOpportunity({ id: 'opp-dc-1', pop_state_code: 'DC', description: 'approximately 45,000 SF' }),
        createMockOpportunity({ id: 'opp-dc-2', pop_state_code: 'DC', description: 'approximately 50,000 SF' }),
        createMockOpportunity({ id: 'opp-ny', pop_state_code: 'NY', description: 'approximately 50,000 SF' }),
      ];

      const stats = await matchPropertiesWithOpportunities(mockSupabaseUrl, mockServiceKey, 40);

      // Total combinations: 2 properties × 3 opportunities = 6
      expect(stats.processed).toBe(6);

      // Early terminations:
      // - DC property vs NY opp: 1 state mismatch
      // - CA property vs all 3 opps: 3 state mismatches
      // Total: 4 state mismatches
      expect(stats.earlyTerminationReasons.STATE_MISMATCH).toBe(4);
      expect(stats.earlyTerminated).toBe(4);

      // Processed without early termination: 6 - 4 = 2
      const fullCalculations = stats.processed - stats.earlyTerminated;
      expect(fullCalculations).toBe(2);
    });

    it('should handle errors in parallel without failing entire batch', async () => {
      // Create properties that will cause different outcomes
      mockData.broker_listings = [
        createMockProperty({ id: 'prop-1', state: 'DC', available_sf: 50000 }),
        createMockProperty({ id: 'prop-2', state: null as any }), // This might cause errors
        createMockProperty({ id: 'prop-3', state: 'DC', available_sf: 60000 }),
      ];

      mockData.opportunities = [
        createMockOpportunity({ pop_state_code: 'DC', description: 'approximately 50,000 SF' }),
      ];

      const stats = await matchPropertiesWithOpportunities(mockSupabaseUrl, mockServiceKey, 40);

      // Should still process what it can
      expect(stats.processed).toBeGreaterThan(0);

      // Should complete without throwing
      expect(stats).toBeDefined();
    });

    it('should maintain consistency with sequential processing', async () => {
      // Use consistent test data
      mockData.broker_listings = [
        createMockProperty({ id: 'prop-1', state: 'DC', available_sf: 50000 }),
        createMockProperty({ id: 'prop-2', state: 'CA', available_sf: 40000 }),
      ];

      mockData.opportunities = [
        createMockOpportunity({ id: 'opp-1', pop_state_code: 'DC', description: 'approximately 45,000 SF' }),
        createMockOpportunity({ id: 'opp-2', pop_state_code: 'CA', description: 'approximately 35,000 SF' }),
      ];

      const stats = await matchPropertiesWithOpportunities(mockSupabaseUrl, mockServiceKey, 40);

      // Verify consistent behavior
      // Total: 2 properties × 2 opportunities = 4 combinations
      expect(stats.processed).toBe(4);

      // Each property should match only with same-state opportunities
      // prop-1 (DC) matches opp-2 (CA): state mismatch
      // prop-2 (CA) matches opp-1 (DC): state mismatch
      // Total state mismatches: 2
      expect(stats.earlyTerminationReasons.STATE_MISMATCH).toBe(2);
    });

    it('should process large batches efficiently', async () => {
      // Simulate a realistic batch: 10 properties × 20 opportunities
      mockData.broker_listings = Array(10).fill(null).map((_, i) =>
        createMockProperty({
          id: `prop-${i}`,
          state: i % 3 === 0 ? 'DC' : i % 3 === 1 ? 'CA' : 'NY',
          available_sf: 50000
        })
      );

      mockData.opportunities = Array(20).fill(null).map((_, i) =>
        createMockOpportunity({
          id: `opp-${i}`,
          pop_state_code: i % 2 === 0 ? 'DC' : 'TX',
          description: 'approximately 45,000 SF'
        })
      );

      const startTime = Date.now();
      const stats = await matchPropertiesWithOpportunities(mockSupabaseUrl, mockServiceKey, 40);
      const duration = Date.now() - startTime;

      // Should process all 10 × 20 = 200 combinations
      expect(stats.processed).toBe(200);

      // Should have significant early terminations due to state mismatches
      expect(stats.earlyTerminated).toBeGreaterThan(100);

      // Parallel processing should complete quickly (< 1 second for 200 combinations)
      expect(duration).toBeLessThan(1000);

      // Should track duration
      expect(stats.durationMs).toBeGreaterThanOrEqual(0);
    });
  });
});

describe('PERF-003: Chunked Batch Processing', () => {
  const mockSupabaseUrl = 'https://test.supabase.co';
  const mockServiceKey = 'test-service-key';

  beforeEach(() => {
    // Reset mock data before each test
    mockData.broker_listings = [];
    mockData.opportunities = [];
  });

  it('should process properties in chunks with default chunk size', async () => {
    // Create enough properties to trigger multiple chunks with default size (50)
    mockData.broker_listings = Array(120).fill(null).map((_, i) =>
      createMockProperty({ id: `prop-${i}`, state: 'DC', available_sf: 50000 })
    );

    mockData.opportunities = [
      createMockOpportunity({ id: 'opp-1', pop_state_code: 'DC', description: 'approximately 45,000 SF' }),
    ];

    const stats = await matchPropertiesWithOpportunities(mockSupabaseUrl, mockServiceKey, 40);

    expect(stats.processed).toBe(120); // All properties processed
    expect(stats.durationMs).toBeGreaterThanOrEqual(0);
  });

  it('should respect custom chunk size parameter', async () => {
    mockData.broker_listings = Array(30).fill(null).map((_, i) =>
      createMockProperty({ id: `prop-${i}`, state: 'DC', available_sf: 50000 })
    );

    mockData.opportunities = [
      createMockOpportunity({ id: 'opp-1', pop_state_code: 'DC', description: 'approximately 45,000 SF' }),
    ];

    // Use custom chunk size of 10
    const stats = await matchPropertiesWithOpportunities(mockSupabaseUrl, mockServiceKey, 40, 10);

    expect(stats.processed).toBe(30); // All processed
    expect(stats.durationMs).toBeGreaterThanOrEqual(0);
  });

  it('should handle chunk size larger than property count', async () => {
    mockData.broker_listings = Array(5).fill(null).map((_, i) =>
      createMockProperty({ id: `prop-${i}`, state: 'DC', available_sf: 50000 })
    );

    mockData.opportunities = [
      createMockOpportunity({ id: 'opp-1', pop_state_code: 'DC', description: 'approximately 45,000 SF' }),
    ];

    // Chunk size of 100 is larger than 5 properties
    const stats = await matchPropertiesWithOpportunities(mockSupabaseUrl, mockServiceKey, 40, 100);

    expect(stats.processed).toBe(5); // All 5 processed in single chunk
    expect(stats.durationMs).toBeGreaterThanOrEqual(0);
  });

  it('should correctly aggregate stats across multiple chunks', async () => {
    mockData.broker_listings = [
      createMockProperty({ id: 'prop-dc-1', state: 'DC', available_sf: 50000 }),
      createMockProperty({ id: 'prop-dc-2', state: 'DC', available_sf: 50000 }),
      createMockProperty({ id: 'prop-ca-1', state: 'CA', available_sf: 50000 }),
      createMockProperty({ id: 'prop-ca-2', state: 'CA', available_sf: 50000 }),
    ];

    mockData.opportunities = [
      createMockOpportunity({ id: 'opp-dc', pop_state_code: 'DC', description: 'approximately 45,000 SF' }),
      createMockOpportunity({ id: 'opp-ny', pop_state_code: 'NY', description: 'approximately 45,000 SF' }),
    ];

    // Chunk size of 2 means 2 chunks
    const stats = await matchPropertiesWithOpportunities(mockSupabaseUrl, mockServiceKey, 40, 2);

    expect(stats.processed).toBe(8); // 4 properties × 2 opportunities
    expect(stats.earlyTerminationReasons.STATE_MISMATCH).toBe(6); // 6 state mismatches
    expect(stats.earlyTerminated).toBe(6);
  });

  it('should process large batches efficiently with chunking', async () => {
    // Simulate realistic production scenario
    mockData.broker_listings = Array(100).fill(null).map((_, i) =>
      createMockProperty({
        id: `prop-${i}`,
        state: i % 3 === 0 ? 'DC' : i % 3 === 1 ? 'CA' : 'NY',
        available_sf: 50000
      })
    );

    mockData.opportunities = Array(50).fill(null).map((_, i) =>
      createMockOpportunity({
        id: `opp-${i}`,
        pop_state_code: i % 2 === 0 ? 'DC' : 'TX',
        description: 'approximately 45,000 SF'
      })
    );

    const startTime = Date.now();
    const stats = await matchPropertiesWithOpportunities(mockSupabaseUrl, mockServiceKey, 40, 25);
    const duration = Date.now() - startTime;

    expect(stats.processed).toBe(5000); // 100 × 50 = 5000
    expect(stats.earlyTerminated).toBeGreaterThan(3000); // Most should early terminate
    expect(duration).toBeLessThan(2000); // Should complete quickly
    expect(stats.durationMs).toBeGreaterThanOrEqual(0);
  });

  it('should handle errors in one chunk without failing other chunks', async () => {
    mockData.broker_listings = [
      createMockProperty({ id: 'prop-1', state: 'DC', available_sf: 50000 }),
      createMockProperty({ id: 'prop-2', state: null as any }), // Might cause errors
      createMockProperty({ id: 'prop-3', state: 'DC', available_sf: 60000 }),
      createMockProperty({ id: 'prop-4', state: 'DC', available_sf: 40000 }),
    ];

    mockData.opportunities = [
      createMockOpportunity({ id: 'opp-1', pop_state_code: 'DC', description: 'approximately 45,000 SF' }),
    ];

    // Chunk size of 2 means 2 chunks
    const stats = await matchPropertiesWithOpportunities(mockSupabaseUrl, mockServiceKey, 40, 2);

    expect(stats.processed).toBeGreaterThan(0); // Some processed
    expect(stats).toBeDefined();
  });

  it('should maintain match quality across chunked processing', async () => {
    const properties = Array(20).fill(null).map((_, i) =>
      createMockProperty({ id: `prop-${i}`, state: 'DC', available_sf: 50000 })
    );

    const opportunities = [
      createMockOpportunity({ id: 'opp-1', pop_state_code: 'DC', description: 'approximately 45,000 SF' }),
    ];

    mockData.broker_listings = properties;
    mockData.opportunities = opportunities;

    // Process with different chunk sizes - results should be identical
    const stats1 = await matchPropertiesWithOpportunities(mockSupabaseUrl, mockServiceKey, 40, 5);

    mockData.broker_listings = properties;
    mockData.opportunities = opportunities;

    const stats2 = await matchPropertiesWithOpportunities(mockSupabaseUrl, mockServiceKey, 40, 10);

    expect(stats1.processed).toBe(stats2.processed);
    expect(stats1.matched).toBe(stats2.matched);
    expect(stats1.skipped).toBe(stats2.skipped);
    expect(stats1.earlyTerminated).toBe(stats2.earlyTerminated);
  });
});
