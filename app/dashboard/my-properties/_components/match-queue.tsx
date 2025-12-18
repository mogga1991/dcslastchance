"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Flame, Filter, SlidersHorizontal } from "lucide-react";
import MatchCard from "./match-card";
import { OpportunityMatch } from "./match-queue-mock-data";
import { toast } from "sonner";

interface MatchQueueProps {
  matches: OpportunityMatch[];
}

type FilterType = "all" | "hot" | "new" | "expiring-soon";

export default function MatchQueue({ matches: initialMatches }: MatchQueueProps) {
  const [matches, setMatches] = useState(initialMatches);
  const [filter, setFilter] = useState<FilterType>("all");

  const handleInterested = (id: string) => {
    setMatches(
      matches.map((m) => (m.id === id ? { ...m, status: "interested" as const } : m))
    );
    toast.success("Marked as interested! This opportunity has been saved.");
  };

  const handlePass = (id: string) => {
    setMatches(matches.filter((m) => m.id !== id));
    toast.info("Opportunity dismissed");
  };

  const handleSave = (id: string) => {
    setMatches(
      matches.map((m) => (m.id === id ? { ...m, status: "saved" as const } : m))
    );
    toast.success("Opportunity saved for later review");
  };

  const getFilteredMatches = () => {
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    switch (filter) {
      case "hot":
        return matches.filter((m) => m.is_hot_match);
      case "new":
        return matches.filter((m) => m.status === "new");
      case "expiring-soon":
        return matches.filter(
          (m) => new Date(m.response_deadline) <= sevenDaysFromNow
        );
      default:
        return matches;
    }
  };

  const filteredMatches = getFilteredMatches();

  const stats = {
    total: matches.length,
    hot: matches.filter((m) => m.is_hot_match).length,
    new: matches.filter((m) => m.status === "new").length,
    expiringSoon: matches.filter(
      (m) =>
        new Date(m.response_deadline) <=
        new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000)
    ).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">New Matches</h2>
            <p className="text-sm text-gray-600 mt-1">
              Fresh opportunities matched to your properties
            </p>
          </div>
          <Button variant="outline" size="sm" className="gap-2">
            <SlidersHorizontal className="h-4 w-4" />
            Advanced Filters
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button
          onClick={() => setFilter("all")}
          className={`p-4 rounded-lg border-2 transition-all text-left ${
            filter === "all"
              ? "border-indigo-500 bg-indigo-50"
              : "border-gray-200 bg-white hover:border-gray-300"
          }`}
        >
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          <p className="text-sm text-gray-600">Total Matches</p>
        </button>

        <button
          onClick={() => setFilter("hot")}
          className={`p-4 rounded-lg border-2 transition-all text-left ${
            filter === "hot"
              ? "border-red-500 bg-red-50"
              : "border-gray-200 bg-white hover:border-gray-300"
          }`}
        >
          <div className="flex items-center gap-2">
            <p className="text-2xl font-bold text-red-600">{stats.hot}</p>
            <Flame className="h-5 w-5 text-red-500" />
          </div>
          <p className="text-sm text-gray-600">Hot Matches</p>
        </button>

        <button
          onClick={() => setFilter("new")}
          className={`p-4 rounded-lg border-2 transition-all text-left ${
            filter === "new"
              ? "border-blue-500 bg-blue-50"
              : "border-gray-200 bg-white hover:border-gray-300"
          }`}
        >
          <p className="text-2xl font-bold text-blue-600">{stats.new}</p>
          <p className="text-sm text-gray-600">Unreviewed</p>
        </button>

        <button
          onClick={() => setFilter("expiring-soon")}
          className={`p-4 rounded-lg border-2 transition-all text-left ${
            filter === "expiring-soon"
              ? "border-orange-500 bg-orange-50"
              : "border-gray-200 bg-white hover:border-gray-300"
          }`}
        >
          <p className="text-2xl font-bold text-orange-600">{stats.expiringSoon}</p>
          <p className="text-sm text-gray-600">Expiring Soon</p>
        </button>
      </div>

      {/* Active Filter Badge */}
      {filter !== "all" && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">
            Showing:{" "}
            <span className="font-medium">
              {filter === "hot" && "Hot Matches"}
              {filter === "new" && "Unreviewed"}
              {filter === "expiring-soon" && "Expiring Soon"}
            </span>
          </span>
          <button
            onClick={() => setFilter("all")}
            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
          >
            Clear filter
          </button>
        </div>
      )}

      {/* Match Cards Grid */}
      {filteredMatches.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredMatches.map((match) => (
            <MatchCard
              key={match.id}
              match={match}
              onInterested={handleInterested}
              onPass={handlePass}
              onSave={handleSave}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <Filter className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No matches found
          </h3>
          <p className="text-gray-600 mb-4">
            Try adjusting your filters to see more opportunities
          </p>
          <Button onClick={() => setFilter("all")} variant="outline">
            View All Matches
          </Button>
        </div>
      )}

      {/* Load More (for pagination later) */}
      {filteredMatches.length > 0 && filteredMatches.length >= 6 && (
        <div className="text-center pt-4">
          <Button variant="outline" size="lg">
            Load More Matches
          </Button>
        </div>
      )}
    </div>
  );
}
