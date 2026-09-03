"use client";

import { useState, useEffect, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, ImageIcon, Loader2, Camera, Plus } from "lucide-react";
import type { ResaleListingImageRow } from "@/lib/database/resale/types";
import { uploadResaleListingImage } from "@/lib/database/resale/images";
import { createClient } from "@/lib/supabase/client";

interface ResaleImageGalleryProps {
  title: string;
  images: ResaleListingImageRow[];
  signedUrls: Record<string, string>;
  isOwner?: boolean;
  listingId?: string;
}

export function ResaleImageGallery({ title, images, signedUrls, isOwner, listingId }: ResaleImageGalleryProps) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [blobUrls, setBlobUrls] = useState<Record<string, string>>({});
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

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
    return blobUrls[path] || signedUrls[path] || '';
  };

  const handleQuickUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !listingId) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      const supabase = createClient();
      await uploadResaleListingImage(supabase, listingId, file, images.length);
      router.refresh();
    } catch (err: unknown) {
      console.error("Failed to upload image:", err);
      setUploadError(err instanceof Error ? err.message : "Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  // Filter images that have valid signed URLs or storage_path
  const validImages = images.filter((img) => signedUrls[img.storage_path] || img.storage_path);
  const currentImage = validImages[currentIndex];

  if (validImages.length === 0) {
    return (
      <div className="w-full aspect-square md:aspect-[4/3] bg-black/40 border border-[#00E676]/10 rounded-2xl flex flex-col items-center justify-center text-[#A7B8B0]/60 p-6 text-center">
        <ImageIcon size={48} className="mb-3 opacity-50 text-emerald-400" />
        <p className="text-sm font-medium text-white/80 m-0">No images available</p>
        {isOwner && listingId && (
          <div className="mt-4 flex flex-col items-center gap-2">
            <label
              htmlFor="gallery-quick-photo-upload"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-black font-extrabold text-xs cursor-pointer hover:opacity-95 transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] active:scale-95"
            >
              {isUploading ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
              <span>{isUploading ? "Uploading Photo..." : "Upload Photo for this Listing"}</span>
            </label>
            <input
              id="gallery-quick-photo-upload"
              type="file"
              accept="image/*,.jpg,.jpeg,.png,.webp"
              className="sr-only"
              disabled={isUploading}
              onChange={handleQuickUpload}
            />
            {uploadError && (
              <p className="text-red-400 text-xs mt-1">{uploadError}</p>
            )}
          </div>
        )}
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
      {(validImages.length > 1 || (isOwner && listingId && validImages.length < 6)) && (
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

          {isOwner && listingId && validImages.length < 6 && (
            <label
              htmlFor="gallery-add-more-photos"
              className="relative shrink-0 w-20 h-20 rounded-xl border-2 border-dashed border-emerald-500/40 hover:border-emerald-400 bg-emerald-500/5 hover:bg-emerald-500/10 flex flex-col items-center justify-center text-emerald-400 cursor-pointer transition-all gap-1 text-center"
              title="Add more photos"
            >
              {isUploading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  <Plus size={20} />
                  <span className="text-[10px] font-bold">Add</span>
                </>
              )}
              <input
                id="gallery-add-more-photos"
                type="file"
                accept="image/*,.jpg,.jpeg,.png,.webp"
                className="sr-only"
                disabled={isUploading}
                onChange={handleQuickUpload}
              />
            </label>
          )}
        </div>
      )}
    </div>
  );
}
