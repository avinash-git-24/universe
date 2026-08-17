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
    <div style={{ minHeight: "100vh", paddingTop: "2rem", paddingBottom: "4rem", paddingLeft: "2rem", paddingRight: "2rem" }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: "2rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
            <Link
              href="/dashboard/marketplace"
              style={{
                display: "inline-flex", alignItems: "center", gap: "0.5rem",
                color: "rgba(167,184,176,0.7)", fontSize: "0.875rem", fontWeight: 500, textDecoration: "none",
                transition: "color 0.2s ease"
              }}
              className="hover:text-white"
            >
              <ArrowLeft size={16} />
              Back to Marketplace
            </Link>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={{
              width: "40px", height: "40px", borderRadius: "12px",
              background: "rgba(239, 68, 68, 0.15)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              <Heart size={20} color="#ef4444" />
            </div>
            <h1 style={{ color: "#fff", fontSize: "2rem", fontWeight: 800, margin: 0, letterSpacing: "-0.03em" }}>
              Saved Listings
            </h1>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <ResaleSkeleton count={4} />
        ) : error ? (
          <div style={{ textAlign: "center", padding: "4rem 1rem", background: "rgba(239,68,68,0.05)", borderRadius: "16px", border: "1px solid rgba(239,68,68,0.1)" }}>
            <p style={{ color: "#ef4444", fontWeight: 600 }}>{error}</p>
            <button
              onClick={() => {
                startTransition(() => {
                  router.refresh();
                });
              }}
              style={{ marginTop: "1rem", padding: "0.5rem 1.5rem", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "8px", color: "#f87171", cursor: "pointer" }}
            >
              Try Again
            </button>
          </div>
        ) : listings.length === 0 ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "6rem 2rem", background: "rgba(10,15,12,0.4)", borderRadius: "24px", border: "1px dashed rgba(102,255,178,0.15)", textAlign: "center" }}>
            <div style={{ width: "64px", height: "64px", borderRadius: "16px", background: "rgba(167,184,176,0.08)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.5rem" }}>
              <PackageX size={32} color="rgba(167,184,176,0.4)" />
            </div>
            <h3 style={{ color: "#fff", fontSize: "1.25rem", fontWeight: 700, margin: "0 0 0.5rem 0" }}>No saved listings</h3>
            <p style={{ color: "rgba(167,184,176,0.7)", fontSize: "0.95rem", maxWidth: "400px", margin: "0 0 2rem 0", lineHeight: 1.5 }}>
              You haven&apos;t saved any active listings yet. Browse the marketplace and tap the heart icon to save items for later.
            </p>
            <Link href="/dashboard/marketplace" style={{ textDecoration: "none" }}>
              <button style={{ padding: "0.75rem 2rem", background: "linear-gradient(135deg, #00C853 0%, #00E676 100%)", border: "none", borderRadius: "12px", color: "#050A07", fontSize: "0.9rem", fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 20px rgba(0,230,118,0.2)" }}>
                Browse Marketplace
              </button>
            </Link>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "1.25rem" }}>
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
