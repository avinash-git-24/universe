"use client";

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";

type PanelId = "notifications" | null;

interface UIStateContextType {
  openPanel: PanelId;
  openNotifications: () => void;
  closeAll: () => void;
  toggleNotifications: () => void;
}

const UIStateContext = createContext<UIStateContextType | null>(null);

export function UIStateProvider({ children }: { children: ReactNode }) {
  const [openPanel, setOpenPanel] = useState<PanelId>(null);
  const router = useRouter();

  const openNotifications = useCallback(() => setOpenPanel("notifications"), []);
  const closeAll = useCallback(() => setOpenPanel(null), []);
  const toggleNotifications = useCallback(
    () => setOpenPanel((prev) => (prev === "notifications" ? null : "notifications")),
    []
  );

  // Auto-intercept Supabase Password Recovery link on any page
  useEffect(() => {
    if (typeof window === "undefined") return;

    const hash = window.location.hash || "";
    const search = window.location.search || "";
    const isRecovery = hash.includes("type=recovery") || search.includes("type=recovery");

    if (isRecovery && window.location.pathname !== "/reset-password") {
      router.push(`/reset-password${hash || search}`);
    }
  }, [router]);

  return (
    <UIStateContext.Provider value={{ openPanel, openNotifications, closeAll, toggleNotifications }}>
      {children}
    </UIStateContext.Provider>
  );
}

export function useUIState() {
  const ctx = useContext(UIStateContext);
  if (!ctx) throw new Error("useUIState must be used within UIStateProvider");
  return ctx;
}
