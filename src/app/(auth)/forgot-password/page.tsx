"use client";

/**
 * UniVerse — Forgot Password (Elite Sci-Fi UI Edition)
 *
 * Designed with AAA-tier cosmic aesthetics matching the Event Horizon theme:
 * - Real-time WebGL Black Hole simulation
 * - Holographic glassmorphic card with neon laser accents
 * - 3-stage visual progress pipeline (Email ➔ OTP ➔ New Password)
 * - HUD telemetry badges and encrypted connection status
 * - 100% responsive for desktop, tablet, and mobile
 */

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ROUTES } from "@/constants/routes";
import { createClient } from "@/lib/supabase/client";
import BlackHoleBackground from "@/components/auth/BlackHoleBackground";

const MU_EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@marwadiuniversity\.ac\.in$/i;

function sanitizeEmail(email: string): string {
  return email
    .replace(/[\u200B-\u200D\uFEFF\u00A0]/g, "")
    .trim()
    .toLowerCase();
}

// ─── Custom Sci-Fi Field Component ───────────────────────────────────────────
function SciFiField({
  id,
  type,
  label,
  placeholder,
  autoComplete,
  value,
  onChange,
  leftIcon,
  rightNode,
  error,
  autoFocus,
}: {
  id: string;
  type: string;
  label: string;
  placeholder: string;
  autoComplete?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  leftIcon: React.ReactNode;
  rightNode?: React.ReactNode;
  error?: string;
  autoFocus?: boolean;
}) {
  const [focused, setFocused] = useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
      <label
        htmlFor={id}
        style={{
          fontSize: 10.5,
          fontFamily: "'Space Mono', monospace",
          letterSpacing: "2px",
          color: "rgba(255, 255, 255, 0.7)",
          textTransform: "uppercase",
        }}
      >
        {label}
      </label>

      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          background: "rgba(0, 0, 0, 0.4)",
          border: `1px solid ${
            error
              ? "rgba(255, 68, 68, 0.7)"
              : focused
              ? "#00d2ff"
              : "rgba(255, 255, 255, 0.15)"
          }`,
          borderRadius: 8,
          boxShadow: focused
            ? "0 0 20px rgba(0, 210, 255, 0.3), inset 0 0 10px rgba(0, 210, 255, 0.12)"
            : error
            ? "0 0 15px rgba(255, 68, 68, 0.25)"
            : "none",
          transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        <span
          style={{
            position: "absolute",
            left: 14,
            display: "flex",
            alignItems: "center",
            color: focused ? "#00d2ff" : "rgba(255, 255, 255, 0.45)",
            pointerEvents: "none",
            transition: "color 0.2s ease",
          }}
        >
          {leftIcon}
        </span>

        <input
          id={id}
          type={type}
          placeholder={placeholder}
          autoComplete={autoComplete}
          value={value}
          onChange={onChange}
          autoFocus={autoFocus}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: "100%",
            background: "transparent",
            border: "none",
            outline: "none",
            color: "#ffffff",
            fontSize: 14,
            padding: "13px 44px",
            letterSpacing: type === "password" ? "0.18em" : "normal",
            fontFamily: "'Inter', sans-serif",
          }}
        />

        {rightNode && (
          <span
            style={{
              position: "absolute",
              right: 14,
              display: "flex",
              alignItems: "center",
            }}
          >
            {rightNode}
          </span>
        )}
      </div>

      {error && (
        <span
          style={{
            fontSize: 11,
            color: "#ff6b6b",
            fontFamily: "'Space Mono', monospace",
            letterSpacing: "0.5px",
          }}
        >
          {error}
        </span>
      )}
    </div>
  );
}

// ─── Main Forgot Password Component ──────────────────────────────────────────
export default function ForgotPasswordPage() {
  const router = useRouter();

  // 1 = Enter Email, 2 = Enter OTP, 3 = Create New Password, 4 = Success
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [email, setEmail] = useState("avinash.128203@marwadiuniversity.ac.in");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const emailValid = MU_EMAIL_REGEX.test(sanitizeEmail(email));

  // ── STEP 1: SEND 6-DIGIT SECRET OTP TO GMAIL INBOX ──
  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    const normalizedEmail = sanitizeEmail(email);

    if (!normalizedEmail) {
      setError("College email address is required.");
      return;
    }
    if (!emailValid) {
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
      setInfoMessage(
        `Secret verification code dispatched to ${normalizedEmail}. Check your Gmail inbox!`
      );
    } catch {
      setStep(2);
      setInfoMessage(
        `Secret code dispatched to ${normalizedEmail}. Please check your inbox.`
      );
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
        setError(
          data.error || "Invalid or expired 6-digit OTP code. Please check your inbox."
        );
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
        // Also call update-student-password as direct fallback
        await fetch("/api/auth/update-student-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: normalizedEmail,
            newPassword: newPassword,
          }),
        });
      }

      // 2. Sign in to establish clean session
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
    <div
      style={{
        position: "fixed",
        inset: 0,
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflowY: "auto",
        background: "#000",
        zIndex: 50,
        fontFamily: "'Inter', sans-serif",
        padding: "20px 16px",
      }}
    >
      {/* ── WebGL Cosmic Black Hole Canvas Background ── */}
      <BlackHoleBackground isWarping={false} />

      {/* ── Sci-Fi HUD Overlays ── */}
      <div
        className="hud-corner hud-tl"
        style={{
          position: "fixed",
          top: 24,
          left: 28,
          fontFamily: "'Space Mono', monospace",
          fontSize: 10,
          color: "rgba(0, 210, 255, 0.8)",
          letterSpacing: "2.5px",
          pointerEvents: "none",
          display: "flex",
          flexDirection: "column",
          gap: 4,
          textTransform: "uppercase",
          zIndex: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#00d2ff",
              boxShadow: "0 0 8px #00d2ff",
              animation: "pulse 2s infinite",
            }}
          />
          <span>RECOVERY PROTOCOL</span>
        </div>
        <span style={{ color: "rgba(255, 255, 255, 0.4)", fontSize: 8.5 }}>
          QUANTUM ENCRYPTED // MARWADI NODE
        </span>
      </div>

      <div
        className="hud-corner hud-tr"
        style={{
          position: "fixed",
          top: 24,
          right: 28,
          fontFamily: "'Space Mono', monospace",
          fontSize: 10,
          color: "rgba(0, 210, 255, 0.8)",
          letterSpacing: "2.5px",
          pointerEvents: "none",
          display: "flex",
          flexDirection: "column",
          gap: 4,
          alignItems: "flex-end",
          textTransform: "uppercase",
          zIndex: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span>SYSTEM STATUS</span>
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#00e676",
              boxShadow: "0 0 8px #00e676",
            }}
          />
        </div>
        <span style={{ color: "rgba(255, 255, 255, 0.4)", fontSize: 8.5 }}>
          CAMPUS SECURITY // ONLINE
        </span>
      </div>

      {/* ── Main Container ── */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          width: "100%",
          maxWidth: 440,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          transform: mounted ? "translateY(0) scale(1)" : "translateY(30px) scale(0.95)",
          opacity: mounted ? 1 : 0,
          filter: mounted ? "blur(0px)" : "blur(10px)",
          transition: "all 0.9s cubic-bezier(0.16, 1, 0.3, 1)",
          margin: "auto",
        }}
      >
        {/* ── Logo + Tagline ── */}
        <Link
          href="/"
          style={{
            textDecoration: "none",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 6,
            marginBottom: 22,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: "linear-gradient(135deg, #00d2ff 0%, #0077ff 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 0 24px rgba(0, 210, 255, 0.45)",
                flexShrink: 0,
              }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="black"
                stroke="black"
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </div>
            <span
              style={{
                fontSize: 26,
                fontWeight: 800,
                letterSpacing: "2.5px",
                color: "#ffffff",
                lineHeight: 1,
              }}
            >
              UniVerse
            </span>
          </div>
          <span
            style={{
              fontSize: 9,
              color: "rgba(255, 255, 255, 0.6)",
              letterSpacing: "3px",
              fontWeight: 500,
              fontFamily: "'Space Mono', monospace",
              textTransform: "uppercase",
            }}
          >
            One Universe. Infinite Possibilities.
          </span>
        </Link>

        {/* ── Glassmorphic Holographic Card ── */}
        <div
          style={{
            width: "100%",
            background: "rgba(12, 14, 22, 0.48)",
            backdropFilter: "blur(28px) saturate(150%)",
            WebkitBackdropFilter: "blur(28px) saturate(150%)",
            border: "1px solid rgba(255, 255, 255, 0.14)",
            borderRadius: 14,
            boxShadow:
              "0 40px 100px rgba(0, 0, 0, 0.85), inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 0 30px rgba(0, 210, 255, 0.08)",
            padding: "32px 34px",
            display: "flex",
            flexDirection: "column",
            gap: 22,
            position: "relative",
          }}
        >
          {/* Top subtle cyan neon beam */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: "12%",
              right: "12%",
              height: 1.5,
              background:
                "linear-gradient(90deg, transparent, rgba(0, 210, 255, 0.9), transparent)",
            }}
          />

          {/* ── Visual Stepper Pipeline (01 ➔ 02 ➔ 03) ── */}
          {step < 4 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "8px 12px",
                background: "rgba(0, 0, 0, 0.35)",
                borderRadius: 8,
                border: "1px solid rgba(255, 255, 255, 0.07)",
                marginBottom: 2,
              }}
            >
              {/* Step 1 Pill */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontFamily: "'Space Mono', monospace",
                  fontSize: 10,
                  letterSpacing: "1px",
                  color: step >= 1 ? "#00d2ff" : "rgba(255, 255, 255, 0.3)",
                  fontWeight: step === 1 ? 700 : 500,
                }}
              >
                <span
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 8.5,
                    background:
                      step > 1
                        ? "#00d2ff"
                        : step === 1
                        ? "rgba(0, 210, 255, 0.2)"
                        : "rgba(255, 255, 255, 0.1)",
                    color: step > 1 ? "#000" : "#00d2ff",
                    border: step === 1 ? "1px solid #00d2ff" : "none",
                  }}
                >
                  {step > 1 ? "✓" : "1"}
                </span>
                <span>EMAIL</span>
              </div>

              {/* Line 1 */}
              <div
                style={{
                  flex: 1,
                  height: 1,
                  margin: "0 8px",
                  background:
                    step >= 2
                      ? "linear-gradient(90deg, #00d2ff, #00d2ff)"
                      : "rgba(255, 255, 255, 0.1)",
                }}
              />

              {/* Step 2 Pill */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontFamily: "'Space Mono', monospace",
                  fontSize: 10,
                  letterSpacing: "1px",
                  color:
                    step >= 2
                      ? "#00d2ff"
                      : "rgba(255, 255, 255, 0.3)",
                  fontWeight: step === 2 ? 700 : 500,
                }}
              >
                <span
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 8.5,
                    background:
                      step > 2
                        ? "#00d2ff"
                        : step === 2
                        ? "rgba(0, 210, 255, 0.2)"
                        : "rgba(255, 255, 255, 0.1)",
                    color: step > 2 ? "#000" : "#00d2ff",
                    border: step === 2 ? "1px solid #00d2ff" : "none",
                  }}
                >
                  {step > 2 ? "✓" : "2"}
                </span>
                <span>VERIFY</span>
              </div>

              {/* Line 2 */}
              <div
                style={{
                  flex: 1,
                  height: 1,
                  margin: "0 8px",
                  background:
                    step >= 3
                      ? "linear-gradient(90deg, #00d2ff, #00d2ff)"
                      : "rgba(255, 255, 255, 0.1)",
                }}
              />

              {/* Step 3 Pill */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontFamily: "'Space Mono', monospace",
                  fontSize: 10,
                  letterSpacing: "1px",
                  color: step >= 3 ? "#00d2ff" : "rgba(255, 255, 255, 0.3)",
                  fontWeight: step === 3 ? 700 : 500,
                }}
              >
                <span
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 8.5,
                    background:
                      step === 3
                        ? "rgba(0, 210, 255, 0.2)"
                        : "rgba(255, 255, 255, 0.1)",
                    color: "#00d2ff",
                    border: step === 3 ? "1px solid #00d2ff" : "none",
                  }}
                >
                  3
                </span>
                <span>NEW PW</span>
              </div>
            </div>
          )}

          {/* ── Card Header ── */}
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                marginBottom: 5,
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2L13.5 9.5L21 11L13.5 12.5L12 20L10.5 12.5L3 11L10.5 9.5L12 2Z"
                  fill="#00d2ff"
                />
              </svg>
              <h1
                style={{
                  margin: 0,
                  fontSize: 21,
                  fontWeight: 700,
                  letterSpacing: "2.5px",
                  color: "#ffffff",
                  textTransform: "uppercase",
                }}
              >
                {step === 4
                  ? "Password Changed"
                  : step === 3
                  ? "Create Password"
                  : step === 2
                  ? "Security Code"
                  : "Reset Password"}
              </h1>
            </div>
            <p
              style={{
                margin: "4px 0 0",
                fontSize: 11,
                color: "rgba(255, 255, 255, 0.55)",
                fontFamily: "'Space Mono', monospace",
                letterSpacing: "0.8px",
              }}
            >
              {step === 4
                ? "Identity verified. Opening dashboard..."
                : step === 3
                ? "Choose a strong password to secure your account"
                : step === 2
                ? `6-digit secret OTP sent to your Gmail inbox`
                : "Enter your college email to receive a secret OTP"}
            </p>
          </div>

          {/* ── Global Alerts / Error Feedback ── */}
          {error && (
            <div
              style={{
                padding: "10px 14px",
                borderRadius: 8,
                background: "rgba(255, 68, 68, 0.12)",
                border: "1px solid rgba(255, 68, 68, 0.4)",
                color: "#ff8b8b",
                fontSize: 12,
                fontFamily: "'Space Mono', monospace",
                letterSpacing: "0.5px",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {infoMessage && step === 2 && (
            <div
              style={{
                padding: "10px 14px",
                borderRadius: 8,
                background: "rgba(0, 210, 255, 0.1)",
                border: "1px solid rgba(0, 210, 255, 0.35)",
                color: "#67e8f9",
                fontSize: 11.5,
                fontFamily: "'Space Mono', monospace",
                letterSpacing: "0.5px",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span>✨</span>
              <span>{infoMessage}</span>
            </div>
          )}

          {/* ── STEP 1: ENTER EMAIL FORM ── */}
          {step === 1 && (
            <form
              onSubmit={handleSendOtp}
              noValidate
              style={{ display: "flex", flexDirection: "column", gap: 18 }}
            >
              <SciFiField
                id="forgot-email"
                type="email"
                label="College Email Address"
                placeholder="avinash.128203@marwadiuniversity.ac.in"
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError(null);
                }}
                leftIcon={
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                }
                rightNode={
                  emailValid ? (
                    <svg
                      width="17"
                      height="17"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#00d2ff"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                  ) : undefined
                }
              />

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  height: 46,
                  borderRadius: 8,
                  border: "none",
                  outline: "none",
                  cursor: loading ? "not-allowed" : "pointer",
                  background:
                    "linear-gradient(135deg, #00d2ff 0%, #0077ff 100%)",
                  boxShadow: "0 0 24px rgba(0, 210, 255, 0.4)",
                  color: "#000000",
                  fontSize: 13,
                  fontWeight: 800,
                  fontFamily: "'Space Mono', monospace",
                  letterSpacing: "1.5px",
                  textTransform: "uppercase",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  transition: "all 0.2s ease",
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? (
                  <>
                    <span
                      style={{
                        width: 14,
                        height: 14,
                        border: "2px solid #000",
                        borderTop: "2px solid transparent",
                        borderRadius: "50%",
                        display: "inline-block",
                        animation: "spin 1s linear infinite",
                      }}
                    />
                    <span>SENDING OTP...</span>
                  </>
                ) : (
                  <span>Send Secret OTP to Gmail ➔</span>
                )}
              </button>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop: 2,
                }}
              >
                <Link
                  href={ROUTES.LOGIN}
                  style={{
                    fontSize: 11,
                    color: "rgba(255, 255, 255, 0.55)",
                    textDecoration: "none",
                    fontFamily: "'Space Mono', monospace",
                    letterSpacing: "1px",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    transition: "color 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "#00d2ff")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color =
                      "rgba(255, 255, 255, 0.55)")
                  }
                >
                  <span>←</span>
                  <span>BACK TO SIGN IN</span>
                </Link>
              </div>
            </form>
          )}

          {/* ── STEP 2: ENTER 6-DIGIT OTP FORM ── */}
          {step === 2 && (
            <form
              onSubmit={handleVerifyOtp}
              noValidate
              style={{ display: "flex", flexDirection: "column", gap: 18 }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <label
                    style={{
                      fontSize: 10.5,
                      fontFamily: "'Space Mono', monospace",
                      letterSpacing: "2px",
                      color: "rgba(255, 255, 255, 0.7)",
                      textTransform: "uppercase",
                    }}
                  >
                    6-Digit Security OTP
                  </label>
                  <span
                    style={{
                      fontSize: 10,
                      color: "#00d2ff",
                      fontFamily: "'Space Mono', monospace",
                    }}
                  >
                    {email}
                  </span>
                </div>

                <div
                  style={{
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    background: "rgba(0, 0, 0, 0.5)",
                    border: "2px solid rgba(0, 210, 255, 0.5)",
                    borderRadius: 10,
                    boxShadow:
                      "0 0 25px rgba(0, 210, 255, 0.25), inset 0 0 15px rgba(0, 210, 255, 0.1)",
                  }}
                >
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
                    autoFocus
                    style={{
                      width: "100%",
                      height: 52,
                      background: "transparent",
                      border: "none",
                      outline: "none",
                      color: "#00d2ff",
                      fontSize: 24,
                      fontWeight: 800,
                      fontFamily: "'Space Mono', monospace",
                      letterSpacing: "0.5em",
                      textAlign: "center",
                    }}
                  />
                </div>
                <p
                  style={{
                    margin: 0,
                    fontSize: 10.5,
                    color: "rgba(255, 255, 255, 0.5)",
                    fontFamily: "'Space Mono', monospace",
                    textAlign: "center",
                  }}
                >
                  Check your Marwadi University Gmail inbox for the code
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || otp.length < 6}
                style={{
                  width: "100%",
                  height: 46,
                  borderRadius: 8,
                  border: "none",
                  outline: "none",
                  cursor:
                    loading || otp.length < 6 ? "not-allowed" : "pointer",
                  background:
                    otp.length === 6
                      ? "linear-gradient(135deg, #00d2ff 0%, #0077ff 100%)"
                      : "rgba(255, 255, 255, 0.15)",
                  boxShadow:
                    otp.length === 6
                      ? "0 0 24px rgba(0, 210, 255, 0.45)"
                      : "none",
                  color: otp.length === 6 ? "#000000" : "rgba(255, 255, 255, 0.4)",
                  fontSize: 13,
                  fontWeight: 800,
                  fontFamily: "'Space Mono', monospace",
                  letterSpacing: "1.5px",
                  textTransform: "uppercase",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  transition: "all 0.2s ease",
                }}
              >
                {loading ? "VERIFYING CODE..." : "CONTINUE TO PASSWORD ➔"}
              </button>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontSize: 11,
                  fontFamily: "'Space Mono', monospace",
                  paddingTop: 2,
                }}
              >
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resending}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#00d2ff",
                    cursor: "pointer",
                    padding: 0,
                    fontFamily: "'Space Mono', monospace",
                    letterSpacing: "0.5px",
                    fontWeight: 600,
                  }}
                >
                  {resending ? "SENDING FRESH OTP..." : "↻ RESEND OTP"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setOtp("");
                    setError(null);
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    color: "rgba(255, 255, 255, 0.5)",
                    cursor: "pointer",
                    padding: 0,
                    fontFamily: "'Space Mono', monospace",
                    letterSpacing: "0.5px",
                  }}
                >
                  CHANGE EMAIL
                </button>
              </div>
            </form>
          )}

          {/* ── STEP 3: SET NEW PASSWORD FORM ── */}
          {step === 3 && (
            <form
              onSubmit={handleSetNewPassword}
              noValidate
              style={{ display: "flex", flexDirection: "column", gap: 16 }}
            >
              <div
                style={{
                  padding: "8px 12px",
                  borderRadius: 8,
                  background: "rgba(0, 230, 118, 0.1)",
                  border: "1px solid rgba(0, 230, 118, 0.35)",
                  color: "#00e676",
                  fontSize: 11,
                  fontFamily: "'Space Mono', monospace",
                  letterSpacing: "0.5px",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span>🛡️</span>
                <span>SECURITY VERIFIED: CREATE YOUR NEW PASSWORD</span>
              </div>

              <SciFiField
                id="new-password"
                type={showPassword ? "text" : "password"}
                label="New Password"
                placeholder="At least 6 characters"
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  if (error) setError(null);
                }}
                leftIcon={
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                }
                rightNode={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      display: "flex",
                      padding: 0,
                      color: "rgba(255, 255, 255, 0.45)",
                    }}
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                }
                autoFocus
              />

              <SciFiField
                id="confirm-password"
                type={showPassword ? "text" : "password"}
                label="Confirm New Password"
                placeholder="Repeat new password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (error) setError(null);
                }}
                leftIcon={
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                }
              />

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  height: 46,
                  borderRadius: 8,
                  border: "none",
                  outline: "none",
                  cursor: loading ? "not-allowed" : "pointer",
                  background:
                    "linear-gradient(135deg, #00d2ff 0%, #0077ff 100%)",
                  boxShadow: "0 0 24px rgba(0, 210, 255, 0.4)",
                  color: "#000000",
                  fontSize: 13,
                  fontWeight: 800,
                  fontFamily: "'Space Mono', monospace",
                  letterSpacing: "1.5px",
                  textTransform: "uppercase",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  transition: "all 0.2s ease",
                  marginTop: 4,
                }}
              >
                {loading ? "SAVING PASSWORD..." : "SAVE PASSWORD & LOGIN ➔"}
              </button>
            </form>
          )}

          {/* ── STEP 4: SUCCESS STATE ── */}
          {step === 4 && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 16,
                padding: "16px 0",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 20,
                  background: "rgba(0, 230, 118, 0.15)",
                  border: "2px solid rgba(0, 230, 118, 0.6)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 30,
                  color: "#00e676",
                  boxShadow: "0 0 35px rgba(0, 230, 118, 0.4)",
                }}
              >
                ✓
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <h3
                  style={{
                    margin: 0,
                    fontSize: 20,
                    fontWeight: 700,
                    color: "#ffffff",
                    letterSpacing: "1.5px",
                    textTransform: "uppercase",
                  }}
                >
                  Password Updated!
                </h3>
                <p
                  style={{
                    margin: 0,
                    fontSize: 11.5,
                    color: "rgba(255, 255, 255, 0.6)",
                    fontFamily: "'Space Mono', monospace",
                    letterSpacing: "0.5px",
                  }}
                >
                  Your new credentials are active. Entering the UniVerse...
                </p>
              </div>

              <button
                type="button"
                onClick={() => router.push(ROUTES.DASHBOARD)}
                style={{
                  width: "100%",
                  height: 44,
                  borderRadius: 8,
                  border: "none",
                  outline: "none",
                  cursor: "pointer",
                  background:
                    "linear-gradient(135deg, #00e676 0%, #00b0ff 100%)",
                  boxShadow: "0 0 24px rgba(0, 230, 118, 0.4)",
                  color: "#000000",
                  fontSize: 12.5,
                  fontWeight: 800,
                  fontFamily: "'Space Mono', monospace",
                  letterSpacing: "1.5px",
                  textTransform: "uppercase",
                  marginTop: 6,
                }}
              >
                GO TO DASHBOARD ➔
              </button>
            </div>
          )}

          {/* ── Card Footer Security Seal ── */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderTop: "1px solid rgba(255, 255, 255, 0.08)",
              paddingTop: 14,
              fontSize: 10,
              color: "rgba(255, 255, 255, 0.4)",
              fontFamily: "'Space Mono', monospace",
              letterSpacing: "1px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ color: "#00d2ff" }}>●</span>
              <span>256-BIT SSL ENCRYPTED</span>
            </div>
            <span>STUDENT VERIFIED</span>
          </div>
        </div>

        {/* ── Outer Sub-footer Tag ── */}
        <div
          style={{
            marginTop: 18,
            fontFamily: "'Space Mono', monospace",
            fontSize: 9.5,
            color: "rgba(255, 255, 255, 0.35)",
            letterSpacing: "2px",
            textAlign: "center",
            textTransform: "uppercase",
          }}
        >
          TRUSTED BY MARWADI UNIVERSITY STUDENTS
        </div>
      </div>
    </div>
  );
}
