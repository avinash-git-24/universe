"use client";

/**
 * UniVerse — Typography System
 *
 * Semantic, typed typography components for consistent text hierarchy.
 * Headings use Plus Jakarta Sans; body uses Inter.
 */

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// ─── Heading ──────────────────────────────────────────────────────────────────

const headingVariants = cva(
  "font-[family-name:var(--font-plus-jakarta-sans)] text-[var(--color-text)] leading-tight",
  {
    variants: {
      level: {
        h1: "text-5xl font-extrabold tracking-[-0.03em]",
        h2: "text-4xl font-bold tracking-[-0.025em]",
        h3: "text-3xl font-bold tracking-[-0.02em]",
        h4: "text-2xl font-semibold tracking-[-0.015em]",
        h5: "text-xl font-semibold tracking-tight",
        h6: "text-lg font-semibold",
      },
    },
  }
);

export interface HeadingProps
  extends React.HTMLAttributes<HTMLHeadingElement>,
    VariantProps<typeof headingVariants> {
  /** HTML heading level (defaults to match `level`) */
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  /** Apply gradient styling */
  gradient?: "primary" | "accent";
}

const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ level = "h2", as, gradient, className, ...props }, ref) => {
    const Tag = as ?? level ?? "h2";

    return React.createElement(Tag, {
      ref,
      className: cn(
        headingVariants({ level }),
        gradient === "primary" && "text-gradient-primary",
        gradient === "accent" && "text-gradient-accent",
        className
      ),
      ...props,
    });
  }
);

Heading.displayName = "Heading";

// ─── Text ─────────────────────────────────────────────────────────────────────

const textVariants = cva(
  "font-[family-name:var(--font-inter)] text-[var(--color-text)]",
  {
    variants: {
      variant: {
        body: "text-base leading-relaxed",
        "body-sm": "text-sm leading-relaxed",
        caption: "text-xs leading-normal text-[var(--color-text-muted)]",
        label: "text-sm font-medium leading-none",
        overline:
          "text-xs font-semibold uppercase tracking-widest text-[var(--color-text-muted)]",
        muted: "text-sm text-[var(--color-text-muted)] leading-relaxed",
        lead: "text-xl leading-relaxed text-[var(--color-text-secondary)]",
        code: "text-sm font-mono bg-[var(--color-bg-subtle)] px-1.5 py-0.5 rounded-[var(--radius-xs)] border border-[var(--color-border)]",
      },
    },
    defaultVariants: {
      variant: "body",
    },
  }
);

export interface TextProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof textVariants> {
  as?: "p" | "span" | "div" | "label" | "small" | "strong" | "em" | "code";
}

const Text = React.forwardRef<HTMLElement, TextProps>(
  ({ variant, as = "p", className, ...props }, ref) => {
    return React.createElement(as as string, {
      ref,
      className: cn(textVariants({ variant }), className),
      ...props,
    });
  }
);

Text.displayName = "Text";

// ─── Convenience Shorthand Exports ────────────────────────────────────────────

/** h1 — Display heading */
export const H1 = (props: Omit<HeadingProps, "level">) => (
  <Heading level="h1" {...props} />
);

/** h2 — Section heading */
export const H2 = (props: Omit<HeadingProps, "level">) => (
  <Heading level="h2" {...props} />
);

/** h3 — Subsection heading */
export const H3 = (props: Omit<HeadingProps, "level">) => (
  <Heading level="h3" {...props} />
);

/** h4 — Card title */
export const H4 = (props: Omit<HeadingProps, "level">) => (
  <Heading level="h4" {...props} />
);

/** h5 — Minor heading */
export const H5 = (props: Omit<HeadingProps, "level">) => (
  <Heading level="h5" {...props} />
);

/** h6 — Smallest heading */
export const H6 = (props: Omit<HeadingProps, "level">) => (
  <Heading level="h6" {...props} />
);

/** Lead paragraph */
export const Lead = (props: Omit<TextProps, "variant">) => (
  <Text variant="lead" {...props} />
);

/** Muted helper text */
export const Muted = (props: Omit<TextProps, "variant">) => (
  <Text variant="muted" {...props} />
);

/** All-caps overline label */
export const Overline = (props: Omit<TextProps, "variant">) => (
  <Text variant="overline" as="span" {...props} />
);

/** Inline caption */
export const Caption = (props: Omit<TextProps, "variant">) => (
  <Text variant="caption" as="small" {...props} />
);

export { Heading, Text, headingVariants, textVariants };
