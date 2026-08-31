"use client";

/**
 * UniVerse — Complete Profile Page
 *
 * Step 3 of onboarding: sets up hostel, room, bio, preferred language,
 * and profile photo in a stunning cosmic dark theme.
 */

import { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Camera, Hash, MessageSquare, Globe, ArrowLeft, CheckCircle2, Sparkles, Loader2, ArrowRight } from "lucide-react";
import { AuthLogo } from "@/components/auth/AuthLogo";
import { ROUTES } from "@/constants/routes";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

// ─── Constants ────────────────────────────────────────────────────────────────

const HOSTELS = ["Hostel A", "Hostel B", "Hostel C", "Hostel D"] as const;
type Hostel = (typeof HOSTELS)[number];

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "hi", label: "Hindi (हिंदी)" },
  { value: "gu", label: "Gujarati (ગુજરાતી)" },
  { value: "ta", label: "Tamil (தமிழ்)" },
  { value: "te", label: "Telugu (తెలుగు)" },
  { value: "kn", label: "Kannada (ಕನ್ನಡ)" },
  { value: "ml", label: "Malayalam (മലയാളം)" },
] as const;
type Language = (typeof LANGUAGES)[number]["value"];

// ─── Photo Upload ──────────────────────────────────────────────────────────────

function PhotoUpload({
  preview,
  onSelect,
}: {
  preview: string | null;
  onSelect: (url: string, file: File) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    onSelect(url, file);
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
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={handleFile}
          aria-label="Profile photo file input"
        />
        {/* Avatar circle */}
        <div
          className={cn(
            "w-24 h-24 sm:w-28 sm:h-28 rounded-full border-2 flex items-center justify-center overflow-hidden transition-all duration-300 relative",
            preview
              ? "border-[#00E676] shadow-[0_0_25px_rgba(0,230,118,0.35)]"
              : "border-dashed border-[#00E676]/40 hover:border-[#00E676] bg-[#050a07]/80 group-hover:shadow-[0_0_20px_rgba(0,230,118,0.25)]"
          )}
        >
          {preview ? (
            <Image
              src={preview}
              alt="Profile photo preview"
              width={112}
              height={112}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-[#A7B8B0]/60 group-hover:text-[#00E676] transition-colors">
              <Camera size={30} className="stroke-[1.5]" />
            </div>
          )}

          {/* Overlay on hover */}
          <div
            className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center backdrop-blur-xs"
            aria-hidden="true"
          >
            <Camera size={24} className="text-[#00E676]" />
          </div>
        </div>

        {/* Small floating badge */}
        <div className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-[#00E676] text-[#050A07] flex items-center justify-center shadow-lg border-2 border-[#050A07] group-hover:scale-110 transition-transform">
          <Camera size={13} className="stroke-[2.5]" />
        </div>
      </label>
      <p className="text-xs text-[#A7B8B0]/70 font-medium">
        Click to upload a profile photo <span className="text-[#A7B8B0]/40">(optional)</span>
      </p>
    </div>
  );
}

// ─── Success screen ───────────────────────────────────────────────────────────

function SuccessScreen() {
  return (
    <div className="flex flex-col items-center gap-6 py-6 text-center animate-in fade-in zoom-in-95 duration-300">
      <div className="w-20 h-20 rounded-full bg-[#00E676]/15 border border-[#00E676]/30 flex items-center justify-center shadow-[0_0_30px_rgba(0,230,118,0.3)]">
        <CheckCircle2 size={42} className="text-[#00E676]" />
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-extrabold text-white tracking-tight">
          You&apos;re all set! 🎉
        </h2>
        <p className="text-sm text-[#A7B8B0]/80 max-w-xs mx-auto leading-relaxed">
          Your profile is ready. Redirecting you straight to your UniVerse dashboard…
        </p>
      </div>
      <div className="flex items-center gap-2 text-xs font-semibold text-[#00E676]">
        <Loader2 size={16} className="animate-spin" />
        <span>Loading dashboard</span>
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function CompleteProfilePage() {
  const router = useRouter();
  const [photo, setPhoto] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [hostel, setHostel] = useState<Hostel | "">("");
  const [room, setRoom] = useState("");
  const [bio, setBio] = useState("");
  const [language, setLanguage] = useState<Language>("en");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ hostel?: string; room?: string; form?: string }>({});
  const [done, setDone] = useState(false);

  function handlePhotoSelect(url: string, file: File) {
    setPhoto(url);
    setPhotoFile(file);
  }

  function validate() {
    const errs: typeof errors = {};
    if (!hostel) errs.hostel = "Please select your hostel.";
    if (!room.trim()) errs.room = "Room number is required.";
    else if (!/^[\w-]{1,8}$/.test(room.trim())) errs.room = "Enter a valid room number (e.g. A-204).";
    return errs;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setLoading(true);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        let avatarUrlToSave: string | null = null;
        if (photoFile) {
          const fileExt = photoFile.name.split('.').pop() || 'jpg';
          const filePath = `${user.id}/avatar-${Date.now()}.${fileExt}`;
          const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, photoFile, { upsert: true });

          if (!uploadError) {
            const { data: { publicUrl } } = supabase.storage
              .from('avatars')
              .getPublicUrl(filePath);
            avatarUrlToSave = publicUrl;
          }
        }

        const updateData: Record<string, unknown> = {
          updated_at: new Date().toISOString(),
        };
        if (avatarUrlToSave) {
          updateData.avatar_url = avatarUrlToSave;
        }

        await supabase
          .from("profiles")
          .update(updateData)
          .eq("id", user.id);
      }
    } catch (err) {
      console.error("Profile update error:", err);
    } finally {
      setLoading(false);
      setDone(true);

      setTimeout(() => {
        router.push(ROUTES.DASHBOARD);
        router.refresh();
      }, 1200);
    }
  }

  return (
    <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden bg-[#02050b] selection:bg-[#00E676]/30">
      
      {/* ── Background Cosmic Canvas & Vignette ── */}
      <div 
        className="fixed inset-0 z-0 pointer-events-none opacity-40"
        style={{
          background: "url('/login-bg.jpg') center/cover no-repeat",
          filter: "brightness(0.85) contrast(1.1)",
        }}
      />
      
      {/* Glow Orbs */}
      <div className="fixed top-1/4 -left-32 w-96 h-96 bg-[#00E676]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="fixed bottom-1/4 -right-32 w-96 h-96 bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(2,5,11,0.85)_100%)] pointer-events-none" />

      {/* ── Main Container ── */}
      <div className="w-full max-w-lg mx-auto relative z-10 flex flex-col items-center py-6 sm:py-10">
        
        {/* Logo */}
        <div className="mb-6 sm:mb-8 transition-transform hover:scale-105 duration-300">
          <AuthLogo />
        </div>

        {/* Card */}
        <div className="w-full bg-[#0A0F0C]/85 border border-[#66FFB2]/20 backdrop-blur-2xl rounded-3xl p-6 sm:p-9 shadow-[0_8px_40px_rgba(0,0,0,0.6),0_0_50px_rgba(0,230,118,0.1)] transition-all">
          
          {/* Header */}
          <div className="mb-6 sm:mb-8 border-b border-white/5 pb-5 sm:pb-6 text-left">
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00E676]/15 border border-[#00E676]/30 text-[#00E676] text-[11px] font-extrabold tracking-wider uppercase shadow-[0_0_12px_rgba(0,230,118,0.2)]">
                <Sparkles size={12} className="fill-[#00E676]" />
                Step 3 of 3
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight m-0">
              Complete your profile
            </h1>
            <p className="mt-1.5 text-xs sm:text-sm text-[#A7B8B0]/80 leading-relaxed">
              Help your Marwadi University peers find and recognize you on campus.
            </p>
          </div>

          {done ? (
            <SuccessScreen />
          ) : (
            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5 sm:gap-6">
              
              {/* Global Error */}
              {errors.form && (
                <div
                  role="alert"
                  className="rounded-xl px-4 py-3 text-xs sm:text-sm bg-red-500/10 text-red-400 border border-red-500/20 break-words"
                >
                  {errors.form}
                </div>
              )}

              {/* Photo Upload */}
              <PhotoUpload preview={photo} onSelect={handlePhotoSelect} />

              {/* Hostel Selection */}
              <div className="flex flex-col gap-2">
                <label className="text-xs sm:text-sm font-semibold text-white tracking-wide">
                  Hostel <span className="text-[#00E676] ml-0.5">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2" role="group" aria-label="Select hostel">
                  {HOSTELS.map((h) => {
                    const isSelected = hostel === h;
                    return (
                      <button
                        key={h}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => setHostel(h)}
                        className={cn(
                          "h-11 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 border cursor-pointer flex items-center justify-center",
                          isSelected
                            ? "bg-[#00E676] text-[#050A07] border-[#00E676] shadow-[0_0_20px_rgba(0,230,118,0.4)] scale-[1.02]"
                            : "bg-[#050A07]/80 text-[#A7B8B0] border-white/10 hover:border-[#00E676]/40 hover:text-white hover:bg-[#050A07]"
                        )}
                      >
                        {h}
                      </button>
                    );
                  })}
                </div>
                {errors.hostel && (
                  <p className="text-xs text-red-400 font-medium mt-0.5" role="alert">
                    {errors.hostel}
                  </p>
                )}
              </div>

              {/* Room Number */}
              <div className="flex flex-col gap-2">
                <label htmlFor="profile-room" className="text-xs sm:text-sm font-semibold text-white tracking-wide">
                  Room Number <span className="text-[#00E676] ml-0.5">*</span>
                </label>
                <div className="relative group">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A7B8B0]/50 group-focus-within:text-[#00E676] transition-colors pointer-events-none">
                    <Hash size={17} />
                  </span>
                  <input
                    id="profile-room"
                    type="text"
                    placeholder="e.g. A204 or B-102"
                    autoComplete="off"
                    required
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                    className={cn(
                      "w-full h-12 pl-10 pr-4 rounded-xl text-sm font-medium text-white bg-[#050A07]/80 border transition-all duration-200 outline-none placeholder:text-[#A7B8B0]/40",
                      errors.room
                        ? "border-red-500/60 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                        : "border-white/10 focus:border-[#00E676] focus:ring-1 focus:ring-[#00E676] focus:shadow-[0_0_15px_rgba(0,230,118,0.2)]"
                    )}
                  />
                </div>
                {errors.room && (
                  <p className="text-xs text-red-400 font-medium mt-0.5" role="alert">
                    {errors.room}
                  </p>
                )}
              </div>

              {/* Bio */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="profile-bio" className="text-xs sm:text-sm font-semibold text-white tracking-wide">
                    Bio <span className="text-[#A7B8B0]/50 font-normal">(Optional)</span>
                  </label>
                  <span className="text-[11px] text-[#A7B8B0]/50 font-mono">
                    {bio.length}/160
                  </span>
                </div>
                <div className="relative group">
                  <span className="absolute left-3.5 top-3.5 text-[#A7B8B0]/50 group-focus-within:text-[#00E676] transition-colors pointer-events-none">
                    <MessageSquare size={17} />
                  </span>
                  <textarea
                    id="profile-bio"
                    rows={3}
                    maxLength={160}
                    placeholder="Tell your campus peers about yourself, branch, interests…"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl text-sm font-medium text-white bg-[#050A07]/80 border border-white/10 focus:border-[#00E676] focus:ring-1 focus:ring-[#00E676] focus:shadow-[0_0_15px_rgba(0,230,118,0.2)] transition-all duration-200 outline-none resize-none placeholder:text-[#A7B8B0]/40 leading-relaxed"
                  />
                </div>
              </div>

              {/* Preferred Language */}
              <div className="flex flex-col gap-2">
                <label htmlFor="profile-language" className="text-xs sm:text-sm font-semibold text-white tracking-wide">
                  Preferred Language
                </label>
                <div className="relative group">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A7B8B0]/50 group-focus-within:text-[#00E676] transition-colors pointer-events-none">
                    <Globe size={17} />
                  </span>
                  <select
                    id="profile-language"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as Language)}
                    className="w-full h-12 pl-10 pr-10 rounded-xl text-sm font-medium text-white bg-[#050A07]/80 border border-white/10 focus:border-[#00E676] focus:ring-1 focus:ring-[#00E676] focus:shadow-[0_0_15px_rgba(0,230,118,0.2)] transition-all duration-200 outline-none appearance-none cursor-pointer"
                  >
                    {LANGUAGES.map(({ value, label }) => (
                      <option key={value} value={value} className="bg-[#0A0F0C] text-white py-2">
                        {label}
                      </option>
                    ))}
                  </select>
                  {/* Custom Chevron */}
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#A7B8B0]/50">
                    <svg viewBox="0 0 16 16" width="14" height="14" fill="none">
                      <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 h-13 rounded-xl font-extrabold text-sm sm:text-base bg-gradient-to-r from-[#00C853] via-[#00E676] to-[#00E676] text-[#050A07] shadow-[0_4px_25px_rgba(0,230,118,0.3)] hover:shadow-[0_6px_35px_rgba(0,230,118,0.5)] transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 size={19} className="animate-spin text-[#050A07]" />
                    <span>Saving your profile…</span>
                  </>
                ) : (
                  <>
                    <span>Complete Profile</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Skip link */}
        {!done && (
          <Link
            href={ROUTES.DASHBOARD}
            className="mt-6 text-xs sm:text-sm font-medium text-[#A7B8B0]/70 hover:text-[#00E676] transition-colors duration-200 flex items-center gap-1.5 no-underline group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            <span>Skip for now, go to Dashboard</span>
          </Link>
        )}
      </div>
    </div>
  );
}

