import { redirect } from "next/navigation";
import { Package, Bike, CheckCircle2, AlertCircle, ArrowRight, MapPin, Clock, User, Plus, MessageSquare, Utensils, BookOpen, Laptop, Sparkles } from "lucide-react";
import { getUser, getProfile } from "@/lib/supabase/queries";
import { getStudentRequests, type Profile } from "@/lib/database/requests";
import { ROUTES } from "@/constants/routes";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { ProfileSummary } from "@/components/dashboard/ProfileSummary";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { DashboardCharts } from "@/components/dashboard/DashboardCharts";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import Link from "next/link";
import type { Metadata } from "next";
import LazySpaceBackground from "@/components/auth/LazySpaceBackground";
import { formatStudentName, cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Dashboard · UniVerse",
  description: "Your UniVerse campus dashboard.",
};

const statusMeta: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  pending: { label: "Pending", color: "#F59E0B", bg: "rgba(245,158,11,0.15)", dot: "#F59E0B" },
  accepted: { label: "Accepted", color: "#00E676", bg: "rgba(0,230,118,0.15)", dot: "#00E676" },
  picked_up: { label: "Picked Up", color: "#6366f1", bg: "rgba(99,102,241,0.15)", dot: "#6366f1" },
  in_transit: { label: "In Transit", color: "#8b5cf6", bg: "rgba(139,92,246,0.15)", dot: "#8b5cf6" },
  delivered: { label: "Delivered", color: "#00E676", bg: "rgba(0,230,118,0.15)", dot: "#00E676" },
  cancelled: { label: "Cancelled", color: "#ef4444", bg: "rgba(239,68,68,0.15)", dot: "#ef4444" },
};

function getItemCategory(name: string) {
  const lower = name.toLowerCase();
  if (lower.includes("kitkat") || lower.includes("lays") || lower.includes("biskut") || lower.includes("biscuit") || lower.includes("snack") || lower.includes("food") || lower.includes("tea") || lower.includes("tiktack")) {
    return { icon: Utensils, bg: "bg-amber-500/15 text-amber-400 border-amber-500/30" };
  }
  if (lower.includes("book") || lower.includes("notes") || lower.includes("print") || lower.includes("pen")) {
    return { icon: BookOpen, bg: "bg-blue-500/15 text-blue-400 border-blue-500/30" };
  }
  if (lower.includes("charger") || lower.includes("cable") || lower.includes("mouse") || lower.includes("laptop")) {
    return { icon: Laptop, bg: "bg-purple-500/15 text-purple-400 border-purple-500/30" };
  }
  return { icon: Package, bg: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" };
}

import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const { data: { user }, error: authError } = await getUser();
  if (authError || !user) redirect(ROUTES.LOGIN);

  const supabase = await createClient();

  // Parallelize profile and requests fetch for instant response
  const [profileResult, requests] = await Promise.all([
    getProfile(user.id),
    getStudentRequests(supabase, user.id),
  ]);

  const profile = profileResult.data;
  const displayName =
    profile?.full_name ?? user.email?.split("@")[0] ?? "Student";

  const activeRequests = requests.filter(r => !["delivered", "cancelled"].includes(r.status));
  const completedRequests = requests.filter(r => r.status === "delivered");
  const cancelledRequests = requests.filter(r => r.status === "cancelled");

  const stats = [
    {
      label: "Total Requests", value: requests.length, icon: Package,
      gradient: "rgba(10,15,12,0.4)",
      iconBg: "rgba(0,230,118,0.1)",
      trend: "All time",
    },
    {
      label: "Active Requests", value: activeRequests.length, icon: Bike,
      gradient: "rgba(10,15,12,0.4)",
      iconBg: "rgba(102,255,178,0.1)",
      trend: "In progress",
    },
    {
      label: "Completed", value: completedRequests.length, icon: CheckCircle2,
      gradient: "rgba(10,15,12,0.4)",
      iconBg: "rgba(0,230,118,0.1)",
      trend: "Delivered",
    },
    {
      label: "Cancelled", value: cancelledRequests.length, icon: AlertCircle,
      gradient: "rgba(10,15,12,0.4)",
      iconBg: "rgba(239,68,68,0.1)",
      trend: "Not completed",
    },
  ];

  return (
    <div className="min-h-screen pt-4 pb-12 px-3 sm:px-6 sm:py-8 lg:p-8 relative overflow-x-hidden">
      {/* ── Atmospheric Cosmic Background ── */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Deep ambient cosmic glow */}
        <div className="absolute top-[-15%] left-[20%] w-[650px] h-[650px] bg-emerald-500/10 rounded-full blur-[140px]" />
        <div className="absolute top-[35%] right-[-10%] w-[550px] h-[550px] bg-emerald-600/5 rounded-full blur-[160px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-teal-500/5 rounded-full blur-[140px]" />
        
        {/* Subtle stardust cyber-grid */}
        <div 
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #10b981 1px, transparent 0)`,
            backgroundSize: "32px 32px",
          }}
        />

        {/* Floating particles background */}
        <div className="absolute inset-0 opacity-30">
          <LazySpaceBackground />
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto relative z-10">
        
        {/* TOP BAR */}
        <div className="flex justify-between sm:justify-end gap-3 sm:gap-4 mb-4 sm:mb-6 items-center">
          {/* Bell */}
          <div className="relative bg-[#0b120e]/80 border border-white/10 p-2.5 rounded-xl backdrop-blur-md hover:border-emerald-500/30 transition-colors">
            <NotificationBell />
          </div>
          {/* New Request Button */}
          <Link href="/request/new" className="no-underline">
            <button className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-black font-extrabold text-xs sm:text-sm rounded-xl px-4 sm:px-5 py-2.5 sm:py-3 cursor-pointer shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transition-all active:scale-95">
              <Plus size={16} /> New Request
            </button>
          </Link>
        </div>

        {/* Main layout (stacks on <xl, 2-col on xl+) */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-6 items-start">

          {/* LEFT: Requests & Charts */}
          <div className="flex flex-col gap-6 min-w-0">
            
            {/* Header */}
            <DashboardHeader displayName={displayName} />

            {/* Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {stats.map(s => (
                <StatsCard key={s.label} {...s} />
              ))}
            </div>

            {/* Charts Row */}
            <DashboardCharts requests={requests} />

            {/* Active Deliveries */}
            <section>
              <div className="flex justify-between items-center mb-3 sm:mb-4">
                <h2 className="font-extrabold text-base sm:text-lg flex items-center gap-2 text-white">
                  Active Deliveries
                  <span className="bg-emerald-500 text-black text-[11px] sm:text-xs font-extrabold rounded-full px-2 py-0.5">
                    {activeRequests.length}
                  </span>
                </h2>
                {activeRequests.length > 0 && (
                  <Link href="/dashboard/requests" className="no-underline flex items-center gap-1 text-emerald-400 text-xs sm:text-sm font-semibold hover:underline">
                    View all <ArrowRight size={13} />
                  </Link>
                )}
              </div>

              <div className={`grid ${activeRequests.length > 0 ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"} gap-3 sm:gap-4`}>
                {activeRequests.length === 0 ? (
                  <div className="bg-[#0b120e]/60 border border-dashed border-white/10 rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center text-white/50 text-sm backdrop-blur-xl">
                    No active deliveries right now.
                  </div>
                ) : (
                  activeRequests.slice(0, 2).map((req) => {
                    const meta = statusMeta[req.status] || { color: "#F59E0B", label: req.status };
                    const activeAssignment = req.assignments?.find(a => a.status === "active" || a.status === "completed");
                    const runner = activeAssignment?.runner;
                    const runnerCleanName = runner?.full_name
                      ? formatStudentName(runner.full_name).fullName
                      : (req.assignments && req.assignments.length > 0 ? "Assigned" : "Finding Runner...");
                    const runnerInitial = runner?.full_name
                      ? formatStudentName(runner.full_name).initial
                      : null;
                    
                    return (
                      <Link key={req.id} href={`/dashboard/requests/${req.id}`} className="no-underline block">
                        <div
                          style={{
                            borderLeftColor: meta.color,
                          }}
                          className="bg-[#0b120e]/90 border border-white/10 border-l-4 rounded-2xl sm:rounded-3xl p-4 sm:p-5 cursor-pointer transition-all duration-300 backdrop-blur-xl relative overflow-hidden group hover:border-emerald-500/40 hover:-translate-y-1 hover:shadow-[0_10px_35px_rgba(16,185,129,0.1)]"
                        >
                          {/* Glow background on hover */}
                          <div
                            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none duration-500"
                            style={{ background: `radial-gradient(150px circle at top right, ${meta.color}15, transparent)` }}
                          />

                          {/* Status & PIN badge */}
                          <div className="flex justify-between items-center mb-3.5 relative z-10 gap-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                style={{
                                  color: meta.color,
                                  borderColor: `${meta.color}30`,
                                  background: `rgba(${meta.color === '#F59E0B' ? '245,158,11' : '16,185,129'},0.15)`,
                                }}
                                className="text-[11px] font-bold rounded-full px-2.5 py-0.5 border whitespace-nowrap"
                              >
                                {meta.label}
                              </span>

                              {req.delivery_otp && (
                                <span className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold bg-emerald-500/15 border border-emerald-500/35 text-emerald-300 px-2.5 py-0.5 rounded-full shadow-[0_0_12px_rgba(16,185,129,0.2)]" title="Share this PIN with your runner upon delivery">
                                  🔐 PIN: {req.delivery_otp}
                                </span>
                              )}
                            </div>
                            
                            <div className="bg-emerald-500/15 text-emerald-300 font-black font-mono text-sm sm:text-base rounded-xl px-2.5 py-1 border border-emerald-500/30">
                              ₹{req.delivery_fee}
                            </div>
                          </div>

                          {/* Route info */}
                          <div className="flex flex-col gap-2 mb-3.5 relative z-10">
                            <div className="flex items-center gap-2 text-xs sm:text-sm text-white/60 min-w-0">
                              <MapPin size={14} className="text-emerald-400 shrink-0" />
                              <span className="truncate"><b className="text-white/85">From:</b> {req.pickup_location}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs sm:text-sm text-white/60 min-w-0">
                              <MapPin size={14} className="text-teal-400 shrink-0" />
                              <span className="truncate"><b className="text-white/85">To:</b> {req.dropoff_location}</span>
                            </div>
                          </div>

                          {/* Runner info */}
                          <div className="flex items-center justify-between pt-3 border-t border-white/[0.07] relative z-10">
                            <div className="flex items-center gap-2 min-w-0">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${runner ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40" : "bg-white/10 text-white/50"}`}>
                                {runnerInitial || <User size={12} />}
                              </div>
                              <span className="text-xs text-white/60 truncate">
                                Runner: <b className="text-white">{runnerCleanName}</b>
                              </span>
                            </div>
                            {runner && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-black bg-emerald-400 hover:bg-emerald-300 px-2.5 py-1 rounded-lg shrink-0 shadow-sm transition-colors">
                                <MessageSquare size={11} /> Chat
                              </span>
                            )}
                          </div>
                        </div>
                      </Link>
                    );
                  })
                )}
              </div>
            </section>

            {/* Recent Completed Table */}
            <section className="mt-2">
              <div className="flex justify-between items-center mb-3 sm:mb-4">
                <h2 className="font-extrabold text-base sm:text-lg flex items-center gap-2 text-white">
                  Recent Completed
                </h2>
                {completedRequests.length > 0 && (
                  <Link href="/dashboard/requests" className="no-underline flex items-center gap-1 text-emerald-400 text-xs sm:text-sm font-semibold hover:underline">
                    View all <ArrowRight size={13} />
                  </Link>
                )}
              </div>
              <div className="bg-[#0b120e]/90 border border-white/10 hover:border-emerald-500/30 rounded-2xl sm:rounded-3xl p-3 sm:p-5 backdrop-blur-xl shadow-lg overflow-x-auto transition-all">
                <table className="w-full border-collapse text-left min-w-[640px]">
                  <thead>
                    <tr className="border-b border-white/5">
                      {["Item", "From", "To", "Runner", "Time", "Status", "Price"].map(h => (
                        <th key={h} className="p-3.5 sm:p-4 text-[#A7B8B0] font-bold text-xs uppercase tracking-wider font-mono">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {completedRequests.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-white/50 text-sm">
                          No completed requests yet.
                        </td>
                      </tr>
                    ) : (
                      completedRequests.slice(0, 5).map(req => {
                        const activeAssignment = req.assignments?.find(a => a.status === "completed" || a.status === "active");
                        const runner = activeAssignment?.runner;
                        const runnerName = runner?.full_name
                          ? formatStudentName(runner.full_name).fullName
                          : (req.assignments && req.assignments.length > 0 ? "Assigned" : "-");
                        const itemName = req.items[0]?.name || 'Items';
                        const category = getItemCategory(itemName);
                        const CategoryIcon = category.icon;

                        return (
                          <tr key={req.id} className="border-b border-white/[0.03] hover:bg-white/[0.03] transition-colors group/row">
                            <td className="p-3.5 sm:p-4 text-white text-xs sm:text-sm flex items-center gap-3 font-medium">
                              <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center border shrink-0 transition-transform group-hover/row:scale-105", category.bg)}>
                                <CategoryIcon size={14} />
                              </div>
                              <span className="truncate max-w-[140px] font-semibold text-white">
                                {itemName}
                                {req.items.length > 1 && ` +${req.items.length - 1}`}
                              </span>
                            </td>
                            <td className="p-3.5 sm:p-4 text-white/80 text-xs sm:text-sm max-w-[160px] truncate">{req.pickup_location}</td>
                            <td className="p-3.5 sm:p-4 text-white/80 text-xs sm:text-sm max-w-[160px] truncate">{req.dropoff_location}</td>
                            <td className="p-3.5 sm:p-4 text-white/90 text-xs sm:text-sm font-semibold">{runnerName}</td>
                            <td className="p-3.5 sm:p-4 text-white/50 text-xs sm:text-sm whitespace-nowrap font-mono">
                              {new Date(req.created_at).toLocaleDateString()}
                            </td>
                            <td className="p-3.5 sm:p-4">
                              <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 text-[11px] font-bold px-2.5 py-0.5 rounded-full whitespace-nowrap">
                                ● Delivered
                              </span>
                            </td>
                            <td className="p-3.5 sm:p-4 text-emerald-300 text-xs sm:text-sm font-black font-mono whitespace-nowrap">₹{req.delivery_fee}</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          {/* RIGHT: Sidebar */}
          <div className="flex flex-col gap-4 relative xl:sticky xl:top-8 w-full">
            <QuickActions />
            <ProfileSummary profile={profile as Profile} email={user.email || ""} />
            <ActivityFeed requests={requests} />
          </div>
        </div>
      </div>
    </div>
  );
}
