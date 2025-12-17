import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Building2,
  Mail,
  Star,
  Eye,
  CheckCircle2,
  X
} from "lucide-react";
import type { PublicBrokerListing } from "@/types/broker-listing";
import { FederalScoreBadge } from "./federal-score-badge";

interface ListingDetailModalProps {
  listing: PublicBrokerListing | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ListingDetailModal({ listing, open, onOpenChange }: ListingDetailModalProps) {
  if (!listing || !open) return null;

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2
    }).format(value);
  };

  const formatSquareFeet = (sf: number) => {
    return new Intl.NumberFormat("en-US").format(sf);
  };

  const getPropertyClass = (type: string) => {
    if (type === 'office') return 'Class A Office';
    if (type === 'medical') return 'Medical Facility';
    if (type === 'warehouse' || type === 'industrial') return 'Industrial Space';
    return 'Commercial Property';
  };

  return (
    <div className="absolute inset-0 bg-white z-50 overflow-y-auto">
      {/* Close Button - Fixed Position */}
      <button
        onClick={() => onOpenChange(false)}
        className="fixed top-4 right-4 z-50 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-colors"
        aria-label="Close"
      >
        <X className="h-6 w-6" />
      </button>

      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 pr-16">{listing.title}</h1>
        </div>

        <div className="space-y-6">
          {/* Image Gallery Placeholder */}
          <div className="relative h-64 bg-gradient-to-br from-blue-100 via-blue-50 to-gray-100 rounded-lg">
            <div className="absolute inset-0 flex items-center justify-center">
              <Building2 className="h-24 w-24 text-gray-300" />
            </div>

            {/* Badges */}
            <div className="absolute top-4 left-4 flex gap-2">
              {listing.gsa_eligible && (
                <Badge className="bg-green-600 text-white font-semibold">
                  GSA Eligible
                </Badge>
              )}
              <Badge className="bg-white/90 text-gray-800 font-semibold">
                {getPropertyClass(listing.property_type)}
              </Badge>
            </div>

            {/* Federal Score */}
            {listing.federal_score && (
              <div className="absolute bottom-4 right-4">
                <FederalScoreBadge
                  score={listing.federal_score}
                  scoreData={listing.federal_score_data}
                />
              </div>
            )}
          </div>

          {/* Key Stats */}
          <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-1">Total SF</div>
              <div className="text-xl font-bold">{formatSquareFeet(listing.total_sf)}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-1">Available SF</div>
              <div className="text-xl font-bold text-blue-600">{formatSquareFeet(listing.available_sf)}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-1">Lease Rate</div>
              <div className="text-xl font-bold">{formatCurrency(listing.asking_rent_sf)}/SF</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-1">Available</div>
              <div className="text-lg font-bold">{formatDate(listing.available_date)}</div>
            </div>
          </div>

          {/* Location */}
          <div>
            <h3 className="font-semibold text-lg mb-2 flex items-center">
              <MapPin className="h-5 w-5 mr-2 text-blue-600" />
              Location
            </h3>
            <div className="text-gray-700">
              {listing.street_address}
              {listing.suite_unit && `, ${listing.suite_unit}`}
              <br />
              {listing.city}, {listing.state} {listing.zipcode}
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="font-semibold text-lg mb-2">Description</h3>
            <p className="text-gray-700 leading-relaxed">{listing.description}</p>
          </div>

          {/* Features & Amenities */}
          <div className="grid grid-cols-2 gap-4">
            {/* Features */}
            {listing.features && listing.features.length > 0 && (
              <div>
                <h3 className="font-semibold text-lg mb-3 flex items-center">
                  <CheckCircle2 className="h-5 w-5 mr-2 text-green-600" />
                  Features
                </h3>
                <div className="space-y-2">
                  {listing.features.map((feature) => (
                    <div key={feature} className="flex items-center text-sm">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mr-2"></div>
                      <span className="capitalize">{feature.replace('_', ' ')}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Amenities */}
            {listing.amenities && listing.amenities.length > 0 && (
              <div>
                <h3 className="font-semibold text-lg mb-3 flex items-center">
                  <Star className="h-5 w-5 mr-2 text-amber-600" />
                  Amenities
                </h3>
                <div className="space-y-2">
                  {listing.amenities.map((amenity) => (
                    <div key={amenity} className="flex items-center text-sm">
                      <div className="w-2 h-2 bg-amber-600 rounded-full mr-2"></div>
                      <span className="capitalize">{amenity.replace('_', ' ')}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Set-Aside Eligibility */}
          {listing.set_aside_eligible && listing.set_aside_eligible.length > 0 && (
            <div>
              <h3 className="font-semibold text-lg mb-3">Set-Aside Eligibility</h3>
              <div className="flex flex-wrap gap-2">
                {listing.set_aside_eligible.map((setAside) => (
                  <Badge
                    key={setAside}
                    className="bg-amber-100 text-amber-800 border-amber-300"
                  >
                    <Star className="h-3.5 w-3.5 mr-1" />
                    {setAside.toUpperCase()}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Lease Details */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-lg mb-3">Lease Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Lease Type:</span>
                <span className="ml-2 font-medium capitalize">{listing.lease_type.replace('_', ' ')}</span>
              </div>
              {listing.min_divisible_sf && (
                <div>
                  <span className="text-gray-600">Min Divisible:</span>
                  <span className="ml-2 font-medium">{formatSquareFeet(listing.min_divisible_sf)} SF</span>
                </div>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between text-sm text-gray-600 pt-4 border-t">
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              <span>{listing.views_count || 0} views</span>
            </div>
            <div className="text-xs text-gray-500">
              Listed {formatDate(listing.created_at)}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button className="flex-1 bg-blue-600 hover:bg-blue-700" size="lg">
              <Mail className="h-4 w-4 mr-2" />
              Express Interest
            </Button>
            <Button variant="outline" className="flex-1" size="lg">
              <Star className="h-4 w-4 mr-2" />
              Save Listing
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
