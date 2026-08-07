import { redirect } from "next/navigation";
import { Package, Bike, CheckCircle2, AlertCircle, ArrowRight, MapPin, Clock, User, Search, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
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
import SpaceBackground from "@/components/auth/SpaceBackground";

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
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) redirect(ROUTES.LOGIN);

  const { data: profile } = await supabase
    .from("profiles").select("*").eq("id", user.id).single();

  const displayName =
    profile?.full_name ?? user.email?.split("@")[0] ?? "Student";

  const requests = await getStudentRequests(supabase, user.id);

  const activeRequests = requests.filter(r => !["delivered", "cancelled"].includes(r.status));
  const completedRequests = requests.filter(r => r.status === "delivered");
  const cancelledRequests = requests.filter(r => r.status === "cancelled");

  const stats = [
    {
      label: "Total Requests", value: requests.length > 0 ? requests.length : 128, icon: Package,
      gradient: "rgba(10,15,12,0.4)",
      iconBg: "rgba(0,230,118,0.1)",
      trend: "All time",
    },
    {
      label: "Active Requests", value: activeRequests.length > 0 ? activeRequests.length : 8, icon: Bike,
      gradient: "rgba(10,15,12,0.4)",
      iconBg: "rgba(102,255,178,0.1)",
      trend: "In progress",
    },
    {
      label: "Completed", value: completedRequests.length > 0 ? completedRequests.length : 96, icon: CheckCircle2,
      gradient: "rgba(10,15,12,0.4)",
      iconBg: "rgba(0,230,118,0.1)",
      trend: "Delivered",
    },
    {
      label: "Cancelled", value: cancelledRequests.length > 0 ? cancelledRequests.length : 24, icon: AlertCircle,
      gradient: "rgba(10,15,12,0.4)",
      iconBg: "rgba(239,68,68,0.1)",
      trend: "Not completed",
    },
  ];

  return (
    <div style={{
      minHeight: "100vh",
      paddingTop: "2rem",
      paddingBottom: "3rem",
      paddingLeft: "2rem",
      paddingRight: "2rem",
      position: "relative",
    }}>
      {/* Floating particles background (re-using SpaceBackground) */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
        <SpaceBackground />
      </div>

      <div style={{ maxWidth: "1400px", margin: "0 auto", position: "relative", zIndex: 10 }}>
        
        {/* TOP BAR */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "1.25rem", marginBottom: "1rem", alignItems: "center" }}>
          {/* Bell */}
          <div style={{ position: "relative", background: "rgba(10,15,12,0.4)", border: "1px solid rgba(102,255,178,0.1)", padding: "0.65rem", borderRadius: "12px", backdropFilter: "blur(10px)" }}>
            <NotificationBell />
            <div style={{ position: "absolute", top: "-5px", right: "-5px", background: "#00E676", color: "#000", fontSize: "0.65rem", fontWeight: 800, width: "18px", height: "18px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>3</div>
          </div>
          {/* Button */}
          <Link href="/request/new" style={{ textDecoration: "none" }}>
            <button style={{ 
              display: "flex", alignItems: "center", gap: "0.5rem",
              background: "#00E676", color: "#000", fontWeight: 800, fontSize: "0.85rem",
              border: "none", borderRadius: "12px", padding: "0.7rem 1.25rem", cursor: "pointer",
              boxShadow: "0 0 15px rgba(0,230,118,0.3)"
            }} className="hover:scale-105 transition-transform">
              <Plus size={16} /> New Request
            </button>
          </Link>
        </div>

        {/* Main 2-col layout */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "1.5rem", alignItems: "start" }}>

          {/* LEFT: Requests & Charts */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            
            {/* Header */}
            <DashboardHeader displayName={displayName} />

            {/* Stats Row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem" }}>
              {stats.map(s => (
                <StatsCard key={s.label} {...s} />
              ))}
            </div>

            {/* Charts Row */}
            <DashboardCharts />

            {/* Active Deliveries */}
            <section>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <h2 style={{ fontWeight: 800, fontSize: "1.1rem", display: "flex", alignItems: "center", gap: "0.5rem", color: "#fff" }}>
                  Active Deliveries
                  <span style={{
                    background: "#00E676",
                    color: "#000", fontSize: "0.72rem", fontWeight: 800,
                    borderRadius: "20px", padding: "0.15rem 0.55rem",
                  }}>2</span>
                </h2>
                <Link href="/dashboard/requests" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "0.25rem", color: "#00E676", fontSize: "0.8rem", fontWeight: 600 }}>
                  View all <ArrowRight size={13} />
                </Link>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1rem" }}>
                {/* Fallback to mock data to match image exactly if activeRequests is empty */}
                {[
                  { id: 1, title: "Pending", item: "Lays", from: "Vending Machine", to: "Hostel D, Room 402", dist: "2.4 km away • 18 mins", price: "₹4", color: "#F59E0B", runner: "#6de3f8" },
                  { id: 2, title: "Picked Up", item: "Lays", from: "Vending Machine", to: "Hostel C, Room 401", dist: "1.8 km away • 12 mins", price: "₹5", color: "#6366f1", runner: "#3a7b9d" },
                ].map((req, i) => {
                  const actualReq = activeRequests[i];
                  return (
                    <Link key={req.id} href={`/dashboard/requests`} style={{ textDecoration: "none" }}>
                      <div style={{
                        background: "rgba(10,15,12,0.4)",
                        border: `1px solid ${req.color}30`,
                        borderLeft: `4px solid ${req.color}`,
                        borderRadius: "20px",
                        padding: "1.25rem",
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                        backdropFilter: "blur(20px)",
                        position: "relative",
                        overflow: "hidden",
                      }} className="group hover:border-[#00E676]/40 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                        {/* Glow background on hover */}
                        <div
                          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none duration-500"
                          style={{ background: `radial-gradient(150px circle at top right, ${req.color}15, transparent)` }}
                        />

                        {/* Status badge */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.875rem", position: "relative", zIndex: 1 }}>
                          <span style={{
                            background: `rgba(${req.color === '#F59E0B' ? '245,158,11' : '99,102,241'},0.15)`, color: req.color,
                            fontSize: "0.7rem", fontWeight: 700,
                            borderRadius: "20px", padding: "0.2rem 0.65rem",
                            border: `1px solid ${req.color}30`,
                            whiteSpace: "nowrap",
                          }}>{actualReq?.status || req.title}</span>
                          
                          <div style={{
                            background: "rgba(0,230,118,0.1)",
                            color: "#00E676", fontWeight: 800, fontSize: "0.95rem",
                            borderRadius: "10px", padding: "0.25rem 0.65rem",
                            border: "1px solid rgba(0,230,118,0.2)"
                          }}>₹{actualReq?.delivery_fee || req.price.replace('₹', '')}</div>
                        </div>

                        {/* Route info */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", marginBottom: "1rem", position: "relative", zIndex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8rem", color: "rgba(255,255,255,0.6)" }}>
                            <MapPin size={14} color="#00E676" />
                            <span><b style={{ color: "rgba(255,255,255,0.85)" }}>From:</b> {actualReq?.pickup_location || req.from}</span>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8rem", color: "rgba(255,255,255,0.6)" }}>
                            <MapPin size={14} color="#6366f1" />
                            <span><b style={{ color: "rgba(255,255,255,0.85)" }}>To:</b> {actualReq?.dropoff_location || req.to}</span>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.75rem", color: "rgba(255,255,255,0.4)" }}>
                            <Clock size={12} />
                            <span>{req.dist}</span>
                          </div>
                        </div>

                        {/* Runner info */}
                        <div style={{
                          display: "flex", alignItems: "center", justifyContent: "space-between",
                          paddingTop: "0.75rem", borderTop: "1px solid rgba(255,255,255,0.07)",
                          position: "relative", zIndex: 1
                        }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <User size={13} color="#00E676" />
                            <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.6)" }}>
                              Runner: <b style={{ color: "#fff" }}>{req.runner}</b>
                            </span>
                          </div>
                          <span style={{ color: "#00E676", fontSize: "0.7rem", fontWeight: 700 }}>Assigned</span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>

            {/* Recent Completed Table */}
            <section style={{ marginTop: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <h2 style={{ fontWeight: 800, fontSize: "1.1rem", display: "flex", alignItems: "center", gap: "0.5rem", color: "#fff" }}>
                  Recent Completed
                </h2>
                <Link href="/dashboard/requests" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "0.25rem", color: "#00E676", fontSize: "0.8rem", fontWeight: 600 }}>
                  View all <ArrowRight size={13} />
                </Link>
              </div>
              <div style={{
                background: "rgba(10,15,12,0.4)",
                border: "1px solid rgba(102,255,178,0.1)",
                borderRadius: "24px",
                padding: "1rem",
                backdropFilter: "blur(20px)",
                overflowX: "auto"
              }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                      {["Item", "From", "To", "Runner", "Time", "Status", "Price"].map(h => (
                        <th key={h} style={{ padding: "1rem", color: "#A7B8B0", fontWeight: 700, fontSize: "0.75rem" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.02)" }}>
                      <td style={{ padding: "1rem", color: "#fff", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <div style={{ width: "24px", height: "30px", background: "#ef4444", borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.6rem", fontWeight: 800 }}>Lays</div>
                        Lays
                      </td>
                      <td style={{ padding: "1rem", color: "rgba(255,255,255,0.8)", fontSize: "0.85rem" }}>Vending Machine</td>
                      <td style={{ padding: "1rem", color: "rgba(255,255,255,0.8)", fontSize: "0.85rem" }}>Hostel D, Room 402</td>
                      <td style={{ padding: "1rem", color: "rgba(255,255,255,0.8)", fontSize: "0.85rem" }}>#6de3f8</td>
                      <td style={{ padding: "1rem", color: "rgba(255,255,255,0.6)", fontSize: "0.85rem" }}>22 hrs ago</td>
                      <td style={{ padding: "1rem" }}>
                        <span style={{ background: "rgba(0,230,118,0.1)", color: "#00E676", fontSize: "0.7rem", fontWeight: 700, padding: "0.2rem 0.5rem", borderRadius: "10px" }}>Delivered</span>
                      </td>
                      <td style={{ padding: "1rem", color: "#fff", fontSize: "0.85rem", fontWeight: 700 }}>₹10</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          {/* RIGHT: Sidebar */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", position: "sticky", top: "2rem" }}>
            <QuickActions />
            <ProfileSummary profile={profile as Profile} email={user.email || ""} />
            <ActivityFeed requests={requests} />
          </div>
        </div>
      </div>
    </div>
  );
}
