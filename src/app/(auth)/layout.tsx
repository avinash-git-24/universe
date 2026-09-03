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
    <div
      className="min-h-[100dvh] bg-[#070A08] flex flex-col items-center justify-center py-6 sm:py-12 px-3 sm:px-6 relative overflow-x-hidden"
    >
      {/* Subtle ambient cosmic background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Page content */}
      <div className="relative z-10 w-full flex flex-col items-center max-w-full">
        {children}
      </div>
    </div>
  );
}
