"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Eye, Star, ExternalLink, X, Calendar, DollarSign, Maximize2 } from "lucide-react";
import Image from "next/image";
import type { PublicBrokerListing } from "@/types/broker-listing";

// Array of placeholder office/building images from Unsplash
const buildingImages = [
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=400&fit=crop',
  'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=400&fit=crop',
  'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&h=400&fit=crop',
  'https://images.unsplash.com/photo-1554469384-e58fac16e23a?w=800&h=400&fit=crop',
  'https://images.unsplash.com/photo-1577985043696-8bd54d9c4f19?w=800&h=400&fit=crop',
  'https://images.unsplash.com/photo-1545324418-cc6e8fc3a3f0?w=800&h=400&fit=crop',
  'https://images.unsplash.com/photo-1464938050520-ef2270bb8ce8?w=800&h=400&fit=crop',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=400&fit=crop',
  'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=800&h=400&fit=crop',
  'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=800&h=400&fit=crop',
];

// Get consistent image based on listing ID
function getImageForListing(listingId: string): string {
  const hash = listingId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return buildingImages[hash % buildingImages.length];
}

function getGradeFromScore(score: number) {
  if (score >= 90) return { grade: 'A+', color: 'text-green-600', bgColor: 'bg-green-50' };
  if (score >= 80) return { grade: 'A', color: 'text-green-600', bgColor: 'bg-green-50' };
  if (score >= 70) return { grade: 'B', color: 'text-blue-600', bgColor: 'bg-blue-50' };
  if (score >= 60) return { grade: 'C', color: 'text-yellow-600', bgColor: 'bg-yellow-50' };
  return { grade: 'D', color: 'text-gray-600', bgColor: 'bg-gray-50' };
}

interface FloatingInfoCardProps {
  listing: PublicBrokerListing;
  onClose: () => void;
  onViewDetails: () => void;
  position?: 'right' | 'bottom';
}

export function FloatingInfoCard({
  listing,
  onClose,
  onViewDetails,
  position = 'right'
}: FloatingInfoCardProps) {
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

  const scoreInfo = listing.federal_score ? getGradeFromScore(listing.federal_score) : null;

  // Determine positioning classes based on position prop
  const positionClasses = position === 'bottom'
    ? 'bottom-0 left-0 right-0 max-h-[70vh] rounded-t-3xl slide-up'
    : 'top-0 right-0 bottom-0 w-[360px] slide-in-right';

  return (
    <>
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/20 z-40 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Floating Card */}
      <div
        className={`fixed ${positionClasses} bg-white shadow-2xl z-40 overflow-y-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 p-2 bg-gray-800/80 hover:bg-gray-900 text-white rounded-full shadow-lg transition-colors backdrop-blur-sm"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <Card className="border-0 shadow-none rounded-none">
          {/* Image Section */}
          <div className="relative h-48 overflow-hidden bg-gray-200">
            <Image
              src={listing.images && listing.images.length > 0 ? listing.images[0] : getImageForListing(listing.id)}
              alt={listing.title}
              className="w-full h-full object-cover"
              fill
              sizes="360px"
              priority
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
                <Badge className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white font-medium shadow-lg text-xs px-3 py-1.5 rounded-full">
                  GSA Eligible
                </Badge>
              </div>
            )}

            {/* Federal Score - Top Right (offset from close button) */}
            {scoreInfo && (
              <div className="absolute top-16 right-3">
                <div className={`${scoreInfo.bgColor} backdrop-blur-sm rounded-2xl px-3 py-2 shadow-lg border-2 border-white/50`}>
                  <div className={`text-2xl font-bold ${scoreInfo.color}`}>
                    {scoreInfo.grade}
                  </div>
                  <div className="text-xs text-gray-600 text-center">{listing.federal_score}</div>
                </div>
              </div>
            )}
          </div>

          {/* Content Section */}
          <div className="p-4 space-y-4">
            {/* Title and Location */}
            <div>
              <h3 className="font-bold text-lg leading-tight line-clamp-2 text-gray-900 mb-2">
                {listing.title}
              </h3>
              <div className="flex items-start text-sm text-gray-600">
                <MapPin className="h-4 w-4 mr-1.5 flex-shrink-0 mt-0.5" />
                <span className="line-clamp-2">
                  {listing.street_address}, {listing.city}, {listing.state} {listing.zipcode}
                </span>
              </div>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                <div className="flex items-center gap-1.5 mb-1">
                  <Maximize2 className="h-3.5 w-3.5 text-blue-700" />
                  <span className="text-xs font-semibold text-blue-700 uppercase">Available SF</span>
                </div>
                <p className="text-lg font-bold text-blue-900">{formatSquareFeet(listing.available_sf)}</p>
              </div>

              <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                <div className="flex items-center gap-1.5 mb-1">
                  <DollarSign className="h-3.5 w-3.5 text-green-700" />
                  <span className="text-xs font-semibold text-green-700 uppercase">Rate</span>
                </div>
                <p className="text-lg font-bold text-green-900">{formatCurrency(listing.asking_rent_sf)}/SF</p>
              </div>
            </div>

            {/* Property Class and Lease Type */}
            <div className="flex gap-2">
              <Badge className="bg-gray-100 text-gray-800 text-xs font-medium px-3 py-1">
                {getPropertyClass(listing.property_type)}
              </Badge>
              <Badge className="bg-gray-100 text-gray-800 text-xs font-medium px-3 py-1 capitalize">
                {listing.lease_type.replace('_', ' ')}
              </Badge>
            </div>

            {/* Feature Badges */}
            {listing.features && listing.features.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Features</p>
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
                      +{listing.features.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Set-Aside Tags */}
            {listing.set_aside_eligible && listing.set_aside_eligible.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Set-Aside Eligible</p>
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
                  {listing.set_aside_eligible.length > 2 && (
                    <Badge className="text-xs bg-amber-50 text-amber-700 border border-amber-200">
                      +{listing.set_aside_eligible.length - 2}
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Available Date */}
            <div className="flex items-center gap-2 text-sm pt-2 border-t border-gray-200">
              <Calendar className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">Available</p>
                <p className="font-semibold text-gray-800">{formatDate(listing.available_date)}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <Button
                onClick={onViewDetails}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg h-10 font-medium transition-all"
              >
                View Full Details
                <ExternalLink className="h-4 w-4 ml-2" />
              </Button>
              <Button
                variant="outline"
                className="w-full border-2 border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg h-10 font-medium"
              >
                Contact Agent
              </Button>
            </div>

            {/* View count */}
            <div className="flex items-center justify-center gap-2 text-xs text-gray-500 pt-2">
              <Eye className="h-3.5 w-3.5" />
              <span>{listing.views_count || 0} views</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Animation styles */}
      <style jsx>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .slide-in-right {
          animation: slideInRight 300ms ease-out;
        }

        .slide-up {
          animation: slideUp 300ms ease-out;
        }
      `}</style>
    </>
  );
}
