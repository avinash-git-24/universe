"use client";

/**
 * UniVerse — Complete Profile Page
 *
 * Step 3 of onboarding: sets up hostel, room, bio, preferred language,
 * and profile photo. Frontend-only for now.
 */

import { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Camera, Hash, MessageSquare, Globe, ArrowLeft, CheckCircle2 } from "lucide-react";
import { AuthBackground } from "@/components/auth/AuthBackground";
import { AuthLogo } from "@/components/auth/AuthLogo";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

// ─── Constants ────────────────────────────────────────────────────────────────

const HOSTELS = ["Hostel A", "Hostel B", "Hostel C", "Hostel D"] as const;
type Hostel = (typeof HOSTELS)[number];

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "hi", label: "Hindi" },
  { value: "gu", label: "Gujarati" },
  { value: "ta", label: "Tamil" },
  { value: "te", label: "Telugu" },
  { value: "kn", label: "Kannada" },
  { value: "ml", label: "Malayalam" },
] as const;
type Language = (typeof LANGUAGES)[number]["value"];

// ─── Photo Upload ──────────────────────────────────────────────────────────────

function PhotoUpload({
  preview,
  onSelect,
}: {
  preview: string | null;
  onSelect: (url: string) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    onSelect(url);
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <label
        className="relative cursor-pointer group"
        aria-label="Upload profile photo"
      >
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={handleFile}
          aria-label="Profile photo file input"
        />
        {/* Avatar circle */}
        <div
          className={cn(
            "w-24 h-24 rounded-full border-2 flex items-center justify-center overflow-hidden transition-all duration-200",
            "group-hover:border-[var(--color-primary)] group-hover:shadow-[var(--shadow-glow-primary)]",
            preview ? "border-[var(--color-primary)]" : "border-dashed border-[var(--color-border-strong)]"
          )}
          style={{ background: preview ? "transparent" : "var(--color-bg-subtle)" }}
        >
          {preview ? (
            <Image
              src={preview}
              alt="Profile photo preview"
              width={96}
              height={96}
              className="w-full h-full object-cover"
            />
          ) : (
            <Camera size={28} className="text-[var(--color-text-muted)]" />
          )}
        </div>

        {/* Overlay on hover */}
        <div
          className="absolute inset-0 rounded-full bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center"
          aria-hidden="true"
        >
          <Camera size={20} className="text-white" />
        </div>
      </label>
      <p
        className="text-xs text-[var(--color-text-muted)]"
        style={{ fontFamily: "var(--font-inter)" }}
      >
        Click to upload a photo{" "}
        <span className="text-[var(--color-text-disabled)]">(optional)</span>
      </p>
    </div>
  );
}

// ─── Success screen ───────────────────────────────────────────────────────────

function SuccessScreen() {
  return (
    <div className="flex flex-col items-center gap-6 py-4 text-center">
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center"
        style={{ background: "var(--color-success-subtle)" }}
      >
        <CheckCircle2 size={40} className="text-[var(--color-success)]" />
      </div>
      <div className="flex flex-col gap-2">
        <h2
          className="text-xl font-bold text-[var(--color-text)]"
          style={{ fontFamily: "var(--font-plus-jakarta-sans)" }}
        >
          You&apos;re all set! 🎉
        </h2>
        <p
          className="text-sm text-[var(--color-text-muted)]"
          style={{ fontFamily: "var(--font-inter)" }}
        >
          Your profile is complete. Redirecting to your dashboard…
        </p>
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function CompleteProfilePage() {
  const router = useRouter();
  const [photo, setPhoto] = useState<string | null>(null);
  const [hostel, setHostel] = useState<Hostel | "">("");
  const [room, setRoom] = useState("");
  const [bio, setBio] = useState("");
  const [language, setLanguage] = useState<Language>("en");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ hostel?: string; room?: string; form?: string }>({});
  const [done, setDone] = useState(false);

  function validate() {
    const errs: typeof errors = {};
    if (!hostel) errs.hostel = "Please select your hostel.";
    if (!room.trim()) errs.room = "Room number is required.";
    else if (!/^\w{1,6}$/.test(room.trim())) errs.room = "Enter a valid room number (e.g. A-204).";
    return errs;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    // TODO: Save profile to Supabase users table in Phase 3
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    setDone(true);

    // Actually redirect the user after a short delay so they can see the success message
    setTimeout(() => {
      window.location.href = ROUTES.DASHBOARD;
    }, 1500);
  }

  return (
    <>
      <AuthBackground />
      <div className="min-h-dvh flex flex-col items-center justify-center px-4 py-12 sm:px-6">
        {/* Logo */}
        <div className="mb-8">
          <AuthLogo />
        </div>

        {/* Card */}
        <div
          className="w-full max-w-md rounded-[var(--radius-xl)] border border-[var(--color-border)] shadow-[var(--shadow-xl)] overflow-hidden"
          style={{ background: "rgba(255,255,255,0.88)", backdropFilter: "blur(20px)" }}
        >
          {/* Header */}
          <div className="px-8 pt-8 pb-6 border-b border-[var(--color-border)]">
            <p
              className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--color-primary)] mb-1"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              Step 3 of 3
            </p>
            <h1
              className="text-2xl font-bold text-[var(--color-text)] tracking-tight"
              style={{ fontFamily: "var(--font-plus-jakarta-sans)" }}
            >
              Complete your profile
            </h1>
            <p
              className="mt-1.5 text-sm text-[var(--color-text-muted)]"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              Help your community find and recognise you
            </p>
          </div>

          <div className="px-8 py-6">
            {done ? (
              <SuccessScreen />
            ) : (
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

                {/* Photo upload */}
                <PhotoUpload preview={photo} onSelect={setPhoto} />

                {/* Hostel selection */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="profile-hostel"
                    className="text-sm font-medium text-[var(--color-text)]"
                    style={{ fontFamily: "var(--font-inter)" }}
                  >
                    Hostel <span className="text-[var(--color-error)] ml-0.5" aria-label="required">*</span>
                  </label>
                  <div className="grid grid-cols-4 gap-2" role="group" aria-label="Select hostel">
                    {HOSTELS.map((h) => (
                      <button
                        key={h}
                        type="button"
                        aria-pressed={hostel === h}
                        onClick={() => setHostel(h)}
                        className={cn(
                          "h-10 rounded-[var(--radius-md)] text-sm font-medium transition-all duration-150 border",
                          hostel === h
                            ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)] shadow-[var(--shadow-glow-primary)]"
                            : "bg-white text-[var(--color-text-secondary)] border-[var(--color-border)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                        )}
                        style={{ fontFamily: "var(--font-inter)" }}
                      >
                        {h}
                      </button>
                    ))}
                  </div>
                  {errors.hostel && (
                    <p
                      className="text-xs text-[var(--color-error)]"
                      role="alert"
                      style={{ fontFamily: "var(--font-inter)" }}
                    >
                      {errors.hostel}
                    </p>
                  )}
                </div>

                {/* Room number */}
                <Input
                  id="profile-room"
                  type="text"
                  label="Room Number"
                  placeholder="e.g. A204"
                  autoComplete="off"
                  required
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  error={errors.room}
                  leftIcon={<Hash size={16} />}
                  size="lg"
                />

                {/* Bio */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="profile-bio"
                    className="text-sm font-medium text-[var(--color-text)]"
                    style={{ fontFamily: "var(--font-inter)" }}
                  >
                    Bio{" "}
                    <span
                      className="text-[var(--color-text-muted)] font-normal"
                      style={{ fontFamily: "var(--font-inter)" }}
                    >
                      (Optional)
                    </span>
                  </label>
                  <div className="relative">
                    <span
                      className="absolute left-3 top-3 text-[var(--color-text-muted)] pointer-events-none"
                      aria-hidden="true"
                    >
                      <MessageSquare size={16} />
                    </span>
                    <textarea
                      id="profile-bio"
                      rows={3}
                      maxLength={160}
                      placeholder="Tell your campus community about yourself…"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className={cn(
                        "w-full pl-10 pr-4 py-2.5 text-sm resize-none",
                        "bg-[var(--color-surface)] text-[var(--color-text)]",
                        "border border-[var(--color-border)] rounded-[var(--radius-md)]",
                        "placeholder:text-[var(--color-text-placeholder)]",
                        "hover:border-[var(--color-border-strong)]",
                        "focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/15",
                        "transition-all duration-150"
                      )}
                      style={{ fontFamily: "var(--font-inter)" }}
                      aria-describedby="bio-count"
                    />
                  </div>
                  <p
                    id="bio-count"
                    className="text-xs text-[var(--color-text-muted)] text-right"
                    style={{ fontFamily: "var(--font-inter)" }}
                  >
                    {bio.length}/160
                  </p>
                </div>

                {/* Preferred Language */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="profile-language"
                    className="text-sm font-medium text-[var(--color-text)]"
                    style={{ fontFamily: "var(--font-inter)" }}
                  >
                    Preferred Language
                  </label>
                  <div className="relative">
                    <span
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none"
                      aria-hidden="true"
                    >
                      <Globe size={16} />
                    </span>
                    <select
                      id="profile-language"
                      value={language}
                      onChange={(e) => setLanguage(e.target.value as Language)}
                      className={cn(
                        "w-full h-12 pl-10 pr-4 text-sm appearance-none",
                        "bg-[var(--color-surface)] text-[var(--color-text)]",
                        "border border-[var(--color-border)] rounded-[var(--radius-md)]",
                        "hover:border-[var(--color-border-strong)]",
                        "focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/15",
                        "transition-all duration-150 cursor-pointer"
                      )}
                      style={{ fontFamily: "var(--font-inter)" }}
                    >
                      {LANGUAGES.map(({ value, label }) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                    {/* Custom chevron */}
                    <span
                      className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--color-text-muted)]"
                      aria-hidden="true"
                    >
                      <svg viewBox="0 0 16 16" width="14" height="14" fill="none">
                        <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  </div>
                </div>

                {/* Submit */}
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  isLoading={loading}
                  loadingText="Saving profile…"
                  className="mt-1"
                >
                  Complete Profile
                </Button>
              </form>
            )}
          </div>
        </div>

        {/* Skip link */}
        {!done && (
          <Link
            href={ROUTES.DASHBOARD}
            className="mt-6 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors duration-150 flex items-center gap-2"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            <ArrowLeft size={14} />
            Skip for now
          </Link>
        )}
      </div>
    </>
  );
}
