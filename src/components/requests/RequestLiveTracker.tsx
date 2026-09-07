"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { format } from "date-fns";
import {
  MapPin,
  Package,
  User,
  IndianRupee,
  FileText,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Truck,
  Zap,
  Copy,
  Check,
  Radio,
  Sparkles,
  ArrowUpRight,
  Volume2,
  VolumeX,
  X,
  Store,
  Compass,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { StudentRequestWithDetails } from "@/lib/database/requests";

interface RequestLiveTrackerProps {
  initialRequest: StudentRequestWithDetails;
}

// Synthesize a pleasant notification chime using Web Audio API
function playNotificationChime() {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5 cheerful progression
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.12);
      gain.gain.setValueAtTime(0.001, ctx.currentTime + idx * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.22, ctx.currentTime + idx * 0.12 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.12 + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + idx * 0.12);
      osc.stop(ctx.currentTime + idx * 0.12 + 0.36);
    });
  } catch {
    // Ignore autoplay restrictions gracefully
  }
}

// Trigger system/browser notification if permission granted
function triggerBrowserNotification(title: string, body: string) {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission === "granted") {
    new Notification(title, {
      body,
      icon: "/favicon.ico",
    });
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then((perm) => {
      if (perm === "granted") {
        new Notification(title, { body, icon: "/favicon.ico" });
      }
    });
  }
}

const STAGES = [
  { id: "pending", label: "Broadcasted", subtext: "Searching for runners", icon: Radio },
  { id: "accepted", label: "Assigned", subtext: "Runner accepted", icon: User },
  { id: "picked_up", label: "Picked Up", subtext: "Items collected", icon: Package },
  { id: "in_transit", label: "In Transit", subtext: "Runner on the way", icon: Truck },
  { id: "delivered", label: "Delivered", subtext: "Completed", icon: CheckCircle2 },
] as const;

export function RequestLiveTracker({ initialRequest }: RequestLiveTrackerProps) {
  const [request, setRequest] = useState<StudentRequestWithDetails>(initialRequest);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isBoosting, setIsBoosting] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [copiedOtp, setCopiedOtp] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showCelebration, setShowCelebration] = useState(false);

  const prevStatusRef = useRef(initialRequest.status);
  const prevRunnerIdRef = useRef(
    initialRequest.assignments?.find((a) => a.status === "active" || a.status === "completed")?.runner?.id
  );

  // Request browser notification permission proactively on mount
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission();
      }
    }
  }, []);

  // Live elapsed search timer while pending
  useEffect(() => {
    if (request.status !== "pending") return;
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [request.status]);

  // Function to re-fetch full request data and handle live transitions
  const fetchLatestDetails = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("delivery_requests")
        .select(`
          *,
          items:request_items(*),
          assignments:delivery_assignments(
            *,
            runner:profiles(*)
          )
        `)
        .eq("id", initialRequest.id)
        .single();

      if (data && !error) {
        const typed = data as unknown as StudentRequestWithDetails;
        const oldStatus = prevStatusRef.current;
        const newStatus = typed.status;
        const activeAssignment = typed.assignments?.find(
          (a) => a.status === "active" || a.status === "completed"
        );
        const currentRunnerId = activeAssignment?.runner?.id;
        const oldRunnerId = prevRunnerIdRef.current;

        // Check if runner just accepted!
        if (
          (oldStatus === "pending" && newStatus !== "pending") ||
          (!oldRunnerId && currentRunnerId)
        ) {
          if (soundEnabled) playNotificationChime();
          if (navigator.vibrate) navigator.vibrate([120, 80, 150]);

          const runnerName = activeAssignment?.runner?.full_name || "A campus runner";
          triggerBrowserNotification(
            "Runner Found! 🎉",
            `${runnerName} accepted your delivery request and is heading to the pickup spot!`
          );

          setShowCelebration(true);
          setTimeout(() => setShowCelebration(false), 9000);
        }

        prevStatusRef.current = newStatus;
        prevRunnerIdRef.current = currentRunnerId;
        setRequest(typed);
      }
    } catch (err) {
      console.error("Error refreshing request live tracker:", err);
    }
  }, [initialRequest.id, soundEnabled]);

  // Real-time subscription via Supabase channel + 3.5s background polling fallback
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`live-tracking-${initialRequest.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "delivery_requests",
          filter: `id=eq.${initialRequest.id}`,
        },
        () => {
          fetchLatestDetails();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "delivery_assignments",
          filter: `request_id=eq.${initialRequest.id}`,
        },
        () => {
          fetchLatestDetails();
        }
      )
      .subscribe();

    const pollInterval = setInterval(() => {
      fetchLatestDetails();
    }, 3500);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(pollInterval);
    };
  }, [initialRequest.id, fetchLatestDetails]);

  // Handle reward boosting (+₹5 or +₹10) while pending
  const handleBoostReward = async (boostAmount: number) => {
    if (isBoosting || request.status !== "pending") return;
    setIsBoosting(true);
    try {
      const supabase = createClient();
      const newFee = (request.delivery_fee || 0) + boostAmount;
      const { error } = await supabase
        .from("delivery_requests")
        .update({ delivery_fee: newFee })
        .eq("id", request.id);

      if (!error) {
        setRequest((prev) => ({ ...prev, delivery_fee: newFee }));
        if (soundEnabled) playNotificationChime();
      }
    } catch (err) {
      console.error("Failed to boost delivery reward:", err);
    } finally {
      setIsBoosting(false);
    }
  };

  // Handle cancel request
  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel this delivery request?")) return;
    setIsCancelling(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("delivery_requests")
        .update({ status: "cancelled" })
        .eq("id", request.id);

      if (!error) {
        setRequest((prev) => ({ ...prev, status: "cancelled" }));
      }
    } catch (err) {
      console.error("Failed to cancel request:", err);
    } finally {
      setIsCancelling(false);
    }
  };

  // Deterministic 4-digit PIN fallback if delivery_otp is not yet populated or column missing in DB
  const displayPin =
    request.delivery_otp ||
    (request.id
      ? String(
          (Math.abs(
            request.id
              .split("")
              .reduce((acc, c) => (acc << 5) - acc + c.charCodeAt(0), 0)
          ) %
            9000) +
            1000
        )
      : "5821");

  const handleCopyOtp = () => {
    navigator.clipboard.writeText(displayPin);
    setCopiedOtp(true);
    setTimeout(() => setCopiedOtp(false), 2000);
  };

  const activeAssignment = request.assignments?.find(
    (a) => a.status === "active" || a.status === "completed"
  );
  const runner = activeAssignment?.runner;

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const activeStageIndex = STAGES.findIndex((s) => s.id === request.status);
  const currentStageIndex = activeStageIndex === -1 ? 0 : activeStageIndex;

  return (
    <div className="space-y-6">
      {/* Sound Toggle Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#00E676] animate-pulse shadow-[0_0_10px_#00E676]" />
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
            Live Real-Time Tracker
          </span>
        </div>
        <button
          type="button"
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:border-emerald-500/30 text-xs text-[#A7B8B0] hover:text-white transition-colors cursor-pointer"
          title={soundEnabled ? "Audio chime active" : "Audio chime muted"}
        >
          {soundEnabled ? (
            <>
              <Volume2 size={14} className="text-[#00E676]" />
              <span className="hidden sm:inline">Chime On</span>
            </>
          ) : (
            <>
              <VolumeX size={14} className="text-white/40" />
              <span className="hidden sm:inline">Chime Muted</span>
            </>
          )}
        </button>
      </div>

      {/* Celebration Banner when runner is matched */}
      {showCelebration && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/20 via-emerald-500/30 to-emerald-500/20 border-2 border-[#00E676] text-white shadow-[0_0_30px_rgba(0,230,118,0.4)] flex items-center justify-between animate-bounce">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00E676] text-[#050805] flex items-center justify-center font-black text-xl shadow-[0_0_15px_#00E676]">
              🎉
            </div>
            <div>
              <p className="font-extrabold text-sm sm:text-base text-white">Runner Matched!</p>
              <p className="text-xs text-emerald-200">
                {runner?.full_name || "A student runner"} has accepted your request.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowCelebration(false)}
            className="text-white/60 hover:text-white p-1"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* ============================================================ */}
      {/* ── CASE 1: PENDING SEARCH SCREEN (RAPIDO / UBER RADAR) ───── */}
      {/* ============================================================ */}
      {request.status === "pending" && (
        <div className="relative overflow-hidden rounded-3xl bg-[#0a100c]/95 border-2 border-emerald-500/30 p-6 sm:p-10 flex flex-col items-center text-center shadow-[0_0_50px_rgba(0,230,118,0.12)]">
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(0,230,118,0.12)_0%,transparent_70%)]" />

          {/* ── Rapido Radar Animation Centerpiece ── */}
          <div className="relative w-48 h-48 sm:w-60 sm:h-60 flex items-center justify-center my-4">
            {/* Outer Expanding Pulse Waves */}
            <div className="absolute inset-0 rounded-full border border-emerald-500/20 animate-ping duration-1000 opacity-20" />
            <div className="absolute inset-4 rounded-full border border-emerald-500/30 animate-pulse duration-700" />
            <div className="absolute inset-8 rounded-full border border-dashed border-emerald-500/40 animate-[spin_12s_linear_infinite]" />
            <div className="absolute inset-16 rounded-full border border-emerald-500/40" />

            {/* Rotating Radar Sweep Cone */}
            <div className="absolute inset-2 rounded-full overflow-hidden pointer-events-none animate-[spin_4s_linear_infinite]">
              <div className="w-full h-full bg-[conic-gradient(from_0deg,transparent_0deg,transparent_270deg,rgba(0,230,118,0.35)_360deg)] rounded-full" />
            </div>

            {/* Orbiting / Nearby Runner Dots */}
            <div className="absolute top-8 right-12 w-3 h-3 rounded-full bg-[#00E676] shadow-[0_0_12px_#00E676] animate-bounce" />
            <div className="absolute bottom-10 left-10 w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_#00E676] animate-pulse" />
            <div className="absolute top-20 left-6 w-2 h-2 rounded-full bg-emerald-300 shadow-[0_0_8px_#00E676]" />

            {/* Central Pickup / Vending Machine Beacon */}
            <div className="relative z-10 w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-[#00C853] to-[#00E676] flex items-center justify-center shadow-[0_0_35px_rgba(0,230,118,0.5)] border-2 border-white/40">
              <Store size={32} className="text-[#050805] animate-pulse" />
            </div>
          </div>

          {/* Radar Status Headlines */}
          <div className="relative z-10 max-w-md space-y-2 mt-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[#00E676] text-xs font-black uppercase tracking-wider">
              <Radio size={13} className="animate-pulse" /> Searching for Nearby Runners
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Broadcasting on Campus
            </h2>
            <p className="text-xs sm:text-sm text-[#A7B8B0]">
              Looking for student runners near{" "}
              <strong className="text-white">{request.pickup_location}</strong> to deliver to{" "}
              <strong className="text-emerald-300">{request.dropoff_location}</strong>.
            </p>
          </div>

          {/* Live Metrics Grid */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 w-full max-w-lg mt-6 pt-6 border-t border-white/10 text-center">
            <div className="p-3 rounded-2xl bg-black/40 border border-white/10 flex flex-col items-center">
              <Clock size={16} className="text-emerald-400 mb-1" />
              <span className="text-base sm:text-lg font-black text-white font-mono">
                {formatTimer(elapsedSeconds)}
              </span>
              <span className="text-[10px] text-[#A7B8B0]">Search Time</span>
            </div>

            <div className="p-3 rounded-2xl bg-black/40 border border-white/10 flex flex-col items-center">
              <Compass size={16} className="text-[#00E676] mb-1" />
              <span className="text-base sm:text-lg font-black text-[#00E676] font-mono">
                ~2–4 min
              </span>
              <span className="text-[10px] text-[#A7B8B0]">Est. Acceptance</span>
            </div>

            <div className="p-3 rounded-2xl bg-black/40 border border-white/10 flex flex-col items-center">
              <IndianRupee size={16} className="text-emerald-400 mb-1" />
              <span className="text-base sm:text-lg font-black text-white font-mono">
                ₹{request.delivery_fee}
              </span>
              <span className="text-[10px] text-[#A7B8B0]">Runner Payout</span>
            </div>
          </div>

          {/* Quick Tip Booster */}
          <div className="w-full max-w-lg mt-6 p-4 rounded-2xl bg-emerald-500/[0.07] border border-emerald-500/25 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-center sm:text-left">
              <p className="text-xs font-bold text-white flex items-center justify-center sm:justify-start gap-1">
                <Sparkles size={14} className="text-[#00E676]" />
                Speed up matching?
              </p>
              <p className="text-[11px] text-[#A7B8B0]">
                Boost reward to get priority runner pickup immediately.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={isBoosting}
                onClick={() => handleBoostReward(5)}
                className="px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30 text-xs font-extrabold cursor-pointer transition-all active:scale-95 disabled:opacity-50"
              >
                +₹5 Tip
              </button>
              <button
                type="button"
                disabled={isBoosting}
                onClick={() => handleBoostReward(10)}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#00C853] to-[#00E676] text-[#050805] text-xs font-black cursor-pointer transition-all shadow-[0_0_15px_rgba(0,230,118,0.3)] hover:shadow-[0_0_25px_rgba(0,230,118,0.5)] active:scale-95 disabled:opacity-50"
              >
                +₹10 Tip ⚡
              </button>
            </div>
          </div>

          {/* Cancel Option */}
          <div className="mt-5">
            <button
              type="button"
              disabled={isCancelling}
              onClick={handleCancel}
              className="text-xs text-red-400/80 hover:text-red-400 underline cursor-pointer disabled:opacity-50 transition-colors"
            >
              {isCancelling ? "Cancelling request..." : "Cancel this request"}
            </button>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* ── CASE 2: ACTIVE ORDER TRACKER (MATCHED / ON THE WAY) ───── */}
      {/* ============================================================ */}
      {request.status !== "pending" && (
        <>
          {/* Top Status & Runner Alert Banner */}
          <div
            className={cn(
              "p-5 rounded-3xl border-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-[0_0_30px_rgba(0,0,0,0.4)]",
              request.status === "delivered"
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                : request.status === "cancelled"
                ? "bg-red-500/10 border-red-500/30 text-red-300"
                : "bg-gradient-to-r from-[#0e1712] via-[#09120c] to-[#0e1712] border-emerald-500/40"
            )}
          >
            <div className="flex items-center gap-3.5">
              <div
                className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 text-xl font-bold shadow-md",
                  request.status === "delivered"
                    ? "bg-emerald-500 text-black shadow-[0_0_15px_#00E676]"
                    : request.status === "cancelled"
                    ? "bg-red-500/20 text-red-400 border border-red-500/30"
                    : "bg-emerald-500/20 text-[#00E676] border border-emerald-500/40 animate-pulse"
                )}
              >
                {request.status === "delivered" ? (
                  <Check size={26} />
                ) : request.status === "cancelled" ? (
                  <X size={26} />
                ) : (
                  <Truck size={24} />
                )}
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-extrabold text-white">
                  {request.status === "accepted" && "Runner Matched & Heading to Pickup"}
                  {request.status === "picked_up" && "Items Picked Up from Spot"}
                  {request.status === "in_transit" && "Runner On the Way to Your Room"}
                  {request.status === "delivered" && "Order Delivered Successfully! 🎉"}
                  {request.status === "cancelled" && "Request Cancelled"}
                </h2>
                <p className="text-xs text-[#A7B8B0] mt-0.5">
                  {request.status === "accepted" &&
                    "Runner is collecting your items. Keep your Handover PIN ready."}
                  {request.status === "picked_up" &&
                    "Items safely collected and heading towards your hostel."}
                  {request.status === "in_transit" &&
                    `Runner is arriving at ${request.dropoff_location}.`}
                  {request.status === "delivered" &&
                    "Escrow delivery reward has been released to your runner."}
                  {request.status === "cancelled" && "This delivery request has been closed."}
                </p>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="text-xs text-[#A7B8B0] block">Runner Reward</span>
              <span className="text-xl font-black text-[#00E676]">₹{request.delivery_fee}</span>
            </div>
          </div>

          {/* Handover Security PIN Card (Visible until delivered) */}
          {!["delivered", "cancelled"].includes(request.status) && (
            <div className="bg-gradient-to-r from-emerald-950/70 via-[#0c1a11] to-emerald-950/70 border-2 border-emerald-500/50 rounded-3xl p-5 sm:p-6 shadow-[0_0_35px_rgba(0,230,118,0.2)] flex flex-col sm:flex-row items-center justify-between gap-5">
              <div className="space-y-1 text-center sm:text-left">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-[11px] font-black uppercase tracking-wider text-emerald-300">
                  <ShieldCheck size={13} className="text-[#00E676]" />
                  Delivery Handover PIN
                </div>
                <h3 className="text-base sm:text-lg font-black text-white">
                  Share this 4-digit PIN with your runner
                </h3>
                <p className="text-xs text-zinc-300 max-w-md">
                  The runner cannot complete this order or claim payment without this PIN. Share it
                  only when you physically receive your items.
                </p>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex items-center gap-2">
                  {displayPin.split("").map((digit, i) => (
                    <div
                      key={i}
                      className="w-11 h-13 sm:w-13 sm:h-15 rounded-2xl bg-black/85 border-2 border-[#00E676] flex items-center justify-center font-mono text-2xl sm:text-3xl font-black text-[#00E676] shadow-[0_0_20px_rgba(0,230,118,0.35)] select-all"
                    >
                      {digit}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={handleCopyOtp}
                  className="p-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 text-white transition-colors cursor-pointer"
                  title="Copy PIN"
                >
                  {copiedOtp ? (
                    <Check size={18} className="text-[#00E676]" />
                  ) : (
                    <Copy size={18} />
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Dynamic Stages Timeline */}
          <div className="p-5 sm:p-6 rounded-3xl bg-[#0e1612]/95 border border-white/10 shadow-[0_4px_25px_rgba(0,0,0,0.4)]">
            <h4 className="text-xs font-bold text-[#A7B8B0] uppercase tracking-wider mb-5">
              Live Order Stages
            </h4>
            <div className="relative flex items-center justify-between w-full">
              {/* Background Track Line */}
              <div className="absolute left-4 right-4 top-4 -translate-y-1/2 h-1 bg-white/10 rounded-full" />
              {/* Active Progress Line */}
              <div
                className="absolute left-4 top-4 -translate-y-1/2 h-1 bg-[#00E676] rounded-full transition-all duration-700 shadow-[0_0_10px_#00E676]"
                style={{
                  width: `calc(${(currentStageIndex / (STAGES.length - 1)) * 100}% - 8px)`,
                }}
              />

              {STAGES.map((st, idx) => {
                const Icon = st.icon;
                const isCompleted = idx < currentStageIndex;
                const isCurrent = idx === currentStageIndex;

                return (
                  <div key={st.id} className="relative flex flex-col items-center z-10">
                    <div
                      className={cn(
                        "w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all duration-300",
                        isCompleted
                          ? "bg-[#00E676] text-[#050805] shadow-[0_0_12px_#00E676]"
                          : isCurrent
                          ? "bg-gradient-to-r from-[#00C853] to-[#00E676] text-[#050805] ring-4 ring-emerald-500/30 shadow-[0_0_18px_#00E676] animate-pulse"
                          : "bg-black/60 border border-white/15 text-white/30"
                      )}
                    >
                      <Icon size={16} />
                    </div>
                    <span
                      className={cn(
                        "mt-2 text-[10px] sm:text-xs font-bold text-center leading-tight max-w-[65px] sm:max-w-none",
                        isCurrent
                          ? "text-[#00E676]"
                          : isCompleted
                          ? "text-white"
                          : "text-white/30"
                      )}
                    >
                      {st.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* ============================================================ */}
      {/* ── RUNNER PROFILE & DETAILS SECTION ──────────────────────── */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Runner Information */}
        <div className="space-y-4">
          <div className="p-5 rounded-3xl bg-[#0e1612]/95 border border-white/10 shadow-lg flex flex-col gap-4">
            <h4 className="text-xs font-bold text-[#00E676] uppercase tracking-wider flex items-center gap-1.5">
              <User size={14} /> Assigned Student Runner
            </h4>

            {runner ? (
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-black/40 border border-white/10">
                  <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center text-xl font-black text-white shadow-[0_0_15px_rgba(0,230,118,0.25)] shrink-0">
                    {runner.full_name?.charAt(0).toUpperCase() || "R"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-extrabold text-white text-base truncate">
                        {runner.full_name || `Student Runner`}
                      </p>
                      <span className="text-[10px] bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-bold px-2 py-0.5 rounded-full shrink-0">
                        Verified
                      </span>
                    </div>
                    <p className="text-xs text-[#A7B8B0] truncate mt-0.5">
                      Campus Student Runner • UniVerse Verified
                    </p>
                  </div>
                </div>

                {/* Direct Action: Chat with Runner */}
                <Link
                  href={`/dashboard/chat?requestId=${request.id}&startWithUserId=${runner.id}`}
                  className="w-full bg-gradient-to-r from-[#00C853] to-[#00E676] hover:from-[#00E676] hover:to-[#00C853] text-[#050805] font-extrabold text-sm p-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,230,118,0.3)] transition-all active:scale-[0.99]"
                >
                  <MessageSquare size={16} />
                  Message {runner.full_name?.split(" ")[0] || "Runner"}
                  <ArrowUpRight size={15} />
                </Link>
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-black/40 border border-dashed border-white/15 text-center flex flex-col items-center gap-2">
                <Radio size={24} className="text-[#00E676] animate-pulse" />
                <p className="text-sm font-bold text-white">Awaiting Runner Pickup</p>
                <p className="text-xs text-[#A7B8B0]">
                  Nearby campus runners have been notified. You will receive an instant audio &
                  visual alert when accepted.
                </p>
              </div>
            )}
          </div>

          {/* Delivery Locations */}
          <div className="p-5 rounded-3xl bg-[#0e1612]/95 border border-white/10 shadow-lg space-y-4">
            <h4 className="text-xs font-bold text-[#00E676] uppercase tracking-wider flex items-center gap-1.5">
              <MapPin size={14} /> Logistics Details
            </h4>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-1">
                <span className="text-[10px] uppercase tracking-wider text-[#A7B8B0] font-bold">
                  Pickup Location
                </span>
                <p className="font-extrabold text-white text-sm">{request.pickup_location}</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-1">
                <span className="text-[10px] uppercase tracking-wider text-[#A7B8B0] font-bold">
                  Delivery Destination
                </span>
                <p className="font-extrabold text-[#00E676] text-sm">
                  {request.dropoff_location}
                </p>
              </div>

              {request.instructions && (
                <div className="p-3.5 rounded-2xl bg-emerald-500/[0.05] border border-emerald-500/20 space-y-1">
                  <span className="text-[10px] uppercase tracking-wider text-emerald-400 font-bold flex items-center gap-1">
                    <FileText size={12} /> Notes for Runner
                  </span>
                  <p className="text-zinc-300 text-xs italic">{request.instructions}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Requested Items & Financial Breakdown */}
        <div className="space-y-4">
          <div className="p-5 rounded-3xl bg-[#0e1612]/95 border border-white/10 shadow-lg space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-bold text-[#00E676] uppercase tracking-wider flex items-center gap-1.5">
                <Package size={14} /> Requested Items ({request.items?.length || 0})
              </h4>
              <span className="text-xs font-mono text-[#A7B8B0]">
                Est. ~₹{request.total_estimated_amount}
              </span>
            </div>

            <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-emerald-500/30 [&::-webkit-scrollbar-thumb]:rounded-full">
              {request.items?.map((it) => (
                <div
                  key={it.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-black/40 border border-white/10 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-[#00E676] font-black bg-emerald-500/15 border border-emerald-500/25 px-2 py-0.5 rounded-md">
                      {it.quantity}x
                    </span>
                    <span className="text-white font-semibold">{it.name}</span>
                  </div>
                  <span className="text-[#A7B8B0] font-mono">
                    {it.estimated_price ? `~₹${it.estimated_price * it.quantity}` : "Custom"}
                  </span>
                </div>
              ))}
            </div>

            {/* Financial Summary */}
            <div className="pt-3 border-t border-white/10 space-y-2 text-xs">
              <div className="flex justify-between text-[#A7B8B0]">
                <span>Items Estimated Cost</span>
                <span className="font-mono text-white">~₹{request.total_estimated_amount}</span>
              </div>
              <div className="flex justify-between text-[#A7B8B0]">
                <span>Campus Runner Reward</span>
                <span className="font-mono text-[#00E676] font-bold">
                  ₹{request.delivery_fee}
                </span>
              </div>
              <div className="flex justify-between text-white font-bold pt-2 border-t border-white/5 text-sm">
                <span>Total Expected Amount</span>
                <span className="font-mono text-[#00E676]">
                  ~₹{request.total_estimated_amount + request.delivery_fee}
                </span>
              </div>
            </div>
          </div>

          {/* Request Meta Card */}
          <div className="p-4 rounded-3xl bg-black/30 border border-white/10 text-xs text-[#A7B8B0] flex items-center justify-between">
            <span>
              Request ID:{" "}
              <strong className="text-white font-mono">
                #{request.id.substring(0, 8).toUpperCase()}
              </strong>
            </span>
            <span>{format(new Date(request.created_at), "MMM d, h:mm a")}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
