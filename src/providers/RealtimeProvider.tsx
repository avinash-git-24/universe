"use client";

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";
import { getUserNotifications, type Notification } from "@/lib/database/notifications";
import { sounds } from "@/lib/audio";
import { motion, AnimatePresence } from "framer-motion";
import { Bike, MessageSquare, ArrowRight, X, Bell } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export interface GlobalInAppToast {
  id: string;
  type: "order_accepted" | "order_picked_up" | "order_delivered" | "chat_message" | "system";
  title: string;
  message: string;
  avatarChar?: string;
  actionLabel?: string;
  actionUrl?: string;
  timestamp: number;
}

interface RealtimeContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  showToast: (toast: Omit<GlobalInAppToast, "id" | "timestamp">) => void;
}

const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined);

export function RealtimeProvider({ children, userId }: { children: ReactNode; userId?: string }) {
  const [currentUserId, setCurrentUserId] = useState<string | undefined>(userId);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [toasts, setToasts] = useState<GlobalInAppToast[]>([]);
  const pathname = usePathname();

  useEffect(() => {
    if (userId) {
      setCurrentUserId(userId);
      return;
    }
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setCurrentUserId(user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setCurrentUserId(session?.user?.id);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [userId]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const showToast = useCallback((toastData: Omit<GlobalInAppToast, "id" | "timestamp">) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const newToast: GlobalInAppToast = {
      ...toastData,
      id,
      timestamp: Date.now(),
    };

    setToasts((prev) => [newToast, ...prev.slice(0, 2)]);

    // Native Browser Notification if tab is in background or permission granted
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
      try {
        const nativeNotification = new window.Notification(toastData.title, {
          body: toastData.message,
          icon: "/icons/icon-192.png",
        });
        if (toastData.actionUrl) {
          nativeNotification.onclick = () => {
            window.focus();
            window.location.href = toastData.actionUrl!;
          };
        }
      } catch {}
    }

    // Auto dismiss after 6 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 6000);
  }, []);

  // Request browser notification permission gently on user activity
  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission === "default") {
      const handleFirstClick = () => {
        Notification.requestPermission().catch(() => {});
        window.removeEventListener("click", handleFirstClick);
      };
      window.addEventListener("click", handleFirstClick, { once: true });
      return () => window.removeEventListener("click", handleFirstClick);
    }
  }, []);

  useEffect(() => {
    if (!currentUserId) return;

    const supabase = createClient();

    // 1. Initial notifications fetch
    getUserNotifications(supabase, currentUserId).then((data) => {
      setNotifications(data);
    });

    // 2. Realtime Notifications Table Subscription (status updates, reviews, alerts)
    const notifChannel = supabase
      .channel(`realtime:notifications:${currentUserId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${currentUserId}`,
        },
        (payload) => {
          const newNotif = payload.new as Notification;
          setNotifications((prev) => [newNotif, ...prev]);

          const notifType = newNotif.type;
          const refId = newNotif.reference_id;

          if (notifType === "status_accepted" || newNotif.title?.toLowerCase().includes("accepted")) {
            sounds.playOrderAccepted();
            showToast({
              type: "order_accepted",
              title: "🎉 Request Accepted!",
              message: newNotif.message || "A campus runner has accepted your delivery request!",
              actionLabel: "Track Order",
              actionUrl: refId ? `/dashboard/requests/${refId}` : "/dashboard/requests",
            });
          } else if (notifType === "status_picked_up") {
            sounds.playReceive();
            showToast({
              type: "order_picked_up",
              title: "🛵 Order Picked Up",
              message: newNotif.message || "Your runner is on the way with your order!",
              actionLabel: "Track Order",
              actionUrl: refId ? `/dashboard/requests/${refId}` : "/dashboard/requests",
            });
          } else if (notifType === "status_delivered") {
            sounds.playOrderAccepted();
            showToast({
              type: "order_delivered",
              title: "✅ Order Delivered!",
              message: newNotif.message || "Your items have been delivered successfully.",
              actionLabel: "View Details",
              actionUrl: refId ? `/dashboard/requests/${refId}` : "/dashboard/requests",
            });
          } else {
            sounds.playReceive();
            showToast({
              type: "system",
              title: newNotif.title || "New Notification",
              message: newNotif.message || "",
              actionLabel: "View",
              actionUrl: refId ? `/dashboard/requests/${refId}` : "/dashboard",
            });
          }
        }
      )
      .subscribe();

    // 3. Global Realtime Messages Table Subscription (for instant chat alerts anywhere in the app)
    const msgChannel = supabase
      .channel(`realtime:global_messages:${currentUserId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        async (payload) => {
          const newMsg = payload.new as {
            id: string;
            conversation_id: string;
            sender_id: string;
            content: string;
            image_url?: string | null;
            created_at: string;
          };

          // Don't toast for user's own sent messages
          if (newMsg.sender_id === currentUserId) return;

          // If user is currently on the chat page and already looking at this conversation, skip global toast
          if (pathname.startsWith("/dashboard/chat")) {
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.get("id") === newMsg.conversation_id) {
              return;
            }
          }

          // Fetch sender name for rich toast
          const { data: senderProfile } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", newMsg.sender_id)
            .single();

          const senderName = senderProfile?.full_name || "New Message";
          const snippet = newMsg.content?.trim() || (newMsg.image_url ? "📷 Sent an image" : "Sent a message");

          sounds.playReceive();
          showToast({
            type: "chat_message",
            title: `💬 ${senderName}`,
            message: snippet,
            avatarChar: senderName.charAt(0).toUpperCase(),
            actionLabel: "Reply",
            actionUrl: `/dashboard/chat?id=${newMsg.conversation_id}`,
          });
        }
      )
      .subscribe();

    // 4. Realtime Delivery Requests Status Updates (Direct Table Listener)
    const reqChannel = supabase
      .channel(`realtime:user_requests:${currentUserId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "delivery_requests",
          filter: `requester_id=eq.${currentUserId}`,
        },
        (payload) => {
          const updatedReq = payload.new as { id: string; status: string; item_name?: string };
          const oldReq = payload.old as { status?: string };

          // If request was just accepted
          if (updatedReq.status === "accepted" && oldReq.status !== "accepted") {
            sounds.playOrderAccepted();
            showToast({
              type: "order_accepted",
              title: "🎉 Request Accepted!",
              message: `Your request for ${updatedReq.item_name || "items"} was accepted by a runner!`,
              actionLabel: "Track Order",
              actionUrl: `/dashboard/requests/${updatedReq.id}`,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(notifChannel);
      supabase.removeChannel(msgChannel);
      supabase.removeChannel(reqChannel);
    };
  }, [currentUserId, showToast, pathname]);

  const markAsRead = async (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    const supabase = createClient();
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
  };

  const markAllAsRead = async () => {
    if (!currentUserId) return;
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    const supabase = createClient();
    await supabase.from("notifications").update({ is_read: true }).eq("user_id", currentUserId).eq("is_read", false);
  };

  const deleteNotification = async (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    const supabase = createClient();
    await supabase.from("notifications").delete().eq("id", id);
  };

  return (
    <RealtimeContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        showToast,
      }}
    >
      {children}

      {/* Global In-App Floating Toast Notification Center */}
      <div className="fixed top-4 right-3 sm:right-6 z-[99999] pointer-events-none flex flex-col gap-2.5 max-w-[380px] w-full">
        <AnimatePresence>
          {toasts.map((toast) => {
            const isOrder = toast.type.startsWith("order_");
            const isChat = toast.type === "chat_message";

            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: -20, scale: 0.92, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 0.9, y: -10, filter: "blur(4px)" }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className={`pointer-events-auto relative p-3.5 rounded-2xl backdrop-blur-xl border shadow-2xl transition-all ${
                  isOrder
                    ? "bg-[#08170e]/95 border-[#00E676]/40 shadow-[0_8px_32px_rgba(0,230,118,0.25)]"
                    : isChat
                    ? "bg-[#0c141d]/95 border-sky-500/40 shadow-[0_8px_32px_rgba(14,165,233,0.25)]"
                    : "bg-[#0e1217]/95 border-emerald-500/30 shadow-[0_8px_30px_rgba(0,0,0,0.6)]"
                }`}
              >
                {/* Ambient corner glow */}
                <div
                  className={`absolute -top-6 -right-6 w-20 h-20 rounded-full blur-2xl pointer-events-none opacity-40 ${
                    isOrder ? "bg-[#00E676]" : isChat ? "bg-sky-400" : "bg-emerald-500"
                  }`}
                />

                <div className="flex items-start gap-3 relative z-10">
                  {/* Icon / Avatar */}
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-bold text-sm shadow-md ${
                      isOrder
                        ? "bg-[#00E676]/20 border border-[#00E676]/50 text-[#00E676]"
                        : isChat
                        ? "bg-sky-500/20 border border-sky-400/50 text-sky-300"
                        : "bg-emerald-500/20 border border-emerald-400/40 text-emerald-400"
                    }`}
                  >
                    {isOrder ? (
                      <Bike size={18} />
                    ) : isChat ? (
                      toast.avatarChar || <MessageSquare size={17} />
                    ) : (
                      <Bell size={17} />
                    )}
                  </div>

                  {/* Body Text */}
                  <div className="flex-1 min-w-0 pr-4">
                    <h4 className="text-xs font-bold text-white tracking-wide truncate mb-0.5">
                      {toast.title}
                    </h4>
                    <p className="text-[11px] text-zinc-300 leading-snug line-clamp-2">
                      {toast.message}
                    </p>

                    {/* Action Button */}
                    {toast.actionUrl && (
                      <div className="mt-2.5">
                        <Link
                          href={toast.actionUrl}
                          onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-bold transition-all shadow-sm ${
                            isOrder
                              ? "bg-[#00E676] text-black hover:bg-[#66ffb2] hover:scale-105"
                              : "bg-sky-500 text-white hover:bg-sky-400 hover:scale-105"
                          }`}
                        >
                          {toast.actionLabel || "Open"}
                          <ArrowRight size={12} />
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* Close button */}
                  <button
                    onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
                    className="absolute top-0 right-0 p-1 text-zinc-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </RealtimeContext.Provider>
  );
}

export function useRealtime() {
  const context = useContext(RealtimeContext);
  if (context === undefined) {
    throw new Error("useRealtime must be used within a RealtimeProvider");
  }
  return context;
}
