"use client";

/**
 * UniVerse — Cosmic Black Hole Sign-In Screen
 *
 * Replicates the photorealistic deep-space black hole accretion disk aesthetic:
 * - High-resolution photorealistic Gargantua black hole background
 * - Top telemetry HUD indicators ([EVENT HORIZON // GRAVITY: STABILIZED] & [SYSTEM STATUS // ONLINE // NOMINAL])
 * - Sleek frosted glassmorphic card with ambient cyan rim glow
 * - Verified college email badge
 * - Password visibility toggle
 * - Full Supabase authentication & Google OAuth integration
 * - Trust & security badges footer
 *
 * Route: /login
 */

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Zap,
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Radio,
  Sparkles,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ROUTES } from "@/constants/routes";

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

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("avinash.128203@marwadiuniversity.ac.in");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEmailValid = validateEmail(email);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const normalizedEmail = sanitizeEmail(email);

    if (!normalizedEmail) {
      setError("Email is required.");
      return;
    }
    if (!validateEmail(normalizedEmail)) {
      setError("Only @marwadiuniversity.ac.in emails are allowed.");
      return;
    }
    if (!password) {
      setError("Password is required.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

      if (signInError) {
        setError(
          signInError.message.toLowerCase().includes("invalid")
            ? "Incorrect email or password."
            : signInError.message
        );
        setLoading(false);
        return;
      }

      const destination = searchParams.get("redirectTo") ?? ROUTES.DASHBOARD;
      router.push(destination);
    } catch {
      setError("Failed to authenticate. Please check your connection.");
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    try {
      setLoading(true);
      const supabase = createClient();
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?redirectTo=/dashboard`,
          queryParams: { prompt: "select_account", hd: "marwadiuniversity.ac.in" },
        },
      });
    } catch {
      setError("Failed to initialize Google login.");
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-[100dvh] w-full bg-[#020307] text-slate-100 flex flex-col justify-between items-center p-4 sm:p-6 lg:p-8 overflow-hidden font-sans selection:bg-cyan-500/30 selection:text-cyan-300">
      {/* ========================================================================= */}
      {/* COSMIC ACCRETION DISK & GRAVITATIONAL LENSING BACKGROUND */}
      {/* ========================================================================= */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none -z-10">
        {/* Photorealistic Gargantua Black Hole Wallpaper */}
        <Image
          src="/images/cosmic-black-hole.jpg"
          alt="Gargantua Black Hole Background"
          fill
          priority
          quality={95}
          className="object-cover object-center scale-[1.03] transform-gpu opacity-95"
        />

        {/* Distant Starfield Micro-Grid Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:40px_40px] opacity-[0.08]" />

        {/* Ambient Relativistic Doppler Cyan Flare Enhancement on Left */}
        <div className="absolute top-1/2 left-[15%] -translate-y-1/2 w-[600px] h-[350px] bg-cyan-500/15 rounded-full blur-[100px] pointer-events-none" />

        {/* Golden-Amber Accretion Disk Secondary Atmosphere */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[400px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />

        {/* Subtle Vignette on edges for high card legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#020307]/80 via-transparent to-[#020307]/70" />
      </div>

      {/* ========================================================================= */}
      {/* TOP TELEMETRY HUD BAR */}
      {/* ========================================================================= */}
      <header className="relative z-10 w-full max-w-7xl flex items-center justify-between text-[11px] sm:text-xs font-mono tracking-widest text-cyan-400/80 uppercase pt-2 sm:pt-0">
        {/* Left Telemetry */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/45 border border-cyan-500/25 backdrop-blur-md shadow-[0_0_15px_rgba(6,182,212,0.15)]">
          <span className="text-cyan-400 font-bold">[</span>
          <span className="text-slate-400">EVENT HORIZON //</span>
          <span className="text-cyan-300 font-semibold">GRAVITY: STABILIZED</span>
          <span className="text-cyan-400 font-bold">]</span>
        </div>

        {/* Right Telemetry */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/45 border border-cyan-500/25 backdrop-blur-md shadow-[0_0_15px_rgba(6,182,212,0.15)]">
          <span className="text-cyan-400 font-bold">[</span>
          <span className="text-slate-400">SYSTEM STATUS //</span>
          <span className="text-emerald-400 flex items-center gap-1.5 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
            ONLINE // NOMINAL
          </span>
          <span className="text-cyan-400 font-bold">]</span>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* BRAND & CENTRAL GLASSMORPHIC CARD */}
      {/* ========================================================================= */}
      <div className="relative z-10 w-full flex flex-col items-center my-auto py-6">
        {/* UniVerse Brand Identity */}
        <div className="flex flex-col items-center text-center mb-5 sm:mb-6">
          <Link
            href="/"
            className="flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-cyan-950/45 border border-cyan-500/35 shadow-[0_0_30px_rgba(6,182,212,0.3)] backdrop-blur-xl mb-2.5 hover:border-cyan-400 transition-colors"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-sky-400 flex items-center justify-center text-black shadow-lg shadow-cyan-500/40">
              <Zap className="w-5 h-5 fill-black stroke-black" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">UniVerse</span>
          </Link>
          <p className="text-[10.5px] sm:text-xs text-cyan-300/80 font-mono tracking-widest uppercase">
            One Universe. Infinite Possibilities.
          </p>
        </div>

        {/* Ultra-Sleek Glassmorphic Sign-In Container */}
        <div className="w-full max-w-[430px] rounded-3xl bg-[#080d16]/80 border border-cyan-500/35 shadow-[0_0_60px_rgba(3,15,30,0.85),inset_0_1px_1px_rgba(103,232,249,0.35)] backdrop-blur-2xl p-6 sm:p-8 relative">
          {/* Ambient Glow inside Card Top Rim */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent blur-[2px]" />

          {/* Corner Cyber Accents */}
          <div className="absolute top-3 left-3 text-cyan-500/30 text-xs font-mono select-none">+</div>
          <div className="absolute top-3 right-3 text-cyan-500/30 text-xs font-mono select-none">+</div>

          {/* Card Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-1.5 text-lg font-semibold text-white tracking-tight">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span className="tracking-wider uppercase">SIGN IN</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Continue your journey in UniVerse</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono flex items-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Sign In Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono tracking-wider uppercase text-slate-400 flex items-center justify-between">
                <span>Email</span>
                {isEmailValid && (
                  <span className="text-[9.5px] text-cyan-400 font-sans normal-case">MU Student</span>
                )}
              </label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3.5 w-4 h-4 text-cyan-400/70 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError(null);
                  }}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#060b13]/85 border border-cyan-900/60 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 text-xs sm:text-sm text-slate-200 placeholder-slate-500 outline-none transition-all duration-200"
                  placeholder="student@marwadiuniversity.ac.in"
                />
                {isEmailValid && <CheckCircle2 className="absolute right-3.5 w-4 h-4 text-cyan-400" />}
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono tracking-wider uppercase text-slate-400">
                Password
              </label>
              <div className="relative flex items-center">
                <Lock className="absolute left-3.5 w-4 h-4 text-cyan-400/70 pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(null);
                  }}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#060b13]/85 border border-cyan-900/60 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 text-xs sm:text-sm text-slate-200 placeholder-slate-500 outline-none transition-all duration-200 font-mono"
                  placeholder="••••••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Options Row: Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-xs pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer select-none text-slate-300 hover:text-white transition-colors">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-cyan-800/80 bg-black/50 text-cyan-500 focus:ring-cyan-400/30 focus:ring-offset-0 cursor-pointer"
                />
                <span className="text-[11px] sm:text-xs">Remember me</span>
              </label>

              <Link
                href={ROUTES.FORGOT_PASSWORD}
                className="text-[11px] sm:text-xs text-cyan-400 hover:text-cyan-300 transition-colors font-medium"
              >
                Forgot password?
              </Link>
            </div>

            {/* Primary Action Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full group flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm tracking-wide transition-all duration-200 bg-gradient-to-r from-cyan-500 via-sky-400 to-cyan-400 text-slate-950 shadow-[0_0_25px_rgba(6,182,212,0.4)] hover:shadow-[0_0_35px_rgba(6,182,212,0.65)] hover:brightness-105 active:scale-[0.99] disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>AUTHENTICATING...</span>
                </>
              ) : (
                <>
                  <span>SIGN IN</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>

            {/* Divider */}
            <div className="relative flex items-center justify-center my-3">
              <div className="w-full border-t border-slate-800" />
              <span className="absolute px-2.5 py-0.5 bg-[#080d16] text-[10px] font-mono uppercase text-slate-400 border border-slate-800 rounded-full">
                OR
              </span>
            </div>

            {/* Google OAuth Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl bg-slate-900/70 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 text-xs font-medium text-slate-200 transition-all duration-150 cursor-pointer disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.36 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.02 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* Create Account Link */}
            <div className="text-center text-xs text-slate-400 pt-1">
              Don&apos;t have an account?{" "}
              <Link
                href={ROUTES.REGISTER}
                className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
              >
                Create account &gt;
              </Link>
            </div>

            {/* Micro Telemetry inside Card Footer */}
            <div className="pt-2 border-t border-slate-800/70 flex flex-col items-center gap-1 text-[9px] font-mono text-cyan-400/70 uppercase">
              <div className="flex items-center gap-1.5">
                <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
                <span>SECURE CONNECTION ESTABLISHED</span>
              </div>
              <div className="flex gap-1">
                <span className="w-2.5 h-0.5 bg-cyan-500 rounded-full" />
                <span className="w-2.5 h-0.5 bg-cyan-500 rounded-full" />
                <span className="w-2.5 h-0.5 bg-cyan-500/40 rounded-full" />
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* BOTTOM TRUST & SECURITY BADGES */}
      {/* ========================================================================= */}
      <footer className="relative z-10 flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-[10px] sm:text-xs text-slate-400 font-mono uppercase tracking-wider py-2">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
          <span>256-BIT ENCRYPTED</span>
        </div>
        <span className="text-slate-700">•</span>
        <span>YOUR DATA IS PRIVATE</span>
        <span className="text-slate-700">•</span>
        <span className="text-cyan-300/80">TRUSTED BY STUDENTS</span>
      </footer>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[100dvh] bg-[#020307] flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
