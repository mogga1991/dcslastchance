/**
 * Timeline Scoring Tests
 * Sprint 2: Comprehensive coverage for availability and lease term matching
 */

import { describe, it, expect } from 'vitest';
import { scoreTimeline } from '../timeline-score';
import type { TimelineRequirement, PropertyTimeline } from '../types';

describe('scoreTimeline', () => {
  const createDate = (daysFromNow: number): Date => {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    return date;
  };

  describe('Availability Scoring (On Time)', () => {
    it('should award 100 points for 90+ days buffer', () => {
      const property: PropertyTimeline = {
        availableDate: createDate(10), // Available in 10 days
        minLeaseTermMonths: 12,
        maxLeaseTermMonths: 120,
      };

      const requirement: TimelineRequirement = {
        occupancyDate: createDate(100), // Need in 100 days
        firmTermMonths: 60,
        totalTermMonths: 120,
      };

      const result = scoreTimeline(property, requirement);

      expect(result.score).toBe(100);
      expect(result.breakdown.availableOnTime).toBe(true);
      expect(result.breakdown.daysBeforeOccupancy).toBeGreaterThanOrEqual(90);
      expect(result.breakdown.notes).toContain('Available 90+ days before occupancy');
    });

    it('should award 90 points for 60-89 days buffer', () => {
      const property: PropertyTimeline = {
        availableDate: createDate(20),
        minLeaseTermMonths: 12,
        maxLeaseTermMonths: 120,
      };

      const requirement: TimelineRequirement = {
        occupancyDate: createDate(80), // 60 days buffer
        firmTermMonths: 60,
        totalTermMonths: 120,
      };

      const result = scoreTimeline(property, requirement);

      expect(result.score).toBe(90);
      expect(result.breakdown.availableOnTime).toBe(true);
      expect(result.breakdown.notes).toContain('Available 60+ days before occupancy');
    });

    it('should award 80 points for 30-59 days buffer', () => {
      const property: PropertyTimeline = {
        availableDate: createDate(30),
        minLeaseTermMonths: 12,
        maxLeaseTermMonths: 120,
      };

      const requirement: TimelineRequirement = {
        occupancyDate: createDate(70), // 40 days buffer
        firmTermMonths: 60,
        totalTermMonths: 120,
      };

      const result = scoreTimeline(property, requirement);

      expect(result.score).toBe(80);
      expect(result.breakdown.availableOnTime).toBe(true);
      expect(result.breakdown.notes).toContain('Available 30+ days before occupancy');
    });

    it('should award 70 points for 0-29 days buffer', () => {
      const property: PropertyTimeline = {
        availableDate: createDate(50),
        minLeaseTermMonths: 12,
        maxLeaseTermMonths: 120,
      };

      const requirement: TimelineRequirement = {
        occupancyDate: createDate(60), // 10 days buffer
        firmTermMonths: 60,
        totalTermMonths: 120,
      };

      const result = scoreTimeline(property, requirement);

      expect(result.score).toBe(70);
      expect(result.breakdown.availableOnTime).toBe(true);
      expect(result.breakdown.notes).toContain('Tight timeline - available just before occupancy');
    });

    it('should handle exact same-day availability', () => {
      const occupancyDate = createDate(60);
      const property: PropertyTimeline = {
        availableDate: occupancyDate,
        minLeaseTermMonths: 12,
        maxLeaseTermMonths: 120,
      };

      const requirement: TimelineRequirement = {
        occupancyDate,
        firmTermMonths: 60,
        totalTermMonths: 120,
      };

      const result = scoreTimeline(property, requirement);

      expect(result.score).toBe(70);
      expect(result.breakdown.availableOnTime).toBe(true);
      expect(result.breakdown.daysBeforeOccupancy).toBe(0);
    });

    it('should handle property already available (past date)', () => {
      const property: PropertyTimeline = {
        availableDate: createDate(-30), // Available 30 days ago
        minLeaseTermMonths: 12,
        maxLeaseTermMonths: 120,
      };

      const requirement: TimelineRequirement = {
        occupancyDate: createDate(60),
        firmTermMonths: 60,
        totalTermMonths: 120,
      };

      const result = scoreTimeline(property, requirement);

      expect(result.score).toBe(100);
      expect(result.breakdown.availableOnTime).toBe(true);
      expect(result.breakdown.daysBeforeOccupancy).toBeGreaterThanOrEqual(90);
    });
  });

  describe('Availability Scoring (Late)', () => {
    it('should award 50 points for 1-30 days late', () => {
      const property: PropertyTimeline = {
        availableDate: createDate(80),
        minLeaseTermMonths: 12,
        maxLeaseTermMonths: 120,
      };

      const requirement: TimelineRequirement = {
        occupancyDate: createDate(60), // Need 20 days earlier
        firmTermMonths: 60,
        totalTermMonths: 120,
      };

      const result = scoreTimeline(property, requirement);

      expect(result.score).toBe(50);
      expect(result.breakdown.availableOnTime).toBe(false);
      expect(result.breakdown.notes[0]).toContain('days after required occupancy');
    });

    it('should award 30 points for 31-60 days late', () => {
      const property: PropertyTimeline = {
        availableDate: createDate(100),
        minLeaseTermMonths: 12,
        maxLeaseTermMonths: 120,
      };

      const requirement: TimelineRequirement = {
        occupancyDate: createDate(60), // Need 40 days earlier
        firmTermMonths: 60,
        totalTermMonths: 120,
      };

      const result = scoreTimeline(property, requirement);

      expect(result.score).toBe(30);
      expect(result.breakdown.availableOnTime).toBe(false);
    });

    it('should award 10 points for 61+ days late', () => {
      const property: PropertyTimeline = {
        availableDate: createDate(150),
        minLeaseTermMonths: 12,
        maxLeaseTermMonths: 120,
      };

      const requirement: TimelineRequirement = {
        occupancyDate: createDate(60), // Need 90 days earlier
        firmTermMonths: 60,
        totalTermMonths: 120,
      };

      const result = scoreTimeline(property, requirement);

      expect(result.score).toBe(10);
      expect(result.breakdown.availableOnTime).toBe(false);
      expect(result.breakdown.notes).toContain('Significantly delayed availability');
    });
  });

  describe('Lease Term Compatibility', () => {
    it('should not penalize if firm term within property range', () => {
      const property: PropertyTimeline = {
        availableDate: createDate(10),
        minLeaseTermMonths: 12,
        maxLeaseTermMonths: 120,
      };

      const requirement: TimelineRequirement = {
        occupancyDate: createDate(100),
        firmTermMonths: 60, // Within 12-120 range
        totalTermMonths: 120,
      };

      const result = scoreTimeline(property, requirement);

      expect(result.score).toBe(100); // No lease term penalties
      expect(result.breakdown.leaseTermCompatible).toBe(true);
    });

    it('should penalize 10 points if firm term below property minimum', () => {
      const property: PropertyTimeline = {
        availableDate: createDate(10),
        minLeaseTermMonths: 60, // Requires 60 month minimum
        maxLeaseTermMonths: 120,
      };

      const requirement: TimelineRequirement = {
        occupancyDate: createDate(100),
        firmTermMonths: 36, // Only wants 36 months
        totalTermMonths: 36,
      };

      const result = scoreTimeline(property, requirement);

      expect(result.score).toBe(90); // 100 - 10 penalty
      expect(result.breakdown.leaseTermCompatible).toBe(false);
      expect(result.breakdown.notes).toContain('Min lease term (60 mo) exceeds requirement');
    });

    it('should penalize 5 points if total term exceeds property maximum', () => {
      const property: PropertyTimeline = {
        availableDate: createDate(10),
        minLeaseTermMonths: 12,
        maxLeaseTermMonths: 60, // Max 60 months
      };

      const requirement: TimelineRequirement = {
        occupancyDate: createDate(100),
        firmTermMonths: 60,
        totalTermMonths: 120, // Wants 120 total
      };

      const result = scoreTimeline(property, requirement);

      expect(result.score).toBe(95); // 100 - 5 penalty
      expect(result.breakdown.notes).toContain('Max lease term may not accommodate full requirement');
    });

    it('should apply both penalties if both out of range', () => {
      const property: PropertyTimeline = {
        availableDate: createDate(10),
        minLeaseTermMonths: 60,
        maxLeaseTermMonths: 72,
      };

      const requirement: TimelineRequirement = {
        occupancyDate: createDate(100),
        firmTermMonths: 36, // Below minimum
        totalTermMonths: 120, // Above maximum
      };

      const result = scoreTimeline(property, requirement);

      expect(result.score).toBe(85); // 100 - 10 - 5
      expect(result.breakdown.leaseTermCompatible).toBe(false);
    });

    it('should handle missing property lease term bounds', () => {
      const property: PropertyTimeline = {
        availableDate: createDate(10),
        minLeaseTermMonths: null as any,
        maxLeaseTermMonths: null as any,
      };

      const requirement: TimelineRequirement = {
        occupancyDate: createDate(100),
        firmTermMonths: 60,
        totalTermMonths: 120,
      };

      const result = scoreTimeline(property, requirement);

      // Should not penalize if property doesn't specify limits
      expect(result.score).toBe(100);
      expect(result.breakdown.leaseTermCompatible).toBe(true);
    });

    it('should not check lease term if not specified in requirement', () => {
      const property: PropertyTimeline = {
        availableDate: createDate(10),
        minLeaseTermMonths: 60,
        maxLeaseTermMonths: 72,
      };

      const requirement: TimelineRequirement = {
        occupancyDate: createDate(100),
        firmTermMonths: null as any,
        totalTermMonths: null as any,
      };

      const result = scoreTimeline(property, requirement);

      expect(result.score).toBe(100);
      expect(result.breakdown.leaseTermCompatible).toBe(true);
    });
  });

  describe('Combined Availability and Lease Term', () => {
    it('should combine good availability with lease term penalty', () => {
      const property: PropertyTimeline = {
        availableDate: createDate(10),
        minLeaseTermMonths: 60,
        maxLeaseTermMonths: 120,
      };

      const requirement: TimelineRequirement = {
        occupancyDate: createDate(100), // 90 days buffer = 100 points
        firmTermMonths: 36, // Below minimum = -10 points
        totalTermMonths: 36,
      };

      const result = scoreTimeline(property, requirement);

      expect(result.score).toBe(90);
      expect(result.breakdown.availableOnTime).toBe(true);
      expect(result.breakdown.leaseTermCompatible).toBe(false);
    });

    it('should combine late availability with lease term issues', () => {
      const property: PropertyTimeline = {
        availableDate: createDate(100),
        minLeaseTermMonths: 60,
        maxLeaseTermMonths: 72,
      };

      const requirement: TimelineRequirement = {
        occupancyDate: createDate(60), // 40 days late = 30 points
        firmTermMonths: 36, // Below minimum = -10 points
        totalTermMonths: 120, // Above maximum = -5 points
      };

      const result = scoreTimeline(property, requirement);

      expect(result.score).toBe(15); // 30 - 10 - 5
      expect(result.breakdown.availableOnTime).toBe(false);
      expect(result.breakdown.leaseTermCompatible).toBe(false);
    });
  });

  describe('Date Calculations', () => {
    it('should calculate daysUntilAvailable correctly for future date', () => {
      const property: PropertyTimeline = {
        availableDate: createDate(45),
        minLeaseTermMonths: 12,
        maxLeaseTermMonths: 120,
      };

      const requirement: TimelineRequirement = {
        occupancyDate: createDate(100),
        firmTermMonths: 60,
        totalTermMonths: 120,
      };

      const result = scoreTimeline(property, requirement);

      expect(result.breakdown.daysUntilAvailable).toBeCloseTo(45, 0);
    });

    it('should calculate daysBeforeOccupancy correctly', () => {
      const property: PropertyTimeline = {
        availableDate: createDate(30),
        minLeaseTermMonths: 12,
        maxLeaseTermMonths: 120,
      };

      const requirement: TimelineRequirement = {
        occupancyDate: createDate(100),
        firmTermMonths: 60,
        totalTermMonths: 120,
      };

      const result = scoreTimeline(property, requirement);

      expect(result.breakdown.daysBeforeOccupancy).toBeCloseTo(70, 0); // 100 - 30
    });

    it('should handle negative daysBeforeOccupancy (late)', () => {
      const property: PropertyTimeline = {
        availableDate: createDate(100),
        minLeaseTermMonths: 12,
        maxLeaseTermMonths: 120,
      };

      const requirement: TimelineRequirement = {
        occupancyDate: createDate(60),
        firmTermMonths: 60,
        totalTermMonths: 120,
      };

      const result = scoreTimeline(property, requirement);

      // Should be negative (late), approximately -40 days (may vary by 1-2 days due to rounding)
      expect(result.breakdown.daysBeforeOccupancy).toBeLessThan(0);
      expect(result.breakdown.daysBeforeOccupancy).toBeGreaterThanOrEqual(-42);
      expect(result.breakdown.daysBeforeOccupancy).toBeLessThanOrEqual(-38);
    });

    it('should use today if availableDate is null', () => {
      const property: PropertyTimeline = {
        availableDate: null as any,
        minLeaseTermMonths: 12,
        maxLeaseTermMonths: 120,
      };

      const requirement: TimelineRequirement = {
        occupancyDate: createDate(100),
        firmTermMonths: 60,
        totalTermMonths: 120,
      };

      const result = scoreTimeline(property, requirement);

      expect(result.score).toBe(100);
      expect(result.breakdown.daysUntilAvailable).toBeCloseTo(0, 0);
      expect(result.breakdown.daysBeforeOccupancy).toBeCloseTo(100, 0);
    });
  });

  describe('Score Boundaries', () => {
    it('should enforce minimum score of 0', () => {
      const property: PropertyTimeline = {
        availableDate: createDate(200),
        minLeaseTermMonths: 120,
        maxLeaseTermMonths: 144,
      };

      const requirement: TimelineRequirement = {
        occupancyDate: createDate(60), // 140 days late = 10 points
        firmTermMonths: 12, // Way below minimum = -10
        totalTermMonths: 180, // Way above maximum = -5
      };

      const result = scoreTimeline(property, requirement);

      expect(result.score).toBeGreaterThanOrEqual(0);
    });

    it('should allow scores up to 100 (no cap needed)', () => {
      const property: PropertyTimeline = {
        availableDate: createDate(10),
        minLeaseTermMonths: 12,
        maxLeaseTermMonths: 120,
      };

      const requirement: TimelineRequirement = {
        occupancyDate: createDate(100),
        firmTermMonths: 60,
        totalTermMonths: 120,
      };

      const result = scoreTimeline(property, requirement);

      expect(result.score).toBe(100);
    });
  });

  describe('Breakdown Information', () => {
    it('should provide detailed breakdown', () => {
      const property: PropertyTimeline = {
        availableDate: createDate(30),
        minLeaseTermMonths: 12,
        maxLeaseTermMonths: 120,
      };

      const requirement: TimelineRequirement = {
        occupancyDate: createDate(100),
        firmTermMonths: 60,
        totalTermMonths: 120,
      };

      const result = scoreTimeline(property, requirement);

      expect(result.breakdown).toHaveProperty('availableOnTime');
      expect(result.breakdown).toHaveProperty('leaseTermCompatible');
      expect(result.breakdown).toHaveProperty('daysUntilAvailable');
      expect(result.breakdown).toHaveProperty('daysBeforeOccupancy');
      expect(result.breakdown).toHaveProperty('notes');
      expect(Array.isArray(result.breakdown.notes)).toBe(true);
    });

    it('should include helpful notes about timing', () => {
      const property: PropertyTimeline = {
        availableDate: createDate(10),
        minLeaseTermMonths: 12,
        maxLeaseTermMonths: 120,
      };

      const requirement: TimelineRequirement = {
        occupancyDate: createDate(100),
        firmTermMonths: 60,
        totalTermMonths: 120,
      };

      const result = scoreTimeline(property, requirement);

      expect(result.breakdown.notes.length).toBeGreaterThan(0);
      expect(result.breakdown.notes[0]).toContain('Available 90+ days before occupancy');
    });

    it('should include notes about lease term issues', () => {
      const property: PropertyTimeline = {
        availableDate: createDate(10),
        minLeaseTermMonths: 60,
        maxLeaseTermMonths: 120,
      };

      const requirement: TimelineRequirement = {
        occupancyDate: createDate(100),
        firmTermMonths: 36,
        totalTermMonths: 36,
      };

      const result = scoreTimeline(property, requirement);

      expect(result.breakdown.notes).toContain('Min lease term (60 mo) exceeds requirement');
    });
  });
});
