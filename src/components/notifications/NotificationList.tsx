"use client";

import { useState, useMemo } from "react";
import { formatDistanceToNow } from "date-fns";
import { 
  Check, 
  CheckCircle2, 
  MapPin, 
  AlertCircle, 
  Info, 
  Truck, 
  Bike, 
  BellRing, 
  FileText, 
  Trash2, 
  BellOff 
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useRealtime } from "@/providers/RealtimeProvider";
import { Notification } from "@/lib/database/notifications";

interface NotificationListProps {
  onClose: () => void;
}

type NotificationCategory = "all" | "delivery" | "request" | "runner";

export function NotificationList({ onClose }: NotificationListProps) {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useRealtime();
  const [selectedCategory, setSelectedCategory] = useState<NotificationCategory>("all");
  const router = useRouter();

  // Helper to categorize notifications
  const getCategory = (notif: Notification): NotificationCategory => {
    const t = notif.type.toLowerCase();
    const title = notif.title.toLowerCase();

    if (t.includes("delivery") || t.includes("picked_up") || t.includes("in_transit") || t.includes("delivered")) {
      return "delivery";
    }
    if (t.includes("runner") || title.includes("runner")) {
      return "runner";
    }
    return "request";
  };

  const getIcon = (notif: Notification) => {
    const category = getCategory(notif);
    const t = notif.type.toLowerCase();

    if (t === "status_delivered" || t.includes("delivered")) {
      return <MapPin size={16} color="#10B981" />;
    }
    if (t === "status_cancelled" || t.includes("cancelled")) {
      return <AlertCircle size={16} color="#EF4444" />;
    }
    if (t === "status_in_transit" || t.includes("transit")) {
      return <Truck size={16} color="#06B6D4" />;
    }
    if (t === "status_picked_up" || t.includes("picked")) {
      return <Truck size={16} color="#A855F7" />;
    }
    if (t === "status_accepted" || t.includes("accepted")) {
      return <CheckCircle2 size={16} color="#F59E0B" />;
    }

    switch (category) {
      case "delivery":
        return <Truck size={16} color="#00E676" />;
      case "runner":
        return <Bike size={16} color="#00E676" />;
      default:
        return <FileText size={16} color="#00E676" />;
    }
  };

  const filteredNotifications = useMemo(() => {
    return notifications
      .filter((notif) => {
        if (selectedCategory === "all") return true;
        return getCategory(notif) === selectedCategory;
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [notifications, selectedCategory]);

  const handleNotificationClick = (notif: Notification) => {
    if (!notif.is_read) {
      markAsRead(notif.id);
    }
    onClose();
    if (notif.reference_id) {
      router.push(`/dashboard/requests/${notif.reference_id}`);
    }
  };

  return (
    <div style={{
      background: "#0B120D",
      border: "1px solid rgba(0, 230, 118, 0.1)",
      borderRadius: "20px",
      boxShadow: "0 20px 40px rgba(0,0,0,0.5), inset 0 0 20px rgba(0,230,118,0.02)",
      overflow: "visible",
      display: "flex",
      flexDirection: "column",
      maxHeight: "450px"
    }}>
      {/* Header, styled to ensure top border radius looks good */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.25rem 1.5rem", borderBottom: "1px solid rgba(255,255,255,0.05)", borderTopLeftRadius: "20px", borderTopRightRadius: "20px", backgroundColor: "#0B120D" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <h3 style={{ margin: 0, color: "#fff", fontSize: "1.1rem", fontWeight: 800 }}>Notifications</h3>
          {unreadCount > 0 && (
            <span style={{ background: "rgba(0,230,118,0.15)", color: "#00E676", fontSize: "0.7rem", fontWeight: 700, padding: "2px 8px", borderRadius: "12px", border: "1px solid rgba(0,230,118,0.3)" }}>
              {unreadCount} new
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllAsRead} style={{ background: "transparent", border: "none", color: "#00E676", fontSize: "0.75rem", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px", cursor: "pointer" }}>
            <Check size={14} /> Mark all read
          </button>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "1rem 1.5rem", borderBottom: "1px solid rgba(255,255,255,0.05)", overflowX: "auto" }}>
        {(["all", "delivery", "request", "runner"] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            style={{
              background: selectedCategory === cat ? "rgba(0,230,118,0.15)" : "transparent",
              color: selectedCategory === cat ? "#00E676" : "#A7B8B0",
              border: selectedCategory === cat ? "1px solid rgba(0,230,118,0.3)" : "1px solid transparent",
              padding: "0.35rem 0.85rem",
              borderRadius: "20px",
              fontSize: "0.75rem",
              fontWeight: selectedCategory === cat ? 700 : 500,
              cursor: "pointer",
              textTransform: "capitalize",
              transition: "all 0.2s"
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* List Content */}
      <div style={{ overflowY: "auto", flex: 1, padding: "0.5rem 0", borderBottomLeftRadius: "20px", borderBottomRightRadius: "20px", backgroundColor: "#0B120D" }}>
        {filteredNotifications.length === 0 ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "3rem 2rem", textAlign: "center", gap: "1rem" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <BellOff size={20} color="#A7B8B0" />
            </div>
            <div>
              <h4 style={{ color: "#fff", fontWeight: 700, margin: 0, fontSize: "0.95rem" }}>No Notifications</h4>
              <p style={{ color: "#A7B8B0", fontSize: "0.8rem", margin: "0.25rem 0 0 0" }}>
                {selectedCategory === "all" ? "You're all caught up!" : `No ${selectedCategory} notifications found.`}
              </p>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {filteredNotifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                style={{
                  display: "flex", gap: "1rem", padding: "1rem 1.5rem", cursor: "pointer",
                  background: !notif.is_read ? "rgba(0,230,118,0.05)" : "transparent",
                  borderLeft: !notif.is_read ? "2px solid #00E676" : "2px solid transparent",
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "rgba(0,230,118,0.08)"}
                onMouseLeave={(e) => e.currentTarget.style.background = !notif.is_read ? "rgba(0,230,118,0.05)" : "transparent"}
              >
                <div style={{ marginTop: "0.25rem", flexShrink: 0, width: "32px", height: "32px", borderRadius: "50%", background: "rgba(255,255,255,0.03)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {getIcon(notif)}
                </div>

                <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem" }}>
                    <p style={{ margin: 0, color: !notif.is_read ? "#fff" : "rgba(255,255,255,0.8)", fontSize: "0.85rem", fontWeight: !notif.is_read ? 700 : 500 }}>
                      {notif.title}
                    </p>
                    <span style={{ color: "#A7B8B0", fontSize: "0.65rem", flexShrink: 0 }}>
                      {formatDistanceToNow(new Date(notif.created_at))} ago
                    </span>
                  </div>
                  <p style={{ margin: 0, color: "#A7B8B0", fontSize: "0.8rem", lineHeight: 1.4 }}>
                    {notif.message}
                  </p>
                </div>

                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between", width: "20px" }}>
                  {!notif.is_read ? <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#00E676", marginTop: "0.5rem" }} /> : <div />}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(notif.id);
                    }}
                    style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.2)", cursor: "pointer", padding: "4px" }}
                    onMouseEnter={(e) => e.currentTarget.style.color = "#EF4444"}
                    onMouseLeave={(e) => e.currentTarget.style.color = "rgba(255,255,255,0.2)"}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
