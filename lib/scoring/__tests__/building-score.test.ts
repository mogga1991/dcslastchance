/**
 * Building Scoring Tests
 * Sprint 2: Comprehensive coverage for building quality and features matching
 */

import { describe, it, expect } from 'vitest';
import { scoreBuilding } from '../building-score';
import type { BuildingRequirement, PropertyBuilding } from '../types';

describe('scoreBuilding', () => {
  const createMockProperty = (overrides: Partial<PropertyBuilding> = {}): PropertyBuilding => ({
    buildingClass: 'A',
    adaCompliant: true,
    publicTransitAccess: true,
    features: {
      fiber: true,
      backupPower: true,
      loadingDock: true,
      security24x7: true,
      secureAccess: true,
      scifCapable: false,
      dataCenter: false,
      cafeteria: true,
      fitnessCenter: true,
      conferenceCenter: true,
    },
    certifications: ['LEED Gold', 'Energy Star'],
    ...overrides,
  });

  describe('Building Class Matching', () => {
    it('should award 20 points for preferred class match', () => {
      const property = createMockProperty({ buildingClass: 'A' });
      const requirement: BuildingRequirement = {
        buildingClass: ['A', 'B'],
        accessibility: {},
        features: {},
        certifications: null,
      };

      const result = scoreBuilding(property, requirement);

      expect(result.score).toBeGreaterThanOrEqual(70); // 50 base + 20 preferred
      expect(result.breakdown.classMatch).toBe(true);
      expect(result.breakdown.notes).toContain('Class A - preferred');
    });

    it('should award 10 points for acceptable class match', () => {
      const property = createMockProperty({ buildingClass: 'B' });
      const requirement: BuildingRequirement = {
        buildingClass: ['A', 'B'],
        accessibility: {},
        features: {},
        certifications: null,
      };

      const result = scoreBuilding(property, requirement);

      expect(result.score).toBeGreaterThanOrEqual(60); // 50 base + 10 acceptable
      expect(result.breakdown.classMatch).toBe(true);
      expect(result.breakdown.notes).toContain('Class B - acceptable');
    });

    it('should penalize 20 points for unacceptable class', () => {
      const property = createMockProperty({ buildingClass: 'C' });
      const requirement: BuildingRequirement = {
        buildingClass: ['A', 'B'],
        accessibility: {},
        features: {},
        certifications: null,
      };

      const result = scoreBuilding(property, requirement);

      expect(result.score).toBe(30); // 50 base - 20 penalty
      expect(result.breakdown.classMatch).toBe(false);
      expect(result.breakdown.notes).toContain('Class C - not in acceptable list');
    });

    it('should handle A+ class by normalizing to A', () => {
      const property = createMockProperty({ buildingClass: 'A+' });
      const requirement: BuildingRequirement = {
        buildingClass: ['A', 'B'],
        accessibility: {},
        features: {},
        certifications: null,
      };

      const result = scoreBuilding(property, requirement);

      expect(result.score).toBeGreaterThanOrEqual(70);
      expect(result.breakdown.classMatch).toBe(true);
      expect(result.breakdown.notes).toContain('Class A+ - preferred');
    });

    it('should handle missing building class gracefully', () => {
      const property = createMockProperty({ buildingClass: null as any });
      const requirement: BuildingRequirement = {
        buildingClass: ['A'],
        accessibility: {},
        features: {},
        certifications: null,
      };

      const result = scoreBuilding(property, requirement);

      expect(result.score).toBe(50); // Just base score
      expect(result.breakdown.notes).toContain('Building class information not available');
    });

    it('should not apply class scoring if no class requirement', () => {
      const property = createMockProperty({ buildingClass: 'C' });
      const requirement: BuildingRequirement = {
        buildingClass: [],
        accessibility: {},
        features: {},
        certifications: null,
      };

      const result = scoreBuilding(property, requirement);

      expect(result.score).toBe(50); // Base score only
      expect(result.breakdown.classMatch).toBe(false);
    });
  });

  describe('ADA Compliance (Critical Requirement)', () => {
    it('should penalize 30 points if ADA required but not compliant', () => {
      const property = createMockProperty({ adaCompliant: false });
      const requirement: BuildingRequirement = {
        buildingClass: [],
        accessibility: { adaCompliant: true },
        features: {},
        certifications: null,
      };

      const result = scoreBuilding(property, requirement);

      expect(result.score).toBe(20); // 50 base - 30 penalty
      expect(result.breakdown.accessibilityMet).toBe(false);
      expect(result.breakdown.notes).toContain('ADA compliance required but not met');
    });

    it('should not penalize if ADA compliant', () => {
      const property = createMockProperty({ adaCompliant: true });
      const requirement: BuildingRequirement = {
        buildingClass: [],
        accessibility: { adaCompliant: true },
        features: {},
        certifications: null,
      };

      const result = scoreBuilding(property, requirement);

      expect(result.score).toBe(50); // Base score unchanged
      expect(result.breakdown.accessibilityMet).toBe(true);
    });

    it('should not penalize if ADA not required', () => {
      const property = createMockProperty({ adaCompliant: false });
      const requirement: BuildingRequirement = {
        buildingClass: [],
        accessibility: {},
        features: {},
        certifications: null,
      };

      const result = scoreBuilding(property, requirement);

      expect(result.score).toBe(50);
      expect(result.breakdown.accessibilityMet).toBe(true); // No requirement = met
    });
  });

  describe('Public Transit Access', () => {
    it('should penalize 5 points if transit preferred but not available', () => {
      const property = createMockProperty({ publicTransitAccess: false });
      const requirement: BuildingRequirement = {
        buildingClass: [],
        accessibility: { publicTransit: true },
        features: {},
        certifications: null,
      };

      const result = scoreBuilding(property, requirement);

      expect(result.score).toBe(45); // 50 base - 5 penalty
      expect(result.breakdown.notes).toContain('Public transit access preferred');
    });

    it('should not penalize if transit available', () => {
      const property = createMockProperty({ publicTransitAccess: true });
      const requirement: BuildingRequirement = {
        buildingClass: [],
        accessibility: { publicTransit: true },
        features: {},
        certifications: null,
      };

      const result = scoreBuilding(property, requirement);

      expect(result.score).toBe(50);
    });
  });

  describe('Feature Scoring', () => {
    it('should award points for each required feature present', () => {
      const property = createMockProperty({
        features: {
          fiber: true,
          backupPower: true,
          loadingDock: true,
          security24x7: false,
          secureAccess: false,
          scifCapable: false,
          dataCenter: false,
          cafeteria: false,
          fitnessCenter: false,
          conferenceCenter: false,
        },
      });

      const requirement: BuildingRequirement = {
        buildingClass: [],
        accessibility: {},
        features: {
          fiber: true,
          backupPower: true,
          loadingDock: true,
        },
        certifications: null,
      };

      const result = scoreBuilding(property, requirement);

      expect(result.score).toBe(65); // 50 base + 5 + 5 + 5
      expect(result.breakdown.featuresMet).toContain('fiber');
      expect(result.breakdown.featuresMet).toContain('backupPower');
      expect(result.breakdown.featuresMet).toContain('loadingDock');
      expect(result.breakdown.featuresMissing).toHaveLength(0);
    });

    it('should penalize half points for missing required features', () => {
      const property = createMockProperty({
        features: {
          fiber: false,
          backupPower: false,
          loadingDock: false,
          security24x7: false,
          secureAccess: false,
          scifCapable: false,
          dataCenter: false,
          cafeteria: false,
          fitnessCenter: false,
          conferenceCenter: false,
        },
      });

      const requirement: BuildingRequirement = {
        buildingClass: [],
        accessibility: {},
        features: {
          fiber: true,
          backupPower: true,
          loadingDock: true,
        },
        certifications: null,
      };

      const result = scoreBuilding(property, requirement);

      // 50 base - 3 (fiber) - 3 (backup) - 3 (loading) = 41
      expect(result.score).toBe(41);
      expect(result.breakdown.featuresMissing).toContain('fiber');
      expect(result.breakdown.featuresMissing).toContain('backupPower');
      expect(result.breakdown.featuresMissing).toContain('loadingDock');
      expect(result.breakdown.featuresMet).toHaveLength(0);
    });

    it('should award higher points for specialized features', () => {
      const property = createMockProperty({
        features: {
          fiber: false,
          backupPower: false,
          loadingDock: false,
          security24x7: false,
          secureAccess: false,
          scifCapable: true,
          dataCenter: true,
          cafeteria: false,
          fitnessCenter: false,
          conferenceCenter: false,
        },
      });

      const requirement: BuildingRequirement = {
        buildingClass: [],
        accessibility: {},
        features: {
          scifCapable: true, // 10 points
          dataCenter: true, // 10 points
        },
        certifications: null,
      };

      const result = scoreBuilding(property, requirement);

      expect(result.score).toBe(70); // 50 base + 10 + 10
      expect(result.breakdown.featuresMet).toContain('scifCapable');
      expect(result.breakdown.featuresMet).toContain('dataCenter');
    });

    it('should apply lower penalties for missing specialized features', () => {
      const property = createMockProperty({
        features: {
          fiber: false,
          backupPower: false,
          loadingDock: false,
          security24x7: false,
          secureAccess: false,
          scifCapable: false,
          dataCenter: false,
          cafeteria: false,
          fitnessCenter: false,
          conferenceCenter: false,
        },
      });

      const requirement: BuildingRequirement = {
        buildingClass: [],
        accessibility: {},
        features: {
          scifCapable: true, // -5 penalty (half of 10)
          dataCenter: true, // -5 penalty (half of 10)
        },
        certifications: null,
      };

      const result = scoreBuilding(property, requirement);

      expect(result.score).toBe(40); // 50 base - 5 - 5
    });

    it('should award low points for amenity features', () => {
      const property = createMockProperty({
        features: {
          fiber: false,
          backupPower: false,
          loadingDock: false,
          security24x7: false,
          secureAccess: false,
          scifCapable: false,
          dataCenter: false,
          cafeteria: true,
          fitnessCenter: true,
          conferenceCenter: true,
        },
      });

      const requirement: BuildingRequirement = {
        buildingClass: [],
        accessibility: {},
        features: {
          cafeteria: true, // 2 points
          fitnessCenter: true, // 2 points
          conferenceCenter: true, // 3 points
        },
        certifications: null,
      };

      const result = scoreBuilding(property, requirement);

      expect(result.score).toBe(57); // 50 base + 2 + 2 + 3
    });

    it('should not score features if none required', () => {
      const property = createMockProperty({
        features: {
          fiber: true,
          backupPower: true,
          loadingDock: true,
          security24x7: true,
          secureAccess: true,
          scifCapable: true,
          dataCenter: true,
          cafeteria: true,
          fitnessCenter: true,
          conferenceCenter: true,
        },
      });

      const requirement: BuildingRequirement = {
        buildingClass: [],
        accessibility: {},
        features: {},
        certifications: null,
      };

      const result = scoreBuilding(property, requirement);

      expect(result.score).toBe(50); // Base score only
    });
  });

  describe('Certification Matching', () => {
    it('should award 5 points for each matching certification', () => {
      const property = createMockProperty({
        certifications: ['LEED Gold', 'Energy Star', 'BOMA 360'],
      });

      const requirement: BuildingRequirement = {
        buildingClass: [],
        accessibility: {},
        features: {},
        certifications: ['LEED', 'Energy Star'],
      };

      const result = scoreBuilding(property, requirement);

      expect(result.score).toBe(60); // 50 base + 5 + 5
      expect(result.breakdown.certificationsMet).toContain('LEED');
      expect(result.breakdown.certificationsMet).toContain('Energy Star');
    });

    it('should handle case-insensitive certification matching', () => {
      const property = createMockProperty({
        certifications: ['leed gold', 'energy star'],
      });

      const requirement: BuildingRequirement = {
        buildingClass: [],
        accessibility: {},
        features: {},
        certifications: ['LEED', 'ENERGY STAR'],
      };

      const result = scoreBuilding(property, requirement);

      expect(result.score).toBe(60);
      expect(result.breakdown.certificationsMet).toHaveLength(2);
    });

    it('should handle partial certification name matches', () => {
      const property = createMockProperty({
        certifications: ['LEED Silver Certified'],
      });

      const requirement: BuildingRequirement = {
        buildingClass: [],
        accessibility: {},
        features: {},
        certifications: ['LEED'],
      };

      const result = scoreBuilding(property, requirement);

      expect(result.score).toBe(55);
      expect(result.breakdown.certificationsMet).toContain('LEED');
    });

    it('should track missing certifications without penalty', () => {
      const property = createMockProperty({
        certifications: ['Energy Star'],
      });

      const requirement: BuildingRequirement = {
        buildingClass: [],
        accessibility: {},
        features: {},
        certifications: ['LEED', 'Energy Star', 'BOMA 360'],
      };

      const result = scoreBuilding(property, requirement);

      expect(result.score).toBe(55); // 50 base + 5 for Energy Star
      expect(result.breakdown.certificationsMet).toContain('Energy Star');
      expect(result.breakdown.certificationsMissing).toContain('LEED');
      expect(result.breakdown.certificationsMissing).toContain('BOMA 360');
    });

    it('should handle null certifications gracefully', () => {
      const property = createMockProperty({ certifications: null as any });
      const requirement: BuildingRequirement = {
        buildingClass: [],
        accessibility: {},
        features: {},
        certifications: ['LEED'],
      };

      const result = scoreBuilding(property, requirement);

      // When property.certifications is null, the certification block is skipped entirely
      expect(result.score).toBe(50);
      expect(result.breakdown.certificationsMet).toHaveLength(0);
      expect(result.breakdown.certificationsMissing).toHaveLength(0);
    });
  });

  describe('Combined Scoring', () => {
    it('should calculate correct score for perfect match', () => {
      const property = createMockProperty({
        buildingClass: 'A',
        adaCompliant: true,
        publicTransitAccess: true,
        features: {
          fiber: true,
          backupPower: true,
          loadingDock: true,
          security24x7: true,
          secureAccess: true,
          scifCapable: true,
          dataCenter: false,
          cafeteria: true,
          fitnessCenter: false,
          conferenceCenter: false,
        },
        certifications: ['LEED Gold', 'Energy Star'],
      });

      const requirement: BuildingRequirement = {
        buildingClass: ['A'],
        accessibility: { adaCompliant: true, publicTransit: true },
        features: {
          fiber: true,
          backupPower: true,
          security24x7: true,
          scifCapable: true,
        },
        certifications: ['LEED', 'Energy Star'],
      };

      const result = scoreBuilding(property, requirement);

      // 50 base + 20 (class A) + 5 (fiber) + 5 (backup) + 5 (security) + 10 (scif) + 5 (LEED) + 5 (Energy Star) = 105 -> capped at 100
      expect(result.score).toBe(100);
      expect(result.breakdown.classMatch).toBe(true);
      expect(result.breakdown.accessibilityMet).toBe(true);
      expect(result.breakdown.featuresMet.length).toBeGreaterThan(0);
      expect(result.breakdown.certificationsMet.length).toBe(2);
    });

    it('should cap maximum score at 100', () => {
      const property = createMockProperty({
        buildingClass: 'A+',
        features: {
          fiber: true,
          backupPower: true,
          loadingDock: true,
          security24x7: true,
          secureAccess: true,
          scifCapable: true,
          dataCenter: true,
          cafeteria: true,
          fitnessCenter: true,
          conferenceCenter: true,
        },
        certifications: ['LEED Gold', 'Energy Star', 'BOMA 360', 'WELL Certified'],
      });

      const requirement: BuildingRequirement = {
        buildingClass: ['A'],
        accessibility: {},
        features: {
          fiber: true,
          backupPower: true,
          scifCapable: true,
          dataCenter: true,
        },
        certifications: ['LEED', 'Energy Star', 'BOMA', 'WELL'],
      };

      const result = scoreBuilding(property, requirement);

      expect(result.score).toBe(100);
    });

    it('should enforce minimum score of 0', () => {
      const property = createMockProperty({
        buildingClass: 'C',
        adaCompliant: false,
        publicTransitAccess: false,
        features: {
          fiber: false,
          backupPower: false,
          loadingDock: false,
          security24x7: false,
          secureAccess: false,
          scifCapable: false,
          dataCenter: false,
          cafeteria: false,
          fitnessCenter: false,
          conferenceCenter: false,
        },
        certifications: [],
      });

      const requirement: BuildingRequirement = {
        buildingClass: ['A', 'B'],
        accessibility: { adaCompliant: true, publicTransit: true },
        features: {
          fiber: true,
          backupPower: true,
          scifCapable: true,
          dataCenter: true,
        },
        certifications: ['LEED', 'Energy Star'],
      };

      const result = scoreBuilding(property, requirement);

      expect(result.score).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Breakdown Information', () => {
    it('should provide detailed breakdown', () => {
      const property = createMockProperty();
      const requirement: BuildingRequirement = {
        buildingClass: ['A'],
        accessibility: { adaCompliant: true },
        features: { fiber: true },
        certifications: ['LEED'],
      };

      const result = scoreBuilding(property, requirement);

      expect(result.breakdown).toHaveProperty('classMatch');
      expect(result.breakdown).toHaveProperty('accessibilityMet');
      expect(result.breakdown).toHaveProperty('featuresMet');
      expect(result.breakdown).toHaveProperty('featuresMissing');
      expect(result.breakdown).toHaveProperty('certificationsMet');
      expect(result.breakdown).toHaveProperty('certificationsMissing');
      expect(result.breakdown).toHaveProperty('notes');
      expect(Array.isArray(result.breakdown.notes)).toBe(true);
    });

    it('should include helpful notes', () => {
      const property = createMockProperty({
        buildingClass: 'B',
        features: {
          fiber: true,
          backupPower: false,
          loadingDock: false,
          security24x7: false,
          secureAccess: false,
          scifCapable: false,
          dataCenter: false,
          cafeteria: false,
          fitnessCenter: false,
          conferenceCenter: false,
        },
      });

      const requirement: BuildingRequirement = {
        buildingClass: ['A', 'B'],
        accessibility: {},
        features: { fiber: true },
        certifications: null,
      };

      const result = scoreBuilding(property, requirement);

      expect(result.breakdown.notes.length).toBeGreaterThan(0);
      expect(result.breakdown.notes).toContain('Class B - acceptable');
    });
  });
});
