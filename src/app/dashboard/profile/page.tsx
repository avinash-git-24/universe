import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import { ProfileForm } from "./ProfileForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Edit Profile · UniVerse",
  description: "Update your UniVerse profile.",
};

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect(ROUTES.LOGIN);
  }

  // Fetch real profile data for the authenticated user only
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <div style={{ minHeight: "100vh", paddingTop: "2rem", paddingBottom: "3rem", paddingLeft: "2rem", paddingRight: "2rem", position: "relative" }}>
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
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2rem" }}>
          <Link href="/dashboard" style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            width: "40px", height: "40px", borderRadius: "50%",
            background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
            color: "#A7B8B0", textDecoration: "none", transition: "all 0.2s"
          }} className="hover:bg-[rgba(255,255,255,0.1)] hover:text-white">
            <ArrowLeft size={18} />
          </Link>
          <h1 style={{ color: "#fff", fontWeight: 800, fontSize: "1.8rem", margin: 0, letterSpacing: "-0.02em" }}>
            Edit Profile
          </h1>
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
