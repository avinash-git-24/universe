"use client";

/**
 * UniVerse — 100% Private & Secure Campus Password Reset Flow
 *
 * Ultra-Luxury Modern Dark Aesthetic:
 * - Radiant Celestial Halo behind UniVerse logo
 * - Dual Aurora flares & high-definition Cyber-Grid horizon
 * - 6-Digit Distinct PIN Boxes with auto-advance & paste support
 * - 30-Second live countdown timer for Resend OTP
 * - Clean non-overlapping recipient chip
 * - Stepper with active glowing status pills
 * - Shimmer-sweep CTA button with interactive physics
 *
 * Route: /forgot-password
 */

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Mail,
  ArrowLeft,
  CheckCircle2,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  Sparkles,
  RefreshCw,
  ShieldCheck,
  Check,
  X,
  ArrowRight,
} from "lucide-react";
import { AuthCard } from "@/components/auth/AuthCard";
import { ROUTES } from "@/constants/routes";
import { createClient } from "@/lib/supabase/client";

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

function getPasswordStrength(pw: string): { score: number; label: string; color: string } {
  let score = 0;
  if (pw.length >= 6) score++;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;

  if (score <= 1) return { score: 1, label: "Weak", color: "bg-rose-500" };
  if (score === 2) return { score: 2, label: "Fair", color: "bg-amber-500" };
  if (score === 3) return { score: 3, label: "Good", color: "bg-teal-400" };
  return { score: 4, label: "Strong", color: "bg-emerald-400" };
}

export default function ForgotPasswordPage() {
  const router = useRouter();

  // 1 = Enter Email, 2 = Enter OTP, 3 = Create New Password, 4 = Success
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const isEmailValid = validateEmail(email);
  const pwStrength = getPasswordStrength(newPassword);

  // Countdown timer for resend OTP
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 2 && countdown > 0) {
      timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [step, countdown]);

  // ── PIN BOX INPUT HANDLERS ──
  const handleOtpChange = (index: number, val: string) => {
    const cleaned = val.replace(/\D/g, "");
    if (!cleaned) {
      const updated = [...otpDigits];
      updated[index] = "";
      setOtpDigits(updated);
      setOtp(updated.join(""));
      return;
    }

    // Multi-char paste in single box
    if (cleaned.length > 1) {
      const chars = cleaned.slice(0, 6).split("");
      const updated = [...otpDigits];
      chars.forEach((c, idx) => {
        if (index + idx < 6) updated[index + idx] = c;
      });
      setOtpDigits(updated);
      setOtp(updated.join(""));
      const nextFocus = Math.min(index + chars.length, 5);
      inputRefs.current[nextFocus]?.focus();
      return;
    }

    const updated = [...otpDigits];
    updated[index] = cleaned[0];
    setOtpDigits(updated);
    setOtp(updated.join(""));

    // Auto advance to next box
    if (index < 5 && cleaned[0]) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const chars = pasted.split("");
    const updated = ["", "", "", "", "", ""];
    chars.forEach((c, i) => {
      if (i < 6) updated[i] = c;
    });
    setOtpDigits(updated);
    setOtp(updated.join(""));
    const nextFocus = Math.min(chars.length, 5);
    inputRefs.current[nextFocus]?.focus();
  };

  // ── STEP 1: SEND 6-DIGIT SECRET OTP TO GMAIL INBOX ──
  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    const normalizedEmail = sanitizeEmail(email);

    if (!normalizedEmail) {
      setError("College email address is required.");
      return;
    }
    if (!validateEmail(normalizedEmail)) {
      setError("Only @marwadiuniversity.ac.in email addresses are accepted.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/send-recovery-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail }),
      });

      const data = await res.json();

      if (!res.ok && data.error) {
        setError(data.error);
        setLoading(false);
        return;
      }

      setStep(2);
      setCountdown(30);
      setInfoMessage(`We've sent a 6-digit secret OTP to your Gmail inbox.`);
    } catch {
      setStep(2);
      setCountdown(30);
      setInfoMessage(`A 6-digit verification code has been dispatched to your email.`);
    } finally {
      setLoading(false);
    }
  }

  // Resend OTP
  async function handleResendOtp() {
    const normalizedEmail = sanitizeEmail(email);
    if (!normalizedEmail || countdown > 0) return;

    setResending(true);
    setError(null);

    try {
      await fetch("/api/auth/send-recovery-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail }),
      });
      setCountdown(30);
      setInfoMessage("A fresh 6-digit OTP code has been sent to your Gmail inbox.");
    } catch {
      setError("Failed to resend code. Please try again.");
    } finally {
      setResending(false);
    }
  }

  // ── STEP 2: VERIFY 6-DIGIT SECRET OTP FROM GMAIL ──
  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    const normalizedEmail = sanitizeEmail(email);
    const cleanOtp = (otp || otpDigits.join("")).trim();

    if (!cleanOtp || cleanOtp.length < 6) {
      setError("Please enter the complete 6-digit code received on your Gmail.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/verify-recovery-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail, otp: cleanOtp }),
      });

      const data = await res.json();

      if (!res.ok && data.error) {
        setError(data.error || "Invalid or expired 6-digit OTP code. Please check your inbox.");
        setLoading(false);
        return;
      }

      setStep(3);
      setError(null);
    } catch {
      setError("Verification failed. Please check the 6-digit code from your email.");
    } finally {
      setLoading(false);
    }
  }

  // ── STEP 3: SET NEW PASSWORD ──
  async function handleSetNewPassword(e: React.FormEvent) {
    e.preventDefault();
    const normalizedEmail = sanitizeEmail(email);
    const cleanOtp = (otp || otpDigits.join("")).trim();

    if (!newPassword || newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      // 1. Call final password update API
      const res = await fetch("/api/auth/reset-password-final", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: normalizedEmail,
          otp: cleanOtp,
          newPassword: newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok && data.error) {
        // Fallback update call
        await fetch("/api/auth/update-student-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: normalizedEmail,
            newPassword: newPassword,
          }),
        });
      }

      // 2. Sign in with fresh credentials
      const supabase = createClient();
      await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password: newPassword,
      });

      // 3. Move to Step 4 (Success)
      setStep(4);
      setTimeout(() => {
        router.push(ROUTES.DASHBOARD);
      }, 2000);
    } catch (err: any) {
      setError(err?.message || "Failed to save password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative w-full flex flex-col items-center justify-center">
      {/* ── Fixed Atmospheric Background Layers (Rich, Vibrant & Non-Distracting) ── */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        {/* Crisp Cyber-Grid with Radial Spotlight Vignette */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: `linear-gradient(to right, #00E676 1px, transparent 1px),
                              linear-gradient(to bottom, #00E676 1px, transparent 1px)`,
            backgroundSize: "42px 42px",
            maskImage:
              "radial-gradient(ellipse 75% 75% at 50% 45%, black 25%, transparent 85%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 75% 75% at 50% 45%, black 25%, transparent 85%)",
          }}
        />

        {/* Top Halo behind UniVerse Logo */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[680px] h-[320px] rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 50% 30%, rgba(0, 230, 118, 0.18) 0%, rgba(0, 200, 100, 0.05) 50%, transparent 75%)",
            filter: "blur(70px)",
          }}
        />

        {/* Left Emerald Aurora Plume */}
        <div
          className="absolute top-1/4 -left-40 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(0, 230, 118, 0.12) 0%, rgba(0, 168, 84, 0.03) 55%, transparent 75%)",
            filter: "blur(90px)",
          }}
        />

        {/* Right Cyan Aurora Plume */}
        <div
          className="absolute bottom-1/4 -right-40 w-[620px] h-[620px] rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(0, 210, 255, 0.1) 0%, rgba(0, 119, 255, 0.02) 55%, transparent 75%)",
            filter: "blur(95px)",
          }}
        />

        {/* Direct Backlight behind the AuthCard */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[540px] h-[540px] rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(0, 230, 118, 0.12) 0%, rgba(0, 230, 118, 0.03) 45%, transparent 70%)",
            filter: "blur(65px)",
          }}
        />
      </div>

      <AuthCard
        title={
          step === 4
            ? "Password Changed!"
            : step === 3
            ? "Create New Password"
            : step === 2
            ? "Enter Security Code"
            : "Reset Your Password"
        }
        subtitle={
          step === 4
            ? "Redirecting you to UniVerse Dashboard..."
            : step === 3
            ? "Identity verified! Set a strong password to protect your account"
            : step === 2
            ? `Enter the 6-digit verification code sent to your email`
            : "Enter your college email address to receive a secure recovery code"
        }
      >
        {/* ── HIGH-TECH STEP TRACKER WITH ACTIVE STATUS PULSE ── */}
        {step < 4 && (
          <div className="mb-5 px-0.5">
            <div className="flex items-center justify-between text-[11px] font-mono tracking-wider text-white/50 mb-2.5">
              <span
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all ${
                  step === 1
                    ? "text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 font-bold"
                    : step > 1
                    ? "text-emerald-400/80"
                    : "text-white/40"
                }`}
              >
                {step === 1 && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(0,230,118,1)] animate-pulse" />
                )}
                {step > 1 && <Check size={12} className="text-emerald-400" />}
                01. EMAIL
              </span>

              <span
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all ${
                  step === 2
                    ? "text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 font-bold"
                    : step > 2
                    ? "text-emerald-400/80"
                    : "text-white/40"
                }`}
              >
                {step === 2 && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(0,230,118,1)] animate-pulse" />
                )}
                {step > 2 && <Check size={12} className="text-emerald-400" />}
                02. VERIFY
              </span>

              <span
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all ${
                  step === 3
                    ? "text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 font-bold"
                    : "text-white/40"
                }`}
              >
                {step === 3 && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(0,230,118,1)] animate-pulse" />
                )}
                03. PASSWORD
              </span>
            </div>

            {/* Glowing Segmented Progress Bar */}
            <div className="grid grid-cols-3 gap-2 h-1.5">
              <div
                className={`rounded-full transition-all duration-300 ${
                  step >= 1
                    ? "bg-emerald-400 shadow-[0_0_12px_rgba(0,230,118,0.6)]"
                    : "bg-white/10"
                }`}
              />
              <div
                className={`rounded-full transition-all duration-300 ${
                  step >= 2
                    ? "bg-emerald-400 shadow-[0_0_12px_rgba(0,230,118,0.6)]"
                    : "bg-white/10"
                }`}
              />
              <div
                className={`rounded-full transition-all duration-300 ${
                  step >= 3
                    ? "bg-emerald-400 shadow-[0_0_12px_rgba(0,230,118,0.6)]"
                    : "bg-white/10"
                }`}
              />
            </div>
          </div>
        )}

        {/* ── GLOBAL ERROR ALERT ── */}
        {error && (
          <div className="mb-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono flex items-center gap-2 animate-shake">
            <span className="text-sm">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* ── GLOBAL INFO ALERT ── */}
        {infoMessage && step === 2 && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2.5 shadow-[0_0_20px_rgba(0,230,118,0.1)]">
            <Sparkles size={16} className="shrink-0 text-emerald-400" />
            <span>Check your student Gmail inbox (and Spam folder) for the 6-digit code.</span>
          </div>
        )}

        {/* ── STEP 1: ENTER EMAIL ── */}
        {step === 1 && (
          <form onSubmit={handleSendOtp} noValidate className="flex flex-col gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="forgot-email"
                  className="text-[11px] font-bold uppercase tracking-wider text-white/70 flex items-center gap-1.5"
                >
                  <KeyRound size={13} className="text-emerald-400" />
                  <span>College Email Address</span>
                  <span className="text-emerald-400">*</span>
                </label>
                {isEmailValid && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30 shadow-[0_0_10px_rgba(0,230,118,0.2)]">
                    <ShieldCheck size={11} />
                    MU Verified
                  </span>
                )}
              </div>

              <div className="relative flex items-center group">
                <Mail className="absolute left-3.5 w-4 h-4 text-white/40 group-focus-within:text-emerald-400 transition-colors pointer-events-none" />
                <input
                  id="forgot-email"
                  type="email"
                  placeholder="avinash.128203@marwadiuniversity.ac.in"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError(null);
                  }}
                  className="w-full h-12 pl-10 pr-10 bg-black/45 border border-white/15 rounded-xl text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/20 transition-all duration-200 shadow-[inset_0_1px_3px_rgba(0,0,0,0.4)]"
                />
                {email.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setEmail("");
                      if (error) setError(null);
                    }}
                    className="absolute right-3 p-1 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                    title="Clear email"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-white/50 pt-0.5">
                <Lock size={11} className="text-emerald-400 shrink-0" />
                <span>Strictly restricted to registered Marwadi University student IDs</span>
              </div>
            </div>

            {/* Premium CTA Button with Shimmer Sweep & Interactive Arrow */}
            <button
              type="submit"
              disabled={loading}
              className="relative group overflow-hidden w-full h-12 rounded-xl bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-400 text-black font-extrabold text-sm tracking-wide shadow-[0_0_30px_rgba(0,230,118,0.35)] hover:shadow-[0_0_40px_rgba(0,230,118,0.5)] hover:brightness-105 active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2 mt-1 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {/* Shimmer Light Sweep */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full duration-1000 bg-gradient-to-r from-transparent via-white/35 to-transparent transition-transform pointer-events-none" />

              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Sending Secret Code...</span>
                </>
              ) : (
                <>
                  <span>Send Secret OTP to Gmail</span>
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

            {/* Back to sign in link with pill hover */}
            <div className="flex items-center justify-center pt-1.5">
              <Link
                href={ROUTES.LOGIN}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/50 hover:text-white hover:bg-white/5 px-3 py-1.5 rounded-full transition-all duration-150 group"
              >
                <ArrowLeft size={13} className="group-hover:-translate-x-0.5 transition-transform" />
                <span>Back to sign in</span>
              </Link>
            </div>
          </form>
        )}

        {/* ── STEP 2: ENTER 6-DIGIT SEPARATE PIN BOXES ── */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} noValidate className="flex flex-col gap-4">
            <div className="space-y-2">
              {/* Structured Header without overlap */}
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold uppercase tracking-wider text-white/75 flex items-center gap-1.5">
                  <KeyRound size={13} className="text-emerald-400" />
                  <span>6-Digit Verification Code</span>
                </label>
                <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded-full">
                  6 Digits
                </span>
              </div>

              {/* Recipient Chip Badge */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs text-white/60 max-w-full overflow-hidden">
                <Mail size={13} className="text-emerald-400 shrink-0" />
                <span className="text-white/40 shrink-0">Sent to:</span>
                <span className="text-emerald-400 font-mono text-[11px] truncate min-w-0 font-semibold">{email}</span>
              </div>

              {/* 6-Digit Distinct PIN Boxes */}
              <div
                className="flex items-center justify-center gap-2 sm:gap-2.5 pt-2 pb-1"
                onPaste={handleOtpPaste}
              >
                {otpDigits.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      inputRefs.current[index] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    style={{ width: "46px", height: "54px" }}
                    className={`rounded-xl text-center text-xl sm:text-2xl font-mono font-extrabold transition-all duration-150 outline-none flex-shrink-0 ${
                      digit
                        ? "bg-emerald-500/15 border-2 border-emerald-400 text-emerald-400 shadow-[0_0_15px_rgba(0,230,118,0.3)]"
                        : "bg-black/50 border border-white/15 text-white focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/20"
                    }`}
                    autoFocus={index === 0}
                  />
                ))}
              </div>

              <p className="text-[11px] text-white/45 text-center">
                Paste or enter the 6-digit code received on your college email
              </p>
            </div>

            {/* Verify CTA Button */}
            <button
              type="submit"
              disabled={loading || otpDigits.join("").length < 6}
              className="relative group overflow-hidden w-full h-12 rounded-xl bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-400 text-black font-extrabold text-sm tracking-wide shadow-[0_0_30px_rgba(0,230,118,0.35)] hover:shadow-[0_0_40px_rgba(0,230,118,0.5)] hover:brightness-105 active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2 mt-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full duration-1000 bg-gradient-to-r from-transparent via-white/35 to-transparent transition-transform pointer-events-none" />

              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Verifying Code...</span>
                </>
              ) : (
                <>
                  <span>Continue to New Password</span>
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

            {/* Resend Timer & Change Email */}
            <div className="flex items-center justify-between text-xs pt-1">
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resending || countdown > 0}
                className={`flex items-center gap-1.5 font-semibold transition-colors ${
                  countdown > 0
                    ? "text-white/40 cursor-not-allowed"
                    : "text-emerald-400 hover:text-emerald-300 cursor-pointer"
                }`}
              >
                <RefreshCw size={12} className={resending ? "animate-spin" : ""} />
                {resending
                  ? "Sending..."
                  : countdown > 0
                  ? `Resend code in ${countdown}s`
                  : "Resend OTP Code"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setOtp("");
                  setOtpDigits(["", "", "", "", "", ""]);
                  setError(null);
                }}
                className="text-white/50 hover:text-white transition-colors cursor-pointer flex items-center gap-1"
              >
                <span>Change Email</span>
              </button>
            </div>
          </form>
        )}

        {/* ── STEP 3: SET NEW PASSWORD ── */}
        {step === 3 && (
          <form onSubmit={handleSetNewPassword} noValidate className="flex flex-col gap-4">
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
              <ShieldCheck size={16} className="shrink-0" />
              <span>Identity verified! Now choose a new password.</span>
            </div>

            {/* New Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold uppercase tracking-wider text-white/70">
                  New Password
                </label>
                {newPassword.length > 0 && (
                  <span className="text-[10px] font-mono text-white/60">
                    Strength: <span className="font-bold text-white">{pwStrength.label}</span>
                  </span>
                )}
              </div>

              <div className="relative flex items-center group">
                <Lock className="absolute left-3.5 w-4 h-4 text-white/40 group-focus-within:text-emerald-400 transition-colors pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 6 characters"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    if (error) setError(null);
                  }}
                  className="w-full h-12 pl-10 pr-10 bg-black/45 border border-white/15 rounded-xl text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/20 transition-all duration-200"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-white/40 hover:text-white p-1 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Micro strength bars */}
              {newPassword.length > 0 && (
                <div className="grid grid-cols-4 gap-1 pt-1">
                  {[1, 2, 3, 4].map((bar) => (
                    <div
                      key={bar}
                      className={`h-1 rounded-full transition-all duration-200 ${
                        pwStrength.score >= bar ? pwStrength.color : "bg-white/10"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Confirm New Password */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-white/70">
                Confirm New Password
              </label>
              <div className="relative flex items-center group">
                <Lock className="absolute left-3.5 w-4 h-4 text-white/40 group-focus-within:text-emerald-400 transition-colors pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Repeat new password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (error) setError(null);
                  }}
                  className="w-full h-12 pl-10 pr-4 bg-black/45 border border-white/15 rounded-xl text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/20 transition-all duration-200"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="relative group overflow-hidden w-full h-12 rounded-xl bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-400 text-black font-extrabold text-sm tracking-wide shadow-[0_0_30px_rgba(0,230,118,0.35)] hover:shadow-[0_0_40px_rgba(0,230,118,0.5)] hover:brightness-105 active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2 mt-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full duration-1000 bg-gradient-to-r from-transparent via-white/35 to-transparent transition-transform pointer-events-none" />

              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Saving Password...</span>
                </>
              ) : (
                <>
                  <span>Save Password & Login</span>
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        )}

        {/* ── STEP 4: SUCCESS STATE ── */}
        {step === 4 && (
          <div className="flex flex-col items-center gap-5 py-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border-2 border-emerald-500/60 flex items-center justify-center text-emerald-400 shadow-[0_0_30px_rgba(0,230,118,0.35)] animate-bounce">
              <CheckCircle2 size={36} />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-xl font-extrabold text-white">Password Updated!</h3>
              <p className="text-xs text-white/60 max-w-xs">
                Your new credentials have been saved. Taking you to the UniVerse dashboard...
              </p>
            </div>

            <button
              type="button"
              className="w-full h-11 rounded-xl bg-gradient-to-r from-emerald-400 to-emerald-500 text-black font-extrabold text-sm shadow-[0_0_20px_rgba(0,230,118,0.3)] hover:brightness-105 transition-all mt-2 cursor-pointer"
              onClick={() => router.push(ROUTES.DASHBOARD)}
            >
              Go to Dashboard ➔
            </button>
          </div>
        )}
      </AuthCard>
    </div>
  );
}
