"use client";

import { memo } from "react";
import Link from "next/link";
import { MapPin, Clock, Tag, HandCoins } from "lucide-react";
import type { ResaleListingWithImages } from "@/lib/database/resale";
import { FavoriteButton } from "./FavoriteButton";
import { UserRatingBadge } from "./UserRatingBadge";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const CONDITION_LABELS: Record<string, string> = {
  new: "New",
  like_new: "Like New",
  good: "Good",
  fair: "Fair",
};

const CONDITION_COLORS: Record<string, { text: string; bg: string }> = {
  new:      { text: "#00E676", bg: "rgba(0,230,118,0.12)" },
  like_new: { text: "#34d399", bg: "rgba(52,211,153,0.12)" },
  good:     { text: "#60a5fa", bg: "rgba(96,165,250,0.12)" },
  fair:     { text: "#A7B8B0", bg: "rgba(167,184,176,0.10)" },
};

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
}

function isNew(iso: string): boolean {
  return Date.now() - new Date(iso).getTime() < 48 * 60 * 60 * 1000;
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface ResaleListingCardProps {
  listing: ResaleListingWithImages;
  /** Pre-generated signed URL for the primary image. Null if no image or error. */
  primaryImageUrl: string | null;
  /** Whether the current user has favorited this listing. Defaults to false. */
  isFavorited?: boolean;
  /** Whether to show the favorite button (requires auth). Defaults to false. */
  showFavoriteButton?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const ResaleListingCard = memo(function ResaleListingCard({
  listing,
  primaryImageUrl,
  isFavorited = false,
  showFavoriteButton = false,
}: ResaleListingCardProps) {
  const conditionStyle = CONDITION_COLORS[listing.condition] ?? CONDITION_COLORS.fair;
  const discountPct =
    listing.original_price && listing.original_price > listing.price
      ? Math.round(((listing.original_price - listing.price) / listing.original_price) * 100)
      : null;

  return (
    <Link
      href={`/dashboard/marketplace/${listing.id}`}
      aria-label={`View listing: ${listing.title}`}
      style={{ textDecoration: "none", display: "block" }}
    >
      <article
        style={{
          background: "rgba(10,15,12,0.55)",
          border: "1px solid rgba(102,255,178,0.08)",
          borderRadius: "18px",
          overflow: "hidden",
          transition: "transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease",
          cursor: "pointer",
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
        className="group hover:scale-[1.015] hover:border-[rgba(0,230,118,0.25)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
      >
        {/* ── Image Area ── */}
        <div
          style={{
            position: "relative",
            width: "100%",
            aspectRatio: "4/3",
            background: "rgba(5,10,7,0.8)",
            overflow: "hidden",
            flexShrink: 0,
          }}
        >
          {primaryImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={primaryImageUrl}
              alt={listing.title}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                transition: "transform 0.35s ease",
              }}
              className="group-hover:scale-105"
              loading="lazy"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
                const parent = e.currentTarget.parentElement;
                if (parent) {
                  const fallback = parent.querySelector(".img-fallback") as HTMLElement | null;
                  if (fallback) fallback.style.display = "flex";
                }
              }}
            />
          ) : null}

          {/* Fallback placeholder */}
          <div
            className="img-fallback"
            style={{
              display: primaryImageUrl ? "none" : "flex",
              position: "absolute",
              inset: 0,
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              gap: "0.5rem",
            }}
          >
            <Tag size={32} color="rgba(167,184,176,0.3)" />
            <span style={{ color: "rgba(167,184,176,0.4)", fontSize: "0.7rem" }}>No image</span>
          </div>

          {/* Badges overlay */}
          <div
            style={{
              position: "absolute",
              top: "0.6rem",
              left: "0.6rem",
              display: "flex",
              gap: "0.4rem",
              flexWrap: "wrap",
            }}
          >
            {isNew(listing.created_at) && listing.status === "active" && (
              <span style={{
                background: "#00E676",
                color: "#050A07",
                fontSize: "0.62rem",
                fontWeight: 800,
                padding: "2px 7px",
                borderRadius: "6px",
                letterSpacing: "0.03em",
                textTransform: "uppercase",
              }}>NEW</span>
            )}
            {discountPct && listing.status === "active" && (
              <span style={{
                background: "rgba(239,68,68,0.85)",
                color: "#fff",
                fontSize: "0.62rem",
                fontWeight: 700,
                padding: "2px 7px",
                borderRadius: "6px",
              }}>{discountPct}% off</span>
            )}
            {listing.status !== "active" && (
              <span style={{
                background: listing.status === "sold" ? "rgba(239,68,68,0.9)" : listing.status === "reserved" ? "rgba(245,158,11,0.9)" : "rgba(100,100,100,0.9)",
                color: "#fff",
                fontSize: "0.62rem",
                fontWeight: 800,
                padding: "2px 7px",
                borderRadius: "6px",
                letterSpacing: "0.03em",
                textTransform: "uppercase",
              }}>{listing.status}</span>
            )}
          </div>

          {/* Condition badge */}
          <div style={{ position: "absolute", top: "0.6rem", right: "0.6rem", display: "flex", gap: "0.5rem", alignItems: "flex-start" }}>
            {showFavoriteButton && (
              <div style={{ zIndex: 10 }}>
                <FavoriteButton listingId={listing.id} initialIsFavorited={isFavorited} size={16} />
              </div>
            )}
            <span style={{
              background: conditionStyle.bg,
              color: conditionStyle.text,
              fontSize: "0.65rem",
              fontWeight: 700,
              padding: "3px 8px",
              borderRadius: "7px",
              backdropFilter: "blur(8px)",
              border: `1px solid ${conditionStyle.text}30`,
              display: "flex",
              alignItems: "center",
              height: "32px",
            }}>
              {CONDITION_LABELS[listing.condition] ?? listing.condition}
            </span>
          </div>
        </div>

        {/* ── Content ── */}
        <div style={{ padding: "1rem 1.1rem 1.1rem", display: "flex", flexDirection: "column", flex: 1, gap: "0.5rem" }}>
          {/* Title */}
          <h3
            style={{
              color: "#fff",
              fontSize: "0.92rem",
              fontWeight: 700,
              lineHeight: 1.35,
              margin: 0,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
            title={listing.title}
          >
            {listing.title}
          </h3>

          {/* Price row */}
          <div style={{ display: "flex", alignItems: "baseline", gap: "0.4rem", flexWrap: "wrap" }}>
            <span style={{ color: "#00E676", fontSize: "1.15rem", fontWeight: 800 }}>
              {formatPrice(listing.price)}
            </span>
            {listing.original_price && listing.original_price > listing.price && (
              <span style={{ color: "rgba(167,184,176,0.5)", fontSize: "0.8rem", textDecoration: "line-through" }}>
                {formatPrice(listing.original_price)}
              </span>
            )}
            {listing.negotiable && (
              <span style={{
                display: "flex", alignItems: "center", gap: "3px",
                color: "#A7B8B0", fontSize: "0.68rem", fontWeight: 600,
                marginLeft: "auto",
              }}>
                <HandCoins size={11} />
                Negotiable
              </span>
            )}
          </div>

          {/* Meta row */}
          <div style={{ marginTop: "auto", paddingTop: "0.5rem", borderTop: "1px solid rgba(102,255,178,0.06)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem", marginBottom: "0.4rem" }}>
              <UserRatingBadge userId={listing.seller_id} showCount={false} />
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem" }}>
              {listing.pickup_location ? (
                <span style={{
                  display: "flex", alignItems: "center", gap: "4px",
                  color: "rgba(167,184,176,0.7)", fontSize: "0.72rem",
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  flex: 1,
                }}>
                  <MapPin size={11} style={{ flexShrink: 0 }} />
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {listing.pickup_location}
                  </span>
                </span>
              ) : (
                <span />
              )}
              <span style={{
                display: "flex", alignItems: "center", gap: "4px",
                color: "rgba(167,184,176,0.5)", fontSize: "0.7rem",
                flexShrink: 0,
              }}>
                <Clock size={10} />
                {formatRelativeTime(listing.created_at)}
              </span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
});
