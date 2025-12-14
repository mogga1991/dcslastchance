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
   * Returns score 0-100 based on:
   * - Property density (properties per square mile)
   * - Total RSF
   * - Leased vs owned ratio
   * - Vacant RSF availability
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

    // Calculate metrics
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

    // Scoring algorithm
    // - Density: 0-10 properties/sq mi -> 0-40 points
    // - Total RSF: 0-1M sq ft -> 0-30 points
    // - Leased properties: 0-50% -> 0-20 points (more leases = more federal activity)
    // - Vacant RSF: 0-100k sq ft -> 0-10 points (opportunity indicator)

    const densityScore = Math.min(40, (density / 10) * 40);
    const rsfScore = Math.min(30, (totalRSF / 1000000) * 30);
    const leaseScore = Math.min(20, (leasedProperties / totalProperties) * 20);
    const vacantScore = Math.min(10, (vacantRSF / 100000) * 10);

    const score = Math.round(densityScore + rsfScore + leaseScore + vacantScore);

    // Calculate percentile (simplified - would need historical data for true percentile)
    // Using score as proxy for percentile
    const percentile = score;

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
