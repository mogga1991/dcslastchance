"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

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

interface GSAMapProps {
  opportunities: Opportunity[];
  selectedOpportunity?: Opportunity | null;
}

// State center coordinates for geocoding
const STATE_COORDINATES: { [key: string]: [number, number] } = {
  AL: [-86.9023, 32.3182],
  AK: [-152.4044, 61.3707],
  AZ: [-111.4312, 33.7298],
  AR: [-92.3731, 34.9697],
  CA: [-119.4179, 36.7783],
  CO: [-105.3111, 39.5501],
  CT: [-72.7554, 41.6032],
  DE: [-75.5071, 38.9108],
  FL: [-81.5158, 27.6648],
  GA: [-82.9001, 32.1656],
  HI: [-155.5828, 19.8968],
  ID: [-114.7420, 44.0682],
  IL: [-88.9937, 40.6331],
  IN: [-86.1349, 40.2672],
  IA: [-93.0977, 41.8780],
  KS: [-98.4842, 39.0119],
  KY: [-84.2700, 37.8393],
  LA: [-91.9623, 30.9843],
  ME: [-69.4455, 45.2538],
  MD: [-76.6413, 39.0458],
  MA: [-71.3824, 42.4072],
  MI: [-85.6024, 44.3148],
  MN: [-94.6859, 46.7296],
  MS: [-89.3985, 32.3547],
  MO: [-91.8318, 37.9643],
  MT: [-110.3626, 46.8797],
  NE: [-99.9018, 41.4925],
  NV: [-116.4194, 38.8026],
  NH: [-71.5724, 43.1939],
  NJ: [-74.4057, 40.0583],
  NM: [-105.8701, 34.5199],
  NY: [-75.5268, 43.2994],
  NC: [-79.0193, 35.7596],
  ND: [-100.7837, 47.5515],
  OH: [-82.9071, 40.4173],
  OK: [-97.5164, 35.4676],
  OR: [-120.5542, 43.8041],
  PA: [-77.1945, 41.2033],
  RI: [-71.4774, 41.5801],
  SC: [-81.1637, 33.8361],
  SD: [-100.2263, 44.3683],
  TN: [-86.5804, 35.5175],
  TX: [-99.9018, 31.9686],
  UT: [-111.8910, 39.3210],
  VT: [-72.5778, 44.5588],
  VA: [-78.6569, 37.4316],
  WA: [-120.7401, 47.7511],
  WV: [-80.4549, 38.5976],
  WI: [-89.6165, 43.7844],
  WY: [-107.2903, 43.0759],
  DC: [-77.0369, 38.9072],
};

export default function GSAMap({ opportunities, selectedOpportunity }: GSAMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);

  useEffect(() => {
    if (!mapContainer.current) return;

    const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || process.env.VITE_MAPBOX_ACCESS_TOKEN;
    if (!token) {
      console.error("Mapbox access token not found");
      return;
    }

    mapboxgl.accessToken = token;

    // Initialize map
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: [-98.5795, 39.8283], // Center of US
      zoom: 3.5,
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    return () => {
      map.current?.remove();
    };
  }, []);

  useEffect(() => {
    if (!map.current) return;

    // Clear existing markers
    markers.current.forEach((marker) => marker.remove());
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

      const el = document.createElement("div");
      el.className = "marker";
      el.style.backgroundColor = "#2563eb";
      el.style.width = "30px";
      el.style.height = "30px";
      el.style.borderRadius = "50%";
      el.style.border = "3px solid white";
      el.style.cursor = "pointer";
      el.style.display = "flex";
      el.style.alignItems = "center";
      el.style.justifyContent = "center";
      el.style.color = "white";
      el.style.fontWeight = "bold";
      el.style.fontSize = "12px";
      el.style.boxShadow = "0 2px 4px rgba(0,0,0,0.2)";
      el.textContent = String(opps.length);

      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
        `<div style="padding: 8px;">
          <h3 style="font-weight: bold; margin: 0 0 8px 0;">${stateCode}</h3>
          <p style="margin: 0; font-size: 14px;">${opps.length} opportunities</p>
        </div>`
      );

      const marker = new mapboxgl.Marker(el)
        .setLngLat(coords)
        .setPopup(popup)
        .addTo(map.current!);

      markers.current.push(marker);
    });
  }, [opportunities]);

  // Highlight selected opportunity
  useEffect(() => {
    if (!map.current || !selectedOpportunity) return;

    const stateCode = selectedOpportunity.placeOfPerformance?.state?.code;
    if (stateCode && STATE_COORDINATES[stateCode]) {
      const coords = STATE_COORDINATES[stateCode];
      map.current.flyTo({
        center: coords,
        zoom: 6,
        duration: 1000,
      });
    }
  }, [selectedOpportunity]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full" />

      {/* Map Legend */}
      <div className="absolute top-4 right-14 bg-white rounded-lg shadow-lg p-4 max-w-xs">
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
    </div>
  );
}
