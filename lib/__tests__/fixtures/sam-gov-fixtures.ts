/**
 * SAM.gov API Test Fixtures
 * Sprint 2: Comprehensive test data for SAM.gov integration tests
 */

import type { SAMOpportunity } from '@/lib/sam-gov';

/**
 * Create a mock GSA lease opportunity
 */
export function createMockGSALease(overrides: Partial<SAMOpportunity> = {}): SAMOpportunity {
  return {
    noticeId: `TEST-LEASE-${Math.random().toString(36).substring(7)}`,
    title: 'Office Space Lease - Washington DC',
    solicitationNumber: 'GS-11P-24-ABC-1234',
    department: 'GENERAL SERVICES ADMINISTRATION',
    subTier: 'PUBLIC BUILDINGS SERVICE',
    office: 'PBS - REGION 11',
    postedDate: new Date().toISOString(),
    type: 'Combined Synopsis/Solicitation',
    baseType: 'Presolicitation',
    archiveType: 'auto30',
    archiveDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    typeOfSetAsideDescription: 'Total Small Business Set-Aside (FAR 19.5)',
    typeOfSetAside: 'SBA',
    responseDeadLine: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    naicsCode: '531120',
    naicsCodes: ['531120'],
    classificationCode: 'X',
    active: 'Yes',
    award: null,
    pointOfContact: [
      {
        fax: null,
        type: 'primary',
        email: 'test.contact@gsa.gov',
        phone: '202-555-0100',
        title: null,
        fullName: 'Jane Smith, Contracting Officer',
      },
    ],
    description: `GSA is seeking commercial office space in downtown Washington, DC.

    Requirements:
    - Location: Must be within DC city limits
    - Size: 50,000 - 75,000 RSF
    - Lease Term: 10 years firm
    - Move-in: Within 180 days of award
    - Security: Level 4 facility security required
    - Parking: Minimum 100 spaces
    - ADA Compliance: Full accessibility required`,
    organizationType: 'OFFICE',
    officeAddress: {
      zipcode: '20024',
      city: 'Washington',
      countryCode: 'USA',
      state: 'DC',
    },
    placeOfPerformance: {
      streetAddress: null,
      city: {
        code: null,
        name: 'Washington',
      },
      state: {
        code: 'DC',
        name: 'District of Columbia',
      },
      zip: '20024',
      country: {
        code: 'USA',
        name: 'United States',
      },
    },
    additionalInfoLink: null,
    uiLink: `https://sam.gov/opp/TEST-LEASE-${Math.random().toString(36).substring(7)}/view`,
    links: [],
    resourceLinks: [],
    ...overrides,
  };
}

/**
 * Create multiple mock GSA leases
 */
export function createMockGSALeases(count: number, overrides: Partial<SAMOpportunity> = {}): SAMOpportunity[] {
  return Array.from({ length: count }, (_, i) =>
    createMockGSALease({
      ...overrides,
      noticeId: `TEST-LEASE-${i + 1}`,
      solicitationNumber: `GS-11P-24-ABC-${1000 + i}`,
      title: `Office Space Lease ${i + 1} - ${['DC', 'VA', 'MD'][i % 3]}`,
    })
  );
}

/**
 * Create mock opportunity with specific characteristics
 */
export function createMockOpportunityWithRequirements(
  state: string,
  minRSF: number,
  maxRSF: number,
  setAside?: string
): SAMOpportunity {
  return createMockGSALease({
    title: `Office Space - ${state}`,
    placeOfPerformance: {
      streetAddress: null,
      city: {
        code: null,
        name: state === 'DC' ? 'Washington' : 'Arlington',
      },
      state: {
        code: state,
        name: state === 'DC' ? 'District of Columbia' : 'Virginia',
      },
      zip: state === 'DC' ? '20024' : '22202',
      country: {
        code: 'USA',
        name: 'United States',
      },
    },
    description: `
      GSA is seeking commercial office space.

      Requirements:
      - Location: ${state}
      - Size: ${minRSF.toLocaleString()} - ${maxRSF.toLocaleString()} RSF
      - Lease Term: 10 years firm
      ${setAside ? `- Set-Aside: ${setAside}` : ''}
    `,
    typeOfSetAside: setAside || null,
    typeOfSetAsideDescription: setAside ? `${setAside} Set-Aside` : null,
  });
}

/**
 * Mock SAM.gov API response structure
 */
export interface MockSAMResponse {
  opportunitiesData: SAMOpportunity[];
  totalRecords: number;
  limit: number;
  offset: number;
}

/**
 * Create mock SAM.gov API response
 */
export function createMockSAMResponse(
  opportunities: SAMOpportunity[],
  limit = 10,
  offset = 0
): MockSAMResponse {
  return {
    opportunitiesData: opportunities.slice(offset, offset + limit),
    totalRecords: opportunities.length,
    limit,
    offset,
  };
}

/**
 * Mock opportunity with parsing challenges (for error handling tests)
 */
export function createInvalidMockOpportunity(): Partial<SAMOpportunity> {
  return {
    noticeId: 'INVALID-NOTICE',
    title: '', // Missing required field
    // Missing other required fields
  };
}

/**
 * Mock expired opportunity
 */
export function createExpiredOpportunity(): SAMOpportunity {
  const pastDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  return createMockGSALease({
    responseDeadLine: pastDate,
    archiveDate: pastDate,
    active: 'No',
  });
}

/**
 * Mock opportunity with minimal data (for edge case testing)
 */
export function createMinimalOpportunity(): SAMOpportunity {
  return {
    noticeId: 'MINIMAL-001',
    title: 'Minimal Opportunity',
    solicitationNumber: 'MIN-001',
    department: 'TEST DEPARTMENT',
    subTier: null,
    office: null,
    postedDate: new Date().toISOString(),
    type: 'Solicitation',
    baseType: 'Solicitation',
    archiveType: 'auto30',
    archiveDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    typeOfSetAsideDescription: null,
    typeOfSetAside: null,
    responseDeadLine: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    naicsCode: '531120',
    naicsCodes: ['531120'],
    classificationCode: 'X',
    active: 'Yes',
    award: null,
    pointOfContact: [],
    description: 'Minimal description',
    organizationType: 'OFFICE',
    officeAddress: null,
    placeOfPerformance: {
      streetAddress: null,
      city: { code: null, name: 'Unknown' },
      state: { code: 'XX', name: 'Unknown' },
      zip: '00000',
      country: { code: 'USA', name: 'United States' },
    },
    additionalInfoLink: null,
    uiLink: 'https://sam.gov/opp/MINIMAL-001/view',
    links: [],
    resourceLinks: [],
  };
}
