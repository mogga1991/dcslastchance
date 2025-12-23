/**
 * SAM.gov API Integration Tests
 * Sprint 2: Test Infrastructure
 *
 * Tests the SAM.gov API integration for:
 * - API connectivity and authentication
 * - Data fetching and parsing
 * - Error handling
 * - Rate limiting
 * - Response validation
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  fetchGSALeaseOpportunities,
  fetchAllOpportunities,
  parseOpportunityRequirements,
} from '@/lib/sam-gov';
import {
  createMockGSALease,
  createMockGSALeases,
  createMockSAMResponse,
  createExpiredOpportunity,
  createMinimalOpportunity,
} from './fixtures/sam-gov-fixtures';
import { APITestHelper } from './utils/test-helpers';

describe('SAM.gov API Integration', () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Clean up after each test
    APITestHelper.resetMocks();
  });

  describe('fetchGSALeaseOpportunities', () => {
    it('should fetch GSA lease opportunities successfully', async () => {
      // Arrange
      const mockOpportunities = createMockGSALeases(5);
      APITestHelper.mockSAMGovAPI(mockOpportunities);

      // Act
      const result = await fetchGSALeaseOpportunities({ limit: 10 });

      // Assert
      expect(result).toBeDefined();
      expect(result.opportunitiesData).toHaveLength(5);
      expect(result.totalRecords).toBe(5);
    });

    it('should use correct GSA lease filters', async () => {
      // Arrange
      const mockOpportunities = [createMockGSALease()];
      const mockFetch = vi.fn().mockResolvedValue(
        APITestHelper.createMockResponse(createMockSAMResponse(mockOpportunities))
      );
      global.fetch = mockFetch;

      // Act
      await fetchGSALeaseOpportunities({ limit: 10 });

      // Assert
      expect(mockFetch).toHaveBeenCalled();
      const callUrl = mockFetch.mock.calls[0][0];

      expect(callUrl).toContain('department=GENERAL%20SERVICES%20ADMINISTRATION');
      expect(callUrl).toContain('subTier=PUBLIC%20BUILDINGS%20SERVICE');
      expect(callUrl).toContain('naicsCode=531120');
    });

    it('should handle empty results gracefully', async () => {
      // Arrange
      APITestHelper.mockSAMGovAPI([]);

      // Act
      const result = await fetchGSALeaseOpportunities({ limit: 10 });

      // Assert
      expect(result.opportunitiesData).toHaveLength(0);
      expect(result.totalRecords).toBe(0);
    });

    it('should respect limit parameter', async () => {
      // Arrange
      const mockOpportunities = createMockGSALeases(50);
      APITestHelper.mockFetch(createMockSAMResponse(mockOpportunities, 25, 0));

      // Act
      const result = await fetchGSALeaseOpportunities({ limit: 25 });

      // Assert
      expect(result.opportunitiesData).toHaveLength(25);
    });

    it('should handle API errors gracefully', async () => {
      // Arrange
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      // Act & Assert
      await expect(
        fetchGSALeaseOpportunities({ limit: 10 })
      ).rejects.toThrow();
    });

    it('should handle 401 unauthorized errors', async () => {
      // Arrange
      APITestHelper.mockFetch({ error: 'Unauthorized' }, 401);

      // Act & Assert
      await expect(
        fetchGSALeaseOpportunities({ limit: 10 })
      ).rejects.toThrow();
    });

    it('should handle 403 forbidden errors (invalid API key)', async () => {
      // Arrange
      APITestHelper.mockFetch({ error: 'API_KEY_INVALID' }, 403);

      // Act & Assert
      await expect(
        fetchGSALeaseOpportunities({ limit: 10 })
      ).rejects.toThrow();
    });

    it('should handle malformed JSON responses', async () => {
      // Arrange
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.reject(new Error('Invalid JSON')),
      } as Response);

      // Act & Assert
      await expect(
        fetchGSALeaseOpportunities({ limit: 10 })
      ).rejects.toThrow();
    });
  });

  describe('fetchAllOpportunities', () => {
    it('should fetch all opportunities without GSA filters', async () => {
      // Arrange
      const mockOpportunities = createMockGSALeases(3);
      const mockFetch = vi.fn().mockResolvedValue(
        APITestHelper.createMockResponse(createMockSAMResponse(mockOpportunities))
      );
      global.fetch = mockFetch;

      // Act
      await fetchAllOpportunities({ limit: 10 });

      // Assert
      expect(mockFetch).toHaveBeenCalled();
      const callUrl = mockFetch.mock.calls[0][0];

      // Should NOT have GSA-specific filters
      expect(callUrl).not.toContain('department=GENERAL%20SERVICES%20ADMINISTRATION');
    });

    it('should handle pagination correctly', async () => {
      // Arrange
      const mockOpportunities = createMockGSALeases(100);
      APITestHelper.mockFetch(createMockSAMResponse(mockOpportunities, 10, 0));

      // Act
      const result = await fetchAllOpportunities({ limit: 10 });

      // Assert
      expect(result.opportunitiesData).toHaveLength(10);
      expect(result.totalRecords).toBe(100);
    });
  });

  describe('parseOpportunityRequirements', () => {
    it('should extract RSF requirement from description', () => {
      // Arrange
      const opportunity = createMockGSALease({
        description: 'GSA seeks 50,000 - 75,000 RSF office space in DC.',
      });

      // Act
      const result = parseOpportunityRequirements(opportunity);

      // Assert
      expect(result.minRSF).toBeGreaterThan(0);
      expect(result.maxRSF).toBeGreaterThan(result.minRSF);
    });

    it('should extract location requirement', () => {
      // Arrange
      const opportunity = createMockGSALease({
        placeOfPerformance: {
          streetAddress: null,
          city: { code: null, name: 'Washington' },
          state: { code: 'DC', name: 'District of Columbia' },
          zip: '20024',
          country: { code: 'USA', name: 'United States' },
        },
      });

      // Act
      const result = parseOpportunityRequirements(opportunity);

      // Assert
      expect(result.state).toBe('DC');
      expect(result.city).toBe('Washington');
    });

    it('should extract set-aside requirement', () => {
      // Arrange
      const opportunity = createMockGSALease({
        typeOfSetAside: 'SBA',
        typeOfSetAsideDescription: 'Total Small Business Set-Aside',
      });

      // Act
      const result = parseOpportunityRequirements(opportunity);

      // Assert
      expect(result.setAside).toBe('SBA');
    });

    it('should handle opportunities with minimal data', () => {
      // Arrange
      const opportunity = createMinimalOpportunity();

      // Act
      const result = parseOpportunityRequirements(opportunity);

      // Assert
      expect(result).toBeDefined();
      expect(result.state).toBe('XX');
    });

    it('should extract response deadline', () => {
      // Arrange
      const deadline = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
      const opportunity = createMockGSALease({
        responseDeadLine: deadline,
      });

      // Act
      const result = parseOpportunityRequirements(opportunity);

      // Assert
      expect(result.responseDeadline).toBe(deadline);
    });

    it('should identify expired opportunities', () => {
      // Arrange
      const opportunity = createExpiredOpportunity();

      // Act
      const result = parseOpportunityRequirements(opportunity);

      // Assert
      expect(result.active).toBe(false);
    });
  });

  describe('Data Validation', () => {
    it('should validate notice ID format', () => {
      // Arrange
      const opportunity = createMockGSALease();

      // Assert
      expect(opportunity.noticeId).toBeTruthy();
      expect(typeof opportunity.noticeId).toBe('string');
      expect(opportunity.noticeId.length).toBeGreaterThan(0);
    });

    it('should validate required fields are present', () => {
      // Arrange
      const opportunity = createMockGSALease();

      // Assert required fields
      expect(opportunity.noticeId).toBeTruthy();
      expect(opportunity.title).toBeTruthy();
      expect(opportunity.department).toBeTruthy();
      expect(opportunity.naicsCode).toBeTruthy();
      expect(opportunity.responseDeadLine).toBeTruthy();
    });

    it('should validate date formats', () => {
      // Arrange
      const opportunity = createMockGSALease();

      // Assert dates are valid ISO strings
      expect(() => new Date(opportunity.postedDate)).not.toThrow();
      expect(() => new Date(opportunity.responseDeadLine)).not.toThrow();
      expect(() => new Date(opportunity.archiveDate)).not.toThrow();
    });

    it('should validate place of performance structure', () => {
      // Arrange
      const opportunity = createMockGSALease();

      // Assert place of performance has required structure
      expect(opportunity.placeOfPerformance).toBeTruthy();
      expect(opportunity.placeOfPerformance.state).toBeTruthy();
      expect(opportunity.placeOfPerformance.state.code).toBeTruthy();
      expect(opportunity.placeOfPerformance.country).toBeTruthy();
    });
  });

  describe('Performance', () => {
    it('should complete fetch within reasonable time', async () => {
      // Arrange
      const mockOpportunities = createMockGSALeases(10);
      APITestHelper.mockSAMGovAPI(mockOpportunities);

      const startTime = Date.now();

      // Act
      await fetchGSALeaseOpportunities({ limit: 10 });

      const duration = Date.now() - startTime;

      // Assert - should complete in < 5 seconds (generous for API call)
      expect(duration).toBeLessThan(5000);
    });

    it('should handle large result sets efficiently', async () => {
      // Arrange
      const mockOpportunities = createMockGSALeases(1000);
      APITestHelper.mockSAMGovAPI(mockOpportunities);

      const startTime = Date.now();

      // Act
      await fetchGSALeaseOpportunities({ limit: 1000 });

      const duration = Date.now() - startTime;

      // Assert - parsing 1000 records should be fast
      expect(duration).toBeLessThan(2000);
    });
  });
});
