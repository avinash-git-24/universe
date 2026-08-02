/**
 * UniVerse — Dashboard Page
 *
 * Protected route. Requires authentication.
 * Middleware redirects unauthenticated users to /login.
 *
 * This is a placeholder for Phase 4.
 * It reads the current user from Supabase server-side for SSR safety.
 */

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ROUTES } from "@/constants/routes";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard · UniVerse",
  description: "Your UniVerse campus dashboard.",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Belt-and-suspenders: middleware already handles this,
  // but we guard here too in case of direct server render.
  if (!user) {
    redirect(ROUTES.LOGIN);
  }

  const displayName =
    (user.user_metadata?.full_name as string | undefined) ??
    user.email?.split("@")[0] ??
    "Student";

  return (
    <main className="min-h-dvh bg-[var(--color-bg)] flex flex-col items-center justify-center px-4">
      <div
        className="w-full max-w-lg rounded-[var(--radius-xl)] border border-[var(--color-border)] shadow-[var(--shadow-xl)] overflow-hidden text-center"
        style={{ background: "rgba(255,255,255,0.88)", backdropFilter: "blur(20px)" }}
      >
        {/* Gradient top bar */}
        <div
          className="h-1 w-full"
          style={{ background: "linear-gradient(90deg, #10B981, #059669, #F59E0B)" }}
          aria-hidden="true"
        />

        <div className="px-8 py-10 flex flex-col items-center gap-4">
          {/* Avatar initials */}
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white"
            style={{ background: "linear-gradient(135deg, #10B981 0%, #059669 100%)" }}
            aria-hidden="true"
          >
            {displayName.charAt(0).toUpperCase()}
          </div>

          <div className="flex flex-col gap-1">
            <h1
              className="text-2xl font-bold text-[var(--color-text)]"
              style={{ fontFamily: "var(--font-plus-jakarta-sans)" }}
            >
              Welcome, {displayName}! 🎉
            </h1>
            <p
              className="text-sm text-[var(--color-text-muted)]"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              You&apos;re signed in as{" "}
              <span className="font-medium text-[var(--color-text)]">{user.email}</span>
            </p>
          </div>

          <div
            className="w-full rounded-[var(--radius-md)] px-4 py-3 text-left mt-2"
            style={{
              background: "var(--color-primary-subtle)",
              border: "1px solid rgba(16,185,129,0.2)",
            }}
          >
            <p
              className="text-sm text-[var(--color-text-secondary)]"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              🚧 <span className="font-semibold">Phase 4</span> — The full dashboard is coming soon.
              Your account is active and ready.
            </p>
          </div>

          {/* Sign out form — uses a server action approach via a simple link to API route */}
          <form action="/auth/signout" method="POST" className="w-full mt-2">
            <button
              type="submit"
              className="w-full h-10 rounded-[var(--radius-md)] border border-[var(--color-border)] text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)] hover:text-[var(--color-text)] transition-all duration-150"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              Sign Out
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
