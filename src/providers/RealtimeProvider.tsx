"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";
import { getUserNotifications, type Notification } from "@/lib/database/notifications";

interface RealtimeContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
}

const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined);

export function RealtimeProvider({ children, userId }: { children: ReactNode; userId?: string }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  const unreadCount = notifications.filter(n => !n.is_read).length;

  useEffect(() => {
    if (!userId) return;

    const supabase = createClient();

    // Initial fetch
    getUserNotifications(supabase, userId).then(data => {
      setNotifications(data);
    });

    // Subscribe to realtime notification inserts
    const channel = supabase
      .channel(`realtime:notifications:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          setNotifications((prev) => [newNotification, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const markAsRead = async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    const supabase = createClient();
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
  };

  const markAllAsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    const supabase = createClient();
    await supabase.from("notifications").update({ is_read: true }).eq("user_id", userId).eq("is_read", false);
  };

  const deleteNotification = async (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    const supabase = createClient();
    await supabase.from("notifications").delete().eq("id", id);
  };

  return (
    <RealtimeContext.Provider value={{ notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification }}>
      {children}
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
