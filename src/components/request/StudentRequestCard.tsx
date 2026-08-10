"use client";

import { memo } from "react";
import { formatDistanceToNow, format } from "date-fns";
import { Package, MapPin, IndianRupee, User, Eye, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { RequestStatusBadge } from "./RequestStatusBadge";
import { MyRequestTimeline } from "../requests/MyRequestTimeline";
import type { StudentRequestWithDetails } from "@/lib/database/requests";
import { cn } from "@/lib/utils";

interface StudentRequestCardProps {
  request: StudentRequestWithDetails;
  onClick?: () => void;
  className?: string;
}

export const StudentRequestCard = memo(function StudentRequestCard({ request, onClick, className }: StudentRequestCardProps) {
  // Find the active assignment (if any) to display the runner
  const activeAssignment = request.assignments?.find(a => a.status === "active" || a.status === "completed");
  const runner = activeAssignment?.runner;
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
        "w-full flex flex-col md:flex-row overflow-hidden transition-all duration-300 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none bg-[#131815]/80 backdrop-blur-md border border-emerald-900/30 rounded-xl",
        onClick && "cursor-pointer hover:border-emerald-500/40 hover:shadow-[0_4px_20px_rgba(16,185,129,0.05)]",
        className
      )}
    >
      {/* Container for responsive layout */}
      <div className="w-full p-5 sm:p-6 md:p-8 flex flex-col md:flex-row gap-6 md:gap-8 items-start md:items-center">
        
        {/* LEFT COLUMN: Icon, Name, Date */}
        <div className="flex items-start gap-5 md:w-72 shrink-0">
          <div className="w-12 h-12 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 shadow-[inset_0_0_10px_rgba(16,185,129,0.1)]">
            <Package className="w-6 h-6 text-emerald-400" />
          </div>
          <div className="space-y-1 min-w-0">
            <h3 className="text-lg font-bold text-white truncate leading-tight">
              {request.items.map(i => i.name).join(", ")}
            </h3>
            <div className="flex items-center text-sm text-white/50">
              <Clock className="w-4 h-4 mr-1.5" />
              {formatDistanceToNow(new Date(request.created_at))} ago
            </div>
          </div>
        </div>

        {/* CENTER COLUMN: Timeline & Info Row */}
        <div className="flex-1 w-full flex flex-col gap-6">
          <div className="px-2">
            <MyRequestTimeline status={request.status} />
          </div>
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6 text-sm">
            <div className="flex items-center min-w-0 flex-1">
              <MapPin className="w-5 h-5 mr-2 text-emerald-500 shrink-0" />
              <div className="flex flex-col">
                <span className="text-xs text-white/40 uppercase tracking-wider font-semibold">From</span>
                <span className="truncate font-medium text-white/80">{request.pickup_location}</span>
              </div>
            </div>
            
            <div className="flex items-center min-w-0 flex-1">
              <MapPin className="w-5 h-5 mr-2 text-emerald-500 shrink-0" />
              <div className="flex flex-col">
                <span className="text-xs text-white/40 uppercase tracking-wider font-semibold">To</span>
                <span className="truncate font-medium text-white">{request.dropoff_location}</span>
              </div>
            </div>

            <div className="flex items-center shrink-0">
              <Package className="w-5 h-5 mr-2 text-emerald-500 shrink-0" />
              <div className="flex flex-col">
                <span className="text-xs text-white/40 uppercase tracking-wider font-semibold">Items</span>
                <span className="font-medium text-white/80">{itemCount} item{itemCount !== 1 ? "s" : ""}</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Amount, Status, Action */}
        <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center w-full md:w-40 shrink-0 gap-4 pt-4 md:pt-0 border-t md:border-t-0 border-white/5">
          <div className="flex md:flex-col items-center md:items-end gap-3 md:gap-2">
            <div className="text-2xl font-bold text-white flex items-center leading-none">
              <IndianRupee className="w-5 h-5 mr-0.5 text-white/70" />
              {request.delivery_fee}
            </div>
            <RequestStatusBadge status={request.status} />
          </div>

          {onClick && (
            <span className="text-sm font-semibold text-emerald-400 inline-flex items-center gap-1.5 hover:text-emerald-300 transition-colors py-1">
              <Eye className="w-4 h-4" /> View Details
            </span>
          )}
        </div>

      </div>
    </Card>
  );
});
