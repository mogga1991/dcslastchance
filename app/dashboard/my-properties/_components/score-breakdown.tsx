'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, MapPin, Ruler, Building2, Calendar, Award } from 'lucide-react';

// =============================================================================
// TYPES
// =============================================================================

interface FactorScore {
  name: string;
  score: number;      // 0-100
  weight: number;     // Decimal (e.g., 0.30)
  weighted: number;   // score * weight
  details: Record<string, any>;
}

interface ScoreBreakdown {
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

interface ScoreBreakdownProps {
  breakdown: ScoreBreakdown;
  opportunityTitle?: string;
  compact?: boolean;
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-emerald-500';
  if (score >= 40) return 'text-yellow-500';
  if (score >= 20) return 'text-orange-500';
  return 'text-red-500';
}

function getScoreBgColor(score: number): string {
  if (score >= 80) return 'bg-green-100';
  if (score >= 60) return 'bg-emerald-100';
  if (score >= 40) return 'bg-yellow-100';
  if (score >= 20) return 'bg-orange-100';
  return 'bg-red-100';
}

function getGradeBadgeColor(grade: string): string {
  switch (grade) {
    case 'A': return 'bg-green-100 text-green-800 border-green-200';
    case 'B': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    case 'C': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'D': return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'F': return 'bg-red-100 text-red-800 border-red-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

function getFactorIcon(factorName: string) {
  switch (factorName.toLowerCase()) {
    case 'location': return MapPin;
    case 'space': return Ruler;
    case 'building': return Building2;
    case 'timeline': return Calendar;
    case 'experience': return Award;
    default: return Building2;
  }
}

function formatWeight(weight: number): string {
  return `${Math.round(weight * 100)}%`;
}

function formatDetailValue(key: string, value: any): string {
  if (typeof value === 'number') {
    if (key.toLowerCase().includes('distance')) {
      return `${value.toFixed(1)} mi`;
    }
    if (key.toLowerCase().includes('sqft') || key.toLowerCase().includes('footage')) {
      return value.toLocaleString() + ' SF';
    }
    return value.toLocaleString();
  }
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }
  return String(value);
}

// =============================================================================
// COMPONENTS
// =============================================================================

// Individual factor bar with expandable details
function FactorBar({ factor }: { factor: FactorScore }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = getFactorIcon(factor.name);
  
  return (
    <div className="space-y-1">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between hover:bg-gray-50 rounded p-1 -m-1 transition-colors"
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Icon className="w-4 h-4 text-gray-500 flex-shrink-0" />
          <span className="text-sm font-medium text-gray-700 truncate">
            {factor.name}
          </span>
          <span className="text-xs text-gray-400">
            ({formatWeight(factor.weight)})
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-sm font-semibold ${getScoreColor(factor.score)}`}>
            {Math.round(factor.score)}
          </span>
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </div>
      </button>
      
      {/* Progress bar */}
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${getScoreBgColor(factor.score)}`}
          style={{ 
            width: `${factor.score}%`,
            backgroundColor: factor.score >= 80 ? '#16a34a' : 
                            factor.score >= 60 ? '#10b981' : 
                            factor.score >= 40 ? '#eab308' : 
                            factor.score >= 20 ? '#f97316' : '#ef4444'
          }}
        />
      </div>
      
      {/* Expandable details */}
      {expanded && factor.details && Object.keys(factor.details).length > 0 && (
        <div className="mt-2 pl-6 space-y-1 text-xs text-gray-500 bg-gray-50 rounded p-2">
          {Object.entries(factor.details).map(([key, value]) => (
            <div key={key} className="flex justify-between">
              <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
              <span className="font-medium text-gray-700">
                {formatDetailValue(key, value)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Compact inline score badge
export function ScoreBadge({ score, grade }: { score: number; grade: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`text-lg font-bold ${getScoreColor(score)}`}>
        {Math.round(score)}
      </span>
      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${getGradeBadgeColor(grade)}`}>
        {grade}
      </span>
    </div>
  );
}

// Main Score Breakdown component
export function ScoreBreakdown({ breakdown, opportunityTitle, compact = false }: ScoreBreakdownProps) {
  const [showDetails, setShowDetails] = useState(!compact);
  
  const factors = [
    breakdown.factors.location,
    breakdown.factors.space,
    breakdown.factors.building,
    breakdown.factors.timeline,
    breakdown.factors.experience,
  ];
  
  if (compact) {
    return (
      <div className="flex items-center gap-3">
        <ScoreBadge score={breakdown.overall} grade={breakdown.grade} />
        {breakdown.competitive && (
          <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full">
            Competitive
          </span>
        )}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-xs text-blue-600 hover:text-blue-800 underline"
        >
          {showDetails ? 'Hide details' : 'Show breakdown'}
        </button>
        
        {showDetails && (
          <div className="absolute z-10 mt-2 p-4 bg-white rounded-lg shadow-lg border w-80">
            <ScoreBreakdownFull breakdown={breakdown} />
          </div>
        )}
      </div>
    );
  }
  
  return <ScoreBreakdownFull breakdown={breakdown} opportunityTitle={opportunityTitle} />;
}

// Full breakdown display
function ScoreBreakdownFull({ breakdown, opportunityTitle }: { breakdown: ScoreBreakdown; opportunityTitle?: string }) {
  const factors = [
    breakdown.factors.location,
    breakdown.factors.space,
    breakdown.factors.building,
    breakdown.factors.timeline,
    breakdown.factors.experience,
  ];
  
  return (
    <div className="space-y-4">
      {/* Header with overall score */}
      <div className="flex items-center justify-between">
        <div>
          {opportunityTitle && (
            <p className="text-xs text-gray-500 mb-1 truncate max-w-[200px]">
              {opportunityTitle}
            </p>
          )}
          <div className="flex items-center gap-3">
            <span className={`text-3xl font-bold ${getScoreColor(breakdown.overall)}`}>
              {Math.round(breakdown.overall)}
            </span>
            <div className="flex flex-col">
              <span className={`text-sm px-2 py-0.5 rounded border font-medium ${getGradeBadgeColor(breakdown.grade)}`}>
                Grade {breakdown.grade}
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          {breakdown.competitive && (
            <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full font-medium">
              ✓ Competitive
            </span>
          )}
          {breakdown.qualified && !breakdown.competitive && (
            <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full font-medium">
              Qualified
            </span>
          )}
        </div>
      </div>
      
      {/* Factor breakdown */}
      <div className="space-y-3 pt-2 border-t">
        {factors.map((factor, idx) => (
          <FactorBar key={idx} factor={factor} />
        ))}
      </div>
      
      {/* Weighted contribution summary */}
      <div className="pt-2 border-t text-xs text-gray-500">
        <div className="flex justify-between mb-1">
          <span>Weighted total:</span>
          <span className="font-medium text-gray-700">
            {factors.reduce((sum, f) => sum + f.weighted, 0).toFixed(1)} / 100
          </span>
        </div>
        <div className="flex gap-1 text-[10px]">
          {factors.map((f, i) => (
            <span key={i} className="flex items-center gap-0.5">
              <span className="capitalize">{f.name.slice(0, 3)}</span>
              <span className="font-medium">{f.weighted.toFixed(0)}</span>
              {i < factors.length - 1 && <span className="text-gray-300 mx-0.5">+</span>}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// USAGE EXAMPLE (for properties-table.tsx)
// =============================================================================

/*
import { ScoreBreakdown, ScoreBadge } from '@/components/score-breakdown';

// In your expanded row:
<ScoreBreakdown 
  breakdown={{
    overall: match.overall_score,
    grade: match.grade,
    competitive: match.competitive,
    qualified: match.qualified,
    factors: match.score_breakdown.factors
  }}
  opportunityTitle={match.opportunity.title}
/>

// Or for a compact inline display:
<ScoreBadge score={match.overall_score} grade={match.grade} />
*/

export default ScoreBreakdown;
