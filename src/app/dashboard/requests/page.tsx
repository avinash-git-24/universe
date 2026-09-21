import { Suspense } from "react";
import { getUser } from "@/lib/supabase/queries";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, RefreshCw, Truck, CheckCircle2, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getStudentRequests } from "@/lib/database/requests";
import { ROUTES } from "@/constants/routes";
import { Button } from "@/components/ui/button";
import { RequestList } from "@/components/requests/RequestList";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "My Requests · UniVerse",
  description: "View and manage all your delivery requests.",
};

export default async function MyRequestsPage() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await getUser();

  if (authError || !user) {
    redirect(ROUTES.LOGIN);
  }

  const requests = await getStudentRequests(supabase, user.id);

  // Compute live metrics for the top HUD banner
  const activeCount = requests.filter((r) =>
    ["pending", "accepted", "picked_up", "in_transit"].includes(r.status)
  ).length;
  const completedCount = requests.filter((r) => r.status === "delivered").length;

  return (
    <div className="relative min-h-screen bg-[#080b09] pt-4 sm:pt-8 pb-14 px-3 sm:px-6 text-white selection:bg-emerald-500/30 overflow-x-hidden">
      {/* ── Atmospheric Ambient Cosmic Glow Background ── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
        {/* Soft Volumetric Emerald Glow at Top */}
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[850px] h-[500px] bg-gradient-to-b from-emerald-500/10 via-emerald-500/5 to-transparent blur-3xl rounded-full" />
        {/* Subtle Cyan Relativistic Accent Light */}
        <div className="absolute top-1/3 -right-48 w-[400px] h-[400px] bg-cyan-500/5 blur-3xl rounded-full" />
        {/* Distant Cyber Stars / Dust Matrix */}
        <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:48px_48px] opacity-[0.06]" />
        {/* Deep Space Vignette */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#080b09]/50 to-[#080b09]" />
      </div>

      <div className="max-w-6xl mx-auto space-y-4 sm:space-y-8 relative z-10">
        {/* ── Page Header ── */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
              My Requests
            </h1>
            <p className="text-white/60 mt-0.5 sm:mt-1 text-xs sm:text-sm lg:text-base font-medium">
              View, track, and manage your campus delivery orders in real time.
            </p>
          </div>

          <div className="flex gap-2 sm:gap-3 items-center w-full sm:w-auto justify-between sm:justify-start">
            <div className="flex gap-2 items-center">
              <NotificationBell />
              <Link href="/dashboard/requests">
                <Button
                  variant="secondary"
                  size="icon"
                  className="bg-[#0e1713] border border-emerald-500/20 hover:border-emerald-500/40 hover:bg-[#14221b] text-white rounded-xl h-10 w-10 shadow-sm transition-all"
                  title="Refresh requests"
                >
                  <RefreshCw className="w-4 h-4 text-emerald-400" />
                </Button>
              </Link>
            </div>
            <Link href="/request/new" className="flex-1 sm:flex-initial">
              <Button className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-black font-bold rounded-xl h-10 px-4 sm:px-5 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transition-all active:scale-[0.98]">
                <Plus className="w-4 h-4 mr-1.5 stroke-[3]" />
                New Request
              </Button>
            </Link>
          </div>
        </div>

        {/* ── Top Metrics HUD Banner (Mobile-Optimized Single-Row 3-Grid) ── */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          {/* Card 1: Active In-Flight */}
          <div className="p-2.5 sm:p-5 rounded-xl sm:rounded-2xl bg-[#0b130e]/80 border border-emerald-500/25 backdrop-blur-xl shadow-[0_0_25px_rgba(16,185,129,0.06)] flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2 transition-all hover:border-emerald-500/40">
            <div className="space-y-0.5 sm:space-y-1">
              <div className="flex items-center gap-1 sm:gap-1.5 text-[9px] sm:text-[11px] font-mono tracking-wider uppercase text-emerald-400 font-bold truncate">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block shrink-0" />
                <span className="truncate">Active</span>
              </div>
              <div className="text-base sm:text-3xl font-black text-white font-mono tracking-tight">
                {activeCount} <span className="text-[10px] sm:text-xs font-normal text-white/50 hidden xs:inline sm:inline">Orders</span>
              </div>
            </div>
            <div className="w-7 h-7 sm:w-11 sm:h-11 rounded-lg sm:rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 self-end sm:self-center shadow-inner">
              <Truck className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
            </div>
          </div>

          {/* Card 2: Total Delivered */}
          <div className="p-2.5 sm:p-5 rounded-xl sm:rounded-2xl bg-[#0b130e]/80 border border-white/10 backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2 transition-all hover:border-white/20">
            <div className="space-y-0.5 sm:space-y-1">
              <span className="text-[9px] sm:text-[11px] font-mono tracking-wider uppercase text-white/50 font-bold block truncate">
                Delivered
              </span>
              <div className="text-base sm:text-3xl font-black text-white font-mono tracking-tight">
                {completedCount} <span className="text-[10px] sm:text-xs font-normal text-white/50 hidden xs:inline sm:inline">Orders</span>
              </div>
            </div>
            <div className="w-7 h-7 sm:w-11 sm:h-11 rounded-lg sm:rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/70 shrink-0 self-end sm:self-center">
              <CheckCircle2 className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
            </div>
          </div>

          {/* Card 3: Campus Peer Network */}
          <div className="p-2.5 sm:p-5 rounded-xl sm:rounded-2xl bg-[#0b130e]/80 border border-white/10 backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2 transition-all hover:border-white/20">
            <div className="space-y-0.5 sm:space-y-1">
              <span className="text-[9px] sm:text-[11px] font-mono tracking-wider uppercase text-cyan-400/85 font-bold block truncate">
                Avg. Time
              </span>
              <div className="text-xs sm:text-base font-bold text-white/95 truncate">
                ~15 mins
              </div>
              <span className="text-[9px] sm:text-[10.5px] text-white/40 font-mono truncate hidden sm:block">
                Verified Peers
              </span>
            </div>
            <div className="w-7 h-7 sm:w-11 sm:h-11 rounded-lg sm:rounded-2xl bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center text-cyan-400 shrink-0 self-end sm:self-center">
              <ShieldCheck className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
            </div>
          </div>
        </div>

        {/* ── Main Request List with Filters & Pagination ── */}
        <Suspense fallback={<div className="h-64 rounded-2xl bg-[#0b130e]/50 border border-white/5 animate-pulse" />}>
          <RequestList initialRequests={requests} />
        </Suspense>
      </div>
    </div>
  );
}
