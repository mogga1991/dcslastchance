// Mock scoring data generator for broker properties
// This generates realistic match scores for demonstration
// In production, replace with real opportunity matching

import { calculateMatchScore } from './calculate-match-score';
import type { MatchScoreResult } from './types';

export function generateMockPropertyScore(propertyId: string): MatchScoreResult {
  // Mock property data based on the broker listings
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mockProperties: Record<string, any> = {
    '1': {
      // Capitol Gateway Office Plaza
      location: {
        city: 'Washington',
        state: 'DC',
        lat: 38.9072,
        lng: -77.0369,
      },
      space: {
        totalSqFt: 45000,
        availableSqFt: 45000,
        usableSqFt: 42000,
        minDivisibleSqFt: 15000,
        isContiguous: true,
      },
      building: {
        buildingClass: 'A+' as const,
        totalFloors: 12,
        availableFloors: [8, 9, 10],
        adaCompliant: true,
        publicTransitAccess: true,
        parkingSpaces: 200,
        parkingRatio: 4.4,
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
        certifications: ['LEED Platinum', 'Energy Star'],
      },
      timeline: {
        availableDate: new Date('2025-02-01'),
        minLeaseTermMonths: 36,
        maxLeaseTermMonths: 240,
        buildOutWeeksNeeded: 8,
      },
    },
    '2': {
      // Pentagon City Executive Tower
      location: {
        city: 'Arlington',
        state: 'VA',
        lat: 38.8644,
        lng: -77.0594,
      },
      space: {
        totalSqFt: 112000,
        availableSqFt: 112000,
        usableSqFt: 105000,
        minDivisibleSqFt: 25000,
        isContiguous: true,
      },
      building: {
        buildingClass: 'A+' as const,
        totalFloors: 18,
        availableFloors: [12, 13, 14, 15],
        adaCompliant: true,
        publicTransitAccess: true,
        parkingSpaces: 450,
        parkingRatio: 4.0,
        features: {
          fiber: true,
          backupPower: true,
          loadingDock: true,
          security24x7: true,
          secureAccess: true,
          scifCapable: false,
          dataCenter: true,
          cafeteria: true,
          fitnessCenter: true,
          conferenceCenter: true,
        },
        certifications: ['LEED Platinum', 'Energy Star'],
      },
      timeline: {
        availableDate: new Date('2025-04-01'),
        minLeaseTermMonths: 60,
        maxLeaseTermMonths: 180,
        buildOutWeeksNeeded: 12,
      },
    },
  };

  // Mock government opportunity requirements
  const mockOpportunity = {
    location: {
      city: 'Washington',
      state: 'DC',
      zip: '20004',
      delineatedArea: 'Within 5 miles of downtown DC',
      radiusMiles: 5,
      centralPoint: { lat: 38.9072, lng: -77.0369 },
    },
    space: {
      minSqFt: 40000,
      maxSqFt: 120000,
      targetSqFt: 50000,
      usableOrRentable: 'usable' as const,
      contiguous: true,
      divisible: false,
    },
    building: {
      buildingClass: ['A', 'B'] as ('A' | 'B' | 'C')[],
      minFloors: null,
      maxFloors: null,
      preferredFloor: null,
      accessibility: {
        adaCompliant: true,
        publicTransit: true,
        parkingRequired: true,
      },
      features: {
        fiber: true,
        backupPower: true,
        loadingDock: false,
        security24x7: true,
        secureAccess: true,
        scifCapable: false,
        dataCenter: false,
        cafeteria: false,
        fitnessCenter: false,
        conferenceCenter: true,
      },
      certifications: ['LEED Gold', 'Energy Star'],
    },
    timeline: {
      occupancyDate: new Date('2025-06-01'),
      firmTermMonths: 120,
      totalTermMonths: 240,
      responseDeadline: new Date('2025-01-15'),
    },
  };

  // Mock broker experience profile
  const mockBrokerExperience = {
    governmentLeaseExperience: true,
    governmentLeasesCount: 8,
    gsa_certified: true,
    yearsInBusiness: 15,
    totalPortfolioSqFt: 5000000,
    references: [
      { agency: 'GSA', contractValue: 5000000, year: 2023 },
      { agency: 'DOD', contractValue: 3500000, year: 2022 },
      { agency: 'DHS', contractValue: 4200000, year: 2024 },
    ],
    willingToBuildToSuit: true,
    willingToProvideImprovements: true,
  };

  const propertyData = mockProperties[propertyId] || mockProperties['1'];

  return calculateMatchScore(
    propertyData,
    mockBrokerExperience,
    mockOpportunity
  );
}

export function getMockOpportunityTitle(): string {
  return 'GSA - Federal Office Space Lease - Washington DC Metro';
}
