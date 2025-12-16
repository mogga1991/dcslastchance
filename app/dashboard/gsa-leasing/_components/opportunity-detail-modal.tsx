import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Calendar,
  Award,
  FileText,
  AlertCircle,
  Clock,
  Download,
  Sparkles,
  MessageSquare
} from "lucide-react";
import type { SAMOpportunity } from "@/lib/sam-gov";

interface OpportunityDetailModalProps {
  opportunity: SAMOpportunity | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExpressInterest?: () => void;
}

export function OpportunityDetailModal({ opportunity, open, onOpenChange, onExpressInterest }: OpportunityDetailModalProps) {
  if (!opportunity) return null;

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold pr-8">{opportunity.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status Bar */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Badge className={getTypeColor(opportunity.type)}>
                {opportunity.type}
              </Badge>
              {opportunity.typeOfSetAsideDescription && (
                <Badge className="bg-amber-100 text-amber-800">
                  <Award className="h-3 w-3 mr-1" />
                  {opportunity.typeOfSetAsideDescription}
                </Badge>
              )}
            </div>

            {isCritical && (
              <Badge className="bg-red-600 text-white font-semibold animate-pulse">
                <AlertCircle className="h-4 w-4 mr-1" />
                {daysLeft} days left!
              </Badge>
            )}
            {!isCritical && isUrgent && (
              <Badge className="bg-orange-600 text-white font-semibold">
                <Clock className="h-4 w-4 mr-1" />
                {daysLeft} days left
              </Badge>
            )}
            {!isUrgent && daysLeft !== null && daysLeft > 0 && (
              <Badge className="bg-green-600 text-white">
                {daysLeft} days remaining
              </Badge>
            )}
          </div>

          {/* Key Information */}
          <div className="grid grid-cols-2 gap-4">
            {/* Agency */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center text-sm text-gray-600 mb-1">
                <Award className="h-4 w-4 mr-2" />
                Agency
              </div>
              <div className="font-semibold">{opportunity.department || 'N/A'}</div>
              {opportunity.subTier && (
                <div className="text-sm text-gray-600 mt-1">{opportunity.subTier}</div>
              )}
            </div>

            {/* Location */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center text-sm text-gray-600 mb-1">
                <MapPin className="h-4 w-4 mr-2" />
                Place of Performance
              </div>
              {opportunity.placeOfPerformance ? (
                <>
                  <div className="font-semibold">
                    {opportunity.placeOfPerformance.city?.name}, {opportunity.placeOfPerformance.state?.code}
                  </div>
                  {opportunity.placeOfPerformance.state?.name && (
                    <div className="text-sm text-gray-600 mt-1">{opportunity.placeOfPerformance.state.name}</div>
                  )}
                </>
              ) : (
                <div className="font-semibold">Not specified</div>
              )}
            </div>

            {/* Response Deadline */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center text-sm text-gray-600 mb-1">
                <Calendar className="h-4 w-4 mr-2" />
                Response Deadline
              </div>
              <div className="font-semibold">{formatDate(opportunity.responseDeadLine)}</div>
            </div>

            {/* Solicitation Number */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center text-sm text-gray-600 mb-1">
                <FileText className="h-4 w-4 mr-2" />
                Solicitation Number
              </div>
              <div className="font-semibold font-mono text-sm">
                {opportunity.solicitationNumber || 'N/A'}
              </div>
            </div>
          </div>

          {/* Notice ID */}
          {opportunity.noticeId && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-xs text-blue-800 font-medium mb-1">Notice ID</div>
              <div className="text-sm font-mono text-blue-900">{opportunity.noticeId}</div>
            </div>
          )}

          {/* Description/Notes */}
          {opportunity.description && (
            <div>
              <h3 className="font-semibold text-lg mb-2">Description</h3>
              <div className="prose prose-sm max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {opportunity.description}
                </p>
              </div>
            </div>
          )}

          {/* Additional Information */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            {opportunity.officeAddress && (
              <div>
                <h4 className="font-medium text-sm text-gray-600 mb-2">Contracting Office</h4>
                <div className="text-sm">
                  {opportunity.officeAddress.city && (
                    <div>{opportunity.officeAddress.city}, {opportunity.officeAddress.state}</div>
                  )}
                </div>
              </div>
            )}

            {opportunity.pointOfContact && opportunity.pointOfContact.length > 0 && (
              <div>
                <h4 className="font-medium text-sm text-gray-600 mb-2">Point of Contact</h4>
                <div className="text-sm">
                  {opportunity.pointOfContact[0].fullName && (
                    <div className="font-medium">{opportunity.pointOfContact[0].fullName}</div>
                  )}
                  {opportunity.pointOfContact[0].email && (
                    <div className="text-blue-600">{opportunity.pointOfContact[0].email}</div>
                  )}
                  {opportunity.pointOfContact[0].phone && (
                    <div>{opportunity.pointOfContact[0].phone}</div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Documents/Attachments Section */}
          {hasDocuments && (
            <div className="pt-4 border-t">
              <h3 className="font-semibold text-lg mb-3 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-blue-600" />
                Attachments & Documents ({documents.length})
              </h3>
              <div className="space-y-2">
                {documents.map((doc, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center flex-1 min-w-0 mr-3">
                      <FileText className="h-4 w-4 mr-2 text-gray-500 flex-shrink-0" />
                      <span className="truncate font-medium text-sm text-gray-700">
                        {getDocumentName(doc)}
                      </span>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(doc, '_blank');
                        }}
                      >
                        <Download className="h-3.5 w-3.5 mr-1.5" />
                        Download
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          // TODO: AI summarization
                        }}
                      >
                        <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                        Summarize
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Posted Date */}
          <div className="text-xs text-gray-500 pt-4 border-t">
            Posted {formatDate(opportunity.postedDate)}
            {opportunity.modifiedDate && opportunity.modifiedDate !== opportunity.postedDate && (
              <> • Last modified {formatDate(opportunity.modifiedDate)}</>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            {onExpressInterest && (
              <Button
                onClick={onExpressInterest}
                className="flex-1 bg-green-600 hover:bg-green-700"
                size="lg"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Express Interest
              </Button>
            )}
            <Button className="flex-1 bg-blue-600 hover:bg-blue-700" size="lg">
              <FileText className="h-4 w-4 mr-2" />
              Save Opportunity
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
