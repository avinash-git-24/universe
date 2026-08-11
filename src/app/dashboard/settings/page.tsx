import { getUser, getProfile } from "@/lib/supabase/queries";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import { SettingsClient } from "./SettingsClient";
import SpaceBackground from "@/components/auth/SpaceBackground";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings · UniVerse",
  description: "Manage your account settings and preferences.",
};

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await getUser();

  if (authError || !user) {
    redirect(ROUTES.LOGIN);
  }

  // Fetch real profile data
  const { data: profile } = await getProfile(user.id);

  // Fetch or initialize user settings
  let { data: settings } = await supabase
    .from("user_settings")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!settings) {
    // Attempt to create default settings if none exist
    const { data: newSettings } = await supabase
      .from("user_settings")
      .insert({ user_id: user.id })
      .select()
      .single();
    settings = newSettings;
  }

  return (
    <div style={{ minHeight: "100vh", paddingTop: "2rem", paddingBottom: "3rem", paddingLeft: "2rem", paddingRight: "2rem", position: "relative" }}>
      {/* Floating particles background (re-using SpaceBackground) */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40 fixed">
        <SpaceBackground />
      </div>

      <div style={{ maxWidth: "800px", margin: "0 auto", position: "relative", zIndex: 10 }}>
        
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
          <div>
            <h1 style={{ color: "#fff", fontWeight: 800, fontSize: "1.8rem", margin: 0, letterSpacing: "-0.02em" }}>
              Settings
            </h1>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.9rem", margin: 0, marginTop: "0.25rem" }}>
              Manage your account, security, and preferences.
            </p>
          </div>
        </div>

        {/* Settings Client Component */}
        <SettingsClient 
          userId={user.id} 
          email={user.email || ""} 
          initialProfile={profile || {}} 
          initialSettings={settings || {}}
        />
        
      </div>
    </div>
  );
}
