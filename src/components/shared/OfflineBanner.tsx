"use client";

import { WifiOff } from "lucide-react";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

export function OfflineBanner() {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      className="bg-amber-500 text-white text-xs font-semibold px-4 py-1.5 flex items-center justify-center gap-2 shadow-sm animate-pulse z-[100]"
      role="alert"
      aria-live="assertive"
    >
      <WifiOff className="w-3.5 h-3.5" />
      <span>You are currently offline. Some real-time features may be unavailable until your connection is restored.</span>
    </div>
  );
}
