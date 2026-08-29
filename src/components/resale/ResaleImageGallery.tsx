"use client";

import { useState, useEffect } from "react";

import { ChevronLeft, ChevronRight, ImageIcon, Loader2 } from "lucide-react";
import type { ResaleListingImageRow } from "@/lib/database/resale/types";

interface ResaleImageGalleryProps {
  title: string;
  images: ResaleListingImageRow[];
  signedUrls: Record<string, string>;
}

export function ResaleImageGallery({ title, images, signedUrls }: ResaleImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [blobUrls, setBlobUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    let active = true;
    const generatedUrls: string[] = [];

    const fetchImages = async () => {
      const newBlobUrls: Record<string, string> = {};
      for (const [path, url] of Object.entries(signedUrls)) {
        if (!url) continue;
        try {
          // Replace 127.0.0.1 with localhost to ensure it matches connect-src CSP
          const fetchUrl = url.replace('127.0.0.1', 'localhost');
          const res = await fetch(fetchUrl);
          if (res.ok) {
            const blob = await res.blob();
            const objectUrl = URL.createObjectURL(blob);
            if (active) {
              newBlobUrls[path] = objectUrl;
              generatedUrls.push(objectUrl);
            } else {
              URL.revokeObjectURL(objectUrl);
            }
          }
        } catch (err) {
          console.error("Failed to fetch image", err);
        }
      }
      if (active) {
        setBlobUrls(newBlobUrls);
      }
    };

    fetchImages();

    return () => {
      active = false;
      generatedUrls.forEach(URL.revokeObjectURL);
    };
  }, [signedUrls]);

  const getImageUrl = (path: string) => {
    return blobUrls[path] || '';
  };

  // Filter images that have valid signed URLs to avoid broken states
  const validImages = images.filter((img) => signedUrls[img.storage_path]);
  const currentImage = validImages[currentIndex];

  if (validImages.length === 0) {
    return (
      <div className="w-full aspect-square md:aspect-[4/3] bg-black/40 border border-[#00E676]/10 rounded-2xl flex flex-col items-center justify-center text-[#A7B8B0]/60">
        <ImageIcon size={48} className="mb-4 opacity-50" />
        <p className="text-sm font-medium">No images available</p>
      </div>
    );
  }

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? validImages.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === validImages.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Main Image */}
      <div className="relative w-full aspect-square md:aspect-[4/3] bg-black/40 border border-[#00E676]/10 rounded-2xl overflow-hidden group">
        {getImageUrl(currentImage.storage_path) ? (
          <img
            src={getImageUrl(currentImage.storage_path)}
            alt={`${title} - Image ${currentIndex + 1}`}
            className="absolute inset-0 w-full h-full object-contain"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#00E676]/50" />
          </div>
        )}

        {validImages.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              aria-label="Previous image"
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/60 border border-white/10 flex items-center justify-center text-white opacity-75 sm:opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80 hover:border-[#00E676]/50 focus-visible:opacity-100"
            >
              <ChevronLeft size={20} className="sm:w-6 sm:h-6" />
            </button>
            <button
              onClick={handleNext}
              aria-label="Next image"
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/60 border border-white/10 flex items-center justify-center text-white opacity-75 sm:opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80 hover:border-[#00E676]/50 focus-visible:opacity-100"
            >
              <ChevronRight size={20} className="sm:w-6 sm:h-6" />
            </button>
            <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 bg-black/80 backdrop-blur-md px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium text-white/90 border border-white/10">
              {currentIndex + 1} / {validImages.length}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {validImages.length > 1 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {validImages.map((img, idx) => {
            const isSelected = idx === currentIndex;
            return (
              <button
                key={img.id}
                onClick={() => setCurrentIndex(idx)}
                aria-label={`View image ${idx + 1}`}
                aria-current={isSelected ? "true" : "false"}
                className={`relative shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                  isSelected
                    ? "border-[#00E676] ring-2 ring-[#00E676]/20 opacity-100"
                    : "border-transparent opacity-60 hover:opacity-100 hover:border-[#00E676]/50"
                }`}
              >
                {getImageUrl(img.storage_path) ? (
                  <img
                    src={getImageUrl(img.storage_path)}
                    alt={`Thumbnail ${idx + 1}`}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <Loader2 className="w-4 h-4 animate-spin text-[#00E676]/30" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
