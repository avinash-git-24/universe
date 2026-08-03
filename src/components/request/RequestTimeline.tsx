import { Database } from "@/types/database";
import { CheckCircle2, Clock, Package, Truck, MapPin, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type RequestStatus = Database["public"]["Enums"]["request_status"];

interface RequestTimelineProps {
  status: RequestStatus;
  className?: string;
}

const STAGES = [
  { id: "pending", label: "Requested", icon: Clock },
  { id: "accepted", label: "Accepted", icon: CheckCircle2 },
  { id: "picked_up", label: "Picked Up", icon: Package },
  { id: "in_transit", label: "In Transit", icon: Truck },
  { id: "delivered", label: "Delivered", icon: MapPin },
] as const;

export function RequestTimeline({ status, className }: RequestTimelineProps) {
  // If cancelled, show a clear cancelled status indicator
  if (status === "cancelled") {
    return (
      <div className={cn("flex items-center justify-center p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-600 dark:text-red-400 text-xs font-semibold gap-2", className)}>
        <XCircle className="w-4 h-4 shrink-0" />
        <span>Request Cancelled</span>
      </div>
    );
  }

  // Determine current step index
  const currentIndex = STAGES.findIndex((s) => s.id === status);
  const activeIndex = currentIndex === -1 ? 0 : currentIndex;

  return (
    <div className={cn("w-full py-2", className)}>
      <div className="flex items-center justify-between w-full relative">
        {/* Background track line */}
        <div className="absolute left-3 right-3 top-3.5 sm:top-4 -translate-y-1/2 h-1 bg-border rounded-full" />
        
        {/* Active progress line */}
        <div
          className="absolute left-3 top-3.5 sm:top-4 -translate-y-1/2 h-1 bg-primary rounded-full transition-all duration-500"
          style={{ width: `calc(${(activeIndex / (STAGES.length - 1)) * 100}% - 12px)` }}
        />

        {STAGES.map((stage, index) => {
          const Icon = stage.icon;
          const isCompleted = index <= activeIndex;
          const isCurrent = index === activeIndex;

          return (
            <div key={stage.id} className="relative flex flex-col items-center z-10">
              <div
                className={cn(
                  "w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-colors duration-300 shrink-0",
                  isCompleted
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground",
                  isCurrent && "ring-4 ring-primary/20"
                )}
              >
                <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <span
                className={cn(
                  "mt-2 text-[10px] sm:text-xs font-medium text-center max-w-[55px] sm:max-w-none leading-tight",
                  isCompleted ? "text-foreground font-semibold" : "text-muted-foreground"
                )}
              >
                {stage.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
