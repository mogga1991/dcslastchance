"use client";

import { useEffect, useRef, useState } from "react";

interface Opportunity {
  id: string;
  title: string;
  placeOfPerformance?: {
    city?: string;
    state?: {
      code?: string;
      name?: string;
    };
  };
}

interface GoogleGSAMapProps {
  opportunities: Opportunity[];
  selectedOpportunity?: Opportunity | null;
}

// State center coordinates for geocoding
const STATE_COORDINATES: { [key: string]: { lat: number; lng: number } } = {
  AL: { lat: 32.3182, lng: -86.9023 },
  AK: { lat: 61.3707, lng: -152.4044 },
  AZ: { lat: 33.7298, lng: -111.4312 },
  AR: { lat: 34.9697, lng: -92.3731 },
  CA: { lat: 36.7783, lng: -119.4179 },
  CO: { lat: 39.5501, lng: -105.3111 },
  CT: { lat: 41.6032, lng: -72.7554 },
  DE: { lat: 38.9108, lng: -75.5071 },
  FL: { lat: 27.6648, lng: -81.5158 },
  GA: { lat: 32.1656, lng: -82.9001 },
  HI: { lat: 19.8968, lng: -155.5828 },
  ID: { lat: 44.0682, lng: -114.7420 },
  IL: { lat: 40.6331, lng: -88.9937 },
  IN: { lat: 40.2672, lng: -86.1349 },
  IA: { lat: 41.8780, lng: -93.0977 },
  KS: { lat: 39.0119, lng: -98.4842 },
  KY: { lat: 37.8393, lng: -84.2700 },
  LA: { lat: 30.9843, lng: -91.9623 },
  ME: { lat: 45.2538, lng: -69.4455 },
  MD: { lat: 39.0458, lng: -76.6413 },
  MA: { lat: 42.4072, lng: -71.3824 },
  MI: { lat: 44.3148, lng: -85.6024 },
  MN: { lat: 46.7296, lng: -94.6859 },
  MS: { lat: 32.3547, lng: -89.3985 },
  MO: { lat: 37.9643, lng: -91.8318 },
  MT: { lat: 46.8797, lng: -110.3626 },
  NE: { lat: 41.4925, lng: -99.9018 },
  NV: { lat: 38.8026, lng: -116.4194 },
  NH: { lat: 43.1939, lng: -71.5724 },
  NJ: { lat: 40.0583, lng: -74.4057 },
  NM: { lat: 34.5199, lng: -105.8701 },
  NY: { lat: 43.2994, lng: -75.5268 },
  NC: { lat: 35.7596, lng: -79.0193 },
  ND: { lat: 47.5515, lng: -100.7837 },
  OH: { lat: 40.4173, lng: -82.9071 },
  OK: { lat: 35.4676, lng: -97.5164 },
  OR: { lat: 43.8041, lng: -120.5542 },
  PA: { lat: 41.2033, lng: -77.1945 },
  RI: { lat: 41.5801, lng: -71.4774 },
  SC: { lat: 33.8361, lng: -81.1637 },
  SD: { lat: 44.3683, lng: -100.2263 },
  TN: { lat: 35.5175, lng: -86.5804 },
  TX: { lat: 31.9686, lng: -99.9018 },
  UT: { lat: 39.3210, lng: -111.8910 },
  VT: { lat: 44.5588, lng: -72.5778 },
  VA: { lat: 37.4316, lng: -78.6569 },
  WA: { lat: 47.7511, lng: -120.7401 },
  WV: { lat: 38.5976, lng: -80.4549 },
  WI: { lat: 43.7844, lng: -89.6165 },
  WY: { lat: 43.0759, lng: -107.2903 },
  DC: { lat: 38.9072, lng: -77.0369 },
};

// Declare google maps types
declare global {
  interface Window {
    google: typeof google;
    initGoogleMaps: () => void;
  }
}

export default function GoogleGSAMap({
  opportunities,
  selectedOpportunity,
}: GoogleGSAMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const map = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markers = useRef<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load Google Maps script
  useEffect(() => {
    const apiKey =
      process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
      process.env.VITE_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      console.error("Google Maps API key not found");
      return;
    }

    // Check if already loaded
    if (window.google?.maps) {
      setIsLoaded(true);
      return;
    }

    // Create script element
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=marker,maps`;
    script.async = true;
    script.defer = true;
    script.onload = () => setIsLoaded(true);
    script.onerror = () =>
      console.error("Failed to load Google Maps script");
    document.head.appendChild(script);

    return () => {
      // Cleanup if needed
    };
  }, []);

  // Initialize map
  useEffect(() => {
    if (!isLoaded || !mapContainer.current || map.current) return;

    map.current = new window.google.maps.Map(mapContainer.current, {
      center: { lat: 39.8283, lng: -98.5795 }, // Center of US
      zoom: 4,
      mapId: "GSA_OPPORTUNITIES_MAP", // Required for advanced markers
      disableDefaultUI: false,
      zoomControl: true,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
    });
  }, [isLoaded]);

  // Update markers when opportunities change
  useEffect(() => {
    if (!map.current || !window.google?.maps) return;

    // Clear existing markers
    markers.current.forEach((marker) => {
      marker.setMap(null);
    });
    markers.current = [];

    // Group opportunities by state
    const locationGroups = new Map<string, Opportunity[]>();

    opportunities.forEach((opp) => {
      const stateCode = opp.placeOfPerformance?.state?.code;
      if (stateCode && STATE_COORDINATES[stateCode]) {
        if (!locationGroups.has(stateCode)) {
          locationGroups.set(stateCode, []);
        }
        locationGroups.get(stateCode)!.push(opp);
      }
    });

    // Create markers for each location
    locationGroups.forEach((opps, stateCode) => {
      const coords = STATE_COORDINATES[stateCode];
      if (!coords) return;

      // Create custom marker element
      const markerEl = document.createElement("div");
      markerEl.style.backgroundColor = "#2563eb";
      markerEl.style.width = "36px";
      markerEl.style.height = "36px";
      markerEl.style.borderRadius = "50%";
      markerEl.style.border = "3px solid white";
      markerEl.style.cursor = "pointer";
      markerEl.style.display = "flex";
      markerEl.style.alignItems = "center";
      markerEl.style.justifyContent = "center";
      markerEl.style.color = "white";
      markerEl.style.fontWeight = "bold";
      markerEl.style.fontSize = "14px";
      markerEl.style.boxShadow = "0 2px 8px rgba(0,0,0,0.3)";
      markerEl.textContent = String(opps.length);

      // Create advanced marker
      const marker = new window.google.maps.marker.AdvancedMarkerElement({
        map: map.current,
        position: coords,
        content: markerEl,
        title: `${stateCode}: ${opps.length} opportunities`,
      });

      // Create info window
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 8px; font-family: system-ui, -apple-system, sans-serif;">
            <h3 style="font-weight: bold; margin: 0 0 8px 0; font-size: 16px;">${stateCode}</h3>
            <p style="margin: 0; font-size: 14px; color: #666;">${opps.length} opportunities</p>
          </div>
        `,
      });

      // Add click listener
      markerEl.addEventListener("click", () => {
        infoWindow.open(map.current, marker);
      });

      markers.current.push(marker);
    });
  }, [opportunities, isLoaded]);

  // Highlight selected opportunity
  useEffect(() => {
    if (!map.current || !selectedOpportunity || !window.google?.maps) return;

    const stateCode = selectedOpportunity.placeOfPerformance?.state?.code;
    if (stateCode && STATE_COORDINATES[stateCode]) {
      const coords = STATE_COORDINATES[stateCode];
      map.current.panTo(coords);
      map.current.setZoom(6);
    }
  }, [selectedOpportunity, isLoaded]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full" />

      {/* Loading indicator */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-gray-600">Loading map...</div>
        </div>
      )}

      {/* Map Legend */}
      {isLoaded && (
        <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4 max-w-xs">
          <h3 className="font-semibold text-sm mb-2">Set-Aside Types</h3>
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span>Small Business</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span>HUBZone</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-500"></div>
              <span>8(a)</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
