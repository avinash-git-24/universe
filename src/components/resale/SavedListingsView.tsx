"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, PackageX, Heart } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getSavedListings, getSignedImageUrls, type ResaleListingWithImages } from "@/lib/database/resale";
import { ResaleListingCard } from "./ResaleListingCard";
import { ResaleSkeleton } from "./ResaleSkeleton";

export function SavedListingsView() {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const [listings, setListings] = useState<ResaleListingWithImages[]>([]);
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const supabase = createClient();
      setIsLoading(true);
      try {
        const saved = await getSavedListings(supabase);
        if (cancelled) return;

        // Fetch signed URLs
        const toSign = saved.flatMap((l) => {
          const first = l.images?.[0];
          if (!first) return [];
          return [{ id: first.id, storage_path: first.storage_path }];
        });

        let urls: Record<string, string> = {};
        if (toSign.length > 0) {
          const map: Record<string, string> = {};
          saved.forEach((l) => {
            const first = l.images?.[0];
            if (first) map[first.id] = l.id;
          });
          const signed = await getSignedImageUrls(supabase, toSign);
          urls = signed.reduce<Record<string, string>>((acc, { imageId, signedUrl }) => {
            const listingId = map[imageId];
            if (listingId && signedUrl) acc[listingId] = signedUrl;
            return acc;
          }, {});
        }

        if (cancelled) return;
        setListings(saved);
        setImageUrls(urls);
      } catch (err) {
        if (cancelled) return;
        setError("Failed to load saved listings.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen pt-4 sm:pt-8 pb-16 px-3 sm:px-6 lg:px-8">
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Link
              href="/dashboard/marketplace"
              className="inline-flex items-center gap-2 text-[#A7B8B0]/70 hover:text-white text-xs sm:text-sm font-medium no-underline transition-colors"
            >
              <ArrowLeft size={16} />
              Back to Marketplace
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center shrink-0">
              <Heart size={20} className="text-red-500" />
            </div>
            <h1 className="text-white text-2xl sm:text-3xl lg:text-4xl font-extrabold m-0 tracking-tight">
              Saved Listings
            </h1>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <ResaleSkeleton count={4} />
        ) : error ? (
          <div className="text-center py-12 px-4 bg-red-500/5 rounded-2xl border border-red-500/10">
            <p className="text-red-400 font-semibold">{error}</p>
            <button
              onClick={() => {
                startTransition(() => {
                  router.refresh();
                });
              }}
              className="mt-4 px-6 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 cursor-pointer hover:bg-red-500/20 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : listings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 sm:py-24 px-4 sm:px-8 bg-[#0A0F0C]/40 rounded-3xl border border-dashed border-[#66FFB2]/15 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#A7B8B0]/10 flex items-center justify-center mb-6">
              <PackageX size={32} className="text-[#A7B8B0]/40" />
            </div>
            <h3 className="text-white text-xl sm:text-2xl font-bold m-0 mb-2">No saved listings</h3>
            <p className="text-[#A7B8B0]/70 text-sm sm:text-base max-w-[400px] m-0 mb-8 leading-relaxed">
              You haven&apos;t saved any active listings yet. Browse the marketplace and tap the heart icon to save items for later.
            </p>
            <Link href="/dashboard/marketplace" className="no-underline">
              <button className="px-8 py-3 bg-[#00E676] hover:bg-[#00E676]/90 border-none rounded-xl text-[#050A07] text-sm font-extrabold cursor-pointer shadow-[0_4px_20px_rgba(0,230,118,0.2)] transition-all">
                Browse Marketplace
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
            {listings.map((listing) => (
              <ResaleListingCard
                key={listing.id}
                listing={listing}
                primaryImageUrl={imageUrls[listing.id] ?? null}
                isFavorited={true}
                showFavoriteButton={true}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
