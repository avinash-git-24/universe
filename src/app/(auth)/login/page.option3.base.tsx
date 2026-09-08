"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { ROUTES } from "@/constants/routes";
import TechSpotlightBackground from "@/components/auth/TechSpotlightBackground";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Terminal,
  Zap,
  X,
  Cpu,
} from "lucide-react";

// ─── Option 3: Modern Tech Input Field ─────────────────────────────────────────
function TechField({
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
          className="font-mono text-[10.5px] font-medium tracking-wider text-slate-400 uppercase flex items-center gap-1.5"
        >
          <span className="text-emerald-400 font-bold">&gt;</span>
          <span>{label}</span>
        </label>
        {headerRight}
      </div>

      <div
        className={`relative flex items-center w-full rounded-xl transition-all duration-200 ${
          error
            ? "bg-red-950/20 border border-red-500/60 shadow-[0_0_15px_rgba(239,68,68,0.25)]"
            : focused
            ? "bg-[#060a14]/90 border border-emerald-400 shadow-[0_0_22px_rgba(16,185,129,0.25)] ring-1 ring-emerald-400/30"
            : "bg-[#080d1a]/60 border border-slate-800/80 hover:border-slate-700 hover:bg-[#0c1222]/70"
        }`}
      >
        <span
          className={`absolute left-3.5 flex items-center transition-colors pointer-events-none ${
            focused ? "text-emerald-400" : "text-slate-500"
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
          className="w-full bg-transparent text-white text-sm py-3.5 pl-11 pr-16 outline-none placeholder:text-slate-500 tracking-normal font-sans"
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
        <p className="text-red-400 text-xs mt-0.5 flex items-center gap-1 font-medium font-sans">
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
      {/* ── Option 3: Modern Tech Dot-Grid + Spotlight Beam Background ── */}
      <TechSpotlightBackground />

      {/* ── Top High-Tech Status Pill ── */}
      <div
        className={`relative z-10 mb-6 flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#070b16]/80 border border-emerald-500/30 backdrop-blur-xl shadow-[0_0_20px_rgba(16,185,129,0.18)] transition-all duration-500 ${
          mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
        }`}
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
        <span className="font-mono text-[11px] font-semibold text-emerald-300 tracking-wider uppercase">
          SECURE_AUTH // MARWADI UNIVERSITY GATEWAY
        </span>
      </div>

      {/* ── Main Tech Spotlight Glass Card ── */}
      <div
        className={`relative z-10 w-full max-w-[440px] rounded-2xl p-6 sm:p-8 backdrop-blur-2xl transition-all duration-700 shadow-2xl ${
          mounted ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-6"
        }`}
        style={{
          background: "linear-gradient(180deg, rgba(11, 17, 30, 0.82) 0%, rgba(5, 8, 16, 0.94) 100%)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.9), 0 0 45px -10px rgba(16, 185, 129, 0.15)",
        }}
      >
        {/* Top Edge Laser Accent Line */}
        <div className="absolute top-0 inset-x-8 h-[1px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_#10b981]" />

        {/* Subtle Tech Corner Accents */}
        <div className="absolute top-3 left-3 text-[9px] font-mono text-emerald-500/30 select-none">+</div>
        <div className="absolute top-3 right-3 text-[9px] font-mono text-emerald-500/30 select-none">+</div>
        <div className="absolute bottom-3 left-3 text-[9px] font-mono text-emerald-500/30 select-none">+</div>
        <div className="absolute bottom-3 right-3 text-[9px] font-mono text-emerald-500/30 select-none">+</div>

        {/* ── Brand Header ── */}
        <div className="text-center mb-7 relative z-10">
          <div className="inline-flex items-center justify-center w-13 h-13 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-[0_0_25px_rgba(16,185,129,0.35)] mb-3.5 ring-1 ring-emerald-400/40 p-3">
            <Cpu size={26} className="text-white" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Uni<span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">Verse</span>
          </h1>

          <p className="text-xs text-slate-400 mt-1.5 font-mono tracking-wide">
            CAMPUS COMMERCE &amp; STUDENT NETWORK
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
          <TechField
            id="email"
            type="email"
            label="STUDENT EMAIL"
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
                    className="text-slate-400 hover:text-white transition-colors p-1"
                    title="Clear email"
                  >
                    <X size={14} />
                  </button>
                )}
                {emailValid && (
                  <span title="Valid MU Email">
                    <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                  </span>
                )}
              </>
            }
          />

          {/* Password Field */}
          <TechField
            id="password"
            type={showPw ? "text" : "password"}
            label="PASSWORD"
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
                  className="font-mono text-[10.5px] font-semibold text-emerald-400 hover:underline"
                >
                  CLEAR
                </button>
              ) : null
            }
            rightNode={
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="text-slate-400 hover:text-white transition-colors p-1"
                title={showPw ? "Hide password" : "Show password"}
              >
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            }
          />

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-slate-400 select-none group">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="w-4 h-4 rounded border-slate-700 bg-black/50 text-emerald-500 focus:ring-emerald-400 focus:ring-offset-0 cursor-pointer accent-emerald-500"
              />
              <span className="group-hover:text-slate-200 transition-colors font-sans">Remember me</span>
            </label>

            <Link
              href={ROUTES.FORGOT_PASSWORD}
              className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors hover:underline text-xs"
            >
              Forgot password?
            </Link>
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={loading || isSuccess}
            className="w-full mt-2 py-3.5 px-4 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-400 bg-[length:200%_auto] hover:bg-right transition-all duration-300 shadow-[0_0_25px_rgba(16,185,129,0.35)] hover:shadow-[0_0_35px_rgba(16,185,129,0.55)] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 text-sm tracking-wide cursor-pointer"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
                <span>AUTHENTICATING...</span>
              </>
            ) : isSuccess ? (
              <>
                <CheckCircle2 size={17} className="text-slate-950" />
                <span>ACCESS GRANTED</span>
              </>
            ) : (
              <>
                <span>Sign In to UniVerse</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-1">
            <div className="flex-1 h-px bg-white/10" />
            <span className="font-mono text-[10px] text-slate-500 uppercase tracking-widest font-semibold">
              OR CONTINUE WITH
            </span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Google Sign In */}
          <button
            type="button"
            onClick={handleGoogle}
            disabled={loading || isSuccess}
            className="w-full py-3 px-4 rounded-xl font-medium text-slate-200 bg-[#070b16]/70 hover:bg-[#0b1122] border border-slate-800 hover:border-slate-700 transition-all duration-200 flex items-center justify-center gap-3 text-xs tracking-wide active:scale-[0.99] cursor-pointer"
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
            <span>Student Google Account</span>
          </button>
        </form>

        {/* ── Sign Up Link ── */}
        <div className="text-center mt-6 pt-5 border-t border-white/[0.08]">
          <p className="text-xs text-slate-400">
            Don&apos;t have an account?{" "}
            <Link
              href={ROUTES.REGISTER}
              className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors hover:underline ml-1"
            >
              Create student account &rarr;
            </Link>
          </p>
        </div>
      </div>

      {/* ── Bottom Campus Verified Trust Footer ── */}
      <div
        className={`relative z-10 mt-6 flex flex-wrap items-center justify-center gap-3 sm:gap-6 font-mono text-[10.5px] text-slate-500 transition-all duration-700 ${
          mounted ? "opacity-100" : "opacity-0"
        }`}
      >
        <span className="flex items-center gap-1.5 hover:text-slate-400 transition-colors">
          <ShieldCheck size={13} className="text-emerald-400" />
          <span>[ 256-BIT SSL ]</span>
        </span>
        <span className="text-slate-800 hidden sm:inline">•</span>
        <span className="flex items-center gap-1.5 hover:text-slate-400 transition-colors">
          <Zap size={13} className="text-teal-400" />
          <span>[ MARWADI ID VERIFIED ]</span>
        </span>
        <span className="text-slate-800 hidden sm:inline">•</span>
        <span className="flex items-center gap-1.5 hover:text-slate-400 transition-colors">
          <Terminal size={13} className="text-cyan-400" />
          <span>[ ZERO BROKERAGE ]</span>
        </span>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full min-h-screen bg-[#04060d] flex items-center justify-center text-emerald-400">
          <span className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
