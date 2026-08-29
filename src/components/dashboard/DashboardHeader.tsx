"use client";

import { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";

interface DashboardHeaderProps {
  displayName: string;
}

function getGreeting(): { text: string; emoji: string } {
  const hours = new Date().getHours();
  if (hours < 12) {
    return { text: "Good morning", emoji: "☀️" };
  } else if (hours < 17) {
    return { text: "Good afternoon", emoji: "🌤️" };
  } else if (hours < 21) {
    return { text: "Good evening", emoji: "🌆" };
  } else {
    return { text: "Good night", emoji: "🌙" };
  }
}

export function DashboardHeader({ displayName }: DashboardHeaderProps) {
  const [greeting, setGreeting] = useState(getGreeting);

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
      <div className="inline-flex items-center gap-1.5 bg-[#00E676]/10 rounded-full px-3.5 py-1 mb-3 sm:mb-4 border border-[#00E676]/20">
        <Sparkles size={13} color="#00E676" />
        <span
          suppressHydrationWarning
          className="text-[#00E676] text-xs font-bold"
        >
          {greeting.text} {greeting.emoji}
        </span>
      </div>

      <h1 className="text-white font-extrabold text-2xl sm:text-3xl lg:text-[2.2rem] tracking-tight leading-tight m-0">
        <span className="text-[#00E676]">{displayName}</span>!
      </h1>
      <p className="text-white/60 mt-1.5 sm:mt-2 text-xs sm:text-sm lg:text-[0.95rem]">
        Your campus, your deliveries, your UniVerse.
      </p>
    </div>
  );
}
