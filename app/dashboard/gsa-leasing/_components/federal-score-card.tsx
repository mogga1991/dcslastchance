"use client";

import { useState, useEffect } from "react";
import { Info, TrendingUp, Building2, Calendar, FileText, Home, Users, BarChart3, AlertCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface FederalScoreData {
  score: number;
  totalProperties: number;
  leasedProperties: number;
  ownedProperties: number;
  totalRSF: number;
  vacantRSF: number;
  density: number;
  percentile: number;
}

// Demo data to show when API is unavailable
const DEMO_SCORE_DATA: FederalScoreData = {
  score: 72,
  totalProperties: 127,
  leasedProperties: 86,
  ownedProperties: 41,
  totalRSF: 2400000, // 2.4M SF
  vacantRSF: 180000,
  density: 8.2,
  percentile: 62,
};

interface FederalScoreCardProps {
  latitude?: number;
  longitude?: number;
  radiusMiles?: number;
  className?: string;
}

export function FederalScoreCard({ latitude, longitude, radiusMiles = 5, className }: FederalScoreCardProps) {
  const [scoreData, setScoreData] = useState<FederalScoreData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    if (latitude && longitude) {
      fetchScore();
    }
  }, [latitude, longitude, radiusMiles]);

  const fetchScore = async () => {
    if (!latitude || !longitude) return;

    try {
      setLoading(true);
      setError(null);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const response = await fetch(
        `/api/iolp/score?lat=${latitude}&lng=${longitude}&radiusMiles=${radiusMiles}`,
        { signal: controller.signal }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error('Failed to fetch score');
      }

      const data = await response.json();

      if (data.success) {
        setScoreData({
          score: data.score,
          totalProperties: data.totalProperties,
          leasedProperties: data.leasedProperties,
          ownedProperties: data.ownedProperties,
          totalRSF: data.totalRSF,
          vacantRSF: data.vacantRSF,
          density: data.density,
          percentile: data.percentile,
        });
        setIsDemo(false); // We got real data
        setError(null);
      }
    } catch (err) {
      // Check if this is an abort error (from timeout or manual abort)
      if (err instanceof Error && err.name === 'AbortError') {
        console.log('Request timed out, falling back to demo data');
      } else {
        console.error('Error fetching Federal Neighborhood Score:', err);
      }

      // Instead of showing error, fall back to demo data
      setScoreData(DEMO_SCORE_DATA);
      setIsDemo(true);
      setError(null); // Clear error since we're showing demo data
    } finally {
      setLoading(false);
    }
  };

  const getScoreLabel = (score: number): { label: string; color: string; bgColor: string } => {
    if (score >= 80) {
      return {
        label: "High Federal Presence",
        color: "text-green-700",
        bgColor: "bg-green-50 border-green-200"
      };
    } else if (score >= 60) {
      return {
        label: "Moderate Federal Presence",
        color: "text-blue-700",
        bgColor: "bg-blue-50 border-blue-200"
      };
    } else if (score >= 40) {
      return {
        label: "Low Federal Presence",
        color: "text-amber-700",
        bgColor: "bg-amber-50 border-amber-200"
      };
    } else {
      return {
        label: "Minimal Federal Presence",
        color: "text-gray-700",
        bgColor: "bg-gray-50 border-gray-200"
      };
    }
  };

  const calculateFactorScores = (data: FederalScoreData) => {
    // Reconstruct the factor scores based on the algorithm in lib/iolp.ts
    const densityScore = Math.min(25, (data.density / 10) * 25);

    const leaseRatio = data.totalProperties > 0 ? data.leasedProperties / data.totalProperties : 0;
    const leaseActivityScore = leaseRatio * 25;

    // Estimated expiring score (we don't have the exact data, so approximate)
    const expiringScore = Math.min(20, (data.score * 0.20)); // 20% of total

    const demandScore = Math.min(15, (data.totalRSF / 1000000) * 15);

    const vacancyRate = data.totalRSF > 0 ? data.vacantRSF / data.totalRSF : 0;
    const vacancyScore = Math.max(0, 10 - (vacancyRate * 20));

    // Growth is remainder
    const growthScore = data.score - (densityScore + leaseActivityScore + expiringScore + demandScore + vacancyScore);

    return [
      { name: "Density", score: densityScore, max: 25, icon: Building2 },
      { name: "Lease Activity", score: leaseActivityScore, max: 25, icon: FileText },
      { name: "Expiring Leases", score: expiringScore, max: 20, icon: Calendar },
      { name: "Demand", score: demandScore, max: 15, icon: TrendingUp },
      { name: "Vacancy Competition", score: vacancyScore, max: 10, icon: Home },
      { name: "Growth", score: Math.max(0, growthScore), max: 5, icon: BarChart3 },
    ];
  };

  if (!latitude || !longitude) {
    return (
      <div className={cn("rounded-lg border bg-card p-6", className)}>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-gray-400" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Federal Neighborhood Score</h3>
            <p className="text-xs text-muted-foreground">Move map to calculate</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={cn("rounded-lg border bg-card p-6", className)}>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <div>
            <h3 className="font-semibold text-sm">Calculating Score...</h3>
            <p className="text-xs text-muted-foreground">Analyzing federal presence</p>
          </div>
        </div>
      </div>
    );
  }

  // If no score data and not loading, show nothing (initial state handled above)
  if (!scoreData) {
    return null;
  }

  const { label, color, bgColor } = getScoreLabel(scoreData.score);
  const factors = calculateFactorScores(scoreData);
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (scoreData.score / 100) * circumference;

  return (
    <div className={cn("rounded-lg border bg-card p-6 space-y-6", className)}>
      {/* Header with Info Tooltip and Demo Badge */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm">Federal Neighborhood Score</h3>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="rounded-full p-1 hover:bg-gray-100 transition-colors">
                  <Info className="w-4 h-4 text-gray-400" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="text-sm">
                  The Federal Neighborhood Score (0-100) indicates how active the federal government is in this area for commercial leasing. Higher scores mean more federal buildings, more lease activity, and more upcoming opportunities.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Demo Data Badge */}
        {isDemo && (
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 font-medium">
              Sample Data
            </span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">Live federal data temporarily unavailable</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
      </div>

      {/* Circular Progress Indicator */}
      <div className="flex items-center gap-6">
        <div className="relative w-32 h-32 flex-shrink-0">
          {/* Background circle */}
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="45"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-gray-100"
            />
            {/* Progress circle */}
            <circle
              cx="64"
              cy="64"
              r="45"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className={cn(
                "transition-all duration-1000 ease-out",
                scoreData.score >= 80 ? "text-green-500" :
                scoreData.score >= 60 ? "text-blue-500" :
                scoreData.score >= 40 ? "text-amber-500" :
                "text-gray-400"
              )}
              strokeLinecap="round"
            />
          </svg>
          {/* Score number */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold">{scoreData.score}</span>
            <span className="text-xs text-muted-foreground">/ 100</span>
          </div>
        </div>

        {/* Score Label & Stats */}
        <div className="flex-1 space-y-3">
          <div className={cn("px-3 py-2 rounded-lg border", bgColor)}>
            <p className={cn("font-semibold text-sm", color)}>{label}</p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <p className="text-muted-foreground">Properties</p>
              <p className="font-semibold">{scoreData.totalProperties.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Density</p>
              <p className="font-semibold">{scoreData.density} /mi²</p>
            </div>
            <div>
              <p className="text-muted-foreground">Leased</p>
              <p className="font-semibold">{scoreData.leasedProperties.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Total RSF</p>
              <p className="font-semibold">{(scoreData.totalRSF / 1000000).toFixed(1)}M</p>
            </div>
          </div>
        </div>
      </div>

      {/* Score Breakdown */}
      <div className="space-y-3 pt-4 border-t">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Score Breakdown
        </h4>
        <div className="space-y-2">
          {factors.map((factor) => {
            const percentage = (factor.score / factor.max) * 100;
            const Icon = factor.icon;

            return (
              <div key={factor.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-muted-foreground">{factor.name}</span>
                  </div>
                  <span className="font-semibold">
                    {Math.round(factor.score)}/{factor.max}
                  </span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full transition-all duration-500 rounded-full",
                      percentage >= 80 ? "bg-green-500" :
                      percentage >= 60 ? "bg-blue-500" :
                      percentage >= 40 ? "bg-amber-500" :
                      "bg-gray-400"
                    )}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Demo Mode Notice & Retry Button */}
      {isDemo && (
        <div className="space-y-2 pt-2 border-t">
          <p className="text-xs text-center text-amber-700">
            Live federal data temporarily unavailable. Showing sample data for demonstration.
          </p>
          <button
            onClick={fetchScore}
            className="w-full px-3 py-2 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-md transition-colors font-medium"
          >
            Try Loading Real Data
          </button>
        </div>
      )}

      {/* Radius Info */}
      <p className="text-xs text-center text-muted-foreground pt-2 border-t">
        Within {radiusMiles} mile radius
      </p>
    </div>
  );
}
