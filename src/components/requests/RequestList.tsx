"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { MapPin, Package, Clock, IndianRupee, MessageSquare, CheckCircle2, History, AlertCircle, Search, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { Database } from "@/types/database";
import type { StudentRequestWithDetails } from "@/lib/database/requests";
import { StudentRequestCard } from "@/components/request/StudentRequestCard";
import { RequestFilters } from "./RequestFilters";
import { Pagination } from "./Pagination";
import { EmptyRequests } from "./EmptyRequests";
import { CancelRequestButton } from "./CancelRequestButton";
import { RequestStatusBadge } from "@/components/request/RequestStatusBadge";
import { RequestTimeline } from "@/components/request/RequestTimeline";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalBody,
  ModalFooter,
} from "@/components/ui/modal";

type RequestStatus = Database["public"]["Enums"]["request_status"];
type CategoryTab = "active" | "completed" | "cancelled" | "all";

interface RequestListProps {
  initialRequests: StudentRequestWithDetails[];
}

const ITEMS_PER_PAGE = 5;

export function RequestList({ initialRequests }: RequestListProps) {
  const [activeTab, setActiveTab] = useState<CategoryTab>("active");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<RequestStatus | "all">("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRequest, setSelectedRequest] = useState<StudentRequestWithDetails | null>(null);

  // Category counts
  const counts = useMemo(() => {
    const active = initialRequests.filter((r) =>
      ["pending", "accepted", "picked_up", "in_transit"].includes(r.status)
    ).length;
    const completed = initialRequests.filter((r) => r.status === "delivered").length;
    const cancelled = initialRequests.filter((r) => r.status === "cancelled").length;
    return { active, completed, cancelled, all: initialRequests.length };
  }, [initialRequests]);

  // Filter and Search Logic
  const filteredRequests = useMemo(() => {
    return initialRequests
      .filter((req) => {
        // Tab Category Filter
        if (activeTab === "active" && !["pending", "accepted", "picked_up", "in_transit"].includes(req.status)) {
          return false;
        }
        if (activeTab === "completed" && req.status !== "delivered") {
          return false;
        }
        if (activeTab === "cancelled" && req.status !== "cancelled") {
          return false;
        }

        // Sub-filter status
        if (statusFilter !== "all" && req.status !== statusFilter) {
          return false;
        }

        // Search Query
        if (searchQuery.trim() !== "") {
          const query = searchQuery.toLowerCase();
          const itemsMatch = req.items.some((item) => item.name.toLowerCase().includes(query));
          const pickupMatch = req.pickup_location.toLowerCase().includes(query);
          const dropoffMatch = req.dropoff_location.toLowerCase().includes(query);

          if (!itemsMatch && !pickupMatch && !dropoffMatch) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return sortBy === "newest" ? dateB - dateA : dateA - dateB;
      });
  }, [initialRequests, activeTab, statusFilter, searchQuery, sortBy]);

  // Pagination Logic
  const totalPages = Math.max(1, Math.ceil(filteredRequests.length / ITEMS_PER_PAGE));
  const currentRequests = filteredRequests.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleTabChange = (tab: CategoryTab) => {
    setActiveTab(tab);
    setStatusFilter("all");
    setCurrentPage(1);
  };

  const handleFilterChange = (status: RequestStatus | "all") => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  // Find active assignment & runner for selected modal request
  const selectedAssignment = selectedRequest?.assignments?.find(
    (a) => a.status === "active" || a.status === "completed"
  );
  const selectedRunner = selectedAssignment?.runner;

  return (
    <div className="space-y-6">
      {/* Category Tabs */}
      <div className="flex flex-wrap gap-4 pb-6">
        <button
          className={cn(
            "flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 border",
            activeTab === "active" 
              ? "bg-[#082a18]/40 border-emerald-500/40 text-emerald-400"
              : "bg-transparent border-[#1c2420] text-white/50 hover:border-white/20 hover:text-white/80"
          )}
          onClick={() => handleTabChange("active")}
        >
          <Clock className="w-4 h-4 mr-2" />
          Active Requests
          <span className={cn(
            "ml-2.5 px-2 py-0.5 rounded-full text-xs font-bold min-w-[24px]",
            activeTab === "active" ? "bg-emerald-500 text-[#0a0f0d]" : "bg-[#1c2420] text-white/50"
          )}>
            {counts.active}
          </span>
        </button>

        <button
          className={cn(
            "flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 border",
            activeTab === "completed" 
              ? "bg-white/5 border-white/30 text-white"
              : "bg-transparent border-[#1c2420] text-white/50 hover:border-white/20 hover:text-white/80"
          )}
          onClick={() => handleTabChange("completed")}
        >
          <CheckCircle2 className="w-4 h-4 mr-2" />
          Completed
          <span className={cn(
            "ml-2.5 px-2 py-0.5 rounded-full text-xs font-bold min-w-[24px]",
            activeTab === "completed" ? "bg-white/20 text-white" : "bg-[#1c2420] text-white/50"
          )}>
            {counts.completed}
          </span>
        </button>

        <button
          className={cn(
            "flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 border",
            activeTab === "cancelled" 
              ? "bg-red-500/10 border-red-500/40 text-red-400"
              : "bg-transparent border-[#1c2420] text-white/50 hover:border-white/20 hover:text-white/80"
          )}
          onClick={() => handleTabChange("cancelled")}
        >
          <AlertCircle className="w-4 h-4 mr-2" />
          Cancelled
          <span className={cn(
            "ml-2.5 px-2 py-0.5 rounded-full text-xs font-bold min-w-[24px]",
            activeTab === "cancelled" ? "bg-red-500 text-[#0a0f0d]" : "bg-[#1c2420] text-white/50"
          )}>
            {counts.cancelled}
          </span>
        </button>

        <button
          className={cn(
            "flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 border",
            activeTab === "all" 
              ? "bg-white/5 border-white/30 text-white"
              : "bg-transparent border-[#1c2420] text-white/50 hover:border-white/20 hover:text-white/80"
          )}
          onClick={() => handleTabChange("all")}
        >
          <History className="w-4 h-4 mr-2" />
          All Requests
          <span className={cn(
            "ml-2.5 px-2 py-0.5 rounded-full text-xs font-bold min-w-[24px]",
            activeTab === "all" ? "bg-white/20 text-white" : "bg-[#1c2420] text-white/50"
          )}>
            {counts.all}
          </span>
        </button>
      </div>

      {/* Controls: Search, Status Filter, Sort */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex-1 w-full md:w-auto relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-emerald-400 transition-colors" />
          <Input
            placeholder="Search by category, pickup, or delivery location..."
            className="h-11 pl-11 w-full md:max-w-xl bg-[#0c120f] border-[#1c2420] text-white placeholder:text-white/30 focus-visible:ring-1 focus-visible:ring-emerald-500/50 rounded-lg text-sm transition-all"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {activeTab === "all" && (
            <RequestFilters currentFilter={statusFilter} onFilterChange={handleFilterChange} />
          )}
          <select
            className="h-11 rounded-lg border border-[#1c2420] bg-[#0c120f] px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500/50 text-white/70 min-w-[150px] transition-all"
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value as "newest" | "oldest");
              setCurrentPage(1);
            }}
          >
            <option value="newest" className="bg-[#0c120f]">Sort by Newest</option>
            <option value="oldest" className="bg-[#0c120f]">Sort by Oldest</option>
          </select>
          <Button variant="secondary" size="icon" className="h-11 w-11 shrink-0 bg-[#0c120f] border border-[#1c2420] hover:bg-[#151c19] hover:text-white rounded-lg text-white/70 transition-all">
            <SlidersHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Request List Cards or Empty State */}
      {filteredRequests.length === 0 ? (
        <EmptyRequests category={activeTab} showCreate={initialRequests.length === 0 || activeTab === "active"} />
      ) : (
        <div className="grid gap-8">
          {currentRequests.map((req) => (
            <StudentRequestCard
              key={req.id}
              request={req}
              onClick={() => setSelectedRequest(req)}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {filteredRequests.length > ITEMS_PER_PAGE && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
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

            <ModalBody className="space-y-6 text-sm">
              {/* Progress Timeline */}
              <div className="pt-2 pb-4 border-b">
                <RequestTimeline status={selectedRequest.status} />
              </div>

              {/* Reward & Created Info */}
              <div className="grid grid-cols-2 gap-4 p-3 bg-secondary/20 rounded-lg border">
                <div>
                  <p className="text-xs text-muted-foreground font-semibold uppercase">Delivery Reward</p>
                  <p className="text-xl font-extrabold text-primary flex items-center mt-0.5">
                    <IndianRupee className="w-5 h-5 mr-0.5" />
                    {selectedRequest.delivery_fee}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-semibold uppercase">Created</p>
                  <p className="font-semibold mt-1">
                    {format(new Date(selectedRequest.created_at), "MMM d, yyyy 'at' h:mm a")}
                  </p>
                </div>
              </div>

              {/* Locations */}
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

              {/* Requested Items */}
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

              {/* Instructions */}
              {selectedRequest.instructions && (
                <div className="p-3 bg-secondary/30 rounded-lg text-xs text-muted-foreground border">
                  <strong>Special Instructions:</strong> {selectedRequest.instructions}
                </div>
              )}

              {/* Runner Info if assigned */}
              {selectedRunner && (
                <div className="p-4 bg-primary/5 rounded-lg border border-primary/20 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary shrink-0">
                      {selectedRunner.full_name?.charAt(0) || "R"}
                    </div>
                    <div>
                      <p className="font-semibold">{selectedRunner.full_name || `Runner #${selectedRunner.id.substring(0, 6)}`}</p>
                      <p className="text-xs text-muted-foreground">Assigned Runner</p>
                    </div>
                  </div>

                  <Link href={`/dashboard/chat?requestId=${selectedRequest.id}&startWithUserId=${selectedRunner.id}`}>
                    <Button size="sm" className="gap-1.5">
                      <MessageSquare className="w-4 h-4" /> Message
                    </Button>
                  </Link>
                </div>
              )}
            </ModalBody>

            <ModalFooter className="flex justify-between items-center">
              <div>
                {selectedRequest.status === "pending" && (
                  <CancelRequestButton requestId={selectedRequest.id} />
                )}
              </div>
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
