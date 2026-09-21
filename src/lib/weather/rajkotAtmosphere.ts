/**
 * UniVerse — Rajkot Atmosphere Engine
 *
 * Computes the exact visual state (sky colours, cloud tint, sun/moon,
 * rain, hostel lights, street lights) for CampusBackground based on:
 *   1. Current Rajkot local time  (IST — no dependency on user system TZ)
 *   2. Live Rajkot weather        (Open-Meteo free API — no API key needed)
 *
 * Performance guarantees:
 *   - SSR-safe: all `window` / `Date` access is guarded.
 *   - Zero page-load delay: homepage renders immediately with a sensible
 *     default state; weather resolves asynchronously and blends in.
 *   - Weather cached in sessionStorage for 2 hours.
 *   - Auto-refresh every 10 minutes while the tab is open.
 */

"use client";

import { useState, useEffect, useRef } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type TimePhase = "dawn" | "day" | "sunset" | "night";
export type WeatherCondition = "clear" | "overcast" | "rain";

export interface AtmosphereState {
  // Semantic state
  phase: TimePhase;
  weather: WeatherCondition;
  temperature: number | null;
  weatherDescription: string;

  // Sky gradient tokens
  skyTop: string;
  skyBottom: string;

  // Cloud tokens
  cloudFill: string;
  cloudOpacity: number;
  /** CSS animation-duration multiplier: slower = calm, faster = stormy */
  cloudDurationA: number; // seconds
  cloudDurationB: number;
  cloudDurationC: number;

  // Celestial body
  showSun: boolean;
  sunCx: number;
  sunCy: number;
  /** 0 = invisible, 1 = full brightness */
  sunIntensity: number;
  /** Sun core colour (warm gold vs deep orange at sunset) */
  sunCoreColor: string;
  sunHaloColor: string;

  showMoon: boolean;
  showStars: boolean;

  // Weather overlays
  showRain: boolean;
  wetRoadOpacity: number;

  // Campus lights
  hostelLightsOn: boolean;
  streetLightsOn: boolean;

  // Hero dark vignette strength (higher at night for text readability)
  heroOverlayDark: number;   // 0.0 – 1.0
}

// ─── Constants ────────────────────────────────────────────────────────────────

const RAJKOT_LAT = 22.3039;
const RAJKOT_LON = 70.8022;
const CACHE_KEY = "uv_rajkot_weather_cache";
const CACHE_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours

// ─── Time phase detection (IST = UTC+5:30) ───────────────────────────────────

/**
 * Returns the current Rajkot (IST) hour as a decimal, e.g. 14.5 = 14:30.
 * Always uses IST regardless of the user's device timezone.
 */
function getRajkotHour(): number {
  const now = new Date();
  // IST offset in minutes = +330
  const utcMs = now.getTime() + now.getTimezoneOffset() * 60_000;
  const istMs = utcMs + 330 * 60_000;
  const ist = new Date(istMs);
  return ist.getHours() + ist.getMinutes() / 60;
}

export function getTimePhase(hourDecimal: number): TimePhase {
  if (hourDecimal >= 5.5 && hourDecimal < 8.5) return "dawn";
  if (hourDecimal >= 8.5 && hourDecimal < 17.0) return "day";
  if (hourDecimal >= 17.0 && hourDecimal < 19.25) return "sunset";
  return "night"; // 19:15 – 05:30
}

/**
 * Computes the SVG cx/cy of the sun based on time.
 * Maps the arc from horizon-left at dawn to horizon-right at sunset.
 */
export function getSunPosition(hourDecimal: number): { cx: number; cy: number } {
  // Arc from left (dawn) to right (sunset) across a 1440-wide SVG.
  // Dawn ~6h, Sunset ~18h → map [5.5, 19.0] to arc.
  const t = Math.max(0, Math.min(1, (hourDecimal - 5.5) / (19.0 - 5.5)));
  // Parabolic arc: top of arc at t=0.5 (noon)
  const cx = 100 + t * 1260; // 100 → 1360
  const cy = 160 - Math.sin(t * Math.PI) * 110; // 160 → 50 → 160
  return { cx: Math.round(cx), cy: Math.round(cy) };
}

// ─── Weather API (Open-Meteo, 100% free, no API key) ────────────────────────

interface WeatherCache {
  condition: WeatherCondition;
  temperature: number;
  description: string;
  fetchedAt: number;
}

function readCache(): WeatherCache | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed: WeatherCache = JSON.parse(raw);
    if (Date.now() - parsed.fetchedAt > CACHE_TTL_MS) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeCache(data: WeatherCache): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch {
    // sessionStorage unavailable — degrade silently
  }
}

/** WMO Weather Interpretation Codes → our WeatherCondition */
function decodeWMO(code: number): WeatherCondition {
  if (code <= 2) return "clear";
  if (code === 3 || code === 45 || code === 48) return "overcast";
  // 51-82: drizzle/rain; 85-86: snow showers (treat as rain); 95-99: thunderstorm
  if (
    (code >= 51 && code <= 82) ||
    (code >= 85 && code <= 86) ||
    (code >= 95 && code <= 99)
  )
    return "rain";
  return "overcast"; // anything else → overcast
}

const WMO_DESCRIPTION: Record<number, string> = {
  0: "Clear Sky",
  1: "Mainly Clear",
  2: "Partly Cloudy",
  3: "Overcast",
  45: "Foggy",
  48: "Icy Fog",
  51: "Light Drizzle",
  53: "Moderate Drizzle",
  55: "Dense Drizzle",
  61: "Slight Rain",
  63: "Moderate Rain",
  65: "Heavy Rain",
  71: "Slight Snowfall",
  80: "Rain Showers",
  81: "Moderate Rain Showers",
  82: "Violent Rain Showers",
  95: "Thunderstorm",
  99: "Thunderstorm w/ Hail",
};

export async function fetchRajkotWeather(): Promise<WeatherCache> {
  const cached = readCache();
  if (cached) return cached;

  try {
    const url =
      `https://api.open-meteo.com/v1/forecast` +
      `?latitude=${RAJKOT_LAT}&longitude=${RAJKOT_LON}` +
      `&current=weather_code,temperature_2m` +
      `&timezone=Asia%2FKolkata`;

    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const json = await res.json();
    const code: number = json?.current?.weather_code ?? 0;
    const temp: number = Math.round(json?.current?.temperature_2m ?? 30);
    const data: WeatherCache = {
      condition: decodeWMO(code),
      temperature: temp,
      description: WMO_DESCRIPTION[code] ?? "Clear Sky",
      fetchedAt: Date.now(),
    };
    writeCache(data);
    return data;
  } catch {
    // Fail-safe: return Clear, 30°C so UI always renders something reasonable.
    return {
      condition: "clear",
      temperature: 30,
      description: "Clear Sky",
      fetchedAt: Date.now(),
    };
  }
}

// ─── Design Token Matrix ─────────────────────────────────────────────────────

interface SkyTokens {
  skyTop: string;
  skyBottom: string;
  cloudFill: string;
  cloudOpacity: number;
  cloudDurationA: number;
  cloudDurationB: number;
  cloudDurationC: number;
}

function getSkyTokens(phase: TimePhase, weather: WeatherCondition): SkyTokens {
  // Base tokens per phase:
  const base: Record<TimePhase, SkyTokens> = {
    dawn: {
      skyTop: "#FEF08A",
      skyBottom: "#BAE6FD",
      cloudFill: "#FED7AA",
      cloudOpacity: 0.82,
      cloudDurationA: 60,
      cloudDurationB: 78,
      cloudDurationC: 96,
    },
    day: {
      skyTop: "#9EC8E0",
      skyBottom: "#D9EDF6",
      cloudFill: "#FFFFFF",
      cloudOpacity: 0.88,
      cloudDurationA: 55,
      cloudDurationB: 72,
      cloudDurationC: 90,
    },
    sunset: {
      skyTop: "#EA580C",
      skyBottom: "#7C3AED",
      cloudFill: "#FCA5A5",
      cloudOpacity: 0.78,
      cloudDurationA: 65,
      cloudDurationB: 82,
      cloudDurationC: 100,
    },
    night: {
      skyTop: "#030712",
      skyBottom: "#0F172A",
      cloudFill: "#1E293B",
      cloudOpacity: 0.30,
      cloudDurationA: 70,
      cloudDurationB: 90,
      cloudDurationC: 110,
    },
  };

  const t = base[phase];

  // Override per weather condition:
  if (weather === "overcast") {
    return {
      ...t,
      skyTop:
        phase === "night"
          ? "#0A0A0F"
          : phase === "sunset"
          ? "#78716C"
          : phase === "dawn"
          ? "#D1D5DB"
          : "#94A3B8",
      skyBottom:
        phase === "night"
          ? "#111827"
          : phase === "sunset"
          ? "#57534E"
          : phase === "dawn"
          ? "#9CA3AF"
          : "#CBD5E1",
      cloudFill:
        phase === "night" ? "#111827" : phase === "sunset" ? "#44403C" : "#94A3B8",
      cloudOpacity: phase === "night" ? 0.45 : 0.85,
      cloudDurationA: t.cloudDurationA - 10,
      cloudDurationB: t.cloudDurationB - 10,
      cloudDurationC: t.cloudDurationC - 10,
    };
  }

  if (weather === "rain") {
    return {
      skyTop:
        phase === "night"
          ? "#020207"
          : phase === "sunset"
          ? "#292524"
          : phase === "dawn"
          ? "#374151"
          : "#334155",
      skyBottom:
        phase === "night"
          ? "#0F172A"
          : phase === "sunset"
          ? "#44403C"
          : phase === "dawn"
          ? "#6B7280"
          : "#475569",
      cloudFill:
        phase === "night" ? "#030712" : phase === "sunset" ? "#1C1917" : "#1E293B",
      cloudOpacity: phase === "night" ? 0.55 : 0.95,
      // Faster in storm
      cloudDurationA: Math.max(30, t.cloudDurationA - 20),
      cloudDurationB: Math.max(40, t.cloudDurationB - 20),
      cloudDurationC: Math.max(50, t.cloudDurationC - 20),
    };
  }

  return t;
}

// ─── Main compute function ────────────────────────────────────────────────────

export function computeAtmosphere(
  phase: TimePhase,
  weather: WeatherCondition,
  temperature: number | null,
  weatherDescription: string
): AtmosphereState {
  const hourDecimal = getRajkotHour();
  const sky = getSkyTokens(phase, weather);
  const sunPos = getSunPosition(hourDecimal);

  const isNight = phase === "night";
  const isSunset = phase === "sunset";
  const isDawn = phase === "dawn";

  // Sun intensity: full at day, gentle at dawn, deep-orange at sunset, off at night
  const sunIntensityMap: Record<TimePhase, number> = {
    dawn: 0.65,
    day: 1.0,
    sunset: 0.80,
    night: 0,
  };

  const sunCoreColorMap: Record<TimePhase, string> = {
    dawn: "#FDE68A",
    day: "#FCD34D",
    sunset: "#EA580C",
    night: "#000000",
  };

  const sunHaloColorMap: Record<TimePhase, string> = {
    dawn: "#FEF9C3",
    day: "#FDE68A",
    sunset: "#F97316",
    night: "#000000",
  };

  // Hostel lights: full at night, partial (50% chance) at sunset
  const hostelLightsOn = isNight || isSunset;
  // Street lights: sunset and night
  const streetLightsOn = isNight || isSunset;

  // Hero overlay: stronger at night (text readability)
  const heroOverlayDark = isNight ? 0.82 : isSunset ? 0.72 : isDawn ? 0.55 : 0.68;

  return {
    phase,
    weather,
    temperature,
    weatherDescription,
    ...sky,
    showSun: !isNight,
    sunCx: sunPos.cx,
    sunCy: sunPos.cy,
    sunIntensity: sunIntensityMap[phase],
    sunCoreColor: sunCoreColorMap[phase],
    sunHaloColor: sunHaloColorMap[phase],
    showMoon: isNight,
    showStars: isNight,
    showRain: weather === "rain",
    wetRoadOpacity: weather === "rain" ? 0.50 : 0,
    hostelLightsOn,
    streetLightsOn,
    heroOverlayDark,
  };
}

// ─── Default SSR-safe state ───────────────────────────────────────────────────

export function getDefaultAtmosphereState(): AtmosphereState {
  return computeAtmosphere("day", "clear", 30, "Clear Sky");
}

// ─── React Hook ──────────────────────────────────────────────────────────────

/**
 * useAtmosphere()
 *
 * Returns a reactive AtmosphereState that:
 * - Renders immediately with a time-correct default (no flash)
 * - Resolves live Rajkot weather asynchronously
 * - Auto-refreshes weather every 10 minutes
 * - Allows manual override for demo/preview mode
 */
export function useAtmosphere(): {
  atmos: AtmosphereState;
  override: (phase: TimePhase, weather: WeatherCondition) => void;
  clearOverride: () => void;
  isOverriding: boolean;
} {
  const [atmos, setAtmos] = useState<AtmosphereState>(() => {
    // On server or first paint: use time-correct default
    if (typeof window === "undefined") return getDefaultAtmosphereState();
    const hour = getRajkotHour();
    const phase = getTimePhase(hour);
    return computeAtmosphere(phase, "clear", null, "Loading…");
  });

  const [overrideState, setOverrideState] = useState<{
    phase: TimePhase;
    weather: WeatherCondition;
  } | null>(null);

  const overrideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch + apply live weather
  useEffect(() => {
    let cancelled = false;

    async function refresh() {
      const weatherData = await fetchRajkotWeather();
      if (cancelled) return;
      const hour = getRajkotHour();
      const phase = getTimePhase(hour);
      setAtmos(
        computeAtmosphere(phase, weatherData.condition, weatherData.temperature, weatherData.description)
      );
    }

    refresh();

    // Re-check every 10 minutes
    const interval = setInterval(refresh, 10 * 60 * 1000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  // Apply override when set
  useEffect(() => {
    if (!overrideState) return;
    fetchRajkotWeather().then((w) => {
      setAtmos(
        computeAtmosphere(
          overrideState.phase,
          overrideState.weather,
          w.temperature,
          w.description
        )
      );
    });
  }, [overrideState]);

  function override(phase: TimePhase, weather: WeatherCondition) {
    if (overrideTimerRef.current) clearTimeout(overrideTimerRef.current);
    setOverrideState({ phase, weather });
    // Auto-reset after 8 seconds
    overrideTimerRef.current = setTimeout(() => {
      setOverrideState(null);
    }, 8000);
  }

  function clearOverride() {
    if (overrideTimerRef.current) clearTimeout(overrideTimerRef.current);
    setOverrideState(null);
    // Re-derive live state
    fetchRajkotWeather().then((w) => {
      const hour = getRajkotHour();
      const phase = getTimePhase(hour);
      setAtmos(
        computeAtmosphere(phase, w.condition, w.temperature, w.description)
      );
    });
  }

  return {
    atmos,
    override,
    clearOverride,
    isOverriding: overrideState !== null,
  };
}
