/**
 * UniVerse — Verify Email Page
 *
 * Beautiful post-registration success screen.
 * Explains that a verification email has been sent.
 * Static — no interactivity needed except resend link (stubbed).
 */

import Link from "next/link";
import { Mail, RefreshCw, ArrowLeft } from "lucide-react";
import { AuthBackground } from "@/components/auth/AuthBackground";
import { AuthLogo } from "@/components/auth/AuthLogo";
import { ROUTES } from "@/constants/routes";

// ─── Animated envelope illustration ─────────────────────────────────────────

function EnvelopeIllustration() {
  return (
    <div className="relative flex items-center justify-center">
      {/* Outer glow ring */}
      <div
        className="absolute w-32 h-32 rounded-full animate-pulse"
        style={{
          background:
            "radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />
      {/* Icon container */}
      <div
        className="relative w-24 h-24 rounded-[var(--radius-xl)] flex items-center justify-center shadow-[var(--shadow-xl)]"
        style={{
          background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
        }}
      >
        <Mail size={40} className="text-white" strokeWidth={1.5} />

        {/* Floating dot — top right */}
        <span
          className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[var(--color-accent)] border-2 border-white flex items-center justify-center"
          aria-hidden="true"
        >
          <span className="text-[10px] font-bold text-white">1</span>
        </span>
      </div>
    </div>
  );
}

// ─── Step indicator ───────────────────────────────────────────────────────────

function StepIndicator() {
  const steps = ["Create Account", "Verify Email", "Complete Profile"];
  return (
    <div className="flex items-center gap-2" aria-label="Onboarding steps">
      {steps.map((step, i) => (
        <div key={step} className="flex items-center gap-2">
          <div className="flex flex-col items-center gap-1">
            <div
              className={[
                "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                i === 0
                  ? "bg-[var(--color-success)] text-white"
                  : i === 1
                  ? "bg-[var(--color-primary)] text-white ring-4 ring-[var(--color-primary)]/20"
                  : "bg-[var(--color-border)] text-[var(--color-text-muted)]",
              ].join(" ")}
            >
              {i === 0 ? (
                <svg viewBox="0 0 10 8" width="10" height="8" fill="none">
                  <path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                i + 1
              )}
            </div>
            <span
              className="text-[10px] font-medium whitespace-nowrap hidden sm:block"
              style={{
                color:
                  i === 1
                    ? "var(--color-primary)"
                    : i === 0
                    ? "var(--color-success)"
                    : "var(--color-text-muted)",
                fontFamily: "var(--font-inter)",
              }}
            >
              {step}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className="w-8 sm:w-12 h-px mb-4"
              style={{
                background:
                  i === 0
                    ? "var(--color-success)"
                    : "var(--color-border)",
              }}
              aria-hidden="true"
            />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function VerifyEmailPage() {
  return (
    <>
      <AuthBackground />
      <div className="min-h-dvh flex flex-col items-center justify-center px-4 py-12 sm:px-6">
        {/* Logo */}
        <div className="mb-10">
          <AuthLogo />
        </div>

        {/* Step progress */}
        <div className="mb-8">
          <StepIndicator />
        </div>

        {/* Card */}
        <div
          className="w-full max-w-md rounded-[var(--radius-xl)] border border-[var(--color-border)] shadow-[var(--shadow-xl)] overflow-hidden text-center"
          style={{ background: "rgba(255,255,255,0.88)", backdropFilter: "blur(20px)" }}
        >
          {/* Gradient top bar */}
          <div
            className="h-1 w-full"
            style={{
              background: "linear-gradient(90deg, #10B981, #059669, #F59E0B)",
            }}
            aria-hidden="true"
          />

          <div className="px-8 py-10 flex flex-col items-center gap-6">
            {/* Illustration */}
            <EnvelopeIllustration />

            {/* Copy */}
            <div className="flex flex-col gap-3">
              <h1
                className="text-2xl font-bold text-[var(--color-text)]"
                style={{ fontFamily: "var(--font-plus-jakarta-sans)" }}
              >
                Check your inbox
              </h1>
              <p
                className="text-sm text-[var(--color-text-muted)] max-w-sm mx-auto leading-relaxed"
                style={{ fontFamily: "var(--font-inter)" }}
              >
                We&apos;ve sent a verification link to your{" "}
                <span className="font-semibold text-[var(--color-text)]">
                  Marwadi University email
                </span>
                . Click the link to activate your account.
              </p>
            </div>

            {/* Info box */}
            <div
              className="w-full rounded-[var(--radius-md)] px-4 py-3 text-left"
              style={{
                background: "var(--color-primary-subtle)",
                border: "1px solid rgba(16,185,129,0.2)",
              }}
            >
              <ul
                className="text-xs text-[var(--color-text-secondary)] space-y-1.5"
                style={{ fontFamily: "var(--font-inter)" }}
              >
                <li className="flex items-start gap-2">
                  <span className="text-[var(--color-primary)] mt-0.5 flex-shrink-0">•</span>
                  The link expires in <strong>24 hours</strong>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[var(--color-primary)] mt-0.5 flex-shrink-0">•</span>
                  Check your <strong>spam / junk folder</strong> if you don&apos;t see it
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[var(--color-primary)] mt-0.5 flex-shrink-0">•</span>
                  Only <strong>@marwadiuniversity.ac.in</strong> emails are accepted
                </li>
              </ul>
            </div>

            {/* Resend */}
            <form action="#" className="w-full">
              <button
                type="submit"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-primary)] hover:underline underline-offset-4 transition-colors duration-150"
                style={{ fontFamily: "var(--font-inter)" }}
              >
                <RefreshCw size={14} />
                Resend verification email
              </button>
            </form>
          </div>
        </div>

        {/* Back link */}
        <Link
          href={ROUTES.LOGIN}
          className="mt-8 inline-flex items-center gap-2 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors duration-150"
          style={{ fontFamily: "var(--font-inter)" }}
        >
          <ArrowLeft size={16} />
          Back to sign in
        </Link>
      </div>
    </>
  );
}
