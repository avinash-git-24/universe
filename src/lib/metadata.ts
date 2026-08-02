/**
 * UniVerse — SEO Metadata Factory
 *
 * Factory function for generating consistent Next.js metadata objects.
 * Use in every page's generateMetadata() or static metadata export.
 */

import type { Metadata } from "next";
import { APP_CONFIG } from "@/constants/config";

interface PageMetadataOptions {
  title?: string;
  description?: string;
  image?: string;
  noIndex?: boolean;
  canonical?: string;
}

/**
 * Generate a full Metadata object for a page.
 *
 * @example
 * // In a page.tsx:
 * export const metadata = createMetadata({
 *   title: "New Request",
 *   description: "Request snacks delivered to your hostel room.",
 * });
 */
export function createMetadata({
  title,
  description,
  image,
  noIndex = false,
  canonical,
}: PageMetadataOptions = {}): Metadata {
  const pageTitle = title
    ? `${title} — ${APP_CONFIG.name}`
    : `${APP_CONFIG.name} · ${APP_CONFIG.tagline}`;

  const pageDescription = description ?? APP_CONFIG.description;
  const ogImage = image ?? `${APP_CONFIG.url}/og-image.png`;

  return {
    title: pageTitle,
    description: pageDescription,

    // ── Open Graph ──
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      url: canonical ?? APP_CONFIG.url,
      siteName: APP_CONFIG.name,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: pageTitle,
        },
      ],
      locale: "en_IN",
      type: "website",
    },

    // ── Twitter Card ──
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description: pageDescription,
      images: [ogImage],
    },

    // ── Canonical ──
    ...(canonical && {
      alternates: { canonical },
    }),

    // ── Robots ──
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },

    // ── App-specific metadata ──
    applicationName: APP_CONFIG.name,
    authors: [{ name: APP_CONFIG.name, url: APP_CONFIG.url }],
    keywords: [
      "hostel delivery",
      "student app",
      "vending machine delivery",
      "campus delivery",
      "peer delivery",
      "hostel snacks",
    ],
  };
}

/**
 * Root layout metadata — used in src/app/layout.tsx.
 */
export const rootMetadata: Metadata = {
  ...createMetadata(),
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
    shortcut: "/favicon.ico",
  },
  formatDetection: {
    telephone: false,
    date: false,
    address: false,
    email: false,
  },
};
