"use client";

import { memo } from "react";
import { formatDistanceToNow } from "date-fns";
import { Package, MapPin, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { MyRequestTimeline } from "../requests/MyRequestTimeline";
import type { StudentRequestWithDetails } from "@/lib/database/requests";
import { cn } from "@/lib/utils";

// Custom badge renderer strictly for this card to match the dark premium aesthetic perfectly without affecting global styles.
function CardStatusBadge({ status }: { status: string }) {
  let bg = "bg-white/5";
  let border = "border-white/10";
  let text = "text-white/50";
  let label = "Unknown";

  if (status === "pending" || status === "accepted" || status === "picked_up") {
    bg = "bg-[#082a18]";
    border = "border-emerald-500/40";
    text = "text-emerald-400";
    label = "Active";
  } else if (status === "in_transit") {
    bg = "bg-[#0a1e3f]";
    border = "border-blue-500/40";
    text = "text-blue-400";
    label = "In Transit";
  } else if (status === "delivered") {
    bg = "bg-white/5";
    border = "border-white/20";
    text = "text-white/70";
    label = "Delivered";
  } else if (status === "cancelled") {
    bg = "bg-[#3a0a14]";
    border = "border-red-500/40";
    text = "text-red-400";
    label = "Cancelled";
  }

  return (
    <div className={cn("inline-flex items-center justify-center px-3 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase border", bg, border, text)}>
      {label}
    </div>
  );
}

interface StudentRequestCardProps {
  request: StudentRequestWithDetails;
  onClick?: () => void;
  className?: string;
}

export const StudentRequestCard = memo(function StudentRequestCard({ request, onClick, className }: StudentRequestCardProps) {
  const itemCount = request.items.reduce((acc, item) => acc + item.quantity, 0);
  const itemNames = request.items.map(i => i.name).join(", ");

  return (
    <Card
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={onClick ? `View details for request: ${itemNames}` : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onClick();
        }
      }}
      className={cn(
        "w-full flex flex-col lg:flex-row overflow-hidden transition-all duration-300 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none bg-[#0c120f] border border-[#1c2420]/70 rounded-[20px] relative group shadow-sm",
        onClick && "cursor-pointer hover:border-white/15 hover:bg-[#0f1612] hover:shadow-md hover:shadow-emerald-900/5",
        className
      )}
    >
      <div className="w-full p-6 md:p-8 flex flex-col lg:flex-row gap-8 lg:gap-12 items-start lg:items-center">
        
        {/* LEFT COLUMN: Icon, Name, Date, Status */}
        <div className="flex flex-col gap-4 lg:w-[260px] shrink-0">
          <div className="flex items-start gap-4 lg:gap-5">
            <div className="w-[72px] h-[72px] rounded-2xl bg-[#0a2014] flex items-center justify-center shrink-0 shadow-[inset_0_0_20px_rgba(16,185,129,0.05)] border border-emerald-900/30">
              <Package className="w-8 h-8 text-emerald-400" />
            </div>
            <div className="flex flex-col gap-2.5 min-w-0 pt-0.5">
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-white truncate leading-tight tracking-tight">
                  {request.items.map(i => i.name).join(", ")}
                </h3>
                <div className="flex items-center text-xs text-white/40 font-medium">
                  <Clock className="w-3 h-3 mr-1.5 opacity-70" />
                  {formatDistanceToNow(new Date(request.created_at))} ago
                </div>
              </div>
              <div>
                <CardStatusBadge status={request.status} />
              </div>
            </div>
          </div>
        </div>

        {/* CENTER COLUMN: Timeline & Info Row */}
        <div className="flex-1 w-full flex flex-col gap-10">
          <div className="px-2 w-full">
            <MyRequestTimeline status={request.status} />
          </div>
          
          <div className="flex justify-between text-sm w-full relative px-2">
            
            {/* FROM - Aligning with 0% (Requested) */}
            <div className="flex items-start w-[140px]">
              <MapPin className="w-4 h-4 mr-2.5 text-emerald-500 shrink-0 mt-0.5 opacity-80" />
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] text-white/30 uppercase tracking-widest font-bold">From</span>
                <span className="truncate font-semibold text-white/90 text-sm leading-tight">{request.pickup_location}</span>
              </div>
            </div>
            
            {/* TO - Aligning with 50% (Picked Up) */}
            <div className="flex items-start w-[140px] justify-center text-left absolute left-1/2 -translate-x-1/2">
              <MapPin className="w-4 h-4 mr-2.5 text-emerald-500 shrink-0 mt-0.5 opacity-80" />
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] text-white/30 uppercase tracking-widest font-bold">To</span>
                <span className="truncate font-semibold text-white/90 text-sm leading-tight">{request.dropoff_location}</span>
              </div>
            </div>

            {/* ITEMS - Aligning with 100% (Delivered) */}
            <div className="flex items-start w-[140px] justify-end text-left">
              <Package className="w-4 h-4 mr-2.5 text-emerald-500 shrink-0 mt-0.5 opacity-80" />
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] text-white/30 uppercase tracking-widest font-bold">Items</span>
                <span className="font-semibold text-white/90 text-sm leading-tight">{itemCount} item{itemCount !== 1 ? "s" : ""}</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Action */}
        <div className="flex flex-col justify-center items-end shrink-0 min-w-32 gap-2">
          {(() => {
            const activeAssignment = request.assignments?.find(
              (a) => a.status === "active" || a.status === "completed"
            );
            const runner = activeAssignment?.runner;

            if (runner) {
              return (
                <div className="flex items-center gap-2">
                  <a
                    href={`/dashboard/chat?requestId=${request.id}&startWithUserId=${runner.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs shadow-lg shadow-emerald-950/40 transition-all cursor-pointer z-10"
                  >
                    💬 Message Runner
                  </a>
                  {onClick && (
                    <div className="w-[36px] h-[36px] rounded-xl bg-[#131b17] border border-[#1c2420] flex items-center justify-center text-white/40 group-hover:text-white group-hover:bg-[#1a241f] group-hover:border-white/10 transition-all">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                    </div>
                  )}
                </div>
              );
            }

            if (onClick) {
              return request.status === "in_transit" ? (
                <div className="px-5 py-2.5 rounded-lg bg-transparent border border-blue-500/50 text-blue-400 text-[13px] font-bold hover:bg-blue-500/10 transition-colors cursor-pointer text-center whitespace-nowrap ml-auto w-full">
                  View Details
                </div>
              ) : (
                <div className="w-[42px] h-[42px] rounded-xl bg-[#131b17] border border-[#1c2420] flex items-center justify-center text-white/40 group-hover:text-white group-hover:bg-[#1a241f] group-hover:border-white/10 transition-all ml-auto">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                </div>
              );
            }

            return null;
          })()}
        </div>
      </div>
    </Card>
  );
});

