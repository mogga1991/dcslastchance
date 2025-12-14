import { useQuery } from '@tanstack/react-query';
import type { ViewportBounds, IOLPFeatureCollection, FederalNeighborhoodScore } from '@/lib/iolp';

/**
 * Hook to fetch IOLP properties within map viewport
 */
export function useIOLPViewport(bounds: ViewportBounds | null, enabled: boolean = true) {
  return useQuery<IOLPFeatureCollection>({
    queryKey: ['iolp', 'viewport', bounds],
    queryFn: async () => {
      if (!bounds) {
        return { features: [] };
      }

      const params = new URLSearchParams({
        swLat: bounds.swLat.toString(),
        swLng: bounds.swLng.toString(),
        neLat: bounds.neLat.toString(),
        neLng: bounds.neLng.toString()
      });

      const response = await fetch(`/api/iolp/viewport?${params}`);
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch IOLP viewport data');
      }

      return result.data;
    },
    enabled: enabled && bounds !== null,
    staleTime: 5 * 60 * 1000, // 5 minutes (matches server-side cache)
    refetchOnWindowFocus: false
  });
}

/**
 * Hook to fetch IOLP properties near a location with federal score
 */
export function useIOLPNearby(
  lat: number | null,
  lng: number | null,
  radiusMiles: number = 5,
  enabled: boolean = true
) {
  return useQuery<{
    properties: IOLPFeatureCollection;
    federalScore: FederalNeighborhoodScore;
  }>({
    queryKey: ['iolp', 'nearby', lat, lng, radiusMiles],
    queryFn: async () => {
      if (lat === null || lng === null) {
        return {
          properties: { features: [] },
          federalScore: {
            score: 0,
            totalProperties: 0,
            leasedProperties: 0,
            ownedProperties: 0,
            totalRSF: 0,
            vacantRSF: 0,
            density: 0,
            percentile: 0
          }
        };
      }

      const params = new URLSearchParams({
        lat: lat.toString(),
        lng: lng.toString(),
        radiusMiles: radiusMiles.toString()
      });

      const response = await fetch(`/api/iolp/nearby?${params}`);
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch nearby IOLP data');
      }

      return result.data;
    },
    enabled: enabled && lat !== null && lng !== null,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false
  });
}

/**
 * Hook to fetch Federal Neighborhood Score for a location
 * Lighter endpoint - only returns score, no property data
 */
export function useFederalNeighborhoodScore(
  lat: number | null,
  lng: number | null,
  radiusMiles: number = 5,
  enabled: boolean = true
) {
  return useQuery<FederalNeighborhoodScore>({
    queryKey: ['iolp', 'score', lat, lng, radiusMiles],
    queryFn: async () => {
      if (lat === null || lng === null) {
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

      const params = new URLSearchParams({
        lat: lat.toString(),
        lng: lng.toString(),
        radiusMiles: radiusMiles.toString()
      });

      const response = await fetch(`/api/iolp/score?${params}`);
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch federal score');
      }

      return result.data;
    },
    enabled: enabled && lat !== null && lng !== null,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false
  });
}

/**
 * Hook to fetch expiring GSA leases
 */
export function useExpiringLeases(
  monthsAhead: number = 24,
  state?: string,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: ['iolp', 'expiring-leases', monthsAhead, state],
    queryFn: async () => {
      const params = new URLSearchParams({
        monthsAhead: monthsAhead.toString()
      });

      if (state) {
        params.append('state', state);
      }

      const response = await fetch(`/api/iolp/expiring-leases?${params}`);
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch expiring leases');
      }

      return {
        leases: result.data.leases || [],
        grouped: result.data.grouped || { critical: [], high: [], medium: [], low: [] },
        meta: result.meta
      };
    },
    enabled,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false
  });
}
