"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Building2 } from "lucide-react";
import { toast } from "sonner";
import EnhancedStatsCards from "./enhanced-stats-cards";
import PropertiesTable from "./properties-table";

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
      const matchResults: Record<string, PropertyMatch> = {};

      for (const listing of listings) {
        const { data: opportunities, error } = await supabase
          .from("opportunities")
          .select("id, solicitation_number, title, department, pop_state_code")
          .eq("pop_state_code", listing.state)
          .eq("source", "gsa_leasing")
          .limit(20);

        if (!error && opportunities && opportunities.length > 0) {
          const scoredOpportunities = opportunities.map((opp) => {
            const matchScore = 75;

            return {
              id: opp.id,
              solicitation_number: opp.solicitation_number || "N/A",
              title: opp.title,
              agency: opp.department || "Unknown Agency",
              match_score: matchScore,
            };
          });

          scoredOpportunities.sort((a, b) => b.match_score - a.match_score);

          matchResults[listing.id] = {
            property_id: listing.id,
            opportunity_count: scoredOpportunities.length,
            best_match_score: scoredOpportunities[0]?.match_score || 0,
            opportunities: scoredOpportunities.slice(0, 5),
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


  // Calculate stats
  const stats = useMemo(() => {
    const totalViews = properties.reduce(
      (sum, p) => sum + (p.views_count || 0),
      0
    );
    const totalMatches = Object.values(matches).reduce(
      (sum, match) => sum + match.opportunity_count,
      0
    );
    const matchScores = Object.values(matches)
      .filter((m) => m.best_match_score > 0)
      .map((m) => m.best_match_score);
    const averageMatchScore =
      matchScores.length > 0
        ? Math.round(
            matchScores.reduce((sum, score) => sum + score, 0) /
              matchScores.length
          )
        : 0;

    // Properties expiring in next 30 days
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    const expiringsSoon = properties.filter((p) => {
      const availDate = new Date(p.available_date);
      return availDate <= thirtyDaysFromNow && availDate >= new Date();
    }).length;

    return {
      totalProperties: properties.length,
      activeListings: properties.filter((p) => p.status === "active").length,
      totalMatches,
      totalViews,
      averageMatchScore,
      expiringsSoon,
    };
  }, [properties, matches]);

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

        {/* Enhanced Stats Cards */}
        <div className="mb-8">
          <EnhancedStatsCards stats={stats} />
        </div>

        {/* Properties Table */}
        <PropertiesTable
          properties={properties}
          matches={matches}
          onDelete={handleDelete}
          deletingId={deletingId}
        />
      </div>
    </div>
  );
}
