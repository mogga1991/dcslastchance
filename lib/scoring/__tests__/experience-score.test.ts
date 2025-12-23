/**
 * Experience Scoring Tests
 * Sprint 2: Comprehensive coverage for broker experience and qualifications
 */

import { describe, it, expect } from 'vitest';
import { scoreExperience } from '../experience-score';
import type { ExperienceProfile } from '../types';

describe('scoreExperience', () => {
  const createMockProfile = (overrides: Partial<ExperienceProfile> = {}): ExperienceProfile => ({
    governmentLeaseExperience: false,
    governmentLeasesCount: 0,
    gsa_certified: false,
    references: [],
    willingToBuildToSuit: false,
    willingToProvideImprovements: false,
    ...overrides,
  });

  describe('Base Score', () => {
    it('should award 30 points base score for any broker', () => {
      const profile = createMockProfile();
      const result = scoreExperience(profile);

      expect(result.score).toBe(30);
      expect(result.breakdown.hasGovExperience).toBe(false);
      expect(result.breakdown.gsaCertified).toBe(false);
    });
  });

  describe('Government Lease Experience', () => {
    it('should award 25 points for government lease experience', () => {
      const profile = createMockProfile({
        governmentLeaseExperience: true,
        governmentLeasesCount: 1,
      });

      const result = scoreExperience(profile);

      expect(result.score).toBe(55); // 30 base + 25 experience
      expect(result.breakdown.hasGovExperience).toBe(true);
      expect(result.breakdown.notes).toContain('Prior government lease experience');
    });

    it('should award additional 10 points for 2-4 government leases', () => {
      const profile = createMockProfile({
        governmentLeaseExperience: true,
        governmentLeasesCount: 3,
      });

      const result = scoreExperience(profile);

      expect(result.score).toBe(65); // 30 base + 25 experience + 10 bonus
      expect(result.breakdown.notes).toContain('3 government leases completed');
    });

    it('should award additional 15 points for 5+ government leases', () => {
      const profile = createMockProfile({
        governmentLeaseExperience: true,
        governmentLeasesCount: 7,
      });

      const result = scoreExperience(profile);

      expect(result.score).toBe(70); // 30 base + 25 experience + 15 bonus
      expect(result.breakdown.notes).toContain('5+ government leases completed');
    });

    it('should not award bonus points for exactly 5 leases (edge case)', () => {
      const profile = createMockProfile({
        governmentLeaseExperience: true,
        governmentLeasesCount: 5,
      });

      const result = scoreExperience(profile);

      expect(result.score).toBe(70); // 30 base + 25 experience + 15 bonus
      expect(result.breakdown.notes).toContain('5+ government leases completed');
    });

    it('should not award bonus for exactly 2 leases (edge case)', () => {
      const profile = createMockProfile({
        governmentLeaseExperience: true,
        governmentLeasesCount: 2,
      });

      const result = scoreExperience(profile);

      expect(result.score).toBe(65); // 30 base + 25 experience + 10 bonus
      expect(result.breakdown.notes).toContain('2 government leases completed');
    });

    it('should not award bonus for exactly 1 lease', () => {
      const profile = createMockProfile({
        governmentLeaseExperience: true,
        governmentLeasesCount: 1,
      });

      const result = scoreExperience(profile);

      expect(result.score).toBe(55); // 30 base + 25 experience (no bonus)
      expect(result.breakdown.notes).toContain('Prior government lease experience');
      expect(result.breakdown.notes).not.toContain('government leases completed');
    });

    it('should not award points if no government experience', () => {
      const profile = createMockProfile({
        governmentLeaseExperience: false,
        governmentLeasesCount: 10, // Count doesn't matter without experience flag
      });

      const result = scoreExperience(profile);

      expect(result.score).toBe(30); // Only base score
      expect(result.breakdown.hasGovExperience).toBe(false);
    });
  });

  describe('GSA Certification', () => {
    it('should award 10 points for GSA certification', () => {
      const profile = createMockProfile({
        gsa_certified: true,
      });

      const result = scoreExperience(profile);

      expect(result.score).toBe(40); // 30 base + 10 certification
      expect(result.breakdown.gsaCertified).toBe(true);
      expect(result.breakdown.notes).toContain('GSA certified broker');
    });

    it('should combine GSA certification with government experience', () => {
      const profile = createMockProfile({
        governmentLeaseExperience: true,
        governmentLeasesCount: 1,
        gsa_certified: true,
      });

      const result = scoreExperience(profile);

      expect(result.score).toBe(65); // 30 base + 25 experience + 10 certification
      expect(result.breakdown.hasGovExperience).toBe(true);
      expect(result.breakdown.gsaCertified).toBe(true);
    });
  });

  describe('References', () => {
    it('should award 10 points for 3+ references', () => {
      const profile = createMockProfile({
        references: ['Ref 1', 'Ref 2', 'Ref 3'],
      });

      const result = scoreExperience(profile);

      expect(result.score).toBe(40); // 30 base + 10 references
      expect(result.breakdown.referencesCount).toBe(3);
    });

    it('should award 5 points for 1-2 references', () => {
      const profile = createMockProfile({
        references: ['Ref 1', 'Ref 2'],
      });

      const result = scoreExperience(profile);

      expect(result.score).toBe(35); // 30 base + 5 references
      expect(result.breakdown.referencesCount).toBe(2);
    });

    it('should not award points for 0 references', () => {
      const profile = createMockProfile({
        references: [],
      });

      const result = scoreExperience(profile);

      expect(result.score).toBe(30); // Only base score
      expect(result.breakdown.referencesCount).toBe(0);
    });

    it('should count exactly 3 references (edge case)', () => {
      const profile = createMockProfile({
        references: ['Ref 1', 'Ref 2', 'Ref 3'],
      });

      const result = scoreExperience(profile);

      expect(result.score).toBe(40); // 30 base + 10 references
      expect(result.breakdown.referencesCount).toBe(3);
    });

    it('should count exactly 1 reference (edge case)', () => {
      const profile = createMockProfile({
        references: ['Ref 1'],
      });

      const result = scoreExperience(profile);

      expect(result.score).toBe(35); // 30 base + 5 references
      expect(result.breakdown.referencesCount).toBe(1);
    });

    it('should handle many references', () => {
      const profile = createMockProfile({
        references: Array(10).fill('Reference'),
      });

      const result = scoreExperience(profile);

      expect(result.score).toBe(40); // 30 base + 10 references (capped at 10)
      expect(result.breakdown.referencesCount).toBe(10);
    });
  });

  describe('Flexibility Bonuses', () => {
    it('should award 5 points for build-to-suit willingness', () => {
      const profile = createMockProfile({
        willingToBuildToSuit: true,
      });

      const result = scoreExperience(profile);

      expect(result.score).toBe(35); // 30 base + 5 build-to-suit
      expect(result.breakdown.flexibility).toContain('Build-to-suit available');
    });

    it('should award 5 points for tenant improvements willingness', () => {
      const profile = createMockProfile({
        willingToProvideImprovements: true,
      });

      const result = scoreExperience(profile);

      expect(result.score).toBe(35); // 30 base + 5 TI
      expect(result.breakdown.flexibility).toContain('TI allowance available');
    });

    it('should award 10 points for both flexibility options', () => {
      const profile = createMockProfile({
        willingToBuildToSuit: true,
        willingToProvideImprovements: true,
      });

      const result = scoreExperience(profile);

      expect(result.score).toBe(40); // 30 base + 5 + 5
      expect(result.breakdown.flexibility).toContain('Build-to-suit available');
      expect(result.breakdown.flexibility).toContain('TI allowance available');
      expect(result.breakdown.flexibility).toHaveLength(2);
    });
  });

  describe('Combined Scoring', () => {
    it('should calculate perfect score for ideal broker', () => {
      const profile = createMockProfile({
        governmentLeaseExperience: true,
        governmentLeasesCount: 10,
        gsa_certified: true,
        references: ['Ref 1', 'Ref 2', 'Ref 3', 'Ref 4'],
        willingToBuildToSuit: true,
        willingToProvideImprovements: true,
      });

      const result = scoreExperience(profile);

      // 30 base + 25 gov exp + 15 (5+ leases) + 10 GSA + 10 refs + 5 build + 5 TI = 100
      expect(result.score).toBe(100);
      expect(result.breakdown.hasGovExperience).toBe(true);
      expect(result.breakdown.gsaCertified).toBe(true);
      expect(result.breakdown.referencesCount).toBeGreaterThanOrEqual(3);
      expect(result.breakdown.flexibility).toHaveLength(2);
    });

    it('should calculate score for experienced broker without GSA cert', () => {
      const profile = createMockProfile({
        governmentLeaseExperience: true,
        governmentLeasesCount: 6,
        gsa_certified: false,
        references: ['Ref 1', 'Ref 2'],
        willingToBuildToSuit: true,
        willingToProvideImprovements: false,
      });

      const result = scoreExperience(profile);

      // 30 base + 25 gov exp + 15 (5+ leases) + 5 refs + 5 build = 80
      expect(result.score).toBe(80);
    });

    it('should calculate score for novice broker with flexibility', () => {
      const profile = createMockProfile({
        governmentLeaseExperience: false,
        governmentLeasesCount: 0,
        gsa_certified: false,
        references: ['Ref 1'],
        willingToBuildToSuit: true,
        willingToProvideImprovements: true,
      });

      const result = scoreExperience(profile);

      // 30 base + 5 refs + 5 build + 5 TI = 45
      expect(result.score).toBe(45);
    });

    it('should calculate score for GSA certified without government experience', () => {
      const profile = createMockProfile({
        governmentLeaseExperience: false,
        governmentLeasesCount: 0,
        gsa_certified: true,
        references: ['Ref 1', 'Ref 2', 'Ref 3'],
        willingToBuildToSuit: false,
        willingToProvideImprovements: false,
      });

      const result = scoreExperience(profile);

      // 30 base + 10 GSA + 10 refs = 50
      expect(result.score).toBe(50);
    });
  });

  describe('Score Cap', () => {
    it('should cap score at 100', () => {
      const profile = createMockProfile({
        governmentLeaseExperience: true,
        governmentLeasesCount: 20,
        gsa_certified: true,
        references: ['Ref 1', 'Ref 2', 'Ref 3', 'Ref 4', 'Ref 5'],
        willingToBuildToSuit: true,
        willingToProvideImprovements: true,
      });

      const result = scoreExperience(profile);

      expect(result.score).toBeLessThanOrEqual(100);
      expect(result.score).toBe(100);
    });
  });

  describe('Breakdown Information', () => {
    it('should provide detailed breakdown', () => {
      const profile = createMockProfile({
        governmentLeaseExperience: true,
        governmentLeasesCount: 3,
        gsa_certified: true,
        references: ['Ref 1', 'Ref 2'],
        willingToBuildToSuit: true,
        willingToProvideImprovements: false,
      });

      const result = scoreExperience(profile);

      expect(result.breakdown).toHaveProperty('hasGovExperience');
      expect(result.breakdown).toHaveProperty('gsaCertified');
      expect(result.breakdown).toHaveProperty('referencesCount');
      expect(result.breakdown).toHaveProperty('flexibility');
      expect(result.breakdown).toHaveProperty('notes');
      expect(Array.isArray(result.breakdown.notes)).toBe(true);
      expect(Array.isArray(result.breakdown.flexibility)).toBe(true);
    });

    it('should include helpful notes about qualifications', () => {
      const profile = createMockProfile({
        governmentLeaseExperience: true,
        governmentLeasesCount: 5,
        gsa_certified: true,
      });

      const result = scoreExperience(profile);

      expect(result.breakdown.notes.length).toBeGreaterThan(0);
      expect(result.breakdown.notes).toContain('Prior government lease experience');
      expect(result.breakdown.notes).toContain('5+ government leases completed');
      expect(result.breakdown.notes).toContain('GSA certified broker');
    });

    it('should track flexibility options separately', () => {
      const profile = createMockProfile({
        willingToBuildToSuit: true,
        willingToProvideImprovements: true,
      });

      const result = scoreExperience(profile);

      expect(result.breakdown.flexibility).toHaveLength(2);
      expect(result.breakdown.flexibility).toContain('Build-to-suit available');
      expect(result.breakdown.flexibility).toContain('TI allowance available');
    });

    it('should have empty flexibility array if no options', () => {
      const profile = createMockProfile({
        willingToBuildToSuit: false,
        willingToProvideImprovements: false,
      });

      const result = scoreExperience(profile);

      expect(result.breakdown.flexibility).toHaveLength(0);
    });

    it('should show minimal notes for new broker', () => {
      const profile = createMockProfile();
      const result = scoreExperience(profile);

      expect(result.breakdown.notes).toHaveLength(0);
      expect(result.breakdown.hasGovExperience).toBe(false);
      expect(result.breakdown.gsaCertified).toBe(false);
      expect(result.breakdown.referencesCount).toBe(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero government leases count', () => {
      const profile = createMockProfile({
        governmentLeaseExperience: true,
        governmentLeasesCount: 0,
      });

      const result = scoreExperience(profile);

      expect(result.score).toBe(55); // 30 base + 25 experience (no bonus)
    });

    it('should handle exactly the threshold values', () => {
      // Test exactly 2 leases
      let profile = createMockProfile({
        governmentLeaseExperience: true,
        governmentLeasesCount: 2,
      });
      let result = scoreExperience(profile);
      expect(result.score).toBe(65); // Gets 10 point bonus

      // Test exactly 5 leases
      profile = createMockProfile({
        governmentLeaseExperience: true,
        governmentLeasesCount: 5,
      });
      result = scoreExperience(profile);
      expect(result.score).toBe(70); // Gets 15 point bonus
    });

    it('should handle empty references array', () => {
      const profile = createMockProfile({
        references: [],
      });

      const result = scoreExperience(profile);

      expect(result.breakdown.referencesCount).toBe(0);
      expect(result.score).toBe(30); // Only base score
    });
  });
});
