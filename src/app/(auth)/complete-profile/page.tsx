"use client";

/**
 * UniVerse — Complete Profile Page
 *
 * Step 3 of onboarding: sets up hostel, room, bio, preferred language,
 * and profile photo with crystal-clear cosmic background matching the login page.
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
  Loader2, 
  ArrowRight,
  Building,
  Check
} from "lucide-react";
import StarTwinkleOverlay from "@/components/auth/StarTwinkleOverlay";
import { ROUTES } from "@/constants/routes";
import { createClient } from "@/lib/supabase/client";

// ─── Constants ────────────────────────────────────────────────────────────────

const HOSTELS = [
  { id: "Hostel A", label: "Hostel A" },
  { id: "Hostel B", label: "Hostel B" },
  { id: "Hostel C", label: "Hostel C" },
  { id: "Hostel D", label: "Hostel D" },
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
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
      <label
        style={{ position: "relative", cursor: "pointer" }}
        aria-label="Upload profile photo"
      >
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          style={{ display: "none" }}
          onChange={handleFile}
          aria-label="Profile photo file input"
        />

        {/* Avatar circle */}
        <div
          style={{
            width: 104, height: 104, borderRadius: "50%",
            background: "rgba(3,10,22,0.6)",
            border: preview ? "2px solid #38BDF8" : "1.5px dashed rgba(56,189,248,0.4)",
            display: "flex", alignItems: "center", justifyContent: "center",
            overflow: "hidden", position: "relative",
            boxShadow: preview ? "0 0 20px rgba(56,189,248,0.3)" : "none",
            transition: "all 0.2s ease-in-out",
          }}
        >
          {preview ? (
            <Image
              src={preview}
              alt="Profile photo preview"
              width={104}
              height={104}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, color: "rgba(180,205,235,0.7)" }}>
              <Camera size={28} />
              <span style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>Photo</span>
            </div>
          )}

          {/* Hover overlay */}
          <div
            style={{
              position: "absolute", inset: 0,
              background: "rgba(0,0,0,0.55)",
              opacity: 0, transition: "opacity 0.2s",
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              gap: 2,
            }}
            className="hover:opacity-100"
          >
            <Camera size={20} color="#38BDF8" />
            <span style={{ fontSize: 10, color: "#fff", fontWeight: 600 }}>
              {preview ? "Change" : "Upload"}
            </span>
          </div>
        </div>

        {/* Floating mini badge */}
        <div
          style={{
            position: "absolute", bottom: 0, right: 0,
            width: 28, height: 28, borderRadius: "50%",
            background: "linear-gradient(135deg, #38BDF8 0%, #0284C7 100%)",
            color: "#000",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
            border: "2px solid #050c18",
          }}
        >
          <Camera size={13} strokeWidth={2.5} />
        </div>
      </label>
      
      <p style={{ margin: 0, fontSize: 12, color: "rgba(180,205,235,0.75)", fontWeight: 500, textAlign: "center" }}>
        Upload profile photo <span style={{ color: "rgba(180,205,235,0.4)" }}>(optional)</span>
      </p>
    </div>
  );
}

// ─── Success screen ───────────────────────────────────────────────────────────

function SuccessScreen() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20, padding: "32px 16px", textAlign: "center" }}>
      <div style={{
        width: 72, height: 72, borderRadius: "50%",
        background: "rgba(56,189,248,0.15)",
        border: "1px solid rgba(56,189,248,0.35)",
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "0 0 30px rgba(56,189,248,0.35)",
      }}>
        <CheckCircle2 size={38} color="#38BDF8" />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: "#fff", letterSpacing: "-0.02em" }}>
          You&apos;re all set! 🎉
        </h2>
        <p style={{ margin: 0, fontSize: 14, color: "rgba(180,205,235,0.85)", maxWidth: 320, lineHeight: 1.5 }}>
          Your profile is ready. Redirecting you straight to your UniVerse dashboard…
        </p>
      </div>
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        fontSize: 13, fontWeight: 600, color: "#38BDF8",
        padding: "8px 16px", borderRadius: 20,
        background: "rgba(56,189,248,0.1)", border: "1px solid rgba(56,189,248,0.2)",
      }}>
        <Loader2 size={15} className="animate-spin" />
        <span>Launching dashboard...</span>
      </div>
    </div>
  );
}

// ─── Page Component ───────────────────────────────────────────────────────────

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
    <div style={{
      width: "100%", minHeight: "100dvh",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      fontFamily: "'Inter', system-ui, sans-serif", padding: "24px 14px",
    }}>
      
      {/* ── High-Definition Crisp Static Cosmic Wallpaper (Identical to Login Page) ── */}
      <div style={{
        position: "fixed", inset: 0, zIndex: -2, background: "#02050b"
      }} />
      <div style={{
        position: "fixed", inset: 0, zIndex: -2,
        background: "url('/login-bg.jpg')",
        backgroundSize: "cover", backgroundPosition: "center center", backgroundRepeat: "no-repeat",
        filter: "brightness(0.98) contrast(1.06)",
      }} />

      {/* Fixed Star Twinkle Canvas Overlay */}
      <StarTwinkleOverlay />

      {/* Clear Center Vignette Overlay */}
      <div style={{
        position: "fixed", inset: 0, zIndex: -1,
        background: "radial-gradient(circle at center, transparent 35%, rgba(2,5,15,0.55) 100%)",
        pointerEvents: "none"
      }} />

      {/* ── Main Container ── */}
      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 480, display: "flex", flexDirection: "column", alignItems: "center" }}>
        
        {/* ── Logo + Tagline ── */}
        <Link href="/" style={{ textDecoration: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: 12, background: "linear-gradient(135deg, #38BDF8 0%, #0284C7 100%)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 20px rgba(56,189,248,0.45)", flexShrink: 0 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="black" stroke="black" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </div>
            <span style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.02em", color: "#fff", lineHeight: 1 }}>
              UniVerse
            </span>
          </div>
          <span style={{ fontSize: 12, color: "rgba(180,205,235,0.85)", letterSpacing: "0.03em", fontWeight: 500, textTransform: "uppercase", textAlign: "center" }}>
            One Universe. Infinite Possibilities.
          </span>
        </Link>

        {/* ── Glass Card (Identical to Login Card) ── */}
        <div style={{
          width: "100%",
          background: "rgba(5,12,24,0.85)",
          border: "1px solid rgba(56,189,248,0.25)",
          borderRadius: 24,
          boxShadow: "0 24px 60px rgba(0,0,0,0.9)",
          overflow: "hidden", position: "relative",
        }}>
          {/* Top subtle gradient glow line */}
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent 5%, rgba(56,189,248,0.6) 40%, rgba(56,189,248,0.6) 60%, transparent 95%)" }} />

          {/* ── Card Header ── */}
          <div style={{ padding: "28px 24px 18px", position: "relative" }}>
            <div style={{ marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 2L11 8L17 9L11 10L10 16L9 10L3 9L9 8L10 2Z" fill="#38BDF8" />
                <path d="M19 12L19.5 14.5L22 15L19.5 15.5L19 18L18.5 15.5L16 15L18.5 14.5L19 12Z" fill="#38BDF8" />
                <path d="M6 18L6.5 19.5L8 20L6.5 20.5L6 22L5.5 20.5L4 20L5.5 19.5L6 18Z" fill="#38BDF8" />
              </svg>
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#38BDF8", padding: "3px 10px", borderRadius: 20, background: "rgba(56,189,248,0.1)", border: "1px solid rgba(56,189,248,0.25)" }}>
                Step 3 of 3
              </span>
            </div>
            <h1 style={{ margin: "0 0 6px 0", fontSize: 24, fontWeight: 700, color: "#fff", letterSpacing: "-0.02em" }}>
              Complete your profile
            </h1>
            <p style={{ margin: 0, fontSize: 13.5, color: "rgba(180,205,235,0.88)", letterSpacing: "-0.01em" }}>
              Help your campus community find and recognize you
            </p>
          </div>

          {done ? (
            <SuccessScreen />
          ) : (
            <form onSubmit={handleSubmit} noValidate style={{ padding: "0 24px 30px", display: "flex", flexDirection: "column", gap: 18 }}>
              
              {/* Global Error */}
              {errors.form && (
                <div style={{ padding: "12px 16px", borderRadius: 12, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#fca5a5", fontSize: 13.5, wordBreak: "break-word" }}>
                  {errors.form}
                </div>
              )}

              {/* Photo Upload */}
              <PhotoUpload preview={photo} onSelect={handlePhotoSelect} />

              {/* Hostel Selection */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <label style={{ fontSize: 13, fontWeight: 500, color: "#E8F0EB", display: "flex", alignItems: "center", gap: 6 }}>
                    <Building size={14} color="#38BDF8" />
                    Hostel <span style={{ color: "#38BDF8" }}>*</span>
                  </label>
                  {hostel && (
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#38BDF8", display: "flex", alignItems: "center", gap: 3 }}>
                      <Check size={12} strokeWidth={3} /> Selected
                    </span>
                  )}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
                  {HOSTELS.map((h) => {
                    const isSelected = hostel === h.id;
                    return (
                      <button
                        key={h.id}
                        type="button"
                        onClick={() => setHostel(h.id)}
                        style={{
                          height: 40, borderRadius: 10,
                          fontSize: 12.5, fontWeight: isSelected ? 700 : 500,
                          cursor: "pointer",
                          transition: "all 0.15s ease-in-out",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          background: isSelected ? "linear-gradient(135deg, #38BDF8 0%, #0284C7 100%)" : "rgba(3,10,22,0.6)",
                          color: isSelected ? "#000" : "rgba(180,205,235,0.85)",
                          border: isSelected ? "1px solid #38BDF8" : "1px solid rgba(56,189,248,0.2)",
                          boxShadow: isSelected ? "0 0 16px rgba(56,189,248,0.4)" : "none",
                        }}
                      >
                        {h.label}
                      </button>
                    );
                  })}
                </div>
                {errors.hostel && (
                  <span style={{ fontSize: 12, color: "#fca5a5" }}>{errors.hostel}</span>
                )}
              </div>

              {/* Room Number */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <label htmlFor="profile-room" style={{ fontSize: 13, fontWeight: 500, color: "#E8F0EB" }}>
                  Room Number <span style={{ color: "#38BDF8" }}>*</span>
                </label>
                <div style={{
                  position: "relative", display: "flex", alignItems: "center",
                  background: "rgba(3,10,22,0.5)",
                  border: `1px solid ${errors.room ? "rgba(239,68,68,0.5)" : "rgba(56,189,248,0.2)"}`,
                  borderRadius: 14,
                  transition: "all 0.2s ease-in-out",
                }}>
                  <span style={{ position: "absolute", left: 16, display: "flex", alignItems: "center", color: "rgba(56,189,248,0.9)", pointerEvents: "none" }}>
                    <Hash size={16} />
                  </span>
                  <input
                    id="profile-room"
                    type="text"
                    placeholder="e.g. A-204 or B-102"
                    autoComplete="off"
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                    style={{
                      width: "100%", background: "transparent", border: "none", outline: "none",
                      color: "#fff", fontSize: 14.5, padding: "14px 44px",
                      fontFamily: "inherit",
                    }}
                  />
                </div>
                {errors.room && (
                  <span style={{ fontSize: 12, color: "#fca5a5" }}>{errors.room}</span>
                )}
              </div>

              {/* Bio */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <label htmlFor="profile-bio" style={{ fontSize: 13, fontWeight: 500, color: "#E8F0EB" }}>
                    Bio <span style={{ color: "rgba(180,205,235,0.45)", fontWeight: 400 }}>(Optional)</span>
                  </label>
                  <span style={{ fontSize: 11, color: "rgba(180,205,235,0.5)", fontFamily: "monospace" }}>
                    {bio.length}/160
                  </span>
                </div>
                <div style={{
                  position: "relative", display: "flex",
                  background: "rgba(3,10,22,0.5)",
                  border: "1px solid rgba(56,189,248,0.2)",
                  borderRadius: 14,
                }}>
                  <span style={{ position: "absolute", left: 16, top: 14, display: "flex", color: "rgba(56,189,248,0.9)", pointerEvents: "none" }}>
                    <MessageSquare size={16} />
                  </span>
                  <textarea
                    id="profile-bio"
                    rows={3}
                    maxLength={160}
                    placeholder="Tell your peers about your department, branch, interests…"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    style={{
                      width: "100%", background: "transparent", border: "none", outline: "none",
                      color: "#fff", fontSize: 14, padding: "12px 16px 12px 44px",
                      fontFamily: "inherit", resize: "none", lineHeight: 1.5,
                    }}
                  />
                </div>
              </div>

              {/* Preferred Language */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <label htmlFor="profile-language" style={{ fontSize: 13, fontWeight: 500, color: "#E8F0EB" }}>
                  Preferred Language
                </label>
                <div style={{
                  position: "relative", display: "flex", alignItems: "center",
                  background: "rgba(3,10,22,0.5)",
                  border: "1px solid rgba(56,189,248,0.2)",
                  borderRadius: 14,
                }}>
                  <span style={{ position: "absolute", left: 16, display: "flex", alignItems: "center", color: "rgba(56,189,248,0.9)", pointerEvents: "none" }}>
                    <Globe size={16} />
                  </span>
                  <select
                    id="profile-language"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as Language)}
                    style={{
                      width: "100%", background: "transparent", border: "none", outline: "none",
                      color: "#fff", fontSize: 14, padding: "14px 44px",
                      fontFamily: "inherit", cursor: "pointer", appearance: "none",
                    }}
                  >
                    {LANGUAGES.map(({ value, label }) => (
                      <option key={value} value={value} style={{ background: "#050c18", color: "#fff" }}>
                        {label}
                      </option>
                    ))}
                  </select>
                  <span style={{ position: "absolute", right: 16, display: "flex", pointerEvents: "none", color: "rgba(180,205,235,0.6)" }}>
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
                style={{
                  width: "100%", marginTop: 8, height: 48,
                  borderRadius: 12,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  background: loading ? "rgba(2,132,199,0.5)" : "linear-gradient(90deg, #0284C7 0%, #38BDF8 100%)",
                  color: "#000", fontWeight: 700, fontSize: 15,
                  border: "none", cursor: loading ? "not-allowed" : "pointer",
                  boxShadow: "0 0 24px rgba(56,189,248,0.4)",
                  transition: "all 0.2s ease-in-out",
                }}
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin text-black" />
                    <span>Saving profile…</span>
                  </>
                ) : (
                  <>
                    <span>Complete Profile</span>
                    <ArrowRight size={17} strokeWidth={2.5} />
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Skip Link */}
        {!done && (
          <Link
            href={ROUTES.DASHBOARD}
            style={{
              marginTop: 20, display: "flex", alignItems: "center", gap: 6,
              fontSize: 13, color: "rgba(180,205,235,0.75)", textDecoration: "none",
              fontWeight: 500, transition: "color 0.15s",
            }}
            className="hover:text-white"
          >
            <ArrowLeft size={14} />
            <span>Skip for now, go to Dashboard</span>
          </Link>
        )}
      </div>
    </div>
  );
}



