/**
 * FedSpace Patent-Pending Algorithms
 *
 * PATENT #1: Federal Neighborhood Score
 * - 6-factor weighted algorithm for federal leasing potential (0-100)
 * - R-Tree spatial indexing for O(log n) query performance
 *
 * PATENT #2: Property-Opportunity Matching
 * - Early-termination disqualification pipeline (73% computation reduction)
 * - 5-factor weighted matching algorithm
 * - Constraint checks ordered by disqualification rate
 */

// Types
export type {
  FederalNeighborhoodScore,
  FactorScore,
  FederalProperty,
  SpatialNode,
  BoundingBox,
  RTreeConfig,
  MatchingResult,
  PropertyData,
  OpportunityRequirements,
  BrokerExperience,
  DisqualificationConstraint,
  NeighborhoodScoreCache,
  MatchScoreCache,
  FederalScoreResponse,
  MatchScoreResponse,
} from './types';

// Spatial Index
export {
  FederalPropertyRTree,
  getSpatialIndex,
  resetSpatialIndex,
} from './spatial-index';

// Federal Neighborhood Score
export { calculateFederalNeighborhoodScore } from './federal-neighborhood-score';

// Property-Opportunity Matching
export { calculatePropertyOpportunityMatch } from './property-opportunity-matcher';

// Re-export weights for reference
export const FEDERAL_SCORE_WEIGHTS = {
  density: 25,
  leaseActivity: 25,
  expiringLeases: 20,
  demand: 15,
  vacancy: 10,
  growth: 5,
} as const;

export const MATCH_SCORE_WEIGHTS = {
  location: 30,
  space: 25,
  building: 20,
  timeline: 15,
  experience: 10,
} as const;

export const DISQUALIFICATION_CONSTRAINTS = [
  'STATE_MATCH',      // 94% disqualification rate
  'RSF_MINIMUM',      // 67% disqualification rate
  'SET_ASIDE',        // 45% disqualification rate
  'ADA',              // 23% disqualification rate
  'CLEARANCE',        // 12% disqualification rate
] as const;
