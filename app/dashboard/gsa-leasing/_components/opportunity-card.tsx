import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, Award, AlertCircle, FileText, Download, Sparkles, Bookmark, Building2, Hash, Info, X, MessageSquare } from "lucide-react";
import type { SAMOpportunity } from "@/lib/sam-gov";
import { useState } from "react";

interface OpportunityCardProps {
  opportunity: SAMOpportunity;
  isSelected: boolean;
  onClick: () => void;
  onViewDetails: (e: React.MouseEvent) => void;
  onExpressInterest?: (e: React.MouseEvent) => void;
  onSave?: (opportunity: SAMOpportunity) => void;
  isSaved?: boolean;
  matchScore?: {
    overallScore: number;
    grade: string;
    categoryScores: {
      location: { score: number; weight: number };
      space: { score: number; weight: number };
      building: { score: number; weight: number };
      timeline: { score: number; weight: number };
      experience: { score: number; weight: number };
    };
  };
}

export function OpportunityCard({
  opportunity,
  isSelected,
  onClick,
  onViewDetails,
  onExpressInterest,
  onSave,
  isSaved = false,
  matchScore
}: OpportunityCardProps) {
  const [saved, setSaved] = useState(isSaved);
  const [showMatchBreakdown, setShowMatchBreakdown] = useState(false);

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const getDaysUntilDeadline = (deadline: string) => {
    if (!deadline) return null;
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSaved(!saved);
    onSave?.(opportunity);
  };

  const daysLeft = getDaysUntilDeadline(opportunity.responseDeadLine);
  const isUrgent = daysLeft !== null && daysLeft <= 14;
  const isCritical = daysLeft !== null && daysLeft <= 7;

  const getMatchColor = (score: number) => {
    if (score >= 70) return 'bg-green-100 text-green-800 border-green-300';
    if (score >= 50) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-red-100 text-red-800 border-red-300';
  };

  const getMatchLabel = (score: number) => {
    if (score >= 70) return 'Strong Match';
    if (score >= 50) return 'Moderate Match';
    return 'Weak Match';
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'Solicitation': 'bg-blue-100 text-blue-800',
      'Sources Sought': 'bg-purple-100 text-purple-800',
      'Presolicitation': 'bg-indigo-100 text-indigo-800',
      'Award Notice': 'bg-green-100 text-green-800',
      'Special Notice': 'bg-orange-100 text-orange-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getDocumentName = (url: string) => {
    const parts = url.split('/');
    const filename = parts[parts.length - 1];
    return decodeURIComponent(filename);
  };

  const documents = opportunity.resourceLinks || [];
  const hasDocuments = documents.length > 0;

  return (
    <Card
      className={`overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-lg ${
        isSelected ? "ring-2 ring-blue-500 shadow-lg" : ""
      }`}
      onClick={onClick}
    >
      {/* Header with Type, Match Score, Save Button, and Days Left */}
      <div className="px-4 pt-4 pb-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <Badge className={getTypeColor(opportunity.type)}>
              {opportunity.type}
            </Badge>
            {matchScore && (
              <div className="relative">
                <button
                  className={`inline-flex items-center gap-1 font-semibold border-2 rounded-full px-2 py-1 text-xs transition-all hover:shadow-md ${getMatchColor(matchScore.overallScore)}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMatchBreakdown(!showMatchBreakdown);
                  }}
                  title="Click to view match breakdown"
                >
                  {matchScore.overallScore}% {getMatchLabel(matchScore.overallScore)}
                  <Info className="h-3 w-3 ml-0.5" />
                </button>

                {/* Match Breakdown Panel */}
                {showMatchBreakdown && (
                  <div
                    className="absolute top-full left-0 mt-2 w-80 bg-white rounded-lg shadow-2xl border-2 border-gray-200 z-50"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="p-4 space-y-3">
                      <div className="pb-2 border-b flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-sm">Match Breakdown</h4>
                          <p className="text-xs text-gray-600 mt-1">Based on your broker listings</p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowMatchBreakdown(false);
                          }}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Category Scores */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-gray-600">Location</span>
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-600"
                                style={{ width: `${matchScore.categoryScores.location.score}%` }}
                              />
                            </div>
                            <span className="font-semibold w-12 text-right">{Math.round(matchScore.categoryScores.location.score)}%</span>
                          </div>
                        </div>

                        <div className="flex justify-between items-center text-xs">
                          <span className="text-gray-600">Space</span>
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-600"
                                style={{ width: `${matchScore.categoryScores.space.score}%` }}
                              />
                            </div>
                            <span className="font-semibold w-12 text-right">{Math.round(matchScore.categoryScores.space.score)}%</span>
                          </div>
                        </div>

                        <div className="flex justify-between items-center text-xs">
                          <span className="text-gray-600">Building</span>
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-600"
                                style={{ width: `${matchScore.categoryScores.building.score}%` }}
                              />
                            </div>
                            <span className="font-semibold w-12 text-right">{Math.round(matchScore.categoryScores.building.score)}%</span>
                          </div>
                        </div>

                        <div className="flex justify-between items-center text-xs">
                          <span className="text-gray-600">Timeline</span>
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-600"
                                style={{ width: `${matchScore.categoryScores.timeline.score}%` }}
                              />
                            </div>
                            <span className="font-semibold w-12 text-right">{Math.round(matchScore.categoryScores.timeline.score)}%</span>
                          </div>
                        </div>

                        <div className="flex justify-between items-center text-xs">
                          <span className="text-gray-600">Experience</span>
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-600"
                                style={{ width: `${matchScore.categoryScores.experience.score}%` }}
                              />
                            </div>
                            <span className="font-semibold w-12 text-right">{Math.round(matchScore.categoryScores.experience.score)}%</span>
                          </div>
                        </div>
                      </div>

                      {/* Strengths */}
                      {matchScore.strengths && matchScore.strengths.length > 0 && (
                        <div className="pt-2 border-t">
                          <h5 className="text-xs font-semibold text-green-700 mb-1">Strengths</h5>
                          <ul className="text-xs text-gray-700 space-y-0.5">
                            {matchScore.strengths.map((strength, i) => (
                              <li key={i} className="flex items-start gap-1">
                                <span className="text-green-600">✓</span>
                                <span>{strength}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Weaknesses */}
                      {matchScore.weaknesses && matchScore.weaknesses.length > 0 && (
                        <div className="pt-2 border-t">
                          <h5 className="text-xs font-semibold text-orange-700 mb-1">Gaps</h5>
                          <ul className="text-xs text-gray-700 space-y-0.5">
                            {matchScore.weaknesses.map((weakness, i) => (
                              <li key={i} className="flex items-start gap-1">
                                <span className="text-orange-600">!</span>
                                <span>{weakness}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {/* Save Button */}
            <button
              onClick={handleSave}
              className={`p-1.5 rounded-full transition-colors ${
                saved
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-white text-gray-400 hover:text-blue-600 hover:bg-blue-50'
              }`}
              title={saved ? 'Unsave opportunity' : 'Save opportunity'}
            >
              <Bookmark className={`h-4 w-4 ${saved ? 'fill-current' : ''}`} />
            </button>
            {/* Urgency Badge */}
            {isCritical && (
              <Badge className="bg-red-600 text-white font-semibold">
                <AlertCircle className="h-3 w-3 mr-1" />
                {daysLeft}d left
              </Badge>
            )}
            {!isCritical && isUrgent && (
              <Badge className="bg-yellow-600 text-white font-semibold">
                {daysLeft}d left
              </Badge>
            )}
            {!isUrgent && daysLeft !== null && daysLeft > 0 && (
              <Badge className="bg-gray-400 text-white">
                {daysLeft}d left
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5 space-y-4">
        {/* Title */}
        <h3 className="font-bold text-lg line-clamp-2 leading-tight">{opportunity.title}</h3>

        {/* Agency & Location Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-start text-sm text-gray-600">
            <Award className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-medium text-gray-900">{opportunity.department || opportunity.subTier}</div>
              {opportunity.office && (
                <div className="text-xs text-gray-500 mt-0.5">{opportunity.office}</div>
              )}
            </div>
          </div>

          {opportunity.placeOfPerformance && (
            <div className="flex items-start text-sm text-gray-600">
              <MapPin className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-medium text-gray-900">
                  {opportunity.placeOfPerformance.city?.name}, {opportunity.placeOfPerformance.state?.code}
                </div>
                {opportunity.placeOfPerformance.state?.name && (
                  <div className="text-xs text-gray-500 mt-0.5">{opportunity.placeOfPerformance.state.name}</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Key Details */}
        <div className="space-y-2">
          {/* Due Date */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center text-gray-600">
              <Calendar className="h-4 w-4 mr-2" />
              <span className="font-medium">Response Deadline:</span>
            </div>
            <span className="font-bold text-gray-900">{formatDate(opportunity.responseDeadLine)}</span>
          </div>

          {/* Solicitation Number */}
          {opportunity.solicitationNumber && (
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center text-gray-600">
                <FileText className="h-4 w-4 mr-2" />
                <span className="font-medium">Solicitation:</span>
              </div>
              <span className="font-mono text-xs text-gray-900">{opportunity.solicitationNumber}</span>
            </div>
          )}
        </div>

        {/* Set-Aside Type and Metadata */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          {opportunity.typeOfSetAsideDescription && (
            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
              <Award className="h-3.5 w-3.5 mr-1.5" />
              {opportunity.typeOfSetAsideDescription}
            </Badge>
          )}
          <div className="flex items-center gap-3 text-xs text-gray-500">
            {opportunity.naicsCode && (
              <div className="flex items-center gap-1">
                <Hash className="h-3 w-3" />
                <span className="font-mono">{opportunity.naicsCode}</span>
              </div>
            )}
            {opportunity.postedDate && (
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>Posted {formatDate(opportunity.postedDate)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Description Preview */}
        {opportunity.description && (
          <div className="pt-2 border-t">
            <p className="text-sm text-gray-700 line-clamp-3">{opportunity.description}</p>
          </div>
        )}

        {/* Documents Section */}
        {hasDocuments && (
          <div className="pt-3 border-t">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold text-gray-900 flex items-center">
                <FileText className="h-4 w-4 mr-1.5" />
                Attachments ({documents.length})
              </h4>
            </div>
            <div className="space-y-1.5">
              {documents.slice(0, 3).map((doc, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs hover:bg-gray-100 transition-colors"
                >
                  <span className="truncate flex-1 font-medium text-gray-700">
                    {getDocumentName(doc)}
                  </span>
                  <div className="flex gap-1 ml-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 px-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(doc, '_blank');
                      }}
                    >
                      <Download className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 px-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        // TODO: AI summarization
                      }}
                    >
                      <Sparkles className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
              {documents.length > 3 && (
                <div className="text-xs text-gray-500 text-center pt-1">
                  +{documents.length - 3} more documents
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer - Actions */}
      <div className="px-5 py-3 bg-gray-50 border-t">
        <div className="flex gap-2">
          {onExpressInterest && (
            <Button
              size="lg"
              variant="outline"
              onClick={onExpressInterest}
              className="flex-1 border-green-600 text-green-700 hover:bg-green-50 hover:text-green-800 hover:border-green-700"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Express Interest
            </Button>
          )}
          <Button
            size="lg"
            onClick={onViewDetails}
            className={`${onExpressInterest ? 'flex-1' : 'w-full'} bg-blue-600 hover:bg-blue-700 text-white`}
          >
            View Details
          </Button>
        </div>
      </div>
    </Card>
  );
}
