"use client";

/**
 * UniVerse — Google OAuth Button
 *
 * Shared "Continue with Google" button used on Login and Register pages.
 * Uses Supabase auth.signInWithOAuth() with PKCE flow.
 */

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function GoogleButton({ label = "Continue with Google" }: { label?: string }) {
  const [loading, setLoading] = useState(false);

  async function handleGoogleAuth() {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          prompt: 'select_account',
          hd: 'marwadiuniversity.ac.in',
        },
      },
    });
    // Note: setLoading(false) intentionally omitted —
    // the browser will navigate away on success.
    // On failure, Supabase stays on page and the error surfaces in the URL.
  }

  return (
    <button
      type="button"
      onClick={handleGoogleAuth}
      disabled={loading}
      aria-label={label}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "12px",
        background: "rgba(10,18,13,0.8)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "14px",
        padding: "15px 24px",
        color: "#fff",
        fontSize: "0.95rem",
        fontWeight: 600,
        fontFamily: "var(--font-inter)",
        cursor: loading ? "not-allowed" : "pointer",
        opacity: loading ? 0.6 : 1,
        transition: "all 0.2s ease",
        backdropFilter: "blur(8px)",
      }}
      onMouseEnter={(e) => {
        if (!loading) {
          e.currentTarget.style.background = "rgba(15,28,20,0.9)";
          e.currentTarget.style.borderColor = "rgba(255,255,255,0.18)";
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "rgba(10,18,13,0.8)";
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
      }}
    >
      {loading ? (
        <>
          <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          Redirecting to Google…
        </>
      ) : (
        <>
          {/* Google "G" SVG */}
          <svg
            aria-hidden="true"
            focusable="false"
            viewBox="0 0 24 24"
            width="20"
            height="20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          {label}
        </>
      )}
    </button>
  );
}
