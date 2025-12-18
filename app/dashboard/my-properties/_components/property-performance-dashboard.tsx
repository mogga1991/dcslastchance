"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Building2,
  TrendingUp,
  TrendingDown,
  Eye,
  Zap,
  Target,
  Award,
  Calendar,
  ChevronRight,
  BarChart3,
  PieChart,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PropertyPerformance {
  property_id: string;
  property_title: string;
  property_address: string;
  total_matches: number;
  high_quality_matches: number; // >85%
  medium_quality_matches: number; // 70-85%
  low_quality_matches: number; // <70%
  viewed_count: number;
  interested_count: number;
  proposals_submitted: number;
  won_count: number;
  total_views: number;
  avg_match_score: number;
  engagement_rate: number; // % of matches acted upon
  conversion_rate: number; // % of interested that became proposals
  win_rate: number; // % of submitted that won
  trend: "up" | "down" | "stable";
  weekly_new_matches: number;
  monthly_revenue_potential: number;
}

interface PropertyPerformanceDashboardProps {
  performances: PropertyPerformance[];
}

export default function PropertyPerformanceDashboard({
  performances,
}: PropertyPerformanceDashboardProps) {
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"matches" | "quality" | "engagement" | "revenue">("matches");

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getSortedPerformances = () => {
    const sorted = [...performances];
    switch (sortBy) {
      case "matches":
        return sorted.sort((a, b) => b.total_matches - a.total_matches);
      case "quality":
        return sorted.sort((a, b) => b.avg_match_score - a.avg_match_score);
      case "engagement":
        return sorted.sort((a, b) => b.engagement_rate - a.engagement_rate);
      case "revenue":
        return sorted.sort((a, b) => b.monthly_revenue_potential - a.monthly_revenue_potential);
      default:
        return sorted;
    }
  };

  const sortedPerformances = getSortedPerformances();
  const topPerformer = sortedPerformances[0];

  // Calculate portfolio totals
  const portfolioStats = {
    totalMatches: performances.reduce((sum, p) => sum + p.total_matches, 0),
    totalProposals: performances.reduce((sum, p) => sum + p.proposals_submitted, 0),
    totalWon: performances.reduce((sum, p) => sum + p.won_count, 0),
    avgEngagement: performances.reduce((sum, p) => sum + p.engagement_rate, 0) / performances.length,
    totalRevenuePotential: performances.reduce((sum, p) => sum + p.monthly_revenue_potential, 0),
  };

  const getPerformanceBadge = (perf: PropertyPerformance) => {
    const score =
      perf.avg_match_score * 0.3 +
      perf.engagement_rate * 0.3 +
      perf.conversion_rate * 0.2 +
      perf.win_rate * 0.2;

    if (score >= 80) return { label: "⭐ Star Performer", color: "bg-yellow-100 text-yellow-800" };
    if (score >= 65) return { label: "✓ High Performer", color: "bg-green-100 text-green-800" };
    if (score >= 50) return { label: "↑ Growing", color: "bg-blue-100 text-blue-800" };
    return { label: "→ Needs Attention", color: "bg-gray-100 text-gray-800" };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          Property Performance Dashboard
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Analyze performance metrics across your portfolio
        </p>
      </div>

      {/* Portfolio Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between mb-2">
            <Zap className="h-5 w-5" />
            <TrendingUp className="h-4 w-4" />
          </div>
          <p className="text-2xl font-bold">{portfolioStats.totalMatches}</p>
          <p className="text-sm opacity-90">Total Matches</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between mb-2">
            <Target className="h-5 w-5" />
            <span className="text-xs font-medium">
              {portfolioStats.avgEngagement.toFixed(0)}%
            </span>
          </div>
          <p className="text-2xl font-bold">{portfolioStats.totalProposals}</p>
          <p className="text-sm opacity-90">Proposals Submitted</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between mb-2">
            <Award className="h-5 w-5" />
            <TrendingUp className="h-4 w-4" />
          </div>
          <p className="text-2xl font-bold">{portfolioStats.totalWon}</p>
          <p className="text-sm opacity-90">Won Opportunities</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between mb-2">
            <Activity className="h-5 w-5" />
            <span className="text-xs font-medium">Avg</span>
          </div>
          <p className="text-2xl font-bold">
            {portfolioStats.avgEngagement.toFixed(0)}%
          </p>
          <p className="text-sm opacity-90">Engagement Rate</p>
        </div>

        <div className="bg-gradient-to-br from-pink-500 to-rose-600 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between mb-2">
            <BarChart3 className="h-5 w-5" />
            <TrendingUp className="h-4 w-4" />
          </div>
          <p className="text-lg font-bold">
            {formatCurrency(portfolioStats.totalRevenuePotential)}
          </p>
          <p className="text-sm opacity-90">Revenue Potential</p>
        </div>
      </div>

      {/* Sort Controls */}
      <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg">
        <span className="text-sm text-gray-600 font-medium">Sort by:</span>
        <Button
          variant={sortBy === "matches" ? "default" : "ghost"}
          size="sm"
          onClick={() => setSortBy("matches")}
        >
          Matches
        </Button>
        <Button
          variant={sortBy === "quality" ? "default" : "ghost"}
          size="sm"
          onClick={() => setSortBy("quality")}
        >
          Quality
        </Button>
        <Button
          variant={sortBy === "engagement" ? "default" : "ghost"}
          size="sm"
          onClick={() => setSortBy("engagement")}
        >
          Engagement
        </Button>
        <Button
          variant={sortBy === "revenue" ? "default" : "ghost"}
          size="sm"
          onClick={() => setSortBy("revenue")}
        >
          Revenue Potential
        </Button>
      </div>

      {/* Property Performance Cards */}
      <div className="grid grid-cols-1 gap-4">
        {sortedPerformances.map((perf, index) => {
          const badge = getPerformanceBadge(perf);
          const isTopPerformer = index === 0;

          return (
            <div
              key={perf.property_id}
              className={cn(
                "bg-white rounded-lg border-2 p-6 transition-all hover:shadow-lg",
                isTopPerformer
                  ? "border-yellow-400 shadow-md"
                  : "border-gray-200"
              )}
            >
              {/* Property Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Building2 className="h-5 w-5 text-indigo-600" />
                    <h3 className="text-lg font-bold text-gray-900">
                      {perf.property_title}
                    </h3>
                    {isTopPerformer && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800">
                        🏆 Top Performer
                      </span>
                    )}
                    <span
                      className={cn(
                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                        badge.color
                      )}
                    >
                      {badge.label}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{perf.property_address}</p>
                </div>

                <div className="text-right">
                  {perf.trend === "up" && (
                    <div className="flex items-center gap-1 text-green-600">
                      <TrendingUp className="h-4 w-4" />
                      <span className="text-sm font-medium">Trending</span>
                    </div>
                  )}
                  {perf.trend === "down" && (
                    <div className="flex items-center gap-1 text-red-600">
                      <TrendingDown className="h-4 w-4" />
                      <span className="text-sm font-medium">Declining</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                {/* Total Matches */}
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                    Total Matches
                  </p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-2xl font-bold text-gray-900">
                      {perf.total_matches}
                    </p>
                    <p className="text-xs text-gray-500">
                      +{perf.weekly_new_matches}/wk
                    </p>
                  </div>
                </div>

                {/* Avg Match Score */}
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                    Avg Match Score
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold text-gray-900">
                      {perf.avg_match_score}%
                    </p>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${perf.avg_match_score}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Engagement Rate */}
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                    Engagement Rate
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold text-gray-900">
                      {perf.engagement_rate}%
                    </p>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${perf.engagement_rate}%` }}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {perf.interested_count} interested
                  </p>
                </div>

                {/* Win Rate */}
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                    Win Rate
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold text-gray-900">
                      {perf.win_rate}%
                    </p>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-500 h-2 rounded-full"
                        style={{ width: `${perf.win_rate}%` }}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {perf.won_count} won
                  </p>
                </div>
              </div>

              {/* Match Quality Distribution */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-3">
                  Match Quality Distribution
                </p>
                <div className="flex gap-2 mb-2">
                  <div
                    className="bg-green-500 h-6 rounded-l flex items-center justify-center"
                    style={{
                      width: `${(perf.high_quality_matches / perf.total_matches) * 100}%`,
                    }}
                  >
                    <span className="text-xs font-bold text-white">
                      {perf.high_quality_matches}
                    </span>
                  </div>
                  <div
                    className="bg-yellow-500 h-6 flex items-center justify-center"
                    style={{
                      width: `${(perf.medium_quality_matches / perf.total_matches) * 100}%`,
                    }}
                  >
                    <span className="text-xs font-bold text-white">
                      {perf.medium_quality_matches}
                    </span>
                  </div>
                  <div
                    className="bg-orange-500 h-6 rounded-r flex items-center justify-center"
                    style={{
                      width: `${(perf.low_quality_matches / perf.total_matches) * 100}%`,
                    }}
                  >
                    <span className="text-xs font-bold text-white">
                      {perf.low_quality_matches}
                    </span>
                  </div>
                </div>
                <div className="flex gap-4 text-xs">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-green-500 rounded" />
                    <span className="text-gray-600">High (85%+)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-yellow-500 rounded" />
                    <span className="text-gray-600">Medium (70-85%)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-orange-500 rounded" />
                    <span className="text-gray-600">Low (&lt;70%)</span>
                  </div>
                </div>
              </div>

              {/* Revenue Potential */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                    Monthly Revenue Potential
                  </p>
                  <p className="text-xl font-bold text-gray-900">
                    {formatCurrency(perf.monthly_revenue_potential)}
                  </p>
                </div>
                <Button variant="outline" size="sm" className="gap-2">
                  View Details
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
