"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

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

  const openNotifications = useCallback(() => setOpenPanel("notifications"), []);
  const closeAll = useCallback(() => setOpenPanel(null), []);
  const toggleNotifications = useCallback(
    () => setOpenPanel((prev) => (prev === "notifications" ? null : "notifications")),
    []
  );

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
