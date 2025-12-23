# Sprint 1: Performance Optimization - Implementation Tickets

**Sprint Goal:** Reduce batch matching time by 70% (from 10-15s to <4s for 100 properties)

**Sprint Duration:** Week 1 (5 days)

**Team:** 1 Senior Backend Engineer + 1 QA Engineer (part-time)

---

## Ticket Overview

| ID | Title | Priority | Effort | Status | Assignee |
|----|-------|----------|--------|--------|----------|
| PERF-001 | Implement early termination for state mismatch | 🔴 Critical | 4h | 📋 Ready | Backend |
| PERF-002 | Add parallel processing with Promise.all | 🔴 Critical | 6h | 📋 Ready | Backend |
| PERF-003 | Implement chunked batch processing | 🔴 Critical | 4h | 📋 Ready | Backend |
| PERF-004 | Add performance instrumentation and logging | 🟠 High | 3h | 📋 Ready | Backend |
| PERF-005 | Create performance benchmark suite | 🟠 High | 4h | 📋 Ready | QA |
| PERF-006 | Load testing and performance validation | 🟠 High | 4h | 📋 Ready | QA |
| PERF-007 | Deploy to production with monitoring | 🔴 Critical | 2h | 📋 Ready | DevOps |

**Total Effort:** 27 hours (~3.5 days with buffer)

---

## 🎫 PERF-001: Implement Early Termination for State Mismatch

**Priority:** 🔴 Critical
**Effort:** 4 hours
**Assignee:** Backend Engineer
**Dependencies:** None
**Labels:** `performance`, `optimization`, `quick-win`

### Description

Add early termination logic to skip property-opportunity matches when the property is not in the required state. This is the **highest ROI optimization** as it eliminates 80% of unnecessary scoring calculations.

**Current Behavior:**
```typescript
// ALL opportunities are scored, even if property is in wrong state
for (const opportunity of opportunities) {
  const scoreResult = calculateMatchScore(...)  // Runs ALL 5 scoring functions
}
```

**Expected Behavior:**
```typescript
// Skip immediately if state doesn't match
if (property.state !== requirements.location.state) {
  stats.skipped++;
  stats.earlyTerminated++;
  stats.earlyTerminationReason = 'STATE_MISMATCH';
  continue;  // Skip remaining scoring functions
}
```

### Technical Details

**File to Modify:** `lib/scoring/match-properties.ts`

**Location:** Inside the nested loop (line ~210)

**Implementation Steps:**

1. Parse state requirement early (before calling calculateMatchScore)
2. Compare property.state to requirements.location.state
3. Skip to next opportunity if mismatch
4. Track early termination stats

**Code Changes:**

```typescript
// lib/scoring/match-properties.ts

export interface MatchStats {
  processed: number;
  matched: number;
  skipped: number;
  earlyTerminated: number;        // NEW
  earlyTerminationReasons: {      // NEW
    STATE_MISMATCH: number;
    SPACE_TOO_SMALL: number;
    // Add more reasons later
  };
  errors: string[];
  startTime: Date;
  endTime: Date;
  durationMs: number;
}

export async function matchPropertiesWithOpportunities(
  supabaseUrl: string,
  supabaseServiceKey: string,
  minScore: number = 40
): Promise<MatchStats> {
  const startTime = new Date();
  const stats: MatchStats = {
    processed: 0,
    matched: 0,
    skipped: 0,
    earlyTerminated: 0,              // NEW
    earlyTerminationReasons: {       // NEW
      STATE_MISMATCH: 0,
      SPACE_TOO_SMALL: 0,
    },
    errors: [],
    startTime,
    endTime: new Date(),
    durationMs: 0,
  };

  // ... (existing setup code)

  for (const property of properties as BrokerListing[]) {
    const propertyData = convertToPropertyData(property);

    for (const opportunity of opportunities) {
      try {
        stats.processed++;

        // Parse opportunity requirements
        const requirements = parseOpportunityRequirements(opportunity as SAMOpportunity);

        // Skip if requirements are invalid
        if (!hasValidRequirements(requirements)) {
          stats.skipped++;
          continue;
        }

        // 🚀 NEW: Early termination for state mismatch
        if (property.state !== requirements.location.state) {
          stats.skipped++;
          stats.earlyTerminated++;
          stats.earlyTerminationReasons.STATE_MISMATCH++;
          console.log(
            `⚡ Early termination: Property ${property.id} (${property.state}) ` +
            `doesn't match opportunity ${opportunity.id} (${requirements.location.state})`
          );
          continue;
        }

        // 🚀 NEW: Early termination for severe space shortage (>30% under minimum)
        if (requirements.space.minSqFt && property.available_sf < requirements.space.minSqFt * 0.7) {
          stats.skipped++;
          stats.earlyTerminated++;
          stats.earlyTerminationReasons.SPACE_TOO_SMALL++;
          console.log(
            `⚡ Early termination: Property ${property.id} (${property.available_sf} SF) ` +
            `too small for opportunity ${opportunity.id} (min ${requirements.space.minSqFt} SF)`
          );
          continue;
        }

        // Calculate match score (only if passed early checks)
        const scoreResult = calculateMatchScore(
          propertyData,
          DEFAULT_BROKER_EXPERIENCE,
          requirements
        );

        // Only store matches meeting minimum threshold
        if (scoreResult.overallScore >= minScore) {
          matches.push({
            property_id: property.id,
            opportunity_id: opportunity.id,
            overall_score: scoreResult.overallScore,
            grade: scoreResult.grade,
            competitive: scoreResult.competitive,
            qualified: scoreResult.qualified,
            location_score: scoreResult.factors.location.score,
            space_score: scoreResult.factors.space.score,
            building_score: scoreResult.factors.building.score,
            timeline_score: scoreResult.factors.timeline.score,
            experience_score: scoreResult.factors.experience.score,
            score_breakdown: scoreResult,
          });
          stats.matched++;
        } else {
          stats.skipped++;
        }
      } catch (error) {
        const err = error as Error;
        stats.errors.push(
          `Error matching property ${property.id} with opportunity ${opportunity.id}: ${err.message}`
        );
      }
    }
  }

  // Log early termination statistics
  console.log(`
📊 Early Termination Statistics:
   Total Early Terminations: ${stats.earlyTerminated}
   - State Mismatch: ${stats.earlyTerminationReasons.STATE_MISMATCH}
   - Space Too Small: ${stats.earlyTerminationReasons.SPACE_TOO_SMALL}
   Computation Saved: ${Math.round((stats.earlyTerminated / stats.processed) * 100)}%
  `);

  // ... (rest of function)
}
```

### Acceptance Criteria

- [ ] State mismatch check added before calculateMatchScore
- [ ] Early termination for properties >30% below minimum space requirement
- [ ] Stats tracking includes `earlyTerminated` count
- [ ] Stats tracking includes breakdown by termination reason
- [ ] Console logs show early termination events
- [ ] No regression in existing match quality (same scores for valid matches)
- [ ] Unit tests added for early termination logic
- [ ] Performance improvement documented (expect 40-60% reduction)

### Testing

**Unit Tests:**
```typescript
// lib/scoring/__tests__/match-properties.test.ts
describe('Early Termination', () => {
  it('should skip scoring when property state does not match', () => {
    const property = { state: 'CA', ... };
    const opportunity = { pop_state_code: 'DC', ... };

    const stats = await matchPropertiesWithOpportunities(...);

    expect(stats.earlyTerminated).toBeGreaterThan(0);
    expect(stats.earlyTerminationReasons.STATE_MISMATCH).toBeGreaterThan(0);
  });

  it('should skip scoring when property is >30% below minimum space', () => {
    const property = { available_sf: 20000, ... };
    const opportunity = { description: '50,000 SF required', ... };

    const stats = await matchPropertiesWithOpportunities(...);

    expect(stats.earlyTerminationReasons.SPACE_TOO_SMALL).toBeGreaterThan(0);
  });

  it('should NOT early terminate for valid matches', () => {
    const property = { state: 'DC', available_sf: 50000, ... };
    const opportunity = { pop_state_code: 'DC', description: '45,000 SF', ... };

    const stats = await matchPropertiesWithOpportunities(...);

    expect(stats.matched).toBeGreaterThan(0);
    // This match should NOT be in early terminations
  });
});
```

### Performance Target

- **Before:** 100 properties × 500 opportunities = 50,000 score calculations
- **After:** ~10,000 score calculations (assuming 80% different states)
- **Expected Improvement:** 40-60% reduction in execution time

### Related Files

- `lib/scoring/match-properties.ts` (main implementation)
- `lib/scoring/parse-opportunity.ts` (for requirements parsing)
- `lib/scoring/__tests__/match-properties.test.ts` (new test file)

---

## 🎫 PERF-002: Add Parallel Processing with Promise.all

**Priority:** 🔴 Critical
**Effort:** 6 hours
**Assignee:** Backend Engineer
**Dependencies:** PERF-001 (recommended but not blocking)
**Labels:** `performance`, `optimization`, `async`

### Description

Convert sequential property matching to parallel processing using `Promise.all()`. This leverages Node.js's event loop to process multiple properties concurrently, providing 4-8x speedup.

**Current Behavior:**
```typescript
// Sequential - properties processed one at a time
for (const property of properties) {
  for (const opportunity of opportunities) {
    await calculateMatchScore(...)  // BLOCKING
  }
}
```

**Expected Behavior:**
```typescript
// Parallel - process multiple properties simultaneously
await Promise.all(
  properties.map(property =>
    processPropertyMatches(property, opportunities)
  )
);
```

### Technical Details

**File to Modify:** `lib/scoring/match-properties.ts`

**Implementation Steps:**

1. Extract inner loop into separate function `processPropertyMatches`
2. Use `Promise.all` to process properties in parallel
3. Handle errors gracefully (don't fail entire batch)
4. Maintain stats aggregation
5. Add concurrency limit to prevent memory issues

**Code Changes:**

```typescript
// lib/scoring/match-properties.ts

/**
 * Process all opportunity matches for a single property
 * Returns array of MatchResult objects
 */
async function processPropertyMatches(
  property: BrokerListing,
  opportunities: any[],
  minScore: number
): Promise<{
  matches: MatchResult[];
  stats: {
    processed: number;
    matched: number;
    skipped: number;
    earlyTerminated: number;
    earlyTerminationReasons: {
      STATE_MISMATCH: number;
      SPACE_TOO_SMALL: number;
    };
    errors: string[];
  };
}> {
  const matches: MatchResult[] = [];
  const stats = {
    processed: 0,
    matched: 0,
    skipped: 0,
    earlyTerminated: 0,
    earlyTerminationReasons: {
      STATE_MISMATCH: 0,
      SPACE_TOO_SMALL: 0,
    },
    errors: [] as string[],
  };

  const propertyData = convertToPropertyData(property);

  for (const opportunity of opportunities) {
    try {
      stats.processed++;

      // Parse opportunity requirements
      const requirements = parseOpportunityRequirements(opportunity as SAMOpportunity);

      // Skip if requirements are invalid
      if (!hasValidRequirements(requirements)) {
        stats.skipped++;
        continue;
      }

      // Early termination for state mismatch
      if (property.state !== requirements.location.state) {
        stats.skipped++;
        stats.earlyTerminated++;
        stats.earlyTerminationReasons.STATE_MISMATCH++;
        continue;
      }

      // Early termination for severe space shortage
      if (requirements.space.minSqFt && property.available_sf < requirements.space.minSqFt * 0.7) {
        stats.skipped++;
        stats.earlyTerminated++;
        stats.earlyTerminationReasons.SPACE_TOO_SMALL++;
        continue;
      }

      // Calculate match score
      const scoreResult = calculateMatchScore(
        propertyData,
        DEFAULT_BROKER_EXPERIENCE,
        requirements
      );

      // Only store matches meeting minimum threshold
      if (scoreResult.overallScore >= minScore) {
        matches.push({
          property_id: property.id,
          opportunity_id: opportunity.id,
          overall_score: scoreResult.overallScore,
          grade: scoreResult.grade,
          competitive: scoreResult.competitive,
          qualified: scoreResult.qualified,
          location_score: scoreResult.factors.location.score,
          space_score: scoreResult.factors.space.score,
          building_score: scoreResult.factors.building.score,
          timeline_score: scoreResult.factors.timeline.score,
          experience_score: scoreResult.factors.experience.score,
          score_breakdown: scoreResult,
        });
        stats.matched++;
      } else {
        stats.skipped++;
      }
    } catch (error) {
      const err = error as Error;
      stats.errors.push(
        `Error matching property ${property.id} with opportunity ${opportunity.id}: ${err.message}`
      );
    }
  }

  return { matches, stats };
}

/**
 * Main batch matching function with parallel processing
 */
export async function matchPropertiesWithOpportunities(
  supabaseUrl: string,
  supabaseServiceKey: string,
  minScore: number = 40
): Promise<MatchStats> {
  const startTime = new Date();
  const stats: MatchStats = {
    processed: 0,
    matched: 0,
    skipped: 0,
    earlyTerminated: 0,
    earlyTerminationReasons: {
      STATE_MISMATCH: 0,
      SPACE_TOO_SMALL: 0,
    },
    errors: [],
    startTime,
    endTime: new Date(),
    durationMs: 0,
  };

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // 1. Fetch all active broker listings
    const { data: properties, error: propsError } = await supabase
      .from('broker_listings')
      .select('*')
      .eq('status', 'active');

    if (propsError) {
      stats.errors.push(`Error fetching properties: ${propsError.message}`);
      return finishStats(stats);
    }

    if (!properties || properties.length === 0) {
      stats.errors.push('No active properties found');
      return finishStats(stats);
    }

    // 2. Fetch all active GSA opportunities
    const { data: opportunities, error: oppsError } = await supabase
      .from('opportunities')
      .select('*')
      .eq('active', 'Yes')
      .gte('response_deadline', new Date().toISOString());

    if (oppsError) {
      stats.errors.push(`Error fetching opportunities: ${oppsError.message}`);
      return finishStats(stats);
    }

    if (!opportunities || opportunities.length === 0) {
      stats.errors.push('No active opportunities found');
      return finishStats(stats);
    }

    console.log(`🚀 Matching ${properties.length} properties against ${opportunities.length} opportunities (PARALLEL MODE)...`);

    // 3. Process properties in parallel using Promise.all
    const results = await Promise.all(
      (properties as BrokerListing[]).map(property =>
        processPropertyMatches(property, opportunities, minScore)
      )
    );

    // 4. Aggregate results from all properties
    const allMatches: MatchResult[] = [];
    for (const result of results) {
      allMatches.push(...result.matches);

      // Aggregate stats
      stats.processed += result.stats.processed;
      stats.matched += result.stats.matched;
      stats.skipped += result.stats.skipped;
      stats.earlyTerminated += result.stats.earlyTerminated;
      stats.earlyTerminationReasons.STATE_MISMATCH += result.stats.earlyTerminationReasons.STATE_MISMATCH;
      stats.earlyTerminationReasons.SPACE_TOO_SMALL += result.stats.earlyTerminationReasons.SPACE_TOO_SMALL;
      stats.errors.push(...result.stats.errors);
    }

    console.log(`
📊 Parallel Processing Statistics:
   Properties Processed: ${properties.length}
   Total Matches Found: ${allMatches.length}
   Early Terminations: ${stats.earlyTerminated}
   Computation Saved: ${Math.round((stats.earlyTerminated / stats.processed) * 100)}%
    `);

    // 5. Upsert matches to database (batch insert)
    if (allMatches.length > 0) {
      const { error: upsertError } = await supabase
        .from('property_matches')
        .upsert(allMatches, { onConflict: 'property_id,opportunity_id' });

      if (upsertError) {
        stats.errors.push(`Error upserting matches: ${upsertError.message}`);
      } else {
        console.log(`✅ Successfully stored ${allMatches.length} matches`);
      }
    } else {
      console.log('⚠️ No matches met the minimum score threshold');
    }

    return finishStats(stats);
  } catch (error) {
    const err = error as Error;
    stats.errors.push(`Fatal error: ${err.message}`);
    return finishStats(stats);
  }
}
```

### Acceptance Criteria

- [ ] Properties processed in parallel using Promise.all
- [ ] Inner loop extracted into `processPropertyMatches` function
- [ ] Stats aggregation works correctly across parallel executions
- [ ] Error handling doesn't fail entire batch (isolated per property)
- [ ] Memory usage remains stable (no memory leaks)
- [ ] Performance improvement measured (expect 4-8x speedup)
- [ ] Unit tests cover parallel execution
- [ ] Integration test with 100+ properties

### Testing

**Unit Tests:**
```typescript
describe('Parallel Processing', () => {
  it('should process all properties in parallel', async () => {
    const properties = createMockProperties(10);
    const opportunities = createMockOpportunities(50);

    const start = Date.now();
    const stats = await matchPropertiesWithOpportunities(supabaseUrl, serviceKey, 40);
    const duration = Date.now() - start;

    expect(stats.processed).toBe(10 * 50); // All combos processed
    expect(duration).toBeLessThan(2000); // Should be fast with parallelism
  });

  it('should handle errors in one property without failing others', async () => {
    // Mock one property to throw error
    const properties = [
      { id: '1', ...validProperty },
      { id: '2', state: null, ...invalidProperty }, // Will throw
      { id: '3', ...validProperty },
    ];

    const stats = await matchPropertiesWithOpportunities(...);

    expect(stats.errors.length).toBeGreaterThan(0); // Error recorded
    expect(stats.matched).toBeGreaterThan(0); // But other properties still matched
  });
});
```

### Performance Target

- **Before:** Sequential processing, 1 property at a time
- **After:** Parallel processing, ~10 properties at a time (depending on CPU cores)
- **Expected Improvement:** 4-8x speedup (depends on CPU cores)

### Memory Considerations

- Monitor memory usage with 100+ properties
- Each property processes full opportunity list independently
- Potential memory spike during parallel execution
- If memory issues arise, implement chunking in PERF-003

---

## 🎫 PERF-003: Implement Chunked Batch Processing

**Priority:** 🔴 Critical
**Effort:** 4 hours
**Assignee:** Backend Engineer
**Dependencies:** PERF-002 (must be completed first)
**Labels:** `performance`, `optimization`, `scalability`

### Description

Add chunking to parallel processing to prevent memory overflow when processing large property portfolios (500+). Process properties in batches of 50 to balance parallelism with memory usage.

**Current Behavior (after PERF-002):**
```typescript
// All properties processed at once - can cause memory issues
await Promise.all(
  properties.map(property => processPropertyMatches(...))
);
```

**Expected Behavior:**
```typescript
// Process in chunks of 50 properties at a time
const CHUNK_SIZE = 50;
for (let i = 0; i < properties.length; i += CHUNK_SIZE) {
  const chunk = properties.slice(i, i + CHUNK_SIZE);
  await Promise.all(chunk.map(property => processPropertyMatches(...)));
}
```

### Technical Details

**File to Modify:** `lib/scoring/match-properties.ts`

**Implementation Steps:**

1. Define CHUNK_SIZE constant (start with 50, make configurable)
2. Split properties array into chunks
3. Process each chunk in parallel
4. Aggregate results progressively
5. Add progress logging

**Code Changes:**

```typescript
// lib/scoring/match-properties.ts

// Configuration
const DEFAULT_CHUNK_SIZE = 50; // Process 50 properties at a time

/**
 * Splits array into chunks of specified size
 */
function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

/**
 * Main batch matching function with chunked parallel processing
 */
export async function matchPropertiesWithOpportunities(
  supabaseUrl: string,
  supabaseServiceKey: string,
  minScore: number = 40,
  chunkSize: number = DEFAULT_CHUNK_SIZE  // NEW parameter
): Promise<MatchStats> {
  const startTime = new Date();
  const stats: MatchStats = {
    processed: 0,
    matched: 0,
    skipped: 0,
    earlyTerminated: 0,
    earlyTerminationReasons: {
      STATE_MISMATCH: 0,
      SPACE_TOO_SMALL: 0,
    },
    errors: [],
    startTime,
    endTime: new Date(),
    durationMs: 0,
  };

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // 1. Fetch all active broker listings
    const { data: properties, error: propsError } = await supabase
      .from('broker_listings')
      .select('*')
      .eq('status', 'active');

    if (propsError) {
      stats.errors.push(`Error fetching properties: ${propsError.message}`);
      return finishStats(stats);
    }

    if (!properties || properties.length === 0) {
      stats.errors.push('No active properties found');
      return finishStats(stats);
    }

    // 2. Fetch all active GSA opportunities
    const { data: opportunities, error: oppsError } = await supabase
      .from('opportunities')
      .select('*')
      .eq('active', 'Yes')
      .gte('response_deadline', new Date().toISOString());

    if (oppsError) {
      stats.errors.push(`Error fetching opportunities: ${oppsError.message}`);
      return finishStats(stats);
    }

    if (!opportunities || opportunities.length === 0) {
      stats.errors.push('No active opportunities found');
      return finishStats(stats);
    }

    console.log(`
🚀 Matching ${properties.length} properties against ${opportunities.length} opportunities
   Mode: CHUNKED PARALLEL (${chunkSize} properties per chunk)
   Total Chunks: ${Math.ceil(properties.length / chunkSize)}
    `);

    // 3. Split properties into chunks
    const propertyChunks = chunkArray(properties as BrokerListing[], chunkSize);
    const allMatches: MatchResult[] = [];

    // 4. Process each chunk in parallel
    for (let chunkIndex = 0; chunkIndex < propertyChunks.length; chunkIndex++) {
      const chunk = propertyChunks[chunkIndex];
      const chunkStartTime = Date.now();

      console.log(`
📦 Processing chunk ${chunkIndex + 1}/${propertyChunks.length} (${chunk.length} properties)...
      `);

      // Process properties in chunk in parallel
      const chunkResults = await Promise.all(
        chunk.map(property => processPropertyMatches(property, opportunities, minScore))
      );

      // Aggregate results from this chunk
      for (const result of chunkResults) {
        allMatches.push(...result.matches);

        // Aggregate stats
        stats.processed += result.stats.processed;
        stats.matched += result.stats.matched;
        stats.skipped += result.stats.skipped;
        stats.earlyTerminated += result.stats.earlyTerminated;
        stats.earlyTerminationReasons.STATE_MISMATCH += result.stats.earlyTerminationReasons.STATE_MISMATCH;
        stats.earlyTerminationReasons.SPACE_TOO_SMALL += result.stats.earlyTerminationReasons.SPACE_TOO_SMALL;
        stats.errors.push(...result.stats.errors);
      }

      const chunkDuration = Date.now() - chunkStartTime;
      const avgPerProperty = chunkDuration / chunk.length;

      console.log(`
✅ Chunk ${chunkIndex + 1} complete in ${chunkDuration}ms (${avgPerProperty.toFixed(0)}ms per property)
   Matches found in chunk: ${chunkResults.reduce((sum, r) => sum + r.matches.length, 0)}
   Total matches so far: ${allMatches.length}
      `);
    }

    console.log(`
📊 Final Statistics:
   Properties Processed: ${properties.length}
   Total Matches Found: ${allMatches.length}
   Early Terminations: ${stats.earlyTerminated}
   Computation Saved: ${Math.round((stats.earlyTerminated / stats.processed) * 100)}%
   Total Duration: ${Date.now() - startTime.getTime()}ms
    `);

    // 5. Upsert matches to database (batch insert)
    if (allMatches.length > 0) {
      console.log(`💾 Upserting ${allMatches.length} matches to database...`);

      const { error: upsertError } = await supabase
        .from('property_matches')
        .upsert(allMatches, { onConflict: 'property_id,opportunity_id' });

      if (upsertError) {
        stats.errors.push(`Error upserting matches: ${upsertError.message}`);
      } else {
        console.log(`✅ Successfully stored ${allMatches.length} matches`);
      }
    } else {
      console.log('⚠️ No matches met the minimum score threshold');
    }

    return finishStats(stats);
  } catch (error) {
    const err = error as Error;
    stats.errors.push(`Fatal error: ${err.message}`);
    return finishStats(stats);
  }
}
```

**Update API Route:**
```typescript
// app/api/match-properties/route.ts
export async function POST(request: NextRequest) {
  try {
    // ... (auth check)

    const body = await request.json().catch(() => ({}));
    const minScore = body.minScore || 40;
    const chunkSize = body.chunkSize || 50;  // NEW: Allow customization

    // Run batch matching with chunking
    const stats = await matchPropertiesWithOpportunities(
      supabaseUrl,
      serviceRoleKey,
      minScore,
      chunkSize  // Pass chunk size
    );

    return NextResponse.json({
      success: stats.errors.length === 0,
      stats: {
        processed: stats.processed,
        matched: stats.matched,
        skipped: stats.skipped,
        earlyTerminated: stats.earlyTerminated,
        durationMs: stats.durationMs,
      },
      errors: stats.errors.length > 0 ? stats.errors : undefined,
    });
  } catch (error) {
    // ... (error handling)
  }
}
```

### Acceptance Criteria

- [ ] Properties split into configurable chunks (default: 50)
- [ ] Chunks processed sequentially (each chunk parallel internally)
- [ ] Progress logging shows chunk number and timing
- [ ] Memory usage stable with 500+ properties
- [ ] Chunk size configurable via API parameter
- [ ] No degradation in match quality
- [ ] Performance metrics logged per chunk
- [ ] Integration test with 500 properties

### Testing

**Load Tests:**
```typescript
describe('Chunked Processing', () => {
  it('should process 500 properties without memory issues', async () => {
    const properties = createMockProperties(500);
    const opportunities = createMockOpportunities(100);

    const memBefore = process.memoryUsage().heapUsed;

    const stats = await matchPropertiesWithOpportunities(
      supabaseUrl,
      serviceKey,
      40,
      50 // chunk size
    );

    const memAfter = process.memoryUsage().heapUsed;
    const memIncrease = (memAfter - memBefore) / 1024 / 1024; // MB

    expect(stats.processed).toBe(500 * 100);
    expect(memIncrease).toBeLessThan(500); // Less than 500MB increase
  });

  it('should respect custom chunk size', async () => {
    const logSpy = jest.spyOn(console, 'log');

    await matchPropertiesWithOpportunities(supabaseUrl, serviceKey, 40, 25);

    // Should see "25 properties per chunk" in logs
    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining('25 properties per chunk')
    );
  });
});
```

### Performance Target

- **Goal:** Process 500 properties in < 15 seconds
- **Memory:** Peak memory < 1GB
- **Chunk Size Tuning:**
  - 10 properties: More sequential, slower but lower memory
  - 50 properties: Balanced (recommended)
  - 100 properties: Faster but higher memory

---

## 🎫 PERF-004: Add Performance Instrumentation and Logging

**Priority:** 🟠 High
**Effort:** 3 hours
**Assignee:** Backend Engineer
**Dependencies:** PERF-001, PERF-002, PERF-003
**Labels:** `observability`, `monitoring`

### Description

Add comprehensive performance instrumentation to track execution time, throughput, and bottlenecks. This data is crucial for validating optimizations and identifying future improvements.

### Technical Details

**Metrics to Track:**

1. **Overall Metrics:**
   - Total execution time
   - Properties per second
   - Opportunities processed per second
   - Match calculations per second

2. **Per-Chunk Metrics:**
   - Chunk processing time
   - Average time per property
   - Memory usage per chunk

3. **Scoring Breakdown:**
   - Time spent in each scoring function
   - Cache hit rate (for future caching)
   - Early termination rate

**Implementation:**

```typescript
// lib/scoring/performance-tracker.ts

export interface PerformanceMetrics {
  totalDurationMs: number;
  propertiesPerSecond: number;
  opportunitiesProcessedPerSecond: number;
  calculationsPerSecond: number;

  chunkMetrics: {
    chunkIndex: number;
    propertiesInChunk: number;
    durationMs: number;
    avgMsPerProperty: number;
  }[];

  scoringBreakdown: {
    locationScoringMs: number;
    spaceScoringMs: number;
    buildingScoringMs: number;
    timelineScoringMs: number;
    experienceScoringMs: number;
  };

  earlyTerminationRate: number;
  memoryUsageMB: number;
}

export class PerformanceTracker {
  private startTime: number;
  private chunkMetrics: any[] = [];
  private scoringTimes: { [key: string]: number } = {};

  constructor() {
    this.startTime = Date.now();
  }

  startChunk(chunkIndex: number, propertiesCount: number) {
    return {
      chunkIndex,
      propertiesCount,
      startTime: Date.now(),
    };
  }

  endChunk(chunkData: any) {
    const duration = Date.now() - chunkData.startTime;
    this.chunkMetrics.push({
      chunkIndex: chunkData.chunkIndex,
      propertiesInChunk: chunkData.propertiesCount,
      durationMs: duration,
      avgMsPerProperty: duration / chunkData.propertiesCount,
    });
  }

  trackScoring(scoringType: string, durationMs: number) {
    if (!this.scoringTimes[scoringType]) {
      this.scoringTimes[scoringType] = 0;
    }
    this.scoringTimes[scoringType] += durationMs;
  }

  getMetrics(stats: MatchStats): PerformanceMetrics {
    const totalDuration = Date.now() - this.startTime;
    const propertiesCount = this.chunkMetrics.reduce((sum, c) => sum + c.propertiesInChunk, 0);

    return {
      totalDurationMs: totalDuration,
      propertiesPerSecond: (propertiesCount / totalDuration) * 1000,
      opportunitiesProcessedPerSecond: (stats.processed / totalDuration) * 1000,
      calculationsPerSecond: ((stats.processed - stats.earlyTerminated) / totalDuration) * 1000,

      chunkMetrics: this.chunkMetrics,

      scoringBreakdown: {
        locationScoringMs: this.scoringTimes['location'] || 0,
        spaceScoringMs: this.scoringTimes['space'] || 0,
        buildingScoringMs: this.scoringTimes['building'] || 0,
        timelineScoringMs: this.scoringTimes['timeline'] || 0,
        experienceScoringMs: this.scoringTimes['experience'] || 0,
      },

      earlyTerminationRate: stats.earlyTerminated / stats.processed,
      memoryUsageMB: process.memoryUsage().heapUsed / 1024 / 1024,
    };
  }

  logMetrics(metrics: PerformanceMetrics) {
    console.log(`
🎯 Performance Metrics
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Overall:
  Total Duration: ${metrics.totalDurationMs}ms
  Properties/sec: ${metrics.propertiesPerSecond.toFixed(2)}
  Calculations/sec: ${metrics.calculationsPerSecond.toFixed(2)}
  Memory Usage: ${metrics.memoryUsageMB.toFixed(2)} MB

Efficiency:
  Early Termination Rate: ${(metrics.earlyTerminationRate * 100).toFixed(1)}%

Scoring Breakdown:
  Location: ${metrics.scoringBreakdown.locationScoringMs}ms
  Space: ${metrics.scoringBreakdown.spaceScoringMs}ms
  Building: ${metrics.scoringBreakdown.buildingScoringMs}ms
  Timeline: ${metrics.scoringBreakdown.timelineScoringMs}ms
  Experience: ${metrics.scoringBreakdown.experienceScoringMs}ms
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `);
  }
}
```

**Update match-properties.ts:**
```typescript
import { PerformanceTracker } from './performance-tracker';

export async function matchPropertiesWithOpportunities(
  supabaseUrl: string,
  supabaseServiceKey: string,
  minScore: number = 40,
  chunkSize: number = DEFAULT_CHUNK_SIZE
): Promise<MatchStats & { performanceMetrics?: PerformanceMetrics }> {
  const perfTracker = new PerformanceTracker();

  // ... (existing code)

  // In chunk processing loop:
  for (let chunkIndex = 0; chunkIndex < propertyChunks.length; chunkIndex++) {
    const chunk = propertyChunks[chunkIndex];
    const chunkData = perfTracker.startChunk(chunkIndex, chunk.length);

    const chunkResults = await Promise.all(
      chunk.map(property => processPropertyMatches(property, opportunities, minScore))
    );

    perfTracker.endChunk(chunkData);
  }

  // Get final metrics
  const performanceMetrics = perfTracker.getMetrics(stats);
  perfTracker.logMetrics(performanceMetrics);

  return {
    ...finishStats(stats),
    performanceMetrics,
  };
}
```

### Acceptance Criteria

- [ ] PerformanceTracker class implemented
- [ ] Metrics collected during matching
- [ ] Structured performance logs output
- [ ] Metrics included in API response
- [ ] Memory usage tracked
- [ ] Per-chunk timing available
- [ ] Baseline metrics documented

### Performance Baseline (to be measured)

Document baseline after implementation:
- [ ] 100 properties: ___ ms
- [ ] 500 properties: ___ ms
- [ ] Properties/sec: ___
- [ ] Early termination rate: ___%

---

## 🎫 PERF-005: Create Performance Benchmark Suite

**Priority:** 🟠 High
**Effort:** 4 hours
**Assignee:** QA Engineer
**Dependencies:** PERF-001, PERF-002, PERF-003, PERF-004
**Labels:** `testing`, `performance`, `benchmarks`

### Description

Create automated performance benchmarks to validate improvements and prevent regressions.

### Technical Details

**Benchmark Scenarios:**

1. **Small Portfolio:** 10 properties × 50 opportunities
2. **Medium Portfolio:** 100 properties × 500 opportunities
3. **Large Portfolio:** 500 properties × 1000 opportunities
4. **Worst Case:** 100 properties × 1000 opportunities (all different states)
5. **Best Case:** 100 properties × 1000 opportunities (all same state)

**Implementation:**

```typescript
// lib/scoring/__tests__/performance.bench.ts
import { describe, it, expect } from 'vitest';
import { matchPropertiesWithOpportunities } from '../match-properties';
import { createMockProperties, createMockOpportunities } from './fixtures';

describe('Performance Benchmarks', () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  it('Small Portfolio (10 properties × 50 opportunities)', async () => {
    const properties = createMockProperties(10);
    const opportunities = createMockOpportunities(50);

    const start = Date.now();
    const stats = await matchPropertiesWithOpportunities(supabaseUrl, serviceKey, 40);
    const duration = Date.now() - start;

    expect(duration).toBeLessThan(1000); // < 1 second
    expect(stats.performanceMetrics?.propertiesPerSecond).toBeGreaterThan(5);

    console.log(`✅ Small Portfolio: ${duration}ms`);
  });

  it('Medium Portfolio (100 properties × 500 opportunities)', async () => {
    const properties = createMockProperties(100);
    const opportunities = createMockOpportunities(500);

    const start = Date.now();
    const stats = await matchPropertiesWithOpportunities(supabaseUrl, serviceKey, 40);
    const duration = Date.now() - start;

    expect(duration).toBeLessThan(4000); // < 4 seconds (TARGET)
    expect(stats.performanceMetrics?.propertiesPerSecond).toBeGreaterThan(20);

    console.log(`✅ Medium Portfolio: ${duration}ms`);
  });

  it('Large Portfolio (500 properties × 1000 opportunities)', async () => {
    const properties = createMockProperties(500);
    const opportunities = createMockOpportunities(1000);

    const start = Date.now();
    const stats = await matchPropertiesWithOpportunities(supabaseUrl, serviceKey, 40);
    const duration = Date.now() - start;

    expect(duration).toBeLessThan(15000); // < 15 seconds
    expect(stats.performanceMetrics?.propertiesPerSecond).toBeGreaterThan(30);

    console.log(`✅ Large Portfolio: ${duration}ms`);
  });

  it('Worst Case (all different states - max early terminations)', async () => {
    const properties = createMockProperties(100, { randomStates: true });
    const opportunities = createMockOpportunities(1000, { state: 'DC' });

    const start = Date.now();
    const stats = await matchPropertiesWithOpportunities(supabaseUrl, serviceKey, 40);
    const duration = Date.now() - start;

    // Should be VERY fast due to early terminations
    expect(duration).toBeLessThan(2000); // < 2 seconds
    expect(stats.earlyTerminationRate).toBeGreaterThan(0.8); // >80% early terminated

    console.log(`✅ Worst Case: ${duration}ms (${(stats.earlyTerminationRate * 100).toFixed(1)}% early terminated)`);
  });

  it('Best Case (all same state - min early terminations)', async () => {
    const properties = createMockProperties(100, { state: 'DC' });
    const opportunities = createMockOpportunities(1000, { state: 'DC' });

    const start = Date.now();
    const stats = await matchPropertiesWithOpportunities(supabaseUrl, serviceKey, 40);
    const duration = Date.now() - start;

    // Will be slower as all are scored
    expect(duration).toBeLessThan(6000); // < 6 seconds
    expect(stats.matched).toBeGreaterThan(0);

    console.log(`✅ Best Case: ${duration}ms`);
  });
});

// Run benchmarks and generate report
function generateBenchmarkReport() {
  // Export results to JSON for tracking over time
  // Compare against baseline to detect regressions
}
```

**Run Benchmarks:**
```bash
# Run performance benchmarks
npm run test:perf

# Generate benchmark report
npm run test:perf:report
```

### Acceptance Criteria

- [ ] 5 benchmark scenarios implemented
- [ ] All benchmarks pass with target performance
- [ ] Benchmark results logged and saved
- [ ] Regression detection in place
- [ ] CI/CD integration (optional)

---

## 🎫 PERF-006: Load Testing and Performance Validation

**Priority:** 🟠 High
**Effort:** 4 hours
**Assignee:** QA Engineer
**Dependencies:** PERF-005
**Labels:** `testing`, `load-testing`, `validation`

### Description

Perform load testing on staging environment to validate performance under production conditions.

### Technical Details

**Test Scenarios:**

1. **API Load Test:** 10 concurrent requests to `/api/match-properties`
2. **Database Stress:** Insert 10,000 matches and query performance
3. **Memory Profiling:** Monitor memory leaks during extended runs
4. **Cache Performance:** Validate 24-hour cache TTL

**Tools:**
- k6 for load testing
- Node.js built-in profiler
- Vercel Analytics

**k6 Script:**
```javascript
// load-tests/match-properties.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '1m', target: 5 },   // Ramp up to 5 users
    { duration: '3m', target: 10 },  // Stay at 10 users
    { duration: '1m', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<5000'], // 95% requests < 5s
    http_req_failed: ['rate<0.01'],     // <1% failures
  },
};

export default function () {
  const url = 'https://staging.rlpscout.ai/api/match-properties';
  const payload = JSON.stringify({
    minScore: 40,
    chunkSize: 50,
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${__ENV.API_TOKEN}`,
    },
  };

  const res = http.post(url, payload, params);

  check(res, {
    'status is 200': (r) => r.status === 200,
    'duration < 5s': (r) => r.timings.duration < 5000,
    'no errors': (r) => r.json('errors') === undefined,
  });

  sleep(1);
}
```

### Acceptance Criteria

- [ ] Load test script created
- [ ] Staging environment tested with 10 concurrent users
- [ ] P95 latency < 5 seconds
- [ ] Zero memory leaks detected
- [ ] Database query performance validated
- [ ] Results documented

---

## 🎫 PERF-007: Deploy to Production with Monitoring

**Priority:** 🔴 Critical
**Effort:** 2 hours
**Assignee:** DevOps Engineer
**Dependencies:** PERF-001 through PERF-006 (all must pass)
**Labels:** `deployment`, `production`, `monitoring`

### Description

Deploy optimized matching system to production with monitoring and rollback plan.

### Deployment Checklist

**Pre-Deployment:**
- [ ] All unit tests pass
- [ ] All benchmarks pass
- [ ] Load tests pass on staging
- [ ] Code review approved
- [ ] Performance metrics baseline documented

**Deployment Steps:**

1. **Create Release Branch:**
   ```bash
   git checkout -b release/sprint-1-perf-optimization
   git push origin release/sprint-1-perf-optimization
   ```

2. **Merge to Main:**
   ```bash
   git checkout main
   git merge release/sprint-1-perf-optimization
   git push origin main
   ```

3. **Deploy to Vercel:**
   ```bash
   vercel --prod
   ```

4. **Monitor First Hour:**
   - Watch Vercel logs for errors
   - Check Sentry for exceptions
   - Monitor API latency in analytics
   - Watch database connection pool

**Post-Deployment:**
- [ ] Run smoke tests on production
- [ ] Verify `/api/match-properties` performance
- [ ] Check database for proper match storage
- [ ] Monitor for 24 hours
- [ ] Document performance improvements

**Rollback Plan:**

If issues detected:
```bash
# Revert to previous deployment
vercel rollback
```

### Monitoring Metrics

**Track for 48 hours:**
- API response time (P50, P95, P99)
- Error rate
- Match quality (user feedback)
- Database load
- Memory usage

**Success Criteria:**
- [ ] P95 latency < 4 seconds (from ~10-15s)
- [ ] Zero production errors related to matching
- [ ] User reports of faster experience
- [ ] Database performance stable

---

## Sprint Success Metrics

### Performance Targets

| Metric | Before | After | Target Met? |
|--------|--------|-------|-------------|
| 100 properties × 500 opps | 10-15s | < 4s | ⬜ |
| Early termination rate | 0% | > 60% | ⬜ |
| API P95 latency | Unknown | < 5s | ⬜ |
| Memory usage (500 props) | Unknown | < 1GB | ⬜ |
| Error rate | Unknown | < 0.1% | ⬜ |

### Code Quality Targets

- [ ] All tests passing
- [ ] Code review approved
- [ ] Documentation updated
- [ ] Performance metrics logged

---

## Daily Standup Template

```
Day: ___________
Completed: ______________________
In Progress: _____________________
Blocked: _________________________
Tomorrow: ________________________
```

---

## Notes & Learnings

*(Add notes during implementation)*

---

**Sprint Start Date:** ___________
**Sprint End Date:** ___________
**Sprint Retrospective:** ___________
