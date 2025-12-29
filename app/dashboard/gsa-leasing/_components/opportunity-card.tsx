import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ButtonColorful } from "@/components/ui/button-colorful";
import { MapPin, Calendar, FileText, Hash, Maximize2, Building2, User, Mail, Phone } from "lucide-react";
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
      className={`group overflow-hidden cursor-pointer transition-all duration-300 bg-white rounded-2xl border-2 ${
        isSelected
          ? "border-indigo-400 shadow-lg scale-[1.02]"
          : "border-gray-100 hover:border-indigo-200 hover:shadow-md"
      }`}
      onClick={onClick}
    >
      <div className="p-3 space-y-2">
        {/* Header with Location and Price Badge */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base leading-tight line-clamp-2 text-gray-800 mb-2">
              {opportunity.title}
            </h3>
            {/* Location */}
            {opportunity.placeOfPerformance && (
              <div className="flex items-center gap-1.5 text-gray-600">
                <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="text-sm truncate">
                  {formatDate(opportunity.postedDate)} {opportunity.placeOfPerformance.city?.name}, {opportunity.placeOfPerformance.state?.code}
                </span>
              </div>
            )}
          </div>

          {/* Status Badge */}
          {daysLeft !== null && daysLeft > 0 && (
            <Badge
              className={`flex-shrink-0 text-white font-medium px-3 py-1 rounded-full ${
                isCritical
                  ? 'bg-gradient-to-r from-red-500 to-red-600'
                  : isUrgent
                  ? 'bg-gradient-to-r from-amber-400 to-amber-500'
                  : 'bg-gradient-to-r from-gray-700 to-gray-800'
              }`}
            >
              {daysLeft}d
            </Badge>
          )}
        </div>

        {/* Notice Type Badge */}
        {opportunity.type && (
          <div className="flex items-center gap-2 pt-2">
            <Badge variant="outline" className="text-xs bg-indigo-50 text-indigo-700 border-indigo-200">
              {getNoticeTypeLabel(opportunity.type)}
            </Badge>
          </div>
        )}

        {/* Info Pills */}
        <div className="flex flex-wrap gap-2 pt-2">
          {/* Square Footage */}
          {squareFootage && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-lg">
              <Maximize2 className="h-3.5 w-3.5 text-gray-500" />
              <span className="text-xs font-medium text-gray-700">{squareFootage}</span>
            </div>
          )}

          {/* NAICS */}
          {opportunity.naicsCode && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-lg">
              <Hash className="h-3.5 w-3.5 text-gray-500" />
              <span className="text-xs font-medium text-gray-700">{opportunity.naicsCode}</span>
            </div>
          )}

          {/* Set Aside */}
          {(opportunity.typeOfSetAsideDescription && opportunity.typeOfSetAsideDescription !== 'None') && (
            <div className="inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg">
              <span className="text-xs font-medium">{opportunity.typeOfSetAsideDescription}</span>
            </div>
          )}
        </div>

        {/* Agency/Department */}
        {opportunity.fullParentPathName && (
          <div className="flex items-center gap-2 pt-2">
            <Building2 className="h-3.5 w-3.5 text-gray-400" />
            <span className="text-xs text-gray-600 line-clamp-1">
              {opportunity.fullParentPathName}
            </span>
          </div>
        )}

        {/* Solicitation Number */}
        {opportunity.solicitationNumber && (
          <div className="flex items-center gap-2 pt-2">
            <FileText className="h-3.5 w-3.5 text-gray-400" />
            <span className="text-xs text-gray-500">SOL:</span>
            <span className="text-xs font-mono text-gray-700">
              {opportunity.solicitationNumber}
            </span>
          </div>
        )}

        {/* Point of Contact */}
        {opportunity.pointOfContact && opportunity.pointOfContact.length > 0 && (
          <div className="pt-2 space-y-1.5 border-t border-gray-100">
            <div className="flex items-center gap-1.5 text-gray-600">
              <User className="h-3.5 w-3.5" />
              <span className="text-xs font-medium">Contact</span>
            </div>
            <div className="ml-5 space-y-1">
              <p className="text-xs text-gray-700 font-medium">
                {opportunity.pointOfContact[0].fullName}
              </p>
              {opportunity.pointOfContact[0].email && (
                <div className="flex items-center gap-1.5">
                  <Mail className="h-3 w-3 text-gray-400" />
                  <a
                    href={`mailto:${opportunity.pointOfContact[0].email}`}
                    className="text-xs text-indigo-600 hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {opportunity.pointOfContact[0].email}
                  </a>
                </div>
              )}
              {opportunity.pointOfContact[0].phone && (
                <div className="flex items-center gap-1.5">
                  <Phone className="h-3 w-3 text-gray-400" />
                  <a
                    href={`tel:${opportunity.pointOfContact[0].phone}`}
                    className="text-xs text-gray-600"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {opportunity.pointOfContact[0].phone}
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Deadline with arrow button */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Deadline</p>
              <p className="text-sm font-semibold text-gray-800">
                {formatDate(opportunity.responseDeadLine)}
              </p>
            </div>
          </div>

          <ButtonColorful
            onClick={onViewDetails}
            label="AI Assistant"
            className="rounded-full"
          />
        </div>
      </div>
    </Card>
  );
}
