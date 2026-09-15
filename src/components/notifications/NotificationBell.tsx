"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRealtime } from "@/providers/RealtimeProvider";
import { NotificationList } from "./NotificationList";
import { useUIState } from "@/providers/UIStateProvider";

export function NotificationBell() {
  const { unreadCount } = useRealtime();
  const { openPanel, toggleNotifications, closeAll } = useUIState();
  const isOpen = openPanel === "notifications";
  const panelRef = useRef<HTMLDivElement>(null);
  const bellRef = useRef<HTMLButtonElement>(null);

  // Close on click outside & Escape key
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
    <div className="relative">
      {/* Bell trigger button */}
      <button
        ref={bellRef}
        onClick={toggleNotifications}
        aria-label="Notifications"
        aria-expanded={isOpen}
        type="button"
        className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 outline-none ${
          isOpen
            ? "bg-emerald-500/20 text-[#00E676] ring-2 ring-emerald-500/40 shadow-[0_0_15px_rgba(0,230,118,0.25)]"
            : "bg-white/[0.04] text-slate-300 hover:text-white hover:bg-white/[0.08] hover:border-emerald-500/30 border border-white/10"
        }`}
      >
        <Bell
          size={18}
          className={`transition-transform duration-200 ${
            isOpen ? "scale-110 rotate-6" : "group-hover:scale-105"
          }`}
        />

        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 flex h-5 min-w-[20px] items-center justify-center">
            {/* Animated radar ping ring */}
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            {/* Badge pill */}
            <span className="relative px-1.5 h-5 min-w-[20px] rounded-full bg-gradient-to-tr from-emerald-500 to-[#00E676] text-[#051109] font-black text-[10px] leading-none flex items-center justify-center shadow-[0_0_12px_rgba(0,230,118,0.7)]">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          </span>
        )}
      </button>

      {/* Portal to document.body to escape any parent transform/backdrop filter */}
      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {isOpen && (
              <>
                {/* Full-screen backdrop — click anywhere closes */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="fixed inset-0 z-[9998] bg-black/20 backdrop-blur-[2px] sm:bg-transparent sm:backdrop-blur-none"
                  onClick={closeAll}
                  aria-hidden="true"
                />

                {/* Notification panel container */}
                <motion.div
                  ref={panelRef}
                  initial={{ opacity: 0, y: -12, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.96 }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  style={{
                    position: "fixed",
                    top: "76px",
                    right: "max(1rem, calc(50vw - 700px + 1.5rem))",
                    width: "390px",
                    maxWidth: "calc(100vw - 1.5rem)",
                    zIndex: 9999,
                  }}
                  className="origin-top-right"
                >
                  <NotificationList onClose={closeAll} />
                </motion.div>
              </>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
}
