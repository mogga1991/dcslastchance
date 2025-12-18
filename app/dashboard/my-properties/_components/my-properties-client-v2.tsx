"use client";

import { useState, useMemo } from "react";
import { Building2, FileText, User, Flame } from "lucide-react";
import { toast } from "sonner";
import EnhancedStatsCards from "./enhanced-stats-cards";
import PropertiesTable from "./properties-table";
import OpportunitiesTable from "./opportunities-table";
import PropertyPerformanceDashboard from "./property-performance-dashboard";
import {
  mockProperties,
  mockMatches,
  BrokerListing,
  PropertyMatch,
} from "./mock-data";
import { mockNewMatches } from "./match-queue-mock-data";
import { mockPropertyPerformances } from "./performance-mock-data";

type TabType = "opportunities" | "properties" | "account";

export default function MyPropertiesClientV2() {
  const [activeTab, setActiveTab] = useState<TabType>("opportunities");
  const [properties] = useState<BrokerListing[]>(mockProperties);
  const [matches] = useState<Record<string, PropertyMatch>>(mockMatches);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this property listing?")) {
      return;
    }

    try {
      setDeletingId(id);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      toast.success("Property deleted successfully");
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1600px] mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Federal lease opportunities and property management
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("opportunities")}
              className={`
                flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors
                ${
                  activeTab === "opportunities"
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }
              `}
            >
              <FileText className="h-5 w-5" />
              Opportunities
              <span
                className={`
                ml-2 py-0.5 px-2.5 rounded-full text-xs font-medium
                ${
                  activeTab === "opportunities"
                    ? "bg-indigo-100 text-indigo-600"
                    : "bg-gray-100 text-gray-600"
                }
              `}
              >
                {mockNewMatches.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("properties")}
              className={`
                flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors
                ${
                  activeTab === "properties"
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }
              `}
            >
              <Building2 className="h-5 w-5" />
              My Properties
              <span
                className={`
                ml-2 py-0.5 px-2.5 rounded-full text-xs font-medium
                ${
                  activeTab === "properties"
                    ? "bg-indigo-100 text-indigo-600"
                    : "bg-gray-100 text-gray-600"
                }
              `}
              >
                {properties.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("account")}
              className={`
                flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors
                ${
                  activeTab === "account"
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }
              `}
            >
              <User className="h-5 w-5" />
              Account
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === "opportunities" && (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Federal Lease Opportunities
              </h2>
              <p className="text-sm text-gray-600">
                GSA lease opportunities matched to your properties
              </p>
            </div>

            {/* Opportunity Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-lg border-2 border-indigo-200 p-4">
                <p className="text-2xl font-bold text-indigo-600">
                  {mockNewMatches.length}
                </p>
                <p className="text-sm text-gray-600">Total Matches</p>
              </div>

              <div className="bg-white rounded-lg border-2 border-red-200 p-4">
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold text-red-600">
                    {mockNewMatches.filter((m) => m.is_hot_match).length}
                  </p>
                  <Flame className="h-5 w-5 text-red-500" />
                </div>
                <p className="text-sm text-gray-600">Hot Matches</p>
              </div>

              <div className="bg-white rounded-lg border-2 border-blue-200 p-4">
                <p className="text-2xl font-bold text-blue-600">
                  {mockNewMatches.filter((m) => m.status === "new").length}
                </p>
                <p className="text-sm text-gray-600">Unreviewed</p>
              </div>

              <div className="bg-white rounded-lg border-2 border-orange-200 p-4">
                <p className="text-2xl font-bold text-orange-600">
                  {
                    mockNewMatches.filter(
                      (m) =>
                        new Date(m.response_deadline) <=
                        new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000)
                    ).length
                  }
                </p>
                <p className="text-sm text-gray-600">Expiring Soon</p>
              </div>
            </div>

            {/* Opportunities Table */}
            <OpportunitiesTable opportunities={mockNewMatches} />
          </div>
        )}

        {activeTab === "properties" && (
          <>
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
          </>
        )}

        {activeTab === "account" && (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Performance Metrics
              </h2>
              <p className="text-sm text-gray-600">
                Track your property performance and match analytics
              </p>
            </div>
            <PropertyPerformanceDashboard performances={mockPropertyPerformances} />
          </div>
        )}
      </div>
    </div>
  );
}
