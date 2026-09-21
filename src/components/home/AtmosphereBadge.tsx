"use client";

/**
 * UniVerse — Atmosphere Badge
 *
 * A glassmorphic pill badge fixed to the top-right hero area that shows:
 *   📍 Rajkot · 28°C · ☀️ Clear Sky
 *
 * Also exposes a 5-mode interactive Preview Switcher so anyone can
 * demo all atmosphere states (Dawn / Day / Sunset / Night / Rain)
 * with a single click. The badge auto-resets to Live after 8 s.
 */

import { useState } from "react";
import type { AtmosphereState, TimePhase, WeatherCondition } from "@/lib/weather/rajkotAtmosphere";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AtmosphereBadgeProps {
  atmos: AtmosphereState;
  override: (phase: TimePhase, weather: WeatherCondition) => void;
  clearOverride: () => void;
  isOverriding: boolean;
}

// ─── Preview modes ────────────────────────────────────────────────────────────

const PREVIEW_MODES: {
  label: string;
  emoji: string;
  phase: TimePhase;
  weather: WeatherCondition;
}[] = [
  { label: "Dawn",   emoji: "🌅", phase: "dawn",   weather: "clear"    },
  { label: "Day",    emoji: "☀️", phase: "day",    weather: "clear"    },
  { label: "Sunset", emoji: "🌇", phase: "sunset", weather: "clear"    },
  { label: "Night",  emoji: "🌙", phase: "night",  weather: "clear"    },
  { label: "Rain",   emoji: "🌧️", phase: "day",    weather: "rain"     },
];

// ─── Weather emoji helper ─────────────────────────────────────────────────────

function weatherEmoji(phase: TimePhase, weather: WeatherCondition): string {
  if (weather === "rain")     return "🌧️";
  if (weather === "overcast") return "☁️";
  if (phase === "night")      return "🌙";
  if (phase === "sunset")     return "🌇";
  if (phase === "dawn")       return "🌅";
  return "☀️";
}

// ─── Component ───────────────────────────────────────────────────────────────

export function AtmosphereBadge({
  atmos,
  override,
  clearOverride,
  isOverriding,
}: AtmosphereBadgeProps) {
  const [expanded, setExpanded] = useState(false);

  const emoji = weatherEmoji(atmos.phase, atmos.weather);
  const tempLabel =
    atmos.temperature !== null ? `${atmos.temperature}°C` : "";

  return (
    <div
      className="absolute top-5 right-5 z-30 flex flex-col items-end gap-2 pointer-events-none"
      aria-label="Rajkot live weather badge"
    >
      {/* ── Main Badge Pill ── */}
      <button
        className="pointer-events-auto flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold text-white/90 select-none"
        style={{
          background: "rgba(10, 20, 15, 0.55)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          border: isOverriding
            ? "1px solid rgba(251,191,36,0.55)"
            : "1px solid rgba(255,255,255,0.14)",
          boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
          fontFamily: "var(--font-inter)",
          transition: "border 0.3s ease",
        }}
        onClick={() => setExpanded((v) => !v)}
        title="Toggle atmosphere preview"
      >
        {/* Location dot */}
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
        <span className="text-white/60">📍</span>
        <span>Rajkot</span>
        {tempLabel && (
          <>
            <span className="text-white/40">·</span>
            <span>{tempLabel}</span>
          </>
        )}
        <span className="text-white/40">·</span>
        <span>{emoji}</span>
        <span className="hidden sm:inline text-white/70">{atmos.weatherDescription}</span>
        {isOverriding && (
          <span
            className="ml-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold tracking-wide"
            style={{
              background: "rgba(251,191,36,0.18)",
              border: "1px solid rgba(251,191,36,0.40)",
              color: "#FBB f24",
            }}
          >
            PREVIEW
          </span>
        )}
        {/* Toggle chevron */}
        <svg
          width="10" height="10" viewBox="0 0 10 10" fill="none"
          className={`transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
          aria-hidden="true"
        >
          <path d="M 2 3 L 5 7 L 8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* ── Preview Mode Switcher (expanded) ── */}
      {expanded && (
        <div
          className="pointer-events-auto flex items-center gap-1 px-2 py-1.5 rounded-2xl"
          style={{
            background: "rgba(10, 20, 15, 0.68)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            border: "1px solid rgba(255,255,255,0.12)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
          }}
          role="toolbar"
          aria-label="Preview atmosphere modes"
        >
          {/* Live mode restore button */}
          {isOverriding && (
            <button
              className="flex items-center gap-1 px-2 py-1 rounded-xl text-[10px] font-bold text-emerald-300 hover:text-white transition-colors"
              style={{
                background: "rgba(16,185,129,0.15)",
                border: "1px solid rgba(16,185,129,0.30)",
              }}
              onClick={() => {
                clearOverride();
                setExpanded(false);
              }}
            >
              ⟲ Live
            </button>
          )}

          {PREVIEW_MODES.map((mode) => {
            const isActive =
              isOverriding &&
              atmos.phase === mode.phase &&
              atmos.weather === mode.weather;
            return (
              <button
                key={mode.label}
                className="flex flex-col items-center gap-0.5 px-2.5 py-1 rounded-xl transition-all duration-150"
                style={{
                  background: isActive
                    ? "rgba(255,255,255,0.18)"
                    : "transparent",
                  border: isActive
                    ? "1px solid rgba(255,255,255,0.30)"
                    : "1px solid transparent",
                }}
                onClick={() => {
                  override(mode.phase, mode.weather);
                }}
                title={`Preview ${mode.label} mode`}
              >
                <span className="text-base leading-none">{mode.emoji}</span>
                <span
                  className="text-[9px] font-semibold leading-none"
                  style={{
                    color: isActive ? "#FFFFFF" : "rgba(255,255,255,0.55)",
                    fontFamily: "var(--font-inter)",
                  }}
                >
                  {mode.label}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
