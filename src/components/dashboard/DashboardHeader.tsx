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
    <div style={{ marginBottom: "1rem" }}>
      {/* Greeting pill */}
      <div style={{
        display: "inline-flex", alignItems: "center", gap: "0.4rem",
        background: "rgba(0,230,118,0.1)", borderRadius: "20px",
        padding: "0.3rem 0.85rem", marginBottom: "1rem",
        border: "1px solid rgba(0,230,118,0.2)"
      }}>
        <Sparkles size={13} color="#00E676" />
        <span style={{ color: "#00E676", fontSize: "0.75rem", fontWeight: 700 }}>
          {greeting} 🌙
        </span>
      </div>

      <h1 style={{
        color: "#fff", fontWeight: 800,
        fontSize: "2.2rem",
        letterSpacing: "-0.02em", lineHeight: 1.15, margin: 0,
      }}>
        Welcome back, <span style={{ color: "#00E676" }}>{displayName}</span>!
      </h1>
      <p style={{ color: "rgba(255,255,255,0.6)", marginTop: "0.5rem", fontSize: "0.95rem" }}>
        Here&apos;s what&apos;s happening with your deliveries today.
      </p>
    </div>
  );
}
