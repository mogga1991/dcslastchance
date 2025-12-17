import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Building2,
  Mail,
  Star,
  Eye,
  CheckCircle2,
  X,
  Calendar,
  DollarSign,
  Maximize2,
  Home,
  Shield,
  Award,
  User,
  Phone,
  Globe
} from "lucide-react";
import type { PublicBrokerListing } from "@/types/broker-listing";
import { FederalScoreBadge } from "./federal-score-badge";
import Image from "next/image";

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

function getImageForListing(listingId: string): string {
  const hash = listingId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return buildingImages[hash % buildingImages.length];
}

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

  const getGradeFromScore = (score: number) => {
    if (score >= 90) return { grade: 'A+', color: 'bg-green-600', textColor: 'text-green-900' };
    if (score >= 80) return { grade: 'A', color: 'bg-green-500', textColor: 'text-green-900' };
    if (score >= 70) return { grade: 'B', color: 'bg-blue-500', textColor: 'text-blue-900' };
    if (score >= 60) return { grade: 'C', color: 'bg-yellow-500', textColor: 'text-yellow-900' };
    return { grade: 'D', color: 'bg-gray-500', textColor: 'text-gray-900' };
  };

  const scoreInfo = listing.federal_score ? getGradeFromScore(listing.federal_score) : null;

  return (
    <div className="absolute inset-0 bg-slate-50 z-50 overflow-y-auto">
      {/* Close Button - Fixed Position */}
      <button
        onClick={() => onOpenChange(false)}
        className="fixed top-4 right-4 z-50 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-colors"
        aria-label="Close"
      >
        <X className="h-6 w-6" />
      </button>

      <div className="max-w-6xl mx-auto p-6">
        {/* Header with Property Styling */}
        <div className="bg-blue-600 text-white -mx-6 -mt-6 px-6 py-5 mb-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="h-5 w-5" />
                <span className="text-sm font-semibold uppercase tracking-wider opacity-90">
                  Commercial Property Listing
                </span>
              </div>
              <h1 className="text-2xl font-bold leading-tight pr-8">
                {listing.title}
              </h1>
              <div className="flex items-center gap-2 mt-3">
                <MapPin className="h-4 w-4 opacity-90" />
                <span className="text-sm opacity-90">
                  {listing.street_address}, {listing.city}, {listing.state} {listing.zipcode}
                </span>
              </div>
            </div>
            {listing.gsa_eligible && (
              <Badge className="bg-green-600 text-white font-bold text-sm px-4 py-2 shadow-lg">
                <Shield className="h-4 w-4 mr-1.5" />
                GSA ELIGIBLE
              </Badge>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {/* Hero Image */}
          <div className="relative h-80 rounded-lg overflow-hidden shadow-lg">
            <Image
              src={getImageForListing(listing.id)}
              alt={listing.title}
              className="w-full h-full object-cover"
              fill
              sizes="(max-width: 1200px) 100vw, 1200px"
              priority
            />

            {/* Property Class Overlay */}
            <div className="absolute top-4 left-4">
              <Badge className="bg-white/95 text-gray-800 font-semibold text-lg px-4 py-2 shadow-md">
                {getPropertyClass(listing.property_type)} Property
              </Badge>
            </div>

            {/* Federal Score Overlay */}
            {scoreInfo && (
              <div className="absolute bottom-4 right-4">
                <div className="bg-white/95 rounded-lg px-4 py-3 shadow-lg">
                  <div className="text-xs text-gray-600 font-medium mb-1">Federal Score</div>
                  <div className={`text-4xl font-bold ${scoreInfo.textColor}`}>
                    {scoreInfo.grade}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">{listing.federal_score}/100</div>
                </div>
              </div>
            )}
          </div>

          {/* Key Metrics Grid */}
          <div className="bg-white border-2 border-slate-200 rounded-lg overflow-hidden">
            <div className="bg-slate-100 px-5 py-3 border-b-2 border-slate-200">
              <h3 className="font-bold text-slate-900 uppercase tracking-wide text-sm">Property Metrics</h3>
            </div>
            <div className="p-6 grid grid-cols-4 gap-6">
              {/* Total SF */}
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <Home className="h-4 w-4 text-slate-600" />
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Total SF</span>
                </div>
                <p className="text-2xl font-bold text-slate-900">{formatSquareFeet(listing.total_sf)}</p>
              </div>

              {/* Available SF - Highlighted */}
              <div className="bg-blue-50 -m-2 p-4 rounded border-2 border-blue-200">
                <div className="flex items-center gap-1.5 mb-2">
                  <Maximize2 className="h-4 w-4 text-blue-700" />
                  <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">Available SF</span>
                </div>
                <p className="text-2xl font-bold text-blue-900">{formatSquareFeet(listing.available_sf)}</p>
              </div>

              {/* Lease Rate - Highlighted */}
              <div className="bg-green-50 -m-2 p-4 rounded border-2 border-green-200">
                <div className="flex items-center gap-1.5 mb-2">
                  <DollarSign className="h-4 w-4 text-green-700" />
                  <span className="text-xs font-bold text-green-700 uppercase tracking-wider">Lease Rate</span>
                </div>
                <p className="text-2xl font-bold text-green-900">{formatCurrency(listing.asking_rent_sf)}/SF</p>
              </div>

              {/* Available Date */}
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <Calendar className="h-4 w-4 text-slate-600" />
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Available</span>
                </div>
                <p className="text-lg font-bold text-slate-900">{formatDate(listing.available_date)}</p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white border-2 border-slate-200 rounded-lg overflow-hidden">
            <div className="bg-slate-100 px-5 py-3 border-b-2 border-slate-200">
              <h3 className="font-bold text-slate-900 uppercase tracking-wide text-sm">Property Description</h3>
            </div>
            <div className="p-5">
              <p className="text-slate-700 leading-relaxed">{listing.description}</p>
            </div>
          </div>

          {/* Features & Amenities */}
          <div className="grid grid-cols-2 gap-4">
            {/* Features */}
            {listing.features && listing.features.length > 0 && (
              <div className="bg-white border-2 border-slate-200 rounded-lg p-5">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <h4 className="font-bold text-slate-900 uppercase tracking-wide text-xs">Property Features</h4>
                </div>
                <div className="space-y-2">
                  {listing.features.map((feature) => (
                    <div key={feature} className="flex items-center text-sm">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mr-2"></div>
                      <span className="capitalize text-slate-700">{feature.replace('_', ' ')}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Amenities */}
            {listing.amenities && listing.amenities.length > 0 && (
              <div className="bg-white border-2 border-slate-200 rounded-lg p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Star className="h-4 w-4 text-amber-600" />
                  <h4 className="font-bold text-slate-900 uppercase tracking-wide text-xs">Amenities</h4>
                </div>
                <div className="space-y-2">
                  {listing.amenities.map((amenity) => (
                    <div key={amenity} className="flex items-center text-sm">
                      <div className="w-2 h-2 bg-amber-600 rounded-full mr-2"></div>
                      <span className="capitalize text-slate-700">{amenity.replace('_', ' ')}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Set-Aside Eligibility */}
          {listing.set_aside_eligible && listing.set_aside_eligible.length > 0 && (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-lg p-5">
              <h3 className="font-bold text-amber-900 mb-3 flex items-center">
                <Award className="h-5 w-5 mr-2" />
                Set-Aside Eligibility
              </h3>
              <div className="flex flex-wrap gap-2">
                {listing.set_aside_eligible.map((setAside) => (
                  <Badge
                    key={setAside}
                    className="bg-white text-amber-800 border-2 border-amber-300 font-bold px-3 py-1.5"
                  >
                    <Star className="h-3.5 w-3.5 mr-1" />
                    {setAside.toUpperCase()}
                  </Badge>
                ))}
              </div>
              <p className="text-sm text-amber-800 mt-3">
                This property qualifies for the set-aside programs listed above, making it eligible for certain government contract preferences.
              </p>
            </div>
          )}

          {/* Lease Details */}
          <div className="bg-white border-2 border-slate-200 rounded-lg overflow-hidden">
            <div className="bg-slate-100 px-5 py-3 border-b-2 border-slate-200">
              <h3 className="font-bold text-slate-900 uppercase tracking-wide text-sm">Lease Information</h3>
            </div>
            <div className="p-6 grid grid-cols-2 gap-6">
              <div>
                <div className="text-xs text-slate-600 mb-1 uppercase tracking-wider font-bold">Lease Type</div>
                <div className="text-lg font-semibold text-slate-900 capitalize">
                  {listing.lease_type.replace('_', ' ')}
                </div>
              </div>
              {listing.min_divisible_sf && (
                <div>
                  <div className="text-xs text-slate-600 mb-1 uppercase tracking-wider font-bold">Minimum Divisible</div>
                  <div className="text-lg font-semibold text-slate-900">
                    {formatSquareFeet(listing.min_divisible_sf)} SF
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Why This Property Section */}
          {listing.gsa_eligible && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg p-5">
              <h3 className="font-bold text-green-900 mb-3 flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                GSA Eligibility
              </h3>
              <p className="text-sm text-green-800 mb-4">
                This property meets General Services Administration (GSA) requirements, making it pre-qualified for federal government leasing opportunities. GSA-eligible properties often have priority consideration for government tenants.
              </p>
              <div className="bg-white border border-green-300 rounded p-3 text-sm text-green-900">
                <strong>Next Steps:</strong> Express your interest to connect with the listing agent and learn more about federal leasing opportunities for this property.
              </div>
            </div>
          )}

          {/* Property Stats Footer */}
          <div className="flex items-center justify-between text-sm py-4 border-t-2 border-slate-200">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-slate-600">
                <Eye className="h-4 w-4" />
                <span className="font-medium">{listing.views_count || 0} views</span>
              </div>
              {listing.lister_role && (
                <Badge variant="outline" className="text-xs">
                  <User className="h-3 w-3 mr-1" />
                  Listed by {listing.lister_role}
                </Badge>
              )}
            </div>
            <div className="text-xs text-slate-500">
              Listed {formatDate(listing.created_at)}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button className="flex-1 bg-green-700 hover:bg-green-800 text-white font-bold uppercase tracking-wide" size="lg">
              <Mail className="h-4 w-4 mr-2" />
              Contact Listing Agent
            </Button>
            <Button variant="outline" className="flex-1 border-2 font-bold uppercase tracking-wide" size="lg">
              <Star className="h-4 w-4 mr-2" />
              Save Listing
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
