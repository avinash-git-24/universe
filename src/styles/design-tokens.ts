/**
 * UniVerse — Design Tokens
 *
 * Typed TypeScript exports of all design system tokens.
 * These mirror the CSS custom properties in globals.css.
 * Import these in components, hooks, and utilities.
 */

// ─── Color Tokens ─────────────────────────────────────────────────────────────

export const colors = {
  /** Warm white — main page background */
  bg: "#FAFAF8",
  /** Subtle bg tint for sections */
  bgSubtle: "#F5F5F4",
  /** Card / surface white */
  surface: "#FFFFFF",

  /** Emerald Green — primary CTA color */
  primary: "#10B981",
  primaryHover: "#059669",
  primaryActive: "#047857",
  primarySubtle: "#ECFDF5",
  primaryMuted: "#D1FAE5",
  primaryForeground: "#FFFFFF",

  /** Amber Orange — accent / highlight */
  accent: "#F59E0B",
  accentHover: "#D97706",
  accentSubtle: "#FFFBEB",
  accentMuted: "#FEF3C7",
  accentForeground: "#0A0A0A",

  /** Rich Black — primary text */
  text: "#0A0A0A",
  textSecondary: "#374151",
  textMuted: "#6B7280",
  textPlaceholder: "#9CA3AF",
  textDisabled: "#D1D5DB",
  textInverse: "#FFFFFF",

  /** Light Gray — borders */
  border: "#E5E7EB",
  borderStrong: "#D1D5DB",
  borderFocus: "#10B981",

  /** Success Green */
  success: "#22C55E",
  successSubtle: "#F0FDF4",
  successForeground: "#14532D",

  /** Soft Coral — error */
  error: "#F87171",
  errorSubtle: "#FFF1F2",
  errorForeground: "#9F1239",

  /** Warning Amber */
  warning: "#F59E0B",
  warningSubtle: "#FFFBEB",
  warningForeground: "#92400E",
} as const;

export type ColorToken = keyof typeof colors;

// ─── Typography Tokens ────────────────────────────────────────────────────────

export const fontFamilies = {
  /** Headlines, brand voice */
  sans: "var(--font-plus-jakarta-sans), 'Plus Jakarta Sans', system-ui, sans-serif",
  /** Body text, UI labels */
  ui: "var(--font-inter), 'Inter', system-ui, sans-serif",
  /** Code / monospace */
  mono: "'JetBrains Mono', 'Fira Code', ui-monospace, monospace",
} as const;

export const fontSizes = {
  "2xs": "0.625rem",   // 10px
  xs: "0.75rem",       // 12px
  sm: "0.875rem",      // 14px
  base: "1rem",        // 16px
  lg: "1.125rem",      // 18px
  xl: "1.25rem",       // 20px
  "2xl": "1.5rem",     // 24px
  "3xl": "1.875rem",   // 30px
  "4xl": "2.25rem",    // 36px
  "5xl": "3rem",       // 48px
  "6xl": "3.75rem",    // 60px
  "7xl": "4.5rem",     // 72px
} as const;

export const fontWeights = {
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
} as const;

export const lineHeights = {
  none: 1,
  tight: 1.15,
  snug: 1.375,
  normal: 1.5,
  relaxed: 1.625,
  loose: 2,
} as const;

export const letterSpacings = {
  tighter: "-0.05em",
  tight: "-0.025em",
  normal: "0em",
  wide: "0.025em",
  wider: "0.05em",
  widest: "0.1em",
} as const;

// ─── Spacing Tokens ───────────────────────────────────────────────────────────

export const spacing = {
  0: "0",
  0.5: "0.125rem",  // 2px
  1: "0.25rem",     // 4px
  1.5: "0.375rem",  // 6px
  2: "0.5rem",      // 8px
  2.5: "0.625rem",  // 10px
  3: "0.75rem",     // 12px
  3.5: "0.875rem",  // 14px
  4: "1rem",        // 16px
  5: "1.25rem",     // 20px
  6: "1.5rem",      // 24px
  7: "1.75rem",     // 28px
  8: "2rem",        // 32px
  9: "2.25rem",     // 36px
  10: "2.5rem",     // 40px
  11: "2.75rem",    // 44px
  12: "3rem",       // 48px
  14: "3.5rem",     // 56px
  16: "4rem",       // 64px
  20: "5rem",       // 80px
  24: "6rem",       // 96px
  28: "7rem",       // 112px
  32: "8rem",       // 128px
  36: "9rem",       // 144px
  40: "10rem",      // 160px
} as const;

// ─── Border Radius Tokens ─────────────────────────────────────────────────────

export const radii = {
  none: "0",
  xs: "0.25rem",    // 4px
  sm: "0.375rem",   // 6px
  md: "0.625rem",   // 10px
  lg: "1rem",       // 16px
  xl: "1.5rem",     // 24px
  "2xl": "2rem",    // 32px
  full: "9999px",
} as const;

export type RadiusToken = keyof typeof radii;

// ─── Shadow Tokens ────────────────────────────────────────────────────────────

export const shadows = {
  xs: "0 1px 2px 0 rgb(0 0 0 / 0.04)",
  sm: "0 1px 3px 0 rgb(0 0 0 / 0.08), 0 1px 2px -1px rgb(0 0 0 / 0.06)",
  md: "0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.05)",
  lg: "0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.04)",
  xl: "0 20px 25px -5px rgb(0 0 0 / 0.08), 0 8px 10px -6px rgb(0 0 0 / 0.04)",
  "2xl": "0 25px 50px -12px rgb(0 0 0 / 0.18)",
  glowPrimary: "0 0 0 3px rgb(16 185 129 / 0.15)",
  glowAccent: "0 0 0 3px rgb(245 158 11 / 0.15)",
  glowError: "0 0 0 3px rgb(248 113 113 / 0.15)",
} as const;

export type ShadowToken = keyof typeof shadows;

// ─── Transition Tokens ────────────────────────────────────────────────────────

export const transitions = {
  fast: "100ms ease",
  base: "150ms ease",
  slow: "250ms ease",
  spring: "300ms cubic-bezier(0.34, 1.56, 0.64, 1)",
} as const;

// ─── Z-Index Tokens ───────────────────────────────────────────────────────────

export const zIndex = {
  base: 0,
  raised: 10,
  dropdown: 100,
  sticky: 200,
  overlay: 300,
  modal: 400,
  popover: 500,
  toast: 600,
  tooltip: 700,
} as const;

// ─── Breakpoint Tokens ────────────────────────────────────────────────────────

export const breakpoints = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
} as const;

export type Breakpoint = keyof typeof breakpoints;
