"use client";

/**
 * UniVerse — Button Component
 *
 * Production-grade button with variants, sizes, loading state, and icon support.
 * Built with class-variance-authority for type-safe variant management.
 */

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Variant Definitions ──────────────────────────────────────────────────────

const buttonVariants = cva(
  // Base styles
  [
    "relative inline-flex items-center justify-center gap-2",
    "font-semibold font-[family-name:var(--font-inter)]",
    "rounded-[var(--radius-md)] border border-transparent",
    "transition-all duration-150 ease-out",
    "select-none cursor-pointer",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed",
    "whitespace-nowrap",
  ],
  {
    variants: {
      variant: {
        // Emerald Green primary — main CTA
        primary: [
          "bg-[var(--color-primary)] text-white border-[var(--color-primary)]",
          "hover:bg-[var(--color-primary-hover)] hover:border-[var(--color-primary-hover)]",
          "active:bg-[var(--color-primary-active)]",
          "focus-visible:ring-[var(--color-primary)]",
          "shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)]",
          "hover:-translate-y-px active:translate-y-0",
        ],
        // Amber accent
        accent: [
          "bg-[var(--color-accent)] text-[var(--color-text)] border-[var(--color-accent)]",
          "hover:bg-[var(--color-accent-hover)] hover:border-[var(--color-accent-hover)]",
          "focus-visible:ring-[var(--color-accent)]",
          "shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)]",
          "hover:-translate-y-px active:translate-y-0",
        ],
        // Outlined — secondary actions
        secondary: [
          "bg-[var(--color-surface)] text-[var(--color-text)]",
          "border-[var(--color-border)] hover:border-[var(--color-border-strong)]",
          "hover:bg-[var(--color-bg-subtle)]",
          "focus-visible:ring-[var(--color-primary)]",
          "shadow-[var(--shadow-xs)] hover:shadow-[var(--shadow-sm)]",
          "hover:-translate-y-px active:translate-y-0",
        ],
        // Ghost — minimal, for tertiary actions
        ghost: [
          "bg-transparent text-[var(--color-text-secondary)]",
          "hover:bg-[var(--color-bg-subtle)] hover:text-[var(--color-text)]",
          "focus-visible:ring-[var(--color-primary)]",
        ],
        // Destructive — danger zone
        destructive: [
          "bg-[var(--color-error)] text-white border-[var(--color-error)]",
          "hover:brightness-95",
          "focus-visible:ring-[var(--color-error)]",
          "shadow-[var(--shadow-sm)]",
          "hover:-translate-y-px active:translate-y-0",
        ],
        // Link style
        link: [
          "bg-transparent text-[var(--color-primary)]",
          "hover:underline underline-offset-4",
          "focus-visible:ring-[var(--color-primary)]",
          "p-0 h-auto",
        ],
      },
      size: {
        xs: "h-7 px-3 text-xs rounded-[var(--radius-sm)]",
        sm: "h-8 px-4 text-sm",
        md: "h-10 px-5 text-sm",
        lg: "h-12 px-6 text-base",
        xl: "h-14 px-8 text-lg rounded-[var(--radius-lg)]",
        icon: "h-10 w-10 p-0",
        "icon-sm": "h-8 w-8 p-0 rounded-[var(--radius-sm)]",
        "icon-lg": "h-12 w-12 p-0 rounded-[var(--radius-lg)]",
      },
      fullWidth: {
        true: "w-full",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

// ─── Props ────────────────────────────────────────────────────────────────────

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Show a loading spinner and disable interactions */
  isLoading?: boolean;
  /** Text to show while loading (replaces children) */
  loadingText?: string;
  /** Icon to show on the left side */
  leftIcon?: React.ReactNode;
  /** Icon to show on the right side */
  rightIcon?: React.ReactNode;
  /** Fill the parent width */
  fullWidth?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      isLoading = false,
      loadingText,
      leftIcon,
      rightIcon,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading;

    return (
      <motion.button
        ref={ref}
        whileTap={!isDisabled ? { scale: 0.97 } : undefined}
        className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        aria-busy={isLoading}
        {...(props as React.ComponentProps<typeof motion.button>)}
      >
        {/* Loading spinner */}
        {isLoading && (
          <Loader2
            className="animate-spin shrink-0"
            size={size === "xs" || size === "sm" ? 14 : size === "lg" || size === "xl" ? 18 : 16}
            aria-hidden="true"
          />
        )}

        {/* Left icon (hidden when loading) */}
        {!isLoading && leftIcon && (
          <span className="shrink-0" aria-hidden="true">
            {leftIcon}
          </span>
        )}

        {/* Content */}
        {isLoading && loadingText ? loadingText : children}

        {/* Right icon */}
        {!isLoading && rightIcon && (
          <span className="shrink-0" aria-hidden="true">
            {rightIcon}
          </span>
        )}
      </motion.button>
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
