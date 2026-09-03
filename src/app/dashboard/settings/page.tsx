import { getUser, getProfile } from "@/lib/supabase/queries";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import { SettingsClient } from "./SettingsClient";
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
    <div className="min-h-screen pt-4 sm:pt-8 pb-16 px-3 sm:px-6 relative overflow-hidden bg-[#060a08]">
      {/* Lightweight CSS stardust particles */}
      <div
        className="absolute inset-0 z-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `radial-gradient(1px 1px at 25px 35px, #00E676, rgba(0,0,0,0)), radial-gradient(1.5px 1.5px at 160px 190px, #ffffff, rgba(0,0,0,0))`,
          backgroundSize: "320px 320px",
        }}
      />

      {/* Cosmic ambient radial glows */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] rounded-full bg-radial from-emerald-500/10 via-transparent to-transparent blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-10 w-[500px] h-[500px] rounded-full bg-radial from-teal-500/10 via-transparent to-transparent blur-3xl pointer-events-none" />

      <div className="max-w-[820px] mx-auto relative z-10">
        
        {/* Header */}
        <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
          <Link 
            href="/dashboard" 
            className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 text-[#A7B8B0] hover:text-white transition-all group shrink-0"
          >
            <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-0.5 text-emerald-400" />
          </Link>
          <div>
            <h1 className="text-white font-extrabold text-2xl sm:text-3xl m-0 tracking-tight flex items-center gap-2.5">
              <span>Settings</span>
            </h1>
            <p className="text-white/60 text-xs sm:text-sm m-0 mt-1">
              Manage your campus identity, security credentials, and preferences.
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
