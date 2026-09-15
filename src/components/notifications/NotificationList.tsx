"use client";

import { useState, useMemo, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  CheckCheck,
  CheckCircle2,
  MapPin,
  AlertCircle,
  Truck,
  Bike,
  FileText,
  Trash2,
  Volume2,
  VolumeX,
  Sparkles,
  ArrowRight,
  Clock,
  Radio,
  Check,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useRealtime } from "@/providers/RealtimeProvider";
import { Notification } from "@/lib/database/notifications";
import { sounds } from "@/lib/audio";

interface NotificationListProps {
  onClose: () => void;
}

type NotificationCategory = "all" | "unread" | "delivery" | "request" | "runner";

export function NotificationList({ onClose }: NotificationListProps) {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
  } = useRealtime();

  const [selectedCategory, setSelectedCategory] = useState<NotificationCategory>("all");
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isClearing, setIsClearing] = useState<boolean>(false);
  const router = useRouter();

  // Initialize sound preference from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("universe_sound_enabled");
      const isEnabled = stored !== "false";
      setSoundEnabled(isEnabled);
      sounds.enabled = isEnabled;
    }
  }, []);

  const toggleSound = () => {
    const nextState = !soundEnabled;
    setSoundEnabled(nextState);
    sounds.enabled = nextState;
    if (typeof window !== "undefined") {
      localStorage.setItem("universe_sound_enabled", String(nextState));
    }
    if (nextState) {
      sounds.playReceive();
    }
  };

  // Helper to categorize notifications
  const getCategory = (notif: Notification): "delivery" | "request" | "runner" => {
    const t = notif.type.toLowerCase();
    const title = notif.title.toLowerCase();

    if (
      t.includes("delivery") ||
      t.includes("picked_up") ||
      t.includes("in_transit") ||
      t.includes("delivered")
    ) {
      return "delivery";
    }
    if (t.includes("runner") || title.includes("runner")) {
      return "runner";
    }
    return "request";
  };

  // Badge counts per filter
  const counts = useMemo(() => {
    let deliveryCount = 0;
    let requestCount = 0;
    let runnerCount = 0;

    notifications.forEach((notif) => {
      const cat = getCategory(notif);
      if (cat === "delivery") deliveryCount++;
      else if (cat === "runner") runnerCount++;
      else requestCount++;
    });

    return {
      all: notifications.length,
      unread: unreadCount,
      delivery: deliveryCount,
      request: requestCount,
      runner: runnerCount,
    };
  }, [notifications, unreadCount]);

  // Filter & sort
  const filteredNotifications = useMemo(() => {
    return notifications
      .filter((notif) => {
        if (selectedCategory === "all") return true;
        if (selectedCategory === "unread") return !notif.is_read;
        return getCategory(notif) === selectedCategory;
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [notifications, selectedCategory]);

  const handleNotificationClick = (notif: Notification) => {
    if (!notif.is_read) {
      markAsRead(notif.id);
    }
    onClose();

    if (notif.reference_id) {
      router.push(`/dashboard/requests/${notif.reference_id}`);
    } else {
      router.push("/dashboard/requests");
    }
  };

  const handleClearAll = async () => {
    if (notifications.length === 0) return;
    setIsClearing(true);
    try {
      await clearAllNotifications();
    } finally {
      setIsClearing(false);
    }
  };

  const getNotificationIcon = (notif: Notification) => {
    const t = notif.type.toLowerCase();

    if (t === "status_delivered" || t.includes("delivered")) {
      return {
        icon: <MapPin size={16} className="text-emerald-400" />,
        glow: "bg-emerald-500/15 border-emerald-500/30",
      };
    }
    if (t === "status_cancelled" || t.includes("cancelled")) {
      return {
        icon: <AlertCircle size={16} className="text-rose-400" />,
        glow: "bg-rose-500/15 border-rose-500/30",
      };
    }
    if (t === "status_in_transit" || t.includes("transit")) {
      return {
        icon: <Truck size={16} className="text-cyan-400" />,
        glow: "bg-cyan-500/15 border-cyan-500/30",
      };
    }
    if (t === "status_picked_up" || t.includes("picked")) {
      return {
        icon: <Truck size={16} className="text-purple-400" />,
        glow: "bg-purple-500/15 border-purple-500/30",
      };
    }
    if (t === "status_accepted" || t.includes("accepted")) {
      return {
        icon: <CheckCircle2 size={16} className="text-amber-400" />,
        glow: "bg-amber-500/15 border-amber-500/30",
      };
    }
    if (t === "status_broadcasted" || t.includes("broadcast")) {
      return {
        icon: <Radio size={16} className="text-[#00E676] animate-pulse" />,
        glow: "bg-emerald-500/20 border-emerald-500/40 shadow-[0_0_12px_rgba(0,230,118,0.3)]",
      };
    }

    const cat = getCategory(notif);
    if (cat === "delivery") {
      return {
        icon: <Truck size={16} className="text-emerald-400" />,
        glow: "bg-emerald-500/15 border-emerald-500/30",
      };
    }
    if (cat === "runner") {
      return {
        icon: <Bike size={16} className="text-emerald-400" />,
        glow: "bg-emerald-500/15 border-emerald-500/30",
      };
    }
    return {
      icon: <FileText size={16} className="text-emerald-400" />,
      glow: "bg-emerald-500/15 border-emerald-500/30",
    };
  };

  const getEmptyStateMeta = () => {
    switch (selectedCategory) {
      case "unread":
        return {
          title: "Zero Unread Alerts",
          desc: "You're completely caught up! No pending notifications need attention.",
          actionText: "View All Activity",
          onClick: () => setSelectedCategory("all"),
          isLink: false,
        };
      case "delivery":
        return {
          title: "No Delivery Updates",
          desc: "Active parcel pickups, runner transits, and deliveries will show up here.",
          actionText: "Track Deliveries",
          href: "/dashboard/requests",
          isLink: true,
        };
      case "runner":
        return {
          title: "No Runner Tasks",
          desc: "Accept open delivery requests on campus to start earning UniCoins.",
          actionText: "Open Runner Hub",
          href: "/runner",
          isLink: true,
        };
      case "request":
        return {
          title: "No Request Alerts",
          desc: "Need something delivered or an errand run across campus?",
          actionText: "Create a Request",
          href: "/request/new",
          isLink: true,
        };
      case "all":
      default:
        return {
          title: "All Quiet on Campus",
          desc: "You're all caught up! Real-time alerts will chime in when activity starts.",
          actionText: "Explore Campus Hub",
          href: "/dashboard",
          isLink: true,
        };
    }
  };

  const emptyMeta = getEmptyStateMeta();

  return (
    <div className="relative flex flex-col rounded-2xl overflow-hidden bg-[#0A120E]/95 backdrop-blur-2xl border border-emerald-500/20 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_35px_rgba(0,230,118,0.08)] max-h-[530px] text-white select-none">
      {/* Top emerald glow highlight */}
      <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/[0.06] bg-black/20">
        <div className="flex items-center gap-2.5">
          <h3 className="text-sm font-bold text-white tracking-wide">Notifications</h3>
          {unreadCount > 0 ? (
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-[#00E676] border border-emerald-500/30 shadow-[0_0_10px_rgba(0,230,118,0.2)]">
              {unreadCount} new
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-white/[0.04] text-slate-400 border border-white/[0.08]">
              {notifications.length} total
            </span>
          )}
        </div>

        {/* Header Action Tools */}
        <div className="flex items-center gap-1.5">
          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            aria-label={soundEnabled ? "Mute notification sounds" : "Unmute notification sounds"}
            title={soundEnabled ? "Mute notification sounds" : "Unmute notification sounds"}
            type="button"
            className={`p-1.5 rounded-lg text-xs transition-colors ${
              soundEnabled
                ? "text-[#00E676] hover:bg-emerald-500/10"
                : "text-slate-500 hover:text-slate-300 hover:bg-white/[0.05]"
            }`}
          >
            {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
          </button>

          {/* Mark All Read */}
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              title="Mark all as read"
              type="button"
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold text-[#00E676] hover:bg-emerald-500/15 transition-all"
            >
              <CheckCheck size={14} />
              <span>Read all</span>
            </button>
          )}

          {/* Clear All */}
          {notifications.length > 0 && (
            <button
              onClick={handleClearAll}
              disabled={isClearing}
              title="Clear all notifications"
              type="button"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors disabled:opacity-50"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 px-3 py-2 border-b border-white/[0.06] bg-black/10 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {(["all", "unread", "delivery", "request", "runner"] as const).map((cat) => {
          const count = counts[cat];
          const isSelected = selectedCategory === cat;

          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              type="button"
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs transition-all whitespace-nowrap capitalize ${
                isSelected
                  ? "bg-emerald-500/20 text-[#00E676] border border-emerald-500/40 font-bold shadow-[0_0_12px_rgba(0,230,118,0.2)]"
                  : "text-[#A7B8B0] hover:text-white hover:bg-white/[0.04] border border-transparent font-medium"
              }`}
            >
              <span>{cat}</span>
              {count > 0 && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold leading-tight ${
                    isSelected
                      ? "bg-emerald-500/30 text-emerald-300"
                      : cat === "unread"
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "bg-white/[0.06] text-slate-400"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Notification List Scroll Area */}
      <div className="overflow-y-auto flex-1 divide-y divide-white/[0.04] overscroll-contain [scrollbar-width:thin] [scrollbar-color:rgba(0,230,118,0.2)_transparent]">
        {filteredNotifications.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center px-6 py-9 text-center">
            {/* Ambient Concentric Rings */}
            <div className="relative flex items-center justify-center mb-4">
              <div className="absolute w-24 h-24 rounded-full bg-emerald-500/[0.04] animate-ping" />
              <div className="w-16 h-16 rounded-full bg-gradient-to-b from-emerald-500/10 to-transparent border border-emerald-500/20 flex items-center justify-center shadow-[0_0_25px_rgba(0,230,118,0.1)]">
                <Sparkles size={24} className="text-emerald-400" />
              </div>
            </div>

            <h4 className="text-sm font-bold text-white mb-1.5">{emptyMeta.title}</h4>
            <p className="text-xs text-[#A7B8B0] leading-relaxed max-w-[240px] mb-4">
              {emptyMeta.desc}
            </p>

            {emptyMeta.isLink ? (
              <Link
                href={emptyMeta.href!}
                onClick={onClose}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-xs font-bold text-[#00E676] transition-all hover:scale-[1.02] shadow-[0_0_15px_rgba(0,230,118,0.15)]"
              >
                <span>{emptyMeta.actionText}</span>
                <ArrowRight size={13} />
              </Link>
            ) : (
              <button
                onClick={emptyMeta.onClick}
                type="button"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-xs font-bold text-[#00E676] transition-all hover:scale-[1.02]"
              >
                <span>{emptyMeta.actionText}</span>
                <ArrowRight size={13} />
              </button>
            )}
          </div>
        ) : (
          /* Populated Notification Cards */
          <div className="flex flex-col">
            <AnimatePresence initial={false}>
              {filteredNotifications.map((notif) => {
                const { icon, glow } = getNotificationIcon(notif);
                const isUnread = !notif.is_read;

                return (
                  <motion.div
                    key={notif.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0, overflow: "hidden" }}
                    transition={{ duration: 0.18 }}
                    onClick={() => handleNotificationClick(notif)}
                    className={`group relative flex items-start gap-3 px-4 py-3 cursor-pointer transition-all ${
                      isUnread
                        ? "bg-emerald-500/[0.05] hover:bg-emerald-500/[0.09] border-l-2 border-[#00E676]"
                        : "bg-transparent hover:bg-white/[0.03] border-l-2 border-transparent"
                    }`}
                  >
                    {/* Category Icon */}
                    <div
                      className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center border mt-0.5 transition-transform group-hover:scale-105 ${glow}`}
                    >
                      {icon}
                    </div>

                    {/* Notification Body */}
                    <div className="flex-1 min-w-0 pr-1">
                      <div className="flex items-start justify-between gap-2 mb-0.5">
                        <p
                          className={`text-xs font-bold leading-tight truncate ${
                            isUnread ? "text-white" : "text-slate-300"
                          }`}
                        >
                          {notif.title}
                        </p>
                        <span className="flex-shrink-0 text-[10px] text-slate-500 flex items-center gap-1">
                          <Clock size={10} />
                          {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })
                            .replace("about ", "")
                            .replace("less than a minute ago", "just now")}
                        </span>
                      </div>

                      <p className="text-[11px] text-[#A7B8B0] line-clamp-2 leading-relaxed">
                        {notif.message}
                      </p>
                    </div>

                    {/* Quick Hover Controls */}
                    <div className="flex items-center gap-1 flex-shrink-0 self-center opacity-0 group-hover:opacity-100 transition-opacity">
                      {isUnread && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(notif.id);
                          }}
                          title="Mark as read"
                          type="button"
                          className="p-1 rounded-md text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                        >
                          <Check size={13} />
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notif.id);
                        }}
                        title="Delete notification"
                        type="button"
                        className="p-1 rounded-md text-slate-400 hover:text-rose-400 hover:bg-rose-500/20 transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>

                    {/* Unread Glow Dot (hidden when hovered to leave room for actions) */}
                    {isUnread && (
                      <div className="w-2 h-2 rounded-full bg-[#00E676] shadow-[0_0_8px_#00E676] self-center flex-shrink-0 group-hover:hidden" />
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Footer Status Bar */}
      <div className="px-4 py-2 border-t border-white/[0.06] bg-black/30 flex items-center justify-between text-[11px]">
        <div className="flex items-center gap-1.5 text-slate-400">
          <Radio size={12} className="text-emerald-400 animate-pulse" />
          <span className="font-mono text-[10px] text-emerald-400/90 tracking-wide">
            Realtime Radar Live
          </span>
        </div>

        <Link
          href="/dashboard/requests"
          onClick={onClose}
          className="text-slate-400 hover:text-[#00E676] transition-colors flex items-center gap-1 font-medium"
        >
          <span>Activity Feed</span>
          <ArrowRight size={11} />
        </Link>
      </div>
    </div>
  );
}
