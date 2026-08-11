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
    <div className={cn("w-full px-1", className)}>
      <div className="flex items-center justify-between w-full relative">
        {/* Background track line */}
        <div className="absolute left-4 right-4 top-3 -translate-y-1/2 h-[2px] bg-[#1c2420]" />
        
        {/* Active progress line */}
        <div
          className={cn("absolute left-4 top-3 -translate-y-1/2 h-[2px] transition-all duration-500", status === "in_transit" ? "bg-blue-500" : "bg-emerald-500")}
          style={{ width: `calc(${(activeIndex / (STAGES.length - 1)) * 100}% - 32px)` }}
        />

        {STAGES.map((stage, index) => {
          const Icon = stage.icon;
          const isCompleted = index < activeIndex;
          const isCurrent = index === activeIndex;
          
          let iconColor = "text-white/20";
          let bgColor = "bg-[#0c120f]";
          let ringColor = "border-[#2c3430]";
          
          if (isCompleted) {
            iconColor = "text-[#0a0f0d]";
            ringColor = "border-emerald-500";
            bgColor = "bg-emerald-500";
          } else if (isCurrent) {
            if (stage.id === "in_transit") {
              ringColor = "border-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.6)]";
              bgColor = "bg-[#0a1e3f]";
            } else {
              ringColor = "border-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.4)]";
              bgColor = "bg-[#082a18]";
            }
          }

          return (
            <div key={stage.id} className="relative flex flex-col items-center z-10 gap-2.5">
              <div
                className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 border-[1.5px]",
                  bgColor,
                  ringColor
                )}
              >
                {isCurrent ? (
                  <div className={cn("w-2.5 h-2.5 rounded-full", stage.id === "in_transit" ? "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" : "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]")} />
                ) : isCompleted ? (
                  <CheckCircle2 className={cn("w-4 h-4", iconColor)} />
                ) : (
                  <Icon className={cn("w-3 h-3 opacity-60", iconColor)} />
                )}
              </div>
              <span
                className={cn(
                  "text-[11px] font-bold text-center leading-none transition-colors",
                  (isCompleted || isCurrent) ? "text-white/90" : "text-white/30"
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
