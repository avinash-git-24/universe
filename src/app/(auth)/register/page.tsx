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
import { Eye, EyeOff, Mail, Lock, User, Users } from "lucide-react";
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
    <>
      <div className="fixed inset-0 z-0 bg-gradient-to-br from-[#020503] via-[#020503] to-[#041008] pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-emerald-500/5 rounded-full blur-[150px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_30%,transparent_100%)]" />
      </div>

      <div className="w-full max-w-[1100px] mx-auto flex flex-col min-h-[100dvh] justify-center py-10 lg:py-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center w-full mt-auto mb-auto">

          {/* LEFT COLUMN: BRANDING */}
          <div className="flex flex-col gap-10 text-left relative w-full max-w-[460px] mx-auto lg:mx-0">

            {/* Logo & Badge */}
            <div className="space-y-5">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.4)]">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-black">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                  </svg>
                </div>
                <span className="text-[28px] font-extrabold text-white tracking-tight leading-none pt-1">UniVerse</span>
              </div>
              <p className="text-[#a1a1aa] text-[15px] font-medium tracking-wide">One Universe. Infinite Possibilities.</p>

              <div className="inline-flex items-center gap-2 border border-emerald-500/30 bg-emerald-500/5 px-3 py-1.5 rounded-full w-fit shadow-[inset_0_0_10px_rgba(16,185,129,0.05)]">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                <span className="text-xs font-semibold text-emerald-400 tracking-wide">Exclusively for Marwadi University</span>
              </div>
            </div>

            {/* Headline */}
            <div className="space-y-4">
              <h1 className="text-[44px] leading-[1.1] font-extrabold text-white tracking-tight">
                Delivering more <br /> than packages.<br />
                <span className="text-emerald-500">Building trust.</span>
              </h1>
              <p className="text-[#a1a1aa] text-base leading-relaxed pr-6 font-medium">
                A secure and reliable platform for students to send and receive within campus.
              </p>
            </div>

            {/* Benefits */}
            <div className="space-y-7 pt-4">
              <div className="flex gap-4 items-center">
                <div className="w-14 h-14 rounded-full border border-emerald-500/40 bg-[#040805] flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(16,185,129,0.15)] relative z-20">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-emerald-500"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
                </div>
                <div className="space-y-0.5 relative z-20">
                  <h3 className="text-white font-bold text-[15px] tracking-wide">Fast Campus Deliveries</h3>
                  <p className="text-[#a1a1aa] text-[13px] leading-relaxed">Quick pickup and on-time delivery anywhere in campus.</p>
                </div>
              </div>

              <div className="flex gap-4 items-center">
                <div className="w-14 h-14 rounded-full border border-emerald-500/40 bg-[#040805] flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(16,185,129,0.15)] relative z-20">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="m9 12 2 2 4-4" /></svg>
                </div>
                <div className="space-y-0.5 relative z-20">
                  <h3 className="text-white font-bold text-[15px] tracking-wide">Verified Students Only</h3>
                  <p className="text-[#a1a1aa] text-[13px] leading-relaxed">Safe, trusted and verified student community.</p>
                </div>
              </div>

              <div className="flex gap-4 items-center">
                <div className="w-14 h-14 rounded-full border border-emerald-500/40 bg-[#040805] flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(16,185,129,0.15)] relative z-20">
                  <Lock className="w-6 h-6 text-emerald-500" />
                </div>
                <div className="space-y-0.5 relative z-20">
                  <h3 className="text-white font-bold text-[15px] tracking-wide">Secure & Private</h3>
                  <p className="text-[#a1a1aa] text-[13px] leading-relaxed">Your data is encrypted and your privacy is our priority.</p>
                </div>
              </div>
            </div>

            {/* Decorative Abstract Art */}
            <div className="absolute -bottom-32 -left-12 opacity-90 pointer-events-none hidden lg:block select-none z-0">
              <div className="w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

              <div className="relative w-[400px] h-[350px]">

                {/* Concentric rings floor */}
                <div className="absolute bottom-10 left-10 w-[220px] h-[70px] border border-emerald-500/20 rounded-[100%] shadow-[0_0_40px_rgba(16,185,129,0.1)]" />
                <div className="absolute bottom-12 left-16 w-[170px] h-[50px] border border-emerald-500/40 rounded-[100%]" />
                <div className="absolute bottom-14 left-24 w-[110px] h-[30px] border border-emerald-500/60 rounded-[100%] bg-emerald-500/10" />

                {/* Glowing Route / Nodes */}
                <svg width="400" height="300" className="absolute bottom-16 left-10 z-10" viewBox="0 0 400 300" fill="none">
                  <path d="M380,40 C 350,150 250,120 180,200 C 130,260 80,240 20,250" stroke="rgba(16,185,129,0.5)" strokeWidth="2" strokeDasharray="4 6" strokeLinecap="round" />
                  <circle cx="380" cy="40" r="5" fill="#10B981" className="drop-shadow-[0_0_10px_rgba(16,185,129,1)]" />
                  <circle cx="342" cy="113" r="3" fill="#10B981" opacity="0.8" />
                  <circle cx="280" cy="145" r="4" fill="#10B981" className="drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                  <circle cx="180" cy="200" r="3" fill="#10B981" opacity="0.6" />
                  <circle cx="95" cy="245" r="4" fill="#10B981" className="drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                  <circle cx="20" cy="250" r="2" fill="#10B981" />
                </svg>

                {/* 3D Package SVG */}
                <svg width="120" height="120" viewBox="0 0 120 120" fill="none" className="absolute bottom-16 left-24 z-20 drop-shadow-[0_15px_30px_rgba(0,0,0,0.8)]">
                  {/* Cube Top */}
                  <path d="M60 20 L110 45 L60 70 L10 45 Z" fill="#0c1f14" stroke="#10b981" strokeWidth="1" strokeOpacity="0.4" />
                  {/* Cube Left */}
                  <path d="M10 45 L60 70 L60 115 L10 90 Z" fill="#040a06" stroke="#10b981" strokeWidth="1" strokeOpacity="0.3" />
                  {/* Cube Right */}
                  <path d="M60 70 L110 45 L110 90 L60 115 Z" fill="#07120a" stroke="#10b981" strokeWidth="1" strokeOpacity="0.5" />

                  {/* Ribbon Top 1 (Left to Right) */}
                  <path d="M35 32.5 L85 57.5 L90 55 L40 30 Z" fill="#020503" stroke="#10b981" strokeWidth="1" strokeOpacity="0.4" />
                  {/* Ribbon Top 2 (Right to Left) */}
                  <path d="M85 32.5 L35 57.5 L30 55 L80 30 Z" fill="#020503" stroke="#10b981" strokeWidth="1" strokeOpacity="0.4" />

                  {/* Ribbon Left Face */}
                  <path d="M35 57.5 L35 102.5 L30 100 L30 55 Z" fill="#020503" stroke="#10b981" strokeWidth="1" strokeOpacity="0.3" />
                  {/* Ribbon Right Face */}
                  <path d="M85 57.5 L85 102.5 L90 100 L90 55 Z" fill="#020503" stroke="#10b981" strokeWidth="1" strokeOpacity="0.5" />

                  {/* Lightning Bolt */}
                  <path d="M75 75 L68 85 L75 85 L72 95 L85 82 L77 82 L82 72 Z" fill="#10b981" className="drop-shadow-[0_0_10px_rgba(16,185,129,1)]" />
                </svg>

              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: FORM CARD */}
          <div className="w-full max-w-[480px] mx-auto relative z-20">

            <div className="relative bg-gradient-to-b from-[#0a120d]/95 to-[#030604]/95 backdrop-blur-2xl border border-emerald-500/20 rounded-[32px] p-8 sm:p-10 overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.6),0_0_80px_rgba(16,185,129,0.08)]">

              <div className="mb-7">
                <h2 className="text-[32px] font-bold text-white mb-2 tracking-tight flex items-center gap-3">
                  Create <span className="text-emerald-500">your account</span>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]"><path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill="currentColor" /></svg>
                </h2>
                <p className="text-[#a1a1aa] text-[15px] font-medium">Join UniVerse — exclusively for Marwadi University</p>
              </div>

              <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
                {/* Global error */}
                {errors.form && (
                  <div role="alert" className="rounded-lg px-4 py-3 text-sm bg-red-500/10 text-red-400 border border-red-500/30">
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
                  leftIcon={<User size={18} className="opacity-70" />}
                  size="lg"
                  className="!bg-[#040805] !border-white/10 !text-white placeholder:!text-white/30 focus:!border-emerald-500 focus:!ring-1 focus:!ring-emerald-500 !shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)] focus:!shadow-[0_0_15px_rgba(16,185,129,0.2)] !rounded-[12px] !h-11"
                />

                {/* University Email */}
                <div className="flex flex-col gap-1.5">
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
                    leftIcon={<Mail size={18} className="opacity-70" />}
                    size="lg"
                    className="!bg-[#040805] !border-white/10 !text-white placeholder:!text-white/30 focus:!border-emerald-500 focus:!ring-1 focus:!ring-emerald-500 !shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)] focus:!shadow-[0_0_15px_rgba(16,185,129,0.2)] !rounded-[12px] !h-11"
                  />
                  {!errors.email && (
                    <p className="text-[13px] text-[#a1a1aa] font-[family-name:var(--font-inter)]">
                      Must end with <span className="text-emerald-500/80">@marwadiuniversity.ac.in</span>
                    </p>
                  )}
                </div>

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
                    leftIcon={<Lock size={18} className="opacity-70" />}
                    rightIcon={
                      <button
                        type="button"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        onClick={() => setShowPassword((v) => !v)}
                        className="text-white/40 hover:text-white transition-colors"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    }
                    size="lg"
                    className="!bg-[#040805] !border-white/10 !text-white placeholder:!text-white/30 focus:!border-emerald-500 focus:!ring-1 focus:!ring-emerald-500 !shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)] focus:!shadow-[0_0_15px_rgba(16,185,129,0.2)] !rounded-[12px] !h-11"
                  />
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
                  leftIcon={<Lock size={18} className="opacity-70" />}
                  rightIcon={
                    <button
                      type="button"
                      aria-label={showConfirm ? "Hide password" : "Show password"}
                      onClick={() => setShowConfirm((v) => !v)}
                      className="text-white/40 hover:text-white transition-colors"
                    >
                      {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  }
                  size="lg"
                  className="!bg-[#040805] !border-white/10 !text-white placeholder:!text-white/30 focus:!border-emerald-500 focus:!ring-1 focus:!ring-emerald-500 !shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)] focus:!shadow-[0_0_15px_rgba(16,185,129,0.2)] !rounded-[12px] !h-11"
                />

                {/* Terms checkbox */}
                <label className="flex items-center gap-3 cursor-pointer group select-none mt-2">
                  <span className="relative inline-flex items-center justify-center shrink-0">
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
                        "w-4 h-4 rounded border flex items-center justify-center transition-all duration-150",
                        agreed
                          ? "bg-emerald-500 border-emerald-500"
                          : "bg-transparent border-white/20 group-hover:border-emerald-500/50"
                      )}
                    >
                      {agreed && (
                        <svg viewBox="0 0 10 8" width="10" height="8" fill="none">
                          <path d="M1 4l2.5 2.5L9 1" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </span>
                  </span>
                  <span className="text-[13px] text-[#a1a1aa] font-medium leading-none mt-0.5">
                    I agree to the{" "}
                    <Link href={ROUTES.TERMS} className="text-emerald-500 hover:text-emerald-400 transition-colors">
                      Terms of Service
                    </Link>
                    {" "}&amp;{" "}
                    <Link href={ROUTES.PRIVACY} className="text-emerald-500 hover:text-emerald-400 transition-colors">
                      Privacy Policy
                    </Link>
                  </span>
                </label>

                {/* Submit */}
                <Button
                  type="submit"
                  size="lg"
                  fullWidth
                  isLoading={loading}
                  loadingText="Creating account…"
                  className="bg-[#10B981] hover:bg-[#34D399] text-black font-bold mt-2 shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] transition-all duration-300 h-[50px] rounded-[14px] text-[16px] group"
                >
                  Create Account <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                </Button>

                {/* Divider */}
                <div className="relative flex items-center py-2">
                  <div className="flex-grow border-t border-white/5"></div>
                  <span className="flex-shrink-0 mx-4 text-xs font-semibold text-white/20 uppercase tracking-widest">OR</span>
                  <div className="flex-grow border-t border-white/5"></div>
                </div>

                {/* Google */}
                <GoogleButton label="Continue with Google" />
              </form>

              <p className="mt-6 text-center text-[14px] text-[#a1a1aa] font-medium">
                Already have an account?{" "}
                <Link
                  href={ROUTES.LOGIN}
                  className="font-bold text-emerald-500 hover:text-emerald-400 transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* BOTTOM ROW (Trust Indicators) */}
        <div className="mt-auto pt-10 pb-4 w-full flex flex-wrap items-center justify-center gap-x-6 gap-y-4 text-[13px] font-medium text-[#a1a1aa] relative z-20 opacity-90">
          <div className="flex items-center gap-2.5">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
            <span>256-bit Encrypted</span>
          </div>
          <div className="w-1.5 h-1.5 rounded-full bg-[#27272a]" />
          <div className="flex items-center gap-2.5">
            <Lock className="w-4 h-4 text-emerald-500" strokeWidth={2} />
            <span>Your Data is Private</span>
          </div>
          <div className="w-1.5 h-1.5 rounded-full bg-[#27272a]" />
          <div className="flex items-center gap-2.5">
            <Users className="w-4 h-4 text-emerald-500" strokeWidth={2} />
            <span>Trusted by Students</span>
          </div>
        </div>
      </div>
    </>
  );
}
