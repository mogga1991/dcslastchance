# Test Writing Guidelines

**Project**: FedSpace - GSA Lease Matching Platform
**Testing Framework**: Vitest
**Current Coverage**: ~70%
**Target**: Maintain 60%+ coverage for all new features

---

## Table of Contents

1. [Philosophy](#philosophy)
2. [Test Structure](#test-structure)
3. [Naming Conventions](#naming-conventions)
4. [Test Utilities](#test-utilities)
5. [Common Patterns](#common-patterns)
6. [What to Test](#what-to-test)
7. [Examples](#examples)
8. [Running Tests](#running-tests)
9. [Troubleshooting](#troubleshooting)

---

## Philosophy

### The 3 Rules of Testing

1. **Test Behavior, Not Implementation**
   - ✅ Good: "should return 100 points for exact match within range"
   - ❌ Bad: "should call calculateScore with property and requirement"

2. **Make Tests Readable**
   - Tests are documentation
   - Future you (and others) should understand what's being tested at a glance
   - Use clear test names and meaningful assertions

3. **Keep Tests Independent**
   - Each test should run in isolation
   - No shared state between tests
   - Tests should pass in any order

---

## Test Structure

### File Organization

```
lib/
├── scoring/
│   ├── location-score.ts          # Implementation
│   └── __tests__/
│       └── location-score.test.ts  # Tests
├── __tests__/
│   ├── fixtures/                   # Test data
│   │   ├── sam-gov-fixtures.ts
│   │   └── property-fixtures.ts
│   └── utils/                      # Test helpers
│       └── test-helpers.ts
```

### Test File Template

```typescript
/**
 * [Module Name] Tests
 * Sprint [X]: [Brief description of what's being tested]
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { functionUnderTest } from '../module-name';
import type { TypesNeeded } from '../types';

describe('functionUnderTest', () => {
  // Group related tests
  describe('Feature A', () => {
    it('should handle case 1', () => {
      // Arrange - Set up test data
      const input = { /* ... */ };

      // Act - Execute the function
      const result = functionUnderTest(input);

      // Assert - Verify results
      expect(result).toBe(expected);
    });
  });

  describe('Edge Cases', () => {
    it('should handle null input gracefully', () => {
      // Test edge cases
    });
  });
});
```

---

## Naming Conventions

### Test Files
- **Pattern**: `[module-name].test.ts` or `[module-name].integration.test.ts`
- **Location**: `__tests__/` directory adjacent to source files

**Examples**:
```
location-score.test.ts          # Unit tests
sam-gov.integration.test.ts     # Integration tests
match-properties.test.ts        # Unit tests
```

### Test Descriptions

**describe() blocks**: Group related functionality
```typescript
describe('scoreLocation', () => {           // Function name
  describe('State Matching', () => {        // Feature group
    describe('Edge Cases', () => {          // Sub-group
```

**it() blocks**: Start with "should" + present tense verb
```typescript
✅ it('should return 100 points for perfect match', () => {})
✅ it('should penalize missing required features', () => {})
✅ it('should handle null values gracefully', () => {})

❌ it('returns 100 points', () => {})       // Missing "should"
❌ it('test perfect match', () => {})        // Not descriptive
```

---

## Test Utilities

### Available Helpers (lib/__tests__/utils/test-helpers.ts)

#### 1. DatabaseTestHelper
Mock Supabase and Neon clients:

```typescript
import { DatabaseTestHelper } from './utils/test-helpers';

const mockSupabase = DatabaseTestHelper.createMockSupabaseClient({
  from: vi.fn().mockReturnValue({
    select: vi.fn().mockResolvedValue({ data: mockData, error: null }),
  }),
});
```

#### 2. APITestHelper
Mock API responses:

```typescript
import { APITestHelper } from './utils/test-helpers';

// Mock SAM.gov API
APITestHelper.mockSAMGovAPI([createMockGSALease()]);

// Mock generic fetch
APITestHelper.mockFetch({ success: true }, 200);

// Create mock response
const response = APITestHelper.createMockResponse(data, 200);
```

#### 3. AssertionHelper
Custom assertions:

```typescript
import { AssertionHelper } from './utils/test-helpers';

// Check if value is within range
AssertionHelper.assertInRange(score, 0, 100);

// Check object shape
AssertionHelper.assertHasShape(result, {
  score: 'number',
  breakdown: 'object',
});

// Check valid date
AssertionHelper.assertValidDate('2024-12-23T00:00:00Z');
```

#### 4. PerformanceTestHelper
Measure execution time:

```typescript
import { PerformanceTestHelper } from './utils/test-helpers';

const { result, duration } = await PerformanceTestHelper.measureTime(
  () => expensiveFunction()
);

expect(duration).toBeLessThan(1000); // Should complete in < 1s
```

---

## Common Patterns

### Pattern 1: Test Happy Path First

```typescript
describe('scoreSpace', () => {
  it('should award 100 points for exact match within range', () => {
    const property = {
      availableSqFt: 60000,
      isContiguous: true,
    };
    const requirement = {
      minSqFt: 50000,
      maxSqFt: 70000,
    };

    const result = scoreSpace(property, requirement);

    expect(result.score).toBe(100);
    expect(result.breakdown.meetsMinimum).toBe(true);
    expect(result.breakdown.meetsMaximum).toBe(true);
  });
});
```

### Pattern 2: Test Edge Cases

```typescript
describe('Edge Cases', () => {
  it('should handle null input gracefully', () => {
    const result = scoreSpace(null, requirement);
    expect(result.score).toBe(0);
  });

  it('should handle zero minimum requirement', () => {
    const requirement = { minSqFt: 0, maxSqFt: 100000 };
    const result = scoreSpace(property, requirement);
    expect(result.breakdown.meetsMinimum).toBe(true);
  });

  it('should handle Infinity as maximum', () => {
    const requirement = { minSqFt: 0, maxSqFt: null }; // Treated as Infinity
    const result = scoreSpace(largeProperty, requirement);
    expect(result.breakdown.meetsMaximum).toBe(true);
  });
});
```

### Pattern 3: Test Boundaries

```typescript
describe('Minimum Requirements', () => {
  it('should score 80 if within 5% of minimum', () => {
    const property = { availableSqFt: 47500 }; // 5% short of 50000
    const requirement = { minSqFt: 50000, maxSqFt: 70000 };

    const result = scoreSpace(property, requirement);

    expect(result.score).toBe(80); // Exactly at 5% threshold
  });

  it('should score 60 if within 10% of minimum', () => {
    const property = { availableSqFt: 45500 }; // 9% short
    const requirement = { minSqFt: 50000, maxSqFt: 70000 };

    expect(result.score).toBe(60);
  });
});
```

### Pattern 4: Use Fixtures for Complex Data

```typescript
import { createMockGSALease, createMockDCProperty } from './fixtures';

it('should match perfect property to opportunity', () => {
  const opportunity = createMockGSALease({
    placeOfPerformance: {
      state: { code: 'DC' },
      city: { name: 'Washington' },
    },
  });

  const property = createMockDCProperty({
    rentable_square_feet: 60000,
  });

  const result = matchProperty(property, opportunity);
  expect(result.score).toBeGreaterThan(80);
});
```

### Pattern 5: Test Error Handling

```typescript
describe('Error Handling', () => {
  it('should handle API errors gracefully', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    await expect(
      fetchGSALeaseOpportunities({ limit: 10 })
    ).rejects.toThrow('Network error');
  });

  it('should handle 401 unauthorized', async () => {
    APITestHelper.mockFetch({ error: 'Unauthorized' }, 401);

    await expect(
      fetchGSALeaseOpportunities({ limit: 10 })
    ).rejects.toThrow();
  });
});
```

---

## What to Test

### ✅ DO Test

1. **Happy Paths**
   - Expected inputs → expected outputs
   - Most common use cases

2. **Edge Cases**
   - Null/undefined inputs
   - Empty arrays/objects
   - Boundary values (0, Infinity, -1)

3. **Error Conditions**
   - Invalid inputs
   - Network failures
   - Database errors

4. **Business Logic**
   - Scoring algorithms
   - Validation rules
   - State transitions

5. **Integration Points**
   - API calls
   - Database queries
   - External services

### ❌ DON'T Test

1. **Implementation Details**
   - Internal helper functions (unless exported)
   - Private methods
   - How something is done (test what it does)

2. **Framework Code**
   - React rendering (unless custom behavior)
   - Next.js routing
   - Third-party libraries

3. **Trivial Code**
   - Simple getters/setters
   - Pass-through functions
   - Constants

---

## Examples

### Example 1: Scoring Algorithm Test

```typescript
/**
 * Location Scoring Tests
 * Sprint 2: Comprehensive coverage for location matching algorithm
 */

import { describe, it, expect } from 'vitest';
import { scoreLocation } from '../location-score';

describe('scoreLocation', () => {
  const dcProperty = {
    city: 'Washington',
    state: 'DC',
    lat: 38.9072,
    lng: -77.0369,
  };

  describe('State Matching', () => {
    it('should return 0 score for wrong state', () => {
      const requirement = {
        state: 'VA',
        city: null,
        centralPoint: null,
        radiusMiles: null,
      };

      const result = scoreLocation(dcProperty, requirement);

      expect(result.score).toBe(0);
      expect(result.breakdown.stateMatch).toBe(false);
      expect(result.breakdown.notes).toContain('Property not in required state');
    });

    it('should award 40 points for correct state', () => {
      const requirement = {
        state: 'DC',
        city: null,
        centralPoint: null,
        radiusMiles: null,
      };

      const result = scoreLocation(dcProperty, requirement);

      expect(result.score).toBeGreaterThanOrEqual(40);
      expect(result.breakdown.stateMatch).toBe(true);
    });
  });
});
```

### Example 2: Integration Test

```typescript
/**
 * SAM.gov API Integration Tests
 * Sprint 2: Test SAM.gov API connectivity and data parsing
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { fetchGSALeaseOpportunities } from '@/lib/sam-gov';
import { APITestHelper } from './utils/test-helpers';
import { createMockGSALeases } from './fixtures/sam-gov-fixtures';

describe('SAM.gov API Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    APITestHelper.resetMocks();
  });

  it('should fetch GSA lease opportunities successfully', async () => {
    const mockOpportunities = createMockGSALeases(5);
    APITestHelper.mockSAMGovAPI(mockOpportunities);

    const result = await fetchGSALeaseOpportunities({ limit: 10 });

    expect(result).toBeDefined();
    expect(result.opportunitiesData).toHaveLength(5);
    expect(result.totalRecords).toBe(5);
  });

  it('should handle API errors gracefully', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    await expect(
      fetchGSALeaseOpportunities({ limit: 10 })
    ).rejects.toThrow();
  });
});
```

### Example 3: Using Fixtures

```typescript
import { createMockGSALease } from './fixtures/sam-gov-fixtures';

it('should extract RSF requirement from description', () => {
  const opportunity = createMockGSALease({
    description: 'GSA seeks 50,000 - 75,000 RSF office space in DC.',
  });

  const result = parseOpportunityRequirements(opportunity);

  expect(result.minRSF).toBe(50000);
  expect(result.maxRSF).toBe(75000);
});
```

---

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Specific Test File
```bash
npm test -- location-score.test.ts
```

### Run Tests in Watch Mode
```bash
npm test -- --watch
```

### Run with Coverage
```bash
npm run test:coverage
```

### Run Specific Test Suite
```bash
# Only run "State Matching" describe block
npm test -- location-score.test.ts -t "State Matching"
```

---

## Coverage Guidelines

### Target Coverage by Module

| Module | Target | Current |
|--------|--------|---------|
| Scoring Algorithms | 80%+ | ~95% ✅ |
| API Integration | 70%+ | ~90% ✅ |
| Property Matching | 70%+ | ~85% ✅ |
| Overall Project | 60%+ | ~70% ✅ |

### How to Check Coverage

```bash
# Generate coverage report
npm run test:coverage

# View in browser
open coverage/index.html
```

### What Good Coverage Looks Like

```
✅ Statements: 70%+ covered
✅ Branches: 60%+ covered  (if/else logic)
✅ Functions: 70%+ covered
✅ Lines: 70%+ covered
```

---

## Best Practices

### 1. Arrange-Act-Assert (AAA) Pattern

```typescript
it('should calculate correct score', () => {
  // Arrange - Set up test data
  const property = createMockProperty();
  const requirement = { minSqFt: 50000 };

  // Act - Execute the function
  const result = scoreSpace(property, requirement);

  // Assert - Verify the outcome
  expect(result.score).toBe(100);
});
```

### 2. One Assertion Per Concept

```typescript
✅ Good:
it('should meet minimum requirement', () => {
  expect(result.breakdown.meetsMinimum).toBe(true);
});

it('should meet maximum requirement', () => {
  expect(result.breakdown.meetsMaximum).toBe(true);
});

❌ Bad:
it('should meet all requirements', () => {
  expect(result.breakdown.meetsMinimum).toBe(true);
  expect(result.breakdown.meetsMaximum).toBe(true);
  expect(result.breakdown.meetsContiguous).toBe(true);
  // Too many unrelated assertions
});
```

### 3. Use Descriptive Variable Names

```typescript
✅ Good:
const perfectMatchProperty = createMockProperty({ sqft: 60000 });
const tooSmallProperty = createMockProperty({ sqft: 10000 });

❌ Bad:
const prop1 = createMockProperty({ sqft: 60000 });
const prop2 = createMockProperty({ sqft: 10000 });
```

### 4. Test Behavior, Not Implementation

```typescript
✅ Good:
it('should return higher score for closer properties', () => {
  const closeProperty = { lat: 38.91, lng: -77.04 };
  const farProperty = { lat: 38.95, lng: -77.10 };

  const closeScore = scoreLocation(closeProperty, requirement).score;
  const farScore = scoreLocation(farProperty, requirement).score;

  expect(closeScore).toBeGreaterThan(farScore);
});

❌ Bad:
it('should call calculateDistance with lat/lng', () => {
  const spy = vi.spyOn(utils, 'calculateDistance');
  scoreLocation(property, requirement);
  expect(spy).toHaveBeenCalledWith(38.9, -77.0, 38.91, -77.04);
  // Testing implementation detail
});
```

### 5. Keep Tests Fast

```typescript
✅ Good:
it('should process 100 properties in < 100ms', async () => {
  const startTime = Date.now();
  await processProperties(properties);
  const duration = Date.now() - startTime;

  expect(duration).toBeLessThan(100);
});

❌ Bad:
it('should wait 5 seconds before timeout', async () => {
  await new Promise(resolve => setTimeout(resolve, 5000));
  // Tests should be fast!
});
```

---

## Troubleshooting

### Common Issues

#### Issue: "Cannot find module '@/lib/...'"
**Fix**: Check `tsconfig.json` has correct path mappings:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

#### Issue: Tests timeout
**Fix**: Increase timeout for slow operations:
```typescript
it('should handle large dataset', async () => {
  // ... test code
}, { timeout: 10000 }); // 10 seconds
```

#### Issue: "ReferenceError: fetch is not defined"
**Fix**: Mock global fetch:
```typescript
global.fetch = vi.fn().mockResolvedValue({
  ok: true,
  json: async () => ({ data: [] }),
});
```

#### Issue: Tests pass locally but fail in CI
**Fix**: Check for:
- Timezone differences
- Environment variables
- File path case sensitivity (CI often uses Linux)

---

## Checklist for New Tests

Before committing new tests:

- [ ] Tests run and pass locally (`npm test`)
- [ ] Test names are descriptive (start with "should")
- [ ] Happy path is tested
- [ ] Edge cases are covered
- [ ] Error handling is tested
- [ ] Coverage hasn't decreased
- [ ] No console.log statements left in code
- [ ] Mocks are cleaned up (beforeEach/afterEach)
- [ ] Tests are independent (can run in any order)

---

## Resources

- **Vitest Documentation**: https://vitest.dev/
- **Test Files Location**: `lib/__tests__/` and `lib/scoring/__tests__/`
- **Test Utilities**: `lib/__tests__/utils/test-helpers.ts`
- **Test Fixtures**: `lib/__tests__/fixtures/`
- **CI/CD Pipeline**: `.github/workflows/test.yml`

---

**Maintained by**: FedSpace Engineering Team
**Last Updated**: December 23, 2024 (Sprint 2)
**Questions?**: See `TEST_SUITE_SUMMARY.md` for current test statistics

*"Good tests are the foundation of confident refactoring."*
