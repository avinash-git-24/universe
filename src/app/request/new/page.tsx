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
      {/* ── High-End 2D Aurora & Cyber Mesh Background ── */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden select-none">
        {/* Primary Radiant Emerald Aurora at Top Center */}
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-[#00E676]/22 via-emerald-600/12 to-transparent blur-[130px] rounded-full" />

        {/* Soft Electric Mint Core Glow behind Header */}
        <div className="absolute top-[80px] left-1/2 -translate-x-1/2 w-[650px] h-[350px] bg-emerald-400/[0.14] blur-[100px] rounded-full" />

        {/* Ambient Wing Glows for visual depth */}
        <div className="absolute top-[28%] -right-24 w-[500px] h-[500px] bg-emerald-500/10 blur-[130px] rounded-full" />
        <div className="absolute top-[45%] -left-28 w-[520px] h-[520px] bg-teal-500/10 blur-[140px] rounded-full" />
        <div className="absolute bottom-[-10%] left-1/3 w-[600px] h-[500px] bg-emerald-600/10 blur-[150px] rounded-full" />

        {/* Precision High-Tech SVG Grid with Glowing Dot Intersections */}
        <svg
          className="absolute inset-0 w-full h-full opacity-[0.16]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="request-cyber-grid" width="48" height="48" patternUnits="userSpaceOnUse">
              <path d="M 48 0 L 0 0 0 48" fill="none" stroke="rgba(0, 230, 118, 0.22)" strokeWidth="0.8" />
              <circle cx="48" cy="48" r="1.2" fill="rgba(0, 230, 118, 0.65)" />
            </pattern>
            <radialGradient id="grid-radial-fade" cx="50%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#fff" stopOpacity="1" />
              <stop offset="50%" stopColor="#fff" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#fff" stopOpacity="0" />
            </radialGradient>
            <mask id="cyber-grid-mask">
              <rect width="100%" height="100%" fill="url(#grid-radial-fade)" />
            </mask>
          </defs>
          <rect width="100%" height="100%" fill="url(#request-cyber-grid)" mask="url(#cyber-grid-mask)" />
        </svg>

        {/* Micro Star Stardust (Static 2D SVG, Crisp & Elegant) */}
        <svg
          className="absolute inset-0 w-full h-full opacity-60"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Top subtle stars */}
          <circle cx="15%" cy="12%" r="1" fill="#00E676" opacity="0.6" />
          <circle cx="28%" cy="8%" r="1.5" fill="#fff" opacity="0.7" />
          <circle cx="42%" cy="16%" r="0.8" fill="#00E676" opacity="0.5" />
          <circle cx="70%" cy="10%" r="1.2" fill="#fff" opacity="0.6" />
          <circle cx="85%" cy="14%" r="1.6" fill="#00E676" opacity="0.7" />
          <circle cx="92%" cy="6%" r="0.9" fill="#fff" opacity="0.5" />

          {/* Middle atmospheric stars */}
          <circle cx="8%" cy="35%" r="1.4" fill="#00E676" opacity="0.5" />
          <circle cx="18%" cy="48%" r="1" fill="#fff" opacity="0.4" />
          <circle cx="82%" cy="38%" r="1.3" fill="#00E676" opacity="0.6" />
          <circle cx="94%" cy="46%" r="0.8" fill="#fff" opacity="0.5" />

          {/* Lower field stars */}
          <circle cx="12%" cy="72%" r="1.2" fill="#fff" opacity="0.5" />
          <circle cx="25%" cy="85%" r="0.9" fill="#00E676" opacity="0.6" />
          <circle cx="78%" cy="78%" r="1.4" fill="#00E676" opacity="0.5" />
          <circle cx="88%" cy="88%" r="1" fill="#fff" opacity="0.4" />
        </svg>

        {/* Subtle Horizontal Horizon Light Beam */}
        <div className="absolute top-[170px] left-1/2 -translate-x-1/2 w-[85%] max-w-[950px] h-[1px] bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent blur-[0.5px]" />

        {/* Deep Vignette Edge Falloff */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050805]/30 to-[#050805]" />
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
