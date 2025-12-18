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
  MessageSquare,
  Building2,
  Hash,
  Maximize2,
  Loader2,
  CheckCircle2,
  ExternalLink,
  X
} from "lucide-react";
import type { SAMOpportunity } from "@/lib/sam-gov";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface OpportunityDetailModalProps {
  opportunity: SAMOpportunity | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExpressInterest?: () => void;
}

export function OpportunityDetailModal({ opportunity, open, onOpenChange, onExpressInterest }: OpportunityDetailModalProps) {
  const [summarizing, setSummarizing] = useState<string | null>(null);
  const [summaries, setSummaries] = useState<Record<string, string>>({});
  const { toast } = useToast();

  if (!opportunity || !open) return null;

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
      'Solicitation': 'bg-blue-100 text-blue-800 border-blue-300',
      'Sources Sought': 'bg-purple-100 text-purple-800 border-purple-300',
      'Presolicitation': 'bg-indigo-100 text-indigo-800 border-indigo-300',
      'Award Notice': 'bg-green-100 text-green-800 border-green-300',
      'Special Notice': 'bg-orange-100 text-orange-800 border-orange-300',
    };
    return colors[type] || 'bg-slate-100 text-slate-800 border-slate-300';
  };

  const getDocumentName = (url: string, index: number) => {
    const parts = url.split('/');
    const filename = parts[parts.length - 1];
    const decodedFilename = decodeURIComponent(filename);

    // Check if filename is meaningful (not just "download", GUIDs, or very short)
    const isMeaningful = decodedFilename &&
                        !decodedFilename.match(/^download$/i) &&
                        !decodedFilename.match(/^[0-9a-f-]{36}$/i) && // GUID pattern
                        decodedFilename.length > 5 &&
                        decodedFilename.includes('.');

    if (isMeaningful) {
      return decodedFilename;
    }

    // Try to extract document type from URL path
    const urlLower = url.toLowerCase();
    let docType = 'Document';

    if (urlLower.includes('solicitation') || urlLower.includes('rfp') || urlLower.includes('rfq')) {
      docType = 'Solicitation';
    } else if (urlLower.includes('amendment') || urlLower.includes('modification')) {
      docType = 'Amendment';
    } else if (urlLower.includes('attachment')) {
      docType = 'Attachment';
    } else if (urlLower.includes('notice')) {
      docType = 'Notice';
    } else if (urlLower.includes('award')) {
      docType = 'Award Document';
    }

    // Return numbered document with type
    return `${docType} ${index + 1}`;
  };

  // Extract square footage from description
  const extractSquareFootage = (description: string): string | null => {
    if (!description) return null;
    const patterns = [
      /(\d{1,3}(?:,\d{3})*(?:\.\d+)?)\s*(?:SF|sq\.?\s*ft\.?|square\s*feet)/gi,
      /(\d{1,3}(?:,\d{3})*(?:\.\d+)?)\s*(?:RSF|ABOA|USF)/gi,
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

  const documents = opportunity.resourceLinks || [];
  const hasDocuments = documents.length > 0;

  const handleSummarize = async (documentUrl: string, documentName: string) => {
    setSummarizing(documentUrl);
    try {
      const response = await fetch('/api/summarize-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentUrl, documentName }),
      });

      if (!response.ok) {
        throw new Error('Failed to summarize document');
      }

      const data = await response.json();
      setSummaries(prev => ({ ...prev, [documentUrl]: data.summary }));
      toast({
        title: "Summary Generated",
        description: "Document has been summarized successfully.",
      });
    } catch (error) {
      console.error('Error summarizing:', error);
      toast({
        title: "Error",
        description: "Failed to summarize document. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSummarizing(null);
    }
  };

  return (
    <div className="absolute inset-0 bg-white z-50 overflow-y-auto">
      {/* Close Button - Fixed Position */}
      <button
        onClick={() => onOpenChange(false)}
        className="fixed top-4 right-4 z-50 p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-full shadow-lg transition-colors"
        aria-label="Close"
      >
        <X className="h-6 w-6" />
      </button>

      <div className="max-w-6xl mx-auto p-6">
        {/* Header with Government Styling */}
        <div className="bg-slate-800 text-white -mx-6 -mt-6 px-6 py-5 mb-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="h-5 w-5" />
                <span className="text-sm font-semibold uppercase tracking-wider opacity-90">
                  {opportunity.department}
                </span>
              </div>
              <h1 className="text-2xl font-bold leading-tight pr-8">
                {opportunity.title}
              </h1>
            </div>
            {daysLeft !== null && daysLeft > 0 && (
              <Badge className={`${
                isCritical ? "bg-red-600 animate-pulse" :
                isUrgent ? "bg-amber-500" :
                "bg-green-600"
              } text-white font-bold text-sm px-4 py-2`}>
                {isCritical && <AlertCircle className="h-4 w-4 mr-1.5" />}
                {daysLeft} DAY{daysLeft !== 1 ? 'S' : ''} LEFT
              </Badge>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {/* Key Identifiers Bar */}
          <div className="bg-white border-2 border-slate-200 rounded-lg p-5">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4 text-slate-600" />
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Solicitation Number</span>
                </div>
                <p className="text-lg font-bold font-mono text-slate-900">{opportunity.solicitationNumber || 'N/A'}</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Hash className="h-4 w-4 text-slate-600" />
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Notice ID</span>
                </div>
                <p className="text-lg font-bold font-mono text-slate-900">{opportunity.noticeId || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Type and Set-Aside Badges */}
          <div className="flex items-center gap-3 flex-wrap">
            <Badge className={`${getTypeColor(opportunity.type)} border font-semibold uppercase px-3 py-1.5`}>
              {opportunity.type}
            </Badge>
            {opportunity.typeOfSetAsideDescription && opportunity.typeOfSetAsideDescription !== 'None' && (
              <Badge className="bg-blue-100 text-blue-800 border border-blue-300 font-semibold uppercase px-3 py-1.5">
                <Award className="h-3.5 w-3.5 mr-1.5" />
                {opportunity.typeOfSetAsideDescription}
              </Badge>
            )}
          </div>

          {/* Key Details Grid */}
          <div className="bg-white border-2 border-slate-200 rounded-lg overflow-hidden">
            <div className="bg-slate-100 px-5 py-3 border-b-2 border-slate-200">
              <h3 className="font-bold text-slate-900 uppercase tracking-wide text-sm">Opportunity Details</h3>
            </div>
            <div className="p-6 grid grid-cols-4 gap-6">
              {/* Location */}
              {opportunity.placeOfPerformance && (
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <MapPin className="h-4 w-4 text-slate-600" />
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Location</span>
                  </div>
                  <p className="font-semibold text-slate-900">
                    {opportunity.placeOfPerformance.city?.name}, {opportunity.placeOfPerformance.state?.code}
                  </p>
                  {opportunity.placeOfPerformance.state?.name && (
                    <p className="text-sm text-slate-600 mt-0.5">{opportunity.placeOfPerformance.state.name}</p>
                  )}
                </div>
              )}

              {/* Square Footage - Prominent */}
              {squareFootage && (
                <div className="bg-blue-50 -m-2 p-4 rounded border-2 border-blue-200">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Maximize2 className="h-4 w-4 text-blue-700" />
                    <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">Square Footage</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-900">{squareFootage}</p>
                </div>
              )}

              {/* NAICS Code */}
              {opportunity.naicsCode && (
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <Hash className="h-4 w-4 text-slate-600" />
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">NAICS Code</span>
                  </div>
                  <p className="font-mono font-semibold text-slate-900">{opportunity.naicsCode}</p>
                </div>
              )}

              {/* Posted Date */}
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <Calendar className="h-4 w-4 text-slate-600" />
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Posted Date</span>
                </div>
                <p className="font-semibold text-slate-900">{formatDate(opportunity.postedDate)}</p>
              </div>
            </div>
          </div>

          {/* Response Deadline - Full Width Prominent */}
          <div className="bg-slate-100 border-2 border-slate-300 rounded-lg p-5">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-5 w-5 text-slate-700" />
                  <span className="text-sm font-bold text-slate-700 uppercase tracking-wider">Response Deadline</span>
                </div>
                <p className="text-3xl font-bold text-slate-900">{formatDate(opportunity.responseDeadLine)}</p>
              </div>
              {daysLeft !== null && daysLeft > 0 && (
                <div className="text-right">
                  <Badge className={`${
                    isCritical ? "bg-red-600" :
                    isUrgent ? "bg-amber-500" :
                    "bg-slate-600"
                  } text-white font-bold text-lg px-4 py-2`}>
                    {daysLeft} DAY{daysLeft !== 1 ? 'S' : ''}
                  </Badge>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          {opportunity.description && (
            <div className="bg-white border-2 border-slate-200 rounded-lg overflow-hidden">
              <div className="bg-slate-100 px-5 py-3 border-b-2 border-slate-200">
                <h3 className="font-bold text-slate-900 uppercase tracking-wide text-sm">Description</h3>
              </div>
              <div className="p-5">
                <p className="text-slate-700 whitespace-pre-wrap leading-relaxed text-sm">
                  {opportunity.description}
                </p>
              </div>
            </div>
          )}

          {/* Contracting Office & Contact */}
          <div className="grid grid-cols-2 gap-4">
            {opportunity.officeAddress && (
              <div className="bg-white border-2 border-slate-200 rounded-lg p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Building2 className="h-4 w-4 text-slate-600" />
                  <h4 className="font-bold text-slate-900 uppercase tracking-wide text-xs">Contracting Office</h4>
                </div>
                <div className="text-sm text-slate-700">
                  {opportunity.office && <div className="font-semibold mb-1">{opportunity.office}</div>}
                  {opportunity.officeAddress.city && (
                    <div>{opportunity.officeAddress.city}, {opportunity.officeAddress.state}</div>
                  )}
                </div>
              </div>
            )}

            {opportunity.pointOfContact && opportunity.pointOfContact.length > 0 && (
              <div className="bg-white border-2 border-slate-200 rounded-lg p-5">
                <div className="flex items-center gap-2 mb-3">
                  <MessageSquare className="h-4 w-4 text-slate-600" />
                  <h4 className="font-bold text-slate-900 uppercase tracking-wide text-xs">Point of Contact</h4>
                </div>
                <div className="text-sm">
                  {opportunity.pointOfContact[0].fullName && (
                    <div className="font-semibold text-slate-900 mb-1">{opportunity.pointOfContact[0].fullName}</div>
                  )}
                  {opportunity.pointOfContact[0].email && (
                    <div className="text-blue-700 hover:underline mb-1">
                      <a href={`mailto:${opportunity.pointOfContact[0].email}`}>{opportunity.pointOfContact[0].email}</a>
                    </div>
                  )}
                  {opportunity.pointOfContact[0].phone && (
                    <div className="text-slate-700">{opportunity.pointOfContact[0].phone}</div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Attachments & Documents */}
          {hasDocuments && (
            <div className="bg-white border-2 border-slate-200 rounded-lg overflow-hidden">
              <div className="bg-slate-100 px-5 py-3 border-b-2 border-slate-200">
                <h3 className="font-bold text-slate-900 uppercase tracking-wide text-sm flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  Attachments & Documents ({documents.length})
                </h3>
              </div>
              <div className="p-5 space-y-3">
                {documents.map((doc, index) => {
                  const docName = getDocumentName(doc, index);
                  const hasSummary = summaries[doc];
                  return (
                    <div key={index} className="border-2 border-slate-200 rounded-lg overflow-hidden">
                      <div className="flex items-center justify-between p-4 bg-slate-50">
                        <div className="flex items-center flex-1 min-w-0 mr-3">
                          <FileText className="h-5 w-5 mr-3 text-slate-600 flex-shrink-0" />
                          <span className="truncate font-semibold text-sm text-slate-900">
                            {docName}
                          </span>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-slate-300 hover:bg-slate-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(doc, '_blank');
                            }}
                          >
                            <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                            Open
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-blue-300 hover:bg-blue-50 text-blue-700"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSummarize(doc, docName);
                            }}
                            disabled={summarizing === doc || Boolean(hasSummary)}
                          >
                            {summarizing === doc ? (
                              <>
                                <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                                Summarizing...
                              </>
                            ) : hasSummary ? (
                              <>
                                <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                                Summarized
                              </>
                            ) : (
                              <>
                                <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                                Summarize
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                      {hasSummary && (
                        <div className="p-4 bg-blue-50 border-t-2 border-blue-200">
                          <div className="flex items-start gap-2 mb-2">
                            <Sparkles className="h-4 w-4 text-blue-700 flex-shrink-0 mt-0.5" />
                            <span className="text-xs font-bold text-blue-900 uppercase tracking-wider">AI Summary</span>
                          </div>
                          <p className="text-sm text-slate-700 leading-relaxed">{summaries[doc]}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Footer - Metadata & Links */}
          <div className="flex items-center justify-between pt-4 border-t-2 border-slate-200 text-xs text-slate-600">
            <div>
              Posted {formatDate(opportunity.postedDate)}
              {opportunity.modifiedDate && opportunity.modifiedDate !== opportunity.postedDate && (
                <> • Modified {formatDate(opportunity.modifiedDate)}</>
              )}
            </div>
            {opportunity.uiLink && (
              <Button
                variant="link"
                size="sm"
                className="text-blue-700"
                onClick={() => window.open(opportunity.uiLink, '_blank')}
              >
                View on SAM.gov
                <ExternalLink className="h-3 w-3 ml-1" />
              </Button>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            {onExpressInterest && (
              <Button
                onClick={onExpressInterest}
                className="flex-1 bg-green-700 hover:bg-green-800 text-white font-bold uppercase tracking-wide"
                size="lg"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Express Interest
              </Button>
            )}
            <Button
              className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold uppercase tracking-wide"
              size="lg"
            >
              <FileText className="h-4 w-4 mr-2" />
              Save Opportunity
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
