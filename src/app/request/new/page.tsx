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
      {/* ── Sleek 2D Ambient Glow Background (No 3D Canvas / No Floating Balls) ── */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden select-none">
        {/* Soft Volumetric Emerald Glow at Top */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[850px] h-[500px] bg-gradient-to-b from-emerald-500/15 via-emerald-500/5 to-transparent blur-3xl rounded-full" />
        {/* Subtle Ambient Accent Glows */}
        <div className="absolute top-[35%] right-[-5%] w-[450px] h-[450px] bg-emerald-600/10 blur-3xl rounded-full" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[450px] h-[450px] bg-teal-500/10 blur-3xl rounded-full" />
        {/* Faint Cyber Dot Matrix Grid */}
        <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:48px_48px] opacity-[0.04]" />
        {/* Deep Space Vignette */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050805]/40 to-[#050805]" />
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
              className="no-underline flex items-center gap-1.5 sm:gap-2 bg-[#0a0f0c]/60 hover:bg-emerald-500/15 text-[#A7B8B0] hover:text-white font-semibold text-xs sm:text-sm border border-white/10 hover:border-emerald-500/30 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 backdrop-blur-md transition-all active:scale-95"
            >
              <ArrowLeft size={16} />
              <span>Back<span className="hidden sm:inline"> to Dashboard</span></span>
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
