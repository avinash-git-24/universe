import { getUser } from "@/lib/supabase/queries";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CreateRequestForm } from "@/components/request/CreateRequestForm";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { ArrowLeft, Sparkles, Zap } from "lucide-react";
import Link from "next/link";

export default async function NewRequestPage() {
  const { data: { user }, error } = await getUser();

  if (error || !user) {
    redirect("/login?redirectTo=/request/new");
  }

  // Ensure user profile exists in public.profiles to satisfy foreign keys
  const supabase = await createClient();
  const { data: profile } = await supabase.from("profiles").select("id").eq("id", user.id).maybeSingle();
  if (!profile) {
    const fullName =
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email?.split("@")[0] ||
      "Student";
    const enrollmentNumber =
      user.user_metadata?.enrollment_number ||
      (user.email?.includes("@") ? user.email.split("@")[0] : null);

    await supabase.from("profiles").upsert(
      {
        id: user.id,
        full_name: fullName,
        enrollment_number: enrollmentNumber,
        role: "student",
      },
      { onConflict: "id" }
    );
  }

  return (
    <div className="min-h-screen bg-[#050805] px-3 py-4 sm:px-6 sm:py-8 lg:p-10 relative overflow-x-hidden">
      {/* ── Cinematic UniVerse Cosmic Photorealistic Background ── */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden select-none">
        {/* Base dark canvas */}
        <div className="absolute inset-0 bg-[#020509]" />

        {/* High-res cinematic space vista (Earth horizon, Milky Way, Ringed Planet) */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-80"
          style={{
            backgroundImage: "url('/login-bg.jpg')",
            filter: "brightness(0.95) contrast(1.08)",
          }}
        />

        {/* Radiant Emerald Aurora & Ambient Lighting */}
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-to-b from-[#00E676]/20 via-emerald-600/10 to-transparent blur-[120px] rounded-full" />
        <div className="absolute top-[35%] -left-20 w-[500px] h-[500px] bg-emerald-500/10 blur-[130px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-teal-500/15 blur-[140px] rounded-full" />

        {/* Smooth Center Vignette so form text and cards stay crystal-clear */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(4,8,6,0.55)_20%,rgba(2,5,9,0.85)_100%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050805]/50 via-transparent to-[#050805]/80" />

        {/* Luminous Horizon Accent Line */}
        <div className="absolute top-[160px] left-1/2 -translate-x-1/2 w-[85%] max-w-[950px] h-[1px] bg-gradient-to-r from-transparent via-[#00E676]/40 to-transparent blur-[0.5px]" />
      </div>

      <main className="relative z-10 w-full max-w-4xl mx-auto">
        {/* Top Bar */}
        <div className="flex justify-between items-center mb-6 sm:mb-10">
          {/* Logo */}
          <Link href="/dashboard" className="no-underline group">
            <div className="flex items-center gap-2.5">
              <div className="bg-[#00E676] rounded-xl p-1.5 flex items-center justify-center shadow-[0_0_15px_rgba(0,230,118,0.35)] group-hover:scale-105 transition-transform">
                <Zap size={18} color="#050805" fill="#050805" />
              </div>
              <span className="text-white font-extrabold text-xl sm:text-2xl tracking-tight">
                Uni<span className="text-[#00E676]">Verse</span>
              </span>
            </div>
          </Link>

          {/* Right Actions: Back to Dashboard & Notification Bell */}
          <div className="flex gap-2.5 sm:gap-3.5 items-center">
            <Link
              href="/dashboard"
              className="no-underline flex items-center gap-2 bg-[#0a0f0c]/60 hover:bg-emerald-500/15 text-[#A7B8B0] hover:text-white font-semibold text-xs sm:text-sm border border-white/10 hover:border-emerald-500/30 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 backdrop-blur-md transition-all active:scale-95"
            >
              <ArrowLeft size={16} />
              <span className="hidden xs:inline">Back to Dashboard</span>
            </Link>

            {/* Notification Bell */}
            <div className="relative bg-[#0a0f0c]/60 border border-white/10 hover:border-emerald-500/30 p-2 sm:p-2.5 rounded-xl backdrop-blur-md transition-colors">
              <NotificationBell />
            </div>
          </div>
        </div>

        {/* Header Section */}
        <div className="text-center mb-6 sm:mb-10 flex flex-col items-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-semibold mb-3">
            <Sparkles size={13} />
            <span>Instant Campus Delivery Network</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white mb-2 tracking-tight">
            Create <span className="text-[#00E676] drop-shadow-[0_0_20px_rgba(0,230,118,0.35)]">Request</span>
          </h1>
          <p className="text-[#A7B8B0] text-xs sm:text-sm lg:text-base max-w-md">
            Tell us what you need — student runners across campus will deliver it straight to your room.
          </p>
        </div>

        {/* Main Form */}
        <CreateRequestForm requesterId={user.id} />
      </main>
    </div>
  );
}
