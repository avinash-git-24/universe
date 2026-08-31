"use client";

/**
 * UniVerse — Complete Profile Page
 *
 * Step 3 of onboarding: sets up hostel, room, bio, preferred language,
 * and profile photo in an ultra-luxurious cosmic dark theme.
 */

import { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { 
  Camera, 
  Hash, 
  MessageSquare, 
  Globe, 
  ArrowLeft, 
  CheckCircle2, 
  Sparkles, 
  Loader2, 
  ArrowRight,
  Building,
  Check
} from "lucide-react";
import { AuthLogo } from "@/components/auth/AuthLogo";
import StarTwinkleOverlay from "@/components/auth/StarTwinkleOverlay";
import { ROUTES } from "@/constants/routes";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

// ─── Constants ────────────────────────────────────────────────────────────────

const HOSTELS = [
  { id: "Hostel A", label: "Hostel A", block: "Block A" },
  { id: "Hostel B", label: "Hostel B", block: "Block B" },
  { id: "Hostel C", label: "Hostel C", block: "Block C" },
  { id: "Hostel D", label: "Hostel D", block: "Block D" },
] as const;
type Hostel = (typeof HOSTELS)[number]["id"];

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

        {/* Ambient Halo Ring */}
        <div className="absolute -inset-1.5 rounded-full bg-gradient-to-tr from-[#00E676]/30 via-emerald-400/20 to-transparent blur-md opacity-75 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

        {/* Avatar circle */}
        <div
          className={cn(
            "w-24 h-24 sm:w-28 sm:h-28 rounded-full border-2 flex items-center justify-center overflow-hidden transition-all duration-300 relative bg-[#060D09]/90",
            preview
              ? "border-[#00E676] shadow-[0_0_30px_rgba(0,230,118,0.4)]"
              : "border-dashed border-[#00E676]/50 hover:border-[#00E676] shadow-[0_0_20px_rgba(0,230,118,0.15)] group-hover:shadow-[0_0_30px_rgba(0,230,118,0.35)]"
          )}
        >
          {preview ? (
            <Image
              src={preview}
              alt="Profile photo preview"
              width={112}
              height={112}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex flex-col items-center justify-center gap-1 text-[#A7B8B0]/70 group-hover:text-[#00E676] transition-colors">
              <Camera size={30} className="stroke-[1.6]" />
              <span className="text-[10px] font-semibold tracking-wider uppercase opacity-80">Photo</span>
            </div>
          )}

          {/* Overlay on hover */}
          <div
            className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center backdrop-blur-xs gap-1"
            aria-hidden="true"
          >
            <Camera size={22} className="text-[#00E676]" />
            <span className="text-[10px] text-white font-bold tracking-wide">
              {preview ? "Change" : "Upload"}
            </span>
          </div>
        </div>

        {/* Small floating badge */}
        <div className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-[#00E676] text-[#050A07] flex items-center justify-center shadow-[0_2px_10px_rgba(0,230,118,0.5)] border-2 border-[#050A07] group-hover:scale-110 transition-transform">
          <Camera size={13} className="stroke-[2.5]" />
        </div>
      </label>
      
      <p className="text-xs text-[#A7B8B0]/70 font-medium text-center">
        Upload a clear profile photo <span className="text-[#A7B8B0]/40">(optional)</span>
      </p>
    </div>
  );
}

// ─── Success screen ───────────────────────────────────────────────────────────

function SuccessScreen() {
  return (
    <div className="flex flex-col items-center gap-6 py-8 text-center animate-in fade-in zoom-in-95 duration-300">
      <div className="w-20 h-20 rounded-full bg-[#00E676]/15 border border-[#00E676]/30 flex items-center justify-center shadow-[0_0_35px_rgba(0,230,118,0.35)]">
        <CheckCircle2 size={44} className="text-[#00E676]" />
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          You&apos;re all set! 🎉
        </h2>
        <p className="text-sm text-[#A7B8B0]/80 max-w-xs mx-auto leading-relaxed">
          Your profile is ready. Redirecting you straight to your UniVerse dashboard…
        </p>
      </div>
      <div className="flex items-center gap-2.5 text-xs font-bold text-[#00E676] px-4 py-2 rounded-full bg-[#00E676]/10 border border-[#00E676]/20">
        <Loader2 size={15} className="animate-spin" />
        <span>Launching dashboard...</span>
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
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 relative bg-[#02050b] selection:bg-[#00E676]/30">
      
      {/* ── Fixed Cosmic Wallpaper (Seamless Full-Screen) ── */}
      <div 
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          background: "#02050b url('/login-bg.jpg') center center / cover no-repeat fixed",
          filter: "brightness(0.95) contrast(1.05)",
        }}
      />
      
      {/* Animated Star Twinkle Canvas */}
      <StarTwinkleOverlay />

      {/* Deep Vignette & Glow Orbs */}
      <div className="fixed top-1/4 -left-32 w-[500px] h-[500px] bg-[#00E676]/10 rounded-full blur-[160px] pointer-events-none z-0" />
      <div className="fixed bottom-1/4 -right-32 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[160px] pointer-events-none z-0" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(2,5,11,0.75)_100%)] pointer-events-none z-0" />

      {/* ── Main Container ── */}
      <div className="w-full max-w-[500px] mx-auto relative z-10 flex flex-col items-center py-6 sm:py-10">
        
        {/* UniVerse Brand Logo */}
        <div className="mb-6 sm:mb-8 transition-transform duration-300 hover:scale-105">
          <AuthLogo />
        </div>

        {/* Glassmorphic Card */}
        <div className="w-full bg-[#070D0A]/85 border border-[#00E676]/25 backdrop-blur-2xl rounded-3xl p-6 sm:p-9 shadow-[0_12px_50px_rgba(0,0,0,0.8),0_0_60px_rgba(0,230,118,0.12)] transition-all">
          
          {/* Card Header & Step Progress Bar */}
          <div className="mb-6 sm:mb-7 border-b border-white/8 pb-5 sm:pb-6 text-left">
            
            {/* Step Progress Visual */}
            <div className="w-full mb-4">
              <div className="flex items-center justify-between text-[11px] font-bold text-[#A7B8B0]/70 mb-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#00E676]/15 border border-[#00E676]/30 text-[#00E676] font-extrabold uppercase tracking-wider shadow-[0_0_10px_rgba(0,230,118,0.2)]">
                  <Sparkles size={11} className="fill-[#00E676]" />
                  Final Step
                </span>
                <span className="text-[#00E676] font-mono font-extrabold">Step 3 of 3 • 100%</span>
              </div>
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full w-full bg-gradient-to-r from-[#00C853] via-[#00E676] to-[#66FFB2] rounded-full shadow-[0_0_12px_#00E676]" />
              </div>
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
                  className="rounded-xl px-4 py-3 text-xs sm:text-sm bg-red-500/15 text-red-300 border border-red-500/30 break-words"
                >
                  {errors.form}
                </div>
              )}

              {/* Photo Upload */}
              <PhotoUpload preview={photo} onSelect={handlePhotoSelect} />

              {/* Hostel Selection */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs sm:text-sm font-semibold text-white tracking-wide flex items-center gap-1.5">
                    <Building size={14} className="text-[#00E676]" />
                    Hostel <span className="text-[#00E676]">*</span>
                  </label>
                  {hostel && (
                    <span className="text-[11px] font-bold text-[#00E676] inline-flex items-center gap-1">
                      <Check size={12} className="stroke-[3]" /> Selected
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2" role="group" aria-label="Select hostel">
                  {HOSTELS.map((h) => {
                    const isSelected = hostel === h.id;
                    return (
                      <button
                        key={h.id}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => setHostel(h.id)}
                        className={cn(
                          "h-11 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 border cursor-pointer flex items-center justify-center relative overflow-hidden",
                          isSelected
                            ? "bg-[#00E676] text-[#050A07] border-[#00E676] shadow-[0_0_22px_rgba(0,230,118,0.45)] scale-[1.02]"
                            : "bg-[#050A07]/80 text-[#A7B8B0] border-white/10 hover:border-[#00E676]/50 hover:text-white hover:bg-[#08120c]"
                        )}
                      >
                        {h.label}
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
                    placeholder="e.g. A-204 or B-102"
                    autoComplete="off"
                    required
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                    className={cn(
                      "w-full h-12 pl-10 pr-4 rounded-xl text-sm font-medium text-white bg-[#050A07]/90 border transition-all duration-200 outline-none placeholder:text-[#A7B8B0]/40",
                      errors.room
                        ? "border-red-500/60 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                        : "border-white/12 focus:border-[#00E676] focus:ring-1 focus:ring-[#00E676] focus:shadow-[0_0_18px_rgba(0,230,118,0.25)]"
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
                  <span className={cn(
                    "text-[11px] font-mono",
                    bio.length >= 140 ? "text-amber-400 font-bold" : "text-[#A7B8B0]/50"
                  )}>
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
                    placeholder="Tell your campus peers about your department, branch, interests…"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl text-sm font-medium text-white bg-[#050A07]/90 border border-white/12 focus:border-[#00E676] focus:ring-1 focus:ring-[#00E676] focus:shadow-[0_0_18px_rgba(0,230,118,0.25)] transition-all duration-200 outline-none resize-none placeholder:text-[#A7B8B0]/40 leading-relaxed"
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
                    className="w-full h-12 pl-10 pr-10 rounded-xl text-sm font-medium text-white bg-[#050A07]/90 border border-white/12 focus:border-[#00E676] focus:ring-1 focus:ring-[#00E676] focus:shadow-[0_0_18px_rgba(0,230,118,0.25)] transition-all duration-200 outline-none appearance-none cursor-pointer"
                  >
                    {LANGUAGES.map(({ value, label }) => (
                      <option key={value} value={value} className="bg-[#070D0A] text-white py-2">
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
                className="w-full mt-2 h-13 rounded-xl font-extrabold text-sm sm:text-base bg-gradient-to-r from-[#00C853] via-[#00E676] to-[#00E676] text-[#050A07] shadow-[0_4px_25px_rgba(0,230,118,0.35)] hover:shadow-[0_6px_35px_rgba(0,230,118,0.55)] transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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


