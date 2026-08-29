import { getUser, getProfile } from "@/lib/supabase/queries";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import { SettingsClient } from "./SettingsClient";
import LazySpaceBackground from "@/components/auth/LazySpaceBackground";
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
    <div className="min-h-screen pt-4 sm:pt-8 pb-16 px-3 sm:px-6 relative">
      {/* Floating particles background (lazy-loaded Three.js) */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40 fixed">
        <LazySpaceBackground />
      </div>

      <div style={{ maxWidth: "800px", margin: "0 auto", position: "relative", zIndex: 10 }}>
        
        {/* Header */}
        <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
          <Link href="/dashboard" style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            width: "40px", height: "40px", borderRadius: "50%",
            background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
            color: "#A7B8B0", textDecoration: "none", transition: "all 0.2s"
          }} className="hover:bg-[rgba(255,255,255,0.1)] hover:text-white shrink-0">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-white font-extrabold text-2xl sm:text-3xl m-0 tracking-tight">
              Settings
            </h1>
            <p className="text-white/60 text-xs sm:text-sm m-0 mt-1">
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
