"use client";

import { Database } from "@/types/database";
import { CheckCircle2, Clock, Package, Truck, MapPin, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type RequestStatus = Database["public"]["Enums"]["request_status"];

interface MyRequestTimelineProps {
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

export function MyRequestTimeline({ status, className }: MyRequestTimelineProps) {
  // If cancelled, show a clear cancelled status indicator
    if (status === "cancelled") {
      return (
        <div className={cn("flex items-center justify-center p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm font-semibold gap-2", className)}>
          <XCircle className="w-5 h-5 shrink-0" />
          <span>Request Cancelled</span>
        </div>
      );
  }

  // Determine current step index
  const currentIndex = STAGES.findIndex((s) => s.id === status);
  const activeIndex = currentIndex === -1 ? 0 : currentIndex;

  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between w-full relative">
        {/* Background track line */}
        <div className="absolute left-2 right-2 top-3 -translate-y-1/2 h-[2px] bg-white/10 rounded-full" />
        
        {/* Active progress line */}
        <div
          className="absolute left-2 top-3 -translate-y-1/2 h-[2px] bg-emerald-500 rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
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
                  "w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 shrink-0 mb-2",
                  isCompleted
                    ? "bg-[#0f1714] text-emerald-400 border border-emerald-500/30"
                    : "bg-[#131815] text-white/30 border border-white/5",
                  isCurrent && "ring-2 ring-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.3)] bg-[#0f1714]"
                )}
              >
                <Icon className="w-3 h-3" />
              </div>
              <span
                className={cn(
                  "text-[10px] sm:text-xs font-medium text-center leading-none transition-colors",
                  isCompleted ? "text-white font-semibold" : "text-white/40"
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
