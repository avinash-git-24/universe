"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { ROUTES } from "@/constants/routes";
import BlackHoleBackground from "@/components/auth/BlackHoleBackground";

// ─── Custom Sci-Fi Input Field ────────────────────────────────────────────────
function Field({
  id, type, label, placeholder, autoComplete, value, onChange,
  leftIcon, rightNode, error, warningNode, onKeyDown, onKeyUp,
  headerRight,
}: {
  id: string; type: string; label: string; placeholder: string;
  autoComplete?: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  leftIcon: React.ReactNode; rightNode?: React.ReactNode; error?: string;
  warningNode?: React.ReactNode;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onKeyUp?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  headerRight?: React.ReactNode;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", minHeight: 18 }}>
        <label
          htmlFor={id}
          style={{
            fontSize: 10.5,
            fontFamily: "'Space Mono', monospace",
            letterSpacing: "2px",
            color: "rgba(255, 255, 255, 0.65)",
            textTransform: "uppercase",
          }}
        >
          {label}
        </label>
        {headerRight}
      </div>
      <div style={{
        position: "relative", display: "flex", alignItems: "center",
        background: "rgba(0, 0, 0, 0.35)",
        border: `1px solid ${error ? "rgba(255, 68, 68, 0.6)" : focused ? "#00d2ff" : "rgba(255, 255, 255, 0.15)"}`,
        borderRadius: 6,
        boxShadow: focused
          ? "0 0 15px rgba(0, 210, 255, 0.25), inset 0 0 10px rgba(0, 210, 255, 0.1)"
          : error
          ? "0 0 15px rgba(255, 68, 68, 0.2)"
          : "none",
        transition: "all 0.25s ease",
      }}>
        <span style={{ position: "absolute", left: 14, display: "flex", alignItems: "center", color: focused ? "#00d2ff" : "rgba(255, 255, 255, 0.45)", pointerEvents: "none", transition: "color 0.2s" }}>
          {leftIcon}
        </span>
        <input
          className="scifi-input"
          id={id} type={type} placeholder={placeholder} autoComplete={autoComplete}
          value={value} onChange={onChange}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          onKeyDown={onKeyDown} onKeyUp={onKeyUp}
          style={{
            width: "100%", background: "transparent", border: "none", outline: "none",
            color: "#fff", fontSize: 14.5, 
            paddingTop: 14, paddingBottom: 14,
            paddingLeft: 42,
            paddingRight: rightNode ? 86 : 16,
            letterSpacing: type === "password" ? "0.15em" : "normal",
            fontFamily: "'Inter', sans-serif",
            caretColor: "#00d2ff",
          }}
        />
        {rightNode && (
          <span style={{ position: "absolute", right: 12, display: "flex", alignItems: "center", gap: 6 }}>
            {rightNode}
          </span>
        )}
      </div>
      {error && (
        <span style={{ fontSize: 11, color: "#ff6b6b", fontFamily: "'Space Mono', monospace", letterSpacing: "0.5px" }}>
          {error}
        </span>
      )}
      {warningNode && !error && (
        <span style={{ fontSize: 11, color: "#fbbf24", fontFamily: "'Space Mono', monospace", letterSpacing: "0.5px" }}>
          {warningNode}
        </span>
      )}
    </div>
  );
}

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

// ─── Login Form ───────────────────────────────────────────────────────────────
function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isWarping, setIsWarping] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [shake, setShake] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);
  const [btnText, setBtnText] = useState("Sign In");
  const urlError = searchParams.get("error");
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>(() =>
    urlError ? { form: urlError } : {}
  );

  // Mount animation + Remembered Email Loader + Dashboard Prefetch
  useEffect(() => {
    router.prefetch(ROUTES.DASHBOARD);
    const t = setTimeout(() => setMounted(true), 60);
    try {
      const savedEmail = localStorage.getItem("universe_remembered_email");
      if (savedEmail) {
        setEmail(savedEmail);
        setRemember(true);
      }
    } catch {
      // ignore
    }
    return () => clearTimeout(t);
  }, [router]);

  // Caps Lock Keyboard Event Handler
  const handleKeyActivity = (e: React.KeyboardEvent<HTMLInputElement>) => {
    setCapsLockOn(e.getModifierState("CapsLock"));
  };

  async function triggerWarpAndRedirect(destinationUrl: string) {
    setIsWarping(true);
    setBtnText("REDIRECTING...");

    // Immediate instant client-side push
    router.push(destinationUrl);

    // Rapid fallback if client router push takes more than 300ms
    setTimeout(() => {
      window.location.href = destinationUrl;
    }, 300);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isWarping) return;
    const normalizedEmail = sanitizeEmail(email);
    const errs: typeof errors = {};
    if (!normalizedEmail) errs.email = "Email is required.";
    else if (!validateEmail(normalizedEmail)) errs.email = "Only @marwadiuniversity.ac.in emails are allowed.";
    if (!password) errs.password = "Password is required.";
    else if (password.length < 6) errs.password = "Min 6 characters.";
    
    if (Object.keys(errs).length) {
      setErrors(errs);
      setShake(true);
      setTimeout(() => setShake(false), 600);
      return;
    }
    
    setErrors({});
    setLoading(true);

    const { error } = await createClient().auth.signInWithPassword({ email: normalizedEmail, password });
    if (error) {
      setLoading(false);
      setErrors({ form: error.message.toLowerCase().includes("invalid") ? "Incorrect email or password." : error.message });
      setShake(true);
      setTimeout(() => setShake(false), 600);
      return;
    }

    // Save or clear Remember Me in localStorage
    try {
      if (remember) {
        localStorage.setItem("universe_remembered_email", normalizedEmail);
      } else {
        localStorage.removeItem("universe_remembered_email");
      }
    } catch {
      // ignore
    }

    const redirectTarget = searchParams.get("redirectTo") ?? ROUTES.DASHBOARD;
    triggerWarpAndRedirect(redirectTarget);
  }

  async function handleGoogle() {
    if (isWarping) return;
    setIsWarping(true);
    setTimeout(async () => {
      await createClient().auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?redirectTo=/dashboard`,
          queryParams: { prompt: "select_account", hd: "marwadiuniversity.ac.in" },
        },
      });
    }, 400);
  }

  const emailValid = validateEmail(email);

  return (
    <div style={{
      width: "100%", minHeight: "100dvh",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      fontFamily: "'Inter', sans-serif", padding: "20px 14px",
      position: "relative", overflow: "hidden",
    }}>
      {/* ── 3D WebGL Gargantua Black Hole Background ── */}
      <BlackHoleBackground isWarping={isWarping} />

      {/* ── Futuristic HUD Elements ── */}
      <div className="hud-tl" style={{ position: "absolute", top: 28, left: 32, fontFamily: "'Space Mono', monospace", fontSize: 10, letterSpacing: "2px", color: "rgba(255,255,255,0.6)", pointerEvents: "none", zIndex: 2, opacity: isWarping ? 0 : mounted ? 1 : 0, transition: "opacity 0.4s ease" }}>
        <div style={{ position: "absolute", top: -6, left: -6, width: 10, height: 10, borderLeft: "1px solid rgba(0, 210, 255, 0.6)", borderTop: "1px solid rgba(0, 210, 255, 0.6)" }} />
        <strong style={{ color: "#fff" }}>EVENT HORIZON</strong><br />
        <span style={{ color: "#00d2ff" }}>GRAVITY: STABILIZED</span>
      </div>

      <div className="hud-tr" style={{ position: "absolute", top: 28, right: 32, textAlign: "right", fontFamily: "'Space Mono', monospace", fontSize: 10, letterSpacing: "2px", color: "rgba(255,255,255,0.6)", pointerEvents: "none", zIndex: 2, opacity: isWarping ? 0 : mounted ? 1 : 0, transition: "opacity 0.4s ease" }}>
        <div style={{ position: "absolute", top: -6, right: -6, width: 10, height: 10, borderRight: "1px solid rgba(0, 210, 255, 0.6)", borderTop: "1px solid rgba(0, 210, 255, 0.6)" }} />
        <strong style={{ color: "#fff" }}>SYSTEM STATUS</strong><br />
        <span style={{ color: "#00d2ff" }}>ONLINE // NOMINAL</span>
      </div>

      {/* ── Main Container ── */}
      <div
        className={shake ? "animate-shake" : ""}
        style={{
          position: "relative", zIndex: 5, width: "100%", maxWidth: 450,
          display: "flex", flexDirection: "column", alignItems: "center",
          transform: isWarping ? "scale(0) rotate(-10deg)" : mounted ? "translateY(0) scale(1)" : "translateY(36px) scale(0.92)",
          opacity: isWarping ? 0 : mounted ? 1 : 0,
          filter: isWarping ? "blur(10px)" : mounted ? "blur(0px)" : "blur(12px)",
          transition: isWarping
            ? "all 0.18s cubic-bezier(0.7, 0, 0.84, 0)"
            : "all 1.2s cubic-bezier(0.16, 1, 0.3, 1)",
          pointerEvents: isWarping ? "none" : "auto",
        }}
      >
        
        {/* ── Logo + Tagline ── */}
        <Link href="/" style={{ textDecoration: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: "linear-gradient(135deg, #00d2ff 0%, #0077ff 100%)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 20px rgba(0, 210, 255, 0.4)", flexShrink: 0 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="black" stroke="black" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </div>
            <span style={{ fontSize: 26, fontWeight: 700, letterSpacing: "2px", color: "#fff", lineHeight: 1 }}>
              UniVerse
            </span>
          </div>
          <span style={{ fontSize: 9.5, color: "rgba(255,255,255,0.6)", letterSpacing: "3px", fontWeight: 400, fontFamily: "'Space Mono', monospace", textTransform: "uppercase" }}>
            One Universe. Infinite Possibilities.
          </span>
        </Link>

        {/* ── Semi-Transparent Sci-Fi Glass Card ── */}
        <div style={{
          width: "100%",
          background: "rgba(12, 14, 20, 0.35)",
          backdropFilter: "blur(25px) saturate(140%)",
          WebkitBackdropFilter: "blur(25px) saturate(140%)",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          borderRadius: 12,
          boxShadow: "0 40px 100px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.15)",
          padding: "clamp(20px, 5vw, 36px)",
          display: "flex",
          flexDirection: "column",
          gap: 20,
          position: "relative",
        }}>
          {/* Top subtle highlight */}
          <div style={{ position: "absolute", top: 0, left: "10%", right: "10%", height: 1, background: "linear-gradient(90deg, transparent, rgba(0, 210, 255, 0.6), transparent)" }} />

          {/* ── Card Header ── */}
          <div style={{ textAlign: "center" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 4 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L13.5 9.5L21 11L13.5 12.5L12 20L10.5 12.5L3 11L10.5 9.5L12 2Z" fill="#00d2ff" />
              </svg>
              <h1 style={{ margin: 0, fontSize: 22, fontWeight: 600, letterSpacing: "3px", color: "#fff", textTransform: "uppercase" }}>
                Sign in
              </h1>
            </div>
            <p style={{ margin: "4px 0 0", fontSize: 11, color: "rgba(255, 255, 255, 0.5)", fontFamily: "'Space Mono', monospace", letterSpacing: "1px" }}>
              Continue your journey in UniVerse
            </p>
          </div>

          {/* ── Form ── */}
          <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {errors.form && (
              <div style={{ padding: "10px 14px", borderRadius: 6, background: "rgba(255, 68, 68, 0.12)", border: "1px solid rgba(255, 68, 68, 0.4)", color: "#ff8b8b", fontSize: 12.5, fontFamily: "'Space Mono', monospace", letterSpacing: "0.5px" }}>
                {errors.form}
              </div>
            )}

            {/* Email Field with Quick Clear Button */}
            <Field
              id="email" type="email" label="Email"
              placeholder="avinash.128203@marwadiuniversity.ac.in"
              autoComplete="email" value={email}
              onChange={e => {
                setEmail(e.target.value);
                if (errors.email) setErrors(prev => ({ ...prev, email: undefined }));
              }}
              error={errors.email}
              leftIcon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>}
              rightNode={
                <>
                  {email.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setEmail("")}
                      style={{ background: "none", border: "none", cursor: "pointer", display: "flex", padding: 0, color: "rgba(255, 255, 255, 0.35)", transition: "color 0.15s" }}
                      onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
                      onMouseLeave={e => (e.currentTarget.style.color = "rgba(255, 255, 255, 0.35)")}
                      title="Clear email"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                    </button>
                  )}
                  {emailValid && (
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#00d2ff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                  )}
                </>
              }
            />

            {/* Password Field with Clear Button, Caps Lock Detector & Eye Toggle */}
            <Field
              id="password" type={showPw ? "text" : "password"} label="Password"
              placeholder="Enter password" autoComplete="current-password"
              value={password} onChange={e => {
                setPassword(e.target.value);
                if (errors.password) setErrors(prev => ({ ...prev, password: undefined }));
              }}
              onKeyDown={handleKeyActivity}
              onKeyUp={handleKeyActivity}
              error={errors.password}
              warningNode={capsLockOn ? "⇪ Caps Lock is ON" : undefined}
              headerRight={
                password.length > 0 ? (
                  <button
                    type="button"
                    onClick={() => {
                      setPassword("");
                      if (errors.password) setErrors(prev => ({ ...prev, password: undefined }));
                      const el = document.getElementById("password");
                      if (el) el.focus();
                    }}
                    style={{
                      background: "none", border: "none", cursor: "pointer",
                      fontSize: 10, fontFamily: "'Space Mono', monospace",
                      color: "#00d2ff", letterSpacing: "1px", textTransform: "uppercase",
                      display: "flex", alignItems: "center", gap: 3,
                      opacity: 0.85, transition: "opacity 0.15s", padding: 0,
                    }}
                    className="hover:opacity-100"
                    title="Clear password to type a new password"
                  >
                    <span>✕ Clear / New Password</span>
                  </button>
                ) : undefined
              }
              leftIcon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>}
              rightNode={
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  {password.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setPassword("");
                        if (errors.password) setErrors(prev => ({ ...prev, password: undefined }));
                        const el = document.getElementById("password");
                        if (el) el.focus();
                      }}
                      style={{
                        background: "rgba(255, 255, 255, 0.08)",
                        border: "1px solid rgba(255, 255, 255, 0.2)",
                        borderRadius: 4,
                        padding: "2px 6px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 3,
                        color: "rgba(255, 255, 255, 0.75)",
                        fontSize: 9.5,
                        fontFamily: "'Space Mono', monospace",
                        letterSpacing: "0.5px",
                        transition: "all 0.15s ease",
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.color = "#00d2ff";
                        e.currentTarget.style.borderColor = "#00d2ff";
                        e.currentTarget.style.background = "rgba(0, 210, 255, 0.15)";
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.color = "rgba(255, 255, 255, 0.75)";
                        e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.2)";
                        e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
                      }}
                      title="Clear password / Enter new password"
                    >
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                      <span>CLEAR</span>
                    </button>
                  )}

                  <button 
                    type="button" 
                    onClick={() => setShowPw(v => !v)} 
                    style={{ 
                      background: "none", border: "none", cursor: "pointer", 
                      display: "flex", alignItems: "center", padding: 2, 
                      color: showPw ? "#00d2ff" : "rgba(255, 255, 255, 0.45)",
                      transition: "color 0.15s",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.color = "#00d2ff")}
                    onMouseLeave={e => (e.currentTarget.style.color = showPw ? "#00d2ff" : "rgba(255, 255, 255, 0.45)")}
                    title={showPw ? "Hide password" : "Show password"}
                  >
                    {showPw
                      ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                      : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                    }
                  </button>
                </div>
              }
            />

            {/* Remember me + Forgot password */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginTop: 2 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", userSelect: "none" }}>
                <span
                  onClick={() => setRemember(v => !v)}
                  style={{
                    width: 15, height: 15, borderRadius: 3, flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer",
                    background: remember ? "#00d2ff" : "rgba(0, 0, 0, 0.4)",
                    border: `1px solid ${remember ? "#00d2ff" : "rgba(255, 255, 255, 0.3)"}`,
                    transition: "all 0.15s",
                  }}
                >
                  {remember && <svg viewBox="0 0 10 8" width="8" height="7" fill="none"><path d="M1 4l2.5 2.5L9 1" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                </span>
                <span style={{ fontSize: 11.5, color: "rgba(255, 255, 255, 0.7)", fontFamily: "'Space Mono', monospace", letterSpacing: "1px" }}>
                  Remember me
                </span>
              </label>
              <Link href={ROUTES.FORGOT_PASSWORD} style={{ fontSize: 11.5, color: "#00d2ff", textDecoration: "none", fontFamily: "'Space Mono', monospace", letterSpacing: "1px" }}>
                Forgot password?
              </Link>
            </div>

            {/* Futuristic Sign In Button with Shimmer Sweep */}
            <button
              className="scifi-btn group overflow-hidden relative"
              type="submit" disabled={loading || isWarping}
              style={{
                width: "100%", marginTop: 6,
                padding: "14px 20px",
                background: isWarping ? "rgba(0, 210, 255, 0.2)" : loading ? "rgba(0, 210, 255, 0.1)" : "transparent",
                border: isWarping ? "1px solid #00d2ff" : "1px solid rgba(255, 255, 255, 0.25)",
                borderRadius: 4,
                color: isWarping ? "#00d2ff" : "#fff",
                fontFamily: "'Space Mono', monospace",
                letterSpacing: "4px",
                fontSize: 13,
                fontWeight: 700,
                textTransform: "uppercase",
                cursor: (loading || isWarping) ? "not-allowed" : "pointer",
                boxShadow: isWarping ? "0 0 25px rgba(0, 210, 255, 0.4)" : "none",
                transition: "all 0.3s ease",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}
            >
              {/* Subtle Interactive Shimmer Sweep */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  transform: "translateX(-100%)",
                  transition: "transform 0.8s ease",
                  background: "linear-gradient(90deg, transparent, rgba(0, 210, 255, 0.2), transparent)",
                  pointerEvents: "none",
                }}
                className="group-hover:translate-x-full"
              />

              {isWarping ? (
                <span>{btnText}</span>
              ) : loading ? (
                <><span>AUTHENTICATING…</span></>
              ) : (
                <><span>Sign In</span><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg></>
              )}
            </button>

            {/* OR Divider */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "2px 0" }}>
              <div style={{ flex: 1, height: 1, background: "rgba(255, 255, 255, 0.1)" }} />
              <span style={{ fontSize: 10, color: "rgba(255, 255, 255, 0.4)", fontFamily: "'Space Mono', monospace", letterSpacing: "3px" }}>OR</span>
              <div style={{ flex: 1, height: 1, background: "rgba(255, 255, 255, 0.1)" }} />
            </div>

            {/* Google Button */}
            <button
              className="scifi-google-btn"
              type="button" onClick={handleGoogle}
              style={{
                width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                background: "rgba(0, 0, 0, 0.3)", border: "1px solid rgba(255, 255, 255, 0.15)",
                borderRadius: 4, padding: "12px 18px", color: "#fff",
                fontSize: 12, fontFamily: "'Space Mono', monospace", letterSpacing: "1px",
                cursor: "pointer", transition: "all 0.3s ease",
              }}
            >
              <svg viewBox="0 0 24 24" width="16" height="16" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Continue with Google
            </button>

            {/* Sign up link */}
            <p style={{ margin: "2px 0 0", textAlign: "center", fontSize: 11.5, color: "rgba(255, 255, 255, 0.5)", fontFamily: "'Space Mono', monospace", letterSpacing: "1px" }}>
              Don&apos;t have an account?{" "}
              <Link href={ROUTES.REGISTER} style={{ color: "#00d2ff", fontWeight: 700, textDecoration: "none" }}>
                Create account &gt;
              </Link>
            </p>
          </form>

          {/* Secure status indicator */}
          <div style={{ textAlign: "center", fontSize: 9.5, fontFamily: "'Space Mono', monospace", letterSpacing: "2px", color: "rgba(255, 255, 255, 0.4)", marginTop: 2 }}>
            SECURE CONNECTION ESTABLISHED
            <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 6 }}>
              <span style={{ display: "block", width: 14, height: 2, background: "rgba(255, 255, 255, 0.2)" }} />
              <span style={{ display: "block", width: 14, height: 2, background: "rgba(0, 210, 255, 0.8)" }} />
              <span style={{ display: "block", width: 14, height: 2, background: "rgba(255, 255, 255, 0.2)" }} />
            </div>
          </div>
        </div>

        {/* ── Trust Bar ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, marginTop: 18, flexWrap: "wrap", opacity: 0.75, fontFamily: "'Space Mono', monospace", fontSize: 10, letterSpacing: "1px", color: "rgba(255, 255, 255, 0.6)" }}>
          <span>256-BIT ENCRYPTED</span>
          <span>•</span>
          <span>YOUR DATA IS PRIVATE</span>
          <span>•</span>
          <span>TRUSTED BY STUDENTS</span>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;700&family=Space+Mono:wght@400;700&display=swap');
        
        .scifi-btn:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.1) !important;
          border-color: rgba(255, 255, 255, 0.6) !important;
          box-shadow: 0 0 20px rgba(0, 210, 255, 0.2) !important;
        }
        .scifi-google-btn:hover {
          background: rgba(255, 255, 255, 0.08) !important;
          border-color: rgba(0, 210, 255, 0.4) !important;
        }
        .scifi-input,
        .scifi-input:focus,
        input[type="password"],
        input[type="email"],
        input[type="text"] {
          caret-color: #00d2ff !important;
        }
        .scifi-input::selection {
          background: rgba(0, 210, 255, 0.4) !important;
          color: #ffffff !important;
        }
        .scifi-input::placeholder {
          color: rgba(255, 255, 255, 0.25) !important;
          font-size: 13.5px !important;
        }
        .scifi-input:-webkit-autofill,
        .scifi-input:-webkit-autofill:hover, 
        .scifi-input:-webkit-autofill:focus, 
        .scifi-input:-webkit-autofill:active {
          transition: background-color 5000s ease-in-out 0s;
          -webkit-text-fill-color: #fff !important;
        }
        @media (max-width: 640px) {
          .hud-tl, .hud-tr { display: none !important; }
        }
      `}</style>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100dvh", background: "#000002", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 24, height: 24, border: "2px solid rgba(0, 210, 255, 0.3)", borderTopColor: "#00d2ff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
