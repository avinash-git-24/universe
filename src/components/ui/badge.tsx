"use client";

/**
 * UniVerse — Badge + StatusBadge Components
 *
 * Compact labels for categories, tags, and order status indicators.
 */

import * as React from "react";
import { motion } from "framer-motion";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { pulseDot } from "@/constants/animation";
import type { OrderStatus } from "@/types/order.types";

// ─────────────────────────────────────────────────────────────────────────────
// BADGE
// ─────────────────────────────────────────────────────────────────────────────

const badgeVariants = cva(
  [
    "inline-flex items-center gap-1.5",
    "font-medium font-[family-name:var(--font-inter)]",
    "border",
    "transition-colors duration-150",
    "select-none",
  ],
  {
    variants: {
      variant: {
        primary: [
          "bg-[var(--color-primary-subtle)] text-[var(--color-primary-active)]",
          "border-[var(--color-primary-muted)]",
        ],
        accent: [
          "bg-[var(--color-accent-subtle)] text-[var(--color-accent-hover)]",
          "border-[var(--color-accent-muted)]",
        ],
        success: [
          "bg-[var(--color-success-subtle)] text-[var(--color-success-foreground)]",
          "border-[var(--color-success)]/20",
        ],
        error: [
          "bg-[var(--color-error-subtle)] text-[var(--color-error-foreground)]",
          "border-[var(--color-error)]/20",
        ],
        warning: [
          "bg-[var(--color-warning-subtle)] text-[var(--color-warning-foreground)]",
          "border-[var(--color-warning)]/20",
        ],
        neutral: [
          "bg-[var(--color-bg-subtle)] text-[var(--color-text-secondary)]",
          "border-[var(--color-border)]",
        ],
        /** Solid filled */
        solid: [
          "bg-[var(--color-text)] text-white border-transparent",
        ],
      },
      size: {
        sm: "text-xs px-2 py-0.5 rounded-[var(--radius-xs)]",
        md: "text-xs px-2.5 py-1 rounded-[var(--radius-sm)]",
        lg: "text-sm px-3 py-1.5 rounded-[var(--radius-md)]",
      },
    },
    defaultVariants: {
      variant: "neutral",
      size: "md",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, size, leftIcon, rightIcon, children, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(badgeVariants({ variant, size, className }))}
      {...props}
    >
      {leftIcon && (
        <span className="shrink-0" aria-hidden="true">
          {leftIcon}
        </span>
      )}
      {children}
      {rightIcon && (
        <span className="shrink-0" aria-hidden="true">
          {rightIcon}
        </span>
      )}
    </span>
  )
);

Badge.displayName = "Badge";

// ─────────────────────────────────────────────────────────────────────────────
// STATUS BADGE — Order lifecycle states
// ─────────────────────────────────────────────────────────────────────────────

interface StatusConfig {
  label: string;
  color: string;       // dot bg color
  variant: VariantProps<typeof badgeVariants>["variant"];
  pulse: boolean;      // animate the dot
}

const STATUS_CONFIG: Record<OrderStatus, StatusConfig> = {
  pending: {
    label: "Pending",
    color: "bg-[var(--color-accent)]",
    variant: "accent",
    pulse: true,
  },
  accepted: {
    label: "Accepted",
    color: "bg-[var(--color-primary)]",
    variant: "primary",
    pulse: true,
  },
  purchasing: {
    label: "At Vending Machine",
    color: "bg-[var(--color-primary)]",
    variant: "primary",
    pulse: true,
  },
  "in-transit": {
    label: "On the Way",
    color: "bg-[var(--color-accent)]",
    variant: "accent",
    pulse: true,
  },
  delivered: {
    label: "Delivered",
    color: "bg-[var(--color-success)]",
    variant: "success",
    pulse: false,
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-[var(--color-text-muted)]",
    variant: "neutral",
    pulse: false,
  },
  failed: {
    label: "Failed",
    color: "bg-[var(--color-error)]",
    variant: "error",
    pulse: false,
  },
};

export interface StatusBadgeProps {
  status: OrderStatus;
  size?: VariantProps<typeof badgeVariants>["size"];
  className?: string;
  /** Override the label text */
  label?: string;
}

const StatusBadge = React.forwardRef<HTMLSpanElement, StatusBadgeProps>(
  ({ status, size = "md", className, label }, ref) => {
    const config = STATUS_CONFIG[status];

    return (
      <Badge
        ref={ref}
        variant={config.variant}
        size={size}
        className={className}
        role="status"
        aria-label={`Status: ${config.label}`}
        leftIcon={
          <span className="relative flex items-center justify-center w-2 h-2">
            {config.pulse && (
              <motion.span
                variants={pulseDot}
                animate="animate"
                className={cn(
                  "absolute inset-0 rounded-full opacity-60",
                  config.color
                )}
              />
            )}
            <span
              className={cn(
                "relative w-1.5 h-1.5 rounded-full shrink-0",
                config.color
              )}
            />
          </span>
        }
      >
        {label ?? config.label}
      </Badge>
    );
  }
);

StatusBadge.displayName = "StatusBadge";

export { Badge, StatusBadge, badgeVariants };
