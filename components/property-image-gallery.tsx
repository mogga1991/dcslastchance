"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PropertyImageGalleryProps {
  images: string[];
  propertyTitle: string;
  layout?: "grid" | "hero" | "cards";
  className?: string;
}

export function PropertyImageGallery({
  images,
  propertyTitle,
  layout = "grid",
  className,
}: PropertyImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  if (!images || images.length === 0) {
    return (
      <div className={cn("relative bg-gray-200 rounded-lg overflow-hidden", className)}>
        <div className="aspect-video flex items-center justify-center text-gray-400">
          <div className="text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="mt-2 text-sm">No photos available</p>
          </div>
        </div>
      </div>
    );
  }

  // Hero Layout (like first image example)
  if (layout === "hero") {
    return (
      <div className={cn("grid grid-cols-12 gap-2", className)}>
        {/* Main large image */}
        <div className="col-span-12 lg:col-span-8 relative aspect-[4/3] rounded-lg overflow-hidden cursor-pointer group"
          onClick={() => {
            setSelectedImage(0);
            setIsLightboxOpen(true);
          }}
        >
          <Image
            src={images[0]}
            alt={`${propertyTitle} - Main`}
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />
        </div>

        {/* Thumbnail grid (right side) */}
        <div className="col-span-12 lg:col-span-4 grid grid-rows-3 gap-2">
          {images.slice(1, 4).map((image, idx) => (
            <div
              key={idx}
              className="relative aspect-[4/3] rounded-lg overflow-hidden cursor-pointer group"
              onClick={() => {
                setSelectedImage(idx + 1);
                setIsLightboxOpen(true);
              }}
            >
              <Image
                src={image}
                alt={`${propertyTitle} - ${idx + 2}`}
                fill
                className="object-cover transition-transform group-hover:scale-105"
              />
              {idx === 2 && images.length > 4 && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <span className="text-white text-lg font-semibold">
                    +{images.length - 4} more
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Lightbox */}
        {isLightboxOpen && (
          <ImageLightbox
            images={images}
            currentIndex={selectedImage}
            onClose={() => setIsLightboxOpen(false)}
            onNext={() => setSelectedImage((prev) => (prev + 1) % images.length)}
            onPrev={() => setSelectedImage((prev) => (prev - 1 + images.length) % images.length)}
            propertyTitle={propertyTitle}
          />
        )}
      </div>
    );
  }

  // Cards Layout (like third image example)
  if (layout === "cards") {
    return (
      <div className={cn("grid grid-cols-12 gap-2", className)}>
        {/* Large left image */}
        <div className="col-span-12 lg:col-span-8 relative aspect-[4/3] rounded-2xl overflow-hidden cursor-pointer group"
          onClick={() => {
            setSelectedImage(0);
            setIsLightboxOpen(true);
          }}
        >
          <Image
            src={images[0]}
            alt={`${propertyTitle} - Main`}
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />
        </div>

        {/* Right side stacked images */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-2">
          {images.slice(1, 3).map((image, idx) => (
            <div
              key={idx}
              className="relative aspect-[4/3] rounded-2xl overflow-hidden cursor-pointer group"
              onClick={() => {
                setSelectedImage(idx + 1);
                setIsLightboxOpen(true);
              }}
            >
              <Image
                src={image}
                alt={`${propertyTitle} - ${idx + 2}`}
                fill
                className="object-cover transition-transform group-hover:scale-105"
              />
              {idx === 1 && images.length > 3 && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end justify-center pb-4">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="bg-white hover:bg-white/90"
                  >
                    See All {images.length} Photos
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Lightbox */}
        {isLightboxOpen && (
          <ImageLightbox
            images={images}
            currentIndex={selectedImage}
            onClose={() => setIsLightboxOpen(false)}
            onNext={() => setSelectedImage((prev) => (prev + 1) % images.length)}
            onPrev={() => setSelectedImage((prev) => (prev - 1 + images.length) % images.length)}
            propertyTitle={propertyTitle}
          />
        )}
      </div>
    );
  }

  // Grid Layout (default - like second image example)
  return (
    <div className={cn("space-y-2", className)}>
      {/* Main large image */}
      <div className="relative aspect-[16/9] rounded-2xl overflow-hidden cursor-pointer group"
        onClick={() => {
          setSelectedImage(0);
          setIsLightboxOpen(true);
        }}
      >
        <Image
          src={images[0]}
          alt={`${propertyTitle} - Main`}
          fill
          className="object-cover transition-transform group-hover:scale-105"
        />
      </div>

      {/* Thumbnail row */}
      <div className="grid grid-cols-4 gap-2">
        {images.slice(1, 5).map((image, idx) => (
          <div
            key={idx}
            className="relative aspect-[4/3] rounded-lg overflow-hidden cursor-pointer group"
            onClick={() => {
              setSelectedImage(idx + 1);
              setIsLightboxOpen(true);
            }}
          >
            <Image
              src={image}
              alt={`${propertyTitle} - ${idx + 2}`}
              fill
              className="object-cover transition-transform group-hover:scale-105"
            />
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {isLightboxOpen && (
        <ImageLightbox
          images={images}
          currentIndex={selectedImage}
          onClose={() => setIsLightboxOpen(false)}
          onNext={() => setSelectedImage((prev) => (prev + 1) % images.length)}
          onPrev={() => setSelectedImage((prev) => (prev - 1 + images.length) % images.length)}
          propertyTitle={propertyTitle}
        />
      )}
    </div>
  );
}

interface ImageLightboxProps {
  images: string[];
  currentIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  propertyTitle: string;
}

function ImageLightbox({
  images,
  currentIndex,
  onClose,
  onNext,
  onPrev,
  propertyTitle,
}: ImageLightboxProps) {
  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
      {/* Close button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 text-white hover:bg-white/10"
        onClick={onClose}
      >
        <X className="h-6 w-6" />
      </Button>

      {/* Previous button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/10"
        onClick={onPrev}
      >
        <ChevronLeft className="h-8 w-8" />
      </Button>

      {/* Image */}
      <div className="relative w-full h-full max-w-7xl max-h-[90vh] mx-4">
        <Image
          src={images[currentIndex]}
          alt={`${propertyTitle} - ${currentIndex + 1}`}
          fill
          className="object-contain"
        />
      </div>

      {/* Next button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/10"
        onClick={onNext}
      >
        <ChevronRight className="h-8 w-8" />
      </Button>

      {/* Counter */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-4 py-2 rounded-full text-sm">
        {currentIndex + 1} / {images.length}
      </div>
    </div>
  );
}
