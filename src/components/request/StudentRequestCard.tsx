"use client";

import { formatDistanceToNow } from "date-fns";
import { Package, MapPin, IndianRupee, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { RequestStatusBadge } from "./RequestStatusBadge";
import { RequestTimeline } from "./RequestTimeline";
import type { StudentRequestWithDetails } from "@/lib/database/requests";

interface StudentRequestCardProps {
  request: StudentRequestWithDetails;
}

export function StudentRequestCard({ request }: StudentRequestCardProps) {
  // Find the active assignment (if any) to display the runner
  const activeAssignment = request.assignments?.find(a => a.status === "active" || a.status === "completed");
  const runner = activeAssignment?.runner;

  return (
    <Card className="w-full flex flex-col overflow-hidden">
      <CardHeader className="bg-secondary/10 pb-4">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">
              {request.items.map(i => i.name).join(", ")}
            </CardTitle>
            <div className="text-xs text-muted-foreground mt-1">
              Requested {formatDistanceToNow(new Date(request.created_at))} ago
            </div>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold text-primary flex items-center justify-end">
              <IndianRupee className="w-4 h-4 mr-1" />
              {request.delivery_fee}
            </div>
            <RequestStatusBadge status={request.status} className="mt-1" />
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6 pb-8 space-y-8 flex-1">
        <RequestTimeline status={request.status} />

        <div className="grid gap-3 pt-6 text-sm">
          <div className="flex items-start">
            <MapPin className="w-4 h-4 mr-2 mt-0.5 text-muted-foreground shrink-0" />
            <div>
              <span className="font-semibold">From: </span>
              {request.pickup_location}
            </div>
          </div>
          <div className="flex items-start">
            <MapPin className="w-4 h-4 mr-2 mt-0.5 text-primary shrink-0" />
            <div>
              <span className="font-semibold">To: </span>
              {request.dropoff_location}
            </div>
          </div>
          <div className="flex items-start">
            <Package className="w-4 h-4 mr-2 mt-0.5 text-muted-foreground shrink-0" />
            <div>
              <span className="font-semibold">Items: </span>
              {request.items.reduce((acc, item) => acc + item.quantity, 0)} total
            </div>
          </div>
        </div>
      </CardContent>

      {runner && (
        <CardFooter className="bg-secondary/5 border-t py-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
            <User className="w-4 h-4 text-primary" />
          </div>
          <div className="text-sm">
            <p className="font-semibold leading-none">{runner.full_name || runner.id.substring(0, 8)}</p>
            <p className="text-xs text-muted-foreground mt-1">Your Runner</p>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
