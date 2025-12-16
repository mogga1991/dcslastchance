"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, XCircle, AlertCircle, Info } from "lucide-react";
import { toast } from "sonner";
import type { SAMOpportunity } from "@/types/sam";
import type { QualificationResult, QualificationCheck } from "@/lib/qualification-matcher";

interface QualificationCheckModalProps {
  opportunity: SAMOpportunity | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveOpportunity?: (qualified: boolean) => void;
}

export function QualificationCheckModal({
  opportunity,
  isOpen,
  onClose,
  onSaveOpportunity,
}: QualificationCheckModalProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<QualificationResult | null>(null);

  const handleCheckQualification = async () => {
    if (!opportunity) return;

    setLoading(true);
    try {
      const response = await fetch("/api/qualification-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ opportunity }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 404 && !data.has_profile) {
          toast.error("Please create a company profile in Settings first");
        } else {
          toast.error(data.error || "Failed to check qualification");
        }
        return;
      }

      setResult(data.qualification);
      toast.success("Qualification check complete");
    } catch (error) {
      console.error("Error checking qualification:", error);
      toast.error("Failed to check qualification");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (result && onSaveOpportunity) {
      onSaveOpportunity(result.overall_status !== "not_qualified");
      toast.success("Opportunity saved");
      onClose();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "qualified":
      case "pass":
        return "text-green-600 bg-green-50";
      case "partial":
        return "text-yellow-600 bg-yellow-50";
      case "not_qualified":
      case "fail":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "qualified":
      case "pass":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case "partial":
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case "not_qualified":
      case "fail":
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Info className="h-5 w-5 text-gray-600" />;
    }
  };

  const renderCheckDetail = (
    label: string,
    check: QualificationCheck,
    key: string
  ) => {
    if (check.status === "not_applicable") {
      return null;
    }

    return (
      <div key={key} className="border rounded-lg p-4 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon(check.status)}
            <h4 className="font-medium">{label}</h4>
          </div>
          <Badge className={getStatusColor(check.status)}>
            {check.status === "pass" ? "Pass" : check.status === "partial" ? "Partial" : "Fail"}
          </Badge>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Required:</span>
            <p className="font-medium">{check.required}</p>
          </div>
          <div>
            <span className="text-gray-500">Yours:</span>
            <p className="font-medium">{check.yours}</p>
          </div>
        </div>
        <p className="text-sm text-gray-600">{check.details}</p>
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${
                check.status === "pass"
                  ? "bg-green-500"
                  : check.status === "partial"
                  ? "bg-yellow-500"
                  : "bg-red-500"
              }`}
              style={{ width: `${check.score}%` }}
            />
          </div>
          <span className="text-sm font-medium text-gray-600">{check.score}%</span>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Qualification Check</DialogTitle>
        </DialogHeader>

        {!result ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Check if your company qualifies for this opportunity based on your company profile.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">What we&apos;ll check:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• NAICS code match</li>
                <li>• Set-aside certification requirements</li>
                <li>• Security clearance requirements</li>
                <li>• Geographic coverage</li>
              </ul>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCheckQualification} disabled={loading} className="flex-1">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Checking...
                  </>
                ) : (
                  "Run Qualification Check"
                )}
              </Button>
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Overall Score */}
            <div className={`rounded-lg p-6 ${getStatusColor(result.overall_status)}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {getStatusIcon(result.overall_status)}
                  <div>
                    <h3 className="text-xl font-bold">
                      {result.overall_status === "qualified"
                        ? "Qualified"
                        : result.overall_status === "partial"
                        ? "Partially Qualified"
                        : "Not Qualified"}
                    </h3>
                    <p className="text-sm opacity-80">
                      Based on your company profile
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold">{result.overall_score}</div>
                  <div className="text-sm opacity-80">out of 100</div>
                </div>
              </div>
              <div className="flex-1 bg-white/30 rounded-full h-3">
                <div
                  className={`h-3 rounded-full ${
                    result.overall_status === "qualified"
                      ? "bg-green-600"
                      : result.overall_status === "partial"
                      ? "bg-yellow-600"
                      : "bg-red-600"
                  }`}
                  style={{ width: `${result.overall_score}%` }}
                />
              </div>
            </div>

            {/* Individual Checks */}
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">Detailed Breakdown</h4>
              {renderCheckDetail("NAICS Code", result.checks.naics, "naics")}
              {renderCheckDetail("Set-Aside Certification", result.checks.set_aside, "set_aside")}
              {renderCheckDetail("Security Clearance", result.checks.clearance, "clearance")}
              {renderCheckDetail("Geographic Coverage", result.checks.geographic, "geographic")}
            </div>

            {/* Blockers */}
            {result.blockers.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-medium text-red-900 mb-2 flex items-center gap-2">
                  <XCircle className="h-4 w-4" />
                  Critical Blockers
                </h4>
                <ul className="text-sm text-red-800 space-y-1">
                  {result.blockers.map((blocker, idx) => (
                    <li key={idx}>• {blocker}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommendations */}
            {result.recommendations.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-medium text-yellow-900 mb-2 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Recommendations
                </h4>
                <ul className="text-sm text-yellow-800 space-y-1">
                  {result.recommendations.map((rec, idx) => (
                    <li key={idx}>• {rec}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              {result.overall_status !== "not_qualified" && onSaveOpportunity && (
                <Button onClick={handleSave} className="flex-1">
                  Save Opportunity
                </Button>
              )}
              <Button variant="outline" onClick={onClose} className="flex-1">
                Close
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
