/**
 * UniVerse — Root Layout
 *
 * The top-level layout wrapping the entire Next.js app.
 * Sets up: fonts, metadata, providers, PWA meta, accessibility.
 */

import type { Metadata, Viewport } from "next";
import { fontClassNames } from "@/lib/fonts";
import { rootMetadata } from "@/lib/metadata";
import { AppProviders } from "@/providers/AppProviders";
import "@/app/globals.css";

// ─── Metadata ─────────────────────────────────────────────────────────────────

export const metadata: Metadata = rootMetadata;

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#10B981" },
    { media: "(prefers-color-scheme: dark)", color: "#059669" },
  ],
};

// ─── Layout ───────────────────────────────────────────────────────────────────

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={fontClassNames}
      suppressHydrationWarning
    >
      <head>
        {/* PWA */}
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />

        {/* Preconnect for Google Fonts (loaded via next/font, but good practice) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>

      <body
        className="min-h-dvh bg-[var(--color-bg)] text-[var(--color-text)] antialiased"
        style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}
      >
        {/* Skip to main content — accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-[var(--color-primary)] focus:text-white focus:rounded-[var(--radius-md)] focus:shadow-lg"
        >
          Skip to main content
        </a>

        {/* Root providers */}
        <AppProviders>
          <main id="main-content" tabIndex={-1}>
            {children}
          </main>
        </AppProviders>
      </body>
    </html>
  );
}
