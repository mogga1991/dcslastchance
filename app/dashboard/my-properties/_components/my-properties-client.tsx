"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Building2 } from "lucide-react";
import { toast } from "sonner";
import PropertyCard from "./property-card";

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
    score_breakdown?: any; // Full breakdown with factors
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

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        router.push("/sign-in");
        return;
      }

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
      const propertyIds = listings.map((l) => l.id);

      // Fetch real matches from property_matches table
      const { data: matchData, error } = await supabase
        .from("property_matches")
        .select(
          `
          property_id,
          opportunity_id,
          overall_score,
          grade,
          qualified,
          competitive,
          score_breakdown,
          opportunities (
            id,
            solicitation_number,
            title,
            department
          )
        `
        )
        .in("property_id", propertyIds)
        .gte("overall_score", 40) // Only show qualified matches (≥40)
        .order("overall_score", { ascending: false });

      if (error) {
        console.error("Error fetching matches:", error);
        return;
      }

      // Group matches by property_id
      const matchResults: Record<string, PropertyMatch> = {};

      for (const match of matchData || []) {
        const propertyId = match.property_id;

        if (!matchResults[propertyId]) {
          matchResults[propertyId] = {
            property_id: propertyId,
            opportunity_count: 0,
            best_match_score: 0,
            opportunities: [],
          };
        }

        const opportunity = match.opportunities as any;

        matchResults[propertyId].opportunities.push({
          id: opportunity.id,
          solicitation_number: opportunity.solicitation_number || "N/A",
          title: opportunity.title,
          agency: opportunity.department || "Unknown Agency",
          match_score: match.overall_score,
          grade: match.grade,
          competitive: match.competitive,
          qualified: match.qualified,
          score_breakdown: match.score_breakdown, // Full breakdown with factors
        });

        matchResults[propertyId].opportunity_count++;

        if (match.overall_score > matchResults[propertyId].best_match_score) {
          matchResults[propertyId].best_match_score = match.overall_score;
        }
      }

      // Keep top 5 matches per property
      Object.values(matchResults).forEach((match) => {
        match.opportunities = match.opportunities.slice(0, 5);
      });

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
            Go to List Property page to add your first property
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1600px] mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">My Properties</h1>
          <p className="text-gray-600 mt-1">
            Manage your listings and view GSA opportunity matches
          </p>
        </div>

        {/* Properties Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              matches={matches[property.id]}
              onDelete={handleDelete}
              deletingId={deletingId}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
