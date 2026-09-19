"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatDistanceToNow, format } from "date-fns";
import {
  MapPin, Package, Clock, IndianRupee, Eye, CheckCircle2, History, Wallet, Star,
  LayoutGrid, List, Calendar, ArrowRight, ChevronDown, MessageSquare, KeyRound,
  ShieldCheck, Bike, Sparkles, Utensils, BookOpen, Laptop, Activity, Search, X, Filter,
  Radio, Zap, Moon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { cn } from "@/lib/utils";
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
  completeDeliveryWithOtp,
  formatPublicDropoffLocation,
  RequestWithItems,
  AssignmentWithRequest
} from "@/lib/database/requests";
import { sounds } from "@/lib/audio";
import { RequestStatusBadge } from "@/components/request/RequestStatusBadge";
import type { Database } from "@/types/database";

function getRunnerCategoryIcon(names: string) {
  const lower = names.toLowerCase();
  if (
    /biskut|biscuit|kitkat|chocolate|chips|lays|kurkure|maggi|noodle|coffee|tea|burger|sandwich|food|snack|drink|coke|juice|water|pizza|puff|icecream/.test(
      lower
    )
  ) {
    return {
      icon: Utensils,
      bg: "bg-emerald-950/70 border-emerald-500/35 text-emerald-400 shadow-[inset_0_0_15px_rgba(16,185,129,0.15)]",
      label: "Food & Snack",
    };
  }
  if (/book|notes|notebook|assignment|pen|pencil|paper|print|photocopy|xerox|folder/.test(lower)) {
    return {
      icon: BookOpen,
      bg: "bg-amber-950/70 border-amber-500/35 text-amber-400 shadow-[inset_0_0_15px_rgba(245,158,11,0.15)]",
      label: "Academic",
    };
  }
  if (/laptop|phone|charger|cable|earphone|headphone|mouse|keyboard|usb|powerbank/.test(lower)) {
    return {
      icon: Laptop,
      bg: "bg-blue-950/70 border-blue-500/35 text-blue-400 shadow-[inset_0_0_15px_rgba(59,130,246,0.15)]",
      label: "Gadget",
    };
  }
  return {
    icon: Package,
    bg: "bg-[#0a2014] border-emerald-900/40 text-emerald-400 shadow-[inset_0_0_15px_rgba(16,185,129,0.1)]",
    label: "Parcel",
  };
}

function RunnerHowItWorksGuide() {
  return (
    <div className="rounded-3xl bg-gradient-to-br from-[#0c1410] via-[#09100c] to-[#070b09] border border-emerald-500/25 p-5 sm:p-7 backdrop-blur-xl shadow-[0_0_30px_rgba(16,185,129,0.06)] relative overflow-hidden">
      <div className="absolute -top-16 -right-16 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-5 sm:mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 font-bold">
              Campus Runner Playbook
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-extrabold text-white mt-0.5">
            How UniVerse Runner Works
          </h3>
        </div>
        <span className="text-xs text-white/50 font-medium">
          Earn instant pocket cash during your daily campus walks
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4">
        {/* Step 1 */}
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-emerald-500/30 transition-all flex flex-col justify-between group">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold uppercase">
                Step 1
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Radio className="w-4 h-4" />
              </div>
            </div>
            <div>
              <h4 className="font-bold text-white text-sm group-hover:text-emerald-300 transition-colors">
                Go Online When Free
              </h4>
              <p className="text-xs text-white/60 mt-1 leading-relaxed">
                Jab aap canteen, nescafe ya gate se hostel ja rahe hon, Runner Mode ON karein. Jab class me hon, to Offline rakhein.
              </p>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-white/5 text-[11px] text-emerald-400/80 font-mono">
            Zero pressure · Your own schedule
          </div>
        </div>

        {/* Step 2 */}
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-cyan-500/30 transition-all flex flex-col justify-between group">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 text-[10px] font-mono font-bold uppercase">
                Step 2
              </span>
              <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Zap className="w-4 h-4" />
              </div>
            </div>
            <div>
              <h4 className="font-bold text-white text-sm group-hover:text-cyan-300 transition-colors">
                Accept Nearby Mission
              </h4>
              <p className="text-xs text-white/60 mt-1 leading-relaxed">
                Pickup location aur hostel dropoff check karke order accept karein. Har delivery ka cash payout pehle hi dikhta hai.
              </p>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-white/5 text-[11px] text-cyan-400/80 font-mono">
            Earn ₹10 – ₹100 per quick pickup
          </div>
        </div>

        {/* Step 3 */}
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-emerald-500/30 transition-all flex flex-col justify-between group">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold uppercase">
                Step 3
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <div>
              <h4 className="font-bold text-white text-sm group-hover:text-emerald-300 transition-colors">
                Handover & Instant Cash
              </h4>
              <p className="text-xs text-white/60 mt-1 leading-relaxed">
                Item deliver karke student se 4-digit PIN lein. PIN verify hote hi paise seedha aapke UniVerse Wallet me transfer ho jayenge!
              </p>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-white/5 text-[11px] text-emerald-400/80 font-mono">
            100% tips kept · Instant Wallet payout
          </div>
        </div>
      </div>
    </div>
  );
}

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

  // OTP Verification state for completing delivery
  const [otpModalAssignment, setOtpModalAssignment] = useState<AssignmentWithRequest | null>(null);
  const [enteredOtp, setEnteredOtp] = useState<string>("");
  const [otpError, setOtpError] = useState<string | null>(null);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState<boolean>(false);

  // Track mount time for pure 6-hour expiration filtering (React 19 purity compliant)
  const [currentTime] = useState(() => Date.now());
  const [isGridView, setIsGridView] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<"all" | "food" | "academic" | "gadgets">("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "highest_pay">("newest");

  // Sync isOnline preference from localStorage after client mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("universe_runner_online");
      if (saved !== null) {
        setIsOnline(saved === "true");
      }
    } catch {
      // LocalStorage access failsafe
    }
  }, []);

  const toggleOnline = (targetState?: boolean) => {
    setIsOnline((prev) => {
      const next = typeof targetState === "boolean" ? targetState : !prev;
      try {
        localStorage.setItem("universe_runner_online", String(next));
      } catch {
        // LocalStorage access failsafe
      }
      return next;
    });
  };

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
            // Anti-fraud: Do not add current user's own orders to the runner's available feed
            if (data.requester_id !== runnerId) {
              setPendingRequests((prev) => [data as unknown as RequestWithItems, ...prev]);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [runnerId]);

  // Handle Accepting a Pending Request
  const handleAccept = async (requestId: string) => {
    // Anti-fraud guard: Ensure runner is not the requester
    const target = pendingRequests.find((r) => r.id === requestId);
    if (target && target.requester_id === runnerId) {
      alert("⚠️ You cannot accept your own delivery request. Another campus runner will fulfill it.");
      return;
    }

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
        alert("Failed to accept request. It might have been taken by another runner, or you cannot accept your own order.");
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
    // If the runner wants to mark delivered, prompt for student's 4-digit PIN!
    if (newStatus === "delivered") {
      const assignment = activeDeliveries.find((a) => a.request.id === requestId);
      if (assignment) {
        setOtpModalAssignment(assignment);
        setEnteredOtp("");
        setOtpError(null);
        return;
      }
    }

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

  const handleVerifyOtpAndComplete = async () => {
    if (!otpModalAssignment) return;
    if (enteredOtp.trim().length !== 4) {
      setOtpError("Please enter the complete 4-digit PIN.");
      sounds.playReceive();
      return;
    }

    setIsVerifyingOtp(true);
    setOtpError(null);

    try {
      const supabase = createClient();
      const res = await completeDeliveryWithOtp(supabase, otpModalAssignment.request.id, enteredOtp);

      if (!res.success) {
        setOtpError(res.message || "Invalid PIN. Please ask the student for the code.");
        sounds.playReceive();
        return;
      }

      // Success! Play triumphant chime & move to completed
      sounds.playOrderAccepted();

      const requestId = otpModalAssignment.request.id;
      setActiveDeliveries((prev) => prev.filter((a) => a.request.id !== requestId));
      setDeliveryHistory((prev) => [
        {
          ...otpModalAssignment,
          request: { ...otpModalAssignment.request, status: "delivered" },
          status: "completed",
          completed_at: new Date().toISOString(),
        },
        ...prev,
      ]);

      setOtpModalAssignment(null);
      setEnteredOtp("");
      setSelectedRequest(null);
      router.refresh();
    } catch (err: any) {
      setOtpError(err?.message || "Verification failed");
    } finally {
      setIsVerifyingOtp(false);
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

  // Exclude current user's own requests AND requests older than 6 hours (Anti-Fraud & Auto-Expiry)
  const availableOthers = useMemo(() => {
    const sixHoursAgoMs = 6 * 60 * 60 * 1000;
    return pendingRequests.filter(
      (r) => r.requester_id !== runnerId && currentTime - new Date(r.created_at).getTime() <= sixHoursAgoMs
    );
  }, [pendingRequests, runnerId, currentTime]);

  // Category counts based on available requests
  const foodCount = useMemo(() => {
    return availableOthers.filter(
      (r) => getRunnerCategoryIcon(r.items.map((i) => i.name).join(" ")).label === "Food & Snack"
    ).length;
  }, [availableOthers]);

  const academicCount = useMemo(() => {
    return availableOthers.filter(
      (r) => getRunnerCategoryIcon(r.items.map((i) => i.name).join(" ")).label === "Academic"
    ).length;
  }, [availableOthers]);

  const gadgetCount = useMemo(() => {
    return availableOthers.filter(
      (r) => getRunnerCategoryIcon(r.items.map((i) => i.name).join(" ")).label === "Gadgets"
    ).length;
  }, [availableOthers]);

  // Filtered and sorted available requests
  const filteredPendingRequests = useMemo(() => {
    let list = [...availableOthers];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((r) => {
        const itemNames = r.items.map((i) => i.name).join(" ").toLowerCase();
        const dropoffHostel = formatPublicDropoffLocation(r.dropoff_location).hostel.toLowerCase();
        return (
          itemNames.includes(q) ||
          r.pickup_location.toLowerCase().includes(q) ||
          dropoffHostel.includes(q)
        );
      });
    }

    if (categoryFilter === "food") {
      list = list.filter(
        (r) => getRunnerCategoryIcon(r.items.map((i) => i.name).join(" ")).label === "Food & Snack"
      );
    } else if (categoryFilter === "academic") {
      list = list.filter(
        (r) => getRunnerCategoryIcon(r.items.map((i) => i.name).join(" ")).label === "Academic"
      );
    } else if (categoryFilter === "gadgets") {
      list = list.filter(
        (r) => getRunnerCategoryIcon(r.items.map((i) => i.name).join(" ")).label === "Gadgets"
      );
    }

    if (sortBy === "highest_pay") {
      list.sort((a, b) => (Number(b.delivery_fee) || 0) - (Number(a.delivery_fee) || 0));
    } else if (sortBy === "oldest") {
      list.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    } else {
      list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    return list;
  }, [availableOthers, searchQuery, categoryFilter, sortBy]);

  // Calculate total earnings from delivered requests
  const totalEarnings = deliveryHistory
    .filter((h) => h.request.status === "delivered" || h.status === "completed")
    .reduce((sum, h) => sum + (Number(h.request.delivery_fee) || 0), 0);

  return (
    <div className="space-y-8">
      {/* ── Page Header with Interactive Status Switcher ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/25 shadow-[0_0_20px_rgba(16,185,129,0.2)] shrink-0">
            <Bike className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
              Runner Dashboard
              <span className="text-emerald-400 text-lg sm:text-xl">✦</span>
            </h1>
            <p className="text-white/60 flex items-center gap-1.5 text-xs sm:text-sm mt-0.5 font-medium">
              Deliver on campus, help peers, and earn instant cash.
              <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-2.5 w-full sm:w-auto">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/5 transition-colors shrink-0">
            <NotificationBell />
          </div>
          {/* Interactive Online/Offline Duty Switcher (Ultra-Tactile Apple/Tesla Style) */}
          <button
            type="button"
            onClick={() => toggleOnline()}
            className={cn(
              "flex-1 sm:flex-initial flex items-center justify-between sm:justify-start gap-3 sm:gap-3.5 pl-2.5 sm:pl-3 pr-4 sm:pr-5 py-2 sm:py-2.5 rounded-full border transition-all duration-300 cursor-pointer select-none active:scale-95 group relative overflow-hidden backdrop-blur-xl shadow-lg",
              isOnline
                ? "border-emerald-500/50 bg-[#0a1610]/95 hover:border-emerald-400/70 shadow-[0_0_28px_rgba(16,185,129,0.22)] hover:shadow-[0_0_38px_rgba(16,185,129,0.35)]"
                : "border-amber-500/40 bg-[#14120e]/95 hover:border-amber-400/60 shadow-[0_0_22px_rgba(245,158,11,0.15)] hover:shadow-[0_0_32px_rgba(245,158,11,0.25)]"
            )}
            title={isOnline ? "Runner Mode Active · Click to Pause" : "Runner Mode Paused · Click to go Online"}
          >
            {/* Ambient inner rim glow */}
            <div
              className={cn(
                "absolute inset-0 pointer-events-none transition-opacity duration-500 opacity-0 group-hover:opacity-100",
                isOnline
                  ? "bg-gradient-to-r from-emerald-500/15 via-transparent to-transparent"
                  : "bg-gradient-to-r from-amber-500/15 via-transparent to-transparent"
              )}
            />

            {/* Tactile iOS Slider Track */}
            <div
              className={cn(
                "w-13 h-7.5 rounded-full p-0.5 relative transition-colors duration-300 shrink-0 flex items-center shadow-inner",
                isOnline
                  ? "bg-[#062414] border border-emerald-500/50"
                  : "bg-[#1f1912] border border-amber-500/30"
              )}
            >
              {/* Smooth Sliding Thumb with Glow */}
              <div
                className={cn(
                  "w-6.5 h-6.5 rounded-full transition-transform duration-300 ease-out flex items-center justify-center transform",
                  isOnline
                    ? "translate-x-5.5 bg-gradient-to-tr from-[#00E676] to-emerald-300 shadow-[0_0_14px_rgba(0,230,118,0.95),0_2px_5px_rgba(0,0,0,0.6)]"
                    : "translate-x-0 bg-white/40 shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
                )}
              >
                {/* Micro Core Dot inside Thumb */}
                <div
                  className={cn(
                    "w-2 h-2 rounded-full transition-colors",
                    isOnline ? "bg-[#042411]/80" : "bg-white/30"
                  )}
                />
              </div>
            </div>

            {/* Two-Tone Status Label */}
            <div className="flex items-center gap-2 relative z-10">
              {isOnline ? (
                <>
                  <span className="relative flex h-2.5 w-2.5 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#00E676]" />
                  </span>
                  <div className="flex items-baseline gap-1.5 whitespace-nowrap">
                    <span className="font-black text-sm sm:text-base text-[#00E676] tracking-tight">Online</span>
                    <span className="text-white/60 text-xs sm:text-sm font-mono font-medium">· Accepting Orders</span>
                  </div>
                </>
              ) : (
                <>
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0 shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
                  <div className="flex items-baseline gap-1.5 whitespace-nowrap">
                    <span className="font-black text-sm sm:text-base text-amber-300 tracking-tight">Offline</span>
                    <span className="text-white/50 text-xs sm:text-sm font-mono font-medium">· Mode Paused</span>
                  </div>
                </>
              )}
            </div>
          </button>
        </div>
      </div>

      {/* Navigation Tabs (Single-row 3-segment grid on mobile) */}
      <div className="grid grid-cols-3 sm:flex sm:flex-wrap gap-1.5 sm:gap-3 pb-1 sm:pb-2">
        <button
          onClick={() => setActiveTab("available")}
          className={`flex items-center justify-center px-2 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-full text-xs sm:text-sm font-medium transition-all duration-300 border ${activeTab === "available"
              ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
              : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white"
            }`}
        >
          <Package className="w-3.5 h-3.5 mr-1 sm:mr-2 shrink-0" />
          <span className="truncate">Available</span>
          {availableOthers.length > 0 && (
            <span className={`ml-1 sm:ml-2 px-1.5 py-0.2 rounded-full text-[10px] font-bold shrink-0 ${activeTab === "available" ? "bg-emerald-500 text-[#0a0f0d]" : "bg-white/20 text-white"}`}>
              {availableOthers.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("active")}
          className={`flex items-center justify-center px-2 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-full text-xs sm:text-sm font-medium transition-all duration-300 border ${activeTab === "active"
              ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
              : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white"
            }`}
        >
          <Clock className="w-3.5 h-3.5 mr-1 sm:mr-2 shrink-0" />
          <span className="truncate">Active</span>
          {activeDeliveries.length > 0 && (
            <span className={`ml-1 sm:ml-2 px-1.5 py-0.2 rounded-full text-[10px] font-bold shrink-0 ${activeTab === "active" ? "bg-emerald-500 text-[#0a0f0d]" : "bg-white/20 text-white"}`}>
              {activeDeliveries.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("history")}
          className={`flex items-center justify-center px-2 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-full text-xs sm:text-sm font-medium transition-all duration-300 border ${activeTab === "history"
              ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
              : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white"
            }`}
        >
          <History className="w-3.5 h-3.5 mr-1 sm:mr-2 shrink-0" />
          <span className="truncate">History</span>
        </button>
      </div>

      {/* ── Summary Stat Cards (Mobile-first 2x2 compact grid) ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {/* Stat 1: Available Requests */}
        <div className="bg-[#0b120e]/90 border border-white/5 hover:border-emerald-500/25 rounded-2xl p-3.5 sm:p-5 transition-all backdrop-blur-xl group">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-0.5 min-w-0 flex-1">
              <p className="text-[10px] sm:text-xs text-white/50 font-mono uppercase tracking-wider font-bold truncate">Available</p>
              <p className="text-xl sm:text-2xl font-black text-white font-mono">{availableOthers.length}</p>
              <p className="text-[10px] sm:text-[11px] text-emerald-400 flex items-center gap-1 font-medium truncate">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                <span className="truncate">New orders</span>
              </p>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 text-emerald-400 group-hover:scale-105 transition-transform">
              <Package className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
        </div>

        {/* Stat 2: Active Deliveries */}
        <div className={cn(
          "bg-[#0b120e]/90 border rounded-2xl p-3.5 sm:p-5 transition-all backdrop-blur-xl group",
          activeDeliveries.length > 0 ? "border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.06)]" : "border-white/5"
        )}>
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-0.5 min-w-0 flex-1">
              <p className="text-[10px] sm:text-xs text-white/50 font-mono uppercase tracking-wider font-bold truncate">Active</p>
              <p className="text-xl sm:text-2xl font-black text-white font-mono">{activeDeliveries.length}</p>
              <p className="text-[10px] sm:text-[11px] text-emerald-400 font-medium truncate">
                {activeDeliveries.length > 0 ? "● In progress" : "No missions"}
              </p>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 text-emerald-400 group-hover:scale-105 transition-transform">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
        </div>

        {/* Stat 3: Today's Earnings (HERO CARD) */}
        <div className="bg-gradient-to-br from-[#0c1611] to-[#080d0a] border border-emerald-500/35 hover:border-emerald-400/60 rounded-2xl p-3.5 sm:p-5 transition-all backdrop-blur-xl shadow-[0_0_25px_rgba(16,185,129,0.08)] group relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-start justify-between gap-2 relative z-10">
            <div className="space-y-0.5 min-w-0 flex-1">
              <p className="text-[10px] sm:text-xs text-emerald-400/80 font-mono uppercase tracking-wider font-bold truncate">Earnings</p>
              <p className="text-xl sm:text-2xl font-black text-white font-mono flex items-center tracking-tight">
                <IndianRupee className="w-4 h-4 sm:w-5 sm:h-5 mr-0.5 text-emerald-400" />
                {totalEarnings}
              </p>
              <Link href="/dashboard/wallet" className="text-[10px] sm:text-[11px] text-emerald-300 hover:text-emerald-200 font-bold flex items-center gap-0.5 transition-colors truncate">
                Wallet ➔
              </Link>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.3)] group-hover:scale-105 transition-transform">
              <Wallet className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
        </div>

        {/* Stat 4: Rating */}
        <div className="bg-[#0b120e]/90 border border-white/5 hover:border-amber-500/25 rounded-2xl p-3.5 sm:p-5 transition-all backdrop-blur-xl group">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-0.5 min-w-0 flex-1">
              <p className="text-[10px] sm:text-xs text-white/50 font-mono uppercase tracking-wider font-bold truncate">Rating</p>
              <p className="text-xl sm:text-2xl font-black text-white font-mono">
                {deliveryHistory.length > 0 ? "5.0" : "New"}
              </p>
              <p className="text-[10px] sm:text-[11px] text-amber-300 font-medium truncate">
                {deliveryHistory.length > 0 ? "★ Verified" : "★ Starter"}
              </p>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 text-amber-400 group-hover:scale-105 transition-transform">
              <Star className="w-4 h-4 sm:w-5 sm:h-5 fill-amber-400" />
            </div>
          </div>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────────────────────── */}
      {/* TAB 1: AVAILABLE REQUESTS */}
      {/* ───────────────────────────────────────────────────────────────────────────── */}
      {activeTab === "available" && (
        <div className="space-y-6">
          {!isOnline ? (
            /* ── OFFLINE / PAUSED STATE ── */
            <div className="space-y-6">
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#121914] via-[#0d1410] to-[#090f0c] border-2 border-amber-500/35 p-6 sm:p-10 text-center shadow-[0_0_35px_rgba(245,158,11,0.08)]">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto mb-4 shadow-[0_0_20px_rgba(245,158,11,0.18)]">
                  <Moon className="w-8 h-8" />
                </div>
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold uppercase tracking-wider mb-2">
                  <span>● Runner Mode is Paused</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  You are Currently Offline
                </h3>
                <p className="text-white/60 text-xs sm:text-sm max-w-lg mx-auto mt-2 leading-relaxed">
                  Jab aap class me hon, library me study kar rahe hon ya rest kar rahe hon, to Runner Mode ko Paused rakhein taaki koi order notification disturb na kare.
                </p>
                <p className="text-emerald-400/90 text-xs sm:text-sm max-w-lg mx-auto mt-1 font-medium">
                  Jab bhi aap campus me walk kar rahe hon (Canteen, Gate ya Hostel ke raste), 1-click me Online ho kar orders deliver karein aur pocket money kamayein!
                </p>

                <button
                  type="button"
                  onClick={() => toggleOnline(true)}
                  className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-black font-extrabold text-xs sm:text-sm shadow-[0_0_25px_rgba(16,185,129,0.4)] hover:shadow-[0_0_35px_rgba(16,185,129,0.6)] transition-all active:scale-95 cursor-pointer"
                >
                  <Radio className="w-4 h-4 animate-pulse text-black" />
                  <span>Go Online & Start Accepting Orders ➔</span>
                </button>
              </div>

              {/* How it works 3-step playbook */}
              <RunnerHowItWorksGuide />
            </div>
          ) : availableOthers.length === 0 ? (
            /* ── EMPTY STATE: Direct Radar Scanning HUD & Compact Guide ── */
                <div className="space-y-6">
                  {/* Live Radar Scanning HUD */}
                  <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#0e1713] via-[#0a110e] to-[#070b09] border border-emerald-500/30 p-6 sm:p-12 text-center shadow-[0_0_35px_rgba(16,185,129,0.08)]">
                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-5 flex items-center justify-center">
                      <div className="absolute inset-0 rounded-full border border-emerald-500/20 animate-ping" />
                      <div className="absolute -inset-3 rounded-full border border-emerald-500/15" />
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-emerald-500/15 border-2 border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-[0_0_25px_rgba(0,230,118,0.3)]">
                        <Radio className="w-6 h-6 sm:w-7 sm:h-7 animate-pulse" />
                      </div>
                    </div>

                    <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold uppercase tracking-wider mb-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      <span>Campus Radar Active · Listening for Orders</span>
                    </div>

                    <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                      No Active Requests on Radar Right Now
                    </h3>

                    <p className="text-white/60 text-xs sm:text-sm max-w-md mx-auto mt-2 leading-relaxed">
                      Aapka Runner Mode <span className="text-emerald-400 font-bold">ONLINE</span> hai! Jaise hi campus me koi student food, snacks ya notes order karega, yaha instant sound & visual alert aayega.
                    </p>

                    <div className="mt-5 max-w-lg mx-auto p-3 rounded-2xl bg-white/[0.03] border border-white/10 text-white/50 text-xs flex items-center justify-center gap-2 font-mono">
                      <span>💡 Peak orders time: Lunch (1 PM - 3 PM) & Late Night (9 PM - 1 AM)</span>
                    </div>
                  </div>

                  {/* Collapsible Playbook Guide */}
                  <div className="flex justify-between items-center bg-[#0d1310] border border-white/10 rounded-2xl px-4 py-2.5">
                    <div className="flex items-center gap-2 text-xs text-white/70">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="font-mono uppercase text-[11px] text-emerald-400 font-bold">Runner Guide</span>
                      <span className="hidden sm:inline text-white/40">· Earn cash on campus walks</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowHowItWorks((prev) => !prev)}
                      className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 transition-colors font-semibold cursor-pointer"
                    >
                      <span>{showHowItWorks ? "Hide Guide" : "How it Works (3 Steps)"}</span>
                      <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", showHowItWorks && "rotate-180")} />
                    </button>
                  </div>

                  {showHowItWorks && <RunnerHowItWorksGuide />}
                </div>
              ) : (
                /* ── ACTIVE FEED: Controls, Search, Filters & Request Cards ── */
                <>
                  {/* Collapsible How It Works bar when orders exist */}
                  <div className="flex justify-between items-center bg-[#0d1310] border border-white/10 rounded-2xl px-4 py-2.5">
                    <div className="flex items-center gap-2 text-xs text-white/70">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="font-mono uppercase text-[11px] text-emerald-400 font-bold">Runner Guide</span>
                      <span className="hidden sm:inline text-white/40">· Earn cash on campus walks</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowHowItWorks((prev) => !prev)}
                      className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 transition-colors font-semibold cursor-pointer"
                    >
                      <span>{showHowItWorks ? "Hide Guide" : "How it Works (3 Steps)"}</span>
                      <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", showHowItWorks && "rotate-180")} />
                    </button>
                  </div>

                  {showHowItWorks && <RunnerHowItWorksGuide />}

                  {/* Controls & Search Header */}
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div>
                        <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                          Available Requests
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold">
                            {filteredPendingRequests.length}
                          </span>
                        </h2>
                        <p className="text-white/40 text-xs mt-0.5">Instant campus pickup requests ready to accept</p>
                      </div>

                      <div className="flex items-center gap-2.5 w-full sm:w-auto">
                        {/* Grid/List Toggle */}
                        <div className="flex items-center bg-[#0d1310] border border-white/10 rounded-xl p-1 shrink-0">
                          <button
                            onClick={() => setIsGridView(true)}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${isGridView ? "bg-emerald-500/20 text-emerald-400" : "text-white/40 hover:text-white"}`}
                            title="Grid View"
                          >
                            <LayoutGrid className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setIsGridView(false)}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${!isGridView ? "bg-emerald-500/20 text-emerald-400" : "text-white/40 hover:text-white"}`}
                            title="List View"
                          >
                            <List className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Real Sort Dropdown */}
                        <div className="relative flex-1 sm:flex-initial">
                          <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as any)}
                            className="appearance-none bg-[#0d1310] border border-white/10 text-white/80 text-xs sm:text-sm rounded-xl pl-3.5 pr-9 py-2 outline-none focus:border-emerald-500/50 hover:text-white transition-colors cursor-pointer w-full font-medium"
                          >
                            <option value="newest">Sort by: Newest</option>
                            <option value="oldest">Sort by: Oldest</option>
                            <option value="highest_pay">Sort by: Highest Pay</option>
                          </select>
                          <ChevronDown className="w-3.5 h-3.5 text-white/40 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </div>
                    </div>

                    {/* Search Input & Category Filter Chips */}
                    <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
                      {/* Search Bar */}
                      <div className="relative flex-1">
                        <Search className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search item, pickup, or hostel room..."
                          className="w-full bg-[#080d0a]/90 border border-white/10 rounded-xl pl-9 pr-8 py-2 text-xs sm:text-sm text-white placeholder-white/40 focus:border-emerald-500/50 outline-none transition-all shadow-inner"
                        />
                        {searchQuery && (
                          <button
                            onClick={() => setSearchQuery("")}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white p-0.5 rounded-full cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Category Filter Chips */}
                      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
                        {[
                          { id: "all", label: "All", count: availableOthers.length },
                          { id: "food", label: "🍔 Food & Snacks", count: foodCount },
                          { id: "academic", label: "📚 Academic", count: academicCount },
                          { id: "gadgets", label: "🔌 Gadgets", count: gadgetCount },
                        ].map((cat) => {
                          const isActive = categoryFilter === cat.id;
                          return (
                            <button
                              key={cat.id}
                              type="button"
                              onClick={() => setCategoryFilter(cat.id as any)}
                              className={cn(
                                "px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer",
                                isActive
                                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.15)]"
                                  : "bg-white/5 border border-white/5 text-white/60 hover:text-white hover:bg-white/10"
                              )}
                            >
                              <span>{cat.label}</span>
                              <span
                                className={cn(
                                  "text-[10px] font-mono px-1.5 py-0.2 rounded-full",
                                  isActive ? "bg-emerald-500/30 text-emerald-200" : "bg-white/10 text-white/50"
                                )}
                              >
                                {cat.count}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {filteredPendingRequests.length === 0 ? (
            <div className="bg-[#0b120e] border border-white/5 rounded-2xl p-10 text-center space-y-3">
              <Filter className="w-10 h-10 mx-auto text-emerald-500/30" />
              <p className="text-white/80 font-semibold text-sm">No requests match your current search or filter.</p>
              <p className="text-white/40 text-xs">Try selecting &quot;All&quot; or clearing the search query.</p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setCategoryFilter("all");
                }}
                className="px-4 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold hover:bg-emerald-500/25 transition-all cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className={`grid gap-5 ${isGridView ? "md:grid-cols-2" : "grid-cols-1"}`}>
              {filteredPendingRequests.map((req) => {
                const itemNames = req.items.map((i) => i.name).join(", ");
                const category = getRunnerCategoryIcon(itemNames);
                const CategoryIcon = category.icon;

                return (
                  <div
                    key={req.id}
                    className="relative overflow-hidden bg-[#0a100d]/90 border border-white/10 hover:border-emerald-500/40 rounded-2xl flex flex-col justify-between transition-all group backdrop-blur-xl shadow-sm hover:shadow-[0_0_35px_rgba(16,185,129,0.1)]"
                  >
                    {/* Subtle top neon rim highlight */}
                    <div className="absolute top-0 left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                    <div className="p-4 sm:p-5 relative z-10">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                          <div className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-mono font-bold uppercase tracking-wide bg-blue-500/10 border border-blue-500/30 text-blue-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                            Requested
                          </div>
                          <span className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-300 text-[10px] sm:text-[10.5px] font-semibold">
                            ⚡ Campus Express
                          </span>
                        </div>

                        {/* High-contrast Reward Payout Badge */}
                        <div className="flex items-center gap-1 px-2.5 sm:px-3 py-1 rounded-xl bg-gradient-to-r from-emerald-500/20 via-emerald-500/15 to-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono font-black text-sm sm:text-lg shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                          <IndianRupee className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
                          <span>{req.delivery_fee}</span>
                          <span className="text-[9px] sm:text-[9.5px] font-sans font-bold uppercase tracking-wider text-emerald-400/80 ml-0.5 sm:ml-1">
                            Payout
                          </span>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 mt-3.5 sm:mt-4">
                        <div className={cn("w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0 border", category.bg)}>
                          <CategoryIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-base sm:text-xl font-bold text-white truncate capitalize group-hover:text-emerald-300 transition-colors">
                            {itemNames}
                          </h3>
                          <div className="flex items-center text-xs text-white/40 pt-0.5">
                            <Calendar className="w-3.5 h-3.5 mr-1 shrink-0" />
                            <span className="truncate">Posted {formatDistanceToNow(new Date(req.created_at))} ago</span>
                          </div>
                        </div>
                      </div>

                      {/* Route Map Connector Visualizer */}
                      <div className="p-3 rounded-xl bg-[#070b09]/90 border border-white/5 space-y-2 mt-3.5 sm:mt-4">
                        {/* Pickup */}
                        <div className="flex items-center gap-2.5 text-xs sm:text-sm">
                          <div className="w-5 h-5 rounded-md bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                            <MapPin className="w-3 h-3" />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-[9px] font-mono uppercase tracking-wider text-white/40 font-bold">Pickup</span>
                            <span className="font-semibold text-white/95 truncate text-xs">{req.pickup_location}</span>
                          </div>
                        </div>

                        {/* Connector Walk Time */}
                        <div className="flex items-center gap-2 pl-2.5 py-0.5">
                          <div className="w-[1px] h-3.5 bg-gradient-to-b from-emerald-500/60 to-emerald-500/20" />
                          <span className="px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/20 text-[9.5px] font-mono text-emerald-400/90">
                            🚶 ~3-5 min campus walk
                          </span>
                        </div>

                        {/* Dropoff (Room hidden for privacy until accepted) */}
                        {(() => {
                          const dropoffInfo = formatPublicDropoffLocation(req.dropoff_location);
                          return (
                            <div className="flex items-center gap-2.5 text-xs sm:text-sm">
                              <div className="w-5 h-5 rounded-md bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                                <MapPin className="w-3 h-3" />
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="text-[9px] font-mono uppercase tracking-wider text-white/40 font-bold">Dropoff</span>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="font-semibold text-white/95 text-xs">{dropoffInfo.hostel}</span>
                                  {dropoffInfo.isRoomHidden && (
                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-white/5 border border-white/10 text-[9px] font-mono text-emerald-400/80">
                                      🔒 Room hidden until accept
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })()}
                      </div>

                      {/* Motivator Footer */}
                      <div className="flex items-center justify-between text-[10.5px] sm:text-[11px] text-white/40 pt-3 font-mono">
                        <span className="text-emerald-400/80 font-medium truncate mr-2">💚 100% Peer Tips Kept</span>
                        <span className="shrink-0">Direct Handover</span>
                      </div>
                    </div>

                    <div className="p-4 sm:p-5 pt-0 flex gap-2.5 sm:gap-3 relative z-10">
                      <button
                        onClick={() => setSelectedRequest(req)}
                        className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 rounded-xl border border-white/10 text-white/70 hover:text-white hover:bg-white/5 transition-colors font-medium text-xs sm:text-sm cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Details
                      </button>
                      {req.requester_id === runnerId ? (
                        <div className="flex-[1.5] flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/40 font-semibold text-xs text-center select-none">
                          Your Request
                        </div>
                      ) : (
                        <button
                          onClick={() => handleAccept(req.id)}
                          disabled={isAccepting === req.id}
                          className="flex-[1.5] flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-black font-extrabold text-xs sm:text-sm shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transition-all cursor-pointer disabled:opacity-50 active:scale-[0.98]"
                        >
                          {isAccepting === req.id ? "Accepting..." : "Accept Request"}
                          <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  )}

      {/* ───────────────────────────────────────────────────────────────────────────── */}
      {/* TAB 2: MY ACTIVE DELIVERIES */}
      {/* ───────────────────────────────────────────────────────────────────────────── */}
      {activeTab === "active" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                My Active Deliveries
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold">
                  {activeDeliveries.length}
                </span>
              </h2>
              <p className="text-white/40 text-xs mt-0.5">Orders you have accepted and are currently fulfilling</p>
            </div>
          </div>

          {activeDeliveries.length === 0 ? (
            <div className="bg-[#0b120e] border border-white/5 rounded-2xl p-12 text-center">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-emerald-500/30" />
              <p className="text-white/70 font-semibold text-sm">You have no active deliveries right now.</p>
              <p className="text-white/40 text-xs mt-1">Accept available orders from the campus feed to start earning.</p>
              <button
                className="mt-5 px-5 py-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25 transition-all font-bold text-xs cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                onClick={() => setActiveTab("available")}
              >
                Browse Available Requests ➔
              </button>
            </div>
          ) : (
            <div className={`grid gap-5 ${isGridView ? "md:grid-cols-2" : "grid-cols-1"}`}>
              {activeDeliveries.map((assignment) => {
                const req = assignment.request;
                const action = getNextStatusAction(req.status);
                const itemNames = req.items.map((i) => i.name).join(", ");
                const category = getRunnerCategoryIcon(itemNames);
                const CategoryIcon = category.icon;

                return (
                  <div
                    key={assignment.id}
                    className="relative overflow-hidden bg-[#0a100d]/90 border border-emerald-500/30 hover:border-emerald-500/50 rounded-2xl flex flex-col justify-between transition-all group backdrop-blur-xl shadow-[0_0_25px_rgba(16,185,129,0.06)]"
                  >
                    {/* Top glowing neon accent */}
                    <div className="absolute top-0 left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent pointer-events-none" />

                    <div className="p-4 sm:p-5 relative z-10">
                      <div className="flex justify-between items-center">
                        <RequestStatusBadge status={req.status} />

                        {/* Glowing Payout */}
                        <div className="flex items-center gap-1 px-2.5 sm:px-3 py-1 rounded-xl bg-gradient-to-r from-emerald-500/20 via-emerald-500/15 to-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono font-black text-sm sm:text-lg shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                          <IndianRupee className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
                          <span>{req.delivery_fee}</span>
                          <span className="text-[9px] sm:text-[9.5px] font-sans font-bold uppercase tracking-wider text-emerald-400/80 ml-0.5 sm:ml-1">
                            Payout
                          </span>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 mt-3.5 sm:mt-4">
                        <div className={cn("w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0 border", category.bg)}>
                          <CategoryIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-base sm:text-xl font-bold text-white truncate capitalize group-hover:text-emerald-300 transition-colors">
                            {itemNames}
                          </h3>
                          <div className="flex items-center gap-2 text-xs text-white/50 pt-0.5">
                            <span className="truncate max-w-[160px]">To: <strong className="text-white/80">{req.dropoff_location}</strong></span>
                            <span>•</span>
                            <span className="font-mono text-emerald-400/90 font-medium">In Delivery</span>
                          </div>
                        </div>
                      </div>

                      {/* Route Map Connector Visualizer */}
                      <div className="p-3 rounded-xl bg-[#070b09]/90 border border-white/5 space-y-2 mt-3.5 sm:mt-4">
                        {/* Pickup */}
                        <div className="flex items-center gap-2.5 text-xs sm:text-sm">
                          <div className="w-5 h-5 rounded-md bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                            <MapPin className="w-3 h-3" />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-[9px] font-mono uppercase tracking-wider text-white/40 font-bold">1. Pickup Spot</span>
                            <span className="font-semibold text-white/95 truncate text-xs">{req.pickup_location}</span>
                          </div>
                        </div>

                        {/* Connector Walk Time */}
                        <div className="flex items-center gap-2 pl-2.5 py-0.5">
                          <div className="w-[1px] h-3.5 bg-gradient-to-b from-emerald-500/60 to-emerald-500/20" />
                          <span className="px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/20 text-[9.5px] font-mono text-emerald-400/90 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                            🚶 Active transit on campus
                          </span>
                        </div>

                        {/* Dropoff */}
                        <div className="flex items-center gap-2.5 text-xs sm:text-sm">
                          <div className="w-5 h-5 rounded-md bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                            <MapPin className="w-3 h-3" />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-[9px] font-mono uppercase tracking-wider text-white/40 font-bold">2. Dropoff Spot</span>
                            <span className="font-semibold text-white/95 truncate text-xs">{req.dropoff_location}</span>
                          </div>
                        </div>
                      </div>

                      {req.instructions && (
                        <div className="p-3 bg-amber-500/10 rounded-xl text-xs text-amber-400 border border-amber-500/20 mt-3">
                          <strong className="text-amber-300 font-semibold">Student Note:</strong> {req.instructions}
                        </div>
                      )}
                    </div>

                    <div className="p-4 sm:p-5 pt-0 flex flex-wrap gap-2 sm:gap-2.5 relative z-10">
                      <button
                        onClick={() => setSelectedRequest(req)}
                        className="flex-1 min-w-[75px] sm:min-w-[85px] flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-white/10 text-white/70 hover:text-white hover:bg-white/5 transition-colors font-medium text-xs sm:text-sm cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Details
                      </button>
                      <Link
                        href={`/dashboard/chat?requestId=${req.id}&startWithUserId=${req.requester_id}`}
                        className="flex-1 min-w-[75px] sm:min-w-[85px] flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25 transition-colors font-semibold text-xs sm:text-sm shadow-[0_0_12px_rgba(16,185,129,0.15)] cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Chat
                      </Link>
                      {action && (
                        <button
                          onClick={() => handleStatusUpdate(req.id, action.nextStatus)}
                          disabled={isUpdatingStatus === req.id}
                          className="flex-[1.4] min-w-[120px] sm:min-w-[130px] flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-black font-extrabold text-xs sm:text-sm shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transition-all cursor-pointer disabled:opacity-50 active:scale-[0.98]"
                        >
                          {isUpdatingStatus === req.id ? "Updating..." : action.label}
                          <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
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
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                Delivery History
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold">
                  {deliveryHistory.length}
                </span>
              </h2>
              <p className="text-white/40 text-xs mt-0.5">Completed campus missions and earnings breakdown</p>
            </div>
            <div className="text-sm font-semibold bg-emerald-500/10 text-emerald-300 px-4 py-2 rounded-full border border-emerald-500/25 flex items-center shadow-[0_0_20px_rgba(16,185,129,0.15)] font-mono">
              Total Earned: <IndianRupee className="w-4 h-4 ml-1 mr-0.5 text-emerald-400" /> {totalEarnings}
            </div>
          </div>

          {deliveryHistory.length === 0 ? (
            <div className="bg-[#0b120e] border border-white/5 rounded-2xl p-12 text-center">
              <History className="w-12 h-12 mx-auto mb-4 text-white/20" />
              <p className="text-white/60 font-medium">No past delivery history yet.</p>
              <p className="text-xs text-white/40 mt-1">Delivered orders will be archived here with proof of completion.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {deliveryHistory.map((assignment) => {
                const req = assignment.request;
                const isDelivered = req.status === "delivered" || assignment.status === "completed";
                const itemNames = req.items.map((i) => i.name).join(", ");
                const category = getRunnerCategoryIcon(itemNames);
                const CategoryIcon = category.icon;

                return (
                  <div
                    key={assignment.id}
                    className="bg-[#0a100d]/90 border border-white/10 hover:border-emerald-500/30 rounded-2xl p-3.5 sm:p-5 flex flex-col sm:flex-row justify-between sm:items-center gap-3.5 sm:gap-5 transition-all backdrop-blur-xl group"
                  >
                    <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                      <div className={cn("w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0 border mt-0.5", category.bg)}>
                        <CategoryIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <div className="space-y-1 sm:space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
                          <RequestStatusBadge status={req.status} />
                          <span className="text-[11px] sm:text-xs text-white/40 flex items-center font-mono">
                            <Clock className="w-3.5 h-3.5 mr-1 text-emerald-400/60" />
                            {assignment.completed_at
                              ? `Completed ${format(new Date(assignment.completed_at), "MMM d, h:mm a")}`
                              : `Assigned ${format(new Date(assignment.assigned_at), "MMM d, h:mm a")}`}
                          </span>
                        </div>
                        <h4 className="font-bold text-sm sm:text-lg text-white truncate">
                          {itemNames}
                        </h4>
                        <p className="text-xs sm:text-sm text-white/50 truncate">
                          <span className="font-medium text-white/70">{req.pickup_location}</span> ➔{" "}
                          <span className="font-medium text-white/90">{req.dropoff_location}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-row sm:flex-col items-center justify-between sm:items-end gap-2.5 sm:gap-3 pt-2.5 sm:pt-0 border-t border-white/5 sm:border-t-0 shrink-0">
                      <div className="text-left sm:text-right">
                        <span
                          className={`text-base sm:text-lg font-bold font-mono flex items-center sm:justify-end ${isDelivered ? "text-emerald-400" : "text-white/40"
                            }`}
                        >
                          {isDelivered ? "+" : ""}
                          <IndianRupee className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-0.5" />
                          {req.delivery_fee}
                        </span>
                        <span className="text-[10px] sm:text-[11px] text-white/40 block mt-0.5 font-sans">
                          {isDelivered ? "Earned & Settled" : "Cancelled"}
                        </span>
                      </div>

                      <button
                        onClick={() => setSelectedRequest(req)}
                        className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 text-white/70 hover:text-white hover:bg-white/5 transition-colors font-medium text-xs cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" /> Details
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Gamified Level & Perks Banner ── */}
      <div className="bg-gradient-to-r from-[#0c1611] via-[#09110d] to-[#0c1611] border border-emerald-500/25 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-8 shadow-[0_0_30px_rgba(16,185,129,0.06)] backdrop-blur-xl">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/30 text-emerald-400 shrink-0 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            <Sparkles className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-mono font-bold uppercase tracking-wider">
                {deliveryHistory.length >= 10 ? "Level 3 Pro Runner" : deliveryHistory.length >= 3 ? "Level 2 Campus Runner" : "Level 1 Starter Runner"}
              </span>
              <span className="text-xs text-white/50">
                • {deliveryHistory.length} completed {deliveryHistory.length === 1 ? "delivery" : "deliveries"} (100% Tips kept)
              </span>
            </div>
            {/* Progress bar based on real history */}
            <div className="w-full max-w-xs h-2 rounded-full bg-white/5 border border-white/10 overflow-hidden mt-1.5">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-500" 
                style={{ width: `${Math.min(100, Math.max(8, (deliveryHistory.length / 10) * 100))}%` }}
              />
            </div>
          </div>
        </div>

        <Link
          href="/dashboard/analytics"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 hover:border-emerald-400 transition-all font-bold text-xs shrink-0 w-full sm:w-auto justify-center shadow-[0_0_15px_rgba(16,185,129,0.1)]"
        >
          <Activity className="w-4 h-4" />
          View Performance & Tips ➔
        </Link>
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
                    {selectedRequest.status === "pending" ? (
                      <div className="space-y-1">
                        <p className="font-semibold text-base text-primary">
                          {formatPublicDropoffLocation(selectedRequest.dropoff_location).hostel}
                        </p>
                        <p className="text-xs text-white/50 flex items-center gap-1">
                          🔒 Exact room number is concealed for student privacy. It will be revealed once you accept this delivery.
                        </p>
                      </div>
                    ) : (
                      <p className="font-semibold text-base text-primary">{selectedRequest.dropoff_location}</p>
                    )}
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

            <ModalFooter className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-2.5">
              <div>
                {selectedRequest.status !== "pending" && (
                  <Link
                    href={`/dashboard/chat?requestId=${selectedRequest.id}&startWithUserId=${selectedRequest.requester_id}`}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25 transition-colors font-semibold text-xs sm:text-sm shadow-[0_0_12px_rgba(16,185,129,0.15)] w-full sm:w-auto"
                  >
                    <MessageSquare className="w-4 h-4" /> Chat with Student
                  </Link>
                )}
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button variant="secondary" className="flex-1 sm:flex-initial" onClick={() => setSelectedRequest(null)}>
                  Close
                </Button>
                {selectedRequest.status === "pending" && (
                  <Button
                    className="flex-1 sm:flex-initial"
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

      {/* ───────────────────────────────────────────────────────────────────────────── */}
      {/* 4-DIGIT DELIVERY PIN VERIFICATION MODAL */}
      {/* ───────────────────────────────────────────────────────────────────────────── */}
      <Modal open={otpModalAssignment !== null} onOpenChange={(open) => !open && !isVerifyingOtp && setOtpModalAssignment(null)}>
        {otpModalAssignment && (
          <ModalContent size="md" className="bg-[#0b120e] border border-emerald-500/30 text-white">
            <ModalHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <ModalTitle className="text-lg font-bold text-white flex items-center gap-2">
                    Enter Delivery PIN
                    <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      Security Check
                    </span>
                  </ModalTitle>
                  <ModalDescription className="text-zinc-400 text-xs">
                    Ask the student for their 4-digit handover PIN to confirm delivery.
                  </ModalDescription>
                </div>
              </div>
            </ModalHeader>

            <ModalBody className="space-y-6 pt-4">
              <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/20 text-xs text-zinc-300 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <b className="text-white">Student Handover Rule:</b> Do NOT complete this delivery until you have physically handed the order to the student and received their 4-digit PIN.
                </div>
              </div>

              {/* 4-Digit Input Form */}
              <div className="flex flex-col items-center justify-center gap-3">
                <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">
                  4-Digit Student PIN
                </label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={4}
                    value={enteredOtp}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "").slice(0, 4);
                      setEnteredOtp(val);
                      if (otpError) setOtpError(null);
                    }}
                    placeholder="• • • •"
                    autoFocus
                    className="w-48 h-14 bg-black/60 border-2 border-emerald-500/50 rounded-2xl text-center text-3xl font-mono tracking-[0.6em] text-emerald-400 placeholder:text-zinc-700 focus:outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.15)] transition-all"
                  />
                </div>

                {otpError && (
                  <p className="text-xs font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                    <span>⚠️</span> {otpError}
                  </p>
                )}
              </div>

              {/* Order quick summary */}
              <div className="p-3 bg-white/[0.03] border border-white/5 rounded-xl text-xs space-y-1.5">
                <div className="flex justify-between text-zinc-400">
                  <span>Order Items:</span>
                  <span className="text-white font-medium">{otpModalAssignment.request.items.map(i => i.name).join(", ")}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Your Earnings:</span>
                  <span className="text-emerald-400 font-bold">₹{otpModalAssignment.request.delivery_fee}</span>
                </div>
              </div>
            </ModalBody>

            <ModalFooter className="flex flex-col-reverse sm:flex-row justify-between items-stretch sm:items-center gap-2 pt-2">
              <Button
                variant="ghost"
                onClick={() => setOtpModalAssignment(null)}
                disabled={isVerifyingOtp}
                className="text-zinc-400 hover:text-white w-full sm:w-auto"
              >
                Cancel
              </Button>

              <Button
                onClick={handleVerifyOtpAndComplete}
                disabled={isVerifyingOtp || enteredOtp.length !== 4}
                className="bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold px-5 py-2.5 gap-2 shadow-[0_0_15px_rgba(0,230,118,0.3)] w-full sm:w-auto justify-center"
              >
                {isVerifyingOtp ? "Verifying PIN..." : "Verify & Complete Delivery ➔"}
              </Button>
            </ModalFooter>
          </ModalContent>
        )}
      </Modal>
    </div>
  );
}
