import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, Award, AlertCircle, FileText, Download, Sparkles } from "lucide-react";
import type { SAMOpportunity } from "@/lib/sam-gov";

interface OpportunityCardProps {
  opportunity: SAMOpportunity;
  isSelected: boolean;
  onClick: () => void;
  onViewDetails: (e: React.MouseEvent) => void;
}

export function OpportunityCard({ opportunity, isSelected, onClick, onViewDetails }: OpportunityCardProps) {
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

  const daysLeft = getDaysUntilDeadline(opportunity.responseDeadLine);
  const isUrgent = daysLeft !== null && daysLeft <= 7;
  const isCritical = daysLeft !== null && daysLeft <= 3;

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
      {/* Header with Type and Days Left */}
      <div className="px-4 pt-4 pb-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
        <div className="flex items-start justify-between mb-2">
          <Badge className={getTypeColor(opportunity.type)}>
            {opportunity.type}
          </Badge>
          {isCritical && (
            <Badge className="bg-red-600 text-white font-semibold animate-pulse">
              <AlertCircle className="h-3 w-3 mr-1" />
              {daysLeft}d left!
            </Badge>
          )}
          {!isCritical && isUrgent && (
            <Badge className="bg-orange-600 text-white font-semibold">
              {daysLeft}d left
            </Badge>
          )}
          {!isUrgent && daysLeft !== null && daysLeft > 0 && (
            <Badge className="bg-green-600 text-white">
              {daysLeft}d left
            </Badge>
          )}
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

        {/* Set-Aside Type (if available) */}
        {opportunity.typeOfSetAsideDescription && (
          <div>
            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
              <Award className="h-3.5 w-3.5 mr-1.5" />
              {opportunity.typeOfSetAsideDescription}
            </Badge>
          </div>
        )}

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
        <Button
          size="lg"
          onClick={onViewDetails}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        >
          View Full Details & All Documents
        </Button>
      </div>
    </Card>
  );
}
