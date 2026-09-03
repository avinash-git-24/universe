"use client";

import { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";
import { formatStudentName } from "@/lib/utils";

interface DashboardHeaderProps {
  displayName: string;
}

function getGreeting(): { text: string; emoji: string } {
  const hours = new Date().getHours();
  if (hours >= 5 && hours < 12) {
    return { text: "Good morning", emoji: "☀️" };
  } else if (hours >= 12 && hours < 17) {
    return { text: "Good afternoon", emoji: "🌤️" };
  } else if (hours >= 17 && hours < 21) {
    return { text: "Good evening", emoji: "🌆" };
  } else {
    // 9:00 PM (21:00) to 4:59 AM (04:59) is Night
    return { text: "Good night", emoji: "🌙" };
  }
}

export function DashboardHeader({ displayName }: DashboardHeaderProps) {
  const [greeting, setGreeting] = useState(getGreeting);
  const formatted = formatStudentName(displayName);

  useEffect(() => {
    // Set client local time immediately on mount
    setGreeting(getGreeting());

    // Automatically check and update when crossing time periods without requiring page refresh
    const timer = setInterval(() => {
      setGreeting(getGreeting());
    }, 30000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="mb-4">
      {/* Greeting pill */}
      <div className="inline-flex items-center gap-2 bg-emerald-500/10 rounded-full px-3.5 py-1 mb-3 sm:mb-4 border border-emerald-500/25 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
        <Sparkles size={13} className="text-emerald-400" />
        <span
          suppressHydrationWarning
          className="text-emerald-400 text-xs font-bold"
        >
          {greeting.text} {greeting.emoji}
        </span>
        {formatted.rollPrefix && (
          <span className="text-[10px] font-mono text-emerald-300/60 pl-1 border-l border-emerald-500/20">
            ID: {formatted.rollPrefix}
          </span>
        )}
      </div>

      <h1 className="text-white font-extrabold text-2xl sm:text-3xl lg:text-[2.2rem] tracking-tight leading-tight m-0 flex items-center gap-2 flex-wrap">
        <span>Welcome back,</span>
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-emerald-300 to-teal-300">
          {formatted.firstName}
        </span>
        <span className="text-2xl">👋</span>
      </h1>
      <p className="text-white/60 mt-1.5 sm:mt-2 text-xs sm:text-sm lg:text-[0.95rem] flex items-center gap-1.5 font-medium">
        <span>Marwadi University</span>
        <span className="text-emerald-500/50">•</span>
        <span>Your campus deliveries, your UniVerse.</span>
      </p>
    </div>
  );
}
