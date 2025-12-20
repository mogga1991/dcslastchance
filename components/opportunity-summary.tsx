'use client';

import { useState, useEffect } from 'react';
import { 
  MapPin, 
  Ruler, 
  Building2, 
  Calendar, 
  AlertTriangle,
  CheckCircle,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Loader2,
  RefreshCw
} from 'lucide-react';

// =============================================================================
// TYPES
// =============================================================================

interface OpportunitySummary {
  headline: string;
  location: {
    description: string;
    delineatedArea?: string;
    state?: string;
    city?: string;
  };
  space: {
    minSF?: number;
    maxSF?: number;
    description: string;
  };
  propertyRequirements: {
    type: string;
    class?: string;
    features: string[];
  };
  specialConditions: string[];
  dates: {
    responseDeadline?: string;
    anticipatedOccupancy?: string;
    leaseTerm?: string;
  };
  evaluationCriteria: string[];
  brokerTakeaway: string;
}

interface OpportunitySummaryCardProps {
  opportunityId: string;
  opportunityTitle?: string;
  initialSummary?: OpportunitySummary | null;
  compact?: boolean;
  onSummaryLoaded?: (summary: OpportunitySummary) => void;
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function formatSF(sf?: number): string {
  if (!sf) return 'N/A';
  return sf.toLocaleString() + ' SF';
}

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

// =============================================================================
// SUMMARY SECTION COMPONENTS
// =============================================================================

function SummarySection({ 
  icon: Icon, 
  title, 
  children 
}: { 
  icon: React.ElementType; 
  title: string; 
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-3">
      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
        <Icon className="w-4 h-4 text-blue-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
          {title}
        </p>
        <div className="text-sm text-gray-900">
          {children}
        </div>
      </div>
    </div>
  );
}

function FeatureTag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700 mr-1 mb-1">
      {children}
    </span>
  );
}

// =============================================================================
// LOADING STATE
// =============================================================================

function SummaryLoading() {
  return (
    <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
      <div className="flex items-center gap-2 mb-3">
        <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
        <span className="text-sm font-medium text-blue-700">
          Generating AI summary...
        </span>
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-blue-100 rounded animate-pulse w-3/4" />
        <div className="h-4 bg-blue-100 rounded animate-pulse w-1/2" />
        <div className="h-4 bg-blue-100 rounded animate-pulse w-2/3" />
      </div>
    </div>
  );
}

// =============================================================================
// ERROR STATE
// =============================================================================

function SummaryError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="p-4 bg-red-50 rounded-lg border border-red-100">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-500" />
          <span className="text-sm text-red-700">Failed to generate summary</span>
        </div>
        <button
          onClick={onRetry}
          className="text-sm text-red-600 hover:text-red-800 underline flex items-center gap-1"
        >
          <RefreshCw className="w-3 h-3" />
          Retry
        </button>
      </div>
    </div>
  );
}

// =============================================================================
// COMPACT SUMMARY (for cards/lists)
// =============================================================================

function CompactSummary({ summary }: { summary: OpportunitySummary }) {
  return (
    <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
      <div className="flex items-start gap-2 mb-2">
        <Sparkles className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm font-medium text-gray-900 line-clamp-2">
          {summary.headline}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
        <div className="flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          <span className="truncate">{summary.location.description}</span>
        </div>
        <div className="flex items-center gap-1">
          <Ruler className="w-3 h-3" />
          <span>{summary.space.description}</span>
        </div>
      </div>
      {summary.brokerTakeaway && (
        <p className="mt-2 text-xs text-blue-700 italic">
          💡 {summary.brokerTakeaway}
        </p>
      )}
    </div>
  );
}

// =============================================================================
// FULL SUMMARY
// =============================================================================

function FullSummary({ summary }: { summary: OpportunitySummary }) {
  const [showAll, setShowAll] = useState(false);
  
  return (
    <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100 space-y-4">
      {/* Header */}
      <div className="flex items-start gap-2">
        <Sparkles className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-gray-900">
            {summary.headline}
          </p>
          <p className="text-xs text-blue-600 mt-0.5">AI-Generated Summary</p>
        </div>
      </div>
      
      {/* Key Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SummarySection icon={MapPin} title="Location">
          <p>{summary.location.description}</p>
          {summary.location.delineatedArea && (
            <p className="text-xs text-gray-500 mt-1">
              Delineated Area: {summary.location.delineatedArea}
            </p>
          )}
        </SummarySection>
        
        <SummarySection icon={Ruler} title="Space Requirements">
          <p>{summary.space.description}</p>
          {summary.space.minSF && summary.space.maxSF && (
            <p className="text-xs text-gray-500 mt-1">
              {formatSF(summary.space.minSF)} - {formatSF(summary.space.maxSF)}
            </p>
          )}
        </SummarySection>
        
        <SummarySection icon={Building2} title="Property Requirements">
          <p>
            {summary.propertyRequirements.type}
            {summary.propertyRequirements.class && (
              <span className="ml-1 text-gray-500">
                (Class {summary.propertyRequirements.class})
              </span>
            )}
          </p>
          {summary.propertyRequirements.features.length > 0 && (
            <div className="mt-2 flex flex-wrap">
              {summary.propertyRequirements.features.map((feature, idx) => (
                <FeatureTag key={idx}>{feature}</FeatureTag>
              ))}
            </div>
          )}
        </SummarySection>
        
        <SummarySection icon={Calendar} title="Key Dates">
          <div className="space-y-1">
            {summary.dates.responseDeadline && (
              <p>
                <span className="text-gray-500">Response Due:</span>{' '}
                <span className="font-medium">{formatDate(summary.dates.responseDeadline)}</span>
              </p>
            )}
            {summary.dates.anticipatedOccupancy && (
              <p>
                <span className="text-gray-500">Occupancy:</span>{' '}
                {summary.dates.anticipatedOccupancy}
              </p>
            )}
            {summary.dates.leaseTerm && (
              <p>
                <span className="text-gray-500">Term:</span>{' '}
                {summary.dates.leaseTerm}
              </p>
            )}
          </div>
        </SummarySection>
      </div>
      
      {/* Special Conditions */}
      {summary.specialConditions.length > 0 && (
        <div className="pt-3 border-t border-blue-100">
          <button
            onClick={() => setShowAll(!showAll)}
            className="flex items-center gap-1 text-xs font-medium text-gray-600 hover:text-gray-900"
          >
            <AlertTriangle className="w-3 h-3" />
            {summary.specialConditions.length} Special Condition{summary.specialConditions.length !== 1 ? 's' : ''}
            {showAll ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
          {showAll && (
            <ul className="mt-2 space-y-1 text-sm text-gray-700">
              {summary.specialConditions.map((condition, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-yellow-500">•</span>
                  {condition}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      
      {/* Evaluation Criteria */}
      {summary.evaluationCriteria.length > 0 && (
        <div className="pt-3 border-t border-blue-100">
          <p className="text-xs font-medium text-gray-600 mb-2 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Evaluation Criteria
          </p>
          <div className="flex flex-wrap gap-1">
            {summary.evaluationCriteria.map((criteria, idx) => (
              <FeatureTag key={idx}>{criteria}</FeatureTag>
            ))}
          </div>
        </div>
      )}
      
      {/* Broker Takeaway */}
      {summary.brokerTakeaway && (
        <div className="pt-3 border-t border-blue-100 bg-blue-100/50 -mx-4 -mb-4 px-4 py-3 rounded-b-lg">
          <p className="text-sm text-blue-800">
            <span className="font-semibold">💡 Broker Takeaway:</span>{' '}
            {summary.brokerTakeaway}
          </p>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function OpportunitySummaryCard({
  opportunityId,
  opportunityTitle,
  initialSummary = null,
  compact = false,
  onSummaryLoaded
}: OpportunitySummaryCardProps) {
  const [summary, setSummary] = useState<OpportunitySummary | null>(initialSummary);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [expanded, setExpanded] = useState(!compact);
  
  // Fetch summary on mount if not provided
  useEffect(() => {
    if (!initialSummary && opportunityId) {
      fetchSummary();
    }
  }, [opportunityId, initialSummary]);
  
  const fetchSummary = async (forceRefresh = false) => {
    setLoading(true);
    setError(false);
    
    try {
      // First try GET (cached)
      if (!forceRefresh) {
        const cacheRes = await fetch(`/api/summarize-opportunity?id=${opportunityId}`);
        const cacheData = await cacheRes.json();
        
        if (cacheData.summary) {
          setSummary(cacheData.summary);
          onSummaryLoaded?.(cacheData.summary);
          setLoading(false);
          return;
        }
      }
      
      // Generate new summary via POST
      const res = await fetch('/api/summarize-opportunity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          opportunityId, 
          forceRefresh 
        })
      });
      
      const data = await res.json();
      
      if (data.summary) {
        setSummary(data.summary);
        onSummaryLoaded?.(data.summary);
      } else {
        setError(true);
      }
    } catch (err) {
      console.error('Failed to fetch summary:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };
  
  // Loading state
  if (loading) {
    return <SummaryLoading />;
  }
  
  // Error state
  if (error) {
    return <SummaryError onRetry={() => fetchSummary(true)} />;
  }
  
  // No summary yet
  if (!summary) {
    return (
      <button
        onClick={() => fetchSummary()}
        className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors text-left"
      >
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Sparkles className="w-4 h-4" />
          <span>Generate AI Summary</span>
        </div>
      </button>
    );
  }
  
  // Compact mode with expand option
  if (compact) {
    return (
      <div>
        <CompactSummary summary={summary} />
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-2 text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
        >
          {expanded ? 'Show less' : 'Show full summary'}
          {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
        {expanded && (
          <div className="mt-2">
            <FullSummary summary={summary} />
          </div>
        )}
      </div>
    );
  }
  
  // Full display
  return <FullSummary summary={summary} />;
}

// =============================================================================
// INLINE SUMMARY BUTTON (for use in opportunity cards)
// =============================================================================

export function SummaryButton({
  opportunityId,
  onSummaryReady
}: {
  opportunityId: string;
  onSummaryReady?: (summary: OpportunitySummary) => void;
}) {
  const [loading, setLoading] = useState(false);
  
  const handleClick = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/summarize-opportunity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ opportunityId })
      });
      const data = await res.json();
      if (data.summary) {
        onSummaryReady?.(data.summary);
      }
    } catch (err) {
      console.error('Summary generation failed:', err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors disabled:opacity-50"
    >
      {loading ? (
        <Loader2 className="w-3 h-3 animate-spin" />
      ) : (
        <Sparkles className="w-3 h-3" />
      )}
      {loading ? 'Generating...' : 'AI Summary'}
    </button>
  );
}

export default OpportunitySummaryCard;
