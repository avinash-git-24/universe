"use client";

/**
 * UniVerse — Login Page (Supabase Connected)
 *
 * Email + password sign in via Supabase auth.signInWithPassword().
 * Redirects to /dashboard on success, or to the original destination
 * if the user was bounced here by the middleware.
 */

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { AuthCard } from "@/components/auth/AuthCard";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ─── Page ────────────────────────────────────────────────────────────────────

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({});

  // Show error if redirected back after failed callback
  const callbackError = searchParams.get("error");

  function validate() {
    const errs: typeof errors = {};
    if (!email) errs.email = "Email is required.";
    else if (!validateEmail(email)) errs.email = "Enter a valid email address.";
    if (!password) errs.password = "Password is required.";
    else if (password.length < 6) errs.password = "Password must be at least 6 characters.";
    return errs;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setLoading(false);
      if (error.message.toLowerCase().includes("invalid login credentials") ||
          error.message.toLowerCase().includes("invalid credentials")) {
        setErrors({ form: "Incorrect email or password. Please try again." });
      } else if (error.message.toLowerCase().includes("email not confirmed")) {
        setErrors({ form: "Please verify your email before signing in." });
      } else {
        setErrors({ form: error.message });
      }
      return;
    }

    // Redirect to original destination or dashboard
    const redirectTo = searchParams.get("redirectTo") ?? ROUTES.DASHBOARD;
    router.push(redirectTo);
    router.refresh();
  }

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Sign in to your UniVerse account"
    >
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        {/* Callback error */}
        {callbackError && (
          <div
            role="alert"
            className="rounded-[var(--radius-md)] px-4 py-3 text-sm bg-[var(--color-error-subtle)] text-[var(--color-error-foreground)] border border-[var(--color-error)]/30"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            {callbackError === "auth_callback_failed" 
              ? "Authentication failed. Please try again." 
              : callbackError}
          </div>
        )}

        {/* Global form error */}
        {errors.form && (
          <div
            role="alert"
            className="rounded-[var(--radius-md)] px-4 py-3 text-sm bg-[var(--color-error-subtle)] text-[var(--color-error-foreground)] border border-[var(--color-error)]/30"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            {errors.form}
          </div>
        )}

        {/* Email */}
        <Input
          id="login-email"
          type="email"
          label="Email"
          placeholder="you@marwadiuniversity.ac.in"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          leftIcon={<Mail size={16} />}
          size="lg"
        />

        {/* Password */}
        <div className="flex flex-col gap-1.5">
          <Input
            id="login-password"
            type={showPassword ? "text" : "password"}
            label="Password"
            placeholder="••••••••"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            leftIcon={<Lock size={16} />}
            rightIcon={
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((v) => !v)}
                className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors duration-150"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            }
            size="lg"
          />
          {/* Forgot password — inline link */}
          <div className="flex justify-end">
            <Link
              href={ROUTES.FORGOT_PASSWORD}
              className="text-xs text-[var(--color-primary)] hover:underline underline-offset-4 font-medium"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              Forgot password?
            </Link>
          </div>
        </div>

        {/* Remember me */}
        <label className="flex items-center gap-3 cursor-pointer group select-none">
          <span className="relative inline-flex items-center justify-center">
            <input
              id="remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="sr-only peer"
              aria-label="Remember me"
            />
            <span
              className={cn(
                "w-4 h-4 rounded-[var(--radius-xs)] border-2 flex items-center justify-center transition-all duration-150",
                rememberMe
                  ? "bg-[var(--color-primary)] border-[var(--color-primary)]"
                  : "bg-white border-[var(--color-border-strong)] group-hover:border-[var(--color-primary)]"
              )}
              aria-hidden="true"
            >
              {rememberMe && (
                <svg viewBox="0 0 10 8" width="10" height="8" fill="none" aria-hidden="true">
                  <path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </span>
          </span>
          <span
            className="text-sm text-[var(--color-text-secondary)]"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            Remember me
          </span>
        </label>

        {/* Submit */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          isLoading={loading}
          loadingText="Signing in…"
        >
          Sign In
        </Button>

        {/* Divider */}
        <div className="divider-label">OR</div>

        {/* Google */}
        <GoogleButton label="Continue with Google" />
      </form>

      {/* Footer link */}
      <p
        className="mt-6 text-center text-sm text-[var(--color-text-muted)]"
        style={{ fontFamily: "var(--font-inter)" }}
      >
        Don&apos;t have an account?{" "}
        <Link
          href={ROUTES.REGISTER}
          className="font-semibold text-[var(--color-primary)] hover:underline underline-offset-4"
        >
          Create account
        </Link>
      </p>
    </AuthCard>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <AuthCard title="Welcome back" subtitle="Loading...">
        <div className="flex justify-center p-8">
          <div className="w-6 h-6 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
        </div>
      </AuthCard>
    }>
      <LoginContent />
    </Suspense>
  );
}
