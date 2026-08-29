"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  getMyResaleListings,
  getSignedImageUrls,
  type ResaleListingWithImages,
  type ResaleListingRow,
} from "@/lib/database/resale";
import { ResaleListingCard } from "./ResaleListingCard";
import { ResaleSkeleton } from "./ResaleSkeleton";
import { ResaleEmptyState } from "./ResaleEmptyState";
import { ResaleErrorState } from "./ResaleErrorState";
import { Edit2, Package, Tag, Layers, RefreshCw } from "lucide-react";

// ─── State Type ───────────────────────────────────────────────────────────────

interface MyListingsState {
  listings: ResaleListingWithImages[];
  imageUrls: Record<string, string>;
  totalCount: number | null;
  page: number;
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
}

const initialState: MyListingsState = {
  listings: [],
  imageUrls: {},
  totalCount: null,
  page: 1,
  isLoading: true,
  isLoadingMore: false,
  error: null,
};

const PAGE_SIZE = 12;

type StatusTab = "all" | "active" | "reserved" | "sold" | "removed";

// ─── Component ────────────────────────────────────────────────────────────────

export function MyListingsView() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const currentTab = (searchParams.get("tab") as StatusTab) || "all";

  const [data, setData] = useState<MyListingsState>(initialState);
  const [loadMorePage, setLoadMorePage] = useState<number | null>(null);

  // Sync tab to URL
  function setTab(tab: StatusTab) {
    const next = new URLSearchParams(searchParams.toString());
    if (tab === "all") next.delete("tab");
    else next.set("tab", tab);
    startTransition(() => {
      router.replace(`${pathname}?${next.toString()}`, { scroll: false });
    });
  }

  // ── Helper: sign images ──
  async function signImages(
    listings: ResaleListingWithImages[]
  ): Promise<Record<string, string>> {
    const supabase = createClient();
    const map: Record<string, string> = {};
    const toSign = listings.flatMap((l) => {
      const first = l.images?.[0];
      if (!first) return [];
      map[first.id] = l.id;
      return [{ id: first.id, storage_path: first.storage_path }];
    });
    if (toSign.length === 0) return {};
    try {
      const signed = await getSignedImageUrls(supabase, toSign);
      return signed.reduce<Record<string, string>>((acc, { imageId, signedUrl }) => {
        const listingId = map[imageId];
        if (listingId && signedUrl) acc[listingId] = signedUrl;
        return acc;
      }, {});
    } catch (err) {
      console.error("[MyListings] Failed to sign images:", err);
      return {};
    }
  }

  // ── Initial Fetch ──
  useEffect(() => {
    let active = true;
    async function load() {
      setData((prev) => ({ ...prev, isLoading: true, error: null }));
      try {
        const supabase = createClient();
        // We fetch 'newest' sort always
        const res = await getMyResaleListings(supabase, "newest", { page: 1, pageSize: PAGE_SIZE });
        if (!active) return;
        const newImageUrls = await signImages(res.listings);
        if (!active) return;
        setData({
          listings: res.listings,
          imageUrls: newImageUrls,
          totalCount: res.pagination.total,
          page: 1,
          isLoading: false,
          isLoadingMore: false,
          error: null,
        });
      } catch (err: unknown) {
        if (!active) return;
        setData((prev) => ({ ...prev, isLoading: false, error: err instanceof Error ? err.message : "Error" }));
      }
    }
    load();
    return () => {
      active = false;
    };
  }, []); // Only fetch once initially, local filtering for tabs

  // ── Load More ──
  useEffect(() => {
    if (!loadMorePage || loadMorePage <= data.page) return;
    let active = true;
    async function fetchMore() {
      setData((prev) => ({ ...prev, isLoadingMore: true }));
      try {
        const supabase = createClient();
        const res = await getMyResaleListings(supabase, "newest", { page: loadMorePage!, pageSize: PAGE_SIZE });
        if (!active) return;
        const newImageUrls = await signImages(res.listings);
        if (!active) return;
        setData((prev) => ({
          ...prev,
          listings: [...prev.listings, ...res.listings],
          imageUrls: { ...prev.imageUrls, ...newImageUrls },
          page: loadMorePage!,
          isLoadingMore: false,
        }));
      } catch (err: unknown) {
        if (!active) return;
        setData((prev) => ({ ...prev, isLoadingMore: false }));
        // Could show toast here
      }
    }
    fetchMore();
    return () => {
      active = false;
    };
  }, [loadMorePage, data.page]);

  function handleLoadMore() {
    setLoadMorePage(data.page + 1);
  }

  // ── Filter locally based on tab ──
  // Note: Local filtering is used here for simplicity as `getMyResaleListings` doesn't accept status filters.
  // If a user has >12 listings and some are "Sold" on page 2, they will need to click "Load More" to see them.
  const displayListings = data.listings.filter(
    (l) => currentTab === "all" || l.status === currentTab
  );

  const hasMore =
    data.totalCount !== null &&
    data.listings.length < data.totalCount &&
    !data.isLoading;

  return (
    <div className="min-h-screen pt-4 sm:pt-8 pb-16 px-3 sm:px-6 lg:px-8">
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-white font-extrabold text-2xl sm:text-3xl lg:text-4xl m-0 tracking-tight">
              My Inventory
            </h1>
            <p className="text-[#A7B8B0]/80 text-xs sm:text-sm mt-1 mb-0">
              Manage your active, reserved, and sold listings.
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5 w-full sm:w-auto">
            <button
              onClick={() => router.push("/dashboard/marketplace/sell")}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-[#00E676] hover:bg-[#00E676]/90 text-black font-bold text-xs sm:text-sm rounded-xl transition-all shadow-[0_0_15px_rgba(0,230,118,0.3)] hover:shadow-[0_0_25px_rgba(0,230,118,0.5)] cursor-pointer"
            >
              <Package size={16} />
              Post New Item
            </button>
            <button
              onClick={() => router.push("/dashboard/marketplace")}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-medium text-xs sm:text-sm rounded-xl transition-all cursor-pointer"
            >
              Back to Market
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 sm:mb-8 overflow-x-auto pb-2 scrollbar-none">
          {(["all", "active", "reserved", "sold", "removed"] as StatusTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setTab(tab)}
              style={{
                padding: "0.45rem 0.9rem",
                borderRadius: "10px",
                fontWeight: 600,
                fontSize: "0.8rem",
                textTransform: "capitalize",
                whiteSpace: "nowrap",
                transition: "all 0.2s ease",
                background: currentTab === tab ? "rgba(0,230,118,0.15)" : "rgba(255,255,255,0.03)",
                color: currentTab === tab ? "#00E676" : "rgba(167,184,176,0.7)",
                border: `1px solid ${currentTab === tab ? "rgba(0,230,118,0.3)" : "rgba(255,255,255,0.05)"}`,
              }}
              className="hover:bg-white/5 hover:text-white cursor-pointer"
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        {data.isLoading ? (
          <ResaleSkeleton count={8} />
        ) : data.error ? (
          <ResaleErrorState
            onRetry={() => window.location.reload()}
          />
        ) : displayListings.length === 0 ? (
          <ResaleEmptyState
            isFiltered={currentTab !== "all"}
            onClearFilters={currentTab !== "all" ? () => setTab("all") : undefined}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {displayListings.map((listing) => (
              <div key={listing.id} className="relative group">
                <ResaleListingCard
                  listing={listing}
                  primaryImageUrl={data.imageUrls[listing.id] ?? null}
                />
                {/* Overlay edit button that shows on hover and touch */}
                <div className="absolute top-2 right-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      router.push(`/dashboard/marketplace/${listing.id}/edit`);
                    }}
                    className="p-2 bg-black/70 hover:bg-black text-white rounded-full border border-white/20 backdrop-blur-md shadow-lg transition-all cursor-pointer"
                    title="Edit Listing"
                  >
                    <Edit2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Load More */}
        {hasMore && !data.isLoading && (
          <div style={{ marginTop: "3rem", display: "flex", justifyContent: "center" }}>
            <button
              onClick={handleLoadMore}
              disabled={data.isLoadingMore}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.8rem 1.5rem",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "12px",
                color: "#fff",
                fontWeight: 600,
                fontSize: "0.9rem",
                cursor: data.isLoadingMore ? "not-allowed" : "pointer",
                opacity: data.isLoadingMore ? 0.7 : 1,
                transition: "all 0.2s",
              }}
              className="hover:bg-[rgba(255,255,255,0.08)]"
            >
              {data.isLoadingMore ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  Loading...
                </>
              ) : (
                "Load More"
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
