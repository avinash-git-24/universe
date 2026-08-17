"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ImageIcon } from "lucide-react";
import type { ResaleListingImageRow } from "@/lib/database/resale/types";

interface ResaleImageGalleryProps {
  title: string;
  images: ResaleListingImageRow[];
  signedUrls: Record<string, string>;
}

export function ResaleImageGallery({ title, images, signedUrls }: ResaleImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

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
        <Image
          src={signedUrls[currentImage.storage_path]}
          alt={`${title} - Image ${currentIndex + 1}`}
          fill
          className="object-contain"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />

        {validImages.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              aria-label="Previous image"
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 border border-white/10 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80 hover:border-[#00E676]/50 focus-visible:opacity-100"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={handleNext}
              aria-label="Next image"
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 border border-white/10 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80 hover:border-[#00E676]/50 focus-visible:opacity-100"
            >
              <ChevronRight size={24} />
            </button>
            <div className="absolute bottom-4 right-4 bg-black/80 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium text-white/90 border border-white/10">
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
                <Image
                  src={signedUrls[img.storage_path]}
                  alt={`Thumbnail ${idx + 1}`}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
