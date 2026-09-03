"use client";

/**
 * UniVerse — Forgot & Reset Password via Email OTP
 *
 * Step 1: User enters @marwadiuniversity.ac.in email -> Supabase sends 6-digit OTP code
 * Step 2: User enters 6-digit OTP + New Password -> Verifies OTP & updates password instantly
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, ArrowLeft, CheckCircle2, Lock, KeyRound, Eye, EyeOff, Sparkles, RefreshCw } from "lucide-react";
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

  // Step state: 1 = Enter Email, 2 = Enter OTP & New Password, 3 = Success
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  // Step 1: Request Password Reset OTP
  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    const normalizedEmail = sanitizeEmail(email);
    if (!normalizedEmail) {
      setError("Email address is required.");
      return;
    }
    if (!validateEmail(normalizedEmail)) {
      setError("Only @marwadiuniversity.ac.in email addresses are allowed.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const supabase = createClient();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
        redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
      });

      if (resetError) {
        setError(resetError.message || "Failed to send reset code. Please try again.");
        return;
      }

      setStep(2);
      setInfoMessage(`We've sent a 6-digit OTP verification code to ${normalizedEmail}`);
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred.");
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
      const supabase = createClient();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
        redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
      });

      if (resetError) {
        setError(resetError.message);
      } else {
        setInfoMessage("A fresh 6-digit code has been resent to your email.");
      }
    } catch (err: any) {
      setError(err?.message || "Failed to resend code.");
    } finally {
      setResending(false);
    }
  }

  // Step 2: Verify OTP & Update Password
  async function handleVerifyAndSetPassword(e: React.FormEvent) {
    e.preventDefault();
    const normalizedEmail = sanitizeEmail(email);
    const cleanOtp = otp.trim();

    if (!cleanOtp || cleanOtp.length < 6) {
      setError("Please enter the complete 6-digit OTP code from your email.");
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const supabase = createClient();

      // 1. Verify OTP token with Supabase Auth
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email: normalizedEmail,
        token: cleanOtp,
        type: "recovery",
      });

      if (verifyError) {
        setError(verifyError.message || "Invalid or expired OTP code. Please check your email.");
        setLoading(false);
        return;
      }

      // 2. Set the new password on the verified session
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        setError(updateError.message || "Failed to update password.");
        setLoading(false);
        return;
      }

      // 3. Success!
      setStep(3);
      setTimeout(() => {
        router.push(ROUTES.DASHBOARD);
      }, 2500);
    } catch (err: any) {
      setError(err?.message || "Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard
      title={step === 3 ? "Password Set Successfully!" : step === 2 ? "Enter OTP & New Password" : "Reset your password"}
      subtitle={
        step === 3
          ? "Redirecting to your UniVerse dashboard..."
          : step === 2
          ? "Enter the 6-digit code sent to your email to set your new password"
          : "Enter your college email to receive a 6-digit verification code"
      }
    >
      {/* ── STEP 3: SUCCESS STATE ── */}
      {step === 3 && (
        <div className="flex flex-col items-center gap-6 py-4 text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border-2 border-emerald-500/50 flex items-center justify-center text-emerald-400 shadow-[0_0_25px_rgba(0,230,118,0.3)]">
            <CheckCircle2 size={36} />
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-extrabold text-white">Password Updated!</h3>
            <p className="text-xs text-white/60 max-w-xs">
              Your password has been securely saved. You can now use your email & password anytime.
            </p>
          </div>

          <Button
            type="button"
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold h-11 rounded-xl"
            onClick={() => router.push(ROUTES.DASHBOARD)}
          >
            Go to Dashboard ➔
          </Button>
        </div>
      )}

      {/* ── STEP 1: ENTER EMAIL ── */}
      {step === 1 && (
        <form onSubmit={handleSendOtp} noValidate className="flex flex-col gap-5">
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
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold h-11 rounded-xl shadow-[0_0_20px_rgba(0,230,118,0.25)]"
            disabled={loading}
          >
            {loading ? "Sending 6-Digit OTP..." : "Send OTP Code ➔"}
          </Button>

          <Link
            href={ROUTES.LOGIN}
            className="inline-flex items-center justify-center gap-2 text-xs font-semibold text-white/50 hover:text-white transition-colors duration-150 mt-1"
          >
            <ArrowLeft size={14} />
            Back to sign in
          </Link>
        </form>
      )}

      {/* ── STEP 2: ENTER OTP & NEW PASSWORD ── */}
      {step === 2 && (
        <form onSubmit={handleVerifyAndSetPassword} noValidate className="flex flex-col gap-4">
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

          {/* 6-Digit OTP Input */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-white/70">
              6-Digit Email OTP Code
            </label>
            <div className="relative flex items-center">
              <KeyRound className="absolute left-3.5 w-4 h-4 text-emerald-400 pointer-events-none" />
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="123456"
                value={otp}
                onChange={(e) => {
                  setOtp(e.target.value.replace(/\D/g, "").slice(0, 6));
                  if (error) setError(null);
                }}
                className="w-full h-11 pl-10 pr-4 bg-black/40 border border-emerald-500/40 rounded-xl text-emerald-400 font-mono text-lg tracking-[0.3em] font-bold placeholder:text-white/20 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20"
                autoFocus
              />
            </div>
          </div>

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
                placeholder="Repeat your new password"
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
            {loading ? "Verifying & Saving Password..." : "Verify OTP & Set Password ➔"}
          </Button>

          <div className="flex items-center justify-between text-xs pt-1">
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={resending}
              className="text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
            >
              <RefreshCw size={12} className={resending ? "animate-spin" : ""} />
              {resending ? "Resending..." : "Resend OTP Code"}
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
    </AuthCard>
  );
}

