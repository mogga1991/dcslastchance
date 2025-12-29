"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PropertyImageGallery } from "@/components/property-image-gallery";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Building2,
  Calendar,
  DollarSign,
  Maximize2,
  Star,
  ArrowLeft,
  Phone,
  Mail,
  Home,
  Layers,
} from "lucide-react";
import type { PublicBrokerListing } from "@/types/broker-listing";

interface PropertyDetailClientProps {
  propertyId: string;
}

export default function PropertyDetailClient({ propertyId }: PropertyDetailClientProps) {
  const router = useRouter();
  const [property, setProperty] = useState<PublicBrokerListing | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const response = await fetch(`/api/broker-listings/${propertyId}`);
        if (!response.ok) throw new Error("Property not found");
        const data = await response.json();
        setProperty(data.data);
      } catch (error) {
        console.error("Error fetching property:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [propertyId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading property details...</p>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Property Not Found</h2>
          <p className="text-gray-600 mb-4">The property you're looking for doesn't exist.</p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat("en-US").format(value);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-8 py-6">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6 text-gray-600 hover:text-gray-900 pl-0"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Listings
        </Button>

        {/* Image Gallery */}
        <div className="mb-8">
          <PropertyImageGallery
            images={property.images || []}
            propertyTitle={property.title || property.street_address}
            layout="cards"
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Title and Address */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-3">
                {property.title || `${property.street_address}, ${property.city}, ${property.state}`}
              </h1>
              <div className="flex items-start text-gray-600">
                <MapPin className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-base">
                  {property.street_address}
                  {property.suite_unit && `, ${property.suite_unit}`}, {property.city}, {property.state} {property.zipcode}
                </span>
              </div>
            </div>

            {/* Property Details Card */}
            <div className="bg-white border-t border-b py-6">
              <h2 className="text-lg font-semibold mb-6 flex items-center">
                <Building2 className="h-5 w-5 mr-2" />
                Property Details
              </h2>
              <div className="grid grid-cols-3 gap-x-8 gap-y-6">
                <PropertyDetailItem
                  icon={<Maximize2 className="h-5 w-5 text-gray-400" />}
                  label="Total SF"
                  value={formatNumber(property.total_sf)}
                />
                <PropertyDetailItem
                  icon={<Layers className="h-5 w-5 text-gray-400" />}
                  label="Available SF"
                  value={formatNumber(property.available_sf)}
                />
                <PropertyDetailItem
                  icon={<DollarSign className="h-5 w-5 text-gray-400" />}
                  label="Lease Rate"
                  value={`${formatCurrency(property.asking_rent_sf)}/SF`}
                />
                <PropertyDetailItem
                  icon={<Calendar className="h-5 w-5 text-gray-400" />}
                  label="Available Date"
                  value={formatDate(property.available_date)}
                />
                <PropertyDetailItem
                  icon={<Home className="h-5 w-5 text-gray-400" />}
                  label="Property Type"
                  value={property.property_type || "Office"}
                  capitalize
                />
                <PropertyDetailItem
                  icon={<Star className="h-5 w-5 text-gray-400" />}
                  label="Building Class"
                  value={`Class ${property.building_class || 'B'}`}
                />
              </div>
            </div>

            {/* About This Property */}
            {property.description && (
              <div className="py-6">
                <h2 className="text-lg font-semibold mb-4">About This Property</h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {property.description}
                </p>
              </div>
            )}

            {/* Additional Information */}
            {property.notes && (
              <div className="py-6 border-t">
                <h2 className="text-lg font-semibold mb-4">Additional Information</h2>
                <p className="text-gray-700 leading-relaxed">
                  {property.notes}
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Information Card */}
            <div className="bg-white border rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Listed By</p>
                  <p className="font-medium text-gray-900">
                    Owner
                  </p>
                </div>
                <div className="space-y-3">
                  <Button
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                    size="lg"
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Contact Broker
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
                    size="lg"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                </div>
                <div className="pt-4 border-t">
                  <p className="text-xs text-gray-500 text-center">
                    By contacting, you agree to our Terms of Service and Privacy Policy.
                  </p>
                </div>
              </div>
            </div>

            {/* Federal Score Card */}
            {property.federal_score && (
              <div className="bg-white border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-2">Federal Suitability</h3>
                <div className="text-center">
                  <div className="text-5xl font-bold text-indigo-600 mb-2">
                    {property.federal_score}
                  </div>
                  <p className="text-sm text-gray-600">Out of 100</p>
                  <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-2 rounded-full transition-all"
                      style={{ width: `${property.federal_score}%` }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function PropertyDetailItem({
  icon,
  label,
  value,
  capitalize = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  capitalize?: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5">{icon}</div>
      <div className="flex-1">
        <p className="text-sm text-gray-500 mb-1">{label}</p>
        <p className={`text-base font-semibold text-gray-900 ${capitalize ? 'capitalize' : ''}`}>
          {value}
        </p>
      </div>
    </div>
  );
}
