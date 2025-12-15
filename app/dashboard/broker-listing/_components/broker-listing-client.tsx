"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, MapPin, Building2, Eye, Users, Plus, Star } from "lucide-react";
import Image from "next/image";
import { PropertyMatchScore } from "@/components/broker/property-match-score";
import { generateMockPropertyScore, getMockOpportunityTitle } from "@/lib/scoring/mock-scores";
import { CreateListingDialog } from "./create-listing-dialog";
import type { ListerRole, BrokerListingInput } from "@/types/broker-listing";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface Property {
  id: string;
  name: string;
  location: string;
  image: string;
  available: string;
  leaseRate: string;
  size: string;
  availableDate: string;
  buildingType: string;
  class: string;
  tags: string[];
  description: string;
  inquiries: number;
  views: number;
  featured: boolean;
  listerRole: ListerRole;
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

// Mock data - Replace with actual API call
const MOCK_PROPERTIES: Property[] = [
  {
    id: "1",
    name: "Capitol Gateway Office Plaza",
    location: "Washington, DC 20004",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80",
    available: "45,000 SF",
    leaseRate: "$452.00/SF",
    size: "45,000 SF",
    availableDate: "Feb 2025",
    buildingType: "Active",
    class: "Class A+",
    tags: ["Level IV FSL", "LEED Platinum", "Energy Star", "+3 more"],
    description:
      "Premium Class A+ office space in prime federal District location. Full floor availability with 360-degree views. Features state-of-the-art infrastructure with...",
    inquiries: 23,
    views: 1547,
    featured: true,
    listerRole: "owner",
  },
  {
    id: "2",
    name: "Pentagon City Executive Tower",
    location: "Arlington, VA 22202",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80",
    available: "112,000 SF",
    leaseRate: "$478.00/SF",
    size: "112,000 SF",
    availableDate: "Apr 2025",
    buildingType: "Active",
    class: "Class A+",
    tags: ["Level IV FSL", "LEED Platinum", "Energy Star", "+4 more"],
    description:
      "Premier office campus adjacent to Pentagon City Metro. Multiple contiguous floors with stunning Pentagon and Potomac views. State-of-the-art building with security...",
    inquiries: 34,
    views: 1856,
    featured: true,
    listerRole: "broker",
  },
];

interface BrokerListingClientProps {
  userEmail?: string;
}

export default function BrokerListingClient({ userEmail }: BrokerListingClientProps) {
  const [properties] = useState<Property[]>(MOCK_PROPERTIES);
  const [searchTerm, setSearchTerm] = useState("");
  const [propertyType, setPropertyType] = useState("all");
  const [propertyClass, setPropertyClass] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const router = useRouter();

  const handleCreateListing = async (data: BrokerListingInput) => {
    try {
      const response = await fetch("/api/broker-listings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        alert(`Error creating listing: ${result.error || "Unknown error"}`);
        throw new Error(result.error || "Failed to create listing");
      }

      // Success! Redirect to GSA Leasing page to see the new listing on the map
      alert("Property listed successfully! Redirecting to GSA Leasing to view on map...");
      router.push("/dashboard/gsa-leasing");
    } catch (error) {
      console.error("Error creating listing:", error);
      throw error;
    }
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-8 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold mb-1">Government Property Marketplace</h1>
              <p className="text-gray-600">Premium commercial real estate for federal agencies</p>
            </div>
            <div className="flex gap-2">
              <Button variant="default">Browse Listings</Button>
              <Button variant="outline">Manage Portfolio</Button>
              <CreateListingDialog onSubmit={handleCreateListing} userEmail={userEmail} />
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by property name, location, or address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={propertyType} onValueChange={setPropertyType}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="office">Office</SelectItem>
                <SelectItem value="warehouse">Warehouse</SelectItem>
                <SelectItem value="retail">Retail</SelectItem>
              </SelectContent>
            </Select>
            <Select value={propertyClass} onValueChange={setPropertyClass}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Classes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                <SelectItem value="a">Class A</SelectItem>
                <SelectItem value="b">Class B</SelectItem>
                <SelectItem value="c">Class C</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Newest First" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Properties Grid */}
      <div className="flex-1 px-8 py-6">
        <div className="max-w-7xl mx-auto">
          <p className="text-gray-600 mb-6">Showing {properties.length} properties</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {properties.map((property) => (
              <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative h-56 bg-gray-200">
                  {/* Property Image */}
                  <Image
                    src={property.image}
                    alt={property.name}
                    fill
                    className="object-cover"
                  />

                  {/* Featured badge - top left */}
                  {property.featured && (
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-blue-600 hover:bg-blue-700 flex items-center gap-1">
                        <Star className="h-3 w-3 fill-white" />
                        Featured
                      </Badge>
                    </div>
                  )}

                  {/* Class badge - top right */}
                  <div className="absolute top-3 right-3">
                    <Badge variant="secondary" className="bg-white/90 text-gray-900">
                      {property.class}
                    </Badge>
                  </div>
                </div>

                <CardContent className="p-6">
                  {/* Property Name and Location */}
                  <h3 className="text-lg font-semibold mb-2">{property.name}</h3>
                  <div className="flex items-center text-gray-600 mb-2">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span className="text-sm">{property.location}</span>
                  </div>

                  {/* Lister Role Badge */}
                  <div className="mb-4">
                    <Badge
                      variant="outline"
                      className={cn("text-xs", getRoleBadge(property.listerRole).className)}
                    >
                      {getRoleBadge(property.listerRole).label}
                    </Badge>
                  </div>

                  {/* Property Details Grid */}
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Available</p>
                      <p className="font-semibold text-sm">{property.available}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Lease Rate</p>
                      <p className="font-semibold text-sm text-green-600">{property.leaseRate}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Available</p>
                      <p className="font-semibold text-sm">{property.availableDate}</p>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {property.tags.map((tag, index) => {
                      const colors = [
                        "bg-purple-100 text-purple-700 border-purple-200",
                        "bg-blue-100 text-blue-700 border-blue-200",
                        "bg-indigo-100 text-indigo-700 border-indigo-200",
                        "bg-gray-100 text-gray-700 border-gray-200"
                      ];
                      return (
                        <Badge
                          key={index}
                          variant="outline"
                          className={`text-xs ${colors[index % colors.length]}`}
                        >
                          {tag}
                        </Badge>
                      );
                    })}
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {property.description}
                  </p>

                  {/* Bottom Row */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        <span>{property.views}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{property.inquiries} inquiries</span>
                      </div>
                    </div>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                      View Details
                    </Button>
                  </div>

                  {/* Property Match Score - ONLY shown in Broker Listing */}
                  <div className="mt-4 pt-4 border-t">
                    <PropertyMatchScore
                      score={generateMockPropertyScore(property.id)}
                      opportunityTitle={getMockOpportunityTitle()}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
