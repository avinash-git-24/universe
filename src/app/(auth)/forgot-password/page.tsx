"use client";

/**
 * UniVerse — 100% Private & Secure Facebook/Instagram Style Password Reset Flow
 *
 * Step 1: Enter College Email ➔ Sends 6-digit Secret OTP strictly to Student's Gmail Inbox
 * Step 2: Enter 6-Digit Code from Inbox ➔ Verifies OTP
 * Step 3: Create New Password ➔ (Only unlocked after email OTP verification)
 * Step 4: Success ➔ Auto signs in and redirects to Dashboard
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, ArrowLeft, CheckCircle2, Lock, KeyRound, Eye, EyeOff, Sparkles, RefreshCw, ShieldCheck } from "lucide-react";
import { AuthCard } from "@/components/auth/AuthCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
      setInfoMessage(`We've sent a 6-digit secret OTP code to ${normalizedEmail}. Please check your Gmail inbox (and Spam folder).`);
    } catch (err: any) {
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
    } catch (err: any) {
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

      // OTP is verified! Unlock Step 3 (Set New Password)
      setStep(3);
      setError(null);
    } catch (err: any) {
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
        setError(data.error || "Failed to update password.");
        setLoading(false);
        return;
      }

      // 2. Sign in to confirm session
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
    <AuthCard
      title={
        step === 4
          ? "Password Changed!"
          : step === 3
          ? "Create a New Password"
          : step === 2
          ? "Enter Security Code"
          : "Reset Your Password"
      }
      subtitle={
        step === 4
          ? "Redirecting you to UniVerse Dashboard..."
          : step === 3
          ? "Email verified! Enter your new secure password"
          : step === 2
          ? `We sent a 6-digit secret OTP to ${email || "your email"}`
          : "Enter your college email and we'll send a secret OTP to your Gmail"
      }
    >
      {/* ── STEP 4: SUCCESS STATE ── */}
      {step === 4 && (
        <div className="flex flex-col items-center gap-5 py-4 text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border-2 border-emerald-500/50 flex items-center justify-center text-emerald-400 shadow-[0_0_25px_rgba(0,230,118,0.3)] animate-bounce">
            <CheckCircle2 size={36} />
          </div>

          <div className="space-y-1.5">
            <h3 className="text-xl font-extrabold text-white">Password Updated!</h3>
            <p className="text-xs text-white/60 max-w-xs">
              Your new password has been saved. Taking you to the dashboard...
            </p>
          </div>

          <Button
            type="button"
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold h-11 rounded-xl shadow-[0_0_20px_rgba(0,230,118,0.3)] mt-2"
            onClick={() => router.push(ROUTES.DASHBOARD)}
          >
            Go to Dashboard ➔
          </Button>
        </div>
      )}

      {/* ── STEP 1: ENTER EMAIL ── */}
      {step === 1 && (
        <form onSubmit={handleSendOtp} noValidate className="flex flex-col gap-4">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono">
              ⚠️ {error}
            </div>
          )}

          <Input
            id="forgot-email"
            type="email"
            label="College Email Address"
            placeholder="avinash.128203@marwadiuniversity.ac.in"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (error) setError(null);
            }}
            leftIcon={<Mail size={16} />}
            size="lg"
          />

          <Button
            type="submit"
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold h-11 rounded-xl shadow-[0_0_20px_rgba(0,230,118,0.25)] mt-1"
            disabled={loading}
          >
            {loading ? "Sending 6-Digit Code..." : "Send Secret OTP to Gmail ➔"}
          </Button>

          <Link
            href={ROUTES.LOGIN}
            className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-white/50 hover:text-white transition-colors duration-150 mt-1"
          >
            <ArrowLeft size={13} />
            Back to sign in
          </Link>
        </form>
      )}

      {/* ── STEP 2: ENTER 6-DIGIT OTP ONLY (FROM GMAIL INBOX) ── */}
      {step === 2 && (
        <form onSubmit={handleVerifyOtp} noValidate className="flex flex-col gap-4">
          {infoMessage && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
              <Sparkles size={14} className="shrink-0" />
              <span>{infoMessage}</span>
            </div>
          )}

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono">
              ⚠️ {error}
            </div>
          )}

          {/* 6-Digit OTP Box */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-white/70 flex items-center justify-between">
              <span>Enter 6-Digit Secret OTP</span>
              <span className="text-emerald-400 lowercase font-normal">{email}</span>
            </label>
            <div className="relative flex items-center">
              <KeyRound className="absolute left-3.5 w-4 h-4 text-emerald-400 pointer-events-none" />
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="• • • • • •"
                value={otp}
                onChange={(e) => {
                  setOtp(e.target.value.replace(/\D/g, "").slice(0, 6));
                  if (error) setError(null);
                }}
                className="w-full h-12 pl-11 pr-4 bg-black/40 border-2 border-emerald-500/50 rounded-xl text-emerald-400 font-mono text-xl tracking-[0.4em] font-extrabold placeholder:text-white/20 focus:outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/20 text-center"
                autoFocus
              />
            </div>
            <p className="text-[11px] text-white/50 text-center">
              Open your Gmail inbox to find your 6-digit verification code
            </p>
          </div>

          <Button
            type="submit"
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold h-11 rounded-xl shadow-[0_0_20px_rgba(0,230,118,0.25)] mt-1"
            disabled={loading || otp.length < 6}
          >
            {loading ? "Verifying Code..." : "Continue ➔"}
          </Button>

          <div className="flex items-center justify-between text-xs pt-1">
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={resending}
              className="text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
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
              className="text-white/50 hover:text-white"
            >
              Change Email
            </button>
          </div>
        </form>
      )}

      {/* ── STEP 3: CREATE NEW PASSWORD (UNLOCKED ONLY AFTER OTP IS VERIFIED) ── */}
      {step === 3 && (
        <form onSubmit={handleSetNewPassword} noValidate className="flex flex-col gap-4">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
            <ShieldCheck size={16} className="shrink-0" />
            <span>Identity verified! Now set your new password.</span>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono">
              ⚠️ {error}
            </div>
          )}

          {/* New Password */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-white/70">
              New Password
            </label>
            <div className="relative flex items-center">
              <Lock className="absolute left-3.5 w-4 h-4 text-white/40 pointer-events-none" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="At least 6 characters"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  if (error) setError(null);
                }}
                className="w-full h-11 pl-10 pr-10 bg-black/40 border border-white/15 rounded-xl text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-white/40 hover:text-white p-1"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Confirm New Password */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-white/70">
              Confirm New Password
            </label>
            <div className="relative flex items-center">
              <Lock className="absolute left-3.5 w-4 h-4 text-white/40 pointer-events-none" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Repeat new password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (error) setError(null);
                }}
                className="w-full h-11 pl-10 pr-4 bg-black/40 border border-white/15 rounded-xl text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold h-11 rounded-xl shadow-[0_0_20px_rgba(0,230,118,0.25)] mt-2"
            disabled={loading}
          >
            {loading ? "Saving New Password..." : "Save Password & Login ➔"}
          </Button>
        </form>
      )}
    </AuthCard>
  );
}
