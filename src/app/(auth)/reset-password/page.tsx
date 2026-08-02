"use client";

/**
 * UniVerse — Reset Password Page
 *
 * Supabase redirects here after the user clicks the reset link in their email.
 * The URL contains a token hash that Supabase uses to identify the session.
 * The user sets a new password on this page.
 *
 * Route: /reset-password
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { AuthCard } from "@/components/auth/AuthCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { ROUTES } from "@/constants/routes";

const PASSWORD_MIN = 8;

function getPasswordStrength(pw: string): { score: number; label: string } {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const labels = ["", "Weak", "Fair", "Good", "Strong", "Very strong"];
  return { score, label: labels[score] ?? "" };
}

const STRENGTH_COLORS = [
  "",
  "bg-[var(--color-error)]",
  "bg-[var(--color-accent)]",
  "bg-[var(--color-accent)]",
  "bg-[var(--color-success)]",
  "bg-[var(--color-success)]",
];

function SuccessState() {
  const router = useRouter();
  return (
    <div className="flex flex-col items-center gap-6 py-4 text-center">
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center"
        style={{ background: "var(--color-success-subtle)" }}
      >
        <CheckCircle2 size={32} className="text-[var(--color-success)]" />
      </div>
      <div className="flex flex-col gap-2">
        <h2
          className="text-lg font-bold text-[var(--color-text)]"
          style={{ fontFamily: "var(--font-plus-jakarta-sans)" }}
        >
          Password updated!
        </h2>
        <p
          className="text-sm text-[var(--color-text-muted)]"
          style={{ fontFamily: "var(--font-inter)" }}
        >
          Your password has been changed successfully.
        </p>
      </div>
      <Button
        variant="primary"
        size="lg"
        fullWidth
        onClick={() => router.push(ROUTES.LOGIN)}
      >
        Sign in with new password
      </Button>
    </div>
  );
}

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ password?: string; confirm?: string; form?: string }>({});
  const [done, setDone] = useState(false);

  const strength = getPasswordStrength(password);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs: typeof errors = {};
    if (!password) errs.password = "Password is required.";
    else if (password.length < PASSWORD_MIN) errs.password = `Minimum ${PASSWORD_MIN} characters.`;
    if (!confirm) errs.confirm = "Please confirm your new password.";
    else if (password !== confirm) errs.confirm = "Passwords do not match.";
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });

    setLoading(false);
    if (error) {
      setErrors({ form: error.message });
    } else {
      setDone(true);
    }
  }

  return (
    <AuthCard title="Set new password" subtitle="Choose a strong password for your account">
      {done ? (
        <SuccessState />
      ) : (
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
          {errors.form && (
            <div
              role="alert"
              className="rounded-[var(--radius-md)] px-4 py-3 text-sm bg-[var(--color-error-subtle)] text-[var(--color-error-foreground)] border border-[var(--color-error)]/30"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              {errors.form}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <Input
              id="reset-password"
              type={showPassword ? "text" : "password"}
              label="New Password"
              placeholder="Min. 8 characters"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              leftIcon={<Lock size={16} />}
              rightIcon={
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((v) => !v)}
                  className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors duration-150"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
              size="lg"
            />
            {password.length > 0 && (
              <div className="flex flex-col gap-1">
                <div className="flex gap-1" aria-label={`Password strength: ${strength.label}`}>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                        i <= strength.score ? STRENGTH_COLORS[strength.score] : "bg-[var(--color-border)]"
                      }`}
                    />
                  ))}
                </div>
                {strength.label && (
                  <p className="text-xs text-[var(--color-text-muted)]" style={{ fontFamily: "var(--font-inter)" }}>
                    Strength: <span className="font-medium">{strength.label}</span>
                  </p>
                )}
              </div>
            )}
          </div>

          <Input
            id="reset-confirm"
            type={showPassword ? "text" : "password"}
            label="Confirm New Password"
            placeholder="Re-enter your new password"
            autoComplete="new-password"
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            error={errors.confirm}
            success={confirm && password === confirm && confirm.length > 0 ? "Passwords match" : undefined}
            leftIcon={<Lock size={16} />}
            size="lg"
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={loading}
            loadingText="Updating password…"
          >
            Update Password
          </Button>
        </form>
      )}
    </AuthCard>
  );
}
