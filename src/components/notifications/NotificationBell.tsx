"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
import { useRealtime } from "@/providers/RealtimeProvider";
import { NotificationList } from "./NotificationList";
import { Button } from "@/components/ui/button";

export function NotificationBell() {
  const { unreadCount } = useRealtime();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <Button 
        variant="ghost" 
        size="icon" 
        className="relative"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="w-5 h-5 text-muted-foreground" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-2 w-2 h-2 rounded-full bg-destructive ring-2 ring-background animate-pulse" />
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 z-50">
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="relative z-50">
            <NotificationList onClose={() => setIsOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
