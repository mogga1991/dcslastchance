/**
 * Geocoding utilities for converting addresses to coordinates
 */

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface GeocodeResult {
  coordinates: Coordinates;
  formattedAddress: string;
}

/**
 * Geocode an address using Google Maps Geocoding API
 * @param address Street address
 * @param city City name
 * @param state State code (e.g., "DC", "VA")
 * @param zipcode ZIP code
 * @returns Coordinates and formatted address, or null if geocoding fails
 */
export async function geocodeAddress(
  address: string,
  city: string,
  state: string,
  zipcode: string
): Promise<GeocodeResult | null> {
  try {
    const fullAddress = `${address}, ${city}, ${state} ${zipcode}, USA`;
    const apiKey =
      process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
      process.env.VITE_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      console.error("Google Maps API key not found");
      return null;
    }

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        fullAddress
      )}&key=${apiKey}`
    );

    if (!response.ok) {
      console.error("Geocoding API request failed:", response.statusText);
      return null;
    }

    const data = await response.json();

    if (data.status === "OK" && data.results && data.results[0]) {
      const result = data.results[0];
      return {
        coordinates: {
          lat: result.geometry.location.lat,
          lng: result.geometry.location.lng,
        },
        formattedAddress: result.formatted_address,
      };
    }

    if (data.status === "ZERO_RESULTS") {
      console.warn("No geocoding results found for address:", fullAddress);
    } else if (data.status === "OVER_QUERY_LIMIT") {
      console.error("Geocoding API quota exceeded");
    } else if (data.status === "REQUEST_DENIED") {
      console.error("Geocoding API request denied:", data.error_message);
    } else {
      console.warn("Geocoding failed with status:", data.status);
    }

    return null;
  } catch (error) {
    console.error("Error geocoding address:", error);
    return null;
  }
}

/**
 * Geocode an address on the client side using the Google Maps JavaScript API
 * (Use this when the Google Maps library is already loaded)
 * @param address Full address string or components
 * @returns Promise with coordinates
 */
export async function geocodeAddressClient(
  address: string | { address: string; city: string; state: string; zipcode: string }
): Promise<Coordinates | null> {
  if (typeof window === "undefined" || !window.google?.maps) {
    console.error("Google Maps API not loaded");
    return null;
  }

  const geocoder = new window.google.maps.Geocoder();
  const addressString =
    typeof address === "string"
      ? address
      : `${address.address}, ${address.city}, ${address.state} ${address.zipcode}, USA`;

  try {
    const result = await geocoder.geocode({ address: addressString });

    if (result.results && result.results[0]) {
      const location = result.results[0].geometry.location;
      return {
        lat: location.lat(),
        lng: location.lng(),
      };
    }

    return null;
  } catch (error) {
    console.error("Error geocoding address with client API:", error);
    return null;
  }
}

/**
 * Validate coordinates are within reasonable bounds
 */
export function isValidCoordinates(lat: number, lng: number): boolean {
  return (
    typeof lat === "number" &&
    typeof lng === "number" &&
    !isNaN(lat) &&
    !isNaN(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
}
