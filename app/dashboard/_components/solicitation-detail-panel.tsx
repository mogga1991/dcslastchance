"use client";

import { useEffect, useState } from "react";
import { X, FileText, Download, Target, TrendingUp, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { SAMOpportunity } from "@/lib/sam-gov";
import { getDaysUntilDeadline, getUrgencyLevel } from "@/lib/sam-gov";
import { QualificationCheckModal } from "./qualification-check-modal";

interface SolicitationDetailPanelProps {
  opportunity: SAMOpportunity | null;
  isOpen: boolean;
  onClose: () => void;
  onCheckQualification?: () => void;
  onBidDecision?: () => void;
  onSave?: () => void;
}

export function SolicitationDetailPanel({
  opportunity,
  isOpen,
  onClose,
  onCheckQualification,
  onBidDecision,
  onSave,
}: SolicitationDetailPanelProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isQualificationModalOpen, setIsQualificationModalOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isVisible || !opportunity) return null;

  const daysLeft = opportunity.responseDeadLine ? getDaysUntilDeadline(opportunity.responseDeadLine) : null;
  const urgency = opportunity.responseDeadLine ? getUrgencyLevel(opportunity.responseDeadLine) : "normal";

  const urgencyColors = {
    critical: "bg-red-100 text-red-700",
    warning: "bg-yellow-100 text-yellow-700",
    normal: "bg-green-100 text-green-700",
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/20 z-40 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={`fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 overflow-y-auto transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-start justify-between z-10">
          <div className="flex-1 pr-4">
            <h2 className="font-bold text-lg line-clamp-2">{opportunity.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            <Badge className="bg-blue-600 text-white">{opportunity.type}</Badge>
            {opportunity.typeOfSetAsideDescription && (
              <Badge variant="outline">{opportunity.typeOfSetAsideDescription}</Badge>
            )}
            {daysLeft !== null && (
              <Badge className={urgencyColors[urgency]}>
                {daysLeft > 0 ? `${daysLeft}d left` : "Expired"}
              </Badge>
            )}
          </div>

          {/* Mock Match Score & Win Probability */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-blue-600">73%</div>
              <div className="text-sm text-gray-600 mt-1">Match Score</div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-green-600">88%</div>
              <div className="text-sm text-gray-600 mt-1">Win Probability</div>
            </div>
          </div>

          {/* Key Details */}
          <div>
            <h3 className="font-semibold text-sm text-gray-500 mb-3">Key Details</h3>
            <div className="space-y-2 text-sm">
              <DetailRow label="Notice ID" value={opportunity.noticeId} />
              <DetailRow label="SOL Number" value={opportunity.solicitationNumber} />
              <DetailRow label="Posted Date" value={formatDate(opportunity.postedDate)} />
              <DetailRow label="Response Due" value={formatDate(opportunity.responseDeadLine)} />
              <DetailRow label="Set-Aside" value={opportunity.typeOfSetAsideDescription || "N/A"} />
              <DetailRow label="NAICS Code" value={opportunity.naicsCode || "N/A"} />
              {opportunity.placeOfPerformance && (
                <DetailRow
                  label="Place of Perf."
                  value={`${opportunity.placeOfPerformance.city?.name || ""}, ${opportunity.placeOfPerformance.state?.code || ""}`}
                />
              )}
            </div>
          </div>

          {/* Agency Information */}
          <div>
            <h3 className="font-semibold text-sm text-gray-500 mb-3">Agency Information</h3>
            <div className="space-y-2 text-sm">
              <DetailRow label="Department" value={opportunity.department} />
              <DetailRow label="Subtier" value={opportunity.subTier} />
              <DetailRow label="Office" value={opportunity.office} />
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="font-semibold text-sm text-gray-500 mb-3">Description</h3>
            <p className="text-sm text-gray-700 leading-relaxed">
              {opportunity.description || "No description available."}
            </p>
          </div>

          {/* Point of Contact */}
          {opportunity.pointOfContact && opportunity.pointOfContact.length > 0 && (
            <div>
              <h3 className="font-semibold text-sm text-gray-500 mb-3">Point of Contact</h3>
              {opportunity.pointOfContact.map((contact, index) => (
                <div key={index} className="text-sm space-y-1 mb-3">
                  <div className="font-medium">{contact.fullName}</div>
                  {contact.email && (
                    <div className="text-gray-600">
                      <a href={`mailto:${contact.email}`} className="hover:underline">
                        {contact.email}
                      </a>
                    </div>
                  )}
                  {contact.phone && <div className="text-gray-600">{contact.phone}</div>}
                </div>
              ))}
            </div>
          )}

          {/* Attachments */}
          {opportunity.resourceLinks && opportunity.resourceLinks.length > 0 && (
            <div>
              <h3 className="font-semibold text-sm text-gray-500 mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Attachments ({opportunity.resourceLinks.length})
              </h3>
              <div className="space-y-2">
                {opportunity.resourceLinks.slice(0, 3).map((link, index) => (
                  <a
                    key={index}
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-700">Document {index + 1}</span>
                    </div>
                    <Download className="h-4 w-4 text-gray-400" />
                  </a>
                ))}
                {opportunity.resourceLinks.length > 3 && (
                  <div className="text-center text-sm text-gray-500">
                    +{opportunity.resourceLinks.length - 3} more documents
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Links */}
          {opportunity.uiLink && (
            <div>
              <a
                href={opportunity.uiLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline flex items-center gap-1"
              >
                View on SAM.gov →
              </a>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="sticky bottom-0 bg-white border-t p-6 space-y-3">
          <Button
            onClick={() => setIsQualificationModalOpen(true)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            size="lg"
          >
            <Target className="h-5 w-5 mr-2" />
            Check If I Qualify
          </Button>

          <Button
            onClick={onBidDecision}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
            size="lg"
          >
            <TrendingUp className="h-5 w-5 mr-2" />
            Bid / No-Bid Decision
          </Button>

          <Button
            onClick={onSave}
            variant="outline"
            className="w-full"
            size="lg"
          >
            <Bookmark className="h-5 w-5 mr-2" />
            Save for Later
          </Button>
        </div>
      </div>

      {/* Qualification Check Modal */}
      <QualificationCheckModal
        opportunity={opportunity}
        isOpen={isQualificationModalOpen}
        onClose={() => setIsQualificationModalOpen(false)}
        onSaveOpportunity={(qualified) => {
          if (onSave) {
            onSave();
          }
        }}
      />
    </>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-1.5 border-b border-gray-100">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-900 text-right">{value}</span>
    </div>
  );
}
