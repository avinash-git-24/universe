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
    <div style={{ marginBottom: "1rem" }}>
      {/* Greeting pill */}
      <div style={{
        display: "inline-flex", alignItems: "center", gap: "0.4rem",
        background: "rgba(0,230,118,0.1)", borderRadius: "20px",
        padding: "0.3rem 0.85rem", marginBottom: "1rem",
        border: "1px solid rgba(0,230,118,0.2)"
      }}>
        <Sparkles size={13} color="#00E676" />
        <span
          suppressHydrationWarning
          style={{ color: "#00E676", fontSize: "0.75rem", fontWeight: 700 }}
        >
          {greeting.text} {greeting.emoji}
        </span>
      </div>

      <h1 style={{
        color: "#fff", fontWeight: 800,
        fontSize: "2.2rem",
        letterSpacing: "-0.02em", lineHeight: 1.15, margin: 0,
      }}>
        Welcome back, <span style={{ color: "#00E676" }}>{displayName}</span>!
      </h1>
      <p style={{ color: "rgba(255,255,255,0.6)", marginTop: "0.5rem", fontSize: "0.95rem" }}>
        Here&apos;s what&apos;s happening with your deliveries today.
      </p>
    </div>
  );
}
