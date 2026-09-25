/**
 * AchievementsSection — Profile page achievements showcase
 *
 * Displays a premium glassmorphic card grid of real milestones earned
 * by the UniVerse project and its creator (Avinash Kumar).
 *
 * All achievements are hardcoded/static — no DB queries needed.
 * Protocol 7 compliance: this file is self-contained, zero external deps.
 */

"use client";

import { useEffect, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Achievement {
  id: string;
  /** Emoji icon shown large in the card */
  emoji: string;
  /** Short bold title */
  title: string;
  /** Subtitle / description */
  subtitle: string;
  /** Accent color (CSS color value) */
  accent: string;
  /** Optional glow color (same as accent but used for box-shadow) */
  glow: string;
  /** Whether this achievement has a special "shine" animation */
  shine?: boolean;
  /** Optional stat number shown big */
  stat?: string;
  /** Optional label under the stat */
  statLabel?: string;
}

// ─── Achievement Data ─────────────────────────────────────────────────────────
// Add or edit achievements here — each maps to one card in the grid.

const ACHIEVEMENTS: Achievement[] = [
  {
    id: "github-stars",
    emoji: "⭐",
    title: "16 GitHub Stars",
    subtitle: "UniVerse earned 16+ stars on GitHub from the open-source community.",
    accent: "#FBBF24",
    glow: "rgba(251, 191, 36, 0.25)",
    shine: true,
    stat: "16",
    statLabel: "Stars",
  },
  {
    id: "campus-superapp",
    emoji: "🚀",
    title: "Campus Super-App",
    subtitle: "Built a full-stack campus super-app serving Marwadi University students.",
    accent: "#00E676",
    glow: "rgba(0, 230, 118, 0.2)",
    stat: "1",
    statLabel: "University",
  },
  {
    id: "real-time",
    emoji: "⚡",
    title: "Real-Time Platform",
    subtitle: "Powered by Supabase WebSockets for sub-second live updates across all modules.",
    accent: "#38BDF8",
    glow: "rgba(56, 189, 248, 0.2)",
    stat: "<1s",
    statLabel: "Latency",
  },
  {
    id: "test-suite",
    emoji: "✅",
    title: "208 Tests Passing",
    subtitle: "100% automated test coverage across 20 test suites — zero production regressions.",
    accent: "#A78BFA",
    glow: "rgba(167, 139, 250, 0.2)",
    stat: "208",
    statLabel: "Tests",
  },
  {
    id: "security",
    emoji: "🛡️",
    title: "Zero-Trust Security",
    subtitle: "RLS-enforced data isolation, 6-digit OTP escrow, and sanitized inputs on every endpoint.",
    accent: "#F87171",
    glow: "rgba(248, 113, 113, 0.2)",
  },
  {
    id: "production",
    emoji: "🌐",
    title: "Live in Production",
    subtitle: "Deployed and live on Vercel — accessible at universe-brown-seven.vercel.app.",
    accent: "#34D399",
    glow: "rgba(52, 211, 153, 0.2)",
  },
];

// ─── Shine / Sparkle animation keyframes injected once ───────────────────────
const KEYFRAMES = `
  @keyframes ach-shine {
    0%   { left: -80%; }
    100% { left: 120%; }
  }
  @keyframes ach-float {
    0%, 100% { transform: translateY(0px); }
    50%       { transform: translateY(-4px); }
  }
  @keyframes ach-pop-in {
    0%   { opacity: 0; transform: translateY(18px) scale(0.95); }
    100% { opacity: 1; transform: translateY(0px)  scale(1); }
  }
`;

// ─── Single Achievement Card ──────────────────────────────────────────────────

function AchievementCard({
  achievement,
  index,
}: {
  achievement: Achievement;
  index: number;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        background: hovered
          ? `linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.03) 100%)`
          : `rgba(255,255,255,0.03)`,
        border: `1px solid ${hovered ? achievement.accent + "55" : "rgba(255,255,255,0.08)"}`,
        borderRadius: "16px",
        padding: "20px",
        backdropFilter: "blur(12px)",
        cursor: "default",
        overflow: "hidden",
        transition: "border-color 0.25s, background 0.25s, box-shadow 0.25s",
        boxShadow: hovered ? `0 0 24px ${achievement.glow}` : "none",
        animation: `ach-pop-in 0.4s ease-out ${index * 80}ms both`,
      }}
    >
      {/* Shine sweep — only on starred achievement */}
      {achievement.shine && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "-80%",
            width: "60%",
            height: "100%",
            background:
              "linear-gradient(90deg, transparent, rgba(251,191,36,0.12), transparent)",
            animation: "ach-shine 3.2s ease-in-out infinite 1s",
            pointerEvents: "none",
          }}
        />
      )}

      {/* Top row: emoji + optional stat */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: "12px",
        }}
      >
        {/* Emoji */}
        <div
          style={{
            fontSize: "2rem",
            lineHeight: 1,
            animation: hovered ? "ach-float 1.8s ease-in-out infinite" : "none",
          }}
        >
          {achievement.emoji}
        </div>

        {/* Stat pill */}
        {achievement.stat && (
          <div style={{ textAlign: "right" }}>
            <div
              style={{
                fontSize: "1.6rem",
                fontWeight: 900,
                color: achievement.accent,
                lineHeight: 1,
                letterSpacing: "-0.03em",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {achievement.stat}
            </div>
            {achievement.statLabel && (
              <div
                style={{
                  fontSize: "0.68rem",
                  color: "rgba(255,255,255,0.4)",
                  fontWeight: 600,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  marginTop: "1px",
                }}
              >
                {achievement.statLabel}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Title */}
      <div
        style={{
          fontSize: "0.9rem",
          fontWeight: 700,
          color: "#FFFFFF",
          marginBottom: "6px",
          letterSpacing: "-0.01em",
        }}
      >
        {achievement.title}
      </div>

      {/* Subtitle */}
      <div
        style={{
          fontSize: "0.75rem",
          color: "rgba(255,255,255,0.45)",
          lineHeight: 1.5,
        }}
      >
        {achievement.subtitle}
      </div>

      {/* Bottom accent bar */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "2px",
          background: `linear-gradient(90deg, transparent, ${achievement.accent}88, transparent)`,
          opacity: hovered ? 1 : 0.3,
          transition: "opacity 0.25s",
        }}
      />
    </div>
  );
}

// ─── Main Section ─────────────────────────────────────────────────────────────

export function AchievementsSection() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "640px",
        margin: "0 auto",
        marginTop: "24px",
      }}
    >
      {/* Inject keyframes once */}
      <style>{KEYFRAMES}</style>

      {/* Section header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          marginBottom: "16px",
        }}
      >
        <div
          style={{
            width: "3px",
            height: "20px",
            borderRadius: "4px",
            background: "linear-gradient(180deg, #FBBF24, #F59E0B)",
          }}
        />
        <h2
          style={{
            margin: 0,
            fontSize: "1rem",
            fontWeight: 800,
            color: "#FFFFFF",
            letterSpacing: "-0.01em",
          }}
        >
          Achievements
        </h2>
        <span
          style={{
            fontSize: "0.72rem",
            color: "rgba(255,255,255,0.35)",
            fontWeight: 600,
            marginLeft: "auto",
          }}
        >
          {ACHIEVEMENTS.length} unlocked
        </span>
      </div>

      {/* Achievement grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
          gap: "12px",
        }}
      >
        {ACHIEVEMENTS.map((ach, i) => (
          <AchievementCard key={ach.id} achievement={ach} index={i} />
        ))}
      </div>
    </div>
  );
}
