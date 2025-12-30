"use client";

import { useEffect, useRef, useState } from "react";
import { SAMOpportunity } from "@/lib/sam-gov";
import type { PublicBrokerListing } from "@/types/broker-listing";
import { FloatingInfoCard } from "./floating-info-card";

interface OpportunitiesMapProps {
  opportunities: SAMOpportunity[];
  brokerListings?: PublicBrokerListing[];
  selectedOpportunity: SAMOpportunity | null;
  selectedListing?: PublicBrokerListing | null;
  onOpportunityClick?: (opportunity: SAMOpportunity) => void;
  onListingClick?: (listing: PublicBrokerListing) => void;
  onPinClick?: (opportunities: SAMOpportunity[]) => void;
  onInfoCardClose?: () => void;
  onViewDetails?: () => void;
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
  onInfoCardClose,
  onViewDetails,
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

    // Track markers by location for offset calculation
    const locationCounts = new Map<string, number>();

    let geocodedCount = 0;
    const totalOpportunities = opportunities.length;

    // Helper function to create InfoWindow content for opportunities
    const createOpportunityInfoContent = (opp: SAMOpportunity) => {
      const deadline = opp.responseDeadLine
        ? new Date(opp.responseDeadLine).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          })
        : 'Not specified';

      const postedDate = opp.postedDate
        ? new Date(opp.postedDate).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          })
        : 'Unknown';

      // Truncate description to ~200 characters
      const shortDescription = opp.description
        ? (opp.description.length > 200
            ? opp.description.substring(0, 200) + '...'
            : opp.description)
        : 'No description available.';

      return `
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
          <div style="padding: 6px 2px;">
            <h3 style="font-size: 15px; font-weight: 600; margin: 0 0 10px 0; color: #1f2937; line-height: 1.3;">
              ${opp.title}
            </h3>
            <div style="margin-bottom: 12px;">
              <p style="font-size: 13px; color: #6b7280; margin: 0 0 2px 0; line-height: 1.4;">
                ${opp.placeOfPerformance?.streetAddress || ''}
              </p>
              <p style="font-size: 13px; color: #6b7280; margin: 0;">
                ${opp.placeOfPerformance?.city?.name || ''}, ${opp.placeOfPerformance?.state?.code || ''} ${opp.placeOfPerformance?.zip || ''}
              </p>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 12px;">
              <div style="font-size: 12px;">
                <div style="color: #9ca3af; margin-bottom: 2px;">Solicitation #</div>
                <div style="color: #1f2937; font-weight: 600;">
                  ${opp.solicitationNumber || 'N/A'}
                </div>
              </div>
              <div style="font-size: 12px;">
                <div style="color: #9ca3af; margin-bottom: 2px;">Notice ID</div>
                <div style="color: #1f2937; font-weight: 600;">
                  ${opp.noticeId}
                </div>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 12px;">
              <div style="font-size: 12px;">
                <div style="color: #9ca3af; margin-bottom: 2px;">Posted Date</div>
                <div style="color: #1f2937; font-weight: 600;">
                  ${postedDate}
                </div>
              </div>
              <div style="font-size: 12px;">
                <div style="color: #9ca3af; margin-bottom: 2px;">Response Deadline</div>
                <div style="color: #dc2626; font-weight: 600;">
                  ${deadline}
                </div>
              </div>
            </div>

            ${opp.typeOfSetAsideDescription ? `
              <div style="font-size: 12px; margin-bottom: 12px;">
                <span style="color: #9ca3af;">Set-Aside:</span>
                <span style="color: #1f2937; font-weight: 600; margin-left: 6px;">
                  ${opp.typeOfSetAsideDescription}
                </span>
              </div>
            ` : ''}

            <div style="font-size: 12px; color: #6b7280; margin-bottom: 12px; line-height: 1.5;">
              ${shortDescription}
            </div>

            ${(opp.naicsCode || opp.office) ? `
              <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 12px;">
                ${opp.naicsCode ? `
                  <span style="padding: 5px 10px; background: #e0e7ff; color: #4338ca; font-size: 11px; font-weight: 500; border-radius: 4px; white-space: nowrap;">
                    NAICS: ${opp.naicsCode}
                  </span>
                ` : ''}
                ${opp.office ? `
                  <span style="padding: 5px 10px; background: #f3f4f6; color: #374151; font-size: 11px; font-weight: 500; border-radius: 4px; white-space: nowrap;">
                    ${opp.office}
                  </span>
                ` : ''}
              </div>
            ` : ''}

            ${opp.uiLink ? `
              <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #e5e7eb;">
                <a
                  href="${opp.uiLink}"
                  target="_blank"
                  rel="noopener noreferrer"
                  style="display: inline-block; font-size: 12px; font-weight: 600; color: #4f46e5; text-decoration: none; padding: 6px 12px; background: #eef2ff; border-radius: 4px; transition: background 0.2s;"
                  onmouseover="this.style.background='#e0e7ff'"
                  onmouseout="this.style.background='#eef2ff'"
                >
                  View on SAM.gov →
                </a>
              </div>
            ` : ''}
          </div>
        </div>
      `;
    };

    // Create individual markers for each opportunity with slight offsets if in same location
    opportunities.forEach((opp) => {
      const city = opp.placeOfPerformance?.city?.name;
      const state = opp.placeOfPerformance?.state?.code;

      if (!city || !state) {
        geocodedCount++;
        return;
      }

      const locationKey = `${city}, ${state}`;

      // Geocode the location
      geocoder.geocode({ address: `${city}, ${state}, USA` }, (results, status) => {
        if (status === "OK" && results && results[0]) {
          const basePosition = results[0].geometry.location;

          // Calculate offset for markers in the same location
          const currentCount = locationCounts.get(locationKey) || 0;
          locationCounts.set(locationKey, currentCount + 1);

          // Apply small circular offset pattern (0.002 degrees ≈ 200 meters)
          const angle = (currentCount * 2 * Math.PI) / 5; // Distribute in circle (max 5 per ring)
          const ring = Math.floor(currentCount / 5);
          const radius = 0.002 * (ring + 1);

          const offsetLat = basePosition.lat() + (radius * Math.cos(angle));
          const offsetLng = basePosition.lng() + (radius * Math.sin(angle));

          const position = { lat: offsetLat, lng: offsetLng };

          const marker = new google.maps.Marker({
            position,
            map,
            title: opp.title,
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: "#6366F1", // Purple color for federal opportunities
              fillOpacity: 1,
              strokeColor: "white",
              strokeWeight: 2,
            },
            zIndex: 50, // Lower than listings (100) so listings appear on top
          });

          // Create InfoWindow with detailed card
          const infoWindow = new google.maps.InfoWindow({
            content: createOpportunityInfoContent(opp),
            maxWidth: 380,
          });

          // Listen for InfoWindow close event
          infoWindow.addListener('closeclick', () => {
            // Smooth zoom out to show all USA
            const usaCenter = { lat: 39.8283, lng: -98.5795 };
            map.panTo(usaCenter);

            // Smooth zoom transition back to USA view
            const targetZoom = 4;
            const currentZoom = map.getZoom() || 14;
            const zoomStep = currentZoom > targetZoom ? -1 : 1;

            const smoothZoom = (current: number, target: number) => {
              if (current !== target) {
                const next = current + zoomStep;
                map.setZoom(next);
                setTimeout(() => smoothZoom(next, target), 100);
              }
            };

            smoothZoom(currentZoom, targetZoom);
          });

          // Click handler
          marker.addListener("click", () => {
            // Close any open opportunity info windows
            newMarkers.forEach((m) => {
              const iw = (m as any).infoWindow;
              if (iw) iw.close();
            });

            // Smooth zoom and pan to the clicked location
            map.panTo(position);

            // Smooth zoom transition
            const targetZoom = 14;
            const currentZoom = map.getZoom() || 4;
            const zoomStep = currentZoom < targetZoom ? 1 : -1;

            const smoothZoom = (current: number, target: number) => {
              if (current !== target) {
                const next = current + zoomStep;
                map.setZoom(next);
                setTimeout(() => smoothZoom(next, target), 80);
              } else {
                // Once zoom is complete, open InfoWindow
                setTimeout(() => {
                  // Pan down to give space for InfoWindow
                  map.panBy(0, -150);
                  setTimeout(() => {
                    infoWindow.open(map, marker);
                    if (onOpportunityClick) onOpportunityClick(opp);
                  }, 200);
                }, 100);
              }
            };

            smoothZoom(currentZoom, targetZoom);
          });

          // Store the info window reference on the marker
          (marker as any).infoWindow = infoWindow;

          newMarkers.push(marker);
          bounds.extend(basePosition);
        }

        // Increment count and check if all geocoding is complete
        geocodedCount++;
        if (geocodedCount === totalOpportunities && newMarkers.length > 0) {
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

      // Click handler for listing - simplified (no InfoWindow)
      marker.addListener("click", () => {
        // Notify parent that listing was clicked
        if (onListingClick) {
          onListingClick(listing);
        }

        // Smooth zoom and pan to the listing location
        map.panTo(position);

        // Smooth zoom transition to city level
        const targetZoom = 10; // City level zoom (changed from 14 for neighborhood)
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
      });

      // Store the listing ID on the marker for later access
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

  // Highlight selected listing - pan to marker position
  useEffect(() => {
    if (!map || !selectedListing || listingMarkers.length === 0 || !window.google) return;

    // Find the marker that matches the selected listing
    const marker = listingMarkers.find(
      (m) => (m as any).listingId === selectedListing.id
    );

    if (marker) {
      // Just pan to the marker (FloatingInfoCard will show the details)
      const position = marker.getPosition();
      if (position) {
        map.panTo(position);
      }
    }
  }, [map, selectedListing, listingMarkers]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full" />

      {/* Floating Info Card for Selected Listing */}
      {selectedListing && (
        <FloatingInfoCard
          listing={selectedListing}
          onClose={() => {
            if (onInfoCardClose) {
              onInfoCardClose();
            }

            // Zoom back to USA view
            if (map) {
              const usaCenter = { lat: 39.8283, lng: -98.5795 };
              map.panTo(usaCenter);

              // Smooth zoom transition back to USA view
              const targetZoom = 4;
              const currentZoom = map.getZoom() || 14;
              const zoomStep = currentZoom > targetZoom ? -1 : 1;

              const smoothZoom = (current: number, target: number) => {
                if (current !== target) {
                  const next = current + zoomStep;
                  map.setZoom(next);
                  setTimeout(() => smoothZoom(next, target), 80);
                }
              };

              smoothZoom(currentZoom, targetZoom);
            }
          }}
          onViewDetails={() => {
            if (onViewDetails) {
              onViewDetails();
            }
          }}
          position="right"
        />
      )}

      {/* Map Legend */}
      <div className="absolute bottom-6 left-6 bg-white rounded-lg shadow-lg p-4 border border-gray-200">
        <div className="text-xs font-semibold text-gray-700 mb-2">Map Legend</div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-indigo-600 border-2 border-white flex items-center justify-center">
              <span className="text-white text-[8px] font-bold">1</span>
            </div>
            <span className="text-xs text-gray-600">
              Federal Opportunities ({opportunities.length})
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-orange-500 border-2 border-white"></div>
            <span className="text-xs text-gray-600">
              Available Properties ({brokerListings.length})
            </span>
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
