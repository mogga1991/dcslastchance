import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Eye, Star, ExternalLink } from "lucide-react";
import Image from "next/image";
import type { PublicBrokerListing, ListerRole } from "@/types/broker-listing";

// Array of placeholder office/building images from Unsplash
const buildingImages = [
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=400&fit=crop', // Modern glass building
  'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=400&fit=crop', // Office building
  'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&h=400&fit=crop', // Corporate office
  'https://images.unsplash.com/photo-1554469384-e58fac16e23a?w=800&h=400&fit=crop', // Skyscraper
  'https://images.unsplash.com/photo-1577985043696-8bd54d9c4f19?w=800&h=400&fit=crop', // Office tower
  'https://images.unsplash.com/photo-1545324418-cc6e8fc3a3f0?w=800&h=400&fit=crop', // Business building
  'https://images.unsplash.com/photo-1464938050520-ef2270bb8ce8?w=800&h=400&fit=crop', // City building
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=400&fit=crop', // Commercial property
  'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=800&h=400&fit=crop', // Office exterior
  'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=800&h=400&fit=crop', // Business center
];

// Get consistent image based on listing ID
function getImageForListing(listingId: string): string {
  // Use listing ID to get a consistent index
  const hash = listingId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return buildingImages[hash % buildingImages.length];
}

// Helper function to get role badge styling and label
function getRoleBadge(role: ListerRole) {
  const badges = {
    owner: {
      label: "Listed by Owner",
      className: "bg-green-100 text-green-700 border-green-200",
    },
    broker: {
      label: "Listed by Broker",
      className: "bg-blue-100 text-blue-700 border-blue-200",
    },
    agent: {
      label: "Listed by Agent",
      className: "bg-purple-100 text-purple-700 border-purple-200",
    },
    salesperson: {
      label: "Listed by Sales",
      className: "bg-gray-100 text-gray-700 border-gray-200",
    },
  };
  return badges[role];
}

interface BrokerListingCardProps {
  listing: PublicBrokerListing;
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
      className={`group overflow-hidden cursor-pointer transition-all duration-300 bg-white rounded-2xl border-2 ${
        isSelected
          ? "border-indigo-400 shadow-lg scale-[1.02]"
          : "border-gray-100 hover:border-indigo-200 hover:shadow-md"
      }`}
      onClick={onClick}
    >
      {/* Image Section */}
      <div className="relative h-40 overflow-hidden bg-gray-200">
        <Image
          src={listing.images && listing.images.length > 0 ? listing.images[0] : getImageForListing(listing.id)}
          alt={listing.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />

        {/* Photo count badge */}
        {listing.images && listing.images.length > 1 && (
          <div className="absolute bottom-3 right-3">
            <Badge className="bg-black/60 text-white text-xs px-2 py-1 rounded-md backdrop-blur-sm">
              {listing.images.length} photos
            </Badge>
          </div>
        )}

        {/* GSA Eligible Badge - Top Left */}
        {listing.gsa_eligible && (
          <div className="absolute top-3 left-3">
            <Badge className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white font-medium shadow-lg text-xs px-3 py-1 rounded-full">
              GSA Eligible
            </Badge>
          </div>
        )}

        {/* Federal Score - Top Right */}
        {scoreInfo && (
          <div className="absolute top-3 right-3">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl px-3 py-2 shadow-lg">
              <div className={`text-2xl font-bold ${scoreInfo.color}`}>
                {scoreInfo.grade}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-3 space-y-2">
        {/* Title and Location */}
        <div>
          <h3 className="font-semibold text-base leading-tight line-clamp-2 text-gray-800 mb-2">
            {listing.title}
          </h3>
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
            <span className="truncate">{listing.city}, {listing.state} {listing.zipcode}</span>
          </div>
        </div>

        {/* Key Metrics Pills */}
        <div className="flex flex-wrap gap-2 pt-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-lg">
            <span className="text-xs text-gray-500">Available SF</span>
            <span className="text-xs font-semibold text-gray-800">{formatSquareFeet(listing.available_sf)}</span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-lg">
            <span className="text-xs text-gray-500">Rate</span>
            <span className="text-xs font-semibold text-gray-800">{formatCurrency(listing.asking_rent_sf)}/SF</span>
          </div>
          {listing.lister_role && (
            <div className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium ${getRoleBadge(listing.lister_role).className}`}>
              {getRoleBadge(listing.lister_role).label.replace('Listed by ', '')}
            </div>
          )}
        </div>

        {/* Feature Badges */}
        {listing.features && listing.features.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {listing.features.slice(0, 3).map((feature) => (
              <Badge
                key={feature}
                variant="outline"
                className="text-xs bg-blue-50 text-blue-700 border-blue-200"
              >
                {feature.replace('_', ' ')}
              </Badge>
            ))}
            {listing.features.length > 3 && (
              <Badge variant="outline" className="text-xs bg-gray-50 text-gray-600">
                +{listing.features.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Set-Aside Tags */}
        {listing.set_aside_eligible && listing.set_aside_eligible.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {listing.set_aside_eligible.slice(0, 2).map((setAside) => (
              <Badge
                key={setAside}
                className="text-xs bg-amber-50 text-amber-700 border border-amber-200"
              >
                <Star className="h-3 w-3 mr-1" />
                {setAside.toUpperCase()}
              </Badge>
            ))}
          </div>
        )}

        {/* Footer - Available date and action */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Available</p>
              <p className="text-sm font-semibold text-gray-800">{formatDate(listing.available_date)}</p>
            </div>
          </div>

          <Button
            size="sm"
            onClick={onViewDetails}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full h-9 px-4 text-sm font-medium transition-all group-hover:scale-105"
          >
            View
            <ExternalLink className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
