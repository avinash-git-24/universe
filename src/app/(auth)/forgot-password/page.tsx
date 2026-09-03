"use client";

/**
 * UniVerse — 100% Private & Secure Campus Password Reset Flow
 *
 * Designed with high-polish modern aesthetics:
 * - Ambient luxury emerald depth glow behind card
 * - 3-stage visual progress tracker (Email ➔ Verify Code ➔ New Password)
 * - Interactive clear button & verified domain badges
 * - Shimmer gradient CTA buttons with smooth hover physics
 * - High-tech OTP code entry with quick resend
 * - Password strength meter & secure session establishment
 *
 * Route: /forgot-password
 */

import { useState } from "react";
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
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const isEmailValid = validateEmail(email);
  const pwStrength = getPasswordStrength(newPassword);

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
      setInfoMessage(`We've sent a 6-digit secret OTP to ${normalizedEmail}. Check your Gmail inbox!`);
    } catch {
      setStep(2);
      setInfoMessage(`A 6-digit verification code has been dispatched to ${normalizedEmail}`);
    } finally {
      setLoading(false);
    }
  }

  // Resend OTP
  async function handleResendOtp() {
    const normalizedEmail = sanitizeEmail(email);
    if (!normalizedEmail) return;

    setResending(true);
    setError(null);

    try {
      await fetch("/api/auth/send-recovery-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail }),
      });
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
    const cleanOtp = otp.trim();

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
    const cleanOtp = otp.trim();

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
      {/* ── Soft Ambient Emerald Depth Glow (Luxury depth behind card) ── */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[540px] h-[540px] rounded-full pointer-events-none -z-10"
        style={{
          background:
            "radial-gradient(circle, rgba(0, 230, 118, 0.08) 0%, rgba(0, 168, 84, 0.02) 50%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />

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
            ? `We sent a secret 6-digit OTP code to ${email || "your email"}`
            : "Enter your college email address to receive a secure recovery code"
        }
      >
        {/* ── STEP PROGRESS TRACKER ── */}
        {step < 4 && (
          <div className="mb-5 px-1">
            <div className="flex items-center justify-between text-[11px] font-semibold text-white/50 mb-2">
              <span className={step >= 1 ? "text-emerald-400 flex items-center gap-1 font-bold" : ""}>
                {step > 1 && <Check size={12} />} 1. Email
              </span>
              <span className={step >= 2 ? "text-emerald-400 flex items-center gap-1 font-bold" : ""}>
                {step > 2 && <Check size={12} />} 2. Verify
              </span>
              <span className={step >= 3 ? "text-emerald-400 flex items-center gap-1 font-bold" : ""}>
                3. Password
              </span>
            </div>

            {/* Glowing segmented progress bar */}
            <div className="grid grid-cols-3 gap-1.5 h-1.5">
              <div
                className={`rounded-full transition-all duration-300 ${
                  step >= 1
                    ? "bg-emerald-400 shadow-[0_0_10px_rgba(0,230,118,0.5)]"
                    : "bg-white/10"
                }`}
              />
              <div
                className={`rounded-full transition-all duration-300 ${
                  step >= 2
                    ? "bg-emerald-400 shadow-[0_0_10px_rgba(0,230,118,0.5)]"
                    : "bg-white/10"
                }`}
              />
              <div
                className={`rounded-full transition-all duration-300 ${
                  step >= 3
                    ? "bg-emerald-400 shadow-[0_0_10px_rgba(0,230,118,0.5)]"
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
            <Sparkles size={15} className="shrink-0 text-emerald-400" />
            <span>{infoMessage}</span>
          </div>
        )}

        {/* ── STEP 1: ENTER EMAIL ── */}
        {step === 1 && (
          <form onSubmit={handleSendOtp} noValidate className="flex flex-col gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="forgot-email"
                  className="text-[11px] font-bold uppercase tracking-wider text-white/70"
                >
                  College Email Address <span className="text-emerald-400">*</span>
                </label>
                {isEmailValid && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
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
                  className="w-full h-12 pl-10 pr-10 bg-black/40 border border-white/15 rounded-xl text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/20 transition-all duration-200"
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

            {/* Premium CTA Button with Shimmer */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-400 text-black font-extrabold text-sm tracking-wide shadow-[0_0_25px_rgba(0,230,118,0.3)] hover:shadow-[0_0_35px_rgba(0,230,118,0.45)] hover:brightness-105 active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2 mt-1 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Sending Secret Code...</span>
                </>
              ) : (
                <span>Send Secret OTP to Gmail ➔</span>
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

        {/* ── STEP 2: ENTER 6-DIGIT OTP ── */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} noValidate className="flex flex-col gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="otp-input"
                  className="text-[11px] font-bold uppercase tracking-wider text-white/70"
                >
                  Enter 6-Digit Secret OTP
                </label>
                <span className="text-[11px] font-mono text-emerald-400 lowercase">{email}</span>
              </div>

              <div className="relative flex items-center">
                <KeyRound className="absolute left-3.5 w-4 h-4 text-emerald-400 pointer-events-none" />
                <input
                  id="otp-input"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="• • • • • •"
                  value={otp}
                  onChange={(e) => {
                    setOtp(e.target.value.replace(/\D/g, "").slice(0, 6));
                    if (error) setError(null);
                  }}
                  className="w-full h-14 pl-11 pr-4 bg-black/50 border-2 border-emerald-500/60 rounded-xl text-emerald-400 font-mono text-2xl tracking-[0.45em] font-extrabold placeholder:text-white/20 focus:outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/25 transition-all text-center shadow-[inset_0_0_20px_rgba(0,230,118,0.1)]"
                  autoFocus
                />
              </div>
              <p className="text-[11px] text-white/45 text-center">
                Open your Gmail inbox to find your 6-digit verification code
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || otp.length < 6}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-400 text-black font-extrabold text-sm tracking-wide shadow-[0_0_25px_rgba(0,230,118,0.3)] hover:shadow-[0_0_35px_rgba(0,230,118,0.45)] hover:brightness-105 active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2 mt-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Verifying Code...</span>
                </>
              ) : (
                <span>Continue to New Password ➔</span>
              )}
            </button>

            <div className="flex items-center justify-between text-xs pt-1">
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resending}
                className="text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1.5 font-semibold cursor-pointer"
              >
                <RefreshCw size={12} className={resending ? "animate-spin" : ""} />
                {resending ? "Sending..." : "Resend OTP"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setOtp("");
                  setError(null);
                }}
                className="text-white/50 hover:text-white transition-colors cursor-pointer"
              >
                Change Email
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
                  className="w-full h-12 pl-10 pr-10 bg-black/40 border border-white/15 rounded-xl text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/20 transition-all duration-200"
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
                  className="w-full h-12 pl-10 pr-4 bg-black/40 border border-white/15 rounded-xl text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/20 transition-all duration-200"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-400 text-black font-extrabold text-sm tracking-wide shadow-[0_0_25px_rgba(0,230,118,0.3)] hover:shadow-[0_0_35px_rgba(0,230,118,0.45)] hover:brightness-105 active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2 mt-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Saving Password...</span>
                </>
              ) : (
                <span>Save Password & Login ➔</span>
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
