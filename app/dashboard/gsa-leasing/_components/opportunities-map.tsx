"use client";

import { useEffect, useRef, useState } from "react";
import { SAMOpportunity } from "@/lib/sam-gov";
import type { PublicBrokerListing } from "@/types/broker-listing";

interface OpportunitiesMapProps {
  opportunities: SAMOpportunity[];
  brokerListings?: PublicBrokerListing[];
  selectedOpportunity: SAMOpportunity | null;
  selectedListing?: PublicBrokerListing | null;
  onOpportunityClick?: (opportunity: SAMOpportunity) => void;
  onListingClick?: (listing: PublicBrokerListing) => void;
  onPinClick?: (opportunities: SAMOpportunity[]) => void;
  center?: { lat: number; lng: number };
}

// Declare google as a global variable
declare global {
  interface Window {
    google: typeof google;
    initGoogleMaps: () => void;
  }
}

export function OpportunitiesMap({
  opportunities,
  brokerListings = [],
  selectedOpportunity,
  selectedListing,
  onOpportunityClick,
  onListingClick,
  onPinClick,
  center,
}: OpportunitiesMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const [listingMarkers, setListingMarkers] = useState<google.maps.Marker[]>([]);
  const [geocoder, setGeocoder] = useState<google.maps.Geocoder | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load Google Maps script
  useEffect(() => {
    if (typeof window !== "undefined" && window.google) {
      setIsLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""}&libraries=geocoding`;
    script.async = true;
    script.defer = true;
    script.onload = () => setIsLoaded(true);
    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  // Initialize Google Map
  useEffect(() => {
    if (!isLoaded || !mapRef.current || map) return;

    const mapInstance = new window.google.maps.Map(mapRef.current, {
      center: center || { lat: 39.8283, lng: -98.5795 }, // Center of USA
      zoom: 4,
      mapTypeControl: false,
      streetViewControl: false,
    });

    setMap(mapInstance);
    setGeocoder(new window.google.maps.Geocoder());
  }, [isLoaded, center, map]);

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

    let geocodedCount = 0;
    const totalLocations = locationGroups.size;

    // Create markers for each location group
    locationGroups.forEach((opps, location) => {
      const firstOpp = opps[0];
      const city = firstOpp.placeOfPerformance?.city?.name;
      const state = firstOpp.placeOfPerformance?.state?.code;

      if (!city || !state) {
        geocodedCount++;
        return;
      }

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

          // Click handler - zoom to location and filter/select opportunities
          marker.addListener("click", () => {
            // Smooth zoom and pan to the clicked location
            map.panTo(position);

            // Smooth zoom transition
            const targetZoom = 10; // City-level zoom
            const currentZoom = map.getZoom() || 4;
            const zoomStep = currentZoom < targetZoom ? 1 : -1;

            const smoothZoom = (current: number, target: number) => {
              if (current !== target) {
                const next = current + zoomStep;
                map.setZoom(next);
                setTimeout(() => smoothZoom(next, target), 80);
              }
            };

            smoothZoom(currentZoom, targetZoom);

            if (opps.length > 1 && onPinClick) {
              // Multiple opportunities - filter the list to show only these
              onPinClick(opps);
            } else if (opps.length === 1 && onOpportunityClick) {
              // Single opportunity - select it
              onOpportunityClick(opps[0]);
            }
          });

          newMarkers.push(marker);
          bounds.extend(position);
        }

        // Increment count and check if all geocoding is complete
        geocodedCount++;
        if (geocodedCount === totalLocations && newMarkers.length > 0) {
          // All markers created - fit map to show all of them
          map.fitBounds(bounds);

          // Add padding for better visibility
          const padding = { top: 50, right: 50, bottom: 50, left: 50 };
          map.fitBounds(bounds, padding);
        }
      });
    });

    setMarkers(newMarkers);
  }, [map, geocoder, opportunities, onOpportunityClick, onPinClick]);

  // Add markers for broker listings (orange markers)
  useEffect(() => {
    if (!map || brokerListings.length === 0) return;

    // Clear existing listing markers
    listingMarkers.forEach((marker) => marker.setMap(null));

    const newListingMarkers: google.maps.Marker[] = [];

    brokerListings.forEach((listing) => {
      if (!listing.latitude || !listing.longitude) return;

      const position = { lat: listing.latitude, lng: listing.longitude };

      // Create orange marker for listing
      const marker = new google.maps.Marker({
        position,
        map,
        title: listing.title || `${listing.street_address}, ${listing.city}, ${listing.state}`,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: "#F97316", // Orange color
          fillOpacity: 1,
          strokeColor: "white",
          strokeWeight: 2,
        },
        zIndex: 100, // Higher z-index so listings appear above opportunities
      });

      // Create InfoWindow for the listing
      const infoContent = `
        <div style="width: 340px; font-family: system-ui, -apple-system, sans-serif; line-height: 1.4; animation: fadeInSlideUp 0.5s ease-out;">
          <style>
            @keyframes fadeInSlideUp {
              from {
                opacity: 0;
                transform: translateY(10px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
          </style>
          ${listing.images && listing.images.length > 0 ? `
            <img
              src="${listing.images[0]}"
              alt="${listing.title || 'Property'}"
              style="width: 100%; height: 180px; object-fit: cover; border-radius: 6px 6px 0 0; margin: -16px -16px 14px -16px; display: block;"
            />
          ` : ''}
          <div style="padding: ${listing.images && listing.images.length > 0 ? '0 2px' : '6px 2px'};">
            <h3 style="font-size: 15px; font-weight: 600; margin: 0 0 10px 0; color: #1f2937; line-height: 1.3;">
              ${listing.title || 'Property Details'}
            </h3>
            <div style="margin-bottom: 12px;">
              <p style="font-size: 13px; color: #6b7280; margin: 0 0 2px 0; line-height: 1.4;">
                ${listing.street_address}${listing.suite_unit ? `, ${listing.suite_unit}` : ''}
              </p>
              <p style="font-size: 13px; color: #6b7280; margin: 0;">
                ${listing.city}, ${listing.state} ${listing.zipcode}
              </p>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 12px;">
              <div style="font-size: 12px;">
                <div style="color: #9ca3af; margin-bottom: 2px;">Type</div>
                <div style="color: #1f2937; font-weight: 600; text-transform: capitalize;">
                  ${listing.property_type?.replace(/_/g, ' ') || 'N/A'}
                </div>
              </div>
              ${listing.building_class ? `
                <div style="font-size: 12px;">
                  <div style="color: #9ca3af; margin-bottom: 2px;">Class</div>
                  <div style="color: #1f2937; font-weight: 600; text-transform: uppercase;">
                    ${listing.building_class.replace('class_', 'Class ')}
                  </div>
                </div>
              ` : ''}
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 12px;">
              <div style="font-size: 12px;">
                <div style="color: #9ca3af; margin-bottom: 2px;">Available Space</div>
                <div style="color: #1f2937; font-weight: 600;">
                  ${listing.available_sf?.toLocaleString() || listing.total_sf?.toLocaleString() || 'N/A'} SF
                </div>
              </div>
              ${listing.asking_rent_sf && listing.asking_rent_sf > 0 ? `
                <div style="font-size: 12px;">
                  <div style="color: #9ca3af; margin-bottom: 2px;">Rate</div>
                  <div style="color: #1f2937; font-weight: 600;">
                    $${listing.asking_rent_sf.toFixed(2)}/SF/yr
                  </div>
                </div>
              ` : ''}
            </div>

            ${listing.lease_type ? `
              <div style="font-size: 12px; margin-bottom: 12px;">
                <span style="color: #9ca3af;">Lease Type:</span>
                <span style="color: #1f2937; font-weight: 600; text-transform: capitalize; margin-left: 6px;">
                  ${listing.lease_type.replace(/_/g, ' ')}
                </span>
              </div>
            ` : ''}

            ${(listing.ada_accessible || listing.leed_certified || listing.parking_spaces || listing.year_built) ? `
              <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 12px;">
                ${listing.ada_accessible ? `
                  <span style="padding: 5px 10px; background: #dbeafe; color: #1e40af; font-size: 11px; font-weight: 500; border-radius: 4px; white-space: nowrap;">
                    ADA Accessible
                  </span>
                ` : ''}
                ${listing.leed_certified ? `
                  <span style="padding: 5px 10px; background: #dcfce7; color: #15803d; font-size: 11px; font-weight: 500; border-radius: 4px; white-space: nowrap;">
                    LEED Certified
                  </span>
                ` : ''}
                ${listing.parking_spaces && listing.parking_spaces > 0 ? `
                  <span style="padding: 5px 10px; background: #f3f4f6; color: #374151; font-size: 11px; font-weight: 500; border-radius: 4px; white-space: nowrap;">
                    ${listing.parking_spaces} Parking
                  </span>
                ` : ''}
                ${listing.year_built ? `
                  <span style="padding: 5px 10px; background: #f3f4f6; color: #374151; font-size: 11px; font-weight: 500; border-radius: 4px; white-space: nowrap;">
                    Built ${listing.year_built}
                  </span>
                ` : ''}
              </div>
            ` : ''}

            ${listing.available_date ? `
              <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #e5e7eb; font-size: 12px;">
                <span style="color: #9ca3af;">Available:</span>
                <span style="color: #1f2937; font-weight: 600; margin-left: 6px;">
                  ${new Date(listing.available_date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
              </div>
            ` : ''}
          </div>
        </div>
      `;

      const infoWindow = new google.maps.InfoWindow({
        content: infoContent,
        maxWidth: 380,
      });

      // Listen for InfoWindow close event
      infoWindow.addListener('closeclick', () => {
        // Smooth zoom out to show all USA
        const usaCenter = { lat: 39.8283, lng: -98.5795 }; // Center of USA
        map.panTo(usaCenter);

        // Smooth zoom transition back to USA view
        const targetZoom = 4; // USA-level zoom
        const currentZoom = map.getZoom() || 18;
        const zoomStep = currentZoom > targetZoom ? -1 : 1;

        const smoothZoom = (current: number, target: number) => {
          if (current !== target) {
            const next = current + zoomStep;
            map.setZoom(next);
            setTimeout(() => smoothZoom(next, target), 100); // Slightly slower for zoom out
          }
        };

        smoothZoom(currentZoom, targetZoom);

        // Clear the selected listing
        if (onListingClick) {
          onListingClick(null as any);
        }
      });

      // Click handler for listing
      marker.addListener("click", () => {
        // Close any open info windows
        listingMarkers.forEach((m) => {
          const iw = (m as any).infoWindow;
          if (iw) iw.close();
        });

        if (onListingClick) {
          onListingClick(listing);
        }

        // Smooth zoom and pan to the listing location first
        map.panTo(position);

        // Smooth zoom transition to building level (not too close)
        const targetZoom = 14; // Neighborhood-level zoom to keep InfoWindow visible
        const currentZoom = map.getZoom() || 4;
        const zoomStep = currentZoom < targetZoom ? 1 : -1;

        const smoothZoom = (current: number, target: number) => {
          if (current !== target) {
            const next = current + zoomStep;
            map.setZoom(next);
            setTimeout(() => smoothZoom(next, target), 80);
          } else {
            // Once zoom is complete, adjust the pan to center the marker and InfoWindow
            setTimeout(() => {
              // Pan down by 150 pixels to give space for InfoWindow above the marker
              map.panBy(0, -150);

              // Open the info window after re-centering
              setTimeout(() => {
                infoWindow.open(map, marker);
              }, 200);
            }, 100);
          }
        };

        smoothZoom(currentZoom, targetZoom);
      });

      // Store the info window reference and listing ID on the marker for later access
      (marker as any).infoWindow = infoWindow;
      (marker as any).listingId = listing.id;

      newListingMarkers.push(marker);
    });

    setListingMarkers(newListingMarkers);
  }, [map, brokerListings, onListingClick]);

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

  // Highlight selected listing - trigger marker click to zoom and open InfoWindow
  useEffect(() => {
    if (!map || !selectedListing || listingMarkers.length === 0 || !window.google) return;

    // Find the marker that matches the selected listing
    const marker = listingMarkers.find(
      (m) => (m as any).listingId === selectedListing.id
    );

    if (marker) {
      // Trigger the marker's click event to zoom and open InfoWindow
      window.google.maps.event.trigger(marker, 'click');
    }
  }, [map, selectedListing, listingMarkers]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full" />

      {/* Map Legend */}
      <div className="absolute bottom-6 left-6 bg-white rounded-lg shadow-lg p-4 border border-gray-200">
        <div className="text-xs font-semibold text-gray-700 mb-2">Map Legend</div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-indigo-600 border-2 border-white flex items-center justify-center">
              <span className="text-white text-[8px] font-bold">1</span>
            </div>
            <span className="text-xs text-gray-600">Federal Opportunities</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-orange-500 border-2 border-white"></div>
            <span className="text-xs text-gray-600">Available Properties</span>
          </div>
        </div>
      </div>

      {opportunities.length === 0 && brokerListings.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75">
          <p className="text-gray-500">No opportunities to display</p>
        </div>
      )}
    </div>
  );
}
