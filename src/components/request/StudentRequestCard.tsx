"use client";

import { formatDistanceToNow, format } from "date-fns";
import { Package, MapPin, IndianRupee, User, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { RequestStatusBadge } from "./RequestStatusBadge";
import { RequestTimeline } from "./RequestTimeline";
import type { StudentRequestWithDetails } from "@/lib/database/requests";
import { cn } from "@/lib/utils";

interface StudentRequestCardProps {
  request: StudentRequestWithDetails;
  onClick?: () => void;
  className?: string;
}

export function StudentRequestCard({ request, onClick, className }: StudentRequestCardProps) {
  // Find the active assignment (if any) to display the runner
  const activeAssignment = request.assignments?.find(a => a.status === "active" || a.status === "completed");
  const runner = activeAssignment?.runner;
  const itemCount = request.items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <Card 
      onClick={onClick}
      className={cn(
        "w-full flex flex-col overflow-hidden transition-all duration-200",
        onClick && "cursor-pointer hover:border-primary/50 hover:shadow-md",
        className
      )}
    >
      <CardHeader className="bg-secondary/10 pb-4">
        <div className="flex justify-between items-start gap-4">
          <div className="space-y-1 min-w-0">
            <CardTitle className="text-lg truncate">
              {request.items.map(i => i.name).join(", ")}
            </CardTitle>
            <div className="text-xs text-muted-foreground">
              Requested {formatDistanceToNow(new Date(request.created_at))} ago ({format(new Date(request.created_at), "MMM d, h:mm a")})
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-xl font-bold text-primary flex items-center justify-end">
              <IndianRupee className="w-4 h-4 mr-0.5" />
              {request.delivery_fee}
            </div>
            <RequestStatusBadge status={request.status} className="mt-1" />
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6 pb-6 space-y-6 flex-1">
        <RequestTimeline status={request.status} />

        <div className="grid sm:grid-cols-3 gap-3 pt-6 text-sm">
          <div className="flex items-start">
            <MapPin className="w-4 h-4 mr-2 mt-0.5 text-muted-foreground shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground font-semibold uppercase">From</p>
              <p className="font-medium truncate">{request.pickup_location}</p>
            </div>
          </div>

          <div className="flex items-start">
            <MapPin className="w-4 h-4 mr-2 mt-0.5 text-primary shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground font-semibold uppercase">To</p>
              <p className="font-medium truncate text-primary">{request.dropoff_location}</p>
            </div>
          </div>

          <div className="flex items-start">
            <Package className="w-4 h-4 mr-2 mt-0.5 text-muted-foreground shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground font-semibold uppercase">Items</p>
              <p className="font-medium">{itemCount} item{itemCount !== 1 ? "s" : ""}</p>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="bg-secondary/5 border-t py-3 flex items-center justify-between gap-3 text-sm">
        {runner ? (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
              <User className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="font-semibold leading-none">{runner.full_name || `Runner #${runner.id.substring(0, 6)}`}</p>
              <p className="text-xs text-muted-foreground mt-1">Assigned Runner</p>
            </div>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground italic">Waiting for runner...</span>
        )}

        {onClick && (
          <span className="text-xs font-semibold text-primary inline-flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" /> View Details
          </span>
        )}
      </CardFooter>
    </Card>
  );
}
