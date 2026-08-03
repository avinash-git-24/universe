"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Search, Eye, MapPin, Package, IndianRupee, Bike } from "lucide-react";
import { AdminPlatformRequest, AdminProfile } from "@/lib/database/admin";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RequestStatusBadge } from "@/components/request/RequestStatusBadge";
import { RequestTimeline } from "@/components/request/RequestTimeline";
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
import { updateRequestStatus, acceptRequest } from "@/lib/database/requests";
import type { Database } from "@/types/database";

interface DeliveriesTableProps {
  requests: AdminPlatformRequest[];
  availableRunners?: AdminProfile[];
}

type RequestStatus = Database["public"]["Enums"]["request_status"];

const STATUS_ORDER: Record<RequestStatus, number> = {
  pending: 1,
  accepted: 2,
  picked_up: 3,
  in_transit: 4,
  delivered: 5,
  cancelled: 6,
};

export function DeliveriesTable({ requests: initialRequests, availableRunners = [] }: DeliveriesTableProps) {
  const router = useRouter();
  const [requestsList, setRequestsList] = useState<AdminPlatformRequest[]>(initialRequests);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "status">("newest");
  const [selectedRequest, setSelectedRequest] = useState<AdminPlatformRequest | null>(null);
  const [selectedRunnerId, setSelectedRunnerId] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState(false);

  // Sync state if props change
  const [prevRequests, setPrevRequests] = useState(initialRequests);
  if (prevRequests !== initialRequests) {
    setPrevRequests(initialRequests);
    setRequestsList(initialRequests);
  }

  // Filter & Search & Sort Logic
  const filteredRequests = useMemo(() => {
    return requestsList
      .filter((req) => {
        // Status filter
        if (statusFilter !== "all" && req.status !== statusFilter) return false;

        // Search query across Student Name, Runner Name, Pickup, Drop, Request ID
        if (searchQuery.trim() !== "") {
          const q = searchQuery.toLowerCase();
          const activeAssignment = req.assignments?.find((a) => a.status === "active" || a.status === "completed");
          const runnerName = activeAssignment?.runner?.full_name || "";

          const matchPickup = req.pickup_location.toLowerCase().includes(q);
          const matchDropoff = req.dropoff_location.toLowerCase().includes(q);
          const matchId = req.id.toLowerCase().includes(q);
          const matchStudent = (req.requester?.full_name || "").toLowerCase().includes(q);
          const matchRunner = runnerName.toLowerCase().includes(q);

          if (!matchPickup && !matchDropoff && !matchId && !matchStudent && !matchRunner) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "status") {
          return (STATUS_ORDER[a.status] || 99) - (STATUS_ORDER[b.status] || 99);
        }
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return sortBy === "newest" ? dateB - dateA : dateA - dateB;
      });
  }, [requestsList, statusFilter, searchQuery, sortBy]);

  // Handle Quick Admin Status Update
  const handleQuickStatusUpdate = async (requestId: string, newStatus: RequestStatus) => {
    setIsUpdating(true);
    try {
      const supabase = createClient();
      const success = await updateRequestStatus(supabase, requestId, newStatus);
      if (success) {
        setRequestsList((prev) =>
          prev.map((r) => (r.id === requestId ? { ...r, status: newStatus } : r))
        );
        if (selectedRequest?.id === requestId) {
          setSelectedRequest((prev) => (prev ? { ...prev, status: newStatus } : null));
        }
        router.refresh();
      } else {
        alert("Failed to update status.");
      }
    } catch (error) {
      console.error(error);
      alert("Error updating status.");
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle Admin Assigning a Runner
  const handleAssignRunner = async (requestId: string) => {
    if (!selectedRunnerId) {
      alert("Please select a runner first.");
      return;
    }
    setIsUpdating(true);
    try {
      const supabase = createClient();
      const success = await acceptRequest(supabase, requestId, selectedRunnerId);
      if (success) {
        setRequestsList((prev) =>
          prev.map((r) => (r.id === requestId ? { ...r, status: "accepted" } : r))
        );
        setSelectedRequest(null);
        setSelectedRunnerId("");
        router.refresh();
      } else {
        alert("Failed to assign runner.");
      }
    } catch (error) {
      console.error(error);
      alert("Error assigning runner.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Controls: Search, Filter, Sort */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by student, runner, pickup, or drop..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-10"
          />
        </div>

        <div className="flex flex-wrap sm:flex-nowrap gap-2 w-full sm:w-auto">
          <select
            className="h-10 px-3 border rounded-md bg-background text-sm flex-1 sm:flex-initial"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="picked_up">Picked Up</option>
            <option value="in_transit">In Transit</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            className="h-10 px-3 border rounded-md bg-background text-sm flex-1 sm:flex-initial"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "newest" | "oldest" | "status")}
          >
            <option value="newest">Sort by Newest</option>
            <option value="oldest">Sort by Oldest</option>
            <option value="status">Sort by Status</option>
          </select>
        </div>
      </div>

      {/* Deliveries Table */}
      <div className="rounded-lg border bg-card overflow-hidden overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-secondary/50 text-muted-foreground uppercase text-xs">
            <tr>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Student</th>
              <th className="px-4 py-3 font-semibold">Runner</th>
              <th className="px-4 py-3 font-semibold">Pickup ➔ Drop</th>
              <th className="px-4 py-3 font-semibold">Created Date</th>
              <th className="px-4 py-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredRequests.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                  <Package className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
                  <p className="font-semibold text-base">No requests match criteria</p>
                  <p className="text-xs mt-1">Try adjusting your search terms or status filters.</p>
                </td>
              </tr>
            ) : (
              filteredRequests.map((req) => {
                const activeAssignment = req.assignments?.find(
                  (a) => a.status === "active" || a.status === "completed"
                );
                const runnerName = activeAssignment?.runner?.full_name || "Unassigned";

                return (
                  <tr key={req.id} className="hover:bg-secondary/20 transition-colors">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <RequestStatusBadge status={req.status} className="text-xs py-0.5 px-2.5" />
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-semibold text-foreground">
                        {req.requester?.full_name || `Student #${req.requester_id.substring(0, 6)}`}
                      </p>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Bike className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        <span className={runnerName === "Unassigned" ? "text-muted-foreground italic" : "font-medium"}>
                          {runnerName}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 max-w-[220px]">
                      <div className="truncate text-xs">
                        <span className="text-muted-foreground">{req.pickup_location}</span>
                        <span className="mx-1 text-primary">➔</span>
                        <span className="font-medium text-foreground">{req.dropoff_location}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-muted-foreground whitespace-nowrap text-xs">
                      {format(new Date(req.created_at), "MMM d, h:mm a")}
                    </td>
                    <td className="px-4 py-4 text-right whitespace-nowrap">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="gap-1 text-xs"
                        onClick={() => {
                          setSelectedRequest(req);
                          setSelectedRunnerId("");
                        }}
                      >
                        <Eye className="w-3.5 h-3.5" /> View
                      </Button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ───────────────────────────────────────────────────────────────────────────── */}
      {/* REQUEST DETAILS & QUICK ADMIN ACTIONS MODAL */}
      {/* ───────────────────────────────────────────────────────────────────────────── */}
      <Modal open={selectedRequest !== null} onOpenChange={(open) => !open && setSelectedRequest(null)}>
        {selectedRequest && (
          <ModalContent size="lg">
            <ModalHeader>
              <div className="flex justify-between items-center pr-6">
                <div>
                  <ModalTitle>Admin Request Overview</ModalTitle>
                  <ModalDescription>ID: #{selectedRequest.id.substring(0, 8).toUpperCase()}</ModalDescription>
                </div>
                <RequestStatusBadge status={selectedRequest.status} />
              </div>
            </ModalHeader>

            <ModalBody className="space-y-6 text-sm">
              {/* Progress Timeline */}
              <div className="pt-2 pb-4 border-b">
                <RequestTimeline status={selectedRequest.status} />
              </div>

              {/* Reward & Created Date */}
              <div className="grid grid-cols-2 gap-4 p-3 bg-secondary/20 rounded-lg border">
                <div>
                  <p className="text-xs text-muted-foreground font-semibold uppercase">Reward Amount</p>
                  <p className="text-xl font-extrabold text-primary flex items-center mt-0.5">
                    <IndianRupee className="w-5 h-5 mr-0.5" />
                    {selectedRequest.delivery_fee}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-semibold uppercase">Created At</p>
                  <p className="font-semibold mt-1">
                    {format(new Date(selectedRequest.created_at), "MMM d, yyyy 'at' h:mm a")}
                  </p>
                </div>
              </div>

              {/* Route Locations */}
              <div className="space-y-3">
                <div className="flex items-start">
                  <MapPin className="w-4 h-4 mr-2 mt-0.5 shrink-0 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground font-semibold uppercase">Pickup Location</p>
                    <p className="font-semibold text-base">{selectedRequest.pickup_location}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <MapPin className="w-4 h-4 mr-2 mt-0.5 shrink-0 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground font-semibold uppercase">Dropoff Location</p>
                    <p className="font-semibold text-base text-primary">{selectedRequest.dropoff_location}</p>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div className="space-y-2 border-t pt-3">
                <p className="font-semibold flex items-center text-sm">
                  <Package className="w-4 h-4 mr-2 text-primary" /> Requested Items ({selectedRequest.items.length})
                </p>
                <div className="space-y-2 max-h-36 overflow-y-auto">
                  {selectedRequest.items.map((item) => (
                    <div key={item.id} className="flex justify-between p-2.5 bg-secondary/30 rounded-md border text-sm">
                      <span className="font-medium">{item.name}</span>
                      <span className="text-muted-foreground font-semibold">Qty: {item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Student & Runner Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t pt-3">
                <div className="p-3 bg-secondary/10 rounded-lg border space-y-1">
                  <p className="text-xs text-muted-foreground font-semibold uppercase">Student (Requester)</p>
                  <p className="font-semibold text-foreground">
                    {selectedRequest.requester?.full_name || `Student #${selectedRequest.requester_id.substring(0, 6)}`}
                  </p>
                </div>

                <div className="p-3 bg-secondary/10 rounded-lg border space-y-1">
                  <p className="text-xs text-muted-foreground font-semibold uppercase">Assigned Runner</p>
                  {(() => {
                    const activeAssign = selectedRequest.assignments?.find((a) => a.status === "active" || a.status === "completed");
                    if (activeAssign?.runner) {
                      return <p className="font-semibold text-foreground">{activeAssign.runner.full_name}</p>;
                    }
                    if (selectedRequest.status === "pending" && availableRunners.length > 0) {
                      return (
                        <div className="pt-1 flex gap-2">
                          <select
                            className="h-8 px-2 border rounded bg-background text-xs w-full"
                            value={selectedRunnerId}
                            onChange={(e) => setSelectedRunnerId(e.target.value)}
                          >
                            <option value="">Select a Runner...</option>
                            {availableRunners.map((r) => (
                              <option key={r.id} value={r.id}>
                                {r.full_name || r.id.substring(0, 8)}
                              </option>
                            ))}
                          </select>
                          <Button
                            size="sm"
                            className="h-8 text-xs shrink-0"
                            onClick={() => handleAssignRunner(selectedRequest.id)}
                            disabled={!selectedRunnerId || isUpdating}
                          >
                            Assign
                          </Button>
                        </div>
                      );
                    }
                    return <p className="text-muted-foreground italic">Unassigned</p>;
                  })()}
                </div>
              </div>

              {/* Quick Admin Actions Toolbar */}
              <div className="space-y-2 border-t pt-3">
                <p className="text-xs font-semibold uppercase text-muted-foreground">Quick Admin Actions</p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={selectedRequest.status !== "accepted" || isUpdating}
                    onClick={() => handleQuickStatusUpdate(selectedRequest.id, "picked_up")}
                  >
                    Mark Picked Up
                  </Button>

                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={selectedRequest.status !== "picked_up" || isUpdating}
                    onClick={() => handleQuickStatusUpdate(selectedRequest.id, "in_transit")}
                  >
                    Start Transit
                  </Button>

                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={selectedRequest.status !== "in_transit" || isUpdating}
                    onClick={() => handleQuickStatusUpdate(selectedRequest.id, "delivered")}
                  >
                    Mark Delivered
                  </Button>

                  <Button
                    size="sm"
                    variant="destructive"
                    disabled={selectedRequest.status === "delivered" || selectedRequest.status === "cancelled" || isUpdating}
                    onClick={() => handleQuickStatusUpdate(selectedRequest.id, "cancelled")}
                  >
                    Cancel Request
                  </Button>
                </div>
              </div>
            </ModalBody>

            <ModalFooter>
              <Button variant="secondary" onClick={() => setSelectedRequest(null)}>
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        )}
      </Modal>
    </div>
  );
}
