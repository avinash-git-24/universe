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
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Notification } from "@/lib/database/notifications";

interface NotificationListProps {
  onClose: () => void;
}

type NotificationCategory = "all" | "delivery" | "request" | "system" | "runner" | "admin";

export function NotificationList({ onClose }: NotificationListProps) {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useRealtime();
  const [selectedCategory, setSelectedCategory] = useState<NotificationCategory>("all");
  const router = useRouter();

  // Helper to categorize notifications based on payload type/title
  const getCategory = (notif: Notification): NotificationCategory => {
    const t = notif.type.toLowerCase();
    const title = notif.title.toLowerCase();

    if (t.includes("delivery") || t.includes("picked_up") || t.includes("in_transit") || t.includes("delivered")) {
      return "delivery";
    }
    if (t.includes("request") || t.includes("accepted") || t.includes("pending")) {
      return "request";
    }
    if (t.includes("runner") || title.includes("runner")) {
      return "runner";
    }
    if (t.includes("admin") || title.includes("admin")) {
      return "admin";
    }
    if (t.includes("system") || title.includes("system")) {
      return "system";
    }
    return "request";
  };

  // Icon selector based on notification category & type
  const getIcon = (notif: Notification) => {
    const category = getCategory(notif);
    const t = notif.type.toLowerCase();

    if (t === "status_delivered" || t.includes("delivered")) {
      return <MapPin className="w-4 h-4 text-emerald-500" />;
    }
    if (t === "status_cancelled" || t.includes("cancelled")) {
      return <AlertCircle className="w-4 h-4 text-red-500" />;
    }
    if (t === "status_in_transit" || t.includes("transit")) {
      return <Truck className="w-4 h-4 text-cyan-500" />;
    }
    if (t === "status_picked_up" || t.includes("picked")) {
      return <Truck className="w-4 h-4 text-purple-500" />;
    }
    if (t === "status_accepted" || t.includes("accepted")) {
      return <CheckCircle2 className="w-4 h-4 text-amber-500" />;
    }

    switch (category) {
      case "delivery":
        return <Truck className="w-4 h-4 text-primary" />;
      case "runner":
        return <Bike className="w-4 h-4 text-accent" />;
      case "admin":
        return <BellRing className="w-4 h-4 text-indigo-500" />;
      case "system":
        return <Info className="w-4 h-4 text-secondary-foreground" />;
      default:
        return <FileText className="w-4 h-4 text-blue-500" />;
    }
  };

  // Filter & Sort Notifications
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
    <Card className="shadow-xl border bg-background/95 backdrop-blur-md overflow-hidden">
      {/* Header */}
      <CardHeader className="flex flex-row items-center justify-between pb-3 border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <CardTitle className="text-base font-bold">Notifications</CardTitle>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-primary/10 text-primary border border-primary/20">
              {unreadCount} new
            </span>
          )}
        </div>

        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={markAllAsRead}
            className="text-xs h-7 px-2 text-primary hover:bg-primary/10"
          >
            <Check className="w-3 h-3 mr-1" /> Mark all read
          </Button>
        )}
      </CardHeader>

      {/* Category Pills */}
      <div className="flex items-center gap-1 px-3 py-2 border-b bg-secondary/20 overflow-x-auto text-xs">
        {(["all", "delivery", "request", "runner", "system", "admin"] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-2.5 py-1 rounded-full capitalize font-medium transition-colors shrink-0 ${
              selectedCategory === cat
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-secondary"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* List Content */}
      <CardContent className="p-0 max-h-[380px] overflow-y-auto">
        {filteredNotifications.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground space-y-2">
            <BellOff className="w-10 h-10 mx-auto text-muted-foreground/30" />
            <p className="font-semibold text-foreground">No Notifications</p>
            <p className="text-xs">
              {selectedCategory === "all"
                ? "You're all caught up! New notifications will appear here."
                : `No ${selectedCategory} notifications found.`}
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {filteredNotifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-3.5 hover:bg-secondary/40 transition-colors flex gap-3 group relative cursor-pointer ${
                  !notif.is_read
                    ? "bg-primary/5 dark:bg-primary/10 border-l-2 border-primary"
                    : ""
                }`}
                onClick={() => handleNotificationClick(notif)}
              >
                <div className="mt-0.5 shrink-0 p-1.5 rounded-full bg-secondary/50">
                  {getIcon(notif)}
                </div>

                <div className="space-y-0.5 flex-1 min-w-0 pr-6">
                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-xs ${!notif.is_read ? "font-bold text-foreground" : "font-medium text-foreground/90"} truncate`}>
                      {notif.title}
                    </p>
                    <span className="text-[10px] text-muted-foreground shrink-0">
                      {formatDistanceToNow(new Date(notif.created_at))} ago
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {notif.message}
                  </p>
                </div>

                {/* Unread indicator dot */}
                {!notif.is_read && (
                  <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1" />
                )}

                {/* Delete notification button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNotification(notif.id);
                  }}
                  className="absolute right-2 bottom-2 opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-destructive rounded transition-opacity"
                  title="Delete notification"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
