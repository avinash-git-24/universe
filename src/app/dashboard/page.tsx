import { redirect } from "next/navigation";
import { Package, Bike, CheckCircle2, AlertCircle, ArrowRight, MapPin, Clock, User, Search, Plus } from "lucide-react";
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

export default async function DashboardPage() {
  const { data: { user }, error: authError } = await getUser();
  if (authError || !user) redirect(ROUTES.LOGIN);

  const { data: profile } = await getProfile(user.id);

  const displayName =
    profile?.full_name ?? user.email?.split("@")[0] ?? "Student";

  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const requests = await getStudentRequests(supabase, user.id);

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
    <div className="min-h-screen pt-4 pb-12 px-3 sm:px-6 sm:py-8 lg:p-8 relative">
      {/* Floating particles background (re-using SpaceBackground) */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
        <LazySpaceBackground />
      </div>

      <div className="max-w-[1400px] mx-auto relative z-10">
        
        {/* TOP BAR */}
        <div className="flex justify-between sm:justify-end gap-3 sm:gap-5 mb-4 sm:mb-6 items-center">
          {/* Bell */}
          <div className="relative bg-[#0a0f0c]/40 border border-[#66ffb2]/10 p-2.5 rounded-xl backdrop-blur-md">
            <NotificationBell />
          </div>
          {/* Button */}
          <Link href="/request/new" className="no-underline">
            <button className="flex items-center gap-2 bg-[#00E676] text-black font-extrabold text-xs sm:text-sm rounded-xl px-3.5 sm:px-5 py-2.5 sm:py-3 cursor-pointer shadow-[0_0_15px_rgba(0,230,118,0.3)] hover:scale-105 transition-transform">
              <Plus size={16} /> New Request
            </button>
          </Link>
        </div>

        {/* Main layout (stacks on <xl, 2-col on xl+) */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-6 items-start">

          {/* LEFT: Requests & Charts */}
          <div className="flex flex-col gap-6">
            
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
                  <span className="bg-[#00E676] text-black text-[11px] sm:text-xs font-extrabold rounded-full px-2 py-0.5">
                    {activeRequests.length}
                  </span>
                </h2>
                {activeRequests.length > 0 && (
                  <Link href="/dashboard/requests" className="no-underline flex items-center gap-1 text-[#00E676] text-xs sm:text-sm font-semibold hover:underline">
                    View all <ArrowRight size={13} />
                  </Link>
                )}
              </div>

              <div className={`grid ${activeRequests.length > 0 ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"} gap-3 sm:gap-4`}>
                {activeRequests.length === 0 ? (
                  <div className="bg-[#0a0f0c]/40 border border-dashed border-white/10 rounded-[20px] p-8 sm:p-12 text-center text-white/50 text-sm">
                    No active deliveries right now.
                  </div>
                ) : (
                  activeRequests.slice(0, 2).map((req) => {
                    // map backend status to UI color/text
                    const meta = statusMeta[req.status] || { color: "#F59E0B", label: req.status };
                    
                    return (
                      <Link key={req.id} href={`/dashboard/requests/${req.id}`} className="no-underline">
                        <div
                          style={{
                            borderLeftColor: meta.color,
                          }}
                          className="bg-[#0a0f0c]/40 border border-white/10 border-l-4 rounded-[20px] p-4 sm:p-5 cursor-pointer transition-all duration-300 backdrop-blur-xl relative overflow-hidden group hover:border-[#00E676]/40 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
                        >
                          {/* Glow background on hover */}
                          <div
                            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none duration-500"
                            style={{ background: `radial-gradient(150px circle at top right, ${meta.color}15, transparent)` }}
                          />

                          {/* Status badge */}
                          <div className="flex justify-between items-start mb-3.5 relative z-10">
                            <span
                              style={{
                                color: meta.color,
                                borderColor: `${meta.color}30`,
                                background: `rgba(${meta.color === '#F59E0B' ? '245,158,11' : '99,102,241'},0.15)`,
                              }}
                              className="text-[11px] font-bold rounded-full px-2.5 py-0.5 border whitespace-nowrap"
                            >
                              {meta.label}
                            </span>
                            
                            <div className="bg-[#00E676]/10 text-[#00E676] font-extrabold text-sm sm:text-[15px] rounded-[10px] px-2.5 py-1 border border-[#00E676]/20">
                              ₹{req.delivery_fee}
                            </div>
                          </div>

                          {/* Route info */}
                          <div className="flex flex-col gap-2 mb-3.5 relative z-10">
                            <div className="flex items-center gap-2 text-xs sm:text-sm text-white/60 min-w-0">
                              <MapPin size={14} className="text-[#00E676] shrink-0" />
                              <span className="truncate"><b className="text-white/85">From:</b> {req.pickup_location}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs sm:text-sm text-white/60 min-w-0">
                              <MapPin size={14} className="text-[#6366f1] shrink-0" />
                              <span className="truncate"><b className="text-white/85">To:</b> {req.dropoff_location}</span>
                            </div>
                          </div>

                          {/* Runner info */}
                          <div className="flex items-center justify-between pt-3 border-t border-white/[0.07] relative z-10">
                            <div className="flex items-center gap-2">
                              <User size={13} className="text-[#00E676]" />
                              <span className="text-xs text-white/60">
                                Runner: <b className="text-white">{req.assignments && req.assignments.length > 0 ? "Assigned" : "Pending"}</b>
                              </span>
                            </div>
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
                  <Link href="/dashboard/requests" className="no-underline flex items-center gap-1 text-[#00E676] text-xs sm:text-sm font-semibold hover:underline">
                    View all <ArrowRight size={13} />
                  </Link>
                )}
              </div>
              <div className="bg-[#0a0f0c]/40 border border-[#66ffb2]/10 rounded-[20px] sm:rounded-[24px] p-3 sm:p-4 backdrop-blur-xl overflow-x-auto">
                <table className="w-full border-collapse text-left min-w-[580px]">
                  <thead>
                    <tr className="border-b border-white/5">
                      {["Item", "From", "To", "Runner", "Time", "Status", "Price"].map(h => (
                        <th key={h} className="p-3 sm:p-4 text-[#A7B8B0] font-bold text-xs">{h}</th>
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
                      completedRequests.slice(0, 5).map(req => (
                        <tr key={req.id} className="border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors">
                          <td className="p-3 sm:p-4 text-white text-xs sm:text-sm flex items-center gap-2 font-medium">
                            <div className="w-6 h-7 bg-red-500 rounded flex items-center justify-center text-[10px] font-extrabold shrink-0">
                              {req.items[0]?.name?.substring(0, 2).toUpperCase() || 'IT'}
                            </div>
                            <span className="truncate max-w-[120px]">
                              {req.items.length > 0 ? req.items[0].name : 'Items'}
                              {req.items.length > 1 && ` +${req.items.length - 1}`}
                            </span>
                          </td>
                          <td className="p-3 sm:p-4 text-white/80 text-xs sm:text-sm truncate max-w-[120px]">{req.pickup_location}</td>
                          <td className="p-3 sm:p-4 text-white/80 text-xs sm:text-sm truncate max-w-[120px]">{req.dropoff_location}</td>
                          <td className="p-3 sm:p-4 text-white/80 text-xs sm:text-sm">{req.assignments && req.assignments.length > 0 ? "Assigned" : "-"}</td>
                          <td className="p-3 sm:p-4 text-white/60 text-xs sm:text-sm whitespace-nowrap">
                            {new Date(req.created_at).toLocaleDateString()}
                          </td>
                          <td className="p-3 sm:p-4">
                            <span className="bg-[#00E676]/10 text-[#00E676] text-[11px] font-bold px-2 py-0.5 rounded-[10px] whitespace-nowrap">
                              Delivered
                            </span>
                          </td>
                          <td className="p-3 sm:p-4 text-white text-xs sm:text-sm font-bold whitespace-nowrap">₹{req.delivery_fee}</td>
                        </tr>
                      ))
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
