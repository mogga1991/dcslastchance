import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, AlertCircle, Building2, Calendar, FileText, Hash, Maximize2, ChevronRight } from "lucide-react";
import type { SAMOpportunity } from "@/lib/sam-gov";
import type { MatchScoreResult } from "@/lib/scoring/types";

interface OpportunityCardProps {
  opportunity: SAMOpportunity;
  isSelected: boolean;
  onClick: () => void;
  onViewDetails: (e: React.MouseEvent) => void;
  onExpressInterest?: (e: React.MouseEvent) => void;
  onSave?: (opportunity: SAMOpportunity) => void;
  isSaved?: boolean;
  hasInquiry?: boolean;
  matchScore?: MatchScoreResult;
}

export function OpportunityCard({
  opportunity,
  isSelected,
  onClick,
  onViewDetails,
  onExpressInterest,
  hasInquiry = false,
}: OpportunityCardProps) {
  const getDaysUntilDeadline = (deadline: string) => {
    if (!deadline) return null;
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysLeft = getDaysUntilDeadline(opportunity.responseDeadLine);
  const isCritical = daysLeft !== null && daysLeft <= 7;
  const isUrgent = daysLeft !== null && daysLeft <= 14;

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const getNoticeTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      'o': 'Combined Synopsis/Solicitation',
      'p': 'Presolicitation',
      'k': 'Solicitation',
      'r': 'Sources Sought',
      's': 'Special Notice',
      'i': 'Intent to Bundle',
      'a': 'Award Notice',
    };
    return types[type.toLowerCase()] || type;
  };

  // Extract square footage from description
  const extractSquareFootage = (description: string): string | null => {
    if (!description) return null;

    // Match patterns like "10,000 SF", "10000 square feet", "10,000 sq ft", etc.
    const patterns = [
      /(\d{1,3}(?:,\d{3})*(?:\.\d+)?)\s*(?:SF|sq\.?\s*ft\.?|square\s*feet)/gi,
      /(\d{1,3}(?:,\d{3})*(?:\.\d+)?)\s*(?:RSF|ABOA|USF)/gi, // Rentable, ABOA, Usable SF
    ];

    for (const pattern of patterns) {
      const match = description.match(pattern);
      if (match) {
        const sfValue = match[0].match(/\d{1,3}(?:,\d{3})*(?:\.\d+)?/)?.[0];
        if (sfValue) {
          return sfValue + " SF";
        }
      }
    }

    return null;
  };

  const squareFootage = extractSquareFootage(opportunity.description || '');

  // Get urgency styling
  const getUrgencyStyle = () => {
    if (isCritical) return {
      border: "border-l-red-600",
      bg: "bg-red-50",
      badge: "bg-red-600"
    };
    if (isUrgent) return {
      border: "border-l-amber-500",
      bg: "bg-amber-50",
      badge: "bg-amber-500"
    };
    return {
      border: "border-l-slate-600",
      bg: "bg-slate-50",
      badge: "bg-slate-600"
    };
  };

  const urgencyStyle = getUrgencyStyle();

  return (
    <Card
      className={`group overflow-hidden cursor-pointer transition-all duration-200 bg-white border border-slate-200 border-l-4 ${urgencyStyle.border} hover:shadow-xl hover:border-slate-300 ${
        isSelected ? "ring-2 ring-blue-600 shadow-xl border-slate-300" : "shadow-sm"
      }`}
      onClick={onClick}
    >
      {/* Status Bar */}
      <div className={`px-6 py-3 ${urgencyStyle.bg} border-b border-slate-200`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-slate-600" />
              <span className="text-sm font-semibold text-slate-900 uppercase tracking-wide">
                {opportunity.department?.substring(0, 30) || 'Federal Agency'}
              </span>
            </div>
            <Badge variant="outline" className="bg-white border-slate-300 text-slate-700 text-xs font-semibold uppercase">
              {getNoticeTypeLabel(opportunity.type)}
            </Badge>
          </div>
          {daysLeft !== null && daysLeft > 0 && (
            <Badge className={`${urgencyStyle.badge} text-white font-bold uppercase tracking-wide text-xs`}>
              {isCritical && <AlertCircle className="h-3 w-3 mr-1" />}
              {daysLeft} DAY{daysLeft !== 1 ? 'S' : ''}
            </Badge>
          )}
        </div>
      </div>

      <div className="p-6 space-y-4">
        {/* Solicitation Number - Prominent */}
        {opportunity.solicitationNumber && (
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <FileText className="h-4 w-4 text-slate-500" />
            <span className="text-xs font-medium text-slate-600 uppercase tracking-wider">Solicitation</span>
            <span className="text-sm font-bold text-slate-900 font-mono">
              {opportunity.solicitationNumber}
            </span>
          </div>
        )}

        {/* Title */}
        <h3 className="font-bold text-lg leading-snug line-clamp-3 text-slate-900 min-h-[4rem]">
          {opportunity.title}
        </h3>

        {/* Key Information Grid */}
        <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-100">
          {/* Location */}
          {opportunity.placeOfPerformance && (
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <MapPin className="h-3.5 w-3.5 text-slate-500" />
                <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Location</span>
              </div>
              <p className="text-sm font-medium text-slate-900 truncate">
                {opportunity.placeOfPerformance.city?.name}, {opportunity.placeOfPerformance.state?.code}
              </p>
            </div>
          )}

          {/* Square Footage */}
          {squareFootage && (
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <Maximize2 className="h-3.5 w-3.5 text-slate-500" />
                <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Size</span>
              </div>
              <p className="text-sm font-bold text-blue-700">
                {squareFootage}
              </p>
            </div>
          )}

          {/* NAICS Code */}
          {opportunity.naicsCode && (
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <Hash className="h-3.5 w-3.5 text-slate-500" />
                <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">NAICS</span>
              </div>
              <p className="text-sm font-mono text-slate-900">
                {opportunity.naicsCode}
              </p>
            </div>
          )}

          {/* Posted Date */}
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <Calendar className="h-3.5 w-3.5 text-slate-500" />
              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Posted</span>
            </div>
            <p className="text-sm text-slate-900">
              {formatDate(opportunity.postedDate)}
            </p>
          </div>
        </div>

        {/* Deadline Section */}
        <div className="p-4 bg-slate-50 border-2 border-slate-200 rounded-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Response Deadline</p>
              <p className="text-lg font-bold text-slate-900">
                {formatDate(opportunity.responseDeadLine)}
              </p>
            </div>
            <Calendar className="h-8 w-8 text-slate-400" />
          </div>
        </div>

        {/* Badges */}
        {(opportunity.typeOfSetAsideDescription && opportunity.typeOfSetAsideDescription !== 'None') && (
          <div className="flex items-center gap-2">
            <Badge className="bg-blue-100 text-blue-800 border border-blue-300 font-semibold uppercase text-xs">
              {opportunity.typeOfSetAsideDescription}
            </Badge>
          </div>
        )}

        {/* View More Button */}
        <Button
          size="lg"
          onClick={onViewDetails}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold uppercase tracking-wide text-sm group-hover:bg-indigo-800 transition-colors"
        >
          View More
          <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </Card>
  );
}
