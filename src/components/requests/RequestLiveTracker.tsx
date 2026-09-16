"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { format } from "date-fns";
import {
  MapPin,
  Package,
  User,
  FileText,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Truck,
  Copy,
  Check,
  Radio,
  ArrowUpRight,
  Volume2,
  VolumeX,
  X,
  Store,
  Navigation,
  Activity,
  Flame,
  ArrowRight,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { updateRequestStatus, type StudentRequestWithDetails } from "@/lib/database/requests";

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
  const [boostSuccessMsg, setBoostSuccessMsg] = useState<string | null>(null);

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
        setBoostSuccessMsg(`Reward boosted by +₹${boostAmount}! Now ₹${newFee}`);
        setTimeout(() => setBoostSuccessMsg(null), 3500);
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
      const success = await updateRequestStatus(supabase, request.id, "cancelled");
      if (success) {
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
      {/* ── Top Header Toolbar ── */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center justify-center">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="w-4 h-4 rounded-full border border-emerald-400/50 animate-ping absolute opacity-40" />
          </div>
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 flex items-center gap-1.5">
            Live Campus Radar
            <span className="text-white/20">•</span>
            <span className="text-zinc-400 font-mono text-[11px]">Real-Time Sync</span>
          </span>
        </div>

        <button
          type="button"
          onClick={() => setSoundEnabled(!soundEnabled)}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all cursor-pointer",
            soundEnabled
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
              : "bg-white/[0.04] border-white/10 text-white/40 hover:text-white"
          )}
          title={soundEnabled ? "Notification sound active" : "Sound muted"}
        >
          {soundEnabled ? (
            <>
              <Volume2 size={14} className="text-emerald-400" />
              <span className="hidden sm:inline">Chime Active</span>
              <span className="flex gap-0.5 items-end h-3 ml-0.5">
                <span className="w-0.5 h-1.5 bg-emerald-400 rounded-full" />
                <span className="w-0.5 h-3 bg-emerald-400 rounded-full" />
                <span className="w-0.5 h-2 bg-emerald-400 rounded-full" />
              </span>
            </>
          ) : (
            <>
              <VolumeX size={14} className="text-white/40" />
              <span className="hidden sm:inline">Muted</span>
            </>
          )}
        </button>
      </div>

      {/* Celebration Banner when runner is matched */}
      {showCelebration && (
        <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/95 border border-emerald-500/40 text-white shadow-xl flex items-center justify-between animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-bold text-xl">
              ⚡
            </div>
            <div>
              <p className="font-bold text-base sm:text-lg text-white tracking-tight">
                Runner Found &amp; Matched!
              </p>
              <p className="text-xs sm:text-sm text-emerald-300">
                <strong className="text-white">{runner?.full_name || "A campus runner"}</strong> has
                accepted your request and is heading to the pickup spot.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowCelebration(false)}
            className="text-white/60 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* ============================================================ */}
      {/* ── CASE 1: SCI-FI / RAPIDO CAMPUS RADAR (PENDING STATE) ─── */}
      {/* ============================================================ */}
      {request.status === "pending" && (
        <div className="relative overflow-hidden rounded-2xl bg-zinc-900/60 border border-white/10 p-6 sm:p-10 flex flex-col items-center text-center shadow-sm backdrop-blur-md">
          {/* Tactical Monospace Frequency Tags */}
          <div className="w-full flex items-center justify-between text-[10px] font-mono text-zinc-400 pb-2">
            <span className="hidden sm:inline">RADAR FREQ: 5.8 GHz // CH-04</span>
            <span className="bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20 text-emerald-400 font-semibold">
              ● 14 CAMPUS RUNNERS NEARBY
            </span>
            <span className="hidden sm:inline">LATENCY: ~18ms MESH</span>
          </div>

          {/* ── High-Tech Circular Holographic Radar ── */}
          <div className="relative w-56 h-56 sm:w-72 sm:h-72 flex items-center justify-center my-6">
            {/* Coordinate Ring 4 (Outermost) */}
            <div className="absolute inset-0 rounded-full border border-emerald-500/20" />
            <div className="absolute inset-0 rounded-full border border-dashed border-emerald-500/25 animate-[spin_35s_linear_infinite]" />

            {/* Coordinate Ring 3 */}
            <div className="absolute inset-8 sm:inset-10 rounded-full border border-emerald-500/15" />
            <span className="absolute top-1 sm:top-2 text-[8px] sm:text-[9px] font-mono text-emerald-400/40">
              300m
            </span>

            {/* Coordinate Ring 2 */}
            <div className="absolute inset-16 sm:inset-20 rounded-full border border-emerald-500/20" />
            <span className="absolute top-10 sm:top-12 text-[8px] sm:text-[9px] font-mono text-emerald-400/40">
              200m
            </span>

            {/* Coordinate Ring 1 */}
            <div className="absolute inset-24 sm:inset-28 rounded-full border border-dashed border-emerald-500/25" />

            {/* Compass Axis Crosshairs */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="h-full w-[1px] bg-gradient-to-b from-transparent via-emerald-500/20 to-transparent" />
            </div>

            {/* Compass Cardinal Points */}
            <span className="absolute -top-1 text-[9px] font-bold font-mono text-emerald-400/70">N</span>
            <span className="absolute -bottom-1 text-[9px] font-bold font-mono text-emerald-400/70">S</span>
            <span className="absolute -right-1 text-[9px] font-bold font-mono text-emerald-400/70">E</span>
            <span className="absolute -left-1 text-[9px] font-bold font-mono text-emerald-400/70">W</span>

            {/* Rotating Radar Sweep Cone */}
            <div className="absolute inset-1 rounded-full overflow-hidden pointer-events-none animate-[spin_4s_linear_infinite]">
              <div className="w-full h-full bg-[conic-gradient(from_0deg,transparent_0deg,transparent_270deg,rgba(16,185,129,0.06)_330deg,rgba(16,185,129,0.25)_360deg)] rounded-full" />
            </div>

            {/* Simulated Active Runner Pings on Radar */}
            {/* Runner 1 (Top-Right) */}
            <div className="absolute top-10 right-14 flex items-center gap-1 group cursor-default">
              <div className="relative flex items-center justify-center">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="w-5 h-5 rounded-full border border-emerald-400/50 animate-ping absolute opacity-50" />
              </div>
              <span className="hidden sm:inline text-[9px] font-mono font-medium text-emerald-300 bg-zinc-950/80 px-1.5 py-0.5 rounded border border-emerald-500/20">
                Runner • 140m
              </span>
            </div>

            {/* Runner 2 (Bottom-Left) */}
            <div className="absolute bottom-12 left-10 flex items-center gap-1 group cursor-default">
              <div className="relative flex items-center justify-center">
                <span className="w-2 h-2 rounded-full bg-emerald-400/80" />
              </div>
              <span className="hidden sm:inline text-[9px] font-mono font-medium text-emerald-300 bg-zinc-950/80 px-1.5 py-0.5 rounded border border-emerald-500/20">
                Runner • 220m
              </span>
            </div>

            {/* Runner 3 (Top-Left) */}
            <div className="absolute top-24 left-8 flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400/60" />
            </div>

            {/* Central Beacon: Target Reticle + Pickup Beacon */}
            <div className="relative z-10 w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center">
              <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center justify-center shadow-md">
                <Store size={22} />
              </div>
            </div>
          </div>

          {/* Status Badge & Headline */}
          <div className="relative z-10 max-w-lg space-y-2 mt-1">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-semibold tracking-wide">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
              </span>
              Broadcasting on Campus Network
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Looking for Student Runners
            </h2>

            {/* Route Flow Ribbon */}
            <div className="p-3 sm:p-3.5 rounded-xl bg-zinc-950/60 border border-white/10 flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 min-w-0 text-left">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/25">
                  <MapPin size={13} />
                </div>
                <div className="truncate">
                  <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">Pickup</span>
                  <strong className="text-white text-xs truncate block">{request.pickup_location}</strong>
                </div>
              </div>

              <div className="flex items-center gap-1 text-emerald-400 shrink-0 font-mono text-xs px-2">
                <ArrowRight size={14} />
              </div>

              <div className="flex items-center gap-2 min-w-0 text-right justify-end">
                <div className="truncate">
                  <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">Deliver To</span>
                  <strong className="text-emerald-400 text-xs truncate block">{request.dropoff_location}</strong>
                </div>
                <div className="w-6 h-6 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/25">
                  <Navigation size={13} />
                </div>
              </div>
            </div>
          </div>

          {/* Live Metrics HUD */}
          <div className="grid grid-cols-3 gap-2.5 sm:gap-4 w-full max-w-xl mt-6 pt-6 border-t border-white/10 text-center">
            {/* Tile 1: Search Time */}
            <div className="p-3.5 rounded-xl bg-zinc-950/50 border border-white/10 flex flex-col items-center">
              <div className="flex items-center gap-1 text-zinc-400 text-[10px] uppercase font-semibold tracking-wider mb-1">
                <Clock size={12} className="text-emerald-400" /> Duration
              </div>
              <span className="text-base sm:text-xl font-bold text-white font-mono tracking-tight">
                {formatTimer(elapsedSeconds)}
              </span>
              <span className="text-[10px] text-zinc-400 mt-0.5">● Live Timer</span>
            </div>

            {/* Tile 2: Estimated Acceptance */}
            <div className="p-3.5 rounded-xl bg-zinc-950/50 border border-white/10 flex flex-col items-center">
              <div className="flex items-center gap-1 text-zinc-400 text-[10px] uppercase font-semibold tracking-wider mb-1">
                <Activity size={12} className="text-emerald-400" /> Est. Match
              </div>
              <span className="text-base sm:text-xl font-bold text-emerald-400 font-mono tracking-tight">
                ~2–4 min
              </span>
              <span className="text-[10px] text-zinc-400 mt-0.5">High Density</span>
            </div>

            {/* Tile 3: Runner Payout */}
            <div className="p-3.5 rounded-xl bg-zinc-950/50 border border-white/10 flex flex-col items-center">
              <div className="flex items-center gap-1 text-zinc-400 text-[10px] uppercase font-semibold tracking-wider mb-1">
                <ShieldCheck size={12} className="text-emerald-400" /> Reward
              </div>
              <span className="text-base sm:text-xl font-bold text-white font-mono tracking-tight">
                ₹{request.delivery_fee}
              </span>
              <span className="text-[10px] text-zinc-400 mt-0.5">Escrow Locked</span>
            </div>
          </div>

          {/* Quick Tip Booster Banner */}
          <div className="w-full max-w-xl mt-6 p-4 rounded-xl bg-zinc-950/60 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-center sm:text-left">
              <p className="text-xs font-bold text-white flex items-center justify-center sm:justify-start gap-1.5">
                <Flame size={14} className="text-amber-400" />
                Increase Matching Speed
              </p>
              <p className="text-[11px] text-zinc-400">
                Add a small tip to prioritize your order for nearby campus runners.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                disabled={isBoosting}
                onClick={() => handleBoostReward(5)}
                className="px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] border border-white/15 text-zinc-200 text-xs font-medium cursor-pointer transition-all active:scale-95 disabled:opacity-50"
              >
                +₹5 Tip
              </button>
              <button
                type="button"
                disabled={isBoosting}
                onClick={() => handleBoostReward(10)}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold cursor-pointer transition-all active:scale-95 disabled:opacity-50"
              >
                +₹10 Boost ⚡
              </button>
            </div>
          </div>

          {/* Boost Success Feedback Alert */}
          {boostSuccessMsg && (
            <div className="mt-3 px-4 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
              {boostSuccessMsg}
            </div>
          )}

          {/* Cancel Option */}
          <div className="mt-6">
            <button
              type="button"
              disabled={isCancelling}
              onClick={handleCancel}
              className="text-xs text-red-400/80 hover:text-red-300 underline cursor-pointer disabled:opacity-50 transition-colors"
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
          {/* Top Status Banner */}
          <div
            className={cn(
              "p-5 sm:p-6 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm backdrop-blur-md",
              request.status === "delivered"
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                : request.status === "cancelled"
                ? "bg-red-500/10 border-red-500/30 text-red-300"
                : "bg-zinc-900/60 border-white/10"
            )}
          >
            <div className="flex items-center gap-3.5">
              <div
                className={cn(
                  "w-11 h-11 rounded-xl flex items-center justify-center shrink-0 text-xl font-bold",
                  request.status === "delivered"
                    ? "bg-emerald-500 text-zinc-950"
                    : request.status === "cancelled"
                    ? "bg-red-500/20 text-red-400 border border-red-500/30"
                    : "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                )}
              >
                {request.status === "delivered" ? (
                  <Check size={22} />
                ) : request.status === "cancelled" ? (
                  <X size={22} />
                ) : (
                  <Truck size={22} />
                )}
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white">
                  {request.status === "accepted" && "Runner Matched & Heading to Pickup"}
                  {request.status === "picked_up" && "Items Picked Up from Spot"}
                  {request.status === "in_transit" && "Runner On the Way to Your Room"}
                  {request.status === "delivered" && "Order Delivered Successfully! 🎉"}
                  {request.status === "cancelled" && "Request Cancelled"}
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
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
              <span className="text-xs text-zinc-400 block">Runner Reward</span>
              <span className="text-xl sm:text-2xl font-bold text-emerald-400 font-mono">₹{request.delivery_fee}</span>
            </div>
          </div>

          {/* Handover Security PIN Card (Visible until delivered) */}
          {!["delivered", "cancelled"].includes(request.status) && (
            <div className="bg-zinc-900/60 border border-white/10 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-5 backdrop-blur-md">
              <div className="space-y-1.5 text-center sm:text-left">
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-bold uppercase tracking-wider text-emerald-300">
                  <ShieldCheck size={13} className="text-emerald-400" />
                  Delivery Handover PIN
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white">
                  Share this 4-digit PIN with your runner
                </h3>
                <p className="text-xs text-zinc-400 max-w-md">
                  The runner cannot complete this order or claim payment without this PIN. Share it
                  only when you physically receive your items.
                </p>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex items-center gap-2">
                  {displayPin.split("").map((digit, i) => (
                    <div
                      key={i}
                      className="w-12 h-14 sm:w-14 sm:h-16 rounded-xl bg-zinc-950/80 border border-emerald-500/30 flex items-center justify-center font-mono text-2xl sm:text-3xl font-bold text-emerald-300 shadow-sm select-all"
                    >
                      {digit}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={handleCopyOtp}
                  className="p-3.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 text-white transition-colors cursor-pointer active:scale-95"
                  title="Copy PIN"
                >
                  {copiedOtp ? (
                    <Check size={18} className="text-emerald-400" />
                  ) : (
                    <Copy size={18} />
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Dynamic Stages Timeline */}
          <div className="p-5 sm:p-6 rounded-2xl bg-zinc-900/60 border border-white/10 shadow-sm backdrop-blur-md">
            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-5 flex items-center justify-between">
              <span>Live Order Progress</span>
              <span className="text-emerald-400 font-mono text-[11px]">
                Stage {currentStageIndex + 1} of {STAGES.length}
              </span>
            </h4>
            <div className="relative flex items-center justify-between w-full">
              {/* Background Track Line */}
              <div className="absolute left-4 right-4 top-4 -translate-y-1/2 h-1 bg-white/10 rounded-full" />
              {/* Active Progress Line */}
              <div
                className="absolute left-4 top-4 -translate-y-1/2 h-1 bg-emerald-500 rounded-full transition-all duration-700"
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
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                          : isCurrent
                          ? "bg-emerald-500 text-zinc-950 font-bold ring-4 ring-emerald-500/20"
                          : "bg-zinc-900 border border-white/15 text-white/30"
                      )}
                    >
                      <Icon size={16} />
                    </div>
                    <span
                      className={cn(
                        "mt-2 text-[10px] sm:text-xs font-bold text-center leading-tight max-w-[65px] sm:max-w-none",
                        isCurrent
                          ? "text-emerald-400 font-extrabold"
                          : isCompleted
                          ? "text-zinc-200"
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
          <div className="p-5 sm:p-6 rounded-2xl bg-zinc-900/60 border border-white/10 shadow-sm backdrop-blur-md flex flex-col gap-4">
            <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <User size={14} /> Assigned Student Runner
            </h4>

            {runner ? (
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-zinc-950/60 border border-white/10">
                  <div className="w-11 h-11 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-lg font-bold text-emerald-300 shrink-0">
                    {runner.full_name?.charAt(0).toUpperCase() || "R"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-white text-sm truncate">
                        {runner.full_name || `Student Runner`}
                      </p>
                      <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full shrink-0">
                        Verified
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 truncate mt-0.5">
                      Campus Student Runner • UniVerse Verified
                    </p>
                  </div>
                </div>

                {/* Direct Action: Chat with Runner */}
                <Link
                  href={`/dashboard/chat?requestId=${request.id}&startWithUserId=${runner.id}`}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-sm py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm active:scale-[0.99]"
                >
                  <MessageSquare size={16} />
                  Message {runner.full_name?.split(" ")[0] || "Runner"}
                  <ArrowUpRight size={15} />
                </Link>
              </div>
            ) : (
              <div className="p-6 rounded-xl bg-zinc-950/40 border border-dashed border-white/15 text-center flex flex-col items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Radio size={18} />
                </div>
                <p className="text-sm font-bold text-white">Awaiting Runner Pickup</p>
                <p className="text-xs text-zinc-400 max-w-xs">
                  Nearby campus runners have received your request notification. You will hear an instant audio chime when matched.
                </p>
              </div>
            )}
          </div>

          {/* Delivery Locations */}
          <div className="p-5 sm:p-6 rounded-2xl bg-zinc-900/60 border border-white/10 shadow-sm backdrop-blur-md space-y-4">
            <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin size={14} /> Logistics Route
            </h4>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-zinc-950/60 border border-white/10 space-y-1">
                <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold flex items-center gap-1">
                  <Store size={12} className="text-emerald-400" /> Pickup Spot
                </span>
                <p className="font-bold text-white text-sm">{request.pickup_location}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-950/60 border border-white/10 space-y-1">
                <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold flex items-center gap-1">
                  <Navigation size={12} className="text-emerald-400" /> Destination Room
                </span>
                <p className="font-bold text-emerald-400 text-sm">
                  {request.dropoff_location}
                </p>
              </div>

              {request.instructions && (
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10 space-y-1">
                  <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold flex items-center gap-1">
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
          <div className="p-5 sm:p-6 rounded-2xl bg-zinc-900/60 border border-white/10 shadow-sm backdrop-blur-md space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <Package size={14} /> Requested Items ({request.items?.length || 0})
              </h4>
              <span className="text-xs font-mono text-zinc-400">
                Est. ~₹{request.total_estimated_amount}
              </span>
            </div>

            <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-emerald-500/30 [&::-webkit-scrollbar-thumb]:rounded-full">
              {request.items?.map((it) => (
                <div
                  key={it.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-zinc-950/60 border border-white/10 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                      {it.quantity}x
                    </span>
                    <span className="text-white font-medium">{it.name}</span>
                  </div>
                  <span className="text-emerald-400 font-mono font-semibold">
                    {it.estimated_price ? `~₹${it.estimated_price * it.quantity}` : "Custom"}
                  </span>
                </div>
              ))}
            </div>

            {/* Financial Summary */}
            <div className="pt-3.5 border-t border-white/10 space-y-2 text-xs">
              <div className="flex justify-between text-zinc-400">
                <span>Estimated Items Cost</span>
                <span className="font-mono text-white">~₹{request.total_estimated_amount}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Campus Runner Reward</span>
                <span className="font-mono text-emerald-400 font-semibold">
                  ₹{request.delivery_fee}
                </span>
              </div>
              <div className="flex justify-between text-white font-bold pt-2.5 border-t border-white/10 text-sm">
                <span>Total Expected Amount</span>
                <span className="font-mono text-emerald-400 text-base">
                  ~₹{request.total_estimated_amount + request.delivery_fee}
                </span>
              </div>
            </div>
          </div>

          {/* Request Meta Card */}
          <div className="p-4 rounded-2xl bg-zinc-950/50 border border-white/10 text-xs text-zinc-400 flex items-center justify-between backdrop-blur-md">
            <span>
              Request ID:{" "}
              <strong className="text-white font-mono">
                #{request.id.substring(0, 8).toUpperCase()}
              </strong>
            </span>
            <span className="font-mono">{format(new Date(request.created_at), "MMM d, h:mm a")}</span>
          </div>

          {["accepted", "picked_up", "in_transit"].includes(request.status) && (
            <div className="text-center pt-2">
              <button
                type="button"
                disabled={isCancelling}
                onClick={handleCancel}
                className="text-xs text-red-400/80 hover:text-red-300 underline cursor-pointer disabled:opacity-50 transition-colors"
              >
                {isCancelling ? "Cancelling order..." : "Cancel this order (Runner Inactive / Abandoned)"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
