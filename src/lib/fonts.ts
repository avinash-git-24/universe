/**
 * UniVerse — Font Configuration
 *
 * Configures Plus Jakarta Sans (headings) and Inter (body/UI).
 * Exports CSS variable names and class names for use in layout.tsx.
 */

import { Plus_Jakarta_Sans, Inter } from "next/font/google";

export const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  style: ["normal"],
  variable: "--font-plus-jakarta-sans",
  display: "swap",
  preload: true,
  fallback: ["system-ui", "sans-serif"],
});

export const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
  fallback: ["system-ui", "sans-serif"],
});

/**
 * Combined font class string for the root <html> element.
 * Use: `<html className={fontClassNames}>`
 */
export const fontClassNames = `${plusJakartaSans.variable} ${inter.variable}`;
