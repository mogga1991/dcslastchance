import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, AlertCircle, MessageSquare, Building2, Calendar, FileText, Hash } from "lucide-react";
import type { SAMOpportunity } from "@/lib/sam-gov";

interface OpportunityCardProps {
  opportunity: SAMOpportunity;
  isSelected: boolean;
  onClick: () => void;
  onViewDetails: (e: React.MouseEvent) => void;
  onExpressInterest?: (e: React.MouseEvent) => void;
  onSave?: (opportunity: SAMOpportunity) => void;
  isSaved?: boolean;
  hasInquiry?: boolean;
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

  // Determine border color based on urgency
  const getBorderColor = () => {
    if (isCritical) return "border-l-red-500";
    if (isUrgent) return "border-l-orange-500";
    return "border-l-blue-500";
  };

  return (
    <Card
      className={`overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-lg bg-white shadow-sm border-l-4 ${getBorderColor()} ${
        isSelected ? "ring-2 ring-blue-500 shadow-lg" : ""
      }`}
      onClick={onClick}
    >
      <div className="p-6 space-y-5">
        {/* Header: Agency & Notice Type */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Building2 className="h-4 w-4 text-gray-500 flex-shrink-0" />
              <p className="text-sm font-semibold text-gray-900 truncate">
                {opportunity.department || 'Federal Agency'}
              </p>
            </div>
            {opportunity.subTier && (
              <p className="text-xs text-gray-600 ml-6 truncate">
                {opportunity.subTier}
              </p>
            )}
          </div>
          <Badge variant="outline" className="flex-shrink-0 bg-purple-50 text-purple-700 border-purple-200 text-xs">
            {getNoticeTypeLabel(opportunity.type)}
          </Badge>
        </div>

        {/* Title */}
        <h3 className="font-bold text-lg leading-tight line-clamp-2 text-gray-900">
          {opportunity.title}
        </h3>

        {/* Key Details Grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* Location */}
          {opportunity.placeOfPerformance && (
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="text-xs text-gray-500 font-medium">Location</p>
                <p className="text-sm text-gray-900 truncate">
                  {opportunity.placeOfPerformance.city?.name}, {opportunity.placeOfPerformance.state?.code}
                </p>
              </div>
            </div>
          )}

          {/* NAICS Code */}
          {opportunity.naicsCode && (
            <div className="flex items-start gap-2">
              <Hash className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="text-xs text-gray-500 font-medium">NAICS</p>
                <p className="text-sm text-gray-900 font-mono">
                  {opportunity.naicsCode}
                </p>
              </div>
            </div>
          )}

          {/* Posted Date */}
          <div className="flex items-start gap-2">
            <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="text-xs text-gray-500 font-medium">Posted</p>
              <p className="text-sm text-gray-900">
                {formatDate(opportunity.postedDate)}
              </p>
            </div>
          </div>

          {/* Solicitation Number */}
          {opportunity.solicitationNumber && (
            <div className="flex items-start gap-2">
              <FileText className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="text-xs text-gray-500 font-medium">Solicitation</p>
                <p className="text-xs text-gray-900 font-mono truncate">
                  {opportunity.solicitationNumber}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Deadline - Prominent */}
        <div className={`p-3 rounded-lg ${
          isCritical ? 'bg-red-50 border border-red-200' :
          isUrgent ? 'bg-orange-50 border border-orange-200' :
          'bg-gray-50 border border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600 mb-0.5">Response Deadline</p>
              <p className={`text-base font-bold ${
                isCritical ? 'text-red-700' :
                isUrgent ? 'text-orange-700' :
                'text-gray-900'
              }`}>
                {formatDate(opportunity.responseDeadLine)}
              </p>
            </div>
            {daysLeft !== null && daysLeft > 0 && (
              <Badge
                className={`font-bold text-sm px-3 py-1 ${
                  isCritical
                    ? "bg-red-600 text-white"
                    : isUrgent
                    ? "bg-orange-500 text-white"
                    : "bg-blue-600 text-white"
                }`}
              >
                {isCritical && <AlertCircle className="h-3.5 w-3.5 mr-1.5" />}
                {daysLeft} day{daysLeft !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>
        </div>

        {/* Set-Aside & Additional Info */}
        <div className="flex items-center gap-2 flex-wrap">
          {opportunity.typeOfSetAsideDescription && opportunity.typeOfSetAsideDescription !== 'None' && (
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 font-medium">
              {opportunity.typeOfSetAsideDescription}
            </Badge>
          )}
          {opportunity.office && (
            <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 text-xs">
              {opportunity.office}
            </Badge>
          )}
        </div>

        {/* Action Button */}
        <div className="pt-2">
          {onExpressInterest && hasInquiry ? (
            <Button
              size="lg"
              variant="outline"
              disabled
              className="w-full border-green-600 text-green-700 bg-green-50 cursor-not-allowed opacity-75 font-semibold"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Inquiry Sent ✓
            </Button>
          ) : onExpressInterest ? (
            <Button
              size="lg"
              variant="default"
              onClick={onExpressInterest}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm hover:shadow"
            >
              Express Interest
            </Button>
          ) : (
            <Button
              size="lg"
              onClick={onViewDetails}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm hover:shadow"
            >
              View Full Details
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
