import { getUser, getProfile } from "@/lib/supabase/queries";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import { ProfileForm } from "./ProfileForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";
import { UserRatingBadge } from "@/components/resale/UserRatingBadge";

export const metadata: Metadata = {
  title: "Edit Profile · UniVerse",
  description: "Update your UniVerse profile.",
};

export default async function ProfilePage() {
  const { data: { user }, error: authError } = await getUser();

  if (authError || !user) {
    redirect(ROUTES.LOGIN);
  }

  // Fetch real profile data for the authenticated user only
  const { data: profile } = await getProfile(user.id);

  return (
    <div className="min-h-screen pt-4 sm:pt-8 pb-16 px-3 sm:px-6 relative">
      {/* Global override ONLY for Profile page to make sidebar transparent so video shows behind it */}
      <style>{`
        aside { background: transparent !important; border-right-color: rgba(255,255,255,0.05) !important; }
      `}</style>

      {/* Video Background */}
      <div style={{ position: "fixed", inset: 0, width: "100vw", height: "100vh", zIndex: 0, pointerEvents: "none" }}>
        <video
          src="/profile-background-responsive-small.mp4"
          autoPlay
          muted
          loop
          playsInline
          style={{ width: "100vw", height: "100vh", objectFit: "cover", objectPosition: "center" }}
        />
        {/* Subtle dark overlay for readability */}
        <div style={{ position: "absolute", inset: 0, background: "rgba(0, 0, 0, 0.5)" }}></div>
      </div>

      <div style={{ maxWidth: "700px", margin: "0 auto", position: "relative", zIndex: 10 }}>

        {/* Header */}
        <div className="flex items-center justify-between gap-3 mb-6 sm:mb-8">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              width: "40px", height: "40px", borderRadius: "50%",
              background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
              color: "#A7B8B0", textDecoration: "none", transition: "all 0.2s"
            }} className="hover:bg-[rgba(255,255,255,0.1)] hover:text-white shrink-0">
              <ArrowLeft size={18} />
            </Link>
            <h1 className="text-white font-extrabold text-2xl sm:text-3xl m-0 tracking-tight">
              Edit Profile
            </h1>
          </div>
          <div className="bg-black/50 px-3 sm:px-4 py-1.5 rounded-full border border-white/10 shrink-0">
            <UserRatingBadge userId={user.id} />
          </div>
        </div>

        {/* Profile Form Component */}
        <ProfileForm
          userId={user.id}
          email={user.email || ""}
          initialData={profile || {}}
        />

      </div>
    </div>
  );
}
