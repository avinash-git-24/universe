"use client";

/**
 * UniVerse — Login Page (pixel-perfect match to reference image)
 *
 * Layout matches reference exactly:
 *  - Email field (with mail icon left, green checkmark right when valid)
 *  - Password field (with lock icon left, eye toggle right)
 *  - Remember me (left) + Forgot password? (right) on same row
 *  - Sign In button with arrow icon
 *  - OR divider
 *  - Continue with Google
 *  - Don't have an account? Create account >
 */

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Mail, Lock, CheckCircle2, ArrowRight, ChevronRight } from "lucide-react";
import { AuthCard } from "@/components/auth/AuthCard";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { ROUTES } from "@/constants/routes";
import { createClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ── Styled Input ─────────────────────────────────────────────────────────────
function AuthInput({
  id,
  type,
  label,
  placeholder,
  autoComplete,
  value,
  onChange,
  leftIcon,
  rightElement,
  error,
}: {
  id: string;
  type: string;
  label: string;
  placeholder: string;
  autoComplete?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  leftIcon: React.ReactNode;
  rightElement?: React.ReactNode;
  error?: string;
}) {
  const [focused, setFocused] = useState(false);

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="text-sm font-medium text-white"
        style={{ fontFamily: "var(--font-inter)" }}
      >
        {label}
      </label>
      <div
        className="relative flex items-center rounded-[14px] transition-all duration-200"
        style={{
          background: "rgba(4,12,7,0.9)",
          border: `1px solid ${error
              ? "rgba(239,68,68,0.6)"
              : focused
                ? "rgba(0,230,118,0.5)"
                : "rgba(0,230,118,0.18)"
            }`,
          boxShadow: focused
            ? "0 0 0 3px rgba(0,230,118,0.08), 0 0 16px rgba(0,230,118,0.06)"
            : "none",
        }}
      >
        {/* Left icon */}
        <div className="absolute left-4 flex items-center" style={{ color: "rgba(0,230,118,0.7)" }}>
          {leftIcon}
        </div>

        <input
          id={id}
          type={type}
          placeholder={placeholder}
          autoComplete={autoComplete}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="w-full bg-transparent text-white text-sm outline-none"
          style={{
            padding: "15px 44px",
            fontFamily: "var(--font-inter)",
            letterSpacing: type === "password" ? "0.1em" : undefined,
            color: "#fff",
          }}
        />

        {/* Right element */}
        {rightElement && (
          <div className="absolute right-4 flex items-center">
            {rightElement}
          </div>
        )}
      </div>
      {error && (
        <p className="text-xs text-red-400" style={{ fontFamily: "var(--font-inter)" }}>
          {error}
        </p>
      )}
    </div>
  );
}

// ── Login Form Content ────────────────────────────────────────────────────────
function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({});

  const callbackError = searchParams.get("error");
  const isEmailValid = validateEmail(email);

  function validate() {
    const errs: typeof errors = {};
    if (!email) errs.email = "Email is required.";
    else if (!isEmailValid) errs.email = "Enter a valid email address.";
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
      if (
        error.message.toLowerCase().includes("invalid login credentials") ||
        error.message.toLowerCase().includes("invalid credentials")
      ) {
        setErrors({ form: "Incorrect email or password. Please try again." });
      } else if (error.message.toLowerCase().includes("email not confirmed")) {
        setErrors({ form: "Please verify your email before signing in." });
      } else {
        setErrors({ form: error.message });
      }
      return;
    }

    const redirectTo = searchParams.get("redirectTo") ?? ROUTES.DASHBOARD;
    router.push(redirectTo);
    router.refresh();
  }

  return (
    <AuthCard
      title="Welcome Back"
      subtitle="Sign in to continue your journey in UniVerse"
    >
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        {/* Callback / form errors */}
        {(callbackError || errors.form) && (
          <div
            role="alert"
            className="rounded-[12px] px-4 py-3 text-sm"
            style={{
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.3)",
              color: "#FCA5A5",
              fontFamily: "var(--font-inter)",
            }}
          >
            {callbackError === "auth_callback_failed"
              ? "Authentication failed. Please try again."
              : errors.form || callbackError}
          </div>
        )}

        {/* Email */}
        <AuthInput
          id="login-email"
          type="email"
          label="Email"
          placeholder="avinash.128203@marwadiuniversity.ac.in"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          leftIcon={<Mail size={16} />}
          rightElement={
            isEmailValid ? (
              <CheckCircle2 size={18} style={{ color: "#00E676" }} />
            ) : undefined
          }
        />

        {/* Password */}
        <AuthInput
          id="login-password"
          type={showPassword ? "text" : "password"}
          label="Password"
          placeholder="••••••••••"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          leftIcon={<Lock size={16} />}
          rightElement={
            <button
              type="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword((v) => !v)}
              style={{ color: "rgba(167,184,176,0.7)", display: "flex", cursor: "pointer" }}
              className="hover:text-white transition-colors"
            >
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          }
        />

        {/* Remember me + Forgot password — same row */}
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2.5 cursor-pointer select-none group">
            <span className="relative inline-flex items-center justify-center flex-shrink-0">
              <input
                id="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="sr-only peer"
                aria-label="Remember me"
              />
              <span
                className="w-[18px] h-[18px] rounded-[5px] flex items-center justify-center transition-all duration-150"
                style={{
                  background: rememberMe ? "#00E676" : "rgba(10,20,14,0.8)",
                  border: rememberMe ? "1px solid #00E676" : "1px solid rgba(0,230,118,0.3)",
                }}
                aria-hidden="true"
              >
                {rememberMe && (
                  <svg viewBox="0 0 10 8" width="10" height="8" fill="none" aria-hidden="true">
                    <path d="M1 4l2.5 2.5L9 1" stroke="black" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
            </span>
            <span
              className="text-sm"
              style={{ color: "rgba(167,184,176,0.9)", fontFamily: "var(--font-inter)" }}
            >
              Remember me
            </span>
          </label>

          <Link
            href={ROUTES.FORGOT_PASSWORD}
            className="text-sm font-medium transition-colors hover:text-white"
            style={{ color: "#00E676", fontFamily: "var(--font-inter)" }}
          >
            Forgot password?
          </Link>
        </div>

        {/* Sign In button */}
        <motion.button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 font-bold text-base rounded-[14px] transition-all"
          style={{
            background: loading
              ? "rgba(0,150,70,0.5)"
              : "linear-gradient(90deg, #00C853 0%, #00E676 50%, #69F0AE 100%)",
            color: loading ? "rgba(255,255,255,0.6)" : "#000",
            padding: "16px 24px",
            fontFamily: "var(--font-inter)",
            boxShadow: loading ? "none" : "0 0 24px rgba(0,230,118,0.35), 0 4px 20px rgba(0,0,0,0.4)",
            cursor: loading ? "not-allowed" : "pointer",
            border: "none",
          }}
          whileTap={loading ? {} : { scale: 0.985 }}
          whileHover={loading ? {} : { boxShadow: "0 0 32px rgba(0,230,118,0.5), 0 4px 20px rgba(0,0,0,0.4)" }}
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Signing in…
            </>
          ) : (
            <>
              Sign In
              <ArrowRight size={18} />
            </>
          )}
        </motion.button>

        {/* OR divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-[1px]" style={{ background: "rgba(255,255,255,0.08)" }} />
          <span className="text-xs font-medium" style={{ color: "rgba(167,184,176,0.5)", fontFamily: "var(--font-inter)" }}>
            OR
          </span>
          <div className="flex-1 h-[1px]" style={{ background: "rgba(255,255,255,0.08)" }} />
        </div>

        {/* Continue with Google */}
        <GoogleButton label="Continue with Google" />

        {/* Create account link */}
        <p
          className="text-center text-sm"
          style={{ color: "rgba(167,184,176,0.7)", fontFamily: "var(--font-inter)" }}
        >
          Don&apos;t have an account?{" "}
          <Link
            href={ROUTES.REGISTER}
            className="font-semibold inline-flex items-center gap-0.5 hover:underline underline-offset-4"
            style={{ color: "#00E676" }}
          >
            Create account
            <ChevronRight size={14} />
          </Link>
        </p>
      </form>
    </AuthCard>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <AuthCard title="Welcome" subtitle="Loading...">
          <div className="flex justify-center p-8">
            <div className="w-6 h-6 border-2 border-[#00E676] border-t-transparent rounded-full animate-spin" />
          </div>
        </AuthCard>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
