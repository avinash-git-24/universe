"use client";

/**
 * UniVerse — Forgot Password Page
 *
 * Sends a password reset link to the user's email.
 * Frontend-only. Supabase auth.resetPasswordForEmail() wired in Phase 3.
 */

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import { AuthCard } from "@/components/auth/AuthCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { createClient } from "@/lib/supabase/client";

const MU_EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@marwadiuniversity\.ac\.in$/i;

function sanitizeEmail(email: string): string {
  return email
    .replace(/[\u200B-\u200D\uFEFF\u00A0]/g, "")
    .trim()
    .toLowerCase();
}

function validateEmail(email: string): boolean {
  const sanitized = sanitizeEmail(email);
  return MU_EMAIL_REGEX.test(sanitized);
}

// ─── Success State ────────────────────────────────────────────────────────────

function SuccessState({ email }: { email: string }) {
  return (
    <div className="flex flex-col items-center gap-6 py-4 text-center">
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center"
        style={{ background: "var(--color-success-subtle)" }}
      >
        <CheckCircle2 size={32} className="text-[var(--color-success)]" />
      </div>

      <div className="flex flex-col gap-2">
        <h2
          className="text-lg font-bold text-[var(--color-text)]"
          style={{ fontFamily: "var(--font-plus-jakarta-sans)" }}
        >
          Check your inbox
        </h2>
        <p
          className="text-sm text-[var(--color-text-muted)] max-w-xs mx-auto"
          style={{ fontFamily: "var(--font-inter)" }}
        >
          We sent a password reset link to{" "}
          <span className="font-semibold text-[var(--color-text)]">{email}</span>.
          It expires in 24 hours.
        </p>
      </div>

      <p
        className="text-xs text-[var(--color-text-muted)]"
        style={{ fontFamily: "var(--font-inter)" }}
      >
        Didn&apos;t receive it? Check your spam folder or{" "}
        <button
          type="button"
          className="text-[var(--color-primary)] font-medium hover:underline underline-offset-4"
          onClick={() => window.location.reload()}
        >
          try again
        </button>
        .
      </p>

      <Link
        href={ROUTES.LOGIN}
        className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors duration-150"
        style={{ fontFamily: "var(--font-inter)" }}
      >
        <ArrowLeft size={16} />
        Back to sign in
      </Link>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const normalizedEmail = sanitizeEmail(email);
    if (!normalizedEmail) { setError("Email is required."); return; }
    if (!validateEmail(normalizedEmail)) { setError("Only @marwadiuniversity.ac.in email addresses are accepted."); return; }
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error: supabaseError } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
      // The callback route detects type=recovery and redirects to /reset-password
      redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
    });

    setLoading(false);

    if (supabaseError) {
      setError(supabaseError.message);
      return;
    }

    // Show success state regardless — prevents email enumeration
    setSent(true);
  }

  return (
    <AuthCard
      title="Reset your password"
      subtitle="Enter your email and we'll send you a reset link"
    >
      {sent ? (
        <SuccessState email={email} />
      ) : (
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
          <Input
            id="forgot-email"
            type="email"
            label="Email address"
            placeholder="you@marwadiuniversity.ac.in"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={error}
            leftIcon={<Mail size={16} />}
            size="lg"
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={loading}
            loadingText="Sending reset link…"
          >
            Send Reset Link
          </Button>

          <Link
            href={ROUTES.LOGIN}
            className="inline-flex items-center justify-center gap-2 text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors duration-150 mt-1"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            <ArrowLeft size={16} />
            Back to sign in
          </Link>
        </form>
      )}
    </AuthCard>
  );
}
