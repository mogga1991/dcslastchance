"use client";

import { useState } from 'react';
import { ChevronDown, ChevronUp, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MatchScoreResult } from '@/lib/scoring';

interface PropertyMatchScoreProps {
  score: MatchScoreResult;
  opportunityTitle: string;
}

export function PropertyMatchScore({ score, opportunityTitle }: PropertyMatchScoreProps) {
  const [expanded, setExpanded] = useState(false);

  const gradeColors = {
    A: 'bg-green-100 text-green-700 border-green-200',
    B: 'bg-blue-100 text-blue-700 border-blue-200',
    C: 'bg-amber-100 text-amber-700 border-amber-200',
    D: 'bg-orange-100 text-orange-700 border-orange-200',
    F: 'bg-red-100 text-red-700 border-red-200',
  };

  const ScoreBar = ({ value, label }: { value: number; label: string }) => (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-500 w-20">{label}</span>
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all',
            value >= 80
              ? 'bg-green-500'
              : value >= 60
                ? 'bg-blue-500'
                : value >= 40
                  ? 'bg-amber-500'
                  : 'bg-red-500'
          )}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="text-xs font-medium w-8 text-right">{value}</span>
    </div>
  );

  return (
    <div className="border rounded-lg p-4 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          {/* Grade Badge */}
          <div
            className={cn(
              'w-12 h-12 rounded-lg flex items-center justify-center text-xl font-bold border',
              gradeColors[score.grade]
            )}
          >
            {score.grade}
          </div>

          {/* Score */}
          <div>
            <div className="text-2xl font-bold text-gray-900">{score.overallScore}</div>
            <div className="text-xs text-gray-500">Match Score</div>
          </div>
        </div>

        {/* Status Badges */}
        <div className="flex flex-col gap-1 items-end">
          {score.qualified ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 text-xs rounded-full">
              <CheckCircle className="w-3 h-3" />
              Qualified
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-700 text-xs rounded-full">
              <XCircle className="w-3 h-3" />
              Disqualified
            </span>
          )}
          {score.competitive && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full">
              Competitive
            </span>
          )}
        </div>
      </div>

      {/* Opportunity Reference */}
      <p className="text-sm text-gray-600 mb-3 truncate">vs. {opportunityTitle}</p>

      {/* Category Bars */}
      <div className="space-y-2 mb-3">
        <ScoreBar value={score.categoryScores.location.score} label="Location" />
        <ScoreBar value={score.categoryScores.space.score} label="Space" />
        <ScoreBar value={score.categoryScores.building.score} label="Building" />
        <ScoreBar value={score.categoryScores.timeline.score} label="Timeline" />
        <ScoreBar value={score.categoryScores.experience.score} label="Experience" />
      </div>

      {/* Expand/Collapse */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
      >
        {expanded ? (
          <>
            Hide Details <ChevronUp className="w-4 h-4" />
          </>
        ) : (
          <>
            Show Details <ChevronDown className="w-4 h-4" />
          </>
        )}
      </button>

      {/* Expanded Details */}
      {expanded && (
        <div className="mt-4 pt-4 border-t space-y-4">
          {/* Disqualifiers */}
          {score.disqualifiers.length > 0 && (
            <div className="bg-red-50 rounded-lg p-3">
              <h4 className="font-medium text-red-700 mb-2 flex items-center gap-1">
                <XCircle className="w-4 h-4" />
                Disqualifying Issues
              </h4>
              <ul className="text-sm text-red-600 space-y-1">
                {score.disqualifiers.map((d, i) => (
                  <li key={i}>• {d}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Strengths */}
          {score.strengths.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-700 mb-2 flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Strengths
              </h4>
              <ul className="text-sm text-gray-600 space-y-1">
                {score.strengths.map((s, i) => (
                  <li key={i}>• {s}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Weaknesses */}
          {score.weaknesses.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-700 mb-2 flex items-center gap-1">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Areas of Concern
              </h4>
              <ul className="text-sm text-gray-600 space-y-1">
                {score.weaknesses.map((w, i) => (
                  <li key={i}>• {w}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommendations */}
          {score.recommendations.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Recommendations</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                {score.recommendations.map((r, i) => (
                  <li key={i}>• {r}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
