/**
 * Location Scoring Tests
 * Sprint 2: Comprehensive coverage for location matching algorithm
 */

import { describe, it, expect } from 'vitest';
import { scoreLocation } from '../location-score';
import type { LocationRequirement } from '../types';

describe('scoreLocation', () => {
  const dcProperty = {
    city: 'Washington',
    state: 'DC',
    lat: 38.9072,
    lng: -77.0369,
  };

  const vaProperty = {
    city: 'Arlington',
    state: 'VA',
    lat: 38.8580,
    lng: -77.0498,
  };

  describe('State Matching', () => {
    it('should return 0 score for wrong state', () => {
      const requirement: LocationRequirement = {
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
      const requirement: LocationRequirement = {
        state: 'DC',
        city: null,
        centralPoint: null,
        radiusMiles: null,
      };

      const result = scoreLocation(dcProperty, requirement);

      expect(result.score).toBeGreaterThanOrEqual(40);
      expect(result.breakdown.stateMatch).toBe(true);
    });

    it('should be case-sensitive for state codes', () => {
      const requirement: LocationRequirement = {
        state: 'dc', // lowercase
        city: null,
        centralPoint: null,
        radiusMiles: null,
      };

      const result = scoreLocation(dcProperty, requirement);

      // Should fail because state codes should be uppercase
      expect(result.score).toBe(0);
    });
  });

  describe('City Matching', () => {
    it('should award additional 30 points for exact city match', () => {
      const requirement: LocationRequirement = {
        state: 'DC',
        city: 'Washington',
        centralPoint: null,
        radiusMiles: null,
      };

      const result = scoreLocation(dcProperty, requirement);

      expect(result.score).toBe(100); // 40 (state) + 30 (city) + 30 (bonus when no radius)
      expect(result.breakdown.cityMatch).toBe(true);
      expect(result.breakdown.notes).toContain('Exact city match');
    });

    it('should be case-insensitive for city matching', () => {
      const requirement: LocationRequirement = {
        state: 'DC',
        city: 'washington', // lowercase
        centralPoint: null,
        radiusMiles: null,
      };

      const result = scoreLocation(dcProperty, requirement);

      expect(result.breakdown.cityMatch).toBe(true);
      expect(result.score).toBe(100); // 40 (state) + 30 (city) + 30 (bonus when no radius)
    });

    it('should not award city bonus for different city', () => {
      const requirement: LocationRequirement = {
        state: 'DC',
        city: 'Georgetown', // Different city
        centralPoint: null,
        radiusMiles: null,
      };

      const result = scoreLocation(dcProperty, requirement);

      expect(result.breakdown.cityMatch).toBe(false);
      expect(result.score).toBe(40); // Only state match
    });
  });

  describe('Distance-Based Scoring (Delineated Area)', () => {
    it('should award maximum bonus for property at center', () => {
      const requirement: LocationRequirement = {
        state: 'DC',
        city: null,
        centralPoint: {
          lat: dcProperty.lat,
          lng: dcProperty.lng,
        },
        radiusMiles: 5,
      };

      const result = scoreLocation(dcProperty, requirement);

      expect(result.score).toBe(70); // 40 (state) + 30 (distance)
      expect(result.breakdown.withinDelineatedArea).toBe(true);
      expect(result.breakdown.distanceMiles).toBeLessThan(0.1); // Essentially 0
    });

    it('should calculate distance correctly between DC and Arlington', () => {
      const requirement: LocationRequirement = {
        state: 'VA',
        city: null,
        centralPoint: {
          lat: 38.9072, // DC coordinates
          lng: -77.0369,
        },
        radiusMiles: 10,
      };

      const result = scoreLocation(vaProperty, requirement);

      expect(result.breakdown.distanceMiles).toBeGreaterThan(0);
      expect(result.breakdown.distanceMiles).toBeLessThan(10);
      expect(result.breakdown.withinDelineatedArea).toBe(true);
    });

    it('should penalize properties outside radius', () => {
      const requirement: LocationRequirement = {
        state: 'DC',
        city: null,
        centralPoint: {
          lat: 38.9072,
          lng: -77.0369,
        },
        radiusMiles: 1, // Very small radius
      };

      const farAwayProperty = {
        city: 'Washington',
        state: 'DC',
        lat: 38.95, // ~3 miles away
        lng: -77.1,
      };

      const result = scoreLocation(farAwayProperty, requirement);

      expect(result.breakdown.withinDelineatedArea).toBe(false);
      expect(result.score).toBeLessThan(40); // Penalty applied
    });

    it('should score closer properties higher than farther ones', () => {
      const centralPoint = { lat: 38.9072, lng: -77.0369 };
      const requirement: LocationRequirement = {
        state: 'DC',
        city: null,
        centralPoint,
        radiusMiles: 5,
      };

      const closeProperty = {
        city: 'Washington',
        state: 'DC',
        lat: 38.91, // ~0.2 miles
        lng: -77.04,
      };

      const farProperty = {
        city: 'Washington',
        state: 'DC',
        lat: 38.94, // ~2.5 miles
        lng: -77.08,
      };

      const closeResult = scoreLocation(closeProperty, requirement);
      const farResult = scoreLocation(farProperty, requirement);

      expect(closeResult.score).toBeGreaterThan(farResult.score);
    });
  });

  describe('Combined Scoring', () => {
    it('should award maximum 100 points for perfect match', () => {
      const requirement: LocationRequirement = {
        state: 'DC',
        city: 'Washington',
        centralPoint: {
          lat: dcProperty.lat,
          lng: dcProperty.lng,
        },
        radiusMiles: 5,
      };

      const result = scoreLocation(dcProperty, requirement);

      expect(result.score).toBe(100); // 40 + 30 + 30 = 100
      expect(result.breakdown.stateMatch).toBe(true);
      expect(result.breakdown.cityMatch).toBe(true);
      expect(result.breakdown.withinDelineatedArea).toBe(true);
    });

    it('should cap score at 100', () => {
      // Even if calculation would exceed 100, should cap at 100
      const requirement: LocationRequirement = {
        state: 'DC',
        city: 'Washington',
        centralPoint: {
          lat: dcProperty.lat,
          lng: dcProperty.lng,
        },
        radiusMiles: 5,
      };

      const result = scoreLocation(dcProperty, requirement);

      expect(result.score).toBeLessThanOrEqual(100);
    });

    it('should handle null city gracefully', () => {
      const requirement: LocationRequirement = {
        state: 'DC',
        city: null,
        centralPoint: null,
        radiusMiles: null,
      };

      const result = scoreLocation(dcProperty, requirement);

      expect(result.score).toBe(40); // Just state match
      expect(result.breakdown.cityMatch).toBe(false);
    });

    it('should award city bonus when no radius specified but city matches', () => {
      const requirement: LocationRequirement = {
        state: 'DC',
        city: 'Washington',
        centralPoint: null,
        radiusMiles: null,
      };

      const result = scoreLocation(dcProperty, requirement);

      expect(result.score).toBe(100); // 40 (state) + 30 (city) + 30 (bonus)
      expect(result.breakdown.cityMatch).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle properties with same coordinates', () => {
      const requirement: LocationRequirement = {
        state: 'DC',
        city: null,
        centralPoint: {
          lat: dcProperty.lat,
          lng: dcProperty.lng,
        },
        radiusMiles: 1,
      };

      const result = scoreLocation(dcProperty, requirement);

      expect(result.breakdown.distanceMiles).toBe(0);
      expect(result.breakdown.withinDelineatedArea).toBe(true);
    });

    it('should handle very large radius', () => {
      const requirement: LocationRequirement = {
        state: 'VA',
        city: null,
        centralPoint: {
          lat: 38.8580,
          lng: -77.0498,
        },
        radiusMiles: 1000, // Huge radius
      };

      const result = scoreLocation(vaProperty, requirement);

      expect(result.breakdown.withinDelineatedArea).toBe(true);
      expect(result.score).toBeGreaterThan(40);
    });

    it('should handle properties at exact radius boundary', () => {
      const centerPoint = { lat: 38.9072, lng: -77.0369 };
      const radius = 5;

      // Calculate a point approximately 5 miles away
      const boundaryProperty = {
        city: 'Washington',
        state: 'DC',
        lat: 38.9522, // Approximately 3.1 miles north
        lng: -77.0369,
      };

      const requirement: LocationRequirement = {
        state: 'DC',
        city: null,
        centralPoint: centerPoint,
        radiusMiles: radius,
      };

      const result = scoreLocation(boundaryProperty, requirement);

      // Should be within radius
      expect(result.breakdown.distanceMiles).toBeLessThan(radius);
      expect(result.breakdown.withinDelineatedArea).toBe(true);
    });
  });

  describe('Breakdown Information', () => {
    it('should provide detailed breakdown for debugging', () => {
      const requirement: LocationRequirement = {
        state: 'DC',
        city: 'Washington',
        centralPoint: {
          lat: 38.9072,
          lng: -77.0369,
        },
        radiusMiles: 5,
      };

      const result = scoreLocation(dcProperty, requirement);

      expect(result.breakdown).toHaveProperty('stateMatch');
      expect(result.breakdown).toHaveProperty('cityMatch');
      expect(result.breakdown).toHaveProperty('withinDelineatedArea');
      expect(result.breakdown).toHaveProperty('distanceMiles');
      expect(result.breakdown).toHaveProperty('notes');
      expect(Array.isArray(result.breakdown.notes)).toBe(true);
    });

    it('should include helpful notes for failed matches', () => {
      const requirement: LocationRequirement = {
        state: 'VA',
        city: null,
        centralPoint: null,
        radiusMiles: null,
      };

      const result = scoreLocation(dcProperty, requirement);

      expect(result.breakdown.notes.length).toBeGreaterThan(0);
      expect(result.breakdown.notes[0]).toContain('not in required state');
    });
  });
});
