/**
 * GSA IOLP (Inventory of Owned and Leased Properties) Adapter
 * Queries NASA NCCS HIFLD ArcGIS FeatureServer for federal building data
 */

// TypeScript Interfaces

export interface IOLPBuildingAttributes {
  // Core identifiers
  OBJECTID: number;
  location_code?: string;
  real_property_id?: string;

  // Location
  address?: string;
  city?: string;
  state?: string;
  zipcode?: string;
  latitude?: number;
  longitude?: number;

  // Property details
  building_name?: string;
  owned_or_leased_indicator?: 'F' | 'L'; // F = Federally Owned, L = Leased
  property_type?: string;
  occupancy_status?: string;

  // Size metrics
  building_rsf?: number; // Rentable Square Feet
  vacant_rsf?: number;

  // Lease data (if applicable)
  lease_expiration_date?: string;
  lessor_name?: string;

  // Additional fields
  historical_status?: string;
  year_constructed?: number;
  agency_abbr?: string;
}

export interface IOLPFeature {
  attributes: IOLPBuildingAttributes;
  geometry?: {
    x: number;
    y: number;
  };
}

export interface IOLPFeatureCollection {
  features: IOLPFeature[];
}

export interface FederalNeighborhoodScore {
  score: number; // 0-100
  totalProperties: number;
  leasedProperties: number;
  ownedProperties: number;
  totalRSF: number;
  vacantRSF: number;
  density: number; // properties per square mile
  percentile: number; // 0-100
  [key: string]: unknown; // Allow additional properties for type compatibility
}

export interface ViewportBounds {
  swLat: number;
  swLng: number;
  neLat: number;
  neLng: number;
}

// Constants

const ARCGIS_BASE_URL = 'https://maps.nccs.nasa.gov/mapping/rest/services/hifld_open/government/FeatureServer';
const BUILDINGS_LAYER = 3;
const LEASES_LAYER = 4;
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

// Query Builders

export function buildViewportQuery(bounds: ViewportBounds): string {
  const { swLat, swLng, neLat, neLng } = bounds;
  const geometry = `${swLng},${swLat},${neLng},${neLat}`;

  return [
    `geometry=${encodeURIComponent(geometry)}`,
    'geometryType=esriGeometryEnvelope',
    'spatialRel=esriSpatialRelIntersects',
    'outFields=*',
    'returnGeometry=true',
    'f=json'
  ].join('&');
}

export function buildRadiusQuery(lat: number, lng: number, radiusMiles: number): string {
  // Convert miles to meters (ArcGIS uses meters)
  const radiusMeters = radiusMiles * 1609.34;

  return [
    `geometry=${lng},${lat}`,
    'geometryType=esriGeometryPoint',
    `distance=${radiusMeters}`,
    'units=esriSRUnit_Meter',
    'spatialRel=esriSpatialRelIntersects',
    'outFields=*',
    'returnGeometry=true',
    'f=json'
  ].join('&');
}

export function buildLocationQuery(lat: number, lng: number): string {
  return buildRadiusQuery(lat, lng, 5); // Default 5 mile radius
}

export function buildExpiringLeasesQuery(monthsAhead: number = 24, state?: string): string {
  const today = new Date();
  const futureDate = new Date(today);
  futureDate.setMonth(futureDate.getMonth() + monthsAhead);

  // Format dates as YYYY-MM-DD
  const todayStr = today.toISOString().split('T')[0];
  const futureDateStr = futureDate.toISOString().split('T')[0];

  let where = `lease_expiration_date >= '${todayStr}' AND lease_expiration_date <= '${futureDateStr}'`;

  if (state) {
    where += ` AND state = '${state}'`;
  }

  return [
    `where=${encodeURIComponent(where)}`,
    'outFields=*',
    'returnGeometry=true',
    'orderByFields=lease_expiration_date ASC',
    'f=json'
  ].join('&');
}

// Cache Interface

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

class SimpleCache<T> {
  private cache = new Map<string, CacheEntry<T>>();

  get(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const age = Date.now() - entry.timestamp;
    if (age > CACHE_DURATION_MS) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  set(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  clear(): void {
    this.cache.clear();
  }
}

// IOLP Adapter Class

class IOLPAdapter {
  private cache = new SimpleCache<IOLPFeatureCollection>();

  /**
   * Query buildings layer with custom query string
   */
  async queryBuildings(queryString: string): Promise<IOLPFeatureCollection> {
    const cacheKey = `buildings:${queryString}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    const url = `${ARCGIS_BASE_URL}/${BUILDINGS_LAYER}/query?${queryString}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`ArcGIS API error: ${response.statusText}`);
      }

      const data = await response.json();
      const result: IOLPFeatureCollection = {
        features: data.features || []
      };

      this.cache.set(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Error querying buildings:', error);
      return { features: [] };
    }
  }

  /**
   * Query leases layer with custom query string
   */
  async queryLeases(queryString: string): Promise<IOLPFeatureCollection> {
    const cacheKey = `leases:${queryString}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    const url = `${ARCGIS_BASE_URL}/${LEASES_LAYER}/query?${queryString}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`ArcGIS API error: ${response.statusText}`);
      }

      const data = await response.json();
      const result: IOLPFeatureCollection = {
        features: data.features || []
      };

      this.cache.set(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Error querying leases:', error);
      return { features: [] };
    }
  }

  /**
   * Get properties within viewport bounds
   */
  async getPropertiesInViewport(bounds: ViewportBounds): Promise<IOLPFeatureCollection> {
    const queryString = buildViewportQuery(bounds);
    return this.queryBuildings(queryString);
  }

  /**
   * Get properties near a location
   */
  async getPropertiesNearby(
    lat: number,
    lng: number,
    radiusMiles: number = 5
  ): Promise<IOLPFeatureCollection> {
    const queryString = buildRadiusQuery(lat, lng, radiusMiles);
    return this.queryBuildings(queryString);
  }

  /**
   * Calculate Federal Neighborhood Score based on GSA property density
   * ENHANCED ALGORITHM - Matches broker properties to government demand
   *
   * Returns score 0-100 based on:
   * - Federal density (25%) - More federal presence = higher demand
   * - Lease activity (25%) - More leases = willingness to lease vs own
   * - Expiring leases (20%) - Upcoming replacement demand
   * - Total RSF demand (15%) - Scale of federal operations
   * - Vacant federal space (10%) - Competition from existing vacancy
   * - Growth trend (5%) - Increasing or stable federal presence
   */
  async calculateFederalNeighborhoodScore(
    lat: number,
    lng: number,
    radiusMiles: number = 5
  ): Promise<FederalNeighborhoodScore> {
    const properties = await this.getPropertiesNearby(lat, lng, radiusMiles);

    if (properties.features.length === 0) {
      return {
        score: 0,
        totalProperties: 0,
        leasedProperties: 0,
        ownedProperties: 0,
        totalRSF: 0,
        vacantRSF: 0,
        density: 0,
        percentile: 0
      };
    }

    // Calculate base metrics
    const totalProperties = properties.features.length;
    const leasedProperties = properties.features.filter(
      f => f.attributes.owned_or_leased_indicator === 'L'
    ).length;
    const ownedProperties = properties.features.filter(
      f => f.attributes.owned_or_leased_indicator === 'F'
    ).length;

    const totalRSF = properties.features.reduce(
      (sum, f) => sum + (f.attributes.building_rsf || 0),
      0
    );

    const vacantRSF = properties.features.reduce(
      (sum, f) => sum + (f.attributes.vacant_rsf || 0),
      0
    );

    // Calculate density (properties per square mile)
    const searchAreaSqMiles = Math.PI * radiusMiles * radiusMiles;
    const density = totalProperties / searchAreaSqMiles;

    // ========== ENHANCED SCORING ALGORITHM ==========

    // 1. FEDERAL DENSITY SCORE (25 points)
    // Higher density = more federal activity = higher broker opportunity
    // Benchmarks: <1 = low, 1-5 = medium, 5-10 = high, >10 = very high
    const densityScore = Math.min(25, (density / 10) * 25);

    // 2. LEASE ACTIVITY SCORE (25 points)
    // Higher % leased = government prefers leasing = good for brokers
    // Leased properties indicate willingness to pay market rates
    const leaseRatio = totalProperties > 0 ? leasedProperties / totalProperties : 0;
    const leaseActivityScore = leaseRatio * 25;

    // 3. EXPIRING LEASE OPPORTUNITY SCORE (20 points)
    // Find leases expiring in next 24 months = replacement demand
    const today = new Date();
    const twoYearsFromNow = new Date(today);
    twoYearsFromNow.setMonth(today.getMonth() + 24);

    const expiringLeases = properties.features.filter(f => {
      if (!f.attributes.lease_expiration_date) return false;
      const expDate = new Date(f.attributes.lease_expiration_date);
      return expDate >= today && expDate <= twoYearsFromNow;
    }).length;

    const expiringRSF = properties.features
      .filter(f => {
        if (!f.attributes.lease_expiration_date) return false;
        const expDate = new Date(f.attributes.lease_expiration_date);
        return expDate >= today && expDate <= twoYearsFromNow;
      })
      .reduce((sum, f) => sum + (f.attributes.building_rsf || 0), 0);

    // Score based on both count and RSF of expiring leases
    const expiringScore = Math.min(20, (expiringLeases / 5) * 10 + (expiringRSF / 200000) * 10);

    // 4. TOTAL DEMAND SCORE (15 points)
    // Higher total RSF = larger federal operations = more opportunities
    // Benchmark: 1M SF = strong market
    const demandScore = Math.min(15, (totalRSF / 1000000) * 15);

    // 5. VACANCY COMPETITION SCORE (10 points - INVERTED)
    // Lower federal vacancy = less competition from existing space
    // High federal vacancy means government has options, bad for brokers
    const vacancyRate = totalRSF > 0 ? vacantRSF / totalRSF : 0;
    const vacancyScore = Math.max(0, 10 - (vacancyRate * 20)); // Penalty for high vacancy

    // 6. GROWTH TREND SCORE (5 points)
    // More recent construction = growing federal presence
    const recentProperties = properties.features.filter(f => {
      const year = f.attributes.year_constructed;
      return year && year >= 2010;
    }).length;
    const growthScore = Math.min(5, (recentProperties / totalProperties) * 5);

    // ========== CALCULATE FINAL SCORE ==========
    const score = Math.round(
      densityScore +
      leaseActivityScore +
      expiringScore +
      demandScore +
      vacancyScore +
      growthScore
    );

    // Calculate percentile based on scoring thresholds
    // 0-30 = Poor (bottom 25%)
    // 31-50 = Fair (25-50%)
    // 51-70 = Good (50-75%)
    // 71-85 = Very Good (75-90%)
    // 86-100 = Excellent (top 10%)
    let percentile = 0;
    if (score >= 86) percentile = 95;
    else if (score >= 71) percentile = 82;
    else if (score >= 51) percentile = 62;
    else if (score >= 31) percentile = 37;
    else percentile = 15;

    return {
      score,
      totalProperties,
      leasedProperties,
      ownedProperties,
      totalRSF: Math.round(totalRSF),
      vacantRSF: Math.round(vacantRSF),
      density: Math.round(density * 10) / 10,
      percentile
    };
  }

  /**
   * Get leases expiring within specified timeframe
   */
  async getExpiringLeases(
    monthsAhead: number = 24,
    state?: string
  ): Promise<IOLPFeatureCollection> {
    const queryString = buildExpiringLeasesQuery(monthsAhead, state);
    return this.queryLeases(queryString);
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }
}

// Export singleton instance
export const iolpAdapter = new IOLPAdapter();
