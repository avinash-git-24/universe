"use client";

/**
 * ResaleMarketplace — Client Component
 *
 * Owns all interactive state: search, category, condition, price, sort, pagination.
 * Syncs state to/from URL query params (search, category, condition, sort, minPrice, maxPrice).
 * Fetches data via Phase 1C service layer — no direct Supabase calls.
 * Generates signed URLs for listing images in batches.
 */

import { useState, useEffect, useRef, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Link from "next/link";
import {
  Search,
  X,
  SlidersHorizontal,
  ChevronDown,
  Plus,
  ShoppingBag,
  Package,
  Heart,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  getActiveResaleListings,
  getSignedImageUrls,
  VALID_CATEGORIES,
  VALID_CONDITIONS,
  VALID_SORT_OPTIONS,
  type ResaleListingWithImages,
  type ResaleCategory,
  type ResaleCondition,
  type ResaleSortOption,
  type ResaleListingFilters,
  getUserFavoriteIds,
} from "@/lib/database/resale";
import { ResaleListingCard } from "./ResaleListingCard";
import { ResaleSkeleton } from "./ResaleSkeleton";
import { ResaleEmptyState } from "./ResaleEmptyState";
import { ResaleErrorState } from "./ResaleErrorState";

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<string, string> = {
  books: "Books",
  electronics: "Electronics",
  study_materials: "Study Materials",
  hostel: "Hostel",
  sports: "Sports",
  furniture: "Furniture",
  clothing: "Clothing",
  gaming: "Gaming",
  other: "Other",
};

const CONDITION_LABELS: Record<string, string> = {
  new: "New",
  like_new: "Like New",
  good: "Good",
  fair: "Fair",
};

const SORT_LABELS: Record<ResaleSortOption, string> = {
  newest: "Newest",
  oldest: "Oldest",
  price_low_to_high: "Price: Low to High",
  price_high_to_low: "Price: High to Low",
};

const PAGE_SIZE = 12;
const SEARCH_DEBOUNCE_MS = 400;

// ─── State Type ───────────────────────────────────────────────────────────────

interface MarketplaceState {
  listings: ResaleListingWithImages[];
  imageUrls: Record<string, string>;
  totalCount: number | null;
  page: number;
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
}

const initialState: MarketplaceState = {
  listings: [],
  imageUrls: {},
  totalCount: null,
  page: 1,
  isLoading: true,
  isLoadingMore: false,
  error: null,
};

// ─── Component ────────────────────────────────────────────────────────────────

export function ResaleMarketplace() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  // ── Read initial state from URL ──
  const initialSearch = searchParams.get("search") ?? "";
  const initialCategory = searchParams.get("category") ?? "";
  const initialCondition = searchParams.get("condition") ?? "";
  const rawSort = searchParams.get("sort") ?? "newest";
  const initialSort: ResaleSortOption = (VALID_SORT_OPTIONS as readonly string[]).includes(rawSort)
    ? (rawSort as ResaleSortOption)
    : "newest";
  const initialMinPrice = searchParams.get("minPrice") ?? "";
  const initialMaxPrice = searchParams.get("maxPrice") ?? "";

  // ── Filter state ──
  const [search, setSearch] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  const [category, setCategory] = useState<ResaleCategory | "">(
    (VALID_CATEGORIES as readonly string[]).includes(initialCategory)
      ? (initialCategory as ResaleCategory)
      : ""
  );
  const [condition, setCondition] = useState<ResaleCondition | "">(
    (VALID_CONDITIONS as readonly string[]).includes(initialCondition)
      ? (initialCondition as ResaleCondition)
      : ""
  );
  const [sort, setSort] = useState<ResaleSortOption>(initialSort);
  const [minPrice, setMinPrice] = useState(initialMinPrice);
  const [maxPrice, setMaxPrice] = useState(initialMaxPrice);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // ── Data state ──
  const [data, setData] = useState<MarketplaceState>(initialState);

  // ── Track load-more page separately ──
  const [loadMorePage, setLoadMorePage] = useState<number | null>(null);

  // ── Favorites state ──
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // ── Check auth and favorites on mount ──
  useEffect(() => {
    let cancelled = false;
    async function loadAuth() {
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      if (!cancelled && data.user) {
        setIsAuthenticated(true);
        try {
          const ids = await getUserFavoriteIds(supabase);
          if (!cancelled) setFavoriteIds(ids);
        } catch {}
      }
    }
    loadAuth();
    return () => { cancelled = true; };
  }, []);

  // ── Debounce search ──
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, SEARCH_DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search]);

  // ── Sync URL ──
  useEffect(() => {
    const next = new URLSearchParams();
    if (debouncedSearch) next.set("search", debouncedSearch);
    if (category) next.set("category", category);
    if (condition) next.set("condition", condition);
    if (sort !== "newest") next.set("sort", sort);
    if (minPrice) next.set("minPrice", minPrice);
    if (maxPrice) next.set("maxPrice", maxPrice);
    const qs = next.toString();
    startTransition(() => {
      router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, category, condition, sort, minPrice, maxPrice]);

  // ── Helper: build filters ──
  function buildFilters(): ResaleListingFilters {
    const filters: ResaleListingFilters = {};
    if (category) filters.category = category;
    if (condition) filters.condition = condition;
    if (minPrice) {
      const v = parseFloat(minPrice);
      if (!isNaN(v) && v >= 0) filters.minPrice = v;
    }
    if (maxPrice) {
      const v = parseFloat(maxPrice);
      if (!isNaN(v) && v >= 0) filters.maxPrice = v;
    }
    if (debouncedSearch) filters.search = debouncedSearch;
    return filters;
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
      map[first.id] = l.id; // imageRowId → listingId
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
    } catch {
      return {}; // non-fatal
    }
  }

  // ── Fetch fresh listings (page 1) when filters change ──
  useEffect(() => {
    let cancelled = false;

    async function load() {
      const supabase = createClient();
      setData((prev) => ({ ...prev, isLoading: true, error: null }));
      try {
        const { listings: fresh, pagination } = await getActiveResaleListings(
          supabase,
          buildFilters(),
          sort,
          { page: 1, pageSize: PAGE_SIZE }
        );
        if (cancelled) return;
        const urls = await signImages(fresh);
        if (cancelled) return;
        setData({
          listings: fresh,
          imageUrls: urls,
          totalCount: pagination.total,
          page: 1,
          isLoading: false,
          isLoadingMore: false,
          error: null,
        });
      } catch {
        if (cancelled) return;
        setData((prev) => ({ ...prev, isLoading: false, isLoadingMore: false, error: "fetch_failed" }));
      }
    }

    load();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, condition, sort, minPrice, maxPrice, debouncedSearch]);

  // ── Load more ──
  useEffect(() => {
    if (loadMorePage === null) return;
    let cancelled = false;

    async function loadMore() {
      const supabase = createClient();
      setData((prev) => ({ ...prev, isLoadingMore: true }));
      try {
        const { listings: fresh, pagination } = await getActiveResaleListings(
          supabase,
          buildFilters(),
          sort,
          { page: loadMorePage!, pageSize: PAGE_SIZE }
        );
        if (cancelled) return;
        const urls = await signImages(fresh);
        if (cancelled) return;
        setData((prev) => ({
          listings: [...prev.listings, ...fresh],
          imageUrls: { ...prev.imageUrls, ...urls },
          totalCount: pagination.total,
          page: loadMorePage!,
          isLoading: false,
          isLoadingMore: false,
          error: null,
        }));
        setLoadMorePage(null);
      } catch {
        if (cancelled) return;
        setData((prev) => ({ ...prev, isLoadingMore: false, error: "fetch_failed" }));
        setLoadMorePage(null);
      }
    }

    loadMore();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadMorePage]);

  // ── Clear all filters ──
  function clearFilters() {
    setSearch("");
    setDebouncedSearch("");
    setCategory("");
    setCondition("");
    setSort("newest");
    setMinPrice("");
    setMaxPrice("");
  }

  const hasActiveFilters = !!(category || condition || debouncedSearch || minPrice || maxPrice || sort !== "newest");
  const canLoadMore = !data.isLoadingMore && data.totalCount !== null && data.listings.length < data.totalCount;

  // ─────────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div style={{ minHeight: "100vh", paddingTop: "2rem", paddingBottom: "4rem", paddingLeft: "2rem", paddingRight: "2rem" }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>

        {/* ── Page Header ── */}
        <div style={{ marginBottom: "2rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
            <Link href="/dashboard" style={{ color: "rgba(167,184,176,0.6)", fontSize: "0.8rem", textDecoration: "none" }}
              className="hover:text-[#A7B8B0] transition-colors">
              Dashboard
            </Link>
            <span style={{ color: "rgba(167,184,176,0.3)", fontSize: "0.8rem" }}>/</span>
            <span style={{ color: "rgba(167,184,176,0.8)", fontSize: "0.8rem", fontWeight: 600 }}>UniVerse Resale</span>
          </div>

          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.4rem" }}>
                <div style={{
                  width: "36px", height: "36px", borderRadius: "10px",
                  background: "linear-gradient(135deg, #00C853 0%, #00E676 100%)",
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  <ShoppingBag size={18} color="#050A07" />
                </div>
                <h1 style={{ color: "#fff", fontSize: "1.7rem", fontWeight: 800, margin: 0, letterSpacing: "-0.03em" }}>
                  UniVerse Resale
                </h1>
              </div>
              <p style={{ color: "rgba(167,184,176,0.7)", fontSize: "0.875rem", margin: 0, paddingLeft: "calc(36px + 0.75rem)" }}>
                Buy and sell useful items within your university community.
              </p>
            </div>

            <div style={{ display: "flex", gap: "0.5rem" }}>
              <Link href="/dashboard/marketplace/my-listings" style={{ textDecoration: "none" }}>
                <button
                  style={{
                    display: "flex", alignItems: "center", gap: "0.5rem",
                    padding: "0.7rem 1.25rem",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px",
                    color: "#fff", fontSize: "0.875rem", fontWeight: 600,
                    cursor: "pointer", transition: "all 0.2s ease", whiteSpace: "nowrap",
                  }}
                  className="hover:bg-[rgba(255,255,255,0.1)]"
                  aria-label="View your listings"
                >
                  <Package size={16} />
                  My Listings
                </button>
              </Link>
              {isAuthenticated && (
                <Link href="/dashboard/marketplace/saved" style={{ textDecoration: "none" }}>
                  <button
                    style={{
                      display: "flex", alignItems: "center", gap: "0.5rem",
                      padding: "0.7rem 1.25rem",
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px",
                      color: "#fff", fontSize: "0.875rem", fontWeight: 600,
                      cursor: "pointer", transition: "all 0.2s ease", whiteSpace: "nowrap",
                    }}
                    className="hover:bg-[rgba(255,255,255,0.1)] hover:text-[#ef4444] hover:border-[#ef4444]"
                    aria-label="View saved listings"
                  >
                    <Heart size={16} />
                    Saved
                  </button>
                </Link>
              )}
              <Link href="/dashboard/marketplace/sell" style={{ textDecoration: "none" }}>
                <button
                  style={{
                    display: "flex", alignItems: "center", gap: "0.5rem",
                    padding: "0.7rem 1.25rem",
                    background: "linear-gradient(135deg, #00C853 0%, #00E676 100%)",
                    border: "none", borderRadius: "12px",
                    color: "#050A07", fontSize: "0.875rem", fontWeight: 800,
                    cursor: "pointer", boxShadow: "0 4px 20px rgba(0,230,118,0.25)",
                    transition: "transform 0.2s ease, box-shadow 0.2s ease", whiteSpace: "nowrap",
                  }}
                  className="hover:scale-105 hover:shadow-[0_6px_28px_rgba(0,230,118,0.35)]"
                  aria-label="Sell an item on UniVerse Resale"
                >
                  <Plus size={16} />
                  Sell an Item
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* ── Search Bar ── */}
        <div style={{ marginBottom: "1.25rem" }}>
          <div style={{
            position: "relative", display: "flex", alignItems: "center",
            background: "rgba(10,15,12,0.6)", border: "1px solid rgba(102,255,178,0.12)",
            borderRadius: "14px", backdropFilter: "blur(12px)", transition: "border-color 0.2s ease",
          }} className="focus-within:border-[rgba(0,230,118,0.35)]">
            <Search size={18} color="rgba(167,184,176,0.5)" style={{ position: "absolute", left: "1.1rem", pointerEvents: "none" }} />
            <input
              type="search"
              id="marketplace-search"
              aria-label="Search marketplace listings"
              placeholder="Search books, electronics, furniture and more..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                flex: 1, background: "transparent", border: "none", outline: "none",
                color: "#fff", fontSize: "0.95rem", padding: "0.95rem 1rem 0.95rem 2.8rem", width: "100%",
              }}
            />
            {search && (
              <button
                onClick={() => { setSearch(""); setDebouncedSearch(""); }}
                style={{
                  position: "absolute", right: "1rem",
                  background: "rgba(167,184,176,0.12)", border: "none", borderRadius: "6px",
                  padding: "4px", cursor: "pointer", display: "flex", alignItems: "center",
                  color: "rgba(167,184,176,0.7)", transition: "all 0.15s ease",
                }}
                className="hover:bg-[rgba(167,184,176,0.2)] hover:text-white"
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* ── Category Pills ── */}
        <div
          style={{ display: "flex", gap: "0.5rem", overflowX: "auto", paddingBottom: "0.25rem", marginBottom: "1.25rem", scrollbarWidth: "none" }}
          role="tablist" aria-label="Filter by category"
        >
          <CategoryPill label="All" active={category === ""} onClick={() => setCategory("")} />
          {VALID_CATEGORIES.map((cat) => (
            <CategoryPill
              key={cat}
              label={CATEGORY_LABELS[cat] ?? cat}
              active={category === cat}
              onClick={() => setCategory(cat === category ? "" : cat)}
            />
          ))}
        </div>

        {/* ── Filter / Sort Row ── */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.75rem", flexWrap: "wrap" }}>
          <button
            onClick={() => setFiltersOpen((v) => !v)}
            style={{
              display: "flex", alignItems: "center", gap: "0.5rem",
              padding: "0.55rem 1rem",
              background: filtersOpen ? "rgba(0,230,118,0.1)" : "rgba(10,15,12,0.5)",
              border: `1px solid ${filtersOpen ? "rgba(0,230,118,0.35)" : "rgba(102,255,178,0.1)"}`,
              borderRadius: "10px", color: filtersOpen ? "#00E676" : "#A7B8B0",
              fontSize: "0.82rem", fontWeight: 600, cursor: "pointer", transition: "all 0.2s ease",
            }}
            aria-expanded={filtersOpen} aria-label="Toggle advanced filters"
          >
            <SlidersHorizontal size={14} />
            Filters
            {hasActiveFilters && !filtersOpen && (
              <span style={{ background: "#00E676", color: "#050A07", fontSize: "0.65rem", fontWeight: 800, padding: "1px 5px", borderRadius: "4px" }}>ON</span>
            )}
          </button>

          {/* Sort */}
          <div style={{ position: "relative", marginLeft: "auto" }}>
            <select
              id="marketplace-sort"
              aria-label="Sort listings"
              value={sort}
              onChange={(e) => setSort(e.target.value as ResaleSortOption)}
              style={{ appearance: "none", background: "rgba(10,15,12,0.5)", border: "1px solid rgba(102,255,178,0.1)", borderRadius: "10px", color: "#A7B8B0", fontSize: "0.82rem", fontWeight: 600, padding: "0.55rem 2rem 0.55rem 0.9rem", cursor: "pointer", outline: "none" }}
            >
              {VALID_SORT_OPTIONS.map((s) => (
                <option key={s} value={s} style={{ background: "#0d1310" }}>{SORT_LABELS[s]}</option>
              ))}
            </select>
            <ChevronDown size={13} color="rgba(167,184,176,0.5)" style={{ position: "absolute", right: "0.6rem", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
          </div>

          {!data.isLoading && data.totalCount !== null && (
            <span style={{ color: "rgba(167,184,176,0.5)", fontSize: "0.8rem" }}>
              {data.totalCount} listing{data.totalCount !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* ── Advanced Filters Panel ── */}
        {filtersOpen && (
          <div
            style={{
              background: "rgba(10,15,12,0.6)", border: "1px solid rgba(102,255,178,0.1)",
              borderRadius: "16px", padding: "1.25rem", marginBottom: "1.75rem",
              display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "1rem", backdropFilter: "blur(12px)",
            }}
            role="group" aria-label="Advanced filters"
          >
            <FilterField label="Condition">
              <select id="filter-condition" aria-label="Filter by condition" value={condition} onChange={(e) => setCondition(e.target.value as ResaleCondition | "")} style={selectStyle}>
                <option value="">All Conditions</option>
                {VALID_CONDITIONS.map((c) => (<option key={c} value={c} style={{ background: "#0d1310" }}>{CONDITION_LABELS[c]}</option>))}
              </select>
            </FilterField>

            <FilterField label="Min Price (₹)">
              <input type="number" id="filter-min-price" aria-label="Minimum price in rupees" placeholder="0" min={0} value={minPrice} onChange={(e) => setMinPrice(e.target.value)} style={inputStyle} />
            </FilterField>

            <FilterField label="Max Price (₹)">
              <input type="number" id="filter-max-price" aria-label="Maximum price in rupees" placeholder="Any" min={0} value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} style={inputStyle} />
            </FilterField>

            {hasActiveFilters && (
              <div style={{ display: "flex", alignItems: "flex-end" }}>
                <button
                  onClick={clearFilters}
                  style={{ width: "100%", padding: "0.55rem 1rem", background: "transparent", border: "1px solid rgba(239,68,68,0.25)", borderRadius: "10px", color: "rgba(239,68,68,0.7)", fontSize: "0.82rem", fontWeight: 600, cursor: "pointer", transition: "all 0.2s ease" }}
                  className="hover:border-[rgba(239,68,68,0.5)] hover:text-[#f87171]"
                  aria-label="Clear all filters"
                >
                  Clear All
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── Listing Grid ── */}
        {data.isLoading ? (
          <ResaleSkeleton count={PAGE_SIZE} />
        ) : data.error ? (
          <ResaleErrorState onRetry={() => {
            setData((prev) => ({ ...prev, error: null, isLoading: true }));
            // Re-trigger by bumping a key — simplest approach
            setDebouncedSearch((s) => s);
          }} />
        ) : data.listings.length === 0 ? (
          <ResaleEmptyState isFiltered={hasActiveFilters} onClearFilters={clearFilters} />
        ) : (
          <>
            <div
              style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "1.25rem" }}
              role="list" aria-label="Marketplace listings"
            >
              {data.listings.map((listing) => {
                const firstImg = listing.images?.[0];
                const imageUrl = firstImg ? (data.imageUrls[listing.id] ?? null) : null;
                return (
                  <div key={listing.id} role="listitem">
                    <ResaleListingCard 
                      listing={listing} 
                      primaryImageUrl={imageUrl} 
                      isFavorited={favoriteIds.has(listing.id)}
                      showFavoriteButton={isAuthenticated}
                    />
                  </div>
                );
              })}
            </div>

            {/* Load More */}
            {canLoadMore && (
              <div style={{ display: "flex", justifyContent: "center", marginTop: "2.5rem" }}>
                <button
                  onClick={() => setLoadMorePage(data.page + 1)}
                  disabled={data.isLoadingMore}
                  style={{
                    padding: "0.75rem 2rem",
                    background: "rgba(10,15,12,0.6)", border: "1px solid rgba(102,255,178,0.15)",
                    borderRadius: "14px", color: data.isLoadingMore ? "rgba(167,184,176,0.4)" : "#A7B8B0",
                    fontSize: "0.875rem", fontWeight: 600, cursor: data.isLoadingMore ? "not-allowed" : "pointer",
                    transition: "all 0.2s ease",
                  }}
                  className={!data.isLoadingMore ? "hover:border-[rgba(0,230,118,0.3)] hover:text-white" : ""}
                  aria-label="Load more listings"
                >
                  {data.isLoadingMore
                    ? "Loading…"
                    : `Load More (${(data.totalCount ?? 0) - data.listings.length} remaining)`}
                </button>
              </div>
            )}

            {!canLoadMore && data.listings.length > 0 && data.totalCount !== null && data.listings.length >= data.totalCount && (
              <p style={{ textAlign: "center", color: "rgba(167,184,176,0.3)", fontSize: "0.8rem", marginTop: "2rem" }}>
                All listings loaded
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ─── Sub-Components ───────────────────────────────────────────────────────────

function CategoryPill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      role="tab"
      aria-selected={active}
      style={{
        padding: "0.45rem 1.1rem",
        background: active ? "rgba(0,230,118,0.12)" : "rgba(10,15,12,0.5)",
        border: `1px solid ${active ? "rgba(0,230,118,0.4)" : "rgba(102,255,178,0.08)"}`,
        borderRadius: "100px", color: active ? "#00E676" : "#A7B8B0",
        fontSize: "0.82rem", fontWeight: active ? 700 : 500,
        cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.18s ease", flexShrink: 0,
      }}
      className={!active ? "hover:border-[rgba(0,230,118,0.2)] hover:text-[#c8e6d4]" : ""}
    >
      {label}
    </button>
  );
}

function FilterField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
      <label style={{ color: "rgba(167,184,176,0.7)", fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.03em" }}>
        {label}
      </label>
      {children}
    </div>
  );
}

const selectStyle: React.CSSProperties = {
  background: "rgba(5,10,7,0.8)", border: "1px solid rgba(102,255,178,0.12)",
  borderRadius: "10px", color: "#A7B8B0", fontSize: "0.82rem",
  padding: "0.55rem 0.75rem", outline: "none", width: "100%", cursor: "pointer",
};

const inputStyle: React.CSSProperties = {
  background: "rgba(5,10,7,0.8)", border: "1px solid rgba(102,255,178,0.12)",
  borderRadius: "10px", color: "#fff", fontSize: "0.82rem",
  padding: "0.55rem 0.75rem", outline: "none", width: "100%",
};
