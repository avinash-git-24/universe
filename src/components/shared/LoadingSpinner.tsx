"use client";

/**
 * UniVerse — LoadingSpinner Component
 *
 * Accessible loading indicator with size variants and color options.
 */

import * as React from "react";
import { cn } from "@/lib/utils";

export interface LoadingSpinnerProps {
  /** Spinner size */
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  /** Color variant */
  variant?: "primary" | "accent" | "muted" | "white";
  /** Accessible label for screen readers */
  label?: string;
  /** Additional class names */
  className?: string;
}

const SIZE_CLASSES = {
  xs: "w-3 h-3 border-[1.5px]",
  sm: "w-4 h-4 border-2",
  md: "w-6 h-6 border-2",
  lg: "w-8 h-8 border-[3px]",
  xl: "w-12 h-12 border-4",
} as const;

const COLOR_CLASSES = {
  primary:
    "border-[var(--color-primary-muted)] border-t-[var(--color-primary)]",
  accent:
    "border-[var(--color-accent-muted)] border-t-[var(--color-accent)]",
  muted:
    "border-[var(--color-border)] border-t-[var(--color-text-muted)]",
  white:
    "border-white/30 border-t-white",
} as const;

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "md",
  variant = "primary",
  label = "Loading…",
  className,
}) => (
  <span
    role="status"
    aria-label={label}
    className={cn("inline-flex items-center justify-center", className)}
  >
    <span
      className={cn(
        "rounded-full animate-spin",
        SIZE_CLASSES[size],
        COLOR_CLASSES[variant]
      )}
      aria-hidden="true"
    />
    <span className="sr-only">{label}</span>
  </span>
);

// ─── Full Screen Loader ───────────────────────────────────────────────────────

export interface PageLoaderProps {
  label?: string;
}

const PageLoader: React.FC<PageLoaderProps> = ({ label = "Loading…" }) => (
  <div
    className="fixed inset-0 z-[var(--z-overlay)] flex flex-col items-center justify-center gap-4 bg-[var(--color-bg)]"
    role="status"
    aria-label={label}
  >
    {/* Logo mark placeholder */}
    <div className="relative">
      <div className="w-14 h-14 rounded-[var(--radius-xl)] bg-[var(--color-primary)] flex items-center justify-center shadow-[var(--shadow-glow-primary)]">
        <span className="text-white font-bold text-xl font-[family-name:var(--font-plus-jakarta-sans)]">
          U
        </span>
      </div>
      <LoadingSpinner
        size="xl"
        variant="primary"
        className="absolute -inset-2"
      />
    </div>
    <p className="text-sm text-[var(--color-text-muted)] font-[family-name:var(--font-inter)]">
      {label}
    </p>
  </div>
);

export { LoadingSpinner, PageLoader };
