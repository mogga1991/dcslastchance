/**
 * Space Scoring Tests
 * Sprint 2: Comprehensive coverage for space requirement matching
 */

import { describe, it, expect } from 'vitest';
import { scoreSpace } from '../space-score';
import type { SpaceRequirement, PropertySpace } from '../types';

describe('scoreSpace', () => {
  describe('Perfect Fit Scenarios', () => {
    it('should award 100 points for exact match within range', () => {
      const property: PropertySpace = {
        totalSqFt: 60000,
        availableSqFt: 60000,
        usableSqFt: 58000,
        minDivisibleSqFt: null,
        isContiguous: true,
      };

      const requirement: SpaceRequirement = {
        minSqFt: 50000,
        maxSqFt: 70000,
        targetSqFt: 60000,
        contiguous: false,
      };

      const result = scoreSpace(property, requirement);

      expect(result.score).toBe(100);
      expect(result.breakdown.meetsMinimum).toBe(true);
      expect(result.breakdown.meetsMaximum).toBe(true);
    });

    it('should not penalize if far from target but within range', () => {
      const property: PropertySpace = {
        totalSqFt: 50000,
        availableSqFt: 50000,
        usableSqFt: 48000,
        minDivisibleSqFt: null,
        isContiguous: true,
      };

      const requirement: SpaceRequirement = {
        minSqFt: 45000,
        maxSqFt: 75000,
        targetSqFt: 70000, // Property is far from target (28.6% variance)
        contiguous: false,
      };

      const result = scoreSpace(property, requirement);

      // Algorithm only penalizes if variance is 5-25%; >25% gets no penalty
      expect(result.score).toBe(100);
      expect(result.breakdown.meetsMinimum).toBe(true);
      expect(result.breakdown.meetsMaximum).toBe(true);
    });

    it('should give bonus for being within 5% of target', () => {
      const property: PropertySpace = {
        totalSqFt: 60500,
        availableSqFt: 60500,
        usableSqFt: 58000,
        minDivisibleSqFt: null,
        isContiguous: true,
      };

      const requirement: SpaceRequirement = {
        minSqFt: 50000,
        maxSqFt: 70000,
        targetSqFt: 60000, // 500 SF difference = 0.83% variance
        contiguous: false,
      };

      const result = scoreSpace(property, requirement);

      expect(result.score).toBe(100);
      expect(result.breakdown.notes).toContain('Within 5% of target size');
    });
  });

  describe('Minimum Requirements', () => {
    it('should score 80 if within 5% of minimum', () => {
      const property: PropertySpace = {
        totalSqFt: 47500,
        availableSqFt: 47500,
        usableSqFt: 45000,
        minDivisibleSqFt: null,
        isContiguous: true,
      };

      const requirement: SpaceRequirement = {
        minSqFt: 50000, // Property is 2500 SF short (5%)
        maxSqFt: 70000,
        targetSqFt: null,
        contiguous: false,
      };

      const result = scoreSpace(property, requirement);

      expect(result.score).toBe(80);
      expect(result.breakdown.meetsMinimum).toBe(false);
      expect(result.breakdown.notes).toContain('Within 5% of minimum - may qualify');
    });

    it('should score 60 if within 10% of minimum', () => {
      const property: PropertySpace = {
        totalSqFt: 45500,
        availableSqFt: 45500,
        usableSqFt: 43000,
        minDivisibleSqFt: null,
        isContiguous: true,
      };

      const requirement: SpaceRequirement = {
        minSqFt: 50000, // Property is 4500 SF short (9%)
        maxSqFt: 70000,
        targetSqFt: null,
        contiguous: false,
      };

      const result = scoreSpace(property, requirement);

      expect(result.score).toBe(60);
      expect(result.breakdown.notes).toContain('Within 10% of minimum - negotiate');
    });

    it('should score 40 if within 20% of minimum', () => {
      const property: PropertySpace = {
        totalSqFt: 42000,
        availableSqFt: 42000,
        usableSqFt: 40000,
        minDivisibleSqFt: null,
        isContiguous: true,
      };

      const requirement: SpaceRequirement = {
        minSqFt: 50000, // Property is 8000 SF short (16%)
        maxSqFt: 70000,
        targetSqFt: null,
        contiguous: false,
      };

      const result = scoreSpace(property, requirement);

      expect(result.score).toBe(40);
    });

    it('should score 20 if significantly under minimum', () => {
      const property: PropertySpace = {
        totalSqFt: 30000,
        availableSqFt: 30000,
        usableSqFt: 28000,
        minDivisibleSqFt: null,
        isContiguous: true,
      };

      const requirement: SpaceRequirement = {
        minSqFt: 50000, // Property is 20000 SF short (40%)
        maxSqFt: 70000,
        targetSqFt: null,
        contiguous: false,
      };

      const result = scoreSpace(property, requirement);

      expect(result.score).toBe(20);
      expect(result.breakdown.notes).toContain('Significantly under minimum requirement');
    });
  });

  describe('Maximum Requirements', () => {
    it('should score 50 if over maximum and not divisible', () => {
      const property: PropertySpace = {
        totalSqFt: 80000,
        availableSqFt: 80000,
        usableSqFt: 75000,
        minDivisibleSqFt: null,
        isContiguous: true,
      };

      const requirement: SpaceRequirement = {
        minSqFt: 50000,
        maxSqFt: 70000, // Property exceeds by 10000 SF
        targetSqFt: null,
        contiguous: false,
      };

      const result = scoreSpace(property, requirement);

      expect(result.score).toBe(50);
      expect(result.breakdown.meetsMaximum).toBe(false);
      expect(result.breakdown.notes).toContain('Exceeds maximum, not easily divisible');
    });

    it('should score 80 if over maximum but divisible', () => {
      const property: PropertySpace = {
        totalSqFt: 80000,
        availableSqFt: 80000,
        usableSqFt: 75000,
        minDivisibleSqFt: 60000, // Can subdivide to 60000 (within max)
        isContiguous: true,
      };

      const requirement: SpaceRequirement = {
        minSqFt: 50000,
        maxSqFt: 70000,
        targetSqFt: null,
        contiguous: false,
      };

      const result = scoreSpace(property, requirement);

      expect(result.score).toBe(80);
      expect(result.breakdown.notes).toContain('Can subdivide to meet maximum');
    });
  });

  describe('Contiguous Requirements', () => {
    it('should score 30 if contiguous required but not available', () => {
      const property: PropertySpace = {
        totalSqFt: 60000,
        availableSqFt: 60000,
        usableSqFt: 58000,
        minDivisibleSqFt: null,
        isContiguous: false, // Not contiguous
      };

      const requirement: SpaceRequirement = {
        minSqFt: 50000,
        maxSqFt: 70000,
        targetSqFt: null,
        contiguous: true, // Required
      };

      const result = scoreSpace(property, requirement);

      expect(result.score).toBe(30); // Major penalty
      expect(result.breakdown.meetsContiguous).toBe(false);
      expect(result.breakdown.notes).toContain('Space is not contiguous as required');
    });

    it('should score normally if contiguous and available', () => {
      const property: PropertySpace = {
        totalSqFt: 60000,
        availableSqFt: 60000,
        usableSqFt: 58000,
        minDivisibleSqFt: null,
        isContiguous: true,
      };

      const requirement: SpaceRequirement = {
        minSqFt: 50000,
        maxSqFt: 70000,
        targetSqFt: null,
        contiguous: true,
      };

      const result = scoreSpace(property, requirement);

      expect(result.score).toBe(100);
      expect(result.breakdown.meetsContiguous).toBe(true);
    });

    it('should not penalize if contiguous not required', () => {
      const property: PropertySpace = {
        totalSqFt: 60000,
        availableSqFt: 60000,
        usableSqFt: 58000,
        minDivisibleSqFt: null,
        isContiguous: false,
      };

      const requirement: SpaceRequirement = {
        minSqFt: 50000,
        maxSqFt: 70000,
        targetSqFt: null,
        contiguous: false, // Not required
      };

      const result = scoreSpace(property, requirement);

      expect(result.score).toBe(100);
    });
  });

  describe('Available vs Total Square Footage', () => {
    it('should use availableSqFt if provided', () => {
      const property: PropertySpace = {
        totalSqFt: 100000,
        availableSqFt: 60000, // Only 60k available
        usableSqFt: 55000,
        minDivisibleSqFt: null,
        isContiguous: true,
      };

      const requirement: SpaceRequirement = {
        minSqFt: 50000,
        maxSqFt: 70000,
        targetSqFt: null,
        contiguous: false,
      };

      const result = scoreSpace(property, requirement);

      expect(result.breakdown.availableSqFt).toBe(60000);
      expect(result.score).toBe(100); // Meets requirements with available space
    });

    it('should fall back to totalSqFt if availableSqFt is null', () => {
      const property: PropertySpace = {
        totalSqFt: 60000,
        availableSqFt: null,
        usableSqFt: 55000,
        minDivisibleSqFt: null,
        isContiguous: true,
      };

      const requirement: SpaceRequirement = {
        minSqFt: 50000,
        maxSqFt: 70000,
        targetSqFt: null,
        contiguous: false,
      };

      const result = scoreSpace(property, requirement);

      expect(result.score).toBe(100);
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero minimum requirement', () => {
      const property: PropertySpace = {
        totalSqFt: 60000,
        availableSqFt: 60000,
        usableSqFt: 55000,
        minDivisibleSqFt: null,
        isContiguous: true,
      };

      const requirement: SpaceRequirement = {
        minSqFt: 0,
        maxSqFt: 70000,
        targetSqFt: null,
        contiguous: false,
      };

      const result = scoreSpace(property, requirement);

      expect(result.score).toBe(100);
      expect(result.breakdown.meetsMinimum).toBe(true);
    });

    it('should handle Infinity as maximum (no upper limit)', () => {
      const property: PropertySpace = {
        totalSqFt: 1000000, // Very large
        availableSqFt: 1000000,
        usableSqFt: 950000,
        minDivisibleSqFt: null,
        isContiguous: true,
      };

      const requirement: SpaceRequirement = {
        minSqFt: 50000,
        maxSqFt: null, // Will be treated as Infinity
        targetSqFt: null,
        contiguous: false,
      };

      const result = scoreSpace(property, requirement);

      expect(result.breakdown.meetsMaximum).toBe(true);
    });

    it('should calculate variance correctly', () => {
      const property: PropertySpace = {
        totalSqFt: 45000,
        availableSqFt: 45000,
        usableSqFt: 43000,
        minDivisibleSqFt: null,
        isContiguous: true,
      };

      const requirement: SpaceRequirement = {
        minSqFt: 50000,
        maxSqFt: 70000,
        targetSqFt: null,
        contiguous: false,
      };

      const result = scoreSpace(property, requirement);

      expect(result.breakdown.variance).toBe(-5000); // 45000 - 50000
      expect(result.breakdown.variancePercent).toBe(-10); // (45000 - 50000) / 50000 * 100
    });
  });

  describe('Breakdown Information', () => {
    it('should provide detailed breakdown', () => {
      const property: PropertySpace = {
        totalSqFt: 60000,
        availableSqFt: 60000,
        usableSqFt: 55000,
        minDivisibleSqFt: null,
        isContiguous: true,
      };

      const requirement: SpaceRequirement = {
        minSqFt: 50000,
        maxSqFt: 70000,
        targetSqFt: 60000,
        contiguous: false,
      };

      const result = scoreSpace(property, requirement);

      expect(result.breakdown).toHaveProperty('meetsMinimum');
      expect(result.breakdown).toHaveProperty('meetsMaximum');
      expect(result.breakdown).toHaveProperty('meetsContiguous');
      expect(result.breakdown).toHaveProperty('availableSqFt');
      expect(result.breakdown).toHaveProperty('requiredSqFt');
      expect(result.breakdown).toHaveProperty('notes');
      expect(Array.isArray(result.breakdown.notes)).toBe(true);
    });

    it('should include helpful notes for shortfalls', () => {
      const property: PropertySpace = {
        totalSqFt: 40000,
        availableSqFt: 40000,
        usableSqFt: 38000,
        minDivisibleSqFt: null,
        isContiguous: true,
      };

      const requirement: SpaceRequirement = {
        minSqFt: 50000,
        maxSqFt: 70000,
        targetSqFt: null,
        contiguous: false,
      };

      const result = scoreSpace(property, requirement);

      expect(result.breakdown.notes.length).toBeGreaterThan(0);
      expect(result.breakdown.notes[0]).toContain('SF short of minimum');
    });

    it('should include notes for excess space', () => {
      const property: PropertySpace = {
        totalSqFt: 80000,
        availableSqFt: 80000,
        usableSqFt: 75000,
        minDivisibleSqFt: null,
        isContiguous: true,
      };

      const requirement: SpaceRequirement = {
        minSqFt: 50000,
        maxSqFt: 70000,
        targetSqFt: null,
        contiguous: false,
      };

      const result = scoreSpace(property, requirement);

      expect(result.breakdown.notes).toContain('10,000 SF over maximum');
    });
  });
});
