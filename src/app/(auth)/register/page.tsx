"use client";

/**
 * UniVerse — Register Page
 *
 * Step 1 of onboarding: account creation with university email validation.
 * Frontend-only validation. Backend integration deferred to Phase 3.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react";
import { AuthCard } from "@/components/auth/AuthCard";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

// ─── Validation ──────────────────────────────────────────────────────────────

const MU_EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@marwadiuniversity\.ac\.in$/i;
const PASSWORD_MIN = 8;

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirm?: string;
  form?: string;
}

function validate(fields: {
  name: string;
  email: string;
  password: string;
  confirm: string;
  agreed: boolean;
}): FormErrors {
  const errs: FormErrors = {};
  if (!fields.name.trim()) errs.name = "Full name is required.";
  else if (fields.name.trim().length < 2) errs.name = "Name must be at least 2 characters.";

  if (!fields.email) errs.email = "University email is required.";
  else if (!MU_EMAIL_REGEX.test(fields.email))
    errs.email = "Must be a @marwadiuniversity.ac.in email address.";

  if (!fields.password) errs.password = "Password is required.";
  else if (fields.password.length < PASSWORD_MIN)
    errs.password = `Password must be at least ${PASSWORD_MIN} characters.`;

  if (!fields.confirm) errs.confirm = "Please confirm your password.";
  else if (fields.password !== fields.confirm) errs.confirm = "Passwords do not match.";

  if (!fields.agreed) errs.form = "You must agree to the Terms & Privacy Policy to continue.";

  return errs;
}

// ─── Password strength meter ─────────────────────────────────────────────────

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

// ─── Page ────────────────────────────────────────────────────────────────────

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const strength = getPasswordStrength(password);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate({ name, email, password, confirm, agreed });
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);

    const supabase = createClient();

    // We use a raw fetch first to capture the actual Supabase error body,
    // because the supabase-js client wraps HTTP-500 responses as
    // AuthRetryableFetchError with message="{}" losing the real msg.
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
    let realErrorMsg = "";
    try {
      const raw = await fetch(`${supabaseUrl}/auth/v1/signup`, {
        method: "POST",
        headers: {
          "apikey": supabaseKey,
          "Authorization": `Bearer ${supabaseKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          data: { full_name: name },
        }),
      });
      if (!raw.ok) {
        const body = await raw.json().catch(() => ({}));
        // body.msg is the GoTrue error field (e.g. "Error sending confirmation email")
        realErrorMsg = body.msg || body.error_description || body.message || `HTTP ${raw.status}`;
        console.error("[Register] Supabase raw error:", raw.status, body);
      }
    } catch {
      // Network error — fall through to the supabase-js call which will also fail
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setLoading(false);

    if (error) {
      // Use the real GoTrue error if we captured it, otherwise fall back to the JS client message
      const msg = realErrorMsg || error.message || "Registration failed.";

      if (msg.toLowerCase().includes("already registered") || msg.toLowerCase().includes("user already exists")) {
        setErrors({ form: "An account with this email already exists. Try signing in instead." });
      } else if (msg.toLowerCase().includes("error sending confirmation email")) {
        setErrors({
          form: `Supabase cannot send verification emails (SMTP failure). ` +
            `To fix: Go to Supabase Dashboard → Authentication → Settings → ` +
            `Email Auth → turn OFF "Enable email confirmations" → Save. ` +
            `(Raw error: "${msg}")`,
        });
      } else {
        setErrors({ form: `Registration error: ${msg}` });
      }
      return;
    }

    // Signup succeeded. If email confirmation is disabled, data.session is set → go to dashboard.
    // If email confirmation is enabled and working, data.session is null → go to verify-email page.
    if (data?.session) {
      router.push("/dashboard");
    } else {
      router.push(ROUTES.VERIFY_EMAIL);
    }
  }

  return (
    <AuthCard
      title="Create your account"
      subtitle="Join UniVerse — exclusively for Marwadi University"
    >
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        {/* Global error */}
        {errors.form && (
          <div
            role="alert"
            className="rounded-[var(--radius-md)] px-4 py-3 text-sm bg-[var(--color-error-subtle)] text-[var(--color-error-foreground)] border border-[var(--color-error)]/30"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            {errors.form}
          </div>
        )}

        {/* Full Name */}
        <Input
          id="reg-name"
          type="text"
          label="Full Name"
          placeholder="Avinash Kumar"
          autoComplete="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
          leftIcon={<User size={16} />}
          size="lg"
        />

        {/* University Email */}
        <Input
          id="reg-email"
          type="email"
          label="University Email"
          placeholder="you@marwadiuniversity.ac.in"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          leftIcon={<Mail size={16} />}
          size="lg"
          hint="Must end with @marwadiuniversity.ac.in"
        />

        {/* Password */}
        <div className="flex flex-col gap-1.5">
          <Input
            id="reg-password"
            type={showPassword ? "text" : "password"}
            label="Password"
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
          {/* Strength meter */}
          {password.length > 0 && (
            <div className="flex flex-col gap-1">
              <div className="flex gap-1" aria-label={`Password strength: ${strength.label}`}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className={cn(
                      "h-1 flex-1 rounded-full transition-all duration-300",
                      i <= strength.score ? STRENGTH_COLORS[strength.score] : "bg-[var(--color-border)]"
                    )}
                  />
                ))}
              </div>
              {strength.label && (
                <p
                  className="text-xs text-[var(--color-text-muted)]"
                  style={{ fontFamily: "var(--font-inter)" }}
                >
                  Strength: <span className="font-medium">{strength.label}</span>
                </p>
              )}
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <Input
          id="reg-confirm"
          type={showConfirm ? "text" : "password"}
          label="Confirm Password"
          placeholder="Re-enter your password"
          autoComplete="new-password"
          required
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          error={errors.confirm}
          success={confirm && password === confirm && confirm.length > 0 ? "Passwords match" : undefined}
          leftIcon={<Lock size={16} />}
          rightIcon={
            <button
              type="button"
              aria-label={showConfirm ? "Hide password" : "Show password"}
              onClick={() => setShowConfirm((v) => !v)}
              className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors duration-150"
            >
              {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          }
          size="lg"
        />

        {/* Terms checkbox */}
        <label className="flex items-start gap-3 cursor-pointer group select-none">
          <span className="relative inline-flex items-center justify-center mt-0.5 flex-shrink-0">
            <input
              id="reg-terms"
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="sr-only peer"
              aria-required="true"
            />
            <span
              className={cn(
                "w-4 h-4 rounded-[var(--radius-xs)] border-2 flex items-center justify-center transition-all duration-150",
                agreed
                  ? "bg-[var(--color-primary)] border-[var(--color-primary)]"
                  : "bg-white border-[var(--color-border-strong)] group-hover:border-[var(--color-primary)]"
              )}
              aria-hidden="true"
            >
              {agreed && (
                <svg viewBox="0 0 10 8" width="10" height="8" fill="none" aria-hidden="true">
                  <path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </span>
          </span>
          <span
            className="text-sm text-[var(--color-text-secondary)] leading-snug"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            I agree to the{" "}
            <Link href={ROUTES.TERMS} className="text-[var(--color-primary)] hover:underline underline-offset-4 font-medium">
              Terms of Service
            </Link>{" "}
            &amp;{" "}
            <Link href={ROUTES.PRIVACY} className="text-[var(--color-primary)] hover:underline underline-offset-4 font-medium">
              Privacy Policy
            </Link>
          </span>
        </label>

        {/* Submit */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          isLoading={loading}
          loadingText="Creating account…"
        >
          Create Account
        </Button>

        {/* Divider */}
        <div className="divider-label">OR</div>

        {/* Google */}
        <GoogleButton label="Continue with Google" />
      </form>

      {/* Footer */}
      <p
        className="mt-6 text-center text-sm text-[var(--color-text-muted)]"
        style={{ fontFamily: "var(--font-inter)" }}
      >
        Already have an account?{" "}
        <Link
          href={ROUTES.LOGIN}
          className="font-semibold text-[var(--color-primary)] hover:underline underline-offset-4"
        >
          Sign in
        </Link>
      </p>
    </AuthCard>
  );
}
