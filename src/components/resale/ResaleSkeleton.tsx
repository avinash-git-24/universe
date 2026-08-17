"use client";

import { memo } from "react";

/** A single skeleton that exactly matches ResaleListingCard dimensions. */
function ResaleCardSkeleton() {
  return (
    <div
      style={{
        background: "rgba(10,15,12,0.55)",
        border: "1px solid rgba(102,255,178,0.06)",
        borderRadius: "18px",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
      aria-hidden="true"
    >
      {/* Image placeholder */}
      <div
        style={{
          width: "100%",
          aspectRatio: "4/3",
          background: "rgba(255,255,255,0.04)",
          animation: "pulse 1.8s ease-in-out infinite",
        }}
      />
      {/* Content */}
      <div style={{ padding: "1rem 1.1rem 1.1rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        <div style={{ height: "12px", borderRadius: "6px", background: "rgba(255,255,255,0.06)", width: "80%", animation: "pulse 1.8s ease-in-out infinite" }} />
        <div style={{ height: "12px", borderRadius: "6px", background: "rgba(255,255,255,0.04)", width: "60%", animation: "pulse 1.8s ease-in-out infinite" }} />
        <div style={{ height: "18px", borderRadius: "6px", background: "rgba(0,230,118,0.08)", width: "45%", animation: "pulse 1.8s ease-in-out infinite", marginTop: "0.25rem" }} />
        <div style={{
          display: "flex", justifyContent: "space-between",
          paddingTop: "0.5rem", borderTop: "1px solid rgba(102,255,178,0.04)",
        }}>
          <div style={{ height: "10px", borderRadius: "5px", background: "rgba(255,255,255,0.04)", width: "40%", animation: "pulse 1.8s ease-in-out infinite" }} />
          <div style={{ height: "10px", borderRadius: "5px", background: "rgba(255,255,255,0.04)", width: "25%", animation: "pulse 1.8s ease-in-out infinite" }} />
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.45; }
        }
      `}</style>
    </div>
  );
}

interface ResaleSkeletonProps {
  count?: number;
}

export const ResaleSkeleton = memo(function ResaleSkeleton({ count = 8 }: ResaleSkeletonProps) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
        gap: "1.25rem",
      }}
      aria-label="Loading marketplace listings"
      role="status"
    >
      {Array.from({ length: count }).map((_, i) => (
        <ResaleCardSkeleton key={i} />
      ))}
    </div>
  );
});
