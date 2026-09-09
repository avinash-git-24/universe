"use client";

import { useState, useEffect, Suspense, useRef } from "react";
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
  Zap,
  X,
  Sparkles,
  Layers,
} from "lucide-react";

// ─── Refined Modern Tech Input Field ─────────────────────────────────────────
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
  inputRef,
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
  inputRef?: React.Ref<HTMLInputElement>;
}) {
  const [focused, setFocused] = useState(false);

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <div className="flex items-center justify-between text-xs min-h-[18px]">
        <label
          htmlFor={id}
          className="text-[11px] font-semibold tracking-wider text-slate-300 uppercase flex items-center gap-1.5 font-sans"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
          <span>{label}</span>
        </label>
        {headerRight}
      </div>

      <div
        className={`relative flex items-center w-full rounded-xl transition-all duration-200 overflow-hidden ${
          error
            ? "bg-red-950/25 border border-red-500/60 shadow-[0_0_18px_rgba(239,68,68,0.25)]"
            : focused
            ? "bg-black/60 border border-emerald-400 shadow-[0_0_24px_rgba(16,185,129,0.35),inset_0_0_12px_rgba(16,185,129,0.08)] ring-1 ring-emerald-400/40 backdrop-blur-md"
            : "bg-black/35 border border-white/[0.10] hover:border-white/[0.22] hover:bg-black/45 backdrop-blur-sm"
        }`}
      >
        <span
          className={`absolute left-3.5 flex items-center transition-colors pointer-events-none z-10 ${
            focused ? "text-emerald-400" : "text-slate-400"
          }`}
        >
          {leftIcon}
        </span>

        {/* Generous right padding (pr-16) ensures complete email visibility with zero overlap */}
        <input
          ref={inputRef}
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
          className="tech-input w-full bg-transparent text-white text-[13.5px] py-3.5 pl-10 pr-16 outline-none placeholder:text-slate-500 tracking-normal font-sans relative z-10 font-normal"
        />

        {rightNode && (
          <div className="absolute right-3 flex items-center gap-1.5 z-10">
            {rightNode}
          </div>
        )}
      </div>

      {warningNode && (
        <p className="text-amber-400 text-xs mt-0.5 flex items-center gap-1 font-medium animate-pulse font-sans">
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
  const passwordInputRef = useRef<HTMLInputElement>(null);

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

  // 1-Click autocomplete for Marwadi domain
  function handleAutocompleteDomain() {
    let base = email.trim();
    if (base.includes("@")) {
      base = base.split("@")[0];
    }
    const full = `${base}@marwadiuniversity.ac.in`;
    setEmail(full);
    if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
    passwordInputRef.current?.focus();
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
    if (!normalizedEmail) errs.email = "Student email is required.";
    else if (!validateEmail(normalizedEmail)) {
      errs.email = "Must be a @marwadiuniversity.ac.in email address.";
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
            ? "Incorrect email or password. Please check your credentials."
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
  const showDomainAutocomplete =
    email.trim().length >= 2 &&
    !emailValid &&
    (!email.includes("@") ||
      email.endsWith("@") ||
      email.endsWith("@m") ||
      email.endsWith("@marwadi") ||
      email.endsWith("@marwadiuniversity"));

  return (
    <div className="w-full min-h-[100dvh] flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans">
      {/* ── Modern Tech Dot-Grid + Softened Cinematic Spotlight ── */}
      <TechSpotlightBackground />

      {/* ── Top University Gateway Status Pill ── */}
      <div
        className={`relative z-10 mb-6 flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#060914]/90 border border-emerald-500/35 backdrop-blur-xl shadow-[0_0_25px_rgba(16,185,129,0.2)] transition-all duration-500 ${
          mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
        }`}
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
        <span className="text-[10.5px] font-semibold text-emerald-300 tracking-[0.14em] uppercase font-sans">
          Marwadi University &bull; Secure Gateway
        </span>
      </div>

      {/* ── Main Tech Spotlight Frosted Glass Card Wrapper with 3D Ambient Aura ── */}
      <div className="relative w-full max-w-[440px] group">
        {/* Ambient Back Glow */}
        <div className="absolute -inset-1.5 rounded-3xl bg-gradient-to-b from-emerald-500/20 via-teal-500/10 to-transparent blur-2xl opacity-75 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none -z-10" />

        {/* Main Card */}
        <div
          className={`relative z-10 w-full rounded-2xl p-6 sm:p-8 backdrop-blur-2xl transition-all duration-700 shadow-2xl overflow-hidden ${
            mounted ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-6"
          }`}
          style={{
            background: "linear-gradient(180deg, rgba(8, 14, 28, 0.65) 0%, rgba(4, 7, 16, 0.8) 100%)",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            boxShadow: "0 30px 80px -15px rgba(0, 0, 0, 0.95), inset 0 1px 0 rgba(255, 255, 255, 0.15)",
          }}
        >
          {/* Razor-thin Top Edge Laser Accent Line */}
          <div className="absolute top-0 inset-x-8 h-[1.5px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent pointer-events-none" />

          {/* Soft Ambient Inner Highlight */}
          <div className="absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-white/[0.04] to-transparent pointer-events-none rounded-t-2xl" />

          {/* ── Brand Header with Glowing UniVerse Orbital Emblem ── */}
          <div className="text-center mb-6 relative z-10">
            <div className="relative inline-flex items-center justify-center mb-3">
              <div className="absolute -inset-2 rounded-2xl bg-emerald-500/30 blur-md animate-pulse pointer-events-none" />
              <div className="relative inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 via-teal-500 to-emerald-600 text-white shadow-[0_0_25px_rgba(16,185,129,0.45)] ring-1 ring-white/30 p-2.5 group-hover:scale-105 transition-transform duration-300">
                {/* Custom UniVerse Interconnected Student Orbit Monogram */}
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 28 28"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.4)]"
                >
                  <path
                    d="M7 6V14C7 17.866 10.134 21 14 21C17.866 21 21 17.866 21 14V6"
                    stroke="currentColor"
                    strokeWidth="2.8"
                    strokeLinecap="round"
                  />
                  <circle cx="14" cy="14" r="2.4" fill="white" />
                  <circle cx="21" cy="7" r="1.6" fill="#A7F3D0" />
                  <path
                    d="M5 14C5 9.02944 9.02944 5 14 5"
                    stroke="#6EE7B7"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeDasharray="2 3"
                  />
                </svg>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight font-sans">
              <span className="text-white">Uni</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
                Verse
              </span>
            </h1>

            <p className="text-[10px] sm:text-[10.5px] font-semibold text-slate-400 mt-1.5 tracking-[0.2em] uppercase font-sans">
              Campus Commerce &bull; Student Network
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

            {/* Student Email Field */}
            <div>
              <TechField
                id="email"
                type="email"
                label="Student Email"
                placeholder="you@marwadiuniversity.ac.in"
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                }}
                error={errors.email}
                leftIcon={<Mail size={16} />}
                rightNode={
                  <div className="flex items-center gap-1.5">
                    {email.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setEmail("")}
                        className="w-5 h-5 rounded-full bg-white/[0.08] hover:bg-white/[0.18] flex items-center justify-center text-slate-400 hover:text-white transition-all cursor-pointer"
                        title="Clear email"
                      >
                        <X size={12} />
                      </button>
                    )}
                    {emailValid && (
                      <span title="Verified Marwadi University ID" className="flex items-center">
                        <CheckCircle2 size={16} className="text-emerald-400 drop-shadow-[0_0_6px_rgba(52,211,153,0.6)]" />
                      </span>
                    )}
                  </div>
                }
              />

              {/* Smart 1-Tap Autocomplete Chip */}
              {showDomainAutocomplete && (
                <div className="mt-2 flex items-center justify-between animate-in fade-in slide-in-from-top-1 duration-200">
                  <button
                    type="button"
                    onClick={handleAutocompleteDomain}
                    className="px-2.5 py-1 rounded-md bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/50 hover:border-emerald-400 text-[11px] font-medium text-emerald-300 hover:text-white transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.25)] group/chip cursor-pointer"
                  >
                    <Sparkles size={11} className="text-emerald-400 group-hover/chip:rotate-12 transition-transform" />
                    <span>
                      1-Tap Add: <strong className="text-emerald-200 underline decoration-emerald-500/50">@marwadiuniversity.ac.in</strong>
                    </span>
                  </button>
                  <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">Tap to fill</span>
                </div>
              )}
            </div>

            {/* Password Field */}
            <TechField
              inputRef={passwordInputRef}
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
                      passwordInputRef.current?.focus();
                    }}
                    className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
                  >
                    CLEAR
                  </button>
                ) : null
              }
              rightNode={
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="w-6 h-6 rounded-md hover:bg-white/[0.08] flex items-center justify-center text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer"
                  title={showPw ? "Hide password" : "Show password"}
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              }
            />

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-300 select-none group/rem">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-700 bg-black/60 text-emerald-500 focus:ring-emerald-400 focus:ring-offset-0 cursor-pointer accent-emerald-500"
                />
                <span className="group-hover/rem:text-white transition-colors font-medium">Remember me</span>
              </label>

              <Link
                href={ROUTES.FORGOT_PASSWORD}
                className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors hover:underline text-xs"
              >
                Forgot password?
              </Link>
            </div>

            {/* ── Next-Gen Ultra-Premium Luminous Sign In Button ── */}
            <button
              type="submit"
              disabled={loading || isSuccess}
              className="w-full mt-2 py-3.5 px-5 rounded-xl font-bold text-[#022c22] bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 hover:brightness-105 transition-all duration-300 shadow-[0_0_28px_rgba(52,211,153,0.38)] hover:shadow-[0_0_42px_rgba(52,211,153,0.6)] active:scale-[0.985] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2.5 text-[13.5px] tracking-wide cursor-pointer relative overflow-hidden group/btn"
            >
              {/* Top Razor Shine Line */}
              <div className="absolute top-0 inset-x-0 h-[1px] bg-white/50 pointer-events-none" />

              {/* Diagonal Shimmer Sweep on Hover */}
              <div className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />

              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-[#022c22]/30 border-t-[#022c22] rounded-full animate-spin" />
                  <span>Authenticating Student ID...</span>
                </>
              ) : isSuccess ? (
                <>
                  <CheckCircle2 size={17} className="text-[#022c22]" />
                  <span>Access Granted</span>
                </>
              ) : (
                <>
                  <span>Sign In to UniVerse</span>
                  <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform stroke-[2.5]" />
                </>
              )}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 my-1">
              <div className="flex-1 h-px bg-white/[0.08]" />
              <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold font-sans">
                OR
              </span>
              <div className="flex-1 h-px bg-white/[0.08]" />
            </div>

            {/* Google Sign In with Glassmorphism */}
            <button
              type="button"
              onClick={handleGoogle}
              disabled={loading || isSuccess}
              className="w-full py-3 px-4 rounded-xl font-medium text-slate-200 bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.10] hover:border-emerald-500/40 hover:shadow-[0_0_20px_rgba(16,185,129,0.16)] backdrop-blur-sm transition-all duration-200 flex items-center justify-center gap-3 text-xs tracking-wide active:scale-[0.99] cursor-pointer"
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
              <span>Continue with Student Google ID</span>
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
      </div>

      {/* ── Bottom Campus Verified Trust Badges (Refined Glass Micro-Pills) ── */}
      <div
        className={`relative z-10 mt-7 flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 transition-all duration-700 ${
          mounted ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08] backdrop-blur-md hover:border-emerald-500/30 transition-colors">
          <ShieldCheck size={13} className="text-emerald-400" />
          <span className="text-[11px] font-medium text-slate-300">256-Bit SSL Encrypted</span>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08] backdrop-blur-md hover:border-emerald-500/30 transition-colors">
          <Zap size={13} className="text-teal-400" />
          <span className="text-[11px] font-medium text-slate-300">Marwadi ID Verified</span>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08] backdrop-blur-md hover:border-emerald-500/30 transition-colors">
          <Layers size={13} className="text-cyan-400" />
          <span className="text-[11px] font-medium text-slate-300">Hostel Delivery &amp; Resale</span>
        </div>
      </div>

      {/* ── Browser Autofill CSS Override ── */}
      <style jsx global>{`
        .tech-input:-webkit-autofill,
        .tech-input:-webkit-autofill:hover,
        .tech-input:-webkit-autofill:focus,
        .tech-input:-webkit-autofill:active {
          transition: background-color 5000s ease-in-out 0s;
          -webkit-text-fill-color: #ffffff !important;
          caret-color: #34d399 !important;
        }
      `}</style>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full min-h-screen bg-[#03050c] flex items-center justify-center text-emerald-400">
          <span className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
