import { redirect } from "next/navigation";
import { Package, Bike, CheckCircle2, AlertCircle, ArrowRight, MapPin, Clock, User } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getStudentRequests, type Profile } from "@/lib/database/requests";
import { ROUTES } from "@/constants/routes";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { ProfileSummary } from "@/components/dashboard/ProfileSummary";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { StudentRequestCard } from "@/components/request/StudentRequestCard";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard · UniVerse",
  description: "Your UniVerse campus dashboard.",
};

const statusMeta: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  pending:    { label: "Pending",    color: "#f59e0b", bg: "rgba(245,158,11,0.15)",  dot: "#f59e0b" },
  accepted:   { label: "Accepted",  color: "#10b981", bg: "rgba(16,185,129,0.15)",  dot: "#10b981" },
  picked_up:  { label: "Picked Up", color: "#6366f1", bg: "rgba(99,102,241,0.15)",  dot: "#6366f1" },
  in_transit: { label: "In Transit",color: "#8b5cf6", bg: "rgba(139,92,246,0.15)",  dot: "#8b5cf6" },
  delivered:  { label: "Delivered", color: "#10b981", bg: "rgba(16,185,129,0.15)",  dot: "#10b981" },
  cancelled:  { label: "Cancelled", color: "#ef4444", bg: "rgba(239,68,68,0.15)",   dot: "#ef4444" },
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

  const activeRequests    = requests.filter(r => !["delivered", "cancelled"].includes(r.status));
  const completedRequests = requests.filter(r => r.status === "delivered");
  const cancelledRequests = requests.filter(r => r.status === "cancelled");

  const stats = [
    {
      label: "Total Requests", value: requests.length, icon: Package,
      gradient: "linear-gradient(135deg, #1e3a5f 0%, #1e40af 100%)",
      iconBg: "rgba(255,255,255,0.2)",
      trend: "All time",
    },
    {
      label: "Active", value: activeRequests.length, icon: Bike,
      gradient: "linear-gradient(135deg, #064e3b 0%, #059669 100%)",
      iconBg: "rgba(255,255,255,0.2)",
      trend: "In progress",
    },
    {
      label: "Completed", value: completedRequests.length, icon: CheckCircle2,
      gradient: "linear-gradient(135deg, #065f46 0%, #10b981 100%)",
      iconBg: "rgba(255,255,255,0.2)",
      trend: "Delivered ✓",
    },
    {
      label: "Cancelled", value: cancelledRequests.length, icon: AlertCircle,
      gradient: "linear-gradient(135deg, #7f1d1d 0%, #dc2626 100%)",
      iconBg: "rgba(255,255,255,0.2)",
      trend: "Not completed",
    },
  ];

  return (
    <div style={{
      minHeight: "100vh",
      paddingTop: "6rem",
      paddingBottom: "3rem",
      paddingLeft: "1rem",
      paddingRight: "1rem",
    }}>
      <div style={{ maxWidth: "1280px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "1.75rem" }}>

        {/* Hero Header */}
        <DashboardHeader displayName={displayName} />

        {/* Stats Row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem" }}>
          {stats.map(s => (
            <StatsCard key={s.label} {...s} />
          ))}
        </div>

        {/* Main 2-col layout */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "1.5rem", alignItems: "start" }}>

          {/* LEFT: Requests */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

            {/* Active Deliveries */}
            <section>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <h2 style={{ fontWeight: 800, fontSize: "1.1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#10b981", display: "inline-block", boxShadow: "0 0 8px #10b981" }} />
                  Active Deliveries
                  {activeRequests.length > 0 && (
                    <span style={{
                      background: "linear-gradient(135deg, #10b981, #059669)",
                      color: "#fff", fontSize: "0.72rem", fontWeight: 700,
                      borderRadius: "20px", padding: "0.15rem 0.55rem",
                    }}>{activeRequests.length}</span>
                  )}
                </h2>
                <Link href="/dashboard/requests" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "0.25rem", color: "#10b981", fontSize: "0.8rem", fontWeight: 600 }}>
                  View all <ArrowRight size={13} />
                </Link>
              </div>

              {activeRequests.length === 0 ? (
                <div style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "2px dashed rgba(255,255,255,0.1)",
                  borderRadius: "20px",
                  padding: "3rem",
                  textAlign: "center",
                }}>
                  <Package size={36} style={{ margin: "0 auto 0.75rem", opacity: 0.3 }} />
                  <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.9rem" }}>No active requests right now.</p>
                  <Link href="/request/new" style={{
                    display: "inline-flex", alignItems: "center", gap: "0.4rem",
                    marginTop: "1rem", background: "linear-gradient(135deg, #10b981, #059669)",
                    color: "#fff", borderRadius: "12px", padding: "0.55rem 1.1rem",
                    fontSize: "0.85rem", fontWeight: 700, textDecoration: "none",
                  }}>
                    Create your first request →
                  </Link>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1rem" }}>
                  {activeRequests.map(req => {
                    const meta = statusMeta[req.status] ?? statusMeta.pending;
                    return (
                      <Link key={req.id} href={`/dashboard/requests/${req.id}`} style={{ textDecoration: "none" }}>
                        <div style={{
                          background: "rgba(255,255,255,0.03)",
                          border: `1px solid ${meta.color}30`,
                          borderLeft: `4px solid ${meta.color}`,
                          borderRadius: "18px",
                          padding: "1.25rem",
                          cursor: "pointer",
                          transition: "all 0.2s",
                        }} className="hover:scale-[1.02] hover:shadow-lg">
                          {/* Status badge */}
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.875rem" }}>
                            <span style={{ fontWeight: 700, fontSize: "1rem", color: "var(--color-foreground)" }}>
                              {req.items.map(i => i.name).join(", ") || "Delivery"}
                            </span>
                            <span style={{
                              background: meta.bg, color: meta.color,
                              fontSize: "0.7rem", fontWeight: 700,
                              borderRadius: "20px", padding: "0.2rem 0.65rem",
                              border: `1px solid ${meta.color}30`,
                              whiteSpace: "nowrap",
                            }}>{meta.label}</span>
                          </div>

                          {/* Route info */}
                          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", marginBottom: "0.875rem" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8rem", color: "rgba(255,255,255,0.6)" }}>
                              <MapPin size={13} color="#10b981" />
                              <span><b style={{ color: "rgba(255,255,255,0.85)" }}>From:</b> {req.pickup_location}</span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8rem", color: "rgba(255,255,255,0.6)" }}>
                              <MapPin size={13} color="#6366f1" />
                              <span><b style={{ color: "rgba(255,255,255,0.85)" }}>To:</b> {req.dropoff_location}</span>
                            </div>
                          </div>

                          {/* Footer row */}
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "0.75rem", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.75rem", color: "rgba(255,255,255,0.4)" }}>
                              <Clock size={12} />
                              {new Date(req.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                            </div>
                            <div style={{
                              background: "linear-gradient(135deg, #10b981, #059669)",
                              color: "#fff", fontWeight: 800, fontSize: "0.95rem",
                              borderRadius: "10px", padding: "0.25rem 0.65rem",
                            }}>₹{req.delivery_fee}</div>
                          </div>

                          {/* Runner info */}
                          {req.assignments?.length > 0 && req.assignments[0].runner && (
                            <div style={{
                              marginTop: "0.75rem",
                              display: "flex", alignItems: "center", gap: "0.5rem",
                              background: "rgba(16,185,129,0.08)", borderRadius: "10px",
                              padding: "0.4rem 0.65rem",
                            }}>
                              <User size={12} color="#10b981" />
                              <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.6)" }}>
                                Runner: <b style={{ color: "#10b981" }}>{req.assignments[0].runner.full_name ?? "Assigned"}</b>
                              </span>
                            </div>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Completed Deliveries */}
            {completedRequests.length > 0 && (
              <section>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                  <h2 style={{ fontWeight: 800, fontSize: "1.1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#6366f1", display: "inline-block" }} />
                    Recent Completed
                  </h2>
                  <Link href="/dashboard/requests" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "0.25rem", color: "#6366f1", fontSize: "0.8rem", fontWeight: 600 }}>
                    View all <ArrowRight size={13} />
                  </Link>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1rem" }}>
                  {completedRequests.slice(0, 4).map(req => (
                    <StudentRequestCard key={req.id} request={req} />
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* RIGHT: Sidebar */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", position: "sticky", top: "7rem" }}>
            <QuickActions />
            <ProfileSummary profile={profile as Profile} email={user.email || ""} />
            <ActivityFeed requests={requests} />
          </div>
        </div>
      </div>
    </div>
  );
}
