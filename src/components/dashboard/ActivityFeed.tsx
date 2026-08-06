import { formatDistanceToNow } from "date-fns";
import { Clock, CheckCircle2, Package, Truck, MapPin, AlertCircle } from "lucide-react";
import type { StudentRequestWithDetails } from "@/lib/database/requests";

interface ActivityFeedProps {
  requests: StudentRequestWithDetails[];
}

const statusConfig = {
  pending:    { icon: Clock,         color: "#6b7280", bg: "rgba(107,114,128,0.15)", label: "created a request" },
  accepted:   { icon: CheckCircle2,  color: "#10b981", bg: "rgba(16,185,129,0.15)",  label: "was accepted by a runner" },
  picked_up:  { icon: Package,       color: "#f59e0b", bg: "rgba(245,158,11,0.15)",  label: "was picked up" },
  in_transit: { icon: Truck,         color: "#6366f1", bg: "rgba(99,102,241,0.15)",  label: "is in transit" },
  delivered:  { icon: MapPin,        color: "#10b981", bg: "rgba(16,185,129,0.15)",  label: "was delivered successfully" },
  cancelled:  { icon: AlertCircle,   color: "#ef4444", bg: "rgba(239,68,68,0.15)",   label: "was cancelled" },
};

export function ActivityFeed({ requests }: ActivityFeedProps) {
  const activities = requests
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 6)
    .map((req) => {
      const cfg = statusConfig[req.status as keyof typeof statusConfig] ?? statusConfig.pending;
      return {
        id: `${req.id}-${req.status}`,
        label: cfg.label,
        item: req.items.map(i => i.name).join(", ") || "item",
        time: req.updated_at,
        icon: cfg.icon,
        color: cfg.color,
        bg: cfg.bg,
        status: req.status,
      };
    });

  return (
    <div style={{
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: "24px",
      padding: "1.5rem",
      backdropFilter: "blur(20px)",
    }}>
      <h3 style={{ color: "var(--color-foreground)", fontWeight: 700, fontSize: "1rem", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "inline-block" }} />
        Recent Activity
      </h3>

      {activities.length === 0 ? (
        <div style={{ textAlign: "center", padding: "2rem 0", color: "rgba(255,255,255,0.3)", fontSize: "0.875rem" }}>
          No recent activity yet.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
          {activities.map((act, idx) => {
            const Icon = act.icon;
            const isLast = idx === activities.length - 1;
            return (
              <div key={act.id} style={{ display: "flex", gap: "0.875rem", position: "relative" }}>
                {/* Timeline line */}
                {!isLast && (
                  <div style={{
                    position: "absolute", left: "15px", top: "32px", bottom: 0,
                    width: "2px",
                    background: "linear-gradient(to bottom, rgba(255,255,255,0.1), transparent)",
                  }} />
                )}

                {/* Icon dot */}
                <div style={{
                  width: "32px", height: "32px", borderRadius: "50%",
                  background: act.bg,
                  border: `2px solid ${act.color}40`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0, marginTop: "2px", zIndex: 1,
                }}>
                  <Icon size={14} color={act.color} />
                </div>

                {/* Content */}
                <div style={{ paddingBottom: isLast ? 0 : "1.25rem", flex: 1 }}>
                  <p style={{ fontSize: "0.83rem", color: "var(--color-foreground)", lineHeight: 1.4 }}>
                    Your request for{" "}
                    <span style={{ fontWeight: 700, color: act.color }}>{act.item}</span>{" "}
                    {act.label}.
                  </p>
                  <p style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.4)", marginTop: "0.25rem" }}>
                    {formatDistanceToNow(new Date(act.time))} ago
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
