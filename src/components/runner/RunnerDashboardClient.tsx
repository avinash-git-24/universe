"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { MapPin, Package, Clock, IndianRupee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { acceptRequest, RequestWithItems, AssignmentWithRequest } from "@/lib/database/requests";

interface RunnerDashboardClientProps {
  runnerId: string;
  initialPending: RequestWithItems[];
  activeAssignment: AssignmentWithRequest | null;
}

export function RunnerDashboardClient({
  runnerId,
  initialPending,
  activeAssignment,
}: RunnerDashboardClientProps) {
  const router = useRouter();
  const [pendingRequests, setPendingRequests] = useState(initialPending);
  const [isAccepting, setIsAccepting] = useState<string | null>(null);

  const handleAccept = async (requestId: string) => {
    setIsAccepting(requestId);
    try {
      const supabase = createClient();
      const success = await acceptRequest(supabase, requestId, runnerId);
      if (success) {
        router.push("/dashboard/runner/active");
        router.refresh();
      } else {
        alert("Failed to accept request. It might have been taken by someone else.");
        setPendingRequests((prev) => prev.filter((r) => r.id !== requestId));
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred.");
    } finally {
      setIsAccepting(null);
    }
  };

  if (activeAssignment) {
    return (
      <div className="space-y-4">
        <Card className="border-primary/50 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-primary">You have an active delivery!</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Please complete your current delivery before accepting new ones.
            </p>
            <Button className="w-full" onClick={() => router.push("/dashboard/runner/active")}>
              Go to Active Delivery
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">Nearby Requests</h2>
      
      {pendingRequests.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Package className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p>No pending requests right now.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {pendingRequests.map((req) => (
            <Card key={req.id} className="flex flex-col">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <Badge variant="neutral" className="mb-2">
                    {req.items.length} Item{req.items.length > 1 ? "s" : ""}
                  </Badge>
                  <span className="text-lg font-bold text-primary flex items-center">
                    <IndianRupee className="w-4 h-4 mr-1" />
                    {req.delivery_fee}
                  </span>
                </div>
                <CardTitle className="text-lg truncate">
                  {req.items.map(i => i.name).join(", ")}
                </CardTitle>
              </CardHeader>
              
              <CardContent className="flex-1 space-y-3 text-sm">
                <div className="flex items-start text-muted-foreground">
                  <MapPin className="w-4 h-4 mr-2 mt-0.5 shrink-0" />
                  <div className="grid">
                    <span className="font-semibold text-foreground">Pickup</span>
                    <span>{req.pickup_location}</span>
                  </div>
                </div>
                
                <div className="flex items-start text-muted-foreground">
                  <MapPin className="w-4 h-4 mr-2 mt-0.5 shrink-0 text-primary" />
                  <div className="grid">
                    <span className="font-semibold text-foreground">Dropoff</span>
                    <span>{req.dropoff_location}</span>
                  </div>
                </div>

                <div className="flex items-center text-xs text-muted-foreground pt-2">
                  <Clock className="w-3 h-3 mr-1" />
                  Posted {formatDistanceToNow(new Date(req.created_at))} ago
                </div>
              </CardContent>
              
              <CardFooter>
                <Button 
                  className="w-full" 
                  onClick={() => handleAccept(req.id)}
                  disabled={isAccepting !== null}
                >
                  {isAccepting === req.id ? "Accepting..." : "Accept Request"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
