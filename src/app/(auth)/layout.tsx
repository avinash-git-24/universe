/**
 * UniVerse — Auth Group Layout
 *
 * Wraps /login, /register, /forgot-password, /verify-email, /complete-profile.
 * Clean centered layout — no homepage Navbar or Footer.
 */

import type { Metadata } from "next";
import SpaceBackground from "@/components/auth/SpaceBackground";

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
    <>
      {/* Ambient 3D space background — fixed, behind everything */}
      <SpaceBackground />

      {/* Centered content area */}
      <div className="min-h-dvh flex flex-col items-center justify-center px-4 py-12 sm:px-6">
        {children}
      </div>
    </>
  );
}
