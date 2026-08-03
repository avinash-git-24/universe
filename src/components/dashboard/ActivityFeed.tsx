import { formatDistanceToNow } from "date-fns";
import { Clock, CheckCircle2, Package, Truck, MapPin, AlertCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { StudentRequestWithDetails } from "@/lib/database/requests";

interface ActivityFeedProps {
  requests: StudentRequestWithDetails[];
}

export function ActivityFeed({ requests }: ActivityFeedProps) {
  // Derive a simple activity feed based on the latest updated requests
  // In a real app with an audit_log table, this would be cleaner.
  const activities = requests
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 5) // Last 5 activities
    .map((req) => {
      let icon = Clock;
      let action = "created a request";
      let color = "text-muted-foreground";

      if (req.status === "accepted") {
        icon = CheckCircle2;
        action = "was accepted by a runner";
        color = "text-primary";
      } else if (req.status === "picked_up") {
        icon = Package;
        action = "was picked up";
        color = "text-accent";
      } else if (req.status === "in_transit") {
        icon = Truck;
        action = "is in transit";
        color = "text-indigo-500";
      } else if (req.status === "delivered") {
        icon = MapPin;
        action = "was delivered successfully";
        color = "text-emerald-500";
      } else if (req.status === "cancelled") {
        icon = AlertCircle;
        action = "was cancelled";
        color = "text-error";
      }

      return {
        id: `${req.id}-${req.status}`,
        action,
        item: req.items.map(i => i.name).join(", "),
        time: req.updated_at,
        icon,
        color
      };
    });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No recent activity.</p>
        ) : (
          <div className="space-y-6">
            {activities.map((activity, idx) => {
              const Icon = activity.icon;
              return (
                <div key={activity.id} className="flex relative">
                  {idx !== activities.length - 1 && (
                    <div className="absolute top-8 bottom-[-24px] left-[11px] w-0.5 bg-border" />
                  )}
                  <div className={`relative z-10 w-6 h-6 rounded-full bg-secondary/50 flex items-center justify-center shrink-0 mt-0.5 ${activity.color}`}>
                    <Icon className="w-3 h-3" />
                  </div>
                  <div className="ml-4 space-y-1">
                    <p className="text-sm">
                      Your request for <span className="font-medium">{activity.item}</span> {activity.action}.
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(activity.time))} ago
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
