"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Building2,
  MapPin,
  Maximize2,
  DollarSign,
  Calendar,
  Edit,
  Trash2,
  Eye,
  AlertCircle,
  PlusCircle,
  Target,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

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
  }>;
}

export default function MyPropertiesClient() {
  const router = useRouter();
  const supabase = createClient();
  const [properties, setProperties] = useState<BrokerListing[]>([]);
  const [matches, setMatches] = useState<Record<string, PropertyMatch>>({});
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchMyProperties();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchMyProperties = async () => {
    try {
      setLoading(true);

      // Get current user
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        router.push("/sign-in");
        return;
      }

      // Fetch user's properties
      const { data, error } = await supabase
        .from("broker_listings")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching properties:", error);
        toast.error("Failed to load your properties");
        return;
      }

      setProperties(data || []);

      // Fetch opportunity matches for each property
      if (data && data.length > 0) {
        await fetchOpportunityMatches(data);
      }
    } catch (error) {
      console.error("Error in fetchMyProperties:", error);
      toast.error("An error occurred while loading properties");
    } finally {
      setLoading(false);
    }
  };

  const fetchOpportunityMatches = async (listings: BrokerListing[]) => {
    try {
      // For each property, find matching opportunities based on location
      const matchResults: Record<string, PropertyMatch> = {};

      for (const listing of listings) {
        // Fetch opportunities that match this property by state
        const { data: opportunities, error } = await supabase
          .from("opportunities")
          .select("id, solicitation_number, title, department, pop_state_code")
          .eq("pop_state_code", listing.state)
          .eq("source", "gsa_leasing")
          .limit(20); // Limit to prevent too many matches

        if (!error && opportunities && opportunities.length > 0) {
          // Calculate match scores (simplified - based on location match)
          const scoredOpportunities = opportunities.map((opp) => {
            const matchScore = 75; // Base score for location match

            return {
              id: opp.id,
              solicitation_number: opp.solicitation_number || "N/A",
              title: opp.title,
              agency: opp.department || "Unknown Agency",
              match_score: matchScore,
            };
          });

          // Sort by match score
          scoredOpportunities.sort((a, b) => b.match_score - a.match_score);

          matchResults[listing.id] = {
            property_id: listing.id,
            opportunity_count: scoredOpportunities.length,
            best_match_score: scoredOpportunities[0]?.match_score || 0,
            opportunities: scoredOpportunities.slice(0, 5), // Top 5 matches
          };
        }
      }

      setMatches(matchResults);
    } catch (error) {
      console.error("Error fetching opportunity matches:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this property listing?")) {
      return;
    }

    try {
      setDeletingId(id);

      const response = await fetch(`/api/broker-listings/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete property");
      }

      toast.success("Property deleted successfully");
      setProperties(properties.filter((p) => p.id !== id));

      // Remove from matches
      const newMatches = { ...matches };
      delete newMatches[id];
      setMatches(newMatches);
    } catch (error) {
      console.error("Error deleting property:", error);
      toast.error("Failed to delete property");
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      active: { label: "Active", variant: "default" },
      pending: { label: "Pending Review", variant: "secondary" },
      inactive: { label: "Inactive", variant: "outline" },
      archived: { label: "Archived", variant: "destructive" },
    };

    const config = statusMap[status] || statusMap.active;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatCurrency = (amount: number | null) => {
    if (!amount) return "N/A";
    return `$${amount.toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your properties...</p>
        </div>
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center py-12">
          <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            No Properties Listed
          </h2>
          <p className="text-gray-600 mb-6">
            Start by listing your first property to get matched with GSA opportunities
          </p>
          <Button asChild className="bg-indigo-600 hover:bg-indigo-700">
            <Link href="/dashboard/broker-listing">
              <PlusCircle className="h-4 w-4 mr-2" />
              List Your First Property
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Properties</h1>
            <p className="text-gray-600 mt-1">
              Manage your listings and view GSA opportunity matches
            </p>
          </div>
          <Button asChild className="bg-indigo-600 hover:bg-indigo-700">
            <Link href="/dashboard/broker-listing">
              <PlusCircle className="h-4 w-4 mr-2" />
              List New Property
            </Link>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Properties
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {properties.length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Active Listings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {properties.filter((p) => p.status === "active").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Matches
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-indigo-600">
                {Object.values(matches).reduce(
                  (sum, match) => sum + match.opportunity_count,
                  0
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Properties List */}
      <div className="space-y-6">
        {properties.map((property) => {
          const propertyMatches = matches[property.id];
          const hasMatches = propertyMatches && propertyMatches.opportunity_count > 0;

          return (
            <Card key={property.id} className="overflow-hidden">
              <CardHeader className="bg-gray-50 border-b">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-xl">
                        {property.title || `${property.street_address}, ${property.city}`}
                      </CardTitle>
                      {getStatusBadge(property.status)}
                      {property.federal_score && (
                        <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          Federal Score: {property.federal_score}
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {property.street_address}, {property.city}, {property.state} {property.zipcode}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                    >
                      <Link href={`/dashboard/my-properties/${property.id}/edit`}>
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(property.id)}
                      disabled={deletingId === property.id}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-6">
                {/* Property Details */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    <Maximize2 className="h-4 w-4 text-gray-400" />
                    <div>
                      <div className="text-sm text-gray-600">Available SF</div>
                      <div className="font-semibold">{property.available_sf.toLocaleString()}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-gray-400" />
                    <div>
                      <div className="text-sm text-gray-600">Rate/SF/Year</div>
                      <div className="font-semibold">{formatCurrency(property.asking_rent_sf)}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <div>
                      <div className="text-sm text-gray-600">Available Date</div>
                      <div className="font-semibold">{formatDate(property.available_date)}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-gray-400" />
                    <div>
                      <div className="text-sm text-gray-600">Views</div>
                      <div className="font-semibold">{property.views_count || 0}</div>
                    </div>
                  </div>
                </div>

                {/* GSA Opportunity Matches */}
                {hasMatches ? (
                  <div className="border-t pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Target className="h-5 w-5 text-indigo-600" />
                        <h3 className="font-semibold text-gray-900">
                          GSA Opportunity Matches ({propertyMatches.opportunity_count})
                        </h3>
                      </div>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        Best Match: {propertyMatches.best_match_score}%
                      </Badge>
                    </div>

                    <div className="space-y-3">
                      {propertyMatches.opportunities.map((opp) => (
                        <div
                          key={opp.id}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-gray-900">{opp.solicitation_number}</span>
                              <Badge variant="outline" className={
                                opp.match_score >= 90 ? "bg-green-50 text-green-700 border-green-200" :
                                opp.match_score >= 80 ? "bg-blue-50 text-blue-700 border-blue-200" :
                                "bg-yellow-50 text-yellow-700 border-yellow-200"
                              }>
                                {opp.match_score}% Match
                              </Badge>
                            </div>
                            <div className="text-sm text-gray-600">{opp.title}</div>
                            <div className="text-xs text-gray-500 mt-1">{opp.agency}</div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                          >
                            <Link href={`/dashboard/gsa-leasing?opportunity=${opp.id}`}>
                              View Details
                            </Link>
                          </Button>
                        </div>
                      ))}
                    </div>

                    {propertyMatches.opportunity_count > 5 && (
                      <Button
                        variant="link"
                        className="mt-3 text-indigo-600"
                        asChild
                      >
                        <Link href={`/dashboard/gsa-leasing?property=${property.id}`}>
                          View all {propertyMatches.opportunity_count} matches →
                        </Link>
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="border-t pt-6">
                    <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-4 rounded-lg">
                      <AlertCircle className="h-5 w-5 flex-shrink-0" />
                      <div>
                        <div className="font-medium">No Current Matches</div>
                        <div className="text-sm text-amber-700 mt-1">
                          We&apos;ll notify you when new GSA opportunities match this property.
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
