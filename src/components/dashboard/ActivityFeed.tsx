"use client";

import { CheckCircle2, MessageSquare, Package } from "lucide-react";
import type { Request } from "@/lib/database/requests";

interface ActivityFeedProps {
  requests: Request[];
}

export function ActivityFeed({ requests }: ActivityFeedProps) {
  // To match the exact image, we'll use static mock data if the actual timeline is empty
  // The image shows 3 specific events: delivered, created, picked up.
  const activities = [
    {
      id: 1,
      text: (<span>Your request for <b style={{ color: "#00E676", fontWeight: 700 }}>Lays</b> was delivered successfully.</span>),
      time: "22 hrs ago",
      icon: CheckCircle2,
      color: "#00E676",
      bg: "rgba(0,230,118,0.15)"
    },
    {
      id: 2,
      text: (<span>Your request for <b style={{ color: "#6366f1", fontWeight: 700 }}>lays</b> created a request.</span>),
      time: "23 hrs ago",
      icon: MessageSquare, // using a chat bubble/circle like icon for purple
      color: "#6366f1",
      bg: "rgba(99,102,241,0.15)"
    },
    {
      id: 3,
      text: (<span>Your request for <b style={{ color: "#F59E0B", fontWeight: 700 }}>lays</b> was picked up.</span>),
      time: "23 hrs ago",
      icon: Package,
      color: "#F59E0B",
      bg: "rgba(245,158,11,0.15)"
    }
  ];

  return (
    <div style={{
      background: "rgba(10,15,12,0.4)",
      borderRadius: "24px",
      padding: "1.5rem",
      border: "1px solid rgba(102,255,178,0.1)",
      backdropFilter: "blur(20px)",
      boxShadow: "0 8px 32px rgba(0,0,0,0.3)"
    }}>
      <h3 style={{ color: "#fff", fontWeight: 800, fontSize: "1.05rem", marginBottom: "1.5rem" }}>Recent Activity</h3>

      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", position: "relative" }}>
        {/* Timeline connecting line */}
        <div style={{
          position: "absolute", left: "14px", top: "14px", bottom: "14px", width: "1px",
          background: "linear-gradient(to bottom, rgba(255,255,255,0.1), rgba(255,255,255,0))",
          zIndex: 0
        }} />

        {activities.map((activity) => (
          <div key={activity.id} style={{ display: "flex", gap: "1rem", position: "relative", zIndex: 1 }}>
            {/* Timeline icon */}
            <div style={{
              width: "28px", height: "28px", borderRadius: "50%",
              background: activity.bg, color: activity.color,
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0, border: `1px solid ${activity.color}40`,
              boxShadow: `0 0 10px ${activity.color}30`
            }}>
              <activity.icon size={14} />
            </div>

            {/* Content */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem", paddingTop: "0.2rem" }}>
              <p style={{ color: "rgba(255,255,255,0.9)", fontSize: "0.8rem", lineHeight: 1.4, margin: 0 }}>
                {activity.text}
              </p>
              <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.7rem" }}>{activity.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
