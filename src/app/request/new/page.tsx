import { getUser } from "@/lib/supabase/queries";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CreateRequestForm } from "@/components/request/CreateRequestForm";
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

      <main className="relative z-10 w-full max-w-4xl mx-auto min-w-[320px]">
        {/* Top Bar with Ergonomic Mobile Placement */}
        <div className="flex justify-between items-center mb-4 sm:mb-8">
          {/* Left: Back Button + UniVerse Brand */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/dashboard"
              className="no-underline flex items-center justify-center bg-[#0a0f0c]/70 hover:bg-emerald-500/15 text-[#A7B8B0] hover:text-white font-semibold border border-white/10 hover:border-emerald-500/30 rounded-xl w-9 h-9 sm:w-auto sm:px-3.5 sm:py-2 backdrop-blur-md transition-all active:scale-95 shadow-sm"
              title="Back to Dashboard"
              aria-label="Back to Dashboard"
            >
              <ArrowLeft size={16} />
              <span className="hidden sm:inline text-xs font-semibold ml-1.5">Dashboard</span>
            </Link>

            <Link href="/dashboard" className="no-underline group">
              <div className="flex items-center gap-2">
                <div className="bg-[#00E676] rounded-xl p-1.5 flex items-center justify-center shadow-[0_0_15px_rgba(0,230,118,0.35)] group-hover:scale-105 transition-transform">
                  <Zap size={16} color="#050805" fill="#050805" />
                </div>
                <span className="text-white font-extrabold text-lg sm:text-2xl tracking-tight">
                  Uni<span className="text-[#00E676]">Verse</span>
                </span>
              </div>
            </Link>
          </div>

          {/* Right: Live Runners Active Pulse Badge */}
          <div
            className="flex items-center gap-2 bg-[#0a0f0c]/80 border border-emerald-500/30 shadow-[0_0_15px_rgba(0,230,118,0.18)] px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl backdrop-blur-md"
            title="Live student runners active across Marwadi University campus"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00E676] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00E676]" />
            </span>
            <span className="text-emerald-400 font-bold text-[11px] sm:text-xs tracking-wide select-none">
              <span className="sm:hidden">12+ Active</span>
              <span className="hidden sm:inline">12+ Runners Online</span>
            </span>
          </div>
        </div>

        {/* Header Section */}
        <div className="text-center mb-4 sm:mb-8 flex flex-col items-center">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[11px] sm:text-xs font-semibold mb-2">
            <Sparkles size={12} />
            <span>Instant Campus Delivery Network</span>
          </div>
          <h1 className="text-xl sm:text-3xl lg:text-4xl font-extrabold text-white mb-1 tracking-tight">
            Create <span className="text-[#00E676] drop-shadow-[0_0_20px_rgba(0,230,118,0.35)]">Request</span>
          </h1>
          <p className="text-[#A7B8B0] text-xs sm:text-sm lg:text-base max-w-md px-2">
            Tell us what you need — student runners will deliver it straight to your room.
          </p>
        </div>

        {/* Main Form */}
        <CreateRequestForm requesterId={user.id} />
      </main>
    </div>
  );
}
