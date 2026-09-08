"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { ROUTES } from "@/constants/routes";
import EmeraldObsidianBackground from "@/components/auth/EmeraldObsidianBackground";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Zap,
  Sparkles,
  X,
} from "lucide-react";

// ─── Modern Input Field ────────────────────────────────────────────────────────
function ModernField({
  id,
  type,
  label,
  placeholder,
  autoComplete,
  value,
  onChange,
  leftIcon,
  rightNode,
  error,
  warningNode,
  onKeyDown,
  onKeyUp,
  headerRight,
}: {
  id: string;
  type: string;
  label: string;
  placeholder: string;
  autoComplete?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  leftIcon: React.ReactNode;
  rightNode?: React.ReactNode;
  error?: string;
  warningNode?: React.ReactNode;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onKeyUp?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  headerRight?: React.ReactNode;
}) {
  const [focused, setFocused] = useState(false);

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <div className="flex items-center justify-between text-xs min-h-[18px]">
        <label
          htmlFor={id}
          className="font-semibold tracking-wider text-neutral-300 uppercase text-[11px]"
        >
          {label}
        </label>
        {headerRight}
      </div>

      <div
        className={`relative flex items-center w-full rounded-xl transition-all duration-200 ${
          error
            ? "bg-red-950/20 border border-red-500/60 shadow-[0_0_15px_rgba(239,68,68,0.2)]"
            : focused
            ? "bg-black/60 border border-[#00E676] shadow-[0_0_20px_rgba(0,230,118,0.25)] ring-1 ring-[#00E676]/30"
            : "bg-black/40 border border-white/10 hover:border-white/20 hover:bg-black/50"
        }`}
      >
        <span
          className={`absolute left-3.5 flex items-center transition-colors pointer-events-none ${
            focused ? "text-[#00E676]" : "text-neutral-400"
          }`}
        >
          {leftIcon}
        </span>

        <input
          id={id}
          type={type}
          placeholder={placeholder}
          autoComplete={autoComplete}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={onKeyDown}
          onKeyUp={onKeyUp}
          className="w-full bg-transparent text-white text-sm py-3.5 pl-11 pr-16 outline-none placeholder:text-neutral-500 tracking-normal"
        />

        {rightNode && (
          <div className="absolute right-3.5 flex items-center gap-2">
            {rightNode}
          </div>
        )}
      </div>

      {warningNode && (
        <p className="text-amber-400 text-xs mt-0.5 flex items-center gap-1 font-medium animate-pulse">
          <span>{warningNode}</span>
        </p>
      )}

      {error && (
        <p className="text-red-400 text-xs mt-0.5 flex items-center gap-1 font-medium">
          <AlertCircle size={13} />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}

// ─── Login Form Component ──────────────────────────────────────────────────────
function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({});
  const [mounted, setMounted] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Email helper: check MU domain
  function validateEmail(val: string) {
    return /^[a-zA-Z0-9._%+-]+@marwadiuniversity\.ac\.in$/i.test(val.trim());
  }

  function sanitizeEmail(val: string): string {
    return val.replace(/[\u200B-\u200D\uFEFF\u00A0]/g, "").trim().toLowerCase();
  }

  function handleKeyActivity(e: React.KeyboardEvent<HTMLInputElement>) {
    if (typeof e.getModifierState === "function") {
      setCapsLockOn(e.getModifierState("CapsLock"));
    }
  }

  // Load remembered or query email on mount
  useEffect(() => {
    setMounted(true);
    try {
      const qEmail = searchParams.get("email");
      if (qEmail) {
        setEmail(qEmail);
        return;
      }
      const saved = localStorage.getItem("universe_remembered_email");
      if (saved) {
        setEmail(saved);
        setRemember(true);
      }
    } catch {
      // ignore
    }
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading || isSuccess) return;

    const normalizedEmail = sanitizeEmail(email);
    const errs: typeof errors = {};
    if (!normalizedEmail) errs.email = "Email is required.";
    else if (!validateEmail(normalizedEmail)) {
      errs.email = "Only @marwadiuniversity.ac.in emails are allowed.";
    }
    if (!password) errs.password = "Password is required.";
    else if (password.length < 6) errs.password = "Password must be at least 6 characters.";

    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const { error } = await createClient().auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

      if (error) {
        setLoading(false);
        setErrors({
          form: error.message.toLowerCase().includes("invalid")
            ? "Incorrect email or password. Please try again."
            : error.message,
        });
        return;
      }

      // Save or clear Remember Me
      try {
        if (remember) {
          localStorage.setItem("universe_remembered_email", normalizedEmail);
        } else {
          localStorage.removeItem("universe_remembered_email");
        }
      } catch {
        // ignore
      }

      setIsSuccess(true);
      const redirectTarget = searchParams.get("redirectTo") ?? ROUTES.DASHBOARD;
      setTimeout(() => {
        router.refresh();
        router.push(redirectTarget);
      }, 500);
    } catch (err: any) {
      setLoading(false);
      setErrors({ form: err?.message || "Failed to sign in. Please try again." });
    }
  }

  async function handleGoogle() {
    if (loading || isSuccess) return;
    setLoading(true);
    await createClient().auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?redirectTo=/dashboard`,
        queryParams: { prompt: "select_account", hd: "marwadiuniversity.ac.in" },
      },
    });
  }

  const emailValid = validateEmail(email);

  return (
    <div className="w-full min-h-[100dvh] flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans">
      {/* ── Option 1: Deep Obsidian + Emerald Aurora Background ── */}
      <EmeraldObsidianBackground />

      {/* ── Top Header Brand Pill ── */}
      <div
        className={`relative z-10 mb-6 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/40 border border-emerald-500/30 backdrop-blur-xl shadow-[0_0_20px_rgba(0,230,118,0.15)] transition-all duration-500 ${
          mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
        }`}
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00E676] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00E676]"></span>
        </span>
        <span className="text-[11px] font-bold text-emerald-400 tracking-wider uppercase">
          Marwadi University Campus Hub
        </span>
      </div>

      {/* ── Main High-End Glassmorphism Card ── */}
      <div
        className={`relative z-10 w-full max-w-[440px] rounded-3xl p-6 sm:p-8 backdrop-blur-2xl transition-all duration-700 ${
          mounted ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-6"
        }`}
        style={{
          background: "linear-gradient(135deg, rgba(12, 22, 16, 0.78) 0%, rgba(6, 12, 9, 0.85) 100%)",
          border: "1px solid rgba(0, 230, 118, 0.22)",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 45px -10px rgba(0, 230, 118, 0.15)",
        }}
      >
        {/* Subtle Card Header Corner Accent Glow */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#00E676]/15 rounded-full blur-2xl pointer-events-none" />

        {/* ── Brand Logo & Header ── */}
        <div className="text-center mb-7 relative z-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#00E676] via-teal-500 to-emerald-700 text-black shadow-[0_0_25px_rgba(0,230,118,0.4)] mb-4 ring-2 ring-emerald-400/30">
            <Zap size={26} className="fill-black stroke-black" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Uni<span className="text-[#00E676]">Verse</span>
          </h1>

          <p className="text-xs sm:text-sm text-neutral-400 mt-1.5 font-medium">
            Campus delivery & student marketplace
          </p>
        </div>

        {/* ── Form ── */}
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4 relative z-10">
          {errors.form && (
            <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs font-medium flex items-center gap-2 animate-shake">
              <AlertCircle size={16} className="shrink-0 text-red-400" />
              <span>{errors.form}</span>
            </div>
          )}

          {/* Email Field */}
          <ModernField
            id="email"
            type="email"
            label="Student Email"
            placeholder="avinash.128203@marwadiuniversity.ac.in"
            autoComplete="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
            }}
            error={errors.email}
            leftIcon={<Mail size={16} />}
            rightNode={
              <>
                {email.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setEmail("")}
                    className="text-neutral-400 hover:text-white transition-colors p-1"
                    title="Clear email"
                  >
                    <X size={14} />
                  </button>
                )}
                {emailValid && (
                  <span title="Valid MU Email">
                    <CheckCircle2 size={16} className="text-[#00E676] shrink-0" />
                  </span>
                )}
              </>
            }
          />

          {/* Password Field */}
          <ModernField
            id="password"
            type={showPw ? "text" : "password"}
            label="Password"
            placeholder="Enter your password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
            }}
            onKeyDown={handleKeyActivity}
            onKeyUp={handleKeyActivity}
            error={errors.password}
            warningNode={capsLockOn ? "⇪ Caps Lock is ON" : undefined}
            leftIcon={<Lock size={16} />}
            headerRight={
              password.length > 0 ? (
                <button
                  type="button"
                  onClick={() => {
                    setPassword("");
                    if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                    const el = document.getElementById("password");
                    if (el) el.focus();
                  }}
                  className="text-[10.5px] font-semibold text-[#00E676] hover:underline"
                >
                  Clear
                </button>
              ) : null
            }
            rightNode={
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="text-neutral-400 hover:text-white transition-colors p-1"
                title={showPw ? "Hide password" : "Show password"}
              >
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            }
          />

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-neutral-300 select-none group">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="w-4 h-4 rounded border-neutral-700 bg-black/50 text-[#00E676] focus:ring-[#00E676] focus:ring-offset-0 cursor-pointer accent-[#00E676]"
              />
              <span className="group-hover:text-white transition-colors">Remember me</span>
            </label>

            <Link
              href={ROUTES.FORGOT_PASSWORD}
              className="text-[#00E676] hover:text-emerald-300 font-semibold transition-colors hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={loading || isSuccess}
            className="w-full mt-2 py-3.5 px-4 rounded-xl font-black text-black bg-gradient-to-r from-[#00E676] via-[#00f59b] to-[#00E676] bg-[length:200%_auto] hover:bg-right transition-all duration-300 shadow-[0_0_25px_rgba(0,230,118,0.35)] hover:shadow-[0_0_35px_rgba(0,230,118,0.5)] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 text-sm tracking-wide cursor-pointer"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                <span>Signing in...</span>
              </>
            ) : isSuccess ? (
              <>
                <CheckCircle2 size={17} className="text-black" />
                <span>Entering UniVerse...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-1">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-[11px] text-neutral-500 uppercase tracking-widest font-semibold">
              OR
            </span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Google Sign In */}
          <button
            type="button"
            onClick={handleGoogle}
            disabled={loading || isSuccess}
            className="w-full py-3 px-4 rounded-xl font-semibold text-white bg-black/40 hover:bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-200 flex items-center justify-center gap-3 text-xs tracking-wide active:scale-[0.99] cursor-pointer"
          >
            <svg width="17" height="17" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Student Google</span>
          </button>
        </form>

        {/* ── Sign Up Link ── */}
        <div className="text-center mt-6 pt-5 border-t border-white/[0.08]">
          <p className="text-xs text-neutral-400">
            Don&apos;t have an account?{" "}
            <Link
              href={ROUTES.REGISTER}
              className="text-[#00E676] hover:text-emerald-300 font-bold transition-colors hover:underline ml-1"
            >
              Create student account &rarr;
            </Link>
          </p>
        </div>
      </div>

      {/* ── Bottom Campus Verified Trust Footer ── */}
      <div
        className={`relative z-10 mt-6 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-[11px] text-neutral-500 transition-all duration-700 ${
          mounted ? "opacity-100" : "opacity-0"
        }`}
      >
        <span className="flex items-center gap-1.5 hover:text-neutral-400 transition-colors">
          <ShieldCheck size={13} className="text-[#00E676]" />
          <span>256-Bit SSL Encrypted</span>
        </span>
        <span className="text-neutral-700 hidden sm:inline">•</span>
        <span className="flex items-center gap-1.5 hover:text-neutral-400 transition-colors">
          <Sparkles size={13} className="text-teal-400" />
          <span>Verified MU Students Only</span>
        </span>
        <span className="text-neutral-700 hidden sm:inline">•</span>
        <span className="flex items-center gap-1.5 hover:text-neutral-400 transition-colors">
          <Zap size={13} className="text-amber-400" />
          <span>Hostel-to-Hostel Delivery</span>
        </span>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full min-h-screen bg-[#030704] flex items-center justify-center text-emerald-400">
          <span className="w-8 h-8 border-2 border-emerald-500/30 border-t-[#00E676] rounded-full animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
