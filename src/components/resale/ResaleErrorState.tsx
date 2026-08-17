"use client";

import { memo } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface ResaleErrorStateProps {
  onRetry?: () => void;
}

export const ResaleErrorState = memo(function ResaleErrorState({ onRetry }: ResaleErrorStateProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "5rem 2rem",
        textAlign: "center",
        border: "1px dashed rgba(239,68,68,0.2)",
        borderRadius: "24px",
        background: "rgba(239,68,68,0.03)",
      }}
      role="alert"
      aria-label="Error loading listings"
    >
      <div
        style={{
          width: "72px",
          height: "72px",
          borderRadius: "20px",
          background: "rgba(239,68,68,0.08)",
          border: "1px solid rgba(239,68,68,0.15)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "1.5rem",
        }}
      >
        <AlertTriangle size={28} color="rgba(239,68,68,0.6)" />
      </div>

      <h3 style={{ color: "#fff", fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.5rem" }}>
        Unable to load listings
      </h3>

      <p style={{
        color: "rgba(167,184,176,0.65)",
        fontSize: "0.875rem",
        maxWidth: "340px",
        lineHeight: 1.6,
        marginBottom: "1.75rem",
      }}>
        Something went wrong while loading the marketplace. Please try again in a moment.
      </p>

      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.65rem 1.5rem",
            background: "rgba(10,15,12,0.6)",
            border: "1px solid rgba(239,68,68,0.25)",
            borderRadius: "12px",
            color: "#f87171",
            fontSize: "0.875rem",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
          className="hover:border-[rgba(239,68,68,0.5)] hover:bg-[rgba(239,68,68,0.06)]"
          aria-label="Retry loading marketplace"
        >
          <RefreshCw size={15} />
          Try Again
        </button>
      )}
    </div>
  );
});
