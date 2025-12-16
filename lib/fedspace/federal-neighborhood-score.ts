/**
 * Federal Neighborhood Score Algorithm
 *
 * PATENT #1: 6-factor weighted scoring for federal leasing potential (0-100)
 * - Density: 25% weight
 * - Lease Activity: 25% weight
 * - Expiring Leases: 20% weight
 * - Demand: 15% weight
 * - Vacancy: 10% weight
 * - Growth: 5% weight
 *
 * Uses R-Tree spatial indexing for O(log n) query performance
 */

import type {
  FederalNeighborhoodScore,
  FederalProperty,
  FactorScore,
} from './types';
import { FederalPropertyRTree } from './spatial-index';

// Factor weights (must sum to 100)
const WEIGHTS = {
  density: 25,
  leaseActivity: 25,
  expiringLeases: 20,
  demand: 15,
  vacancy: 10,
  growth: 5,
} as const;

// Percentile thresholds for market comparison
const PERCENTILE_THRESHOLDS = {
  properties: [10, 25, 50, 75, 100, 150, 200],
  rsf: [100000, 250000, 500000, 1000000, 2000000, 5000000, 10000000],
  expiringLeases: [1, 3, 5, 10, 15, 20, 30],
};

/**
 * Calculate Federal Neighborhood Score using R-Tree spatial index
 */
export async function calculateFederalNeighborhoodScore(
  latitude: number,
  longitude: number,
  radiusMiles: number = 5,
  spatialIndex?: FederalPropertyRTree
): Promise<FederalNeighborhoodScore> {
  // Use provided index or fetch data and build new index
  const index = spatialIndex ?? (await buildSpatialIndex());

  // Query properties within radius using O(log n) search
  const properties = index.searchRadius(latitude, longitude, radiusMiles);

  // Calculate metrics
  const metrics = calculateMetrics(properties, radiusMiles);

  // Calculate individual factor scores
  const factors = {
    density: calculateDensityScore(metrics),
    leaseActivity: calculateLeaseActivityScore(metrics),
    expiringLeases: calculateExpiringLeasesScore(metrics),
    demand: calculateDemandScore(metrics),
    vacancy: calculateVacancyScore(metrics),
    growth: calculateGrowthScore(metrics),
  };

  // Calculate overall weighted score
  const score = calculateWeightedScore(factors);

  // Determine percentile
  const percentile = calculatePercentile(metrics);

  // Assign grade
  const grade = assignGrade(score);

  const calculatedAt = new Date();
  const expiresAt = new Date(calculatedAt.getTime() + 24 * 60 * 60 * 1000); // 24 hours

  return {
    score,
    factors,
    metrics,
    percentile,
    grade,
    location: {
      latitude,
      longitude,
    },
    calculatedAt,
    expiresAt,
  };
}

/**
 * Build spatial index from IOLP data
 */
async function buildSpatialIndex(): Promise<FederalPropertyRTree> {
  // Import IOLP adapter dynamically to avoid circular dependencies
  const { iolpAdapter } = await import('@/lib/iolp');

  // Fetch all federal properties (buildings + leases)
  // Use query strings to get comprehensive data
  const buildingsQueryString = 'where=1=1&outFields=*&returnGeometry=true&resultRecordCount=10000&f=json';
  const leasesQueryString = 'where=1=1&outFields=*&returnGeometry=true&resultRecordCount=10000&f=json';

  const [buildingsResult, leasesResult] = await Promise.all([
    iolpAdapter.queryBuildings(buildingsQueryString),
    iolpAdapter.queryLeases(leasesQueryString),
  ]);

  const buildings = buildingsResult.features.map((f: any) => f.attributes);
  const leases = leasesResult.features.map((f: any) => f.attributes);

  // Convert to FederalProperty format
  const properties: FederalProperty[] = [];

  // Add owned buildings
  for (const building of buildings) {
    if (building.LATITUDE && building.LONGITUDE) {
      properties.push({
        id: `building_${building.OBJECTID}`,
        latitude: building.LATITUDE,
        longitude: building.LONGITUDE,
        rsf: building.RSF || 0,
        type: 'owned',
        vacant: building.VACANT === 'Y',
        vacantRSF: building.VACANT_RSF || 0,
        constructionYear: building.YEAR_BUILT,
        agency: building.AGENCY,
        city: building.CITY,
        state: building.STATE,
        zipcode: building.ZIP,
      });
    }
  }

  // Add leased properties
  for (const lease of leases) {
    if (lease.LATITUDE && lease.LONGITUDE) {
      const expirationDate = lease.EXPIRATION_DATE
        ? new Date(lease.EXPIRATION_DATE)
        : undefined;

      properties.push({
        id: `lease_${lease.OBJECTID}`,
        latitude: lease.LATITUDE,
        longitude: lease.LONGITUDE,
        rsf: lease.RSF || 0,
        type: 'leased',
        leaseExpiration: expirationDate,
        agency: lease.AGENCY,
        city: lease.CITY,
        state: lease.STATE,
        zipcode: lease.ZIP,
      });
    }
  }

  // Build R-Tree index
  const index = new FederalPropertyRTree();
  index.bulkLoad(properties);

  return index;
}

/**
 * Calculate raw metrics from properties
 */
function calculateMetrics(
  properties: FederalProperty[],
  radiusMiles: number
): any {
  const totalProperties = properties.length;
  const leasedProperties = properties.filter((p) => p.type === 'leased').length;
  const ownedProperties = properties.filter((p) => p.type === 'owned').length;

  const totalRSF = properties.reduce((sum, p) => sum + (p.rsf || 0), 0);
  const vacantRSF = properties.reduce(
    (sum, p) => sum + (p.vacantRSF || 0),
    0
  );

  // Count leases expiring within 24 months
  const now = new Date();
  const twentyFourMonthsFromNow = new Date(
    now.getTime() + 24 * 30 * 24 * 60 * 60 * 1000
  );

  const expiringLeases = properties.filter(
    (p) =>
      p.type === 'leased' &&
      p.leaseExpiration &&
      p.leaseExpiration <= twentyFourMonthsFromNow &&
      p.leaseExpiration >= now
  );

  const expiringLeasesCount = expiringLeases.length;
  const expiringLeasesRSF = expiringLeases.reduce(
    (sum, p) => sum + (p.rsf || 0),
    0
  );

  // Count recent construction (last 5 years)
  const fiveYearsAgo = new Date().getFullYear() - 5;
  const recentConstructionCount = properties.filter(
    (p) => p.constructionYear && p.constructionYear >= fiveYearsAgo
  ).length;

  return {
    totalProperties,
    leasedProperties,
    ownedProperties,
    totalRSF,
    vacantRSF,
    expiringLeasesCount,
    expiringLeasesRSF,
    recentConstructionCount,
    searchRadiusMiles: radiusMiles,
  };
}

/**
 * FACTOR 1: Density Score (25% weight)
 * Measures concentration of federal properties
 */
function calculateDensityScore(metrics: any): FactorScore {
  const { totalProperties, searchRadiusMiles } = metrics;

  // Calculate properties per square mile
  const searchAreaSqMiles = Math.PI * searchRadiusMiles * searchRadiusMiles;
  const densityPerSqMile = totalProperties / searchAreaSqMiles;

  // Scoring thresholds (properties per sq mile)
  let score = 0;
  if (densityPerSqMile >= 20) score = 100;
  else if (densityPerSqMile >= 15) score = 90;
  else if (densityPerSqMile >= 10) score = 80;
  else if (densityPerSqMile >= 7) score = 70;
  else if (densityPerSqMile >= 5) score = 60;
  else if (densityPerSqMile >= 3) score = 50;
  else if (densityPerSqMile >= 2) score = 40;
  else if (densityPerSqMile >= 1) score = 30;
  else score = Math.min(30, densityPerSqMile * 30);

  const explanation = `${totalProperties} federal properties in ${searchRadiusMiles}-mile radius (${densityPerSqMile.toFixed(1)} per sq mi)`;

  return {
    score,
    weight: WEIGHTS.density,
    weighted: (score * WEIGHTS.density) / 100,
    explanation,
  };
}

/**
 * FACTOR 2: Lease Activity Score (25% weight)
 * Percentage of leased vs owned properties indicates market activity
 */
function calculateLeaseActivityScore(metrics: any): FactorScore {
  const { leasedProperties, ownedProperties, totalProperties } = metrics;

  if (totalProperties === 0) {
    return {
      score: 0,
      weight: WEIGHTS.leaseActivity,
      weighted: 0,
      explanation: 'No federal properties found',
    };
  }

  const leasePercentage = (leasedProperties / totalProperties) * 100;

  // Higher lease percentage = more active leasing market
  // Optimal range: 40-60% leased
  let score = 0;
  if (leasePercentage >= 40 && leasePercentage <= 60) {
    score = 100;
  } else if (leasePercentage >= 30 && leasePercentage < 40) {
    score = 80 + ((leasePercentage - 30) / 10) * 20;
  } else if (leasePercentage > 60 && leasePercentage <= 70) {
    score = 80 + ((70 - leasePercentage) / 10) * 20;
  } else if (leasePercentage >= 20 && leasePercentage < 30) {
    score = 60 + ((leasePercentage - 20) / 10) * 20;
  } else if (leasePercentage > 70 && leasePercentage <= 80) {
    score = 60 + ((80 - leasePercentage) / 10) * 20;
  } else if (leasePercentage < 20) {
    score = Math.min(60, leasePercentage * 3);
  } else {
    score = Math.max(40, 100 - leasePercentage);
  }

  const explanation = `${leasePercentage.toFixed(1)}% leased (${leasedProperties} leased, ${ownedProperties} owned)`;

  return {
    score,
    weight: WEIGHTS.leaseActivity,
    weighted: (score * WEIGHTS.leaseActivity) / 100,
    explanation,
  };
}

/**
 * FACTOR 3: Expiring Leases Score (20% weight)
 * Leases expiring in next 24 months indicate upcoming opportunities
 */
function calculateExpiringLeasesScore(metrics: any): FactorScore {
  const { expiringLeasesCount, expiringLeasesRSF } = metrics;

  // Score based on number of expiring leases
  let score = 0;
  if (expiringLeasesCount >= 30) score = 100;
  else if (expiringLeasesCount >= 20) score = 90;
  else if (expiringLeasesCount >= 15) score = 80;
  else if (expiringLeasesCount >= 10) score = 70;
  else if (expiringLeasesCount >= 5) score = 60;
  else if (expiringLeasesCount >= 3) score = 50;
  else if (expiringLeasesCount >= 1) score = 40;
  else score = 0;

  const rsfFormatted = (expiringLeasesRSF / 1000).toFixed(0);
  const explanation = `${expiringLeasesCount} leases expiring in 24 months (${rsfFormatted}K RSF)`;

  return {
    score,
    weight: WEIGHTS.expiringLeases,
    weighted: (score * WEIGHTS.expiringLeases) / 100,
    explanation,
  };
}

/**
 * FACTOR 4: Demand Score (15% weight)
 * Total RSF indicates size of federal presence
 */
function calculateDemandScore(metrics: any): FactorScore {
  const { totalRSF } = metrics;

  // Score based on total RSF
  let score = 0;
  if (totalRSF >= 10000000) score = 100; // 10M+ RSF
  else if (totalRSF >= 5000000) score = 90; // 5M+ RSF
  else if (totalRSF >= 2000000) score = 80; // 2M+ RSF
  else if (totalRSF >= 1000000) score = 70; // 1M+ RSF
  else if (totalRSF >= 500000) score = 60; // 500K+ RSF
  else if (totalRSF >= 250000) score = 50; // 250K+ RSF
  else if (totalRSF >= 100000) score = 40; // 100K+ RSF
  else score = Math.min(40, (totalRSF / 100000) * 40);

  const rsfFormatted = (totalRSF / 1000).toFixed(0);
  const explanation = `${rsfFormatted}K total RSF of federal space`;

  return {
    score,
    weight: WEIGHTS.demand,
    weighted: (score * WEIGHTS.demand) / 100,
    explanation,
  };
}

/**
 * FACTOR 5: Vacancy Score (10% weight)
 * INVERTED: Lower vacancy = better score
 */
function calculateVacancyScore(metrics: any): FactorScore {
  const { totalRSF, vacantRSF } = metrics;

  if (totalRSF === 0) {
    return {
      score: 0,
      weight: WEIGHTS.vacancy,
      weighted: 0,
      explanation: 'No federal space found',
    };
  }

  const vacancyPercentage = (vacantRSF / totalRSF) * 100;

  // INVERTED: Lower vacancy = better score
  let score = 0;
  if (vacancyPercentage <= 5) score = 100; // Very low vacancy
  else if (vacancyPercentage <= 10) score = 90;
  else if (vacancyPercentage <= 15) score = 80;
  else if (vacancyPercentage <= 20) score = 70;
  else if (vacancyPercentage <= 25) score = 60;
  else if (vacancyPercentage <= 30) score = 50;
  else score = Math.max(0, 100 - vacancyPercentage * 2);

  const vacantFormatted = (vacantRSF / 1000).toFixed(0);
  const explanation = `${vacancyPercentage.toFixed(1)}% vacant (${vacantFormatted}K RSF)`;

  return {
    score,
    weight: WEIGHTS.vacancy,
    weighted: (score * WEIGHTS.vacancy) / 100,
    explanation,
  };
}

/**
 * FACTOR 6: Growth Score (5% weight)
 * Recent construction indicates growing federal presence
 */
function calculateGrowthScore(metrics: any): FactorScore {
  const { recentConstructionCount, totalProperties } = metrics;

  if (totalProperties === 0) {
    return {
      score: 0,
      weight: WEIGHTS.growth,
      weighted: 0,
      explanation: 'No federal properties found',
    };
  }

  const growthPercentage = (recentConstructionCount / totalProperties) * 100;

  // Score based on recent construction percentage
  let score = 0;
  if (growthPercentage >= 20) score = 100;
  else if (growthPercentage >= 15) score = 90;
  else if (growthPercentage >= 10) score = 80;
  else if (growthPercentage >= 7) score = 70;
  else if (growthPercentage >= 5) score = 60;
  else if (growthPercentage >= 3) score = 50;
  else score = Math.min(50, growthPercentage * 16.67);

  const explanation = `${recentConstructionCount} new properties in last 5 years (${growthPercentage.toFixed(1)}% growth)`;

  return {
    score,
    weight: WEIGHTS.growth,
    weighted: (score * WEIGHTS.growth) / 100,
    explanation,
  };
}

/**
 * Calculate weighted overall score
 */
function calculateWeightedScore(factors: any): number {
  const total =
    factors.density.weighted +
    factors.leaseActivity.weighted +
    factors.expiringLeases.weighted +
    factors.demand.weighted +
    factors.vacancy.weighted +
    factors.growth.weighted;

  return Math.round(total * 10) / 10; // Round to 1 decimal
}

/**
 * Calculate market percentile based on metrics
 */
function calculatePercentile(metrics: any): number {
  const { totalProperties, totalRSF, expiringLeasesCount } = metrics;

  // Calculate percentile for each metric
  const propertyPercentile = calculateSinglePercentile(
    totalProperties,
    PERCENTILE_THRESHOLDS.properties
  );
  const rsfPercentile = calculateSinglePercentile(
    totalRSF,
    PERCENTILE_THRESHOLDS.rsf
  );
  const expiringPercentile = calculateSinglePercentile(
    expiringLeasesCount,
    PERCENTILE_THRESHOLDS.expiringLeases
  );

  // Weighted average: properties 40%, RSF 40%, expiring 20%
  const percentile =
    propertyPercentile * 0.4 + rsfPercentile * 0.4 + expiringPercentile * 0.2;

  return Math.round(percentile);
}

/**
 * Calculate percentile for a single metric
 */
function calculateSinglePercentile(
  value: number,
  thresholds: number[]
): number {
  for (let i = 0; i < thresholds.length; i++) {
    if (value < thresholds[i]!) {
      const percentileStep = 100 / (thresholds.length + 1);
      return percentileStep * (i + 1);
    }
  }
  return 100; // Top percentile
}

/**
 * Assign letter grade based on score
 */
function assignGrade(
  score: number
): 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F' {
  if (score >= 95) return 'A+';
  if (score >= 90) return 'A';
  if (score >= 85) return 'B+';
  if (score >= 80) return 'B';
  if (score >= 75) return 'C+';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}