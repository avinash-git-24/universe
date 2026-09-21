"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { differenceInHours, format } from "date-fns";
import { MapPin, Package, Clock, IndianRupee, MessageSquare, CheckCircle2, History, AlertCircle, Search, SlidersHorizontal, Radio, AlertTriangle, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Database } from "@/types/database";
import { cancelMultipleRequests, getStudentRequests, type StudentRequestWithDetails } from "@/lib/database/requests";
import { createClient } from "@/lib/supabase/client";
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
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const tabParam = searchParams.get("tab") as CategoryTab | null;
  const initialTab: CategoryTab =
    tabParam && ["active", "completed", "cancelled", "all"].includes(tabParam)
      ? tabParam
      : "active";

  const [requests, setRequests] = useState<StudentRequestWithDetails[]>(initialRequests);
  const [activeTab, setActiveTab] = useState<CategoryTab>(initialTab);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<RequestStatus | "all">("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRequest, setSelectedRequest] = useState<StudentRequestWithDetails | null>(null);
  const [isBulkCancelling, setIsBulkCancelling] = useState(false);

  // Sync tab with URL search params (e.g. ?tab=cancelled)
  useEffect(() => {
    const tab = searchParams.get("tab") as CategoryTab | null;
    if (tab && ["active", "completed", "cancelled", "all"].includes(tab)) {
      setActiveTab(tab);
      setStatusFilter("all");
      setCurrentPage(1);
    }
  }, [searchParams]);

  // Sync with initialRequests when prop updates
  useEffect(() => {
    setRequests(initialRequests);
  }, [initialRequests]);

  // Realtime Supabase updates: auto-refresh when runner accepts or status changes
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("student_requests_list_realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "delivery_requests" },
        async () => {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const fresh = await getStudentRequests(supabase, user.id);
            setRequests(fresh);
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "delivery_assignments" },
        async () => {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const fresh = await getStudentRequests(supabase, user.id);
            setRequests(fresh);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Category counts
  const counts = useMemo(() => {
    const active = requests.filter((r) =>
      ["pending", "accepted", "picked_up", "in_transit"].includes(r.status)
    ).length;
    const completed = requests.filter((r) => r.status === "delivered").length;
    const cancelled = requests.filter((r) => r.status === "cancelled").length;
    return { active, completed, cancelled, all: requests.length };
  }, [requests]);

  // Active in-flight requests (sort newest first so recent orders take priority)
  const activeRequests = useMemo(() => {
    return requests
      .filter((r) => ["pending", "accepted", "picked_up", "in_transit"].includes(r.status))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [requests]);

  // Detect stale unfulfilled requests: pending > 2h old or accepted > 12h old
  const staleRequests = useMemo(() => {
    return requests.filter((r) => {
      const hoursOld = differenceInHours(new Date(), new Date(r.created_at));
      if (r.status === "pending" && hoursOld >= 2) return true;
      if (["accepted", "picked_up", "in_transit"].includes(r.status) && hoursOld >= 12) return true;
      return false;
    });
  }, [requests]);

  const handleCardCancelSuccess = (requestId: string) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: "cancelled" } : r))
    );
    if (selectedRequest && selectedRequest.id === requestId) {
      setSelectedRequest((prev) => prev ? { ...prev, status: "cancelled" } : null);
    }
  };

  const handleCancelAllStale = async () => {
    if (staleRequests.length === 0) return;

    if (
      !window.confirm(
        `Are you sure you want to cancel all ${staleRequests.length} stale / unfulfilled requests? This will clean up your active delivery dashboard.`
      )
    ) {
      return;
    }

    setIsBulkCancelling(true);
    try {
      const supabase = createClient();
      const ids = staleRequests.map((r) => r.id);
      const success = await cancelMultipleRequests(supabase, ids);
      if (success) {
        setRequests((prev) =>
          prev.map((r) => (ids.includes(r.id) ? { ...r, status: "cancelled" } : r))
        );
        alert(`Success! ${staleRequests.length} stale requests have been cancelled.`);
      } else {
        alert("Failed to cancel requests. Please try again.");
      }
    } catch (err) {
      console.error("Error bulk cancelling requests:", err);
      alert("Error occurred while cancelling stale requests.");
    } finally {
      setIsBulkCancelling(false);
    }
  };

  // Filter and Search Logic
  const filteredRequests = useMemo(() => {
    return requests
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
  }, [requests, activeTab, statusFilter, searchQuery, sortBy]);

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
    router.replace(`${pathname}?tab=${tab}`, { scroll: false });
  };

  const handleFilterChange = (status: RequestStatus | "all") => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* ── Active Order Live Radar HUD Banner (Pinned so user can return anytime) ── */}
      {activeRequests.length > 0 && (
        <div className="relative overflow-hidden p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-[#0a1e12] to-emerald-950/80 border-2 border-emerald-500/40 shadow-[0_0_35px_rgba(0,230,118,0.18)]">
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-[#00E676] shadow-[0_0_15px_rgba(0,230,118,0.25)]">
                <Radio className="h-5 w-5 animate-pulse" />
                <span className="animate-ping absolute -top-1 -right-1 h-3 w-3 rounded-full bg-emerald-400 opacity-75" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] sm:text-[11px] font-mono font-black text-[#00E676] uppercase tracking-wider bg-emerald-500/15 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                    ● Live Radar Active
                  </span>
                  <span className="text-xs text-white/50 font-mono">
                    ID: #{activeRequests[0].id.substring(0, 8).toUpperCase()}
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-extrabold text-white">
                  {activeRequests[0].items?.map((i) => i.name).join(", ") || "Delivery Request"}
                </h3>
                <p className="text-xs text-slate-300">
                  {activeRequests[0].status === "pending"
                    ? "Broadcasting on campus radar... Tap to view live radar & see if any student runner accepts."
                    : activeRequests[0].status === "accepted"
                    ? "Runner matched! Tap to track delivery progress in real time."
                    : "Runner is on the way! Tap to track live order on campus map."}
                </p>
              </div>
            </div>

            <Link
              href={`/dashboard/requests/${activeRequests[0].id}`}
              className="w-full sm:w-auto shrink-0 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#00E676] hover:bg-emerald-400 text-[#041208] font-black text-xs sm:text-sm shadow-[0_0_20px_rgba(0,230,118,0.4)] hover:shadow-[0_0_30px_rgba(0,230,118,0.6)] transition-all active:scale-95 whitespace-nowrap cursor-pointer"
            >
              <Radio className="w-4 h-4 text-black animate-pulse" />
              <span>Open Live Radar Screen ➔</span>
            </Link>
          </div>
        </div>
      )}

      {/* ── Stale Orders Warning & Bulk Cleanup Banner ── */}
      {staleRequests.length > 0 && (activeTab === "active" || activeTab === "all") && (
        <div className="relative overflow-hidden p-3.5 sm:p-4 rounded-2xl bg-amber-950/30 border border-amber-500/35 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-[0_0_25px_rgba(245,158,11,0.08)]">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" />
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs sm:text-sm font-bold text-amber-300">
                  {staleRequests.length} Stale / Unfulfilled Requests Detected
                </span>
                <span className="text-[10px] font-mono text-amber-400/90 bg-amber-500/15 px-2 py-0.5 rounded border border-amber-500/30">
                  Stale Orders
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-zinc-300 leading-relaxed">
                These orders were not accepted or delivered by any campus runner. Cancel them in 1-click to clean up your active orders list.
              </p>
            </div>
          </div>

          <Button
            type="button"
            onClick={handleCancelAllStale}
            disabled={isBulkCancelling}
            className="w-full sm:w-auto shrink-0 bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 hover:text-red-200 font-bold text-xs gap-1.5 py-2 px-4 rounded-xl cursor-pointer active:scale-95 transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{isBulkCancelling ? "Cancelling..." : `Cancel All ${staleRequests.length} Stale Orders`}</span>
          </Button>
        </div>
      )}

      {/* Category Tabs (Single row horizontal scroll on mobile) */}
      <div className="flex items-center gap-2 sm:gap-3 pb-2 sm:pb-5 overflow-x-auto no-scrollbar scrollbar-none">
        <button
          className={cn(
            "shrink-0 flex items-center px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 border",
            activeTab === "active" 
              ? "bg-[#082a18]/40 border-emerald-500/40 text-emerald-400"
              : "bg-transparent border-[#1c2420] text-white/50 hover:border-white/20 hover:text-white/80"
          )}
          onClick={() => handleTabChange("active")}
        >
          <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
          Active
          <span className={cn(
            "ml-2 px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold min-w-[20px]",
            activeTab === "active" ? "bg-emerald-500 text-[#0a0f0d]" : "bg-[#1c2420] text-white/50"
          )}>
            {counts.active}
          </span>
        </button>

        <button
          className={cn(
            "shrink-0 flex items-center px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 border",
            activeTab === "completed" 
              ? "bg-white/5 border-white/30 text-white"
              : "bg-transparent border-[#1c2420] text-white/50 hover:border-white/20 hover:text-white/80"
          )}
          onClick={() => handleTabChange("completed")}
        >
          <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
          Completed
          <span className={cn(
            "ml-2 px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold min-w-[20px]",
            activeTab === "completed" ? "bg-white/20 text-white" : "bg-[#1c2420] text-white/50"
          )}>
            {counts.completed}
          </span>
        </button>

        <button
          className={cn(
            "shrink-0 flex items-center px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 border",
            activeTab === "cancelled" 
              ? "bg-red-500/10 border-red-500/40 text-red-400"
              : "bg-transparent border-[#1c2420] text-white/50 hover:border-white/20 hover:text-white/80"
          )}
          onClick={() => handleTabChange("cancelled")}
        >
          <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
          Cancelled
          <span className={cn(
            "ml-2 px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold min-w-[20px]",
            activeTab === "cancelled" ? "bg-red-500 text-[#0a0f0d]" : "bg-[#1c2420] text-white/50"
          )}>
            {counts.cancelled}
          </span>
        </button>

        <button
          className={cn(
            "shrink-0 flex items-center px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 border",
            activeTab === "all" 
              ? "bg-white/5 border-white/30 text-white"
              : "bg-transparent border-[#1c2420] text-white/50 hover:border-white/20 hover:text-white/80"
          )}
          onClick={() => handleTabChange("all")}
        >
          <History className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
          All
          <span className={cn(
            "ml-2 px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold min-w-[20px]",
            activeTab === "all" ? "bg-white/20 text-white" : "bg-[#1c2420] text-white/50"
          )}>
            {counts.all}
          </span>
        </button>
      </div>

      {/* Controls: Search, Status Filter, Sort */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-2.5 sm:gap-4 mb-4 sm:mb-6">
        <div className="flex-1 w-full md:w-auto relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-emerald-400 transition-colors" />
          <Input
            placeholder="Search category, pickup, or dropoff location..."
            className="h-10 sm:h-11 pl-11 w-full md:max-w-xl bg-[#0c120f] border-[#1c2420] text-white placeholder:text-white/30 focus-visible:ring-1 focus-visible:ring-emerald-500/50 rounded-lg text-xs sm:text-sm transition-all"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full md:w-auto">
          {activeTab === "all" && (
            <RequestFilters currentFilter={statusFilter} onFilterChange={handleFilterChange} />
          )}
          <select
            className="h-10 sm:h-11 flex-1 sm:flex-none rounded-lg border border-[#1c2420] bg-[#0c120f] px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500/50 text-white/70 min-w-[130px] sm:min-w-[150px] transition-all"
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value as "newest" | "oldest");
              setCurrentPage(1);
            }}
          >
            <option value="newest" className="bg-[#0c120f]">Sort by Newest</option>
            <option value="oldest" className="bg-[#0c120f]">Sort by Oldest</option>
          </select>
          <Button variant="secondary" size="icon" className="h-10 sm:h-11 w-10 sm:w-11 shrink-0 bg-[#0c120f] border border-[#1c2420] hover:bg-[#151c19] hover:text-white rounded-lg text-white/70 transition-all">
            <SlidersHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Request List Cards or Empty State */}
      {filteredRequests.length === 0 ? (
        <EmptyRequests category={activeTab} showCreate={initialRequests.length === 0 || activeTab === "active"} />
      ) : (
        <div className="grid gap-3.5 sm:gap-6 lg:gap-8">
          {currentRequests.map((req) => (
            <StudentRequestCard
              key={req.id}
              request={req}
              onClick={() => setSelectedRequest(req)}
              onCancelSuccess={handleCardCancelSuccess}
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

              {/* Handover PIN Banner if Active */}
              {selectedRequest.delivery_otp && !["delivered", "cancelled"].includes(selectedRequest.status) && (
                <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                      🔐 Delivery Handover PIN
                    </span>
                    <p className="text-xs text-zinc-300">
                      Share with runner only when order is received.
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 font-mono text-lg font-black text-emerald-400 bg-black/60 px-3 py-1 rounded-lg border border-emerald-500/50 shadow-[0_0_10px_rgba(0,230,118,0.2)]">
                    {selectedRequest.delivery_otp}
                  </div>
                </div>
              )}

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
              {(() => {
                const activeAssignment = selectedRequest.assignments?.find(
                  (a) => a.status === "active" || a.status === "completed"
                );
                const selectedRunner = activeAssignment?.runner;

                if (!selectedRunner) {
                  return selectedRequest.status === "pending" ? (
                    <div className="p-3.5 bg-secondary/20 rounded-lg border border-dashed text-center text-xs text-muted-foreground">
                      Searching for available campus runners...
                    </div>
                  ) : null;
                }

                return (
                  <div className="p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/30 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center font-bold text-emerald-400 shrink-0">
                        {selectedRunner.full_name?.charAt(0) || "R"}
                      </div>
                      <div>
                        <p className="font-bold text-white text-sm">{selectedRunner.full_name || `Runner #${selectedRunner.id.substring(0, 6)}`}</p>
                        <p className="text-xs text-emerald-400/80 font-medium">
                          {selectedRequest.status === "delivered" ? "Delivered your order" : "Assigned Campus Runner"}
                        </p>
                      </div>
                    </div>

                    <Link href={`/dashboard/chat?requestId=${selectedRequest.id}&startWithUserId=${selectedRunner.id}`}>
                      <Button size="sm" className="gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold">
                        <MessageSquare className="w-4 h-4" /> Message
                      </Button>
                    </Link>
                  </div>
                );
              })()}
            </ModalBody>

            <ModalFooter className="flex flex-col sm:flex-row justify-between items-center gap-3">
              <div className="w-full sm:w-auto">
                <Link href={`/dashboard/requests/${selectedRequest.id}`} className="w-full sm:w-auto block">
                  <Button className="w-full sm:w-auto bg-[#00E676] hover:bg-emerald-400 text-[#041208] font-black text-xs sm:text-sm gap-2 shadow-[0_0_15px_rgba(0,230,118,0.3)]">
                    <Radio className="w-4 h-4 animate-pulse text-black" />
                    <span>Open Live Radar & Tracking Screen ➔</span>
                  </Button>
                </Link>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                {["pending", "accepted", "picked_up", "in_transit"].includes(selectedRequest.status) && (
                  <CancelRequestButton requestId={selectedRequest.id} />
                )}
                <Button variant="secondary" onClick={() => setSelectedRequest(null)}>
                  Close
                </Button>
              </div>
            </ModalFooter>
          </ModalContent>
        )}
      </Modal>
    </div>
  );
}
