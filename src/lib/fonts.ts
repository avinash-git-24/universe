/**
 * UniVerse — Font Configuration
 *
 * Configures Plus Jakarta Sans (headings) and Inter (body/UI).
 * Exports CSS variable names and class names for use in layout.tsx.
 */

import { Plus_Jakarta_Sans, Inter } from "next/font/google";

export const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta-sans",
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});

export const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});

/**
 * Combined font class string for the root <html> element.
 * Use: `<html className={fontClassNames}>`
 */
export const fontClassNames = `${plusJakartaSans.variable} ${inter.variable}`;
