"use client";

import Link from "next/link";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ExternalLink, FileText, MapPin } from "lucide-react";
import type { EvidenceSource } from "@/lib/proposaliq/schemas";

type EvidenceSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  evidence: EvidenceSource;
  documentId?: string;
  requirementId?: string;
  requirementText?: string;
};

export function EvidenceSheet({
  open,
  onOpenChange,
  evidence,
  documentId,
  requirementId,
  requirementText,
}: EvidenceSheetProps) {
  const hasPageNumber = evidence.page != null && evidence.page > 0;
  const hasSection = Boolean(evidence.section);
  const hasSnippet = Boolean(evidence.text_snippet);
  const hasConfidence = evidence.confidence != null;

  // Build PDF viewer URL with page parameter
  const pdfUrl = documentId && hasPageNumber
    ? `/dashboard/documents/${documentId}?page=${evidence.page}`
    : documentId
    ? `/dashboard/documents/${documentId}`
    : null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Evidence Details
          </SheetTitle>
          <SheetDescription>
            Source citation for requirement {requirementId}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Requirement Context */}
          {requirementText && (
            <div className="rounded-lg border p-4">
              <div className="mb-2 text-sm font-medium">Requirement</div>
              <p className="text-sm text-muted-foreground">{requirementText}</p>
            </div>
          )}

          <Separator />

          {/* Evidence Location */}
          <div className="space-y-4">
            <div className="text-sm font-medium">Source Location</div>

            {hasPageNumber && (
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <div className="text-sm font-medium">Page Number</div>
                  <div className="text-sm text-muted-foreground">
                    Page {evidence.page}
                  </div>
                </div>
              </div>
            )}

            {hasSection && (
              <div className="flex items-start gap-3">
                <FileText className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <div className="text-sm font-medium">Section</div>
                  <div className="text-sm text-muted-foreground">
                    {evidence.section}
                  </div>
                </div>
              </div>
            )}

            {hasConfidence && (
              <div className="flex items-start gap-3">
                <div className="mt-0.5 h-4 w-4" />
                <div className="flex-1">
                  <div className="text-sm font-medium">Extraction Confidence</div>
                  <Badge
                    variant={
                      (evidence.confidence ?? 0) >= 0.8
                        ? "default"
                        : (evidence.confidence ?? 0) >= 0.5
                        ? "secondary"
                        : "outline"
                    }
                  >
                    {Math.round((evidence.confidence ?? 0) * 100)}%
                  </Badge>
                </div>
              </div>
            )}
          </div>

          {/* Text Snippet */}
          {hasSnippet && (
            <>
              <Separator />
              <div className="space-y-3">
                <div className="text-sm font-medium">Extracted Text</div>
                <div className="rounded-lg bg-muted p-4">
                  <p className="text-sm leading-relaxed">
                    {evidence.text_snippet}
                  </p>
                </div>
              </div>
            </>
          )}

          {/* Actions */}
          {pdfUrl && (
            <>
              <Separator />
              <div className="space-y-3">
                <div className="text-sm font-medium">Actions</div>
                <Link href={pdfUrl} target="_blank">
                  <Button variant="outline" className="w-full">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View in Document
                    {hasPageNumber && ` (Page ${evidence.page})`}
                  </Button>
                </Link>
              </div>
            </>
          )}

          {/* No Evidence Available */}
          {!hasPageNumber && !hasSection && !hasSnippet && (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <div className="text-sm text-muted-foreground">
                No source citation available for this requirement
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
