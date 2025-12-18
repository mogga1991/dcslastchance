"use client";

import { useState, Fragment } from "react";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Building2,
  DollarSign,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Flame,
  ThumbsDown,
  Bookmark,
  ThumbsUp,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import { OpportunityMatch } from "./match-queue-mock-data";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface OpportunitiesTableProps {
  opportunities: OpportunityMatch[];
}

export default function OpportunitiesTable({
  opportunities: initialOpportunities,
}: OpportunitiesTableProps) {
  const [opportunities, setOpportunities] = useState(initialOpportunities);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getDaysUntilDeadline = (deadline: string) => {
    const days = Math.ceil(
      (new Date(deadline).getTime() - new Date().getTime()) /
        (1000 * 60 * 60 * 24)
    );
    return days;
  };

  const getDeadlineColor = (days: number) => {
    if (days < 0) return "text-red-600 bg-red-50";
    if (days <= 7) return "text-orange-600 bg-orange-50";
    if (days <= 14) return "text-yellow-600 bg-yellow-50";
    return "text-green-600 bg-green-50";
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return "text-green-700 bg-green-100";
    if (score >= 80) return "text-blue-700 bg-blue-100";
    if (score >= 70) return "text-yellow-700 bg-yellow-100";
    return "text-orange-700 bg-orange-100";
  };

  const handleInterested = (id: string) => {
    setOpportunities(
      opportunities.map((opp) =>
        opp.id === id ? { ...opp, status: "interested" as const } : opp
      )
    );
    toast.success("Marked as interested! This opportunity has been saved.");
  };

  const handlePass = (id: string) => {
    setOpportunities(opportunities.filter((opp) => opp.id !== id));
    toast.info("Opportunity dismissed");
  };

  const handleSave = (id: string) => {
    setOpportunities(
      opportunities.map((opp) =>
        opp.id === id ? { ...opp, status: "saved" as const } : opp
      )
    );
    toast.success("Opportunity saved for later review");
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="w-10"></th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Opportunity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Agency
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Deadline
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Match Score
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {opportunities.map((opportunity) => {
              const daysUntil = getDaysUntilDeadline(opportunity.response_deadline);
              const isExpanded = expandedRow === opportunity.id;
              const isExpired = daysUntil < 0;

              return (
                <Fragment key={opportunity.id}>
                  <tr
                    className={cn(
                      "transition-colors",
                      isExpired ? "opacity-60" : "hover:bg-gray-50"
                    )}
                  >
                    <td className="px-3 py-4">
                      <button
                        onClick={() =>
                          setExpandedRow(isExpanded ? null : opportunity.id)
                        }
                        className="text-gray-400 hover:text-gray-600"
                      >
                        {isExpanded ? (
                          <ChevronUp className="h-5 w-5" />
                        ) : (
                          <ChevronDown className="h-5 w-5" />
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2 mb-1">
                          {opportunity.is_hot_match && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">
                              <Flame className="h-3 w-3 mr-1" />
                              HOT
                            </span>
                          )}
                          {opportunity.status === "new" && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">
                              NEW
                            </span>
                          )}
                          {isExpired && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">
                              EXPIRED
                            </span>
                          )}
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {opportunity.title}
                        </span>
                        <span className="text-xs text-gray-500 mt-1">
                          {opportunity.solicitation_number}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900">
                          {opportunity.agency}
                        </span>
                        <span className="text-xs text-gray-500">
                          {opportunity.department}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-gray-700">
                        <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                        {opportunity.location.city},{" "}
                        {opportunity.location.state}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900">
                          {formatDate(opportunity.response_deadline)}
                        </span>
                        <span
                          className={`text-xs font-medium px-2 py-0.5 rounded-full inline-flex items-center w-fit mt-1 ${getDeadlineColor(
                            daysUntil
                          )}`}
                        >
                          {daysUntil < 0
                            ? "Expired"
                            : `${daysUntil} day${daysUntil !== 1 ? "s" : ""}`}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getMatchScoreColor(
                          opportunity.match_score
                        )}`}
                      >
                        <TrendingUp className="h-3 w-3 mr-1" />
                        {opportunity.match_score}%
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePass(opportunity.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          title="Pass"
                        >
                          <ThumbsDown className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSave(opportunity.id)}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          title="Save"
                        >
                          <Bookmark className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleInterested(opportunity.id)}
                          className="text-green-600 hover:text-green-700 hover:bg-green-50"
                          title="Interested"
                        >
                          <ThumbsUp className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>

                  {/* Expanded Details Row */}
                  {isExpanded && (
                    <tr className="bg-gray-50">
                      <td colSpan={7} className="px-6 py-6">
                        <div className="space-y-4">
                          {/* Property Context */}
                          <div className="flex items-center gap-2 text-sm">
                            <span className="font-medium text-gray-700">
                              Matched to:
                            </span>
                            <span className="text-indigo-600 font-medium">
                              {opportunity.property_title}
                            </span>
                          </div>

                          {/* Why This Matches */}
                          <div>
                            <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                              <TrendingUp className="h-4 w-4 text-indigo-600" />
                              Match Requirements ({opportunity.match_score}% Match)
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {opportunity.requirements.map((req, idx) => (
                                <div
                                  key={idx}
                                  className="bg-gray-50 rounded-lg p-3 border border-gray-200"
                                >
                                  <div className="flex items-center gap-2 mb-2">
                                    <CheckCircle2
                                      className={`h-4 w-4 flex-shrink-0 ${
                                        req.status === "perfect"
                                          ? "text-green-600"
                                          : req.status === "good"
                                          ? "text-blue-600"
                                          : req.status === "warning"
                                          ? "text-yellow-600"
                                          : "text-red-600"
                                      }`}
                                    />
                                    <span className="text-xs font-semibold text-gray-700 uppercase">
                                      {req.label}
                                    </span>
                                  </div>
                                  <div className="text-xs text-gray-600 ml-6">
                                    <div className="mb-1">
                                      <span className="font-medium">Your Property:</span>{" "}
                                      {req.userValue}
                                    </div>
                                    <div>
                                      <span className="font-medium">Required:</span>{" "}
                                      {req.requiredValue}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Key Details Grid */}
                          {opportunity.estimated_value && (
                            <div className="pt-4 border-t border-gray-200">
                              <div className="flex items-start gap-3">
                                <div className="p-2 bg-green-100 rounded-lg">
                                  <DollarSign className="h-5 w-5 text-green-600" />
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                                    Estimated Contract Value
                                  </p>
                                  <p className="text-sm font-medium text-gray-900 mt-0.5">
                                    {formatCurrency(opportunity.estimated_value.min)} -{" "}
                                    {formatCurrency(opportunity.estimated_value.max)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* View on SAM.gov */}
                          <div className="pt-4 border-t border-gray-200">
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-2"
                              onClick={() =>
                                window.open(
                                  `https://sam.gov/opp/${opportunity.solicitation_number}`,
                                  "_blank"
                                )
                              }
                            >
                              <ExternalLink className="h-4 w-4" />
                              View Full Details on SAM.gov
                            </Button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {opportunities.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Opportunities Found
          </h3>
          <p className="text-gray-600">
            Check back soon for new federal lease opportunities matched to your
            properties.
          </p>
        </div>
      )}
    </div>
  );
}
