"use client";

import { useCallback, useState } from "react";
import { Upload, FileText, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

type FileUploadZoneProps = {
  onUpload: (file: File) => Promise<void>;
  accept?: string;
  maxSize?: number; // in MB
  disabled?: boolean;
};

export function FileUploadZone({
  onUpload,
  accept = ".pdf",
  maxSize = 50,
  disabled = false,
}: FileUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const validateFile = (file: File): string | null => {
    // Check file type
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      return "Please upload a PDF file";
    }

    // Check file size
    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > maxSize) {
      return `File size must be less than ${maxSize}MB`;
    }

    return null;
  };

  const handleFile = useCallback((file: File) => {
    setError(null);

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSelectedFile(file);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maxSize]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      if (disabled) return;

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        handleFile(files[0]);
      }
    },
    [disabled, handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        handleFile(files[0]);
      }
    },
    [handleFile]
  );

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      // Simulate progress (in real app, track actual upload)
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      await onUpload(selectedFile);

      clearInterval(progressInterval);
      setUploadProgress(100);

      // Reset after successful upload
      setTimeout(() => {
        setSelectedFile(null);
        setUploadProgress(0);
        setIsUploading(false);
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleRemove = () => {
    setSelectedFile(null);
    setError(null);
    setUploadProgress(0);
  };

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      <Card
        className={cn(
          "relative overflow-hidden transition-all duration-200",
          isDragging && "border-signal-orange bg-signal-orange/5",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <label
          htmlFor="file-upload"
          className={cn(
            "flex flex-col items-center justify-center p-12 cursor-pointer",
            disabled && "cursor-not-allowed"
          )}
        >
          <input
            id="file-upload"
            type="file"
            accept={accept}
            onChange={handleFileInput}
            disabled={disabled || isUploading}
            className="hidden"
          />

          <Upload
            className={cn(
              "h-12 w-12 mb-4 transition-colors",
              isDragging ? "text-signal-orange" : "text-muted-foreground"
            )}
          />

          <div className="text-center">
            <p className="text-lg font-medium mb-1">
              {isDragging ? "Drop your file here" : "Upload RFP Document"}
            </p>
            <p className="text-sm text-muted-foreground">
              Drag and drop or{" "}
              <span className="text-signal-orange font-medium">browse files</span>
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              PDF files up to {maxSize}MB
            </p>
          </div>
        </label>
      </Card>

      {/* Selected File */}
      {selectedFile && (
        <Card className="p-4">
          <div className="flex items-start gap-4">
            <FileText className="h-10 w-10 text-signal-orange flex-shrink-0" />

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{selectedFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>

                {!isUploading && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleRemove}
                    className="flex-shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* Progress Bar */}
              {isUploading && (
                <div className="mt-3 space-y-2">
                  <Progress value={uploadProgress} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    {uploadProgress < 100
                      ? `Uploading... ${uploadProgress}%`
                      : "Upload complete!"}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Upload Button */}
          {!isUploading && (
            <div className="mt-4 flex gap-2">
              <Button
                onClick={handleUpload}
                disabled={isUploading}
                className="flex-1"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload & Analyze
                  </>
                )}
              </Button>
            </div>
          )}
        </Card>
      )}

      {/* Error Message */}
      {error && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}
    </div>
  );
}
