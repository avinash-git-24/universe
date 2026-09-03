"use client";

import { memo, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  Package,
  MapPin,
  Clock,
  Copy,
  Check,
  Utensils,
  BookOpen,
  Laptop,
  Radio,
  Sparkles,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { MyRequestTimeline } from "../requests/MyRequestTimeline";
import type { StudentRequestWithDetails } from "@/lib/database/requests";
import { cn } from "@/lib/utils";

// Custom badge renderer strictly for this card to match the dark premium aesthetic perfectly.
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
    <div
      className={cn(
        "inline-flex items-center justify-center px-3 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase border",
        bg,
        border,
        text
      )}
    >
      {label}
    </div>
  );
}

// Dynamic item category icon detector
function getItemCategoryIcon(names: string) {
  const lower = names.toLowerCase();
  if (
    /biskut|biscuit|kitkat|chocolate|chips|lays|kurkure|maggi|noodle|coffee|tea|burger|sandwich|food|snack|drink|coke|juice|water|pizza|puff|icecream/.test(
      lower
    )
  ) {
    return {
      icon: Utensils,
      bg: "bg-emerald-950/70 border-emerald-500/35 text-emerald-400 shadow-[inset_0_0_20px_rgba(16,185,129,0.15)]",
      label: "Food & Snack",
    };
  }
  if (/book|notes|notebook|assignment|pen|pencil|paper|print|photocopy|xerox|folder/.test(lower)) {
    return {
      icon: BookOpen,
      bg: "bg-amber-950/70 border-amber-500/35 text-amber-400 shadow-[inset_0_0_20px_rgba(245,158,11,0.15)]",
      label: "Academic",
    };
  }
  if (/laptop|phone|charger|cable|earphone|headphone|mouse|keyboard|usb|powerbank/.test(lower)) {
    return {
      icon: Laptop,
      bg: "bg-blue-950/70 border-blue-500/35 text-blue-400 shadow-[inset_0_0_20px_rgba(59,130,246,0.15)]",
      label: "Gadget",
    };
  }
  return {
    icon: Package,
    bg: "bg-[#0a2014] border-emerald-900/40 text-emerald-400 shadow-[inset_0_0_20px_rgba(16,185,129,0.1)]",
    label: "Parcel",
  };
}

interface StudentRequestCardProps {
  request: StudentRequestWithDetails;
  onClick?: () => void;
  className?: string;
}

export const StudentRequestCard = memo(function StudentRequestCard({
  request,
  onClick,
  className,
}: StudentRequestCardProps) {
  const [copied, setCopied] = useState(false);

  const itemCount = request.items.reduce((acc, item) => acc + item.quantity, 0);
  const itemNames = request.items.map((i) => i.name).join(", ");
  const category = getItemCategoryIcon(itemNames);
  const CategoryIcon = category.icon;

  const isActive = ["pending", "accepted", "picked_up", "in_transit"].includes(request.status);
  const isInTransit = request.status === "in_transit";

  const handleCopyOtp = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (request.delivery_otp) {
      navigator.clipboard.writeText(request.delivery_otp);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

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
        "w-full flex flex-col lg:flex-row overflow-hidden transition-all duration-300 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none bg-[#0b110e]/90 border rounded-[22px] relative group backdrop-blur-xl",
        isActive
          ? isInTransit
            ? "border-blue-500/40 shadow-[0_0_35px_rgba(59,130,246,0.08)] hover:border-blue-400/60 hover:shadow-[0_0_50px_rgba(59,130,246,0.16)]"
            : "border-emerald-500/35 shadow-[0_0_35px_rgba(16,185,129,0.06)] hover:border-emerald-400/50 hover:shadow-[0_0_50px_rgba(16,185,129,0.14)]"
          : "border-[#1c2420]/70 hover:border-white/20 hover:bg-[#0f1612]",
        onClick && "cursor-pointer",
        className
      )}
    >
      {/* Subtle Top Rim Glow for Active Missions */}
      {isActive && (
        <div
          className={cn(
            "absolute top-0 left-12 right-12 h-[1.5px] bg-gradient-to-r from-transparent to-transparent opacity-80 pointer-events-none",
            isInTransit ? "via-blue-400" : "via-emerald-400"
          )}
        />
      )}

      <div className="w-full p-6 md:p-8 flex flex-col lg:flex-row gap-8 lg:gap-12 items-start lg:items-center relative z-10">
        {/* LEFT COLUMN: Category Icon, Name, Date, Status */}
        <div className="flex flex-col gap-4 lg:w-[270px] shrink-0">
          <div className="flex items-start gap-4 lg:gap-5">
            <div
              className={cn(
                "w-[72px] h-[72px] rounded-2xl flex items-center justify-center shrink-0 border transition-transform duration-300 group-hover:scale-105",
                category.bg
              )}
            >
              <CategoryIcon className="w-8 h-8" />
            </div>

            <div className="flex flex-col gap-2.5 min-w-0 pt-0.5">
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-white truncate leading-tight tracking-tight capitalize group-hover:text-emerald-300 transition-colors">
                  {itemNames}
                </h3>
                <div className="flex items-center text-xs text-white/45 font-medium">
                  <Clock className="w-3 h-3 mr-1.5 opacity-70" />
                  {formatDistanceToNow(new Date(request.created_at))} ago
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <CardStatusBadge status={request.status} />
                {isActive && (
                  <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Live
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* CENTER COLUMN: Timeline & Info Row */}
        <div className="flex-1 w-full flex flex-col gap-6 sm:gap-10">
          <div className="px-1 sm:px-2 w-full">
            <MyRequestTimeline status={request.status} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-sm w-full px-1 sm:px-2">
            {/* FROM */}
            <div className="flex items-start min-w-0">
              <MapPin className="w-4 h-4 mr-2 text-emerald-400 shrink-0 mt-0.5 opacity-85" />
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="text-[10px] text-white/40 uppercase tracking-widest font-mono font-bold">
                  From
                </span>
                <span className="truncate font-semibold text-white/95 text-xs sm:text-sm leading-tight">
                  {request.pickup_location}
                </span>
              </div>
            </div>

            {/* TO */}
            <div className="flex items-start sm:justify-center min-w-0">
              <MapPin className="w-4 h-4 mr-2 text-emerald-400 shrink-0 mt-0.5 opacity-85" />
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="text-[10px] text-white/40 uppercase tracking-widest font-mono font-bold">
                  To
                </span>
                <span className="truncate font-semibold text-white/95 text-xs sm:text-sm leading-tight">
                  {request.dropoff_location}
                </span>
              </div>
            </div>

            {/* ITEMS */}
            <div className="flex items-start sm:justify-end min-w-0">
              <Package className="w-4 h-4 mr-2 text-emerald-400 shrink-0 mt-0.5 opacity-85" />
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="text-[10px] text-white/40 uppercase tracking-widest font-mono font-bold">
                  Items
                </span>
                <span className="font-semibold text-white/95 text-xs sm:text-sm leading-tight">
                  {itemCount} item{itemCount !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Action & Interactive OTP */}
        <div className="flex flex-col items-start sm:items-end justify-center w-full lg:w-auto shrink-0 gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-white/5">
          {/* Interactive 1-Click Copy Delivery Handover OTP */}
          {request.delivery_otp && !["delivered", "cancelled"].includes(request.status) && (
            <div
              onClick={handleCopyOtp}
              className="group/otp relative flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-950/80 via-[#0a2317] to-emerald-950/80 border border-emerald-500/40 shadow-[0_0_18px_rgba(16,185,129,0.2)] hover:border-emerald-400 hover:shadow-[0_0_25px_rgba(16,185,129,0.35)] transition-all cursor-pointer"
              title="Click to copy delivery OTP"
            >
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                🔐 OTP:
              </span>
              <span className="font-mono text-sm font-black text-white tracking-widest bg-black/80 px-2 py-0.5 rounded-md border border-emerald-500/50">
                {request.delivery_otp}
              </span>
              <div className="text-emerald-400/70 group-hover/otp:text-emerald-300 transition-colors">
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-300" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </div>

              {copied && (
                <span className="absolute -top-7 right-0 text-[10px] font-mono font-bold text-emerald-300 bg-black/90 px-2 py-0.5 rounded border border-emerald-500/60 shadow-lg animate-in fade-in slide-in-from-bottom-1 z-20">
                  Copied! ✓
                </span>
              )}
            </div>
          )}

          {(() => {
            const activeAssignment = request.assignments?.find(
              (a) => a.status === "active" || a.status === "completed"
            );
            const runner = activeAssignment?.runner;

            if (runner) {
              return (
                <div className="flex flex-col sm:items-end gap-2 w-full sm:w-auto">
                  {/* Runner Info Chip */}
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/40 border border-emerald-500/25 text-[11px] text-emerald-300">
                    <div className="w-4 h-4 rounded-full bg-emerald-500/30 flex items-center justify-center text-[9px] font-bold text-emerald-300">
                      {runner.full_name ? runner.full_name.charAt(0).toUpperCase() : "R"}
                    </div>
                    <span className="font-semibold text-white/90 truncate max-w-[120px]">
                      {runner.full_name || "Campus Runner"}
                    </span>
                    <span className="text-emerald-400 font-mono text-[10px]">★ 4.9</span>
                  </div>

                  {/* Message Runner & Details */}
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                    <a
                      href={`/dashboard/chat?requestId=${request.id}&startWithUserId=${runner.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-black font-bold text-xs shadow-lg shadow-emerald-950/50 hover:shadow-emerald-500/30 hover:brightness-105 active:scale-[0.98] transition-all cursor-pointer z-10 w-full sm:w-auto text-center"
                    >
                      💬 Message Runner
                    </a>
                    {onClick && (
                      <div className="w-[36px] h-[36px] rounded-xl bg-[#131b17] border border-[#1c2420] flex items-center justify-center text-white/40 group-hover:text-white group-hover:bg-[#1a241f] group-hover:border-white/10 transition-all shrink-0">
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="m9 18 6-6-6-6" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              );
            }

            if (onClick) {
              return request.status === "in_transit" ? (
                <div className="px-5 py-2.5 rounded-xl bg-blue-500/10 border border-blue-500/50 text-blue-400 text-[13px] font-bold hover:bg-blue-500/20 transition-all cursor-pointer text-center whitespace-nowrap w-full lg:w-auto shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                  Track Delivery ➔
                </div>
              ) : (
                <div className="w-[36px] sm:w-[42px] h-[36px] sm:h-[42px] rounded-xl bg-[#131b17] border border-[#1c2420] flex items-center justify-center text-white/40 group-hover:text-white group-hover:bg-[#1a241f] group-hover:border-white/10 transition-all ml-auto">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m9 18 6-6-6-6" />
                  </svg>
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
