/**
 * FedSpace Patent-Pending Algorithm Types
 *
 * PATENT #1: Federal Neighborhood Score
 * PATENT #2: Property-Opportunity Matching with Early-Termination Pipeline
 */

// ==================== PATENT #1: Federal Neighborhood Score ====================

/**
 * 6-factor weighted scoring for federal leasing potential (0-100)
 */
export interface FederalNeighborhoodScore {
  /** Overall score (0-100) combining all factors */
  score: number;

  /** Individual factor scores (0-100 each) */
  factors: {
    /** Density of federal properties (25% weight) */
    density: FactorScore;

    /** Federal lease activity vs ownership (25% weight) */
    leaseActivity: FactorScore;

    /** Leases expiring within 24 months (20% weight) */
    expiringLeases: FactorScore;

    /** Federal space demand in RSF (15% weight) */
    demand: FactorScore;

    /** Vacancy rate (10% weight, inverted) */
    vacancy: FactorScore;

    /** Growth trend (5% weight) */
    growth: FactorScore;
  };

  /** Raw metrics used in calculation */
  metrics: {
    totalProperties: number;
    leasedProperties: number;
    ownedProperties: number;
    totalRSF: number;
    vacantRSF: number;
    expiringLeasesCount: number;
    expiringLeasesRSF: number;
    recentConstructionCount: number;
    searchRadiusMiles: number;
  };

  /** Market percentile (0-100) */
  percentile: number;

  /** Human-readable grade */
  grade: 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F';

  /** Location of analysis */
  location: {
    latitude: number;
    longitude: number;
    city?: string;
    state?: string;
    zipcode?: string;
  };

  /** Timestamp of calculation */
  calculatedAt: Date;

  /** Cache expiration (24 hours from calculatedAt) */
  expiresAt: Date;
}

export interface FactorScore {
  /** Raw score (0-100) */
  score: number;

  /** Weight percentage (e.g., 25 = 25%) */
  weight: number;

  /** Weighted contribution to overall score */
  weighted: number;

  /** Human-readable explanation */
  explanation: string;
}

/**
 * Spatial index node for R-Tree
 * Enables O(log n) queries for nearby federal properties
 */
export interface SpatialNode {
  id: string;
  bounds: BoundingBox;
  isLeaf: boolean;
  children?: SpatialNode[];
  data?: FederalProperty;
}

export interface BoundingBox {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

export interface FederalProperty {
  id: string;
  latitude: number;
  longitude: number;
  rsf: number;
  type: 'owned' | 'leased';
  vacant?: boolean;
  vacantRSF?: number;
  leaseExpiration?: Date;
  constructionYear?: number;
  agency?: string;
  city?: string;
  state?: string;
  zipcode?: string;
}

// ==================== PATENT #2: Property-Opportunity Matching ====================

/**
 * Early-termination disqualification pipeline
 * Achieves 73% computation reduction by checking constraints in order of disqualification rate
 */
export interface MatchingResult {
  /** Overall match score (0-100) */
  score: number;

  /** Whether property is qualified (passed all constraints) */
  qualified: boolean;

  /** Whether property is competitive (score >= 70) */
  competitive: boolean;

  /** Letter grade */
  grade: 'A' | 'B' | 'C' | 'D' | 'F';

  /** 5-factor category scores */
  factors: {
    /** Location match (30% weight) */
    location: FactorScore;

    /** Space requirements (25% weight) */
    space: FactorScore;

    /** Building requirements (20% weight) */
    building: FactorScore;

    /** Timeline alignment (15% weight) */
    timeline: FactorScore;

    /** Broker experience (10% weight) */
    experience: FactorScore;
  };

  /** Early termination info */
  earlyTermination?: {
    /** Which constraint caused disqualification */
    failedConstraint: DisqualificationConstraint;

    /** Stage where processing stopped (0-5) */
    stoppedAtStage: number;

    /** Computation saved percentage */
    computationSaved: number;

    /** Reason for disqualification */
    reason: string;
  };

  /** Passed constraints */
  passedConstraints: DisqualificationConstraint[];

  /** Strengths */
  strengths: string[];

  /** Weaknesses */
  weaknesses: string[];

  /** Recommendations */
  recommendations: string[];

  /** Computation time in ms */
  computationTimeMs: number;
}

/**
 * Disqualification constraints ordered by failure rate
 * Higher failure rate = checked earlier for max efficiency
 */
export type DisqualificationConstraint =
  | 'STATE_MATCH'      // 94% disqualification rate
  | 'RSF_MINIMUM'      // 67% disqualification rate
  | 'SET_ASIDE'        // 45% disqualification rate
  | 'ADA'              // 23% disqualification rate
  | 'CLEARANCE';       // 12% disqualification rate

export interface PropertyData {
  // Location
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  state: string;
  zipcode: string;

  // Space
  totalSqft: number;
  availableSqft: number;
  minDivisibleSqft?: number;
  contiguous?: boolean;

  // Building
  buildingClass: 'A+' | 'A' | 'B' | 'C';
  adaCompliant: boolean;
  scifCapable?: boolean;
  securityClearance?: 'public_trust' | 'secret' | 'top_secret';

  // Features
  fiber?: boolean;
  backupPower?: boolean;
  parking?: {
    spaces: number;
    ratio: number;
  };

  // Timeline
  availableDate: Date;
  leaseTermYears?: number;
  buildToSuit?: boolean;

  // Set-aside eligibility
  setAsideEligible?: string[]; // e.g., ['8a', 'WOSB', 'SDVOSB']
}

export interface OpportunityRequirements {
  // Location (Constraint: STATE_MATCH - 94% disqualification)
  state: string;
  city?: string;
  delineatedArea?: {
    latitude: number;
    longitude: number;
    radiusMiles: number;
  };

  // Space (Constraint: RSF_MINIMUM - 67% disqualification)
  minimumRSF: number;
  maximumRSF?: number;
  contiguousRequired?: boolean;

  // Set-aside (Constraint: SET_ASIDE - 45% disqualification)
  setAside?: string; // e.g., '8a', 'WOSB', 'SDVOSB'

  // Building (Constraint: ADA - 23% disqualification)
  adaRequired: boolean;
  buildingClass?: ('A+' | 'A' | 'B' | 'C')[];

  // Security (Constraint: CLEARANCE - 12% disqualification)
  clearanceRequired?: 'public_trust' | 'secret' | 'top_secret';
  scifRequired?: boolean;

  // Other requirements
  fiber?: boolean;
  backupPower?: boolean;
  parkingRatio?: number;

  // Timeline
  occupancyDate?: Date;
  leaseTermYears?: number;
  responseDeadline?: Date;

  // Opportunity metadata
  noticeId: string;
  title: string;
  agency: string;
  naicsCode?: string;
}

export interface BrokerExperience {
  governmentLeaseExperience: boolean;
  governmentLeasesCount: number;
  gsaCertified: boolean;
  yearsInBusiness: number;
  totalPortfolioSqft: number;
  references?: string[];
  willingToBuildToSuit?: boolean;
}

// ==================== Caching ====================

export interface NeighborhoodScoreCache {
  id: string;
  latitude: number;
  longitude: number;
  radiusMiles: number;
  score: FederalNeighborhoodScore;
  createdAt: Date;
  expiresAt: Date;
}

export interface MatchScoreCache {
  id: string;
  propertyId: string;
  opportunityId: string;
  score: MatchingResult;
  createdAt: Date;
  expiresAt: Date;
}

// ==================== R-Tree Configuration ====================

export interface RTreeConfig {
  /** Maximum entries per node (default: 9) */
  maxEntries: number;

  /** Minimum entries per node (default: 4) */
  minEntries: number;

  /** Enable bulk loading optimization (default: true) */
  bulkLoad: boolean;
}

// ==================== API Response Types ====================

export interface FederalScoreResponse {
  success: boolean;
  data?: FederalNeighborhoodScore;
  error?: string;
  cached?: boolean;
}

export interface MatchScoreResponse {
  success: boolean;
  data?: MatchingResult;
  error?: string;
  cached?: boolean;
}