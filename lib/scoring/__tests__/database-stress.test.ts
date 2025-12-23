/**
 * Database Stress Tests
 * 🚀 PERF-006: Load testing and performance validation
 *
 * Tests database performance under heavy load:
 * - Bulk insert performance
 * - Query performance with large datasets
 * - Concurrent operation handling
 * - Index efficiency
 *
 * Run with: npm test -- database-stress.test.ts
 *
 * Note: These tests are skipped by default. Enable with:
 * ENABLE_STRESS_TESTS=true npm test -- database-stress.test.ts
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const ENABLE_STRESS_TESTS = process.env.ENABLE_STRESS_TESTS === 'true';
const describeStress = ENABLE_STRESS_TESTS ? describe : describe.skip;

// Database configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

let supabase: SupabaseClient;

// Helper to generate test match data
function generateTestMatches(count: number, propertyIdPrefix = 'stress-prop', oppIdPrefix = 'stress-opp') {
  const matches = [];
  for (let i = 0; i < count; i++) {
    matches.push({
      property_id: `${propertyIdPrefix}-${i % 100}`, // Reuse 100 property IDs
      opportunity_id: `${oppIdPrefix}-${i}`,
      overall_score: 40 + Math.random() * 60, // 40-100
      grade: i % 3 === 0 ? 'A' : i % 3 === 1 ? 'B' : 'C',
      competitive: Math.random() > 0.5,
      qualified: Math.random() > 0.3,
      location_score: 40 + Math.random() * 60,
      space_score: 40 + Math.random() * 60,
      building_score: 40 + Math.random() * 60,
      timeline_score: 40 + Math.random() * 60,
      experience_score: 40 + Math.random() * 60,
      score_breakdown: {
        overallScore: 40 + Math.random() * 60,
        grade: 'A',
        competitive: true,
        qualified: true,
      },
    });
  }
  return matches;
}

// Helper to batch array into chunks
function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

describeStress('PERF-006: Database Stress Tests', () => {
  beforeAll(() => {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      throw new Error('Supabase credentials not configured');
    }
    supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  });

  afterAll(async () => {
    // Cleanup stress test data
    console.log('🧹 Cleaning up stress test data...');
    await supabase
      .from('property_matches')
      .delete()
      .like('property_id', 'stress-prop-%');
  });

  it('should insert 1,000 matches in under 10 seconds', async () => {
    const matches = generateTestMatches(1000, 'stress-1k-prop', 'stress-1k-opp');
    const chunks = chunkArray(matches, 100); // Insert in batches of 100

    const startTime = Date.now();

    for (const chunk of chunks) {
      const { error } = await supabase
        .from('property_matches')
        .upsert(chunk, { onConflict: 'property_id,opportunity_id' });

      if (error) {
        throw new Error(`Insert failed: ${error.message}`);
      }
    }

    const duration = Date.now() - startTime;

    expect(duration).toBeLessThan(10000); // < 10 seconds

    console.log(`✅ Inserted 1,000 matches in ${duration}ms (${(1000 / duration * 1000).toFixed(0)} inserts/sec)`);
  }, 15000); // 15s timeout

  it('should insert 10,000 matches efficiently', async () => {
    const matches = generateTestMatches(10000, 'stress-10k-prop', 'stress-10k-opp');
    const chunks = chunkArray(matches, 500); // Larger batches for bulk insert

    const startTime = Date.now();
    let totalInserted = 0;

    for (const chunk of chunks) {
      const { error, count } = await supabase
        .from('property_matches')
        .upsert(chunk, { onConflict: 'property_id,opportunity_id', count: 'exact' });

      if (error) {
        throw new Error(`Insert failed: ${error.message}`);
      }

      totalInserted += chunk.length;
    }

    const duration = Date.now() - startTime;
    const insertsPerSec = (totalInserted / duration) * 1000;

    expect(duration).toBeLessThan(60000); // < 60 seconds
    expect(totalInserted).toBe(10000);
    expect(insertsPerSec).toBeGreaterThan(100); // At least 100 inserts/sec

    console.log(`✅ Inserted 10,000 matches in ${(duration / 1000).toFixed(1)}s (${insertsPerSec.toFixed(0)} inserts/sec)`);
  }, 120000); // 2 minute timeout

  it('should query matches by property efficiently (index test)', async () => {
    // First ensure we have test data
    const testMatches = generateTestMatches(1000, 'stress-query-prop', 'stress-query-opp');
    await supabase
      .from('property_matches')
      .upsert(testMatches, { onConflict: 'property_id,opportunity_id' });

    // Query all matches for one property
    const startTime = Date.now();

    const { data, error } = await supabase
      .from('property_matches')
      .select('*')
      .eq('property_id', 'stress-query-prop-0');

    const duration = Date.now() - startTime;

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(duration).toBeLessThan(500); // < 500ms (should use index)

    console.log(`✅ Queried property matches in ${duration}ms (${data?.length || 0} results)`);
  });

  it('should query matches by score range efficiently', async () => {
    // Ensure test data exists
    const testMatches = generateTestMatches(1000, 'stress-score-prop', 'stress-score-opp');
    await supabase
      .from('property_matches')
      .upsert(testMatches, { onConflict: 'property_id,opportunity_id' });

    // Query all high-scoring matches
    const startTime = Date.now();

    const { data, error } = await supabase
      .from('property_matches')
      .select('*')
      .gte('overall_score', 80)
      .like('property_id', 'stress-score-prop-%')
      .order('overall_score', { ascending: false });

    const duration = Date.now() - startTime;

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(duration).toBeLessThan(1000); // < 1 second

    console.log(`✅ Score range query in ${duration}ms (${data?.length || 0} results)`);
  });

  it('should handle concurrent inserts', async () => {
    const concurrentBatches = 5;
    const matchesPerBatch = 100;

    const startTime = Date.now();

    // Create concurrent insert operations
    const insertPromises = [];
    for (let i = 0; i < concurrentBatches; i++) {
      const matches = generateTestMatches(
        matchesPerBatch,
        `stress-concurrent-prop-${i}`,
        `stress-concurrent-opp-${i}`
      );

      insertPromises.push(
        supabase
          .from('property_matches')
          .upsert(matches, { onConflict: 'property_id,opportunity_id' })
      );
    }

    const results = await Promise.all(insertPromises);
    const duration = Date.now() - startTime;

    // Verify all inserts succeeded
    results.forEach((result, index) => {
      expect(result.error).toBeNull();
    });

    expect(duration).toBeLessThan(5000); // < 5 seconds for concurrent inserts

    console.log(`✅ ${concurrentBatches} concurrent batches in ${duration}ms`);
  });

  it('should handle upsert conflicts correctly', async () => {
    const propertyId = 'stress-upsert-prop-1';
    const opportunityId = 'stress-upsert-opp-1';

    // Insert initial match
    const initialMatch = {
      property_id: propertyId,
      opportunity_id: opportunityId,
      overall_score: 50,
      grade: 'C',
      competitive: false,
      qualified: true,
      location_score: 50,
      space_score: 50,
      building_score: 50,
      timeline_score: 50,
      experience_score: 50,
      score_breakdown: { overallScore: 50 },
    };

    const { error: insertError } = await supabase
      .from('property_matches')
      .upsert(initialMatch, { onConflict: 'property_id,opportunity_id' });

    expect(insertError).toBeNull();

    // Update with higher score
    const updatedMatch = {
      ...initialMatch,
      overall_score: 75,
      grade: 'B',
      competitive: true,
    };

    const startTime = Date.now();

    const { error: updateError } = await supabase
      .from('property_matches')
      .upsert(updatedMatch, { onConflict: 'property_id,opportunity_id' });

    const duration = Date.now() - startTime;

    expect(updateError).toBeNull();
    expect(duration).toBeLessThan(500); // < 500ms

    // Verify update was applied
    const { data } = await supabase
      .from('property_matches')
      .select('overall_score, grade, competitive')
      .eq('property_id', propertyId)
      .eq('opportunity_id', opportunityId)
      .single();

    expect(data?.overall_score).toBe(75);
    expect(data?.grade).toBe('B');
    expect(data?.competitive).toBe(true);

    console.log(`✅ Upsert conflict handled in ${duration}ms`);
  });

  it('should efficiently delete old matches', async () => {
    // Insert test data with timestamps
    const testMatches = generateTestMatches(500, 'stress-delete-prop', 'stress-delete-opp');

    await supabase
      .from('property_matches')
      .upsert(testMatches, { onConflict: 'property_id,opportunity_id' });

    // Delete matches for specific property pattern
    const startTime = Date.now();

    const { error } = await supabase
      .from('property_matches')
      .delete()
      .like('property_id', 'stress-delete-prop-%');

    const duration = Date.now() - startTime;

    expect(error).toBeNull();
    expect(duration).toBeLessThan(2000); // < 2 seconds

    console.log(`✅ Deleted 500 matches in ${duration}ms`);
  });

  it('should maintain performance with large result sets', async () => {
    // Query without aggressive filtering to get larger result set
    const startTime = Date.now();

    const { data, error } = await supabase
      .from('property_matches')
      .select('property_id, opportunity_id, overall_score, grade')
      .like('property_id', 'stress-%')
      .limit(1000);

    const duration = Date.now() - startTime;

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(duration).toBeLessThan(2000); // < 2 seconds

    console.log(`✅ Large result set query in ${duration}ms (${data?.length || 0} results)`);
  });
});
