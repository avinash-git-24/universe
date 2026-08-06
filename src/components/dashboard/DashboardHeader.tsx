import { NotificationBell } from "@/components/notifications/NotificationBell";
import Link from "next/link";
import { Plus, Sparkles } from "lucide-react";

interface DashboardHeaderProps {
  displayName: string;
}

const hours = new Date().getHours();
const greeting = hours < 12 ? "Good morning" : hours < 17 ? "Good afternoon" : "Good evening";

export function DashboardHeader({ displayName }: DashboardHeaderProps) {
  return (
    <div style={{
      background: "linear-gradient(135deg, #064e3b 0%, #065f46 40%, #047857 70%, #059669 100%)",
      borderRadius: "28px",
      padding: "2rem 2.5rem",
      position: "relative",
      overflow: "hidden",
      boxShadow: "0 20px 60px rgba(5,150,105,0.25), 0 4px 16px rgba(0,0,0,0.2)",
    }}>
      {/* Floating blobs */}
      <div style={{ position: "absolute", top: "-40px", right: "-40px", width: "200px", height: "200px", borderRadius: "50%", background: "rgba(255,255,255,0.06)", filter: "blur(30px)" }} />
      <div style={{ position: "absolute", bottom: "-60px", left: "20%", width: "180px", height: "180px", borderRadius: "50%", background: "rgba(255,255,255,0.04)", filter: "blur(25px)" }} />
      <div style={{ position: "absolute", top: "50%", right: "15%", width: "100px", height: "100px", borderRadius: "50%", background: "rgba(255,255,255,0.05)", filter: "blur(20px)", transform: "translateY(-50%)" }} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative", zIndex: 1, flexWrap: "wrap", gap: "1rem" }}>
        <div>
          {/* Greeting pill */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "0.4rem",
            background: "rgba(255,255,255,0.15)", borderRadius: "20px",
            padding: "0.3rem 0.85rem", marginBottom: "0.75rem",
          }}>
            <Sparkles size={13} color="#6ee7b7" />
            <span style={{ color: "rgba(255,255,255,0.85)", fontSize: "0.75rem", fontWeight: 600 }}>
              {greeting} 👋
            </span>
          </div>

          <h1 style={{
            color: "#fff", fontWeight: 800,
            fontSize: "clamp(1.5rem, 3vw, 2.2rem)",
            letterSpacing: "-0.02em", lineHeight: 1.15, margin: 0,
          }}>
            Welcome back, <span style={{ color: "#6ee7b7" }}>{displayName}</span>!
          </h1>
          <p style={{ color: "rgba(255,255,255,0.65)", marginTop: "0.4rem", fontSize: "0.9rem" }}>
            Here&apos;s what&apos;s happening with your deliveries today.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          {/* CTA Button */}
          <Link href="/request/new" style={{ textDecoration: "none" }}>
            <div style={{
              display: "flex", alignItems: "center", gap: "0.5rem",
              background: "rgba(255,255,255,0.2)",
              border: "1px solid rgba(255,255,255,0.3)",
              borderRadius: "14px", padding: "0.65rem 1.2rem",
              color: "#fff", fontWeight: 700, fontSize: "0.875rem",
              cursor: "pointer", backdropFilter: "blur(10px)",
              transition: "all 0.2s",
            }} className="hover:bg-white/30">
              <Plus size={16} />
              New Request
            </div>
          </Link>
          <div style={{
            background: "rgba(255,255,255,0.15)",
            border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: "14px", padding: "0.5rem",
          }}>
            <NotificationBell />
          </div>
        </div>
      </div>
    </div>
  );
}
