"use client";

/**
 * UniVerse — Card Component
 *
 * Versatile card with multiple visual variants and interactive states.
 * Includes Card, CardHeader, CardContent, CardFooter sub-components.
 */

import * as React from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { cardHover } from "@/constants/animation";

// ─── Card Variants ────────────────────────────────────────────────────────────

const cardVariants = cva(
  [
    "relative bg-[var(--color-surface)]",
    "rounded-[var(--radius-lg)] border border-[var(--color-border)]",
    "overflow-hidden",
  ],
  {
    variants: {
      variant: {
        /** Default flat card */
        default: "shadow-[var(--shadow-xs)]",
        /** Slightly elevated */
        elevated: "shadow-[var(--shadow-md)]",
        /** Hoverable interactive card with lift effect */
        interactive: [
          "shadow-[var(--shadow-sm)] cursor-pointer",
          "hover:shadow-[var(--shadow-lg)] hover:-translate-y-0.5",
          "transition-all duration-200 ease-out",
        ],
        /** Glass morphism effect */
        glass: [
          "bg-white/70 backdrop-blur-xl border-white/30",
          "shadow-[var(--shadow-md)]",
        ],
        /** Accent border on the left */
        accent: [
          "shadow-[var(--shadow-sm)]",
          "border-l-4 border-l-[var(--color-primary)]",
        ],
        /** Error/warning state */
        error: [
          "shadow-[var(--shadow-xs)]",
          "border-[var(--color-error)] bg-[var(--color-error-subtle)]",
        ],
        /** Success state */
        success: [
          "shadow-[var(--shadow-xs)]",
          "border-[var(--color-success)] bg-[var(--color-success-subtle)]",
        ],
        /** Ghost — no border, no shadow */
        ghost: "border-transparent shadow-none bg-transparent",
      },
      padding: {
        none: "",
        sm: "p-4",
        md: "p-5",
        lg: "p-6",
        xl: "p-8",
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "none",
    },
  }
);

// ─── Card Props ───────────────────────────────────────────────────────────────

export interface CardProps
  extends Omit<HTMLMotionProps<"div">, "ref">,
    VariantProps<typeof cardVariants> {
  /** Enable entrance animation */
  animate?: boolean;
}

// ─── Card Component ───────────────────────────────────────────────────────────

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, animate = false, children, ...props }, ref) => {
    if (animate) {
      return (
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
          {...(variant === "interactive" ? { whileHover: cardHover.hover } : {})}
          className={cn(cardVariants({ variant, padding, className }))}
          {...props}
        >
          {children}
        </motion.div>
      );
    }

    return (
      <motion.div
        ref={ref}
        {...(variant === "interactive" ? { whileHover: cardHover.hover } : {})}
        className={cn(cardVariants({ variant, padding, className }))}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

Card.displayName = "Card";

// ─── CardHeader ───────────────────────────────────────────────────────────────

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Show a bottom border separator */
  withBorder?: boolean;
}

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, withBorder = false, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex flex-col gap-1.5 px-5 py-4",
        withBorder && "border-b border-[var(--color-border)]",
        className
      )}
      {...props}
    />
  )
);

CardHeader.displayName = "CardHeader";

// ─── CardTitle ────────────────────────────────────────────────────────────────

const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-base font-semibold leading-tight text-[var(--color-text)]",
      "font-[family-name:var(--font-plus-jakarta-sans)]",
      className
    )}
    {...props}
  />
));

CardTitle.displayName = "CardTitle";

// ─── CardDescription ──────────────────────────────────────────────────────────

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      "text-sm text-[var(--color-text-muted)]",
      "font-[family-name:var(--font-inter)]",
      className
    )}
    {...props}
  />
));

CardDescription.displayName = "CardDescription";

// ─── CardContent ──────────────────────────────────────────────────────────────

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("px-5 py-4", className)}
    {...props}
  />
));

CardContent.displayName = "CardContent";

// ─── CardFooter ───────────────────────────────────────────────────────────────

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Show a top border separator */
  withBorder?: boolean;
}

const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, withBorder = false, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex items-center px-5 py-4",
        withBorder && "border-t border-[var(--color-border)]",
        className
      )}
      {...props}
    />
  )
);

CardFooter.displayName = "CardFooter";

// ─── Exports ──────────────────────────────────────────────────────────────────

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  cardVariants,
};
