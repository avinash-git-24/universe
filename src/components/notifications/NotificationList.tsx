"use client";

import { formatDistanceToNow } from "date-fns";
import { Check, CheckCircle2, MapPin, AlertCircle, Info } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRealtime } from "@/providers/RealtimeProvider";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface NotificationListProps {
  onClose: () => void;
}

export function NotificationList({ onClose }: NotificationListProps) {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useRealtime();
  const router = useRouter();

  const handleNotificationClick = (id: string, referenceId: string | null) => {
    markAsRead(id);
    onClose();
    if (referenceId) {
      router.push(`/dashboard/requests/${referenceId}`);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "status_accepted": return <CheckCircle2 className="w-4 h-4 text-primary" />;
      case "status_picked_up": return <Info className="w-4 h-4 text-accent" />;
      case "status_delivered": return <MapPin className="w-4 h-4 text-emerald-500" />;
      case "status_cancelled": return <AlertCircle className="w-4 h-4 text-destructive" />;
      default: return <Info className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <Card className="shadow-lg border bg-background/95 backdrop-blur-md">
      <CardHeader className="flex flex-row items-center justify-between pb-3 border-b">
        <CardTitle className="text-base font-semibold">Notifications</CardTitle>
        {unreadCount > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={markAllAsRead}
            className="text-xs h-8 px-2 text-primary"
          >
            <Check className="w-3 h-3 mr-1" /> Mark all read
          </Button>
        )}
      </CardHeader>
      <CardContent className="p-0 max-h-[400px] overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-6 text-center text-sm text-muted-foreground">
            No notifications yet.
          </div>
        ) : (
          <div className="divide-y">
            {notifications.map((notif) => (
              <div 
                key={notif.id}
                onClick={() => handleNotificationClick(notif.id, notif.reference_id)}
                className={`p-4 hover:bg-secondary/50 cursor-pointer transition-colors flex gap-3 ${
                  !notif.is_read ? "bg-primary/5" : ""
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {getIcon(notif.type)}
                </div>
                <div className="space-y-1 flex-1">
                  <p className={`text-sm ${!notif.is_read ? 'font-semibold' : 'font-medium'}`}>
                    {notif.title}
                  </p>
                  <p className="text-sm text-muted-foreground leading-snug">
                    {notif.message}
                  </p>
                  <p className="text-xs text-muted-foreground/80 pt-1">
                    {formatDistanceToNow(new Date(notif.created_at))} ago
                  </p>
                </div>
                {!notif.is_read && (
                  <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
