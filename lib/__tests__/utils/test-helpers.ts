/**
 * Test Utilities and Helpers
 * Sprint 2: Comprehensive test infrastructure
 *
 * Provides reusable test utilities for:
 * - Database mocking
 * - API mocking
 * - Data fixtures
 * - Assertion helpers
 */

import { vi } from 'vitest';

/**
 * Database Test Helpers
 */
export class DatabaseTestHelper {
  /**
   * Create mock Supabase client
   */
  static createMockSupabaseClient(overrides = {}) {
    return {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: null }),
        ...overrides,
      }),
      rpc: vi.fn().mockResolvedValue({ data: null, error: null }),
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
        getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      },
    };
  }

  /**
   * Create mock Neon SQL client
   */
  static createMockNeonClient() {
    const mockFn = vi.fn().mockResolvedValue([]);

    // Add unsafe method for DDL statements
    (mockFn as any).unsafe = vi.fn().mockResolvedValue([]);

    return mockFn;
  }

  /**
   * Wait for async operations to complete
   */
  static async waitForAsync(ms = 0) {
    await new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * API Test Helpers
 */
export class APITestHelper {
  /**
   * Create mock fetch response
   */
  static createMockResponse(data: any, status = 200) {
    return {
      ok: status >= 200 && status < 300,
      status,
      statusText: status === 200 ? 'OK' : 'Error',
      json: async () => data,
      text: async () => JSON.stringify(data),
      headers: new Headers({
        'Content-Type': 'application/json',
      }),
    } as Response;
  }

  /**
   * Mock fetch globally
   */
  static mockFetch(response: any, status = 200) {
    global.fetch = vi.fn().mockResolvedValue(
      this.createMockResponse(response, status)
    );
  }

  /**
   * Mock SAM.gov API response
   */
  static mockSAMGovAPI(opportunities: any[] = []) {
    this.mockFetch({
      opportunitiesData: opportunities,
      totalRecords: opportunities.length,
    });
  }

  /**
   * Reset all API mocks
   */
  static resetMocks() {
    vi.restoreAllMocks();
  }
}

/**
 * Assertion Helpers
 */
export class AssertionHelper {
  /**
   * Assert that a value is within range
   */
  static assertInRange(value: number, min: number, max: number, message?: string) {
    if (value < min || value > max) {
      throw new Error(
        message || `Expected ${value} to be between ${min} and ${max}`
      );
    }
  }

  /**
   * Assert that an array contains all expected items
   */
  static assertContainsAll<T>(array: T[], expectedItems: T[], message?: string) {
    const missing = expectedItems.filter(item => !array.includes(item));
    if (missing.length > 0) {
      throw new Error(
        message || `Array is missing expected items: ${missing.join(', ')}`
      );
    }
  }

  /**
   * Assert that a date is recent (within last N seconds)
   */
  static assertDateIsRecent(date: Date | string, maxAgeSeconds = 60) {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const ageMs = now.getTime() - dateObj.getTime();
    const ageSeconds = ageMs / 1000;

    if (ageSeconds > maxAgeSeconds) {
      throw new Error(
        `Date ${dateObj.toISOString()} is too old (${ageSeconds}s ago, max ${maxAgeSeconds}s)`
      );
    }
  }

  /**
   * Assert that an object matches partial shape
   */
  static assertMatchesShape(obj: any, expectedShape: any) {
    for (const key in expectedShape) {
      if (!(key in obj)) {
        throw new Error(`Object is missing expected key: ${key}`);
      }

      const expectedType = typeof expectedShape[key];
      const actualType = typeof obj[key];

      if (expectedType !== actualType) {
        throw new Error(
          `Type mismatch for key "${key}": expected ${expectedType}, got ${actualType}`
        );
      }
    }
  }
}

/**
 * Performance Test Helpers
 */
export class PerformanceTestHelper {
  /**
   * Measure execution time of a function
   */
  static async measureTime<T>(fn: () => T | Promise<T>): Promise<{
    result: T;
    duration: number;
  }> {
    const start = Date.now();
    const result = await fn();
    const duration = Date.now() - start;

    return { result, duration };
  }

  /**
   * Run function N times and return average duration
   */
  static async benchmarkFunction<T>(
    fn: () => T | Promise<T>,
    iterations = 10
  ): Promise<{
    avgDuration: number;
    minDuration: number;
    maxDuration: number;
    results: T[];
  }> {
    const durations: number[] = [];
    const results: T[] = [];

    for (let i = 0; i < iterations; i++) {
      const { result, duration } = await this.measureTime(fn);
      durations.push(duration);
      results.push(result);
    }

    return {
      avgDuration: durations.reduce((a, b) => a + b, 0) / durations.length,
      minDuration: Math.min(...durations),
      maxDuration: Math.max(...durations),
      results,
    };
  }

  /**
   * Assert that operation completes within time limit
   */
  static async assertCompletesWithin<T>(
    fn: () => T | Promise<T>,
    maxMs: number
  ): Promise<T> {
    const { result, duration } = await this.measureTime(fn);

    if (duration > maxMs) {
      throw new Error(
        `Operation took ${duration}ms, expected < ${maxMs}ms`
      );
    }

    return result;
  }
}

/**
 * Cleanup Helper
 */
export class CleanupHelper {
  private static cleanupFunctions: (() => void | Promise<void>)[] = [];

  /**
   * Register a cleanup function to run after test
   */
  static register(fn: () => void | Promise<void>) {
    this.cleanupFunctions.push(fn);
  }

  /**
   * Run all cleanup functions
   */
  static async runAll() {
    for (const fn of this.cleanupFunctions) {
      await fn();
    }
    this.cleanupFunctions = [];
  }

  /**
   * Clear all registered cleanup functions
   */
  static clear() {
    this.cleanupFunctions = [];
  }
}
