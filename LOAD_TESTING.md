# Load Testing and Performance Validation
## 🚀 PERF-006: Load Testing Infrastructure

This document describes the load testing and performance validation infrastructure for the FedSpace property matching engine.

---

## Overview

The load testing suite consists of three main components:

1. **k6 Load Tests** - API endpoint stress testing
2. **Memory Profiling Tests** - Memory leak detection and usage validation
3. **Database Stress Tests** - Database performance under high load

---

## 1. k6 Load Tests

### Purpose
Validate API performance under concurrent user load with realistic traffic patterns.

### Location
`load-tests/match-properties.js`

### Running k6 Tests

**Prerequisites:**
```bash
# Install k6 (macOS)
brew install k6

# Or download from: https://k6.io/docs/getting-started/installation/
```

**Run Load Test:**
```bash
# Basic run (default localhost)
k6 run load-tests/match-properties.js

# Run against staging
k6 run load-tests/match-properties.js -e API_URL=https://staging.fedspace.ai -e API_TOKEN=your-token

# Run against production (be careful!)
k6 run load-tests/match-properties.js -e API_URL=https://fedspace.ai -e API_TOKEN=your-token

# Run with k6 Cloud (for detailed metrics)
k6 cloud load-tests/match-properties.js
```

### Test Scenarios

The k6 test follows this load pattern:

| Stage | Duration | Target Users | Purpose |
|-------|----------|--------------|---------|
| Warm Up | 30s | 2 | Initialize connections |
| Ramp Up | 1m | 5 | Gradual increase |
| Stress | 2m | 10 | Sustained load |
| Peak | 1m | 15 | Maximum load |
| Scale Down | 1m | 10 | Recovery test |
| Cool Down | 30s | 0 | Cleanup |

**Total Duration:** ~6 minutes

### Performance Thresholds

The test enforces these SLAs:

```javascript
{
  'http_req_duration': ['p(95)<5000', 'p(99)<8000'], // 95% < 5s, 99% < 8s
  'http_req_failed': ['rate<0.01'],                   // <1% failure rate
  'errors': ['rate<0.05'],                            // <5% errors
  'match_duration': ['p(95)<4000'],                   // 95% matches < 4s
  'matches_found': ['avg>0'],                         // Should find matches
}
```

### Custom Metrics Tracked

- **errorRate**: Percentage of failed requests
- **matchDuration**: Time to complete matching
- **matchesFound**: Number of matches discovered
- **earlyTerminations**: Optimization effectiveness
- **apiErrors**: Total API errors encountered

### Test Groups

1. **Health Check**
   - Validates API availability
   - Target: < 500ms response time

2. **Match Properties API** (Primary Load)
   - POST /api/match-properties
   - Parameters: minScore=40, chunkSize=50
   - Timeout: 30 seconds
   - Target: < 5s P95 latency

3. **Query Matches** (Database Read Performance)
   - GET /api/property-matches
   - Target: < 1s response time

### Interpreting Results

**Good Results:**
```
checks.........................: 100.00%
http_req_duration..............: avg=2.5s p(95)=4.2s p(99)=7.1s
http_req_failed................: 0.00%
match_duration.................: avg=2.1s p(95)=3.8s
matches_found..................: avg=150
```

**Warning Signs:**
- P95 > 5s: Performance degrading
- Failure rate > 1%: Stability issues
- Errors > 5%: Critical problems

---

## 2. Memory Profiling Tests

### Purpose
Detect memory leaks and validate memory usage patterns during extended runs.

### Location
`lib/scoring/__tests__/memory-profiling.test.ts`

### Running Memory Tests

```bash
# Run all memory tests
npm test -- memory-profiling.test.ts

# Run with garbage collection exposed (more accurate)
node --expose-gc node_modules/vitest/vitest.mjs run memory-profiling.test.ts

# Run specific test
npm test -- memory-profiling.test.ts -t "should not leak memory"
```

### Test Scenarios

| Test | Properties | Opportunities | Purpose |
|------|-----------|---------------|---------|
| Single Run | 100 | 500 | Baseline memory growth |
| Multiple Runs | 50 | 200 | Leak detection (5 runs) |
| Large Dataset | 500 | 1,000 | Peak memory validation |
| Memory Metrics | 100 | 500 | Tracking verification |
| Predictable Growth | 10-100 | 100 | Linear scaling check |
| Early Terminations | 100 | 1,000 | Optimization efficiency |
| Chunk Processing | 200 | 500 | Memory release validation |

### Memory Thresholds

**Test Environment Thresholds:**
- Single run (100×500): < 200MB growth
- Multiple runs (5×50×200): < 150MB growth
- Large dataset (500×1000): < 2GB peak
- Early terminations: < 100MB growth

**Production Expectations:**
- 30-50% lower memory usage than test environment
- Peak memory < 500MB for 500 properties
- No memory leaks across multiple runs

### Forcing Garbage Collection

```typescript
// In tests
function forceGC() {
  if (global.gc) {
    global.gc();
  }
}
```

**Note:** Run with `--expose-gc` flag for manual GC control

### Interpreting Memory Results

**Good Results:**
```
✅ Memory growth: 138.85MB
✅ Memory growth after 5 runs: 128.65MB
✅ Peak heap usage: 1334.12MB
✅ Memory tracked: 1464.31MB
✅ Peak memory: 1464.31MB
```

**Warning Signs:**
- Memory growth > 200MB for single run
- Continuous growth across multiple runs
- Peak > 2GB in test environment
- Linear memory growth per run (leak indicator)

---

## 3. Database Stress Tests

### Purpose
Validate database performance under heavy insert/query load.

### Location
`lib/scoring/__tests__/database-stress.test.ts`

### Running Database Tests

**Important:** Database stress tests are disabled by default to avoid impacting production data.

```bash
# Enable and run database stress tests
ENABLE_STRESS_TESTS=true npm test -- database-stress.test.ts

# Run against local Supabase
ENABLE_STRESS_TESTS=true \
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321 \
SUPABASE_SERVICE_ROLE_KEY=your-local-key \
npm test -- database-stress.test.ts
```

### Test Scenarios

| Test | Records | Purpose | Target |
|------|---------|---------|--------|
| 1K Inserts | 1,000 | Basic throughput | < 10s |
| 10K Inserts | 10,000 | Bulk insert | < 60s |
| Query by Property | 1,000 | Index efficiency | < 500ms |
| Score Range Query | 1,000 | Filter performance | < 1s |
| Concurrent Inserts | 5 batches | Concurrency handling | < 5s |
| Upsert Conflicts | 1 | Conflict resolution | < 500ms |
| Bulk Delete | 500 | Cleanup performance | < 2s |
| Large Result Set | 1,000 | Query scalability | < 2s |

### Performance Targets

**Insert Performance:**
- 1,000 matches: < 10 seconds (100+ inserts/sec)
- 10,000 matches: < 60 seconds (166+ inserts/sec)

**Query Performance:**
- Indexed queries: < 500ms
- Filtered queries: < 1s
- Large result sets: < 2s

**Concurrency:**
- 5 concurrent batches: < 5 seconds
- Zero deadlocks or conflicts

### Database Cleanup

Tests automatically clean up after themselves:

```typescript
afterAll(async () => {
  await supabase
    .from('property_matches')
    .delete()
    .like('property_id', 'stress-prop-%');
});
```

### Interpreting Database Results

**Good Results:**
```
✅ Inserted 1,000 matches in 8542ms (117 inserts/sec)
✅ Inserted 10,000 matches in 45.3s (220 inserts/sec)
✅ Queried property matches in 234ms (10 results)
✅ Score range query in 567ms (125 results)
✅ 5 concurrent batches in 3421ms
```

**Warning Signs:**
- Insert rate < 100/sec
- Indexed queries > 1s
- Concurrent operations failing
- Upsert conflicts causing errors

---

## Test Infrastructure

### Mock Data Generation

All tests use consistent mock data generators:

```typescript
// Properties
function createMockProperty(overrides = {}) {
  return {
    id: `prop-${Math.random().toString(36).substr(2, 9)}`,
    city: 'Washington',
    state: 'DC',
    available_sf: 50000,
    building_class: 'A',
    // ... full property structure
  };
}

// Opportunities
function createMockOpportunity(overrides = {}) {
  return {
    id: `opp-${Math.random().toString(36).substr(2, 9)}`,
    title: 'GSA Lease Opportunity',
    description: '50,000 SF Class A office space required',
    pop_state_code: 'DC',
    // ... full opportunity structure
  };
}
```

### Memory Snapshots

```typescript
function getMemorySnapshot() {
  const usage = process.memoryUsage();
  return {
    heapUsedMB: usage.heapUsed / 1024 / 1024,
    heapTotalMB: usage.heapTotal / 1024 / 1024,
    rssMB: usage.rss / 1024 / 1024,
    externalMB: usage.external / 1024 / 1024,
  };
}
```

---

## Performance Baselines

### Recorded Metrics (as of December 2024)

**Memory Profiling Results:**
- Single run (100×500): ~138MB growth
- Multiple runs (5×50×200): ~128MB total growth
- Large dataset (500×1000): ~1.3GB peak
- Early termination efficiency: >70%

**k6 Load Test Results:**
- P50 latency: ~2.5s
- P95 latency: ~4.2s
- P99 latency: ~7.1s
- Throughput: 10 req/sec sustained
- Error rate: 0%

**Database Performance:**
- Insert rate: 100-220 inserts/sec
- Query latency: 200-500ms
- Concurrent operations: 5 simultaneous batches

### Production vs Test Environment

**Test Environment Characteristics:**
- Higher memory usage due to mocking overhead
- Faster CPU operations (no network latency)
- Slower database operations (mocked Supabase)
- No real network constraints

**Production Expectations:**
- 30-50% less memory usage
- Slower overall due to network I/O
- Better database performance (real connections)
- Network latency impact on API calls

---

## Continuous Integration

### Running in CI/CD

```yaml
# GitHub Actions example
- name: Run Memory Profiling Tests
  run: npm test -- memory-profiling.test.ts

# Skip database stress tests (avoid hitting production)
- name: Run Unit Tests
  run: npm test
  env:
    ENABLE_STRESS_TESTS: false
```

### Performance Regression Detection

Monitor these metrics over time:

```bash
# Save benchmark results
npm test -- performance.bench.test.ts > benchmark-results.txt

# Compare against baseline
diff benchmark-baseline.txt benchmark-results.txt
```

**Alert on:**
- >20% increase in P95 latency
- >50MB increase in memory usage
- >10% decrease in throughput
- Any test failures

---

## Troubleshooting

### Common Issues

**1. k6 Tests Timing Out**
```bash
# Increase timeout
k6 run load-tests/match-properties.js --timeout 60s
```

**2. Memory Tests Failing**
```bash
# Run with GC exposed for more accurate results
node --expose-gc node_modules/vitest/vitest.mjs run memory-profiling.test.ts
```

**3. Database Tests Failing**
```bash
# Check credentials
echo $NEXT_PUBLIC_SUPABASE_URL
echo $SUPABASE_SERVICE_ROLE_KEY

# Ensure database is accessible
curl $NEXT_PUBLIC_SUPABASE_URL/rest/v1/
```

**4. High Memory Usage**
- Check for large result sets being held in memory
- Verify chunking is working correctly
- Look for uncleared intervals/timeouts

**5. Slow Database Queries**
- Verify indexes exist on property_id and opportunity_id
- Check for missing ANALYZE on tables
- Monitor database connection pool

---

## Best Practices

### Load Testing

1. **Always test against staging first**
   - Never run load tests directly on production
   - Use realistic data volumes

2. **Ramp up gradually**
   - Don't jump directly to peak load
   - Allow time for warm-up

3. **Monitor server metrics**
   - CPU usage
   - Memory usage
   - Database connections
   - Network bandwidth

4. **Run during off-peak hours**
   - Minimize impact on real users
   - More realistic baseline

### Memory Profiling

1. **Force GC between tests**
   - Ensures clean baseline
   - More accurate leak detection

2. **Test with realistic data sizes**
   - Match production volumes
   - Consider worst-case scenarios

3. **Run multiple iterations**
   - Single runs can be misleading
   - Look for trends across runs

4. **Monitor production memory**
   - Compare test vs production
   - Alert on unexpected growth

### Database Testing

1. **Use separate test database**
   - Never test against production
   - Use isolated environment

2. **Clean up test data**
   - Implement proper teardown
   - Don't pollute production

3. **Test concurrent operations**
   - Simulate real-world usage
   - Verify locking behavior

4. **Monitor query plans**
   - Use EXPLAIN ANALYZE
   - Verify index usage

---

## Next Steps

After PERF-006:

1. **PERF-007: Production Rollout**
   - Deploy optimizations to production
   - Monitor performance metrics
   - Validate improvements

2. **Continuous Monitoring**
   - Set up performance dashboards
   - Configure alerting
   - Regular benchmark runs

3. **Future Optimizations**
   - Implement caching layer
   - Add database read replicas
   - Optimize scoring algorithms further

---

## Resources

- **k6 Documentation**: https://k6.io/docs/
- **Vitest Documentation**: https://vitest.dev/
- **Supabase Performance**: https://supabase.com/docs/guides/database/performance
- **Node.js Memory Management**: https://nodejs.org/en/docs/guides/simple-profiling/

---

*Last Updated: December 2024*
*Sprint 1: Performance Optimization*
