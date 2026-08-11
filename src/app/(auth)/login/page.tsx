"use client";

import { useState, Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { ROUTES } from "@/constants/routes";

// ─── Unused functions removed ───



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
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <label htmlFor={id} style={{ fontSize: 13, fontWeight: 500, color: "#E8F0EB", letterSpacing: "-0.01em" }}>
        {label}
      </label>
      <div style={{
        position: "relative", display: "flex", alignItems: "center",
        background: "rgba(0,0,0,0.45)",
        border: `1px solid ${error ? "rgba(239,68,68,0.5)" : focused ? "rgba(0,230,118,0.5)" : "rgba(0,230,118,0.25)"}`,
        borderRadius: 14,
        boxShadow: focused ? "0 0 0 1px rgba(0,230,118,0.3), 0 0 16px rgba(0,230,118,0.15)" : "none",
        transition: "all 0.2s ease-in-out",
      }}>
        <span style={{ position: "absolute", left: 16, display: "flex", alignItems: "center", color: "rgba(0,230,118,0.9)", pointerEvents: "none" }}>
          {leftIcon}
        </span>
        <input
          className="dark-input"
          id={id} type={type} placeholder={placeholder} autoComplete={autoComplete}
          value={value} onChange={onChange}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          style={{
            width: "100%", background: "transparent", border: "none", outline: "none",
            color: "#fff", fontSize: 15, padding: "16px 44px",
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

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      document.documentElement.style.setProperty("--mx", x.toString());
      document.documentElement.style.setProperty("--my", y.toString());
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);
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
      width: "100%",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      {/* 2.5D Parallax Background Wrapper */}
      <div className="parallax-bg-wrapper" style={{
        position: "fixed", inset: 0, zIndex: -1, overflow: "hidden", background: "#050A08"
      }}>
        {/* Layer 1: Distant Background (moves very slowly) */}
        <div className="parallax-layer layer-1" style={{
          position: "absolute", inset: "-5%", background: "url('/login-bg.jpg')",
          backgroundSize: "cover", backgroundPosition: "center center", backgroundRepeat: "no-repeat",
        }} />

        {/* Layer 2: Subtle Nebula Overlay (moves slightly faster) */}
        <div className="parallax-layer layer-2" style={{
          position: "absolute", inset: "-10%",
          background: "radial-gradient(ellipse at center, rgba(0,230,118,0.15) 0%, transparent 60%)",
          mixBlendMode: "screen",
        }} />

        {/* Layer 3: Foreground Twinkling Stars (moves fastest) */}
        <div className="parallax-layer layer-3" style={{
          position: "absolute", inset: "-15%",
          backgroundImage: "radial-gradient(1.5px 1.5px at 40px 60px, rgba(255,255,255,0.8) 100%, transparent), radial-gradient(2px 2px at 120px 200px, rgba(0,230,118,0.6) 100%, transparent), radial-gradient(1.5px 1.5px at 300px 90px, rgba(255,255,255,0.5) 100%, transparent), radial-gradient(2px 2px at 400px 300px, rgba(255,255,255,0.9) 100%, transparent), radial-gradient(1.5px 1.5px at 50px 350px, rgba(0,230,118,0.4) 100%, transparent), radial-gradient(1.5px 1.5px at 250px 450px, rgba(255,255,255,0.7) 100%, transparent)",
          backgroundRepeat: "repeat", backgroundSize: "500px 500px",
          mixBlendMode: "screen", opacity: 0.8,
        }} />
      </div>

      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 480, display: "flex", flexDirection: "column", alignItems: "center" }}>

        {/* ── Logo + tagline ── */}
        <Link href="/" style={{ textDecoration: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: 10, marginBottom: 40 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: "linear-gradient(135deg, #00E676 0%, #00B74A 100%)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 20px rgba(0,230,118,0.45)", flexShrink: 0 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="black" stroke="black" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </div>
            <span style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-0.02em", color: "#fff", lineHeight: 1 }}>
              UniVerse
            </span>
          </div>
          <span style={{ fontSize: 13, color: "rgba(167,184,176,0.85)", letterSpacing: "0.03em", fontWeight: 500, textTransform: "uppercase" }}>
            One Universe. Infinite Possibilities.
          </span>
        </Link>

        {/* ── Glass Card ── */}
        <div style={{
          width: "100%",
          background: "rgba(5,11,8,0.75)",
          border: "1px solid rgba(0,230,118,0.2)",
          borderRadius: 28,
          backdropFilter: "blur(28px)",
          WebkitBackdropFilter: "blur(28px)",
          boxShadow: "0 0 0 1px rgba(0,230,118,0.15), 0 0 60px rgba(0,230,118,0.12), 0 32px 80px rgba(0,0,0,0.95)",
          overflow: "hidden", position: "relative",
        }}>
          {/* Top gradient line */}
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent 5%, rgba(0,230,118,0.6) 40%, rgba(0,230,118,0.6) 60%, transparent 95%)" }} />

          {/* ── Card Header ── */}
          <div style={{ padding: "40px 40px 32px", position: "relative" }}>
            <div style={{ marginBottom: 12 }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 2L11 8L17 9L11 10L10 16L9 10L3 9L9 8L10 2Z" fill="#00E676" />
                <path d="M19 12L19.5 14.5L22 15L19.5 15.5L19 18L18.5 15.5L16 15L18.5 14.5L19 12Z" fill="#00E676" />
                <path d="M6 18L6.5 19.5L8 20L6.5 20.5L6 22L5.5 20.5L4 20L5.5 19.5L6 18Z" fill="#00E676" />
              </svg>
            </div>
            <h1 style={{ margin: "0 0 8px 0", fontSize: 32, fontWeight: 700, color: "#fff", letterSpacing: "-0.02em" }}>
              Sign in
            </h1>
            <p style={{ margin: 0, fontSize: 15, color: "rgba(167,184,176,0.9)", letterSpacing: "-0.01em" }}>Continue your journey in UniVerse</p>
          </div>

          {/* ── Form ── */}
          <form onSubmit={handleSubmit} noValidate style={{ padding: "0 40px 48px", display: "flex", flexDirection: "column", gap: 24 }}>
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
              className="signin-btn"
              type="submit" disabled={loading}
              style={{
                width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                background: loading ? "rgba(0,140,60,0.5)" : "linear-gradient(90deg, #00B74A 0%, #00E676 100%)",
                color: loading ? "rgba(255,255,255,0.5)" : "#020804",
                fontWeight: 700, fontSize: 16, letterSpacing: "-0.01em",
                border: "none", borderRadius: 14, padding: "16px 24px",
                cursor: loading ? "not-allowed" : "pointer",
                boxShadow: loading ? "none" : "0 8px 24px rgba(0,230,118,0.3), 0 2px 8px rgba(0,0,0,0.5)",
                transition: "all 0.2s ease-out", fontFamily: "inherit",
              }}
            >
              {loading
                ? <><span style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.8s linear infinite" }} /> Signing in…</>
                : <><span>Sign In</span><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg></>
              }
            </button>

            {/* OR Divider */}
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.07)" }} />
              <span style={{ fontSize: 13, color: "rgba(167,184,176,0.6)", fontWeight: 500, letterSpacing: "0.05em" }}>OR</span>
              <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.07)" }} />
            </div>

            {/* Google Button */}
            <button
              className="google-btn"
              type="button" onClick={handleGoogle}
              style={{
                width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
                background: "rgba(3,8,5,0.85)", border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: 14, padding: "15px 24px", color: "#fff",
                fontWeight: 600, fontSize: 15, cursor: "pointer",
                transition: "all 0.2s ease-out", fontFamily: "inherit", letterSpacing: "-0.01em",
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
              <Link href={ROUTES.REGISTER} style={{ color: "#00E676", fontWeight: 600, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4 }}>
                Create account
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
              </Link>
            </p>
          </form>
        </div>

        {/* ── Trust bar ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 24, marginTop: 32, flexWrap: "wrap", opacity: 0.85 }}>
          {[
            { label: "256-bit Encrypted", icon: <svg key="shield" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00E676" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg> },
            { label: "Your Data is Private", icon: <svg key="lock" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00E676" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg> },
            { label: "Trusted by Students", icon: <svg key="users" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00E676" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg> },
          ].map((item, i, arr) => (
            <span key={item.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              {item.icon}
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>{item.label}</span>
              {i < arr.length - 1 && <span style={{ color: "rgba(255,255,255,0.2)", marginLeft: 20 }}>•</span>}
            </span>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        :root {
          --mx: 0;
          --my: 0;
        }
        .parallax-layer {
          will-change: transform;
          transition: transform 0.8s cubic-bezier(0.1, 0.7, 0.1, 1);
        }
        .layer-1 { transform: translate3d(calc(var(--mx) * -20px), calc(var(--my) * -20px), 0); }
        .layer-2 { transform: translate3d(calc(var(--mx) * -40px), calc(var(--my) * -40px), 0); }
        .layer-3 {
          transform: translate3d(calc(var(--mx) * -70px), calc(var(--my) * -70px), 0);
          animation: twinkle 5s ease-in-out infinite alternate;
        }
        @keyframes twinkle {
          0% { opacity: 0.5; }
          100% { opacity: 0.9; }
        }
        @media (hover: none) and (pointer: coarse) {
          @keyframes auto-parallax-1 { 0% { transform: translate3d(-10px, -10px, 0); } 100% { transform: translate3d(10px, 10px, 0); } }
          @keyframes auto-parallax-2 { 0% { transform: translate3d(-20px, -15px, 0); } 100% { transform: translate3d(20px, 15px, 0); } }
          @keyframes auto-parallax-3 { 0% { transform: translate3d(-30px, -20px, 0); } 100% { transform: translate3d(30px, 20px, 0); } }
          .layer-1 { animation: auto-parallax-1 15s ease-in-out infinite alternate; }
          .layer-2 { animation: auto-parallax-2 18s ease-in-out infinite alternate; }
          .layer-3 { animation: auto-parallax-3 20s ease-in-out infinite alternate; }
        }
        @media (prefers-reduced-motion: reduce) {
          .parallax-layer { animation: none !important; transform: none !important; }
        }
        .signin-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(0,230,118,0.4), 0 4px 12px rgba(0,0,0,0.6) !important;
        }
        .signin-btn:active:not(:disabled) {
          transform: translateY(0);
          box-shadow: 0 4px 16px rgba(0,230,118,0.2) !important;
        }
        .google-btn:hover {
          background: rgba(12,24,16,0.95) !important;
          border-color: rgba(0,230,118,0.4) !important;
        }
        .dark-input::placeholder {
          color: rgba(167,184,176,0.5) !important;
        }
        .dark-input:-webkit-autofill,
        .dark-input:-webkit-autofill:hover, 
        .dark-input:-webkit-autofill:focus, 
        .dark-input:-webkit-autofill:active {
          transition: background-color 5000s ease-in-out 0s;
          -webkit-text-fill-color: #fff !important;
        }
      `}</style>
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
