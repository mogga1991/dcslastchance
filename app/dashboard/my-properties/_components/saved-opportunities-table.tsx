"use client";

import { useState, Fragment } from "react";
import { Button } from "@/components/ui/button";
import {
  ExternalLink,
  Trash2,
  MapPin,
  Calendar,
  Building2,
  DollarSign,
  TrendingUp,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { SavedOpportunity } from "./mock-data";

interface SavedOpportunitiesTableProps {
  opportunities: SavedOpportunity[];
  onRemove?: (id: string) => void;
  removingId?: string | null;
}

export default function SavedOpportunitiesTable({
  opportunities,
  onRemove,
  removingId,
}: SavedOpportunitiesTableProps) {
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
      (new Date(deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    return days;
  };

  const getDeadlineColor = (days: number) => {
    if (days < 0) return "text-red-600 bg-red-50";
    if (days <= 7) return "text-orange-600 bg-orange-50";
    if (days <= 14) return "text-yellow-600 bg-yellow-50";
    return "text-green-600 bg-green-50";
  };

  const getMatchScoreColor = (score?: number) => {
    if (!score) return "text-gray-500 bg-gray-100";
    if (score >= 90) return "text-green-700 bg-green-100";
    if (score >= 80) return "text-blue-700 bg-blue-100";
    if (score >= 70) return "text-yellow-700 bg-yellow-100";
    return "text-orange-700 bg-orange-100";
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

              return (
                <Fragment key={opportunity.id}>
                  <tr className="hover:bg-gray-50 transition-colors">
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
                        <span className="text-sm font-medium text-gray-900 line-clamp-2">
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
                          {opportunity.office}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-gray-700">
                        <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                        {opportunity.place_of_performance.city},{" "}
                        {opportunity.place_of_performance.state}
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
                      {opportunity.match_score ? (
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getMatchScoreColor(
                            opportunity.match_score
                          )}`}
                        >
                          <TrendingUp className="h-3 w-3 mr-1" />
                          {opportunity.match_score}%
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onRemove?.(opportunity.id)}
                          disabled={removingId === opportunity.id}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>

                  {/* Expanded Details Row */}
                  {isExpanded && (
                    <tr className="bg-gray-50">
                      <td colSpan={7} className="px-6 py-6">
                        <div className="space-y-4">
                          {/* Description */}
                          <div>
                            <h4 className="text-sm font-semibold text-gray-900 mb-2">
                              Description
                            </h4>
                            <p className="text-sm text-gray-700 leading-relaxed">
                              {opportunity.description}
                            </p>
                          </div>

                          {/* Key Details Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                            <div className="flex items-start gap-3">
                              <div className="p-2 bg-blue-100 rounded-lg">
                                <Building2 className="h-5 w-5 text-blue-600" />
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wide">
                                  NAICS Code
                                </p>
                                <p className="text-sm font-medium text-gray-900 mt-0.5">
                                  {opportunity.naics_code}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-start gap-3">
                              <div className="p-2 bg-green-100 rounded-lg">
                                <DollarSign className="h-5 w-5 text-green-600" />
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wide">
                                  Estimated Value
                                </p>
                                <p className="text-sm font-medium text-gray-900 mt-0.5">
                                  {opportunity.estimated_value
                                    ? `${formatCurrency(
                                        opportunity.estimated_value.min
                                      )} - ${formatCurrency(
                                        opportunity.estimated_value.max
                                      )}`
                                    : "Not disclosed"}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-start gap-3">
                              <div className="p-2 bg-purple-100 rounded-lg">
                                <Calendar className="h-5 w-5 text-purple-600" />
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wide">
                                  Posted Date
                                </p>
                                <p className="text-sm font-medium text-gray-900 mt-0.5">
                                  {formatDate(opportunity.posted_date)}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Set Aside Information */}
                          <div className="pt-4 border-t border-gray-200">
                            <div className="inline-flex items-center px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-md text-sm font-medium">
                              Set Aside: {opportunity.set_aside}
                            </div>
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
            No Saved Opportunities
          </h3>
          <p className="text-gray-600">
            Browse GSA leasing opportunities and save the ones you're interested
            in.
          </p>
        </div>
      )}
    </div>
  );
}
