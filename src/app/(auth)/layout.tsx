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
      className="min-h-[100dvh] bg-[#070A08] flex flex-col items-center justify-center py-6 sm:py-12 px-3 sm:px-6 relative overflow-x-hidden"
    >
      {/* Space background — absolute so it fills this container */}
      <LazySpaceBackground />

      {/* Page content — sits above the space background */}
      <div className="relative z-10 w-full flex flex-col items-center max-w-full">
        {children}
      </div>
    </div>
  );
}
