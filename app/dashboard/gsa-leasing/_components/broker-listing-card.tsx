import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Building2, DollarSign, Calendar, Eye, Star, ExternalLink } from "lucide-react";
import type { BrokerListing } from "@/types/broker-listing";

interface BrokerListingCardProps {
  listing: BrokerListing;
  isSelected: boolean;
  onClick: () => void;
  onViewDetails: (e: React.MouseEvent) => void;
}

export function BrokerListingCard({ listing, isSelected, onClick, onViewDetails }: BrokerListingCardProps) {
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
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
    if (type === 'office') return 'Class A';
    if (type === 'medical') return 'Medical';
    if (type === 'warehouse' || type === 'industrial') return 'Industrial';
    return 'Commercial';
  };

  const getGradeFromScore = (score: number) => {
    if (score >= 90) return { grade: 'A+', color: 'text-green-600' };
    if (score >= 80) return { grade: 'A', color: 'text-green-600' };
    if (score >= 70) return { grade: 'B', color: 'text-blue-600' };
    if (score >= 60) return { grade: 'C', color: 'text-yellow-600' };
    return { grade: 'D', color: 'text-gray-600' };
  };

  const scoreInfo = listing.federal_score ? getGradeFromScore(listing.federal_score) : null;

  return (
    <Card
      className={`overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-lg ${
        isSelected ? "ring-2 ring-blue-500 shadow-lg" : ""
      }`}
      onClick={onClick}
    >
      {/* Image Section */}
      <div className="relative h-48 bg-gradient-to-br from-blue-100 via-blue-50 to-gray-100">
        {/* Placeholder for building image */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Building2 className="h-16 w-16 text-gray-300" />
        </div>

        {/* Property Class Badge - Top Right */}
        <div className="absolute top-3 right-3">
          <Badge className="bg-white/90 text-gray-800 font-semibold shadow-sm">
            {getPropertyClass(listing.property_type)}
          </Badge>
        </div>

        {/* GSA Eligible Badge - Top Left */}
        {listing.gsa_eligible && (
          <div className="absolute top-3 left-3">
            <Badge className="bg-green-600 text-white font-semibold shadow-sm">
              GSA Eligible
            </Badge>
          </div>
        )}

        {/* Federal Score - Bottom Right */}
        {scoreInfo && (
          <div className="absolute bottom-3 right-3">
            <div className="bg-white/95 rounded-lg px-3 py-2 shadow-md">
              <div className="text-xs text-gray-600 font-medium">Federal Score</div>
              <div className={`text-2xl font-bold ${scoreInfo.color}`}>
                {scoreInfo.grade}
              </div>
              <div className="text-xs text-gray-500">{listing.federal_score}/100</div>
            </div>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <div>
          <h3 className="font-bold text-base line-clamp-2 mb-1">{listing.title}</h3>
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
            <span className="truncate">{listing.city}, {listing.state} {listing.zipcode}</span>
          </div>
        </div>

        {/* Key Metrics - Three Columns */}
        <div className="grid grid-cols-3 gap-2 py-3 border-y">
          <div className="text-center">
            <div className="text-xs text-gray-500 mb-0.5">Available SF</div>
            <div className="font-bold text-sm">{formatSquareFeet(listing.available_sf)}</div>
          </div>
          <div className="text-center border-x">
            <div className="text-xs text-gray-500 mb-0.5">Lease Rate</div>
            <div className="font-bold text-sm">{formatCurrency(listing.asking_rent_sf)}/SF</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-500 mb-0.5">Available</div>
            <div className="font-bold text-sm">{formatDate(listing.available_date)}</div>
          </div>
        </div>

        {/* Feature Badges */}
        {listing.features && listing.features.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {listing.features.slice(0, 4).map((feature) => (
              <Badge
                key={feature}
                variant="outline"
                className="text-xs bg-blue-50 text-blue-700 border-blue-200"
              >
                {feature.replace('_', ' ')}
              </Badge>
            ))}
            {listing.features.length > 4 && (
              <Badge variant="outline" className="text-xs">
                +{listing.features.length - 4} more
              </Badge>
            )}
          </div>
        )}

        {/* Description */}
        <p className="text-xs text-gray-600 line-clamp-2">
          {listing.description}
        </p>

        {/* Set-Aside Tags */}
        {listing.set_aside_eligible && listing.set_aside_eligible.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {listing.set_aside_eligible.slice(0, 3).map((setAside) => (
              <Badge
                key={setAside}
                variant="outline"
                className="text-xs bg-amber-50 text-amber-700 border-amber-200"
              >
                <Star className="h-3 w-3 mr-1" />
                {setAside.toUpperCase()}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Footer - Stats & Actions */}
      <div className="px-4 py-3 bg-gray-50 border-t flex items-center justify-between">
        <div className="flex items-center gap-4 text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <Eye className="h-3.5 w-3.5" />
            <span>{listing.views_count || 0} views</span>
          </div>
        </div>
        <Button
          size="sm"
          onClick={onViewDetails}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          View Details
          <ExternalLink className="h-3.5 w-3.5 ml-1.5" />
        </Button>
      </div>
    </Card>
  );
}
