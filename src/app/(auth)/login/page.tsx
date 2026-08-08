"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { ROUTES } from "@/constants/routes";

// ─── Static Space Background ──────────────────────────────────────────────────
function Bg() {
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", zIndex: 0 }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 100% 70% at 50% 100%, #071A0C 0%, #050D07 40%, #030604 100%)" }} />
      <div style={{ position: "absolute", top: "-5%", right: "-5%", width: "50%", height: "55%", background: "radial-gradient(ellipse at 65% 25%, rgba(0,200,100,0.18) 0%, rgba(0,100,50,0.07) 45%, transparent 70%)", filter: "blur(50px)" }} />
      <div style={{ position: "absolute", top: "5%", left: "-8%", width: "35%", height: "45%", background: "radial-gradient(ellipse at 40% 50%, rgba(0,80,40,0.08) 0%, transparent 70%)", filter: "blur(60px)" }} />
      <div style={{ position: "absolute", bottom: "-8%", left: "50%", transform: "translateX(-50%)", width: "140%", height: "50%", background: "radial-gradient(ellipse 65% 55% at 50% 100%, rgba(0,200,90,0.65) 0%, rgba(0,120,50,0.35) 30%, rgba(0,60,20,0.1) 60%, transparent 80%)", filter: "blur(6px)" }} />
      <div style={{ position: "absolute", bottom: "-22%", left: "50%", transform: "translateX(-50%)", width: "120%", paddingBottom: "120%", borderRadius: "50%", background: "radial-gradient(ellipse 75% 75% at 50% 75%, #071A0C 20%, #040D06 60%, transparent 100%)", boxShadow: "0 -10px 60px 5px rgba(0,200,80,0.25)" }} />
      <div style={{ position: "absolute", bottom: "3%", left: "50%", transform: "translateX(-50%)", width: "85%", height: "6%", background: "linear-gradient(90deg, transparent 5%, rgba(255,210,80,0.05) 20%, rgba(255,230,100,0.09) 40%, rgba(255,210,80,0.05) 55%, rgba(255,230,100,0.08) 70%, transparent 90%)", filter: "blur(3px)" }} />
      {/* Orbital arcs */}
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "visible" }} viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
        <ellipse cx="720" cy="900" rx="680" ry="680" fill="none" stroke="rgba(0,200,80,0.1)" strokeWidth="1" />
        <ellipse cx="720" cy="900" rx="820" ry="400" fill="none" stroke="rgba(0,180,70,0.07)" strokeWidth="1" strokeDasharray="10 8" />
        <ellipse cx="720" cy="900" rx="960" ry="960" fill="none" stroke="rgba(0,160,60,0.05)" strokeWidth="1" />
      </svg>
      {/* Stars */}
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} viewBox="0 0 1440 900">
        <circle cx="95" cy="72" r="1.5" fill="white" opacity="0.75" />
        <circle cx="310" cy="38" r="1" fill="white" opacity="0.55" />
        <circle cx="750" cy="28" r="1.5" fill="white" opacity="0.65" />
        <circle cx="1090" cy="55" r="1" fill="white" opacity="0.5" />
        <circle cx="1310" cy="95" r="1.5" fill="white" opacity="0.7" />
        <circle cx="44" cy="185" r="1" fill="white" opacity="0.45" />
        <circle cx="210" cy="148" r="1.5" fill="white" opacity="0.65" />
        <circle cx="960" cy="82" r="1" fill="white" opacity="0.55" />
        <circle cx="1180" cy="195" r="1.5" fill="white" opacity="0.6" />
        <circle cx="1395" cy="285" r="1" fill="white" opacity="0.4" />
        <circle cx="55" cy="330" r="1" fill="white" opacity="0.45" />
        <circle cx="1370" cy="165" r="1.5" fill="white" opacity="0.55" />
        <circle cx="415" cy="92" r="1" fill="white" opacity="0.4" />
        <circle cx="848" cy="48" r="1" fill="white" opacity="0.65" />
        <circle cx="1035" cy="140" r="1.5" fill="white" opacity="0.5" />
        <circle cx="655" cy="68" r="1" fill="white" opacity="0.55" />
        <circle cx="172" cy="265" r="1" fill="white" opacity="0.4" />
        <circle cx="1250" cy="130" r="1" fill="white" opacity="0.45" />
        <circle cx="1140" cy="45" r="1.8" fill="rgba(100,255,150,0.85)" opacity="0.85" />
        <circle cx="1285" cy="82" r="1.2" fill="rgba(120,255,160,0.7)" opacity="0.7" />
        <circle cx="1040" cy="25" r="2" fill="rgba(140,255,170,0.75)" opacity="0.75" />
      </svg>
      {/* Sparkles */}
      <svg style={{ position: "absolute", top: "14%", right: "17%", width: 18, height: 18 }} viewBox="0 0 20 20"><path d="M10 0 L11.5 8.5 L20 10 L11.5 11.5 L10 20 L8.5 11.5 L0 10 L8.5 8.5 Z" fill="rgba(100,255,150,0.65)" /></svg>
      <svg style={{ position: "absolute", top: "27%", left: "19%", width: 11, height: 11 }} viewBox="0 0 20 20"><path d="M10 0 L11.5 8.5 L20 10 L11.5 11.5 L10 20 L8.5 11.5 L0 10 L8.5 8.5 Z" fill="rgba(80,220,120,0.45)" /></svg>
      <svg style={{ position: "absolute", bottom: "28%", right: "11%", width: 15, height: 15 }} viewBox="0 0 20 20"><path d="M10 0 L11.5 8.5 L20 10 L11.5 11.5 L10 20 L8.5 11.5 L0 10 L8.5 8.5 Z" fill="rgba(100,255,150,0.45)" /></svg>
      {/* Floating icons */}
      <svg style={{ position: "absolute", left: "8%", top: "41%", opacity: 0.38 }} width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(0,230,100,0.8)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" />
      </svg>
      <svg style={{ position: "absolute", left: "9%", top: "62%", opacity: 0.38 }} width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(0,230,100,0.8)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" /><path d="m3.5 11.5 1 4.5 4.5 1" /><path d="M20.5 3.5s-4-.5-6.5 1.5l-7 6 4 4 6-7c2-2.5 1.5-6.5 1.5-6.5z" /><circle cx="15" cy="9" r="1" fill="rgba(0,230,100,0.8)" />
      </svg>
      <svg style={{ position: "absolute", right: "8%", top: "47%", opacity: 0.42 }} width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="rgba(0,230,100,0.8)" strokeWidth="1.5">
        <circle cx="12" cy="12" r="5" /><ellipse cx="12" cy="12" rx="11" ry="4.2" />
      </svg>
    </div>
  );
}

// ─── Sparkle Icon ─────────────────────────────────────────────────────────────
function Sparkle({ size = 14, opacity = 0.8 }: { size?: number; opacity?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" style={{ opacity, flexShrink: 0, display: "inline-block" }}>
      <path d="M10 0 L11.5 8.5 L20 10 L11.5 11.5 L10 20 L8.5 11.5 L0 10 L8.5 8.5 Z" fill="#00E676" />
    </svg>
  );
}

// ─── Custom Input Field ───────────────────────────────────────────────────────
function Field({
  id, type, label, placeholder, autoComplete, value, onChange,
  leftIcon, rightNode, error,
}: {
  id: string; type: string; label: string; placeholder: string;
  autoComplete?: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  leftIcon: React.ReactNode; rightNode?: React.ReactNode; error?: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label htmlFor={id} style={{ fontSize: 13, fontWeight: 500, color: "#E8F0EB", letterSpacing: "-0.01em" }}>
        {label}
      </label>
      <div style={{
        position: "relative", display: "flex", alignItems: "center",
        background: "rgba(3,8,5,0.92)",
        border: `1.5px solid ${error ? "rgba(239,68,68,0.6)" : focused ? "rgba(0,230,118,0.55)" : "rgba(0,230,118,0.18)"}`,
        borderRadius: 13,
        boxShadow: focused ? "0 0 0 3px rgba(0,230,118,0.08)" : "none",
        transition: "border-color 0.15s, box-shadow 0.15s",
      }}>
        <span style={{ position: "absolute", left: 16, display: "flex", alignItems: "center", color: "rgba(0,230,118,0.75)", pointerEvents: "none" }}>
          {leftIcon}
        </span>
        <input
          id={id} type={type} placeholder={placeholder} autoComplete={autoComplete}
          value={value} onChange={onChange}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          style={{
            width: "100%", background: "transparent", border: "none", outline: "none",
            color: "#fff", fontSize: 14, padding: "14px 44px",
            letterSpacing: type === "password" ? "0.12em" : "normal",
            fontFamily: "inherit",
          }}
        />
        {rightNode && (
          <span style={{ position: "absolute", right: 14, display: "flex", alignItems: "center" }}>
            {rightNode}
          </span>
        )}
      </div>
      {error && <span style={{ fontSize: 12, color: "#fca5a5" }}>{error}</span>}
    </div>
  );
}

function validateEmail(e: string) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e); }

// ─── Login Form ───────────────────────────────────────────────────────────────
function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({});

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs: typeof errors = {};
    if (!email) errs.email = "Email is required.";
    else if (!validateEmail(email)) errs.email = "Enter a valid email.";
    if (!password) errs.password = "Password is required.";
    else if (password.length < 6) errs.password = "Min 6 characters.";
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({}); setLoading(true);
    const { error } = await createClient().auth.signInWithPassword({ email, password });
    if (error) {
      setLoading(false);
      setErrors({ form: error.message.toLowerCase().includes("invalid") ? "Incorrect email or password." : error.message });
      return;
    }
    router.push(searchParams.get("redirectTo") ?? ROUTES.DASHBOARD);
    router.refresh();
  }

  async function handleGoogle() {
    await createClient().auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: { prompt: "select_account", hd: "marwadiuniversity.ac.in" },
      },
    });
  }

  const emailValid = validateEmail(email);

  return (
    <div style={{
      minHeight: "100dvh", background: "#070A08",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: "48px 16px", position: "relative",
      fontFamily: "'Inter', system-ui, sans-serif", overflow: "hidden",
    }}>
      <Bg />

      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 460, display: "flex", flexDirection: "column", alignItems: "center" }}>

        {/* ── Logo + tagline ── */}
        <Link href="/" style={{ textDecoration: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: 10, marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 42, height: 42, borderRadius: 11, background: "linear-gradient(145deg, #00E676 0%, #00A854 100%)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 20px rgba(0,230,118,0.45)", flexShrink: 0 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </div>
            <span style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-0.03em", color: "#fff", lineHeight: 1 }}>
              Uni<span style={{ color: "#00E676", textShadow: "0 0 24px rgba(0,230,118,0.5)" }}>Verse</span>
            </span>
          </div>
          <span style={{ fontSize: 13, color: "rgba(167,184,176,0.75)", letterSpacing: "0.01em" }}>One Universe. Infinite Possibilities.</span>
        </Link>

        {/* ── Glass Card ── */}
        <div style={{
          width: "100%",
          background: "rgba(8,15,11,0.82)",
          border: "1px solid rgba(0,230,118,0.18)",
          borderRadius: 26,
          backdropFilter: "blur(28px)",
          WebkitBackdropFilter: "blur(28px)",
          boxShadow: "0 0 0 1px rgba(0,230,118,0.05), 0 0 50px rgba(0,230,118,0.1), 0 32px 80px rgba(0,0,0,0.75)",
          overflow: "hidden", position: "relative",
        }}>
          {/* Top gradient line */}
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent 5%, rgba(0,230,118,0.45) 40%, rgba(0,230,118,0.45) 60%, transparent 95%)" }} />

          {/* ── Card Header ── */}
          <div style={{ padding: "32px 32px 24px", position: "relative" }}>
            {/* Welcome Back! pill */}
            <div style={{ position: "absolute", top: 28, right: 28, display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 999, background: "rgba(0,230,118,0.1)", border: "1px solid rgba(0,230,118,0.22)" }}>
              <Sparkle size={9} />
              <span style={{ fontSize: 12, fontWeight: 600, color: "#00E676", letterSpacing: "-0.01em" }}>Welcome Back!</span>
            </div>
            <div style={{ marginBottom: 10 }}><Sparkle size={11} opacity={0.55} /></div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: "#fff", letterSpacing: "-0.03em", lineHeight: 1.1 }}>Welcome Back</h1>
              <Sparkle size={14} opacity={0.65} />
            </div>
            <p style={{ margin: 0, fontSize: 14, color: "rgba(167,184,176,0.85)", letterSpacing: "-0.01em" }}>Sign in to continue your journey in UniVerse</p>
          </div>

          {/* ── Form ── */}
          <form onSubmit={handleSubmit} noValidate style={{ padding: "0 32px 32px", display: "flex", flexDirection: "column", gap: 20 }}>
            {errors.form && (
              <div style={{ padding: "12px 16px", borderRadius: 12, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#fca5a5", fontSize: 14 }}>
                {errors.form}
              </div>
            )}

            {/* Email */}
            <Field
              id="email" type="email" label="Email"
              placeholder="avinash.128203@marwadiuniversity.ac.in"
              autoComplete="email" value={email}
              onChange={e => setEmail(e.target.value)}
              error={errors.email}
              leftIcon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>}
              rightNode={emailValid ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00E676" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              ) : undefined}
            />

            {/* Password */}
            <Field
              id="password" type={showPw ? "text" : "password"} label="Password"
              placeholder="••••••••••" autoComplete="current-password"
              value={password} onChange={e => setPassword(e.target.value)}
              error={errors.password}
              leftIcon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>}
              rightNode={
                <button type="button" onClick={() => setShowPw(v => !v)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", padding: 0, color: "rgba(167,184,176,0.65)" }}>
                  {showPw
                    ? <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                    : <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                  }
                </button>
              }
            />

            {/* Remember me + Forgot password */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <label style={{ display: "flex", alignItems: "center", gap: 9, cursor: "pointer", userSelect: "none" }}>
                <span onClick={() => setRemember(v => !v)} style={{ width: 18, height: 18, borderRadius: 5, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", background: remember ? "#00E676" : "rgba(5,10,7,0.9)", border: `1.5px solid ${remember ? "#00E676" : "rgba(0,230,118,0.3)"}`, transition: "all 0.15s" }}>
                  {remember && <svg viewBox="0 0 10 8" width="10" height="8" fill="none"><path d="M1 4l2.5 2.5L9 1" stroke="black" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                </span>
                <span style={{ fontSize: 14, color: "rgba(167,184,176,0.9)" }}>Remember me</span>
              </label>
              <Link href={ROUTES.FORGOT_PASSWORD} style={{ fontSize: 14, color: "#00E676", textDecoration: "none", fontWeight: 500 }}>
                Forgot password?
              </Link>
            </div>

            {/* Sign In Button */}
            <button
              type="submit" disabled={loading}
              style={{
                width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                background: loading ? "rgba(0,140,60,0.5)" : "linear-gradient(90deg, #00C853 0%, #00E676 50%, #69F0AE 100%)",
                color: loading ? "rgba(255,255,255,0.5)" : "#000",
                fontWeight: 700, fontSize: 16, letterSpacing: "-0.01em",
                border: "none", borderRadius: 13, padding: "15px 24px",
                cursor: loading ? "not-allowed" : "pointer",
                boxShadow: loading ? "none" : "0 0 28px rgba(0,230,118,0.4), 0 4px 20px rgba(0,0,0,0.5)",
                transition: "all 0.2s", fontFamily: "inherit",
              }}
            >
              {loading
                ? <><span style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.8s linear infinite" }} /> Signing in…</>
                : <><span>Sign In</span><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg></>
              }
            </button>

            {/* OR Divider */}
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.07)" }} />
              <span style={{ fontSize: 12, color: "rgba(167,184,176,0.45)", fontWeight: 500, letterSpacing: "0.05em" }}>OR</span>
              <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.07)" }} />
            </div>

            {/* Google Button */}
            <button
              type="button" onClick={handleGoogle}
              style={{
                width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
                background: "rgba(8,16,11,0.85)", border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 13, padding: "14px 24px", color: "#fff",
                fontWeight: 600, fontSize: 15, cursor: "pointer",
                transition: "all 0.2s", fontFamily: "inherit", letterSpacing: "-0.01em",
              }}
            >
              <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Continue with Google
            </button>

            {/* Sign up link */}
            <p style={{ margin: 0, textAlign: "center", fontSize: 14, color: "rgba(167,184,176,0.65)" }}>
              Don&apos;t have an account?{" "}
              <Link href={ROUTES.REGISTER} style={{ color: "#00E676", fontWeight: 600, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 2 }}>
                Create account
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginTop: 1 }}><polyline points="9 18 15 12 9 6" /></svg>
              </Link>
            </p>
          </form>
        </div>

        {/* ── Trust bar ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 20, marginTop: 28, flexWrap: "wrap", opacity: 0.5 }}>
          {[
            { label: "256-bit Encrypted", icon: <svg key="shield" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#00E676" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg> },
            { label: "Your Data is Private", icon: <svg key="lock" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#00E676" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg> },
            { label: "Trusted by Students", icon: <svg key="users" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#00E676" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg> },
          ].map((item, i, arr) => (
            <span key={item.label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
              {item.icon}
              <span style={{ fontSize: 12, color: "#A7B8B0" }}>{item.label}</span>
              {i < arr.length - 1 && <span style={{ color: "#A7B8B0", marginLeft: 20 }}>•</span>}
            </span>
          ))}
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100dvh", background: "#070A08", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 24, height: 24, border: "2px solid rgba(0,230,118,0.3)", borderTopColor: "#00E676", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
