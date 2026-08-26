"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatDistanceToNow, format } from "date-fns";
import { MapPin, Package, Clock, IndianRupee, Eye, CheckCircle2, History, Wallet, Star, LayoutGrid, List, Calendar, ArrowRight, Box, ChevronDown, MessageSquare } from "lucide-react";
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
  
  // UI State for Grid/List View
  const [isGridView, setIsGridView] = useState(true);

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
    <div className="space-y-8">
      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-3 pb-2">
        <button
          onClick={() => setActiveTab("available")}
          className={`flex items-center px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 border ${
            activeTab === "available"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
              : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white"
          }`}
        >
          <Package className="w-4 h-4 mr-2.5" />
          Available Requests
          {pendingRequests.length > 0 && (
            <span className={`ml-2.5 px-2 py-0.5 rounded-full text-xs font-bold ${activeTab === "available" ? "bg-emerald-500 text-[#0a0f0d]" : "bg-white/20 text-white"}`}>
              {pendingRequests.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("active")}
          className={`flex items-center px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 border ${
            activeTab === "active"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
              : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white"
          }`}
        >
          <Clock className="w-4 h-4 mr-2.5" />
          My Active Deliveries
          {activeDeliveries.length > 0 && (
            <span className={`ml-2.5 px-2 py-0.5 rounded-full text-xs font-bold ${activeTab === "active" ? "bg-emerald-500 text-[#0a0f0d]" : "bg-white/20 text-white"}`}>
              {activeDeliveries.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("history")}
          className={`flex items-center px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 border ${
            activeTab === "history"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
              : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white"
          }`}
        >
          <History className="w-4 h-4 mr-2.5" />
          Delivery History
        </button>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1: Available */}
        <div className="bg-[#111614] border border-white/5 rounded-2xl p-5 flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
            <Package className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <p className="text-sm text-white/60 font-medium">Available Requests</p>
            <p className="text-2xl font-bold text-white mt-0.5">{pendingRequests.length}</p>
            <p className="text-xs text-emerald-400 mt-1">New requests ready</p>
          </div>
        </div>

        {/* Stat 2: Active */}
        <div className="bg-[#111614] border border-white/5 rounded-2xl p-5 flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <p className="text-sm text-white/60 font-medium">Active Deliveries</p>
            <p className="text-2xl font-bold text-white mt-0.5">{activeDeliveries.length}</p>
            <p className="text-xs text-white/40 mt-1">In progress</p>
          </div>
        </div>

        {/* Stat 3: Earnings */}
        <div className="bg-[#111614] border border-white/5 rounded-2xl p-5 flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
            <Wallet className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <p className="text-sm text-white/60 font-medium">Today&apos;s Earnings</p>
            <p className="text-2xl font-bold text-white mt-0.5 flex items-center">
              <IndianRupee className="w-5 h-5 mr-0.5" />
              {totalEarnings}
            </p>
            <p className="text-xs text-white/40 mt-1">Current earnings</p>
          </div>
        </div>

        {/* Stat 4: Rating */}
        <div className="bg-[#111614] border border-white/5 rounded-2xl p-5 flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
            <Star className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <p className="text-sm text-white/60 font-medium">Rating</p>
            <p className="text-2xl font-bold text-white mt-0.5">4.8</p>
            <p className="text-xs text-white/40 mt-1">Excellent</p>
          </div>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────────────────────── */}
      {/* TAB 1: AVAILABLE REQUESTS */}
      {/* ───────────────────────────────────────────────────────────────────────────── */}
      {activeTab === "available" && (
        <div className="space-y-6">
          {/* Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-xl font-bold tracking-tight text-white">Available Requests ({pendingRequests.length})</h2>
            
            <div className="flex items-center gap-3 w-full sm:w-auto">
              {/* Grid/List Toggle */}
              <div className="flex items-center bg-[#111614] border border-white/10 rounded-xl p-1">
                <button 
                  onClick={() => setIsGridView(true)}
                  className={`p-2 rounded-lg transition-colors ${isGridView ? "bg-emerald-500/20 text-emerald-400" : "text-white/40 hover:text-white"}`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setIsGridView(false)}
                  className={`p-2 rounded-lg transition-colors ${!isGridView ? "bg-emerald-500/20 text-emerald-400" : "text-white/40 hover:text-white"}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              {/* Sort Dropdown */}
              <div className="relative">
                <select className="appearance-none bg-[#111614] border border-white/10 text-white/70 text-sm rounded-xl pl-4 pr-10 py-2.5 outline-none focus:border-emerald-500/50 hover:text-white transition-colors cursor-pointer w-full sm:w-auto">
                  <option>Sort by: Newest</option>
                  <option>Sort by: Oldest</option>
                  <option>Sort by: Highest Pay</option>
                </select>
                <ChevronDown className="w-4 h-4 text-white/40 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {pendingRequests.length === 0 ? (
            <div className="bg-[#111614] border border-white/5 rounded-2xl p-12 text-center">
              <Package className="w-12 h-12 mx-auto mb-4 text-white/20" />
              <p className="text-white/60 font-medium">No pending requests available right now.</p>
              <p className="text-xs text-white/40 mt-1">New requests will appear automatically.</p>
            </div>
          ) : (
            <div className={`grid gap-5 ${isGridView ? "md:grid-cols-2" : "grid-cols-1"}`}>
              {pendingRequests.map((req) => (
                <div key={req.id} className="relative overflow-hidden bg-[#0d1310] border border-white/5 rounded-2xl flex flex-col justify-between hover:border-emerald-500/30 transition-all group">
                  {/* Subtle right-side glow/icon background */}
                  <div className="absolute -right-8 -top-8 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-colors pointer-events-none" />
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 w-16 h-16 rounded-full border border-emerald-500/10 flex items-center justify-center bg-[#131b17] z-0 opacity-40">
                    <Box className="w-6 h-6 text-emerald-500/40" />
                  </div>

                  <div className="p-5 relative z-10">
                    <div className="flex justify-between items-start">
                      <div className="bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold px-2.5 py-1 rounded-full">
                        Requested
                      </div>
                      <span className="text-2xl font-bold text-white flex items-center">
                        <IndianRupee className="w-5 h-5 mr-0.5 opacity-70" />
                        {req.delivery_fee}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-white mt-4 truncate">
                      {req.items.map((i) => i.name).join(", ")}
                    </h3>

                    <div className="space-y-2 mt-4 text-sm">
                      <div className="flex items-start">
                        <MapPin className="w-4 h-4 mr-2 mt-0.5 shrink-0 text-emerald-500" />
                        <div>
                          <span className="text-white/50 font-medium">Pickup: </span>
                          <span className="text-white/90">{req.pickup_location}</span>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <MapPin className="w-4 h-4 mr-2 mt-0.5 shrink-0 text-emerald-500" />
                        <div>
                          <span className="text-white/50 font-medium">Dropoff: </span>
                          <span className="text-white/90">{req.dropoff_location}</span>
                        </div>
                      </div>

                      <div className="flex items-center text-xs text-white/40 pt-1">
                        <Calendar className="w-3.5 h-3.5 mr-1.5" />
                        Posted {formatDistanceToNow(new Date(req.created_at))} ago
                      </div>
                    </div>
                  </div>

                  <div className="p-5 pt-0 flex gap-3 relative z-10">
                    <button
                      onClick={() => setSelectedRequest(req)}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-white/10 text-white/70 hover:text-white hover:bg-white/5 transition-colors font-medium text-sm"
                    >
                      <Eye className="w-4 h-4" /> Details
                    </button>
                    <button
                      onClick={() => handleAccept(req.id)}
                      disabled={isAccepting === req.id}
                      className="flex-[1.5] flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-[#0a0f0d] font-bold text-sm transition-colors disabled:opacity-50"
                    >
                      {isAccepting === req.id ? "Accepting..." : "Accept Request"}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────────────────── */}
      {/* TAB 2: MY ACTIVE DELIVERIES */}
      {/* ───────────────────────────────────────────────────────────────────────────── */}
      {activeTab === "active" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold tracking-tight text-white">
              My Active Deliveries ({activeDeliveries.length})
            </h2>
          </div>

          {activeDeliveries.length === 0 ? (
            <div className="bg-[#111614] border border-white/5 rounded-2xl p-12 text-center">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-white/20" />
              <p className="text-white/60 font-medium">You have no active deliveries right now.</p>
              <button 
                className="mt-4 px-6 py-2.5 rounded-xl border border-white/10 text-white hover:bg-white/5 transition-colors font-medium text-sm" 
                onClick={() => setActiveTab("available")}
              >
                Browse Available Requests
              </button>
            </div>
          ) : (
            <div className={`grid gap-5 ${isGridView ? "md:grid-cols-2" : "grid-cols-1"}`}>
              {activeDeliveries.map((assignment) => {
                const req = assignment.request;
                const action = getNextStatusAction(req.status);

                return (
                  <div key={assignment.id} className="relative overflow-hidden bg-[#0d1310] border border-emerald-500/30 rounded-2xl flex flex-col justify-between hover:border-emerald-500/50 transition-all group shadow-[0_0_15px_rgba(16,185,129,0.05)]">
                    {/* Subtle right-side glow/icon background */}
                    <div className="absolute -right-8 -top-8 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl transition-colors pointer-events-none" />
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 w-16 h-16 rounded-full border border-emerald-500/20 flex items-center justify-center bg-[#131b17] z-0 opacity-40">
                      <Box className="w-6 h-6 text-emerald-500/40" />
                    </div>

                    <div className="p-5 relative z-10">
                      <div className="flex justify-between items-start">
                        <RequestStatusBadge status={req.status} />
                        <span className="text-2xl font-bold text-white flex items-center">
                          <IndianRupee className="w-5 h-5 mr-0.5 opacity-70" />
                          {req.delivery_fee}
                        </span>
                      </div>
                      
                      <h3 className="text-xl font-bold text-white mt-4 truncate">
                        {req.items.map((i) => i.name).join(", ")}
                      </h3>

                      <div className="space-y-3 mt-4 text-sm">
                        <div className="flex items-start">
                          <MapPin className="w-4 h-4 mr-2 mt-0.5 shrink-0 text-emerald-500" />
                          <div>
                            <p className="text-xs text-white/50 font-semibold uppercase">1. Pickup At</p>
                            <p className="text-white/90">{req.pickup_location}</p>
                          </div>
                        </div>

                        <div className="flex items-start">
                          <MapPin className="w-4 h-4 mr-2 mt-0.5 shrink-0 text-emerald-500" />
                          <div>
                            <p className="text-xs text-white/50 font-semibold uppercase">2. Deliver To</p>
                            <p className="text-white font-medium">{req.dropoff_location}</p>
                          </div>
                        </div>

                        {req.instructions && (
                          <div className="p-3 bg-amber-500/10 rounded-lg text-xs text-amber-500 border border-amber-500/20 mt-2">
                            <strong className="text-amber-400">Note:</strong> {req.instructions}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-5 pt-0 flex flex-wrap gap-2.5 relative z-10">
                      <button
                        onClick={() => setSelectedRequest(req)}
                        className="flex-1 min-w-[85px] flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-white/10 text-white/70 hover:text-white hover:bg-white/5 transition-colors font-medium text-xs sm:text-sm"
                      >
                        <Eye className="w-4 h-4" /> Details
                      </button>
                      <Link
                        href={`/dashboard/chat?requestId=${req.id}&startWithUserId=${req.requester_id}`}
                        className="flex-1 min-w-[85px] flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25 transition-colors font-semibold text-xs sm:text-sm shadow-[0_0_12px_rgba(16,185,129,0.15)]"
                      >
                        <MessageSquare className="w-4 h-4" /> Chat
                      </Link>
                      {action && (
                        <button
                          onClick={() => handleStatusUpdate(req.id, action.nextStatus)}
                          disabled={isUpdatingStatus === req.id}
                          className="flex-[1.4] min-w-[125px] flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-[#0a0f0d] font-bold text-xs sm:text-sm transition-colors disabled:opacity-50"
                        >
                          {isUpdatingStatus === req.id ? "Updating..." : action.label}
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
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
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-xl font-bold tracking-tight text-white">
              Delivery History ({deliveryHistory.length})
            </h2>
            <div className="text-sm font-semibold bg-emerald-500/10 text-emerald-400 px-4 py-2 rounded-full border border-emerald-500/20 flex items-center shadow-[0_0_15px_rgba(16,185,129,0.1)]">
              Total Earned: <IndianRupee className="w-4 h-4 ml-1 mr-0.5" /> {totalEarnings}
            </div>
          </div>

          {deliveryHistory.length === 0 ? (
            <div className="bg-[#111614] border border-white/5 rounded-2xl p-12 text-center">
              <History className="w-12 h-12 mx-auto mb-4 text-white/20" />
              <p className="text-white/60 font-medium">No past delivery history yet.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {deliveryHistory.map((assignment) => {
                const req = assignment.request;
                const isDelivered = req.status === "delivered" || assignment.status === "completed";

                return (
                  <div key={assignment.id} className="bg-[#0d1310] border border-white/5 rounded-2xl p-5 flex flex-col sm:flex-row justify-between sm:items-center gap-5 hover:border-white/10 transition-colors">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3">
                        <RequestStatusBadge status={req.status} />
                        <span className="text-xs text-white/40 flex items-center">
                          <Clock className="w-3.5 h-3.5 mr-1" />
                          {assignment.completed_at
                            ? `Completed ${format(new Date(assignment.completed_at), "MMM d, h:mm a")}`
                            : `Assigned ${format(new Date(assignment.assigned_at), "MMM d, h:mm a")}`}
                        </span>
                      </div>
                      <h4 className="font-bold text-lg text-white">
                        {req.items.map((i) => i.name).join(", ")}
                      </h4>
                      <p className="text-sm text-white/50">
                        From: <span className="font-medium text-white/80">{req.pickup_location}</span> ➔ To:{" "}
                        <span className="font-medium text-white/80">{req.dropoff_location}</span>
                      </p>
                    </div>

                    <div className="flex flex-row sm:flex-col items-center justify-between sm:items-end gap-3 pt-3 sm:pt-0 border-t border-white/5 sm:border-t-0">
                      <div className="text-left sm:text-right">
                        <span className={`text-xl font-bold flex items-center sm:justify-end ${isDelivered ? "text-emerald-400" : "text-white/50"}`}>
                          <IndianRupee className="w-4 h-4 mr-0.5" />
                          {req.delivery_fee}
                        </span>
                        <span className="text-xs text-white/40 block mt-0.5">
                          {isDelivered ? "Earned" : "Cancelled"}
                        </span>
                      </div>

                      <button
                        onClick={() => setSelectedRequest(req)}
                        className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-white/10 text-white/70 hover:text-white hover:bg-white/5 transition-colors font-medium text-sm"
                      >
                        <Eye className="w-4 h-4" /> Details
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Footer Banner */}
      <div className="bg-[#111614] border border-white/5 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-8">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shrink-0">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-emerald-400">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-white">Deliver more, earn more!</h3>
            <p className="text-sm text-white/50 mt-0.5">Complete deliveries on time and maintain a good rating to unlock higher earning opportunities.</p>
          </div>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/10 text-emerald-400 hover:bg-white/5 transition-colors font-semibold text-sm shrink-0 w-full sm:w-auto justify-center">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <path d="M18 20V10" />
            <path d="M12 20V4" />
            <path d="M6 20v-6" />
          </svg>
          View Performance
        </button>
      </div>

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

            <ModalFooter className="flex justify-between items-center gap-2">
              <div>
                {selectedRequest.status !== "pending" && (
                  <Link
                    href={`/dashboard/chat?requestId=${selectedRequest.id}&startWithUserId=${selectedRequest.requester_id}`}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25 transition-colors font-semibold text-sm shadow-[0_0_12px_rgba(16,185,129,0.15)]"
                  >
                    <MessageSquare className="w-4 h-4" /> Chat with Student
                  </Link>
                )}
              </div>
              <div className="flex gap-2">
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
              </div>
            </ModalFooter>
          </ModalContent>
        )}
      </Modal>
    </div>
  );
}
