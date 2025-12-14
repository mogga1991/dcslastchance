"use client";

import { useState, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download } from "lucide-react";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

type PDFViewerProps = {
  url: string;
  filename?: string;
  initialPage?: number;
  highlightText?: string;
  onPageChange?: (page: number) => void;
};

export function PDFViewer({
  url,
  filename = "document.pdf",
  initialPage = 1,
  highlightText,
  onPageChange,
}: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState(initialPage);
  const [scale, setScale] = useState(1.0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setPageNumber(initialPage);
  }, [initialPage]);

  useEffect(() => {
    onPageChange?.(pageNumber);
  }, [pageNumber, onPageChange]);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setLoading(false);
    setError(null);
  }

  function onDocumentLoadError(error: Error) {
    console.error("PDF load error:", error);
    setError("Failed to load PDF. Please try again.");
    setLoading(false);
  }

  function changePage(offset: number) {
    setPageNumber((prev) => Math.min(Math.max(1, prev + offset), numPages));
  }

  function goToPage(page: number) {
    const pageNum = Math.min(Math.max(1, page), numPages);
    setPageNumber(pageNum);
  }

  function changeScale(delta: number) {
    setScale((prev) => Math.min(Math.max(0.5, prev + delta), 3.0));
  }

  function downloadPDF() {
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
  }

  return (
    <div className="flex h-full flex-col bg-muted/30">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 border-b bg-background p-4">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => changePage(-1)}
            disabled={pageNumber <= 1 || loading}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-2">
            <Input
              type="number"
              min={1}
              max={numPages}
              value={pageNumber}
              onChange={(e) => goToPage(parseInt(e.target.value) || 1)}
              className="w-16 text-center"
              disabled={loading}
            />
            <span className="text-sm text-muted-foreground">
              / {numPages || "—"}
            </span>
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={() => changePage(1)}
            disabled={pageNumber >= numPages || loading}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => changeScale(-0.1)}
            disabled={scale <= 0.5}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>

          <span className="min-w-16 text-center text-sm">
            {Math.round(scale * 100)}%
          </span>

          <Button
            variant="outline"
            size="icon"
            onClick={() => changeScale(0.1)}
            disabled={scale >= 3.0}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>

          <Button variant="outline" size="icon" onClick={downloadPDF}>
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* PDF Content */}
      <div className="flex-1 overflow-auto">
        <div className="flex min-h-full items-start justify-center p-4">
          {loading && (
            <div className="flex h-96 items-center justify-center">
              <div className="text-muted-foreground">Loading PDF...</div>
            </div>
          )}

          {error && (
            <div className="flex h-96 items-center justify-center">
              <div className="text-destructive">{error}</div>
            </div>
          )}

          {!loading && !error && (
            <Document
              file={url}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              className="shadow-lg"
            >
              <Page
                pageNumber={pageNumber}
                scale={scale}
                renderTextLayer={true}
                renderAnnotationLayer={true}
                className="bg-white"
              />
            </Document>
          )}
        </div>
      </div>

      {/* Optional highlight indicator */}
      {highlightText && (
        <div className="border-t bg-muted/50 p-2 text-sm">
          <span className="font-medium">Searching for:</span>{" "}
          <span className="text-muted-foreground">{highlightText}</span>
        </div>
      )}
    </div>
  );
}
