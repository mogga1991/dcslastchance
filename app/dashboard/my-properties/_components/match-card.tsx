"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  ThumbsUp,
  ThumbsDown,
  Bookmark,
  ExternalLink,
  MapPin,
  Calendar,
  DollarSign,
  Building2,
  Clock,
  Flame,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MatchRequirement {
  label: string;
  userValue: string;
  requiredValue: string;
  status: "perfect" | "good" | "warning" | "mismatch";
}

interface OpportunityMatch {
  id: string;
  solicitation_number: string;
  title: string;
  agency: string;
  department: string;
  location: {
    city: string;
    state: string;
  };
  response_deadline: string;
  match_score: number;
  estimated_value?: {
    min: number;
    max: number;
  };
  requirements: MatchRequirement[];
  property_title: string;
  status?: "new" | "viewed" | "interested" | "passed" | "saved";
  is_hot_match?: boolean;
}

interface MatchCardProps {
  match: OpportunityMatch;
  onInterested?: (id: string) => void;
  onPass?: (id: string) => void;
  onSave?: (id: string) => void;
  className?: string;
}

export default function MatchCard({
  match,
  onInterested,
  onPass,
  onSave,
  className,
}: MatchCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [action, setAction] = useState<string | null>(null);

  const getDaysUntilDeadline = (deadline: string) => {
    const days = Math.ceil(
      (new Date(deadline).getTime() - new Date().getTime()) /
        (1000 * 60 * 60 * 24)
    );
    return days;
  };

  const daysLeft = getDaysUntilDeadline(match.response_deadline);

  const getDeadlineColor = () => {
    if (daysLeft < 0) return "text-red-600 bg-red-50";
    if (daysLeft <= 7) return "text-orange-600 bg-orange-50";
    if (daysLeft <= 14) return "text-yellow-600 bg-yellow-50";
    return "text-green-600 bg-green-50";
  };

  const getMatchScoreColor = () => {
    if (match.match_score >= 90) return "text-green-700 bg-green-100";
    if (match.match_score >= 80) return "text-blue-700 bg-blue-100";
    if (match.match_score >= 70) return "text-yellow-700 bg-yellow-100";
    return "text-orange-700 bg-orange-100";
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleAction = (
    actionType: "interested" | "pass" | "save",
    callback?: (id: string) => void
  ) => {
    setAction(actionType);
    setTimeout(() => {
      callback?.(match.id);
      setAction(null);
    }, 300);
  };

  const getStatusIcon = (status: MatchRequirement["status"]) => {
    switch (status) {
      case "perfect":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case "good":
        return <CheckCircle2 className="h-4 w-4 text-blue-600" />;
      case "warning":
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case "mismatch":
        return <AlertCircle className="h-4 w-4 text-red-600" />;
    }
  };

  return (
    <div
      className={cn(
        "bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-xl",
        action === "interested" && "scale-105 border-green-500",
        action === "pass" && "scale-95 opacity-50",
        action === "save" && "scale-102 border-indigo-500",
        className
      )}
    >
      {/* Header with badges */}
      <div className="relative bg-gradient-to-r from-indigo-500 to-purple-600 p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {match.is_hot_match && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-red-500 text-white animate-pulse">
                <Flame className="h-3 w-3 mr-1" />
                HOT MATCH
              </span>
            )}
            <span
              className={cn(
                "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold",
                getMatchScoreColor()
              )}
            >
              <TrendingUp className="h-3 w-3 mr-1" />
              {match.match_score}% Match
            </span>
          </div>

          <span
            className={cn(
              "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold",
              getDeadlineColor()
            )}
          >
            <Clock className="h-3 w-3 mr-1" />
            {daysLeft > 0 ? `${daysLeft} days left` : "Expired"}
          </span>
        </div>

        {match.status && match.status !== "new" && (
          <div className="mt-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-white/20 text-white">
              {match.status === "viewed" && "👁️ Viewed"}
              {match.status === "interested" && "👍 Interested"}
              {match.status === "passed" && "👎 Passed"}
              {match.status === "saved" && "💾 Saved"}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Property & Opportunity Title */}
        <div className="mb-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">
            For: {match.property_title}
          </p>
          <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-2">
            {match.title}
          </h3>
          <p className="text-sm text-gray-600">{match.solicitation_number}</p>
        </div>

        {/* Agency Info */}
        <div className="flex items-start gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
          <Building2 className="h-5 w-5 text-indigo-600 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-gray-900">{match.agency}</p>
            <p className="text-xs text-gray-600">{match.department}</p>
          </div>
        </div>

        {/* Key Details Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-gray-400 mt-1" />
            <div>
              <p className="text-xs text-gray-500">Location</p>
              <p className="text-sm font-medium text-gray-900">
                {match.location.city}, {match.location.state}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Calendar className="h-4 w-4 text-gray-400 mt-1" />
            <div>
              <p className="text-xs text-gray-500">Deadline</p>
              <p className="text-sm font-medium text-gray-900">
                {formatDate(match.response_deadline)}
              </p>
            </div>
          </div>

          {match.estimated_value && (
            <div className="flex items-start gap-2 col-span-2">
              <DollarSign className="h-4 w-4 text-gray-400 mt-1" />
              <div>
                <p className="text-xs text-gray-500">Estimated Value</p>
                <p className="text-sm font-medium text-gray-900">
                  {formatCurrency(match.estimated_value.min)} -{" "}
                  {formatCurrency(match.estimated_value.max)}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Match Requirements Preview */}
        {!isExpanded && match.requirements.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                Why This Matches
              </p>
              <button
                onClick={() => setIsExpanded(true)}
                className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
              >
                See all details →
              </button>
            </div>
            <div className="space-y-2">
              {match.requirements.slice(0, 3).map((req, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 text-sm bg-gray-50 p-2 rounded"
                >
                  {getStatusIcon(req.status)}
                  <span className="font-medium text-gray-700">{req.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Expanded Requirements */}
        {isExpanded && (
          <div className="mb-4 border-t border-gray-200 pt-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold text-gray-900">Match Analysis</h4>
              <button
                onClick={() => setIsExpanded(false)}
                className="text-xs text-gray-600 hover:text-gray-700"
              >
                Show less ↑
              </button>
            </div>
            <div className="space-y-3">
              {match.requirements.map((req, idx) => (
                <div key={idx} className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-start gap-2 mb-2">
                    {getStatusIcon(req.status)}
                    <p className="text-sm font-semibold text-gray-900">
                      {req.label}
                    </p>
                  </div>
                  <div className="ml-6 space-y-1">
                    <p className="text-xs text-gray-600">
                      <span className="font-medium">Your property:</span>{" "}
                      {req.userValue}
                    </p>
                    <p className="text-xs text-gray-600">
                      <span className="font-medium">Requirement:</span>{" "}
                      {req.requiredValue}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-3">
          <Button
            onClick={() => handleAction("pass", onPass)}
            variant="outline"
            className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
            disabled={!!action}
          >
            <ThumbsDown className="h-4 w-4 mr-1" />
            Pass
          </Button>

          <Button
            onClick={() => handleAction("save", onSave)}
            variant="outline"
            className="border-indigo-200 text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-300"
            disabled={!!action}
          >
            <Bookmark className="h-4 w-4 mr-1" />
            Save
          </Button>

          <Button
            onClick={() => handleAction("interested", onInterested)}
            className="bg-green-600 hover:bg-green-700 text-white"
            disabled={!!action}
          >
            <ThumbsUp className="h-4 w-4 mr-1" />
            Interested
          </Button>
        </div>

        {/* View on SAM.gov */}
        <Button
          variant="ghost"
          className="w-full mt-3 text-gray-600 hover:text-gray-900"
          size="sm"
        >
          <ExternalLink className="h-3 w-3 mr-1" />
          View on SAM.gov
        </Button>
      </div>
    </div>
  );
}
