// Scoring system types for matching broker properties to government opportunities

export interface LocationRequirement {
  city: string | null;
  state: string;
  zip: string | null;
  delineatedArea: string | null;
  radiusMiles: number | null;
  centralPoint: { lat: number; lng: number } | null;
}

export interface LocationBreakdown {
  stateMatch: boolean;
  cityMatch: boolean;
  withinDelineatedArea: boolean;
  distanceMiles: number | null;
  notes: string[];
}

export interface SpaceRequirement {
  minSqFt: number | null;
  maxSqFt: number | null;
  targetSqFt: number | null;
  usableOrRentable: 'usable' | 'rentable' | null;
  contiguous: boolean;
  divisible: boolean;
}

export interface PropertySpace {
  totalSqFt: number;
  availableSqFt: number;
  usableSqFt: number | null;
  minDivisibleSqFt: number | null;
  isContiguous: boolean;
}

export interface SpaceBreakdown {
  meetsMinimum: boolean;
  meetsMaximum: boolean;
  meetsContiguous: boolean;
  availableSqFt: number;
  requiredSqFt: number | null;
  variance: number | null;
  variancePercent: number | null;
  notes: string[];
}

export interface BuildingRequirement {
  buildingClass: ('A' | 'A+' | 'B' | 'C')[];  // Added A+ for premium buildings
  minFloors: number | null;
  maxFloors: number | null;
  preferredFloor: number | null;
  accessibility: {
    adaCompliant: boolean;
    publicTransit: boolean;
    parkingRequired: boolean;
  };
  features: {
    fiber: boolean;
    backupPower: boolean;
    loadingDock: boolean;
    security24x7: boolean;
    secureAccess: boolean;
    scifCapable: boolean;
    dataCenter: boolean;
    cafeteria: boolean;
    fitnessCenter: boolean;
    conferenceCenter: boolean;
  };
  certifications: string[];
}

export interface PropertyBuilding {
  buildingClass: 'A' | 'A+' | 'B' | 'C';
  totalFloors: number;
  availableFloors: number[];
  adaCompliant: boolean;
  publicTransitAccess: boolean;
  parkingSpaces: number;
  parkingRatio: number;
  features: {
    fiber: boolean;
    backupPower: boolean;
    loadingDock: boolean;
    security24x7: boolean;
    secureAccess: boolean;
    scifCapable: boolean;
    dataCenter: boolean;
    cafeteria: boolean;
    fitnessCenter: boolean;
    conferenceCenter: boolean;
  };
  certifications: string[];
}

export interface BuildingBreakdown {
  classMatch: boolean;
  accessibilityMet: boolean;
  featuresMet: string[];
  featuresMissing: string[];
  certificationsMet: string[];
  certificationsMissing: string[];
  notes: string[];
}

export interface TimelineRequirement {
  occupancyDate: Date;
  firmTermMonths: number | null;
  totalTermMonths: number | null;
  responseDeadline: Date;
}

export interface PropertyTimeline {
  availableDate: Date | null;
  minLeaseTermMonths: number | null;
  maxLeaseTermMonths: number | null;
  buildOutWeeksNeeded: number;
}

export interface TimelineBreakdown {
  availableOnTime: boolean;
  leaseTermCompatible: boolean;
  daysUntilAvailable: number | null;
  daysBeforeOccupancy: number | null;
  notes: string[];
}

export interface ExperienceProfile {
  governmentLeaseExperience: boolean;
  governmentLeasesCount: number;
  gsa_certified: boolean;
  yearsInBusiness: number;
  totalPortfolioSqFt: number;
  references: {
    agency: string;
    contractValue: number;
    year: number;
  }[];
  willingToBuildToSuit: boolean;
  willingToProvideImprovements: boolean;
}

export interface ExperienceBreakdown {
  hasGovExperience: boolean;
  gsaCertified: boolean;
  referencesCount: number;
  flexibility: string[];
  notes: string[];
}

export interface CategoryScore<T> {
  score: number;
  weight: number;
  weighted: number;
  breakdown: T;
}

// NEW: Factor score with name and details (for UI component)
export interface FactorScore<T> {
  name: string;
  score: number;
  weight: number;
  weighted: number;
  details: T;
}

export interface MatchScoreResult {
  overallScore: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  competitive: boolean;
  qualified: boolean;

  // NEW FORMAT: factors instead of categoryScores
  factors: {
    location: FactorScore<LocationBreakdown>;
    space: FactorScore<SpaceBreakdown>;
    building: FactorScore<BuildingBreakdown>;
    timeline: FactorScore<TimelineBreakdown>;
    experience: FactorScore<ExperienceBreakdown>;
  };

  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  disqualifiers: string[];
}
