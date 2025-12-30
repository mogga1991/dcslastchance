"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Maximize2,
  DollarSign,
  Calendar,
  ChevronDown,
  ChevronUp,
  Building2,
  Image as ImageIcon,
} from "lucide-react";
import PropertyActionsMenu from "./property-actions-menu";
import ExpandedMatchesView from "./expanded-matches-view";

interface BrokerListing {
  id: string;
  title: string | null;
  street_address: string;
  city: string;
  state: string;
  zipcode: string;
  total_sf: number;
  available_sf: number;
  asking_rent_sf: number | null;
  property_type: string | null;
  building_class: string | null;
  status: string;
  federal_score: number | null;
  views_count: number | null;
  created_at: string;
  available_date: string;
  images: string[] | null;
}

interface PropertyMatch {
  property_id: string;
  opportunity_count: number;
  best_match_score: number;
  opportunities: Array<{
    id: string;
    solicitation_number: string;
    title: string;
    agency: string;
    match_score: number;
    grade?: string;
    competitive?: boolean;
    qualified?: boolean;
    score_breakdown?: any;
  }>;
}

interface PropertyCardProps {
  property: BrokerListing;
  matches?: PropertyMatch;
  onDelete: (id: string) => void;
  deletingId: string | null;
}

export default function PropertyCard({
  property,
  matches,
  onDelete,
  deletingId,
}: PropertyCardProps) {
  const [showMatches, setShowMatches] = useState(false);

  const hasMatches = matches && matches.opportunity_count > 0;
  const hasImages = property.images && property.images.length > 0;

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      active: {
        label: "Active",
        className: "bg-green-100 text-green-700 border-green-200",
      },
      pending: {
        label: "Pending",
        className: "bg-yellow-100 text-yellow-700 border-yellow-200",
      },
      inactive: {
        label: "Inactive",
        className: "bg-gray-100 text-gray-700 border-gray-200",
      },
      archived: {
        label: "Archived",
        className: "bg-red-100 text-red-700 border-red-200",
      },
    };

    const config = statusMap[status] || statusMap.active;
    return (
      <Badge variant="outline" className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const formatCurrency = (amount: number | null) => {
    if (!amount) return "Contact for pricing";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat("en-US").format(value);
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group">
      {/* Image Section */}
      <Link href={`/dashboard/available-properties/${property.id}`}>
        <div className="relative h-64 bg-gradient-to-br from-indigo-50 to-indigo-100 overflow-hidden">
          {hasImages && property.images ? (
            <>
              <Image
                src={property.images[0]}
                alt={property.title || property.street_address}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              {property.images.length > 1 && (
                <div className="absolute top-3 right-3 z-10">
                  <Badge className="bg-black/60 text-white border-none">
                    <ImageIcon className="h-3 w-3 mr-1" />
                    {property.images.length}
                  </Badge>
                </div>
              )}
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <Building2 className="h-20 w-20 text-indigo-300" />
            </div>
          )}

          {/* Status Badge */}
          <div className="absolute top-3 left-3 z-10">
            {getStatusBadge(property.status)}
          </div>

          {/* Match Indicator Badge */}
          {hasMatches && matches.opportunity_count > 0 && (
            <div className="absolute top-3 left-3 z-10 ml-20">
              <div className="h-6 px-2.5 flex items-center justify-center bg-blue-600 text-white text-xs font-semibold rounded-md shadow-sm">
                {matches.opportunity_count} {matches.opportunity_count === 1 ? 'Match' : 'Matches'}
              </div>
            </div>
          )}

          {/* Actions Menu */}
          <div className="absolute top-3 right-3 z-10" onClick={(e) => e.preventDefault()}>
            <PropertyActionsMenu
              propertyId={property.id}
              propertyStatus={property.status}
              onDelete={() => onDelete(property.id)}
              onViewMatches={() => setShowMatches(!showMatches)}
              disabled={deletingId === property.id}
            />
          </div>
        </div>
      </Link>

      {/* Content Section */}
      <div className="p-5">
        <Link href={`/dashboard/available-properties/${property.id}`}>
          {/* Title */}
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1 group-hover:text-indigo-600 transition-colors">
            {property.title || `${property.street_address}, ${property.city}`}
          </h3>

          {/* Location */}
          <div className="flex items-start gap-1.5 text-gray-600 mb-4">
            <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <p className="text-sm line-clamp-1">
              {property.street_address}, {property.city}, {property.state} {property.zipcode}
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                <Maximize2 className="h-4 w-4 text-indigo-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Available SF</p>
                <p className="text-sm font-semibold text-gray-900">
                  {formatNumber(property.available_sf)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-green-50 flex items-center justify-center">
                <DollarSign className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Price/SF</p>
                <p className="text-sm font-semibold text-gray-900">
                  {property.asking_rent_sf
                    ? formatCurrency(property.asking_rent_sf)
                    : "N/A"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-amber-50 flex items-center justify-center">
                <Calendar className="h-4 w-4 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Available</p>
                <p className="text-sm font-semibold text-gray-900">
                  {formatDate(property.available_date)}
                </p>
              </div>
            </div>

            {property.building_class && (
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-purple-50 flex items-center justify-center">
                  <Building2 className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Class</p>
                  <p className="text-sm font-semibold text-gray-900 capitalize">
                    {property.building_class.replace("_", " ")}
                  </p>
                </div>
              </div>
            )}
          </div>
        </Link>

        {/* Matches Section */}
        {hasMatches && (
          <div className="mt-4 pt-4 border-t">
            <Button
              variant="outline"
              className="w-full justify-between"
              onClick={() => setShowMatches(!showMatches)}
            >
              <span className="font-medium">
                {matches.opportunity_count} GSA{" "}
                {matches.opportunity_count === 1 ? "Match" : "Matches"}
              </span>
              {showMatches ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Expanded Matches */}
      {showMatches && hasMatches && (
        <div className="border-t bg-gray-50">
          <ExpandedMatchesView
            matches={matches.opportunities.map((opp) => ({
              id: `${property.id}-${opp.id}`,
              opportunity_id: opp.id,
              overall_score: opp.match_score,
              grade: opp.grade || "C",
              competitive: opp.competitive || false,
              qualified: opp.qualified || false,
              score_breakdown: opp.score_breakdown,
              opportunity: {
                id: opp.id,
                title: opp.title,
                solicitation_number: opp.solicitation_number,
                agency: opp.agency,
              },
            }))}
            propertyId={property.id}
            propertyTitle={property.title || undefined}
          />
        </div>
      )}
    </Card>
  );
}
