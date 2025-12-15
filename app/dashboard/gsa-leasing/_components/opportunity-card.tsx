import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, AlertCircle, MessageSquare } from "lucide-react";
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

  return (
    <Card
      className={`overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-md bg-white shadow-sm ${
        isSelected ? "ring-2 ring-blue-500 shadow-md" : ""
      }`}
      onClick={onClick}
    >
      <div className="p-6 space-y-4">
        {/* Title */}
        <h3 className="font-semibold text-lg leading-tight line-clamp-2 text-gray-900">
          {opportunity.title}
        </h3>

        {/* Location */}
        {opportunity.placeOfPerformance && (
          <div className="flex items-center text-gray-600">
            <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="text-sm">
              {opportunity.placeOfPerformance.city?.name}, {opportunity.placeOfPerformance.state?.code}
            </span>
          </div>
        )}

        {/* Response Deadline with Days Left Badge */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            <span className="font-medium">Deadline:</span> {formatDate(opportunity.responseDeadLine)}
          </div>
          {daysLeft !== null && daysLeft > 0 && (
            <Badge
              className={`font-semibold ${
                isCritical
                  ? "bg-red-600 text-white"
                  : isUrgent
                  ? "bg-orange-500 text-white"
                  : "bg-gray-400 text-white"
              }`}
            >
              {isCritical && <AlertCircle className="h-3 w-3 mr-1" />}
              {daysLeft} day{daysLeft !== 1 ? 's' : ''} left
            </Badge>
          )}
        </div>

        {/* Set-Aside Type Badge */}
        {opportunity.typeOfSetAsideDescription && opportunity.typeOfSetAsideDescription !== 'None' && (
          <div>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 font-medium">
              {opportunity.typeOfSetAsideDescription}
            </Badge>
          </div>
        )}

        {/* Solicitation Number - subtle */}
        {opportunity.solicitationNumber && (
          <div className="text-xs text-gray-400 font-mono">
            {opportunity.solicitationNumber}
          </div>
        )}

        {/* Action Button */}
        <div className="pt-2">
          {onExpressInterest && hasInquiry ? (
            <Button
              size="lg"
              variant="outline"
              disabled
              className="w-full border-green-600 text-green-700 bg-green-50 cursor-not-allowed opacity-75"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Inquiry Sent ✓
            </Button>
          ) : onExpressInterest ? (
            <Button
              size="lg"
              variant="default"
              onClick={onExpressInterest}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              Express Interest
            </Button>
          ) : (
            <Button
              size="lg"
              onClick={onViewDetails}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              View Details
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
