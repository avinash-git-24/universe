"use client";

import { CheckCircle2, MessageSquare, Package, AlertCircle, Bike } from "lucide-react";
import type { StudentRequestWithDetails } from "@/lib/database/requests";
import { formatDistanceToNow } from "date-fns";

interface ActivityFeedProps {
  requests: StudentRequestWithDetails[];
}

export function ActivityFeed({ requests }: ActivityFeedProps) {
  // Generate activities from requests
  let activities: {
    id: string;
    text: React.ReactNode;
    time: string;
    date: Date;
    icon: React.ComponentType<{ size?: number }>;
    color: string;
    bg: string;
  }[] = [];

  requests.forEach(req => {
    const itemName = req.items[0]?.name || "items";
    
    // Created
    activities.push({
      id: `${req.id}-created`,
      text: (<span>Your request for <b style={{ color: "#6366f1", fontWeight: 700 }}>{itemName}</b> was created.</span>),
      time: formatDistanceToNow(new Date(req.created_at), { addSuffix: true }),
      date: new Date(req.created_at),
      icon: MessageSquare,
      color: "#6366f1",
      bg: "rgba(99,102,241,0.15)"
    });

    // Accepted
    if (req.status === "accepted" || req.status === "picked_up" || req.status === "in_transit" || req.status === "delivered") {
      activities.push({
        id: `${req.id}-accepted`,
        text: (<span>Your request for <b style={{ color: "#00E676", fontWeight: 700 }}>{itemName}</b> was accepted by a runner.</span>),
        time: formatDistanceToNow(new Date(req.updated_at), { addSuffix: true }),
        date: new Date(req.updated_at),
        icon: Bike,
        color: "#00E676",
        bg: "rgba(0,230,118,0.15)"
      });
    }

    // Picked up
    if (req.status === "picked_up" || req.status === "in_transit" || req.status === "delivered") {
      activities.push({
        id: `${req.id}-picked`,
        text: (<span>Your request for <b style={{ color: "#F59E0B", fontWeight: 700 }}>{itemName}</b> was picked up.</span>),
        time: formatDistanceToNow(new Date(req.updated_at), { addSuffix: true }), // Using updated_at as proxy for state change time
        date: new Date(req.updated_at),
        icon: Package,
        color: "#F59E0B",
        bg: "rgba(245,158,11,0.15)"
      });
    }

    // Delivered
    if (req.status === "delivered") {
      activities.push({
        id: `${req.id}-delivered`,
        text: (<span>Your request for <b style={{ color: "#00E676", fontWeight: 700 }}>{itemName}</b> was delivered successfully.</span>),
        time: formatDistanceToNow(new Date(req.updated_at), { addSuffix: true }),
        date: new Date(req.updated_at),
        icon: CheckCircle2,
        color: "#00E676",
        bg: "rgba(0,230,118,0.15)"
      });
    }

    // Cancelled
    if (req.status === "cancelled") {
      activities.push({
        id: `${req.id}-cancelled`,
        text: (<span>Your request for <b style={{ color: "#ef4444", fontWeight: 700 }}>{itemName}</b> was cancelled.</span>),
        time: formatDistanceToNow(new Date(req.updated_at), { addSuffix: true }),
        date: new Date(req.updated_at),
        icon: AlertCircle,
        color: "#ef4444",
        bg: "rgba(239,68,68,0.15)"
      });
    }
  });

  // Sort newest first, take top 5
  activities.sort((a, b) => b.date.getTime() - a.date.getTime());
  activities = activities.slice(0, 5);

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

        {activities.length === 0 ? (
          <div style={{ textAlign: "center", color: "rgba(255,255,255,0.5)", fontSize: "0.9rem", padding: "1rem 0" }}>
            No recent activity.
          </div>
        ) : (
          activities.map((activity) => (
            <div key={activity.id} style={{ display: "flex", gap: "1rem", position: "relative", zIndex: 1 }}>
              {/* Timeline icon */}
              <div style={{
                width: "28px", height: "28px", borderRadius: "50%",
                background: activity.bg, color: activity.color,
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0, border: `1px solid ${activity.color}40`,
                boxShadow: `0 0 10px ${activity.color}30`
              }}>
                {(() => { const ActivityIcon = activity.icon; return <ActivityIcon size={14} />; })()}
              </div>

              {/* Content */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem", paddingTop: "0.2rem" }}>
                <p style={{ color: "rgba(255,255,255,0.9)", fontSize: "0.8rem", lineHeight: 1.4, margin: 0 }}>
                  {activity.text}
                </p>
                <span suppressHydrationWarning style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.7rem" }}>{activity.time}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
