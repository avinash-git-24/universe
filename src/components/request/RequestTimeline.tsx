import { Database } from "@/types/database";
import { CheckCircle2, Clock, Package, Truck, MapPin } from "lucide-react";

type RequestStatus = Database["public"]["Enums"]["request_status"];

interface RequestTimelineProps {
  status: RequestStatus;
}

const STAGES = [
  { id: "pending", label: "Requested", icon: Clock },
  { id: "accepted", label: "Accepted", icon: CheckCircle2 },
  { id: "picked_up", label: "Picked Up", icon: Package },
  { id: "in_transit", label: "In Transit", icon: Truck },
  { id: "delivered", label: "Delivered", icon: MapPin },
] as const;

export function RequestTimeline({ status }: RequestTimelineProps) {
  // If cancelled, show a simple cancelled state instead of timeline
  if (status === "cancelled") {
    return (
      <div className="flex items-center text-destructive text-sm font-medium">
        Request Cancelled
      </div>
    );
  }

  // Determine the current step index
  const currentIndex = STAGES.findIndex(s => s.id === status);
  const activeIndex = currentIndex === -1 ? 0 : currentIndex;

  return (
    <div className="flex items-center justify-between w-full relative">
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-border rounded-full" />
      <div 
        className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary rounded-full transition-all duration-500"
        style={{ width: `${(activeIndex / (STAGES.length - 1)) * 100}%` }}
      />
      
      {STAGES.map((stage, index) => {
        const Icon = stage.icon;
        const isCompleted = index <= activeIndex;
        const isCurrent = index === activeIndex;

        return (
          <div key={stage.id} className="relative flex flex-col items-center">
            <div 
              className={`w-8 h-8 rounded-full flex items-center justify-center z-10 transition-colors duration-300 ${
                isCompleted 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-secondary text-muted-foreground"
              } ${isCurrent ? "ring-4 ring-primary/20" : ""}`}
            >
              <Icon className="w-4 h-4" />
            </div>
            <span className={`absolute top-10 text-xs font-medium whitespace-nowrap ${
              isCompleted ? "text-foreground" : "text-muted-foreground"
            }`}>
              {stage.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
