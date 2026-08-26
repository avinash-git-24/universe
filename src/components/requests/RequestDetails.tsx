import { format } from "date-fns";
import { MapPin, Package, User, IndianRupee, FileText, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RequestStatusBadge } from "../request/RequestStatusBadge";
import { RequestTimeline } from "../request/RequestTimeline";
import { CancelRequestButton } from "./CancelRequestButton";
import type { StudentRequestWithDetails } from "@/lib/database/requests";

interface RequestDetailsProps {
  request: StudentRequestWithDetails;
}

export function RequestDetails({ request }: RequestDetailsProps) {
  const activeAssignment = request.assignments?.find(a => a.status === "active" || a.status === "completed");
  const runner = activeAssignment?.runner;

  return (
    <div className="space-y-6">
      
      {/* Top Card: Timeline and Status */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b">
          <div>
            <CardTitle className="text-xl">Request #{request.id.substring(0, 8).toUpperCase()}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Created on {format(new Date(request.created_at), "MMM d, yyyy 'at' h:mm a")}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-2xl font-extrabold text-primary flex items-center">
              <IndianRupee className="w-5 h-5 mr-1" />
              {request.delivery_fee}
            </span>
            <RequestStatusBadge status={request.status} className="text-base py-1 px-3" />
          </div>
        </CardHeader>
        
        <CardContent className="pt-8 pb-10">
          <RequestTimeline status={request.status} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Left Column: Delivery Details */}
        <div className="space-y-6">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-primary" />
                Delivery Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Pickup From</p>
                <p className="font-medium text-lg">{request.pickup_location}</p>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Deliver To</p>
                <p className="font-medium text-lg text-primary">{request.dropoff_location}</p>
              </div>

              {request.instructions && (
                <div className="p-4 bg-secondary/20 rounded-lg border">
                  <p className="text-sm font-semibold flex items-center mb-2">
                    <FileText className="w-4 h-4 mr-2" /> Notes for Runner
                  </p>
                  <p className="text-sm text-muted-foreground">{request.instructions}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Items and Runner */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Package className="w-5 h-5 mr-2 text-primary" />
                Requested Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {request.items.map((item) => (
                  <div key={item.id} className="flex justify-between p-3 bg-secondary/10 rounded-lg border">
                    <span className="font-medium">{item.name}</span>
                    <span className="text-muted-foreground">Qty: {item.quantity}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Runner Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <User className="w-5 h-5 mr-2 text-primary" />
                Runner Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              {runner ? (
                <div className="flex items-center gap-4 p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center shrink-0 text-xl font-bold text-primary">
                    {runner.full_name?.charAt(0) || "R"}
                  </div>
                  <div>
                    <p className="font-semibold">{runner.full_name || "Runner " + runner.id.substring(0,4)}</p>
                    <p className="text-sm text-muted-foreground">Assigned to this delivery</p>
                    
                    <div className="mt-3">
                      <a href={`/dashboard/chat?requestId=${request.id}&startWithUserId=${runner.id}`} className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2">
                        <MessageSquare className="w-4 h-4" /> Message {runner.full_name?.split(" ")[0] || "Runner"}
                      </a>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center p-6 bg-secondary/10 rounded-lg border border-dashed">
                  <p className="text-sm text-muted-foreground">Waiting for a runner to accept this request...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Actions */}
      {request.status === "pending" && (
        <div className="flex justify-end pt-4">
          <CancelRequestButton requestId={request.id} />
        </div>
      )}
    </div>
  );
}
