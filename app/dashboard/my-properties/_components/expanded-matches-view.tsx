"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Target, Building } from "lucide-react";
import { ScoreBreakdown, ScoreBadge } from "./score-breakdown";
import { useState } from "react";

interface Opportunity {
  id: string;
  solicitation_number: string;
  title: string;
  agency: string;
  match_score: number;
  grade?: string;
  competitive?: boolean;
  qualified?: boolean;
  score_breakdown?: any; // Full breakdown with factors
}

interface ExpandedMatchesViewProps {
  opportunities: Opportunity[];
  totalCount: number;
  propertyId: string;
}

// Individual match card with expandable score breakdown
function MatchCard({ opportunity: opp }: { opportunity: Opportunity }) {
  const [expanded, setExpanded] = useState(false);
  const hasBreakdown = opp.score_breakdown?.factors;

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header row */}
      <div
        className="flex items-center justify-between p-3 hover:bg-gray-50 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-sm text-gray-900 truncate">
              {opp.solicitation_number}
            </span>
            {opp.grade ? (
              <ScoreBadge score={opp.match_score} grade={opp.grade} />
            ) : (
              <Badge
                variant="outline"
                className={
                  opp.match_score >= 70
                    ? "bg-green-50 text-green-700 border-green-200"
                    : opp.match_score >= 50
                    ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                    : "bg-orange-50 text-orange-700 border-orange-200"
                }
              >
                {opp.match_score}
              </Badge>
            )}
            {opp.competitive && (
              <Badge className="bg-blue-50 text-blue-700 border-blue-200">
                Competitive
              </Badge>
            )}
          </div>
          <div className="text-xs text-gray-600 truncate mb-1">
            {opp.title}
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Building className="h-3 w-3" />
            {opp.agency}
          </div>
        </div>
        <div className="flex items-center gap-2 ml-4">
          <Button variant="outline" size="sm" asChild onClick={(e) => e.stopPropagation()}>
            <Link href={`/dashboard/gsa-leasing?opportunity=${opp.id}`}>
              View
            </Link>
          </Button>
        </div>
      </div>

      {/* Expanded score breakdown */}
      {expanded && hasBreakdown && (
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <ScoreBreakdown
            breakdown={{
              overall: opp.match_score,
              grade: (opp.grade || 'C') as 'A' | 'B' | 'C' | 'D' | 'F',
              competitive: opp.competitive || false,
              qualified: opp.qualified || false,
              factors: opp.score_breakdown.factors,
            }}
            opportunityTitle={opp.title}
          />
        </div>
      )}

      {/* Fallback if no breakdown data */}
      {expanded && !hasBreakdown && (
        <div className="border-t border-gray-200 p-4 bg-gray-50 text-sm text-gray-500">
          Score breakdown not available for this match.
        </div>
      )}
    </div>
  );
}

export default function ExpandedMatchesView({
  opportunities,
  totalCount,
  propertyId,
}: ExpandedMatchesViewProps) {
  if (opportunities.length === 0) {
    return (
      <tr>
        <td colSpan={8} className="px-6 py-4">
          <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-4 rounded-lg">
            <Target className="h-5 w-5 flex-shrink-0" />
            <div>
              <div className="font-medium text-sm">No Current Matches</div>
              <div className="text-xs text-amber-700 mt-1">
                We&apos;ll notify you when new GSA opportunities match this property.
              </div>
            </div>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr>
      <td colSpan={8} className="px-6 py-4 bg-gray-50">
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-3">
            <Target className="h-4 w-4 text-indigo-600" />
            <span className="font-semibold text-sm text-gray-900">
              GSA Opportunity Matches ({totalCount})
            </span>
          </div>

          {opportunities.map((opp) => (
            <MatchCard key={opp.id} opportunity={opp} />
          ))}

          {totalCount > opportunities.length && (
            <Button variant="link" className="text-indigo-600 text-sm p-0" asChild>
              <Link href={`/dashboard/gsa-leasing?property=${propertyId}`}>
                View all {totalCount} matches →
              </Link>
            </Button>
          )}
        </div>
      </td>
    </tr>
  );
}
