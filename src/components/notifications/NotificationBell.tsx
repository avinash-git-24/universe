"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Bell } from "lucide-react";
import { useRealtime } from "@/providers/RealtimeProvider";
import { NotificationList } from "./NotificationList";
import { useUIState } from "@/providers/UIStateProvider";

export function NotificationBell() {
  const { unreadCount } = useRealtime();
  const { openPanel, toggleNotifications, closeAll } = useUIState();
  const isOpen = openPanel === "notifications";
  const panelRef = useRef<HTMLDivElement>(null);
  const bellRef = useRef<HTMLDivElement>(null);

  // Close on click outside — identical to GitHub/Notion/Linear behavior
  useEffect(() => {
    if (!isOpen) return;

    function handleClick(e: MouseEvent) {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        bellRef.current &&
        !bellRef.current.contains(e.target as Node)
      ) {
        closeAll();
      }
    }

    // Escape key closes it too
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") closeAll();
    }

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, closeAll]);

  return (
    // Position relative here is intentional — the panel uses fixed positioning
    // so it breaks out of any stacking context caused by backdrop-filter
    <div style={{ position: "relative" }}>
      {/* Bell trigger button */}
      <div
        ref={bellRef}
        onClick={toggleNotifications}
        aria-label="Notifications"
        aria-expanded={isOpen}
        role="button"
        style={{ cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span style={{
            position: "absolute", top: "-4px", right: "-4px",
            background: "#00E676", color: "#000",
            fontSize: "0.6rem", fontWeight: 800,
            width: "16px", height: "16px", borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </div>

      {/* Portal to document.body to guarantee escaping ALL CSS containing blocks (backdrop-filter, etc) */}
      {isOpen && typeof document !== "undefined" && createPortal(
        <>
          {/* Full-screen invisible backdrop at z-9998 — click anywhere closes */}
          <div
            style={{ position: "fixed", inset: 0, zIndex: 9998 }}
            onClick={closeAll}
            aria-hidden="true"
          />

          {/* Notification panel at z-9999 — always on top */}
          <div
            ref={panelRef}
            style={{
              position: "fixed",
              top: "76px",
              right: "max(2rem, calc(50vw - 700px + 2rem))", // Align with dashboard layout
              width: "360px",
              zIndex: 9999,
            }}
            className="animate-in fade-in slide-in-from-top-2 duration-200"
          >
            <NotificationList onClose={closeAll} />
          </div>
        </>,
        document.body
      )}
    </div>
  );
}
