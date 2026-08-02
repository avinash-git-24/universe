/**
 * UniVerse — Auth Card Shell
 *
 * Centered glass-morphism card wrapping every auth form.
 * Accepts a title, subtitle, and children (the form content).
 */

import { AuthLogo } from "@/components/auth/AuthLogo";

interface AuthCardProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

export function AuthCard({ title, subtitle, children }: AuthCardProps) {
  return (
    <div className="w-full max-w-md mx-auto">
      {/* Logo */}
      <div className="flex justify-center mb-8">
        <AuthLogo />
      </div>

      {/* Glass card */}
      <div
        className="rounded-[var(--radius-xl)] border border-[var(--color-border)] shadow-[var(--shadow-xl)] overflow-hidden"
        style={{ background: "rgba(255,255,255,0.88)", backdropFilter: "blur(20px)" }}
      >
        {/* Header */}
        <div className="px-8 pt-8 pb-6 border-b border-[var(--color-border)]">
          <h1
            className="text-2xl font-bold text-[var(--color-text)] tracking-tight"
            style={{ fontFamily: "var(--font-plus-jakarta-sans)" }}
          >
            {title}
          </h1>
          <p
            className="mt-1.5 text-sm text-[var(--color-text-muted)]"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            {subtitle}
          </p>
        </div>

        {/* Form content */}
        <div className="px-8 py-6">{children}</div>
      </div>
    </div>
  );
}
