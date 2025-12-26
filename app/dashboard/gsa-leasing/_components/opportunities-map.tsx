"use client";

import { useEffect, useRef, useState } from "react";
import { SAMOpportunity } from "@/lib/sam-gov";
import { Loader } from "@googlemaps/js-api-loader";

interface OpportunitiesMapProps {
  opportunities: SAMOpportunity[];
  selectedOpportunity: SAMOpportunity | null;
  onOpportunityClick?: (opportunity: SAMOpportunity) => void;
  center?: { lat: number; lng: number };
}

export function OpportunitiesMap({
  opportunities,
  selectedOpportunity,
  onOpportunityClick,
  center,
}: OpportunitiesMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const [geocoder, setGeocoder] = useState<google.maps.Geocoder | null>(null);

  // Initialize Google Map
  useEffect(() => {
    const initMap = async () => {
      const loader = new Loader({
        apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
        version: "weekly",
      });

      const { Map } = await loader.importLibrary("maps");
      const { Geocoder } = await loader.importLibrary("geocoding");

      if (!mapRef.current) return;

      const mapInstance = new Map(mapRef.current, {
        center: center || { lat: 39.8283, lng: -98.5795 }, // Center of USA
        zoom: 4,
        mapTypeControl: false,
        streetViewControl: false,
      });

      setMap(mapInstance);
      setGeocoder(new Geocoder());
    };

    initMap();
  }, [center]);

  // Add markers for opportunities
  useEffect(() => {
    if (!map || !geocoder || opportunities.length === 0) return;

    // Clear existing markers
    markers.forEach((marker) => marker.setMap(null));

    const newMarkers: google.maps.Marker[] = [];
    const bounds = new google.maps.LatLngBounds();

    // Group opportunities by location to create clustered markers
    const locationGroups = new Map<string, SAMOpportunity[]>();

    opportunities.forEach((opp) => {
      const city = opp.placeOfPerformance?.city?.name || "";
      const state = opp.placeOfPerformance?.state?.code || "";
      const key = `${city}, ${state}`;

      if (!locationGroups.has(key)) {
        locationGroups.set(key, []);
      }
      locationGroups.get(key)!.push(opp);
    });

    // Create markers for each location group
    locationGroups.forEach((opps, location) => {
      const firstOpp = opps[0];
      const city = firstOpp.placeOfPerformance?.city?.name;
      const state = firstOpp.placeOfPerformance?.state?.code;

      if (!city || !state) return;

      // Geocode the location
      geocoder.geocode({ address: `${city}, ${state}, USA` }, (results, status) => {
        if (status === "OK" && results && results[0]) {
          const position = results[0].geometry.location;

          const marker = new google.maps.Marker({
            position,
            map,
            title: `${opps.length} opportunit${opps.length > 1 ? 'ies' : 'y'} in ${city}, ${state}`,
            label: {
              text: `${opps.length}`,
              color: "white",
              fontSize: "12px",
              fontWeight: "bold",
            },
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: opps.length > 1 ? 12 : 8,
              fillColor: opps.length > 1 ? "#4F46E5" : "#6366F1",
              fillOpacity: 1,
              strokeColor: "white",
              strokeWeight: 2,
            },
          });

          // Click handler
          marker.addListener("click", () => {
            if (onOpportunityClick && opps.length > 0) {
              onOpportunityClick(opps[0]);
            }
          });

          newMarkers.push(marker);
          bounds.extend(position);

          // Fit map to bounds if we have multiple markers
          if (newMarkers.length > 1) {
            map.fitBounds(bounds);
          }
        }
      });
    });

    setMarkers(newMarkers);
  }, [map, geocoder, opportunities, onOpportunityClick]);

  // Highlight selected opportunity
  useEffect(() => {
    if (!map || !geocoder || !selectedOpportunity) return;

    const city = selectedOpportunity.placeOfPerformance?.city?.name;
    const state = selectedOpportunity.placeOfPerformance?.state?.code;

    if (!city || !state) return;

    geocoder.geocode({ address: `${city}, ${state}, USA` }, (results, status) => {
      if (status === "OK" && results && results[0]) {
        map.setCenter(results[0].geometry.location);
        map.setZoom(10);
      }
    });
  }, [map, geocoder, selectedOpportunity]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full" />
      {opportunities.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75">
          <p className="text-gray-500">No opportunities to display</p>
        </div>
      )}
    </div>
  );
}
