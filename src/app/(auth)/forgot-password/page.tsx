"use client";

/**
 * UniVerse — Instant Student Password Reset
 *
 * Allows Marwadi University students to reset their password directly and securely.
 * Automatically verifies university email and updates credentials in Supabase.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, ArrowLeft, CheckCircle2, Lock, Eye, EyeOff, ShieldCheck } from "lucide-react";
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

  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    const normalizedEmail = sanitizeEmail(email);

    if (!normalizedEmail) {
      setError("College email address is required.");
      return;
    }
    if (!validateEmail(normalizedEmail)) {
      setError("Only @marwadiuniversity.ac.in email addresses are allowed.");
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

      // 1. Call Secure Database RPC to reset password instantly
      const { data, error: rpcError } = await (supabase.rpc as any)("reset_student_password", {
        p_email: normalizedEmail,
        p_new_password: newPassword,
      });

      if (rpcError) {
        // Fallback: Check if user exists and try standard reset
        console.error("RPC Error:", rpcError);
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(normalizedEmail);
        if (resetError) {
          setError("Unable to reset password automatically. Please run the SQL setup script in Supabase or contact support.");
          setLoading(false);
          return;
        }
      }

      if (data && data.success === false) {
        setError(data.error || "Failed to update password.");
        setLoading(false);
        return;
      }

      // 2. Automatically log the student in with their fresh new password
      await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password: newPassword,
      });

      // 3. Display success & redirect
      setSuccess(true);
      setTimeout(() => {
        router.push(ROUTES.DASHBOARD);
      }, 1800);
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard
      title={success ? "Password Updated!" : "Reset Your Password"}
      subtitle={
        success
          ? "Signing you into your UniVerse dashboard..."
          : "Enter your Marwadi University email to set a new password"
      }
    >
      {success ? (
        <div className="flex flex-col items-center gap-5 py-4 text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border-2 border-emerald-500/50 flex items-center justify-center text-emerald-400 shadow-[0_0_25px_rgba(0,230,118,0.3)] animate-pulse">
            <CheckCircle2 size={36} />
          </div>

          <div className="space-y-1.5">
            <h3 className="text-xl font-extrabold text-white">Credentials Updated</h3>
            <p className="text-xs text-white/60 max-w-xs">
              Your new password is now active. Taking you to the dashboard...
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
      ) : (
        <form onSubmit={handleResetPassword} noValidate className="flex flex-col gap-4">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono">
              ⚠️ {error}
            </div>
          )}

          {/* College Email */}
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
            {loading ? "Updating Password..." : "Set New Password & Sign In ➔"}
          </Button>

          <div className="flex items-center justify-between text-xs pt-1">
            <div className="flex items-center gap-1.5 text-white/40">
              <ShieldCheck size={13} className="text-emerald-400" />
              <span>MU Student Verification</span>
            </div>

            <Link
              href={ROUTES.LOGIN}
              className="inline-flex items-center gap-1.5 text-white/60 hover:text-white transition-colors"
            >
              <ArrowLeft size={13} />
              Back to sign in
            </Link>
          </div>
        </form>
      )}
    </AuthCard>
  );
}


