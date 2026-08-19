/**
 * UniVerse — Auth Group Layout
 *
 * Wraps /login, /register, /forgot-password, /verify-email, /complete-profile.
 * Clean centered layout — no homepage Navbar or Footer.
 *
 * Background strategy: The outer div owns the dark background (#070A08).
 * SpaceBackground renders as absolute children within it so it cannot be
 * covered by the root layout's body background color.
 */

import type { Metadata } from "next";
import LazySpaceBackground from "@/components/auth/LazySpaceBackground";

export const metadata: Metadata = {
  title: {
    template: "%s · UniVerse",
    default: "UniVerse Auth",
  },
  description: "Sign in or create your UniVerse account.",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // This outer div owns the dark background — completely covering the body's
    // default light color set in the root layout.
    <div
      style={{
        minHeight: "100dvh",
        background: "#070A08",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "3rem 1rem",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Space background — absolute so it fills this container */}
      <LazySpaceBackground />

      {/* Page content — sits above the space background */}
      <div style={{ position: "relative", zIndex: 1, width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
        {children}
      </div>
    </div>
  );
}
