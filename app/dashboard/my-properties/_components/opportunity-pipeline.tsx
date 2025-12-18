"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  GripVertical,
  Eye,
  ThumbsUp,
  FileText,
  Clock,
  Trophy,
  Trash2,
  ExternalLink,
  Calendar,
  DollarSign,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PipelineOpportunity {
  id: string;
  solicitation_number: string;
  title: string;
  agency: string;
  property_title: string;
  match_score: number;
  response_deadline: string;
  estimated_value?: {
    min: number;
    max: number;
  };
  stage: "new" | "interested" | "proposal-prep" | "submitted" | "under-review" | "won" | "lost";
  added_date: string;
}

interface OpportunityPipelineProps {
  opportunities: PipelineOpportunity[];
}

const stages = [
  { id: "new", label: "New Matches", icon: Eye, color: "bg-blue-100 text-blue-700 border-blue-200" },
  { id: "interested", label: "Interested", icon: ThumbsUp, color: "bg-green-100 text-green-700 border-green-200" },
  { id: "proposal-prep", label: "Preparing Proposal", icon: FileText, color: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  { id: "submitted", label: "Submitted", icon: Clock, color: "bg-purple-100 text-purple-700 border-purple-200" },
  { id: "under-review", label: "Under Review", icon: Clock, color: "bg-indigo-100 text-indigo-700 border-indigo-200" },
  { id: "won", label: "Won", icon: Trophy, color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
] as const;

export default function OpportunityPipeline({
  opportunities: initialOpportunities,
}: OpportunityPipelineProps) {
  const [opportunities, setOpportunities] = useState(initialOpportunities);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  const handleDragStart = (id: string) => {
    setDraggedItem(id);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  const handleDrop = (stageId: string) => {
    if (!draggedItem) return;

    setOpportunities(
      opportunities.map((opp) =>
        opp.id === draggedItem
          ? { ...opp, stage: stageId as PipelineOpportunity["stage"] }
          : opp
      )
    );
    setDraggedItem(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
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
    });
  };

  const getDaysUntilDeadline = (deadline: string) => {
    const days = Math.ceil(
      (new Date(deadline).getTime() - new Date().getTime()) /
        (1000 * 60 * 60 * 24)
    );
    return days;
  };

  const getOpportunitiesForStage = (stageId: string) => {
    return opportunities.filter((opp) => opp.stage === stageId);
  };

  const calculateStageValue = (stageId: string) => {
    const stageOpps = getOpportunitiesForStage(stageId);
    return stageOpps.reduce((total, opp) => {
      if (opp.estimated_value) {
        return total + (opp.estimated_value.min + opp.estimated_value.max) / 2;
      }
      return total;
    }, 0);
  };

  const removeOpportunity = (id: string) => {
    setOpportunities(opportunities.filter((opp) => opp.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Opportunity Pipeline
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Track opportunities from discovery to award
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-gray-600">Total Pipeline Value</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(
                opportunities.reduce((total, opp) => {
                  if (opp.estimated_value) {
                    return (
                      total + (opp.estimated_value.min + opp.estimated_value.max) / 2
                    );
                  }
                  return total;
                }, 0)
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="overflow-x-auto pb-4">
        <div className="inline-flex gap-4 min-w-full">
          {stages.map((stage) => {
            const stageOpps = getOpportunitiesForStage(stage.id);
            const stageValue = calculateStageValue(stage.id);
            const StageIcon = stage.icon;

            return (
              <div
                key={stage.id}
                className="flex-shrink-0 w-80"
                onDrop={() => handleDrop(stage.id)}
                onDragOver={handleDragOver}
              >
                {/* Stage Header */}
                <div
                  className={cn(
                    "p-4 rounded-t-lg border-2",
                    stage.color
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <StageIcon className="h-5 w-5" />
                      <h3 className="font-semibold">{stage.label}</h3>
                    </div>
                    <span className="text-sm font-bold">
                      {stageOpps.length}
                    </span>
                  </div>
                  {stageValue > 0 && (
                    <p className="text-xs font-medium">
                      {formatCurrency(stageValue)} value
                    </p>
                  )}
                </div>

                {/* Stage Cards */}
                <div
                  className={cn(
                    "min-h-[500px] max-h-[600px] overflow-y-auto bg-gray-50 border-x-2 border-b-2 rounded-b-lg p-2 space-y-2",
                    stage.color.split(" ")[2]
                  )}
                >
                  {stageOpps.length === 0 ? (
                    <div className="flex items-center justify-center h-32 text-center p-4">
                      <p className="text-sm text-gray-400">
                        Drop opportunities here
                      </p>
                    </div>
                  ) : (
                    stageOpps.map((opp) => {
                      const daysLeft = getDaysUntilDeadline(opp.response_deadline);
                      const isUrgent = daysLeft <= 7 && daysLeft > 0;
                      const isExpired = daysLeft < 0;

                      return (
                        <div
                          key={opp.id}
                          draggable
                          onDragStart={() => handleDragStart(opp.id)}
                          onDragEnd={handleDragEnd}
                          className={cn(
                            "bg-white rounded-lg border border-gray-200 p-3 cursor-move hover:shadow-md transition-shadow",
                            draggedItem === opp.id && "opacity-50 scale-95"
                          )}
                        >
                          {/* Drag Handle */}
                          <div className="flex items-start gap-2 mb-2">
                            <GripVertical className="h-4 w-4 text-gray-400 mt-0.5" />
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-1">
                                {opp.title}
                              </h4>
                              <p className="text-xs text-gray-500">
                                {opp.solicitation_number}
                              </p>
                            </div>
                          </div>

                          {/* Property & Agency */}
                          <div className="space-y-1 mb-3">
                            <p className="text-xs text-gray-600">
                              <span className="font-medium">For:</span>{" "}
                              {opp.property_title}
                            </p>
                            <p className="text-xs text-gray-600">
                              <span className="font-medium">Agency:</span>{" "}
                              {opp.agency}
                            </p>
                          </div>

                          {/* Match Score */}
                          <div className="flex items-center justify-between mb-3">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">
                              {opp.match_score}% Match
                            </span>
                            {isUrgent && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-orange-100 text-orange-700">
                                {daysLeft}d left
                              </span>
                            )}
                            {isExpired && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-red-100 text-red-700">
                                Expired
                              </span>
                            )}
                          </div>

                          {/* Details */}
                          <div className="space-y-2 pt-2 border-t border-gray-100">
                            <div className="flex items-center gap-1 text-xs text-gray-600">
                              <Calendar className="h-3 w-3" />
                              <span>Due: {formatDate(opp.response_deadline)}</span>
                            </div>
                            {opp.estimated_value && (
                              <div className="flex items-center gap-1 text-xs text-gray-600">
                                <DollarSign className="h-3 w-3" />
                                <span>
                                  {formatCurrency(opp.estimated_value.min)} -{" "}
                                  {formatCurrency(opp.estimated_value.max)}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-1 mt-3 pt-2 border-t border-gray-100">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-xs flex-1"
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              View
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeOpportunity(opp.id)}
                              className="h-7 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pipeline Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-gray-200">
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <p className="text-2xl font-bold text-gray-900">
            {opportunities.length}
          </p>
          <p className="text-sm text-gray-600">Total Opportunities</p>
        </div>
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <p className="text-2xl font-bold text-green-700">
            {getOpportunitiesForStage("won").length}
          </p>
          <p className="text-sm text-gray-600">Won</p>
        </div>
        <div className="text-center p-4 bg-purple-50 rounded-lg">
          <p className="text-2xl font-bold text-purple-700">
            {getOpportunitiesForStage("submitted").length +
              getOpportunitiesForStage("under-review").length}
          </p>
          <p className="text-sm text-gray-600">In Progress</p>
        </div>
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <p className="text-2xl font-bold text-blue-700">
            {opportunities.filter(
              (opp) =>
                getDaysUntilDeadline(opp.response_deadline) <= 14 &&
                getDaysUntilDeadline(opp.response_deadline) > 0
            ).length}
          </p>
          <p className="text-sm text-gray-600">Due Soon (14d)</p>
        </div>
      </div>
    </div>
  );
}
