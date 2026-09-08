"use client";

import { useState, useEffect, Suspense, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { ROUTES } from "@/constants/routes";
import CyberpunkTerminalBackground from "@/components/auth/CyberpunkTerminalBackground";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Terminal,
  ShieldCheck,
  Zap,
  X,
  Sparkles,
  CornerDownLeft,
} from "lucide-react";

// ─── Option 4: Cyberpunk Hacker Terminal Input Field ──────────────────────────
function CyberpunkField({
  id,
  type,
  promptPrefix,
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
  promptPrefix: string;
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
    <div className="flex flex-col gap-1.5 w-full font-mono">
      {/* Terminal Command Header */}
      <div className="flex items-center justify-between text-xs min-h-[18px]">
        <label
          htmlFor={id}
          className="text-[11px] font-medium tracking-wide text-emerald-400/90 flex items-center gap-1.5"
        >
          <span className="text-emerald-500 font-bold">{promptPrefix}</span>
          <span className="text-slate-400">[{label}]</span>
        </label>
        {headerRight}
      </div>

      {/* Input Frame with Cyberpunk Neon Glow */}
      <div
        className={`relative flex items-center w-full rounded-lg transition-all duration-200 overflow-hidden ${
          error
            ? "bg-red-950/20 border border-red-500/70 shadow-[0_0_18px_rgba(239,68,68,0.3)] ring-1 ring-red-500/40"
            : focused
            ? "bg-[#050b14] border border-emerald-400 shadow-[0_0_24px_rgba(16,185,129,0.35)] ring-1 ring-emerald-400/50"
            : "bg-[#040810]/85 border border-emerald-950/70 hover:border-emerald-700/60 hover:bg-[#060e1a]/90"
        }`}
      >
        {/* Subtle Cyber Corner Brackets */}
        <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-emerald-400/60 pointer-events-none" />
        <div className="absolute top-0 right-0 w-1.5 h-1.5 border-t border-r border-emerald-400/60 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-1.5 h-1.5 border-b border-l border-emerald-400/60 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-emerald-400/60 pointer-events-none" />

        <span
          className={`absolute left-3.5 flex items-center transition-colors pointer-events-none ${
            focused ? "text-emerald-400" : "text-emerald-600/70"
          }`}
        >
          {leftIcon}
        </span>

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
          className="w-full bg-transparent text-emerald-300 text-xs sm:text-sm py-3 pl-10 pr-14 outline-none placeholder:text-slate-600 font-mono tracking-tight"
        />

        {rightNode && (
          <div className="absolute right-3 flex items-center gap-1.5">
            {rightNode}
          </div>
        )}
      </div>

      {warningNode && (
        <p className="text-amber-400 text-xs mt-0.5 flex items-center gap-1 font-mono font-medium animate-pulse">
          <span>{warningNode}</span>
        </p>
      )}

      {error && (
        <p className="text-red-400 text-xs mt-0.5 flex items-center gap-1 font-mono font-medium">
          <AlertCircle size={13} />
          <span>[ERR_AUTH] {error}</span>
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

  // Live Terminal Log Ticker messages
  const [logIndex, setLogIndex] = useState(0);
  const terminalLogs = [
    "[SYS_INIT] UniVerse Secure Gateway v4.2.0 initialized",
    "[NET_CHECK] Host verified: marwadiuniversity.ac.in",
    "[ENCRYPT] TLS 1.3 // 256-bit AES cipher active",
    "[AUTH_DAEMON] Awaiting student authentication key...",
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setLogIndex((prev) => (prev + 1) % terminalLogs.length);
    }, 3200);
    return () => clearInterval(timer);
  }, [terminalLogs.length]);

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
            ? "[ACCESS_DENIED] Incorrect email or password. Verify credentials."
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
      }, 600);
    } catch (err: any) {
      setLoading(false);
      setErrors({ form: err?.message || "[FATAL] Failed to sign in. Please retry." });
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
    email.length >= 2 &&
    !email.includes("@marwadiuniversity.ac.in") &&
    !email.includes("@");

  return (
    <div className="w-full min-h-[100dvh] flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans">
      {/* ── Option 4: Cyberpunk Hacker Terminal Background ── */}
      <CyberpunkTerminalBackground />

      {/* ── Top Terminal Session Indicator Pill ── */}
      <div
        className={`relative z-10 mb-4 flex items-center gap-2.5 px-4 py-1 rounded-md bg-[#040810]/90 border border-emerald-500/40 backdrop-blur-xl shadow-[0_0_20px_rgba(16,185,129,0.22)] font-mono transition-all duration-500 ${
          mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
        }`}
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
        <span className="text-[11px] font-semibold text-emerald-300 tracking-widest uppercase">
          MU_TERMINAL_GATEWAY // PORT_443: OPEN
        </span>
      </div>

      {/* ── Main Hacker Terminal Window Card ── */}
      <div
        className={`relative z-10 w-full max-w-[450px] rounded-xl backdrop-blur-2xl transition-all duration-700 shadow-2xl overflow-hidden ${
          mounted ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-6"
        }`}
        style={{
          background: "linear-gradient(180deg, rgba(6, 12, 22, 0.95) 0%, rgba(3, 6, 12, 0.98) 100%)",
          border: "1px solid rgba(16, 185, 129, 0.28)",
          boxShadow: "0 25px 70px -15px rgba(0, 0, 0, 0.95), 0 0 50px -10px rgba(16, 185, 129, 0.22)",
        }}
      >
        {/* ── Terminal Window Bar (Mac / Linux Console Titlebar) ── */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#02050a] border-b border-emerald-950/80 font-mono text-[11px] text-emerald-400/80 select-none">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 shadow-[0_0_6px_rgba(239,68,68,0.5)] inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 shadow-[0_0_6px_rgba(245,158,11,0.5)] inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 shadow-[0_0_6px_rgba(16,185,129,0.5)] inline-block" />
            <span className="ml-2 text-slate-400 font-semibold tracking-wide">
              root@universe-auth:~#
            </span>
          </div>

          <div className="flex items-center gap-2 text-[10px] text-emerald-500/70">
            <Terminal size={12} className="text-emerald-400" />
            <span className="hidden sm:inline">BASH</span>
          </div>
        </div>

        {/* ── Terminal Live Status Log Ticker ── */}
        <div className="px-4 py-2 bg-[#03070f]/90 border-b border-emerald-950/60 font-mono text-[10.5px] text-emerald-400/90 flex items-center justify-between overflow-hidden">
          <div className="flex items-center gap-2 truncate">
            <span className="text-emerald-500 font-bold">&gt;</span>
            <span className="truncate">{terminalLogs[logIndex]}</span>
            <span className="inline-block w-1.5 h-3 bg-emerald-400 animate-pulse" />
          </div>
          <span className="text-[9px] text-emerald-600 shrink-0 font-bold ml-2">LIVE</span>
        </div>

        {/* Card Body */}
        <div className="p-6 sm:p-7">
          {/* ── Brand Header ── */}
          <div className="text-center mb-6 relative z-10">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-emerald-950/80 border border-emerald-500/50 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)] mb-3 p-2.5">
              <Terminal size={24} className="text-emerald-400" />
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-mono">
              Uni<span className="text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.5)]">Verse</span>
              <span className="text-xs text-emerald-500 font-normal ml-1.5">[OS_4.2]</span>
            </h1>

            <p className="text-[11px] text-emerald-500/70 mt-1 font-mono tracking-wider">
              MARWADI UNIVERSITY CAMPUS GATEWAY
            </p>
          </div>

          {/* ── Form ── */}
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4 relative z-10 font-mono">
            {errors.form && (
              <div className="p-3 rounded-lg bg-red-950/40 border border-red-500/60 text-red-300 text-xs font-mono flex items-center gap-2">
                <AlertCircle size={15} className="shrink-0 text-red-400" />
                <span>{errors.form}</span>
              </div>
            )}

            {/* Email Field with Autocomplete Helper */}
            <div>
              <CyberpunkField
                id="email"
                type="email"
                promptPrefix="student_id:~$ "
                label="EMAIL"
                placeholder="avinash.128203@marwadiuniversity.ac.in"
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                }}
                error={errors.email}
                leftIcon={<Mail size={15} />}
                rightNode={
                  <>
                    {email.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setEmail("")}
                        className="text-slate-500 hover:text-emerald-400 transition-colors p-1"
                        title="Clear email"
                      >
                        <X size={13} />
                      </button>
                    )}
                    {emailValid && (
                      <span title="Verified Marwadi University ID">
                        <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
                      </span>
                    )}
                  </>
                }
              />

              {/* Smart 1-Tap Autocomplete Chip styled like a terminal TAB complete */}
              {showDomainAutocomplete && (
                <div className="mt-1.5 flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleAutocompleteDomain}
                    className="px-2.5 py-1 rounded bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-500/50 text-[10.5px] font-mono text-emerald-300 hover:text-emerald-100 transition-all flex items-center gap-1.5 shadow-[0_0_12px_rgba(16,185,129,0.2)] cursor-pointer group/chip"
                  >
                    <Sparkles size={11} className="text-emerald-400 group-hover/chip:rotate-12 transition-transform" />
                    <span>
                      [TAB ⇥] Complete: <strong className="text-emerald-200">@marwadiuniversity.ac.in</strong>
                    </span>
                  </button>
                </div>
              )}
            </div>

            {/* Password Field */}
            <CyberpunkField
              inputRef={passwordInputRef}
              id="password"
              type={showPw ? "text" : "password"}
              promptPrefix="auth_key:~$ "
              label="PASSWORD"
              placeholder="••••••••••••"
              autoComplete="current-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
              }}
              onKeyDown={handleKeyActivity}
              onKeyUp={handleKeyActivity}
              error={errors.password}
              warningNode={capsLockOn ? "[WARN] ⇪ CAPS_LOCK_ACTIVE" : undefined}
              leftIcon={<Lock size={15} />}
              headerRight={
                password.length > 0 ? (
                  <button
                    type="button"
                    onClick={() => {
                      setPassword("");
                      if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                      passwordInputRef.current?.focus();
                    }}
                    className="font-mono text-[10px] font-semibold text-emerald-400 hover:underline"
                  >
                    [CLEAR]
                  </button>
                ) : null
              }
              rightNode={
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="text-slate-500 hover:text-emerald-400 transition-colors p-1"
                  title={showPw ? "Hide cipher" : "Show cipher"}
                >
                  {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              }
            />

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-xs pt-1 font-mono">
              <label className="flex items-center gap-2 cursor-pointer text-slate-400 select-none group/rem">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-emerald-900 bg-black/60 text-emerald-500 focus:ring-emerald-400 focus:ring-offset-0 cursor-pointer accent-emerald-500"
                />
                <span className="group-hover/rem:text-emerald-300 transition-colors text-[11px]">
                  PERSIST_SESSION
                </span>
              </label>

              <Link
                href={ROUTES.FORGOT_PASSWORD}
                className="text-emerald-400 hover:text-emerald-300 transition-colors hover:underline text-[11px]"
              >
                [RECOVER_KEY.SH]
              </Link>
            </div>

            {/* Execute Button */}
            <button
              type="submit"
              disabled={loading || isSuccess}
              className="w-full mt-2 py-3.5 px-4 rounded-lg font-mono font-bold text-slate-950 bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 hover:brightness-110 transition-all duration-300 shadow-[0_0_25px_rgba(16,185,129,0.4)] hover:shadow-[0_0_35px_rgba(16,185,129,0.6)] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 text-xs sm:text-sm tracking-wider cursor-pointer relative overflow-hidden uppercase group/btn"
            >
              {/* Scanline shine animation */}
              <div className="absolute top-0 inset-x-0 h-[1px] bg-white/40" />

              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
                  <span>&gt; VERIFYING HASH...</span>
                </>
              ) : isSuccess ? (
                <>
                  <CheckCircle2 size={16} className="text-slate-950" />
                  <span>&gt; ACCESS GRANTED</span>
                </>
              ) : (
                <>
                  <span>[ EXECUTE LOGIN ]</span>
                  <CornerDownLeft size={14} className="group-hover/btn:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 my-1">
              <div className="flex-1 h-px bg-emerald-950" />
              <span className="font-mono text-[9px] text-emerald-600 uppercase tracking-widest font-semibold">
                // ALTERNATE_HANDSHAKE
              </span>
              <div className="flex-1 h-px bg-emerald-950" />
            </div>

            {/* Google Sign In */}
            <button
              type="button"
              onClick={handleGoogle}
              disabled={loading || isSuccess}
              className="w-full py-2.5 px-4 rounded-lg font-mono text-emerald-300 bg-[#040914] hover:bg-[#071124] border border-emerald-900/60 hover:border-emerald-700/80 transition-all duration-200 flex items-center justify-center gap-2.5 text-xs tracking-wide active:scale-[0.99] cursor-pointer"
            >
              <svg width="15" height="15" viewBox="0 0 24 24">
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
              <span>[ AUTH VIA GOOGLE WORKSPACE ]</span>
            </button>
          </form>

          {/* ── Sign Up Link ── */}
          <div className="text-center mt-5 pt-4 border-t border-emerald-950/70 font-mono">
            <p className="text-[11px] text-slate-400">
              NEW STUDENT?{" "}
              <Link
                href={ROUTES.REGISTER}
                className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors hover:underline ml-1"
              >
                [ ./REGISTER_ID.SH ] &rarr;
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* ── Bottom Terminal Security Badges ── */}
      <div
        className={`relative z-10 mt-5 flex flex-wrap items-center justify-center gap-3 sm:gap-6 font-mono text-[10px] text-emerald-600 transition-all duration-700 ${
          mounted ? "opacity-100" : "opacity-0"
        }`}
      >
        <span className="flex items-center gap-1.5 hover:text-emerald-400 transition-colors">
          <ShieldCheck size={12} className="text-emerald-400" />
          <span>[ 256-BIT_ENCRYPTION ]</span>
        </span>
        <span className="text-emerald-900 hidden sm:inline">•</span>
        <span className="flex items-center gap-1.5 hover:text-emerald-400 transition-colors">
          <Zap size={12} className="text-teal-400" />
          <span>[ MARWADI_NET_VERIFIED ]</span>
        </span>
        <span className="text-emerald-900 hidden sm:inline">•</span>
        <span className="flex items-center gap-1.5 hover:text-emerald-400 transition-colors">
          <Terminal size={12} className="text-cyan-400" />
          <span>[ STATUS: 200_OK ]</span>
        </span>
      </div>

      {/* ── Fast Revert Info Pill ── */}
      <div className="relative z-10 mt-4 text-center">
        <span className="font-mono text-[9.5px] text-slate-500/80 bg-black/60 px-3 py-1 rounded-full border border-slate-800/80">
          ⚡ Option 4 (Hacker Terminal) Active &bull; Say &quot;reverse&quot; in chat to instantly restore previous design
        </span>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full min-h-screen bg-[#020509] flex items-center justify-center text-emerald-400 font-mono">
          <span className="w-7 h-7 border-2 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
