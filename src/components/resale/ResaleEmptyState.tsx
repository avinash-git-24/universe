"use client";

import { memo } from "react";
import Link from "next/link";
import { Tag, ShoppingBag } from "lucide-react";

interface ResaleEmptyStateProps {
  isFiltered?: boolean;
  onClearFilters?: () => void;
}

export const ResaleEmptyState = memo(function ResaleEmptyState({
  isFiltered = false,
  onClearFilters,
}: ResaleEmptyStateProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "5rem 2rem",
        textAlign: "center",
        border: "1px dashed rgba(102,255,178,0.12)",
        borderRadius: "24px",
        background: "rgba(10,15,12,0.3)",
      }}
      role="status"
      aria-label="No listings found"
    >
      <div
        style={{
          width: "72px",
          height: "72px",
          borderRadius: "20px",
          background: "rgba(0,230,118,0.08)",
          border: "1px solid rgba(0,230,118,0.15)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "1.5rem",
        }}
      >
        {isFiltered ? (
          <Tag size={28} color="rgba(167,184,176,0.5)" />
        ) : (
          <ShoppingBag size={28} color="rgba(167,184,176,0.5)" />
        )}
      </div>

      <h3
        style={{
          color: "#fff",
          fontSize: "1.15rem",
          fontWeight: 700,
          marginBottom: "0.5rem",
        }}
      >
        {isFiltered ? "No listings match your filters" : "No listings yet"}
      </h3>

      <p
        style={{
          color: "rgba(167,184,176,0.65)",
          fontSize: "0.875rem",
          maxWidth: "360px",
          lineHeight: 1.6,
          marginBottom: "1.75rem",
        }}
      >
        {isFiltered
          ? "Try adjusting your search terms, category, or price range."
          : "Be the first student to list something on UniVerse Resale. Your peers are waiting!"}
      </p>

      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", justifyContent: "center" }}>
        {isFiltered && onClearFilters && (
          <button
            onClick={onClearFilters}
            style={{
              padding: "0.65rem 1.5rem",
              background: "rgba(10,15,12,0.6)",
              border: "1px solid rgba(102,255,178,0.2)",
              borderRadius: "12px",
              color: "#A7B8B0",
              fontSize: "0.875rem",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            className="hover:border-[rgba(0,230,118,0.4)] hover:text-white"
          >
            Clear Filters
          </button>
        )}
        <Link href="/dashboard/marketplace/sell" style={{ textDecoration: "none" }}>
          <button
            style={{
              padding: "0.65rem 1.5rem",
              background: "linear-gradient(135deg, #00C853 0%, #00E676 100%)",
              border: "none",
              borderRadius: "12px",
              color: "#050A07",
              fontSize: "0.875rem",
              fontWeight: 800,
              cursor: "pointer",
              boxShadow: "0 4px 20px rgba(0,230,118,0.25)",
              transition: "transform 0.2s ease",
            }}
            className="hover:scale-105"
          >
            Sell an Item
          </button>
        </Link>
      </div>
    </div>
  );
});
