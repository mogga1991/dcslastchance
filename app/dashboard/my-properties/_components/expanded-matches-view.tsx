'use client';

import { useState } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  ExternalLink,
  Calendar,
  MapPin,
  Building2,
  Sparkles
} from 'lucide-react';
import { ScoreBreakdown, ScoreBadge } from './score-breakdown';
import { OpportunitySummaryCard, SummaryButton } from '@/components/opportunity-summary';

// =============================================================================
// TYPES
// =============================================================================

interface FactorScore {
  name: string;
  score: number;
  weight: number;
  weighted: number;
  details: Record<string, any>;
}

interface ScoreBreakdownData {
  overall: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  competitive: boolean;
  qualified: boolean;
  factors: {
    location: FactorScore;
    space: FactorScore;
    building: FactorScore;
    timeline: FactorScore;
    experience: FactorScore;
  };
}

interface OpportunityMatch {
  id: string;
  opportunity_id: string;
  overall_score: number;
  grade: string;
  competitive: boolean;
  qualified: boolean;
  score_breakdown: ScoreBreakdownData;
  opportunity: {
    id: string;
    title: string;
    solicitation_number?: string;
    notice_id?: string;
    agency?: string;
    state?: string;
    city?: string;
    response_deadline?: string;
    description?: string;
  };
}

interface ExpandedMatchesViewProps {
  matches: OpportunityMatch[];
  propertyId: string;
  propertyTitle?: string;
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function formatDate(dateStr?: string): string {
  if (!dateStr) return 'TBD';
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  } catch {
    return dateStr;
  }
}

function getGradeColor(grade: string): string {
  switch (grade) {
    case 'A': return 'bg-green-100 text-green-800 border-green-200';
    case 'B': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    case 'C': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'D': return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'F': return 'bg-red-100 text-red-800 border-red-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

// =============================================================================
// MATCH CARD COMPONENT
// =============================================================================

function MatchCard({ match }: { match: OpportunityMatch }) {
  const [expanded, setExpanded] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  
  const opp = match.opportunity;
  const breakdown = match.score_breakdown;
  
  return (
    <div className="border rounded-lg bg-white shadow-sm overflow-hidden">
      {/* Card Header - Always Visible */}
      <div 
        className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between gap-4">
          {/* Left: Opportunity Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium text-gray-900 truncate">
                {opp.title || 'Untitled Opportunity'}
              </h4>
              {match.competitive && (
                <span className="flex-shrink-0 text-xs px-2 py-0.5 bg-green-100 text-green-800 rounded-full">
                  Competitive
                </span>
              )}
            </div>
            
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
              {opp.solicitation_number && (
                <span className="font-mono text-xs">
                  {opp.solicitation_number}
                </span>
              )}
              {(opp.city || opp.state) && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {[opp.city, opp.state].filter(Boolean).join(', ')}
                </span>
              )}
              {opp.response_deadline && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Due: {formatDate(opp.response_deadline)}
                </span>
              )}
            </div>
          </div>
          
          {/* Right: Score Badge */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <ScoreBadge 
              score={match.overall_score} 
              grade={match.grade || 'C'} 
            />
            {expanded ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </div>
        </div>
      </div>
      
      {/* Expanded Content */}
      {expanded && (
        <div className="border-t bg-gray-50">
          {/* Action Bar */}
          <div className="px-4 py-2 border-b bg-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowSummary(!showSummary);
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  showSummary 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-gray-100 text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                {showSummary ? 'Hide AI Summary' : 'Show AI Summary'}
              </button>
            </div>
            
            {opp.notice_id && (
              <a
                href={`https://sam.gov/opp/${opp.notice_id}/view`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
              >
                View on SAM.gov
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
          
          {/* AI Summary Section */}
          {showSummary && (
            <div className="p-4 border-b">
              <OpportunitySummaryCard
                opportunityId={opp.id}
                opportunityTitle={opp.title}
                compact={false}
              />
            </div>
          )}
          
          {/* Score Breakdown */}
          <div className="p-4">
            <h5 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Match Score Breakdown
            </h5>
            
            {breakdown?.factors ? (
              <ScoreBreakdown
                breakdown={{
                  overall: match.overall_score,
                  grade: (match.grade || 'C') as 'A' | 'B' | 'C' | 'D' | 'F',
                  competitive: match.competitive,
                  qualified: match.qualified,
                  factors: breakdown.factors
                }}
              />
            ) : (
              <div className="text-sm text-gray-500 italic">
                Score breakdown not available for this match.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function ExpandedMatchesView({ 
  matches, 
  propertyId,
  propertyTitle 
}: ExpandedMatchesViewProps) {
  if (!matches || matches.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">
        <Building2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>No matching opportunities found for this property.</p>
        <p className="text-sm mt-1">
          Matches are generated daily at 2:30 AM UTC.
        </p>
      </div>
    );
  }
  
  // Sort by score descending
  const sortedMatches = [...matches].sort((a, b) => b.overall_score - a.overall_score);
  
  return (
    <div className="p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-700">
          {matches.length} Matching Opportunit{matches.length === 1 ? 'y' : 'ies'}
        </h3>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            Competitive (≥70)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
            Qualified (50-69)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-gray-400"></span>
            Marginal (40-49)
          </span>
        </div>
      </div>
      
      {/* Match Cards */}
      <div className="space-y-3">
        {sortedMatches.map((match) => (
          <MatchCard key={match.id} match={match} />
        ))}
      </div>
    </div>
  );
}

export default ExpandedMatchesView;
