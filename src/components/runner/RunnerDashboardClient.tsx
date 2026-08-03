"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow, format } from "date-fns";
import { MapPin, Package, Clock, IndianRupee, Eye, CheckCircle2, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalBody,
  ModalFooter,
} from "@/components/ui/modal";
import { createClient } from "@/lib/supabase/client";
import { 
  acceptRequest, 
  updateRequestStatus, 
  RequestWithItems, 
  AssignmentWithRequest 
} from "@/lib/database/requests";
import { RequestStatusBadge } from "@/components/request/RequestStatusBadge";
import type { Database } from "@/types/database";

interface RunnerDashboardClientProps {
  runnerId: string;
  initialPending: RequestWithItems[];
  initialActive: AssignmentWithRequest[];
  initialHistory: AssignmentWithRequest[];
}

type RunnerTab = "available" | "active" | "history";

export function RunnerDashboardClient({
  runnerId,
  initialPending,
  initialActive,
  initialHistory,
}: RunnerDashboardClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<RunnerTab>("available");
  const [pendingRequests, setPendingRequests] = useState<RequestWithItems[]>(initialPending);
  const [activeDeliveries, setActiveDeliveries] = useState<AssignmentWithRequest[]>(initialActive);
  const [deliveryHistory, setDeliveryHistory] = useState<AssignmentWithRequest[]>(initialHistory);

  const [isAccepting, setIsAccepting] = useState<string | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<RequestWithItems | null>(null);

  // Adjust state when initial props change on revalidation (React recommended pattern)
  const [prevPending, setPrevPending] = useState(initialPending);
  if (prevPending !== initialPending) {
    setPrevPending(initialPending);
    setPendingRequests(initialPending);
  }

  const [prevActive, setPrevActive] = useState(initialActive);
  if (prevActive !== initialActive) {
    setPrevActive(initialActive);
    setActiveDeliveries(initialActive);
  }

  const [prevHistory, setPrevHistory] = useState(initialHistory);
  if (prevHistory !== initialHistory) {
    setPrevHistory(initialHistory);
    setDeliveryHistory(initialHistory);
  }

  // Realtime subscription for pending requests
  useEffect(() => {
    const supabase = createClient();
    
    const channel = supabase
      .channel("realtime:runner_requests")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "delivery_requests",
          filter: "status=eq.pending",
        },
        async (payload) => {
          const { data, error } = await supabase
            .from("delivery_requests")
            .select("*, items:request_items(*)")
            .eq("id", payload.new.id)
            .single();

          if (!error && data) {
            setPendingRequests((prev) => [data as unknown as RequestWithItems, ...prev]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Handle Accepting a Pending Request
  const handleAccept = async (requestId: string) => {
    setIsAccepting(requestId);
    try {
      const supabase = createClient();
      const success = await acceptRequest(supabase, requestId, runnerId);
      if (success) {
        setPendingRequests((prev) => prev.filter((r) => r.id !== requestId));
        setSelectedRequest(null);
        setActiveTab("active");
        router.refresh();
      } else {
        alert("Failed to accept request. It might have been taken by another runner.");
        setPendingRequests((prev) => prev.filter((r) => r.id !== requestId));
      }
    } catch (error) {
      console.error(error);
      alert("An unexpected error occurred.");
    } finally {
      setIsAccepting(null);
    }
  };

  // Handle Status Update (accepted -> picked_up -> in_transit -> delivered)
  const handleStatusUpdate = async (
    requestId: string,
    newStatus: Database["public"]["Enums"]["request_status"]
  ) => {
    setIsUpdatingStatus(requestId);
    try {
      const supabase = createClient();
      const success = await updateRequestStatus(supabase, requestId, newStatus);
      if (success) {
        if (newStatus === "delivered" || newStatus === "cancelled") {
          // Move from active to history
          const target = activeDeliveries.find((a) => a.request.id === requestId);
          if (target) {
            setActiveDeliveries((prev) => prev.filter((a) => a.request.id !== requestId));
            setDeliveryHistory((prev) => [
              {
                ...target,
                request: { ...target.request, status: newStatus },
                status: newStatus === "delivered" ? "completed" : "cancelled",
                completed_at: new Date().toISOString(),
              },
              ...prev,
            ]);
          }
        } else {
          // Update in-place
          setActiveDeliveries((prev) =>
            prev.map((a) =>
              a.request.id === requestId
                ? { ...a, request: { ...a.request, status: newStatus } }
                : a
            )
          );
        }
        setSelectedRequest(null);
        router.refresh();
      } else {
        alert("Failed to update status.");
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred updating status.");
    } finally {
      setIsUpdatingStatus(null);
    }
  };

  // Helper for next action button
  const getNextStatusAction = (currentStatus: Database["public"]["Enums"]["request_status"]) => {
    switch (currentStatus) {
      case "accepted":
        return { label: "Mark Picked Up", nextStatus: "picked_up" as const };
      case "picked_up":
        return { label: "Start Transit", nextStatus: "in_transit" as const };
      case "in_transit":
        return { label: "Mark Delivered", nextStatus: "delivered" as const };
      default:
        return null;
    }
  };

  // Calculate total earnings from delivered requests
  const totalEarnings = deliveryHistory
    .filter((h) => h.request.status === "delivered" || h.status === "completed")
    .reduce((sum, h) => sum + (Number(h.request.delivery_fee) || 0), 0);

  return (
    <div className="space-y-6">
      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b pb-4">
        <Button
          variant={activeTab === "available" ? "primary" : "secondary"}
          onClick={() => setActiveTab("available")}
          className="relative"
        >
          <Package className="w-4 h-4 mr-2" />
          Available Requests
          {pendingRequests.length > 0 && (
            <Badge variant="accent" className="ml-2 px-1.5 py-0.5 text-xs">
              {pendingRequests.length}
            </Badge>
          )}
        </Button>

        <Button
          variant={activeTab === "active" ? "primary" : "secondary"}
          onClick={() => setActiveTab("active")}
          className="relative"
        >
          <Clock className="w-4 h-4 mr-2" />
          My Active Deliveries
          {activeDeliveries.length > 0 && (
            <Badge variant="primary" className="ml-2 px-1.5 py-0.5 text-xs">
              {activeDeliveries.length}
            </Badge>
          )}
        </Button>

        <Button
          variant={activeTab === "history" ? "primary" : "secondary"}
          onClick={() => setActiveTab("history")}
        >
          <History className="w-4 h-4 mr-2" />
          Delivery History
        </Button>
      </div>

      {/* ───────────────────────────────────────────────────────────────────────────── */}
      {/* TAB 1: AVAILABLE REQUESTS */}
      {/* ───────────────────────────────────────────────────────────────────────────── */}
      {activeTab === "available" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold tracking-tight">Available Requests ({pendingRequests.length})</h2>
          </div>

          {pendingRequests.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
                <p className="text-muted-foreground font-medium">No pending requests available right now.</p>
                <p className="text-xs text-muted-foreground mt-1">New requests will appear automatically.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {pendingRequests.map((req) => (
                <Card key={req.id} className="flex flex-col justify-between hover:border-primary/50 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <RequestStatusBadge status={req.status} />
                      <span className="text-xl font-extrabold text-primary flex items-center">
                        <IndianRupee className="w-4 h-4 mr-0.5" />
                        {req.delivery_fee}
                      </span>
                    </div>
                    <CardTitle className="text-lg truncate mt-2">
                      {req.items.map((i) => i.name).join(", ")}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-3 text-sm flex-1">
                    <div className="flex items-start text-muted-foreground">
                      <MapPin className="w-4 h-4 mr-2 mt-0.5 shrink-0 text-muted-foreground" />
                      <div>
                        <span className="font-semibold text-foreground">Pickup: </span>
                        {req.pickup_location}
                      </div>
                    </div>

                    <div className="flex items-start text-muted-foreground">
                      <MapPin className="w-4 h-4 mr-2 mt-0.5 shrink-0 text-primary" />
                      <div>
                        <span className="font-semibold text-foreground">Dropoff: </span>
                        {req.dropoff_location}
                      </div>
                    </div>

                    <div className="flex items-center text-xs text-muted-foreground pt-1">
                      <Clock className="w-3.5 h-3.5 mr-1" />
                      Posted {formatDistanceToNow(new Date(req.created_at))} ago
                    </div>
                  </CardContent>

                  <CardFooter className="flex gap-2 pt-3 border-t">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="flex-1"
                      onClick={() => setSelectedRequest(req)}
                    >
                      <Eye className="w-4 h-4 mr-1.5" /> Details
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 font-semibold"
                      onClick={() => handleAccept(req.id)}
                      disabled={isAccepting === req.id}
                    >
                      {isAccepting === req.id ? "Accepting..." : "Accept Request"}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────────────────── */}
      {/* TAB 2: MY ACTIVE DELIVERIES */}
      {/* ───────────────────────────────────────────────────────────────────────────── */}
      {activeTab === "active" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold tracking-tight">
              My Active Deliveries ({activeDeliveries.length})
            </h2>
          </div>

          {activeDeliveries.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
                <p className="text-muted-foreground font-medium">You have no active deliveries right now.</p>
                <Button variant="secondary" className="mt-4" onClick={() => setActiveTab("available")}>
                  Browse Available Requests
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {activeDeliveries.map((assignment) => {
                const req = assignment.request;
                const action = getNextStatusAction(req.status);

                return (
                  <Card key={assignment.id} className="border-primary shadow-sm flex flex-col justify-between">
                    <CardHeader className="pb-3 border-b bg-secondary/10">
                      <div className="flex justify-between items-center">
                        <RequestStatusBadge status={req.status} />
                        <span className="text-lg font-extrabold text-primary flex items-center">
                          <IndianRupee className="w-4 h-4 mr-0.5" />
                          {req.delivery_fee}
                        </span>
                      </div>
                      <CardTitle className="text-lg truncate mt-2">
                        {req.items.map((i) => i.name).join(", ")}
                      </CardTitle>
                    </CardHeader>

                    <CardContent className="pt-4 space-y-3 text-sm flex-1">
                      <div className="flex items-start">
                        <MapPin className="w-4 h-4 mr-2 mt-0.5 shrink-0 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground font-semibold uppercase">1. Pickup At</p>
                          <p className="font-semibold">{req.pickup_location}</p>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <MapPin className="w-4 h-4 mr-2 mt-0.5 shrink-0 text-primary" />
                        <div>
                          <p className="text-xs text-muted-foreground font-semibold uppercase">2. Deliver To</p>
                          <p className="font-semibold text-primary">{req.dropoff_location}</p>
                        </div>
                      </div>

                      {req.instructions && (
                        <div className="p-2.5 bg-secondary/30 rounded-md text-xs text-muted-foreground">
                          <strong>Note:</strong> {req.instructions}
                        </div>
                      )}
                    </CardContent>

                    <CardFooter className="flex gap-2 pt-3 border-t bg-secondary/5">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setSelectedRequest(req)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      {action && (
                        <Button
                          className="flex-1 font-semibold"
                          onClick={() => handleStatusUpdate(req.id, action.nextStatus)}
                          disabled={isUpdatingStatus === req.id}
                        >
                          {isUpdatingStatus === req.id ? "Updating..." : action.label}
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────────────────── */}
      {/* TAB 3: DELIVERY HISTORY */}
      {/* ───────────────────────────────────────────────────────────────────────────── */}
      {activeTab === "history" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight">
              Delivery History ({deliveryHistory.length})
            </h2>
            <div className="text-sm font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/20 flex items-center">
              Total Earned: <IndianRupee className="w-3.5 h-3.5 ml-1" /> {totalEarnings}
            </div>
          </div>

          {deliveryHistory.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <History className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
                <p className="text-muted-foreground font-medium">No past delivery history yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {deliveryHistory.map((assignment) => {
                const req = assignment.request;
                const isDelivered = req.status === "delivered" || assignment.status === "completed";

                return (
                  <Card key={assignment.id} className="flex flex-col sm:flex-row justify-between sm:items-center p-4 gap-4">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <RequestStatusBadge status={req.status} />
                        <span className="text-xs text-muted-foreground">
                          {assignment.completed_at
                            ? `Completed ${format(new Date(assignment.completed_at), "MMM d, h:mm a")}`
                            : `Assigned ${format(new Date(assignment.assigned_at), "MMM d, h:mm a")}`}
                        </span>
                      </div>
                      <h4 className="font-semibold text-base">
                        {req.items.map((i) => i.name).join(", ")}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        From: <span className="font-medium text-foreground">{req.pickup_location}</span> ➔ To:{" "}
                        <span className="font-medium text-foreground">{req.dropoff_location}</span>
                      </p>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-3 sm:pt-0">
                      <div className="text-right">
                        <span className={`text-lg font-bold flex items-center justify-end ${isDelivered ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"}`}>
                          <IndianRupee className="w-4 h-4 mr-0.5" />
                          {req.delivery_fee}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {isDelivered ? "Earned" : "Cancelled"}
                        </span>
                      </div>

                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setSelectedRequest(req)}
                      >
                        <Eye className="w-4 h-4 mr-1" /> Details
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────────────────── */}
      {/* REQUEST DETAILS MODAL */}
      {/* ───────────────────────────────────────────────────────────────────────────── */}
      <Modal open={selectedRequest !== null} onOpenChange={(open) => !open && setSelectedRequest(null)}>
        {selectedRequest && (
          <ModalContent size="lg">
            <ModalHeader>
              <div className="flex justify-between items-center pr-6">
                <div>
                  <ModalTitle>Request Details</ModalTitle>
                  <ModalDescription>ID: #{selectedRequest.id.substring(0, 8).toUpperCase()}</ModalDescription>
                </div>
                <RequestStatusBadge status={selectedRequest.status} />
              </div>
            </ModalHeader>

            <ModalBody className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4 p-3 bg-secondary/20 rounded-lg border">
                <div>
                  <p className="text-xs text-muted-foreground font-semibold uppercase">Reward / Fee</p>
                  <p className="text-xl font-extrabold text-primary flex items-center mt-0.5">
                    <IndianRupee className="w-5 h-5 mr-0.5" />
                    {selectedRequest.delivery_fee}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-semibold uppercase">Posted</p>
                  <p className="font-semibold mt-1">
                    {format(new Date(selectedRequest.created_at), "MMM d, yyyy 'at' h:mm a")}
                  </p>
                </div>
              </div>

              <div className="space-y-2 border-t pt-3">
                <div className="flex items-start">
                  <MapPin className="w-4 h-4 mr-2 mt-0.5 shrink-0 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground font-semibold uppercase">Pickup Location</p>
                    <p className="font-semibold text-base">{selectedRequest.pickup_location}</p>
                  </div>
                </div>

                <div className="flex items-start pt-2">
                  <MapPin className="w-4 h-4 mr-2 mt-0.5 shrink-0 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground font-semibold uppercase">Dropoff Location</p>
                    <p className="font-semibold text-base text-primary">{selectedRequest.dropoff_location}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 border-t pt-3">
                <p className="font-semibold flex items-center text-sm">
                  <Package className="w-4 h-4 mr-2 text-primary" /> Requested Items ({selectedRequest.items.length})
                </p>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {selectedRequest.items.map((item) => (
                    <div key={item.id} className="flex justify-between p-2.5 bg-secondary/30 rounded-md border text-sm">
                      <span className="font-medium">{item.name}</span>
                      <span className="text-muted-foreground font-semibold">Qty: {item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>

              {selectedRequest.instructions && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs text-amber-700 dark:text-amber-300">
                  <strong>Special Instructions:</strong> {selectedRequest.instructions}
                </div>
              )}
            </ModalBody>

            <ModalFooter className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setSelectedRequest(null)}>
                Close
              </Button>
              {selectedRequest.status === "pending" && (
                <Button
                  onClick={() => handleAccept(selectedRequest.id)}
                  disabled={isAccepting === selectedRequest.id}
                >
                  {isAccepting === selectedRequest.id ? "Accepting..." : "Accept Request"}
                </Button>
              )}
            </ModalFooter>
          </ModalContent>
        )}
      </Modal>
    </div>
  );
}
