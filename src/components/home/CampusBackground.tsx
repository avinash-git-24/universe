"use client";

import { useState, useEffect } from "react";

/**
 * UniVerse — Ultra-Premium 3D Isometric Campus Background
 *
 * A master-crafted isometric SVG illustration of a modern Indian university
 * campus inspired by Marwadi University.
 *
 * Visual Architecture:
 * - Dynamic Day / Night cycle (Day: 06:00 - 18:59, Night: 19:00 - 05:59)
 * - 3D Isometric depth: angled side facets, illuminated rooftops, and ground cast shadows.
 * - Dynamic Lighting: In night mode, student hostel rooms and academic block windows
 *   glow with warm amber interior lights, bringing the campus to life.
 * - Responsive Multi-Viewport Framing:
 *   - Desktop: Majestic 1440x800 wide-angle panoramic horizon.
 *   - Mobile: 100% full-screen immersive portrait atmosphere (starry upper sky, balanced
 *     central campus skyline, grounded lower lawns and roadway — zero black bars/dabba effect).
 * - Performance: 100% pure SVG + hardware-accelerated CSS animations — zero JS overhead.
 */

/**
 * Precomputed sun beam endpoint coordinates rounded to 2 decimal places.
 * Eliminates float precision discrepancy between Node.js SSR and browser V8 runtime.
 */
const SUN_BEAMS = [
  { x2: 1490, y2: 88, strokeWidth: 2, opacity: 0.35 },
  { x2: 1468.56, y2: 168, strokeWidth: 1, opacity: 0.18 },
  { x2: 1410, y2: 226.56, strokeWidth: 2, opacity: 0.35 },
  { x2: 1330, y2: 248, strokeWidth: 1, opacity: 0.18 },
  { x2: 1250, y2: 226.56, strokeWidth: 2, opacity: 0.35 },
  { x2: 1191.44, y2: 168, strokeWidth: 1, opacity: 0.18 },
  { x2: 1170, y2: 88, strokeWidth: 2, opacity: 0.35 },
  { x2: 1191.44, y2: 8, strokeWidth: 1, opacity: 0.18 },
  { x2: 1250, y2: -50.56, strokeWidth: 2, opacity: 0.35 },
  { x2: 1330, y2: -72, strokeWidth: 1, opacity: 0.18 },
  { x2: 1410, y2: -50.56, strokeWidth: 2, opacity: 0.35 },
  { x2: 1468.56, y2: 8, strokeWidth: 1, opacity: 0.18 },
] as const;

const MOBILE_SUN_BEAMS = [
  { x2: 1080, y2: -220, strokeWidth: 2, opacity: 0.35 },
  { x2: 1061.24, y2: -150, strokeWidth: 1, opacity: 0.18 },
  { x2: 1010, y2: -98.76, strokeWidth: 2, opacity: 0.35 },
  { x2: 940, y2: -80, strokeWidth: 1, opacity: 0.18 },
  { x2: 870, y2: -98.76, strokeWidth: 2, opacity: 0.35 },
  { x2: 818.76, y2: -150, strokeWidth: 1, opacity: 0.18 },
  { x2: 800, y2: -220, strokeWidth: 2, opacity: 0.35 },
  { x2: 818.76, y2: -290, strokeWidth: 1, opacity: 0.18 },
  { x2: 870, y2: -341.24, strokeWidth: 2, opacity: 0.35 },
  { x2: 940, y2: -360, strokeWidth: 1, opacity: 0.18 },
  { x2: 1010, y2: -341.24, strokeWidth: 2, opacity: 0.35 },
  { x2: 1061.24, y2: -290, strokeWidth: 1, opacity: 0.18 },
] as const;

function CampusScene({ isNight, isMobile }: { isNight: boolean; isMobile: boolean }) {
  return (
    <>
      <defs>
        {/* ── Sky Gradient ── */}
        <linearGradient id={`uvSkyGrad_${isMobile ? "m" : "d"}`} x1="0" y1="0" x2="0" y2="1">
          <stop
            offset="0%"
            stopColor={isNight ? "#020617" : "#5B9EC9"}
            style={{ transition: "stop-color 1.2s ease-in-out" }}
          />
          <stop
            offset="30%"
            stopColor={isNight ? "#0A1630" : "#82BBD8"}
            style={{ transition: "stop-color 1.2s ease-in-out" }}
          />
          <stop
            offset="65%"
            stopColor={isNight ? "#112248" : "#B4D9EC"}
            style={{ transition: "stop-color 1.2s ease-in-out" }}
          />
          <stop
            offset="100%"
            stopColor={isNight ? "#182F5E" : "#DDF0F8"}
            style={{ transition: "stop-color 1.2s ease-in-out" }}
          />
        </linearGradient>

        {/* Horizon Atmospheric Glow */}
        <linearGradient id={`uvHorizonHaze_${isMobile ? "m" : "d"}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={isNight ? "#0A1734" : "#C8E8F5"} stopOpacity="0" />
          <stop offset="60%" stopColor={isNight ? "#142A58" : "#E2F4FA"} stopOpacity="0.3" />
          <stop offset="100%" stopColor={isNight ? "#1E3B75" : "#F4FAFD"} stopOpacity="0.6" />
        </linearGradient>

        {/* Sun Radial Glow */}
        <radialGradient id={`uvSunGlow_${isMobile ? "m" : "d"}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFFBEB" stopOpacity="0.75" />
          <stop offset="35%" stopColor="#FEF08A" stopOpacity="0.35" />
          <stop offset="70%" stopColor="#FDE047" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
        </radialGradient>

        {/* Moon Radial Glow */}
        <radialGradient id={`uvMoonAura_${isMobile ? "m" : "d"}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#F0F9FF" stopOpacity="0.45" />
          <stop offset="35%" stopColor="#BAE6FD" stopOpacity="0.22" />
          <stop offset="70%" stopColor="#38BDF8" stopOpacity="0.06" />
          <stop offset="100%" stopColor="#0284C7" stopOpacity="0" />
        </radialGradient>

        {/* Lunar Sky Wash */}
        <radialGradient
          id={`uvMoonWash_${isMobile ? "m" : "d"}`}
          cx={isMobile ? "87%" : "87%"}
          cy={isMobile ? "8%" : "12%"}
          r="55%"
        >
          <stop offset="0%" stopColor="#BAE6FD" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#020617" stopOpacity="0" />
        </radialGradient>

        {/* Crescent Moon Fill */}
        <linearGradient id={`uvMoonGrad_${isMobile ? "m" : "d"}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="45%" stopColor="#F0F9FF" />
          <stop offset="100%" stopColor="#BAE6FD" />
        </linearGradient>

        {/* Crescent Moon Masks */}
        <mask id={`uvCrescentMask_${isMobile ? "m" : "d"}`}>
          {isMobile ? (
            <>
              <circle cx="940" cy="-220" r="28" fill="white" />
              <circle cx="952" cy="-230" r="24" fill="black" />
            </>
          ) : (
            <>
              <circle cx="1250" cy="92" r="30" fill="white" />
              <circle cx="1264" cy="80" r="26" fill="black" />
            </>
          )}
        </mask>

        {/* Distant Hills Gradients */}
        <linearGradient id={`uvHillFarGrad_${isMobile ? "m" : "d"}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={isNight ? "#0A1D16" : "#7CB992"} />
          <stop offset="100%" stopColor={isNight ? "#06130E" : "#62A478"} />
        </linearGradient>
        <linearGradient id={`uvHillNearGrad_${isMobile ? "m" : "d"}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={isNight ? "#0F2B20" : "#549E6C"} />
          <stop offset="100%" stopColor={isNight ? "#091C14" : "#3F8756"} />
        </linearGradient>

        {/* Lush Campus Turf (Ground) */}
        <linearGradient id={`uvGrassUpper_${isMobile ? "m" : "d"}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={isNight ? "#0A140F" : "#3B8C53"} />
          <stop offset="100%" stopColor={isNight ? "#060D09" : "#2B6F3E"} />
        </linearGradient>
        <linearGradient id={`uvGrassLower_${isMobile ? "m" : "d"}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={isNight ? "#070E0A" : "#2E7543"} />
          <stop offset="100%" stopColor={isNight ? "#0A0F0D" : "#1F542F"} />
        </linearGradient>

        {/* Building Facade Gradients */}
        <linearGradient id={`uvMainFacade_${isMobile ? "m" : "d"}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={isNight ? "#CBD5E1" : "#FAF8F5"} />
          <stop offset="100%" stopColor={isNight ? "#94A3B8" : "#EDE8DF"} />
        </linearGradient>
        <linearGradient id={`uvHostelFacade_${isMobile ? "m" : "d"}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={isNight ? "#E2E8F0" : "#FFFFFF"} />
          <stop offset="100%" stopColor={isNight ? "#CBD5E1" : "#F8F6F2"} />
        </linearGradient>

        {/* 3D Isometric Depth Surfaces */}
        <linearGradient id={`uvSideShade_${isMobile ? "m" : "d"}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={isNight ? "#64748B" : "#D4CEC5"} />
          <stop offset="100%" stopColor={isNight ? "#475569" : "#C4BDAE"} />
        </linearGradient>
        <linearGradient id={`uvHostelSideShade_${isMobile ? "m" : "d"}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={isNight ? "#94A3B8" : "#E4DFD7"} />
          <stop offset="100%" stopColor={isNight ? "#64748B" : "#D5CEBF"} />
        </linearGradient>
        <linearGradient id={`uvRoofSlab_${isMobile ? "m" : "d"}`} x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor={isNight ? "#94A3B8" : "#EFECE5"} />
          <stop offset="100%" stopColor={isNight ? "#64748B" : "#E0DCD3"} />
        </linearGradient>

        {/* Road Gradient */}
        <linearGradient id={`uvRoadGrad_${isMobile ? "m" : "d"}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={isNight ? "#1E293B" : "#B4BCC8"} />
          <stop offset="100%" stopColor={isNight ? "#0F172A" : "#9DA6B3"} />
        </linearGradient>

        {/* Soft Ground Shadows Filter */}
        <filter id={`uvSoftShadow_${isMobile ? "m" : "d"}`} x="-10%" y="-10%" width="120%" height="130%">
          <feDropShadow dx="2" dy="6" stdDeviation="6" floodColor="#040c06" floodOpacity={isNight ? "0.45" : "0.15"} />
        </filter>

        <filter id={`uvTreeShadow_${isMobile ? "m" : "d"}`}>
          <feDropShadow dx="3" dy="5" stdDeviation="4" floodColor="#040c06" floodOpacity={isNight ? "0.4" : "0.14"} />
        </filter>

        <filter id={`uvNightLightGlow_${isMobile ? "m" : "d"}`}>
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <filter id={`uvHillBlur_${isMobile ? "m" : "d"}`}>
          <feGaussianBlur stdDeviation="1.8" />
        </filter>

        <filter id={`uvCloudSoft_${isMobile ? "m" : "d"}`}>
          <feGaussianBlur stdDeviation="3" />
        </filter>
      </defs>

      {/* ═══════════════════════════════════════════════
          LAYER 1 — SKY & ATMOSPHERE
      ═══════════════════════════════════════════════ */}
      {isMobile ? (
        <>
          <rect x="-400" y="-1000" width="2240" height="2400" fill="url(#uvSkyGrad_m)" />
          <rect x="-400" y="320" width="2240" height="480" fill="url(#uvHorizonHaze_m)" />
        </>
      ) : (
        <>
          <rect x="0" y="0" width="1440" height="800" fill="url(#uvSkyGrad_d)" />
          <rect x="0" y="320" width="1440" height="480" fill="url(#uvHorizonHaze_d)" />
        </>
      )}

      {/* ── Day Mode: Sun, God-Rays & Shimmer ── */}
      {!isNight && (
        <g>
          {isMobile ? (
            <>
              {/* Mobile Sun Corona */}
              <circle cx="940" cy="-220" r="180" fill="url(#uvSunGlow_m)" />
              <circle cx="940" cy="-220" r="110" fill="#FEF3C7" opacity="0.12" />
              {/* Mobile Rotating Sun Beams */}
              <g className="m-sun-beams" opacity="0.3">
                {MOBILE_SUN_BEAMS.map((beam, ri) => (
                  <line
                    key={ri}
                    x1="940"
                    y1="-220"
                    x2={beam.x2}
                    y2={beam.y2}
                    stroke="#FDE047"
                    strokeWidth={beam.strokeWidth}
                    opacity={beam.opacity}
                  />
                ))}
              </g>
              <circle className="m-sun-core" cx="940" cy="-220" r="44" fill="#FEF08A" opacity="0.4" />
              <circle cx="940" cy="-220" r="28" fill="#FDE047" opacity="0.75" />
              <circle cx="940" cy="-220" r="18" fill="#FBBF24" />
            </>
          ) : (
            <>
              {/* Desktop Sun Corona */}
              <circle cx="1330" cy="88" r="220" fill="url(#uvSunGlow_d)" />
              <circle cx="1330" cy="88" r="140" fill="#FEF3C7" opacity="0.12" />
              {/* Desktop Rotating Sun Beams */}
              <g className="sun-beams" opacity="0.3">
                {SUN_BEAMS.map((beam, ri) => (
                  <line
                    key={ri}
                    x1="1330"
                    y1="88"
                    x2={beam.x2}
                    y2={beam.y2}
                    stroke="#FDE047"
                    strokeWidth={beam.strokeWidth}
                    opacity={beam.opacity}
                  />
                ))}
              </g>
              <circle className="sun-core" cx="1330" cy="88" r="54" fill="#FEF08A" opacity="0.4" />
              <circle cx="1330" cy="88" r="34" fill="#FDE047" opacity="0.75" />
              <circle cx="1330" cy="88" r="22" fill="#FBBF24" />
            </>
          )}
        </g>
      )}

      {/* ── Night Mode: Moon, Moonlight Wash & Stars ── */}
      {isNight && (
        <g>
          {isMobile ? (
            <>
              <rect x="-400" y="-1000" width="2240" height="2400" fill="url(#uvMoonWash_m)" />
              {/* Mobile Crescent Moon */}
              <circle cx="940" cy="-220" r="140" fill="url(#uvMoonAura_m)" opacity="0.38" />
              <circle cx="940" cy="-220" r="70" fill="url(#uvMoonAura_m)" className="moon-glow" />
              <circle cx="940" cy="-220" r="42" fill="url(#uvMoonAura_m)" />
              <circle
                cx="940"
                cy="-220"
                r="28"
                fill="url(#uvMoonGrad_m)"
                mask="url(#uvCrescentMask_m)"
                className="moon-glow"
              />

              {/* Mobile Upper Sky Starry Canopy */}
              <path d="M 360 -450 Q 360 -444 354 -444 Q 360 -444 360 -438 Q 360 -444 366 -444 Q 360 -444 360 -450 Z" fill="#F0F9FF" className="star-pulse-1" />
              <path d="M 640 -520 Q 640 -514 634 -514 Q 640 -514 640 -508 Q 640 -514 646 -514 Q 640 -514 640 -520 Z" fill="#E0F2FE" className="star-pulse-2" />
              <path d="M 820 -380 Q 820 -374 814 -374 Q 820 -374 820 -368 Q 820 -374 826 -374 Q 820 -374 820 -380 Z" fill="#F0F9FF" className="star-pulse-3" />
              <circle cx="280" cy="-380" r="2.0" fill="#FFFFFF" className="star-pulse-2" />
              <circle cx="480" cy="-560" r="1.8" fill="#BAE6FD" className="star-pulse-1" />
              <circle cx="520" cy="-340" r="2.2" fill="#FFFFFF" className="star-pulse-3" />
              <circle cx="740" cy="-480" r="1.9" fill="#E0F2FE" className="star-pulse-2" />
              <circle cx="860" cy="-540" r="2.1" fill="#FFFFFF" className="star-pulse-1" />
              <circle cx="1060" cy="-420" r="1.8" fill="#BAE6FD" className="star-pulse-3" />
              <circle cx="1140" cy="-320" r="2.0" fill="#FFFFFF" className="star-pulse-2" />
            </>
          ) : (
            <>
              <rect x="0" y="0" width="1440" height="800" fill="url(#uvMoonWash_d)" />
              {/* Desktop Crescent Moon */}
              <circle cx="1250" cy="92" r="160" fill="url(#uvMoonAura_d)" opacity="0.4" />
              <circle cx="1250" cy="92" r="80" fill="url(#uvMoonAura_d)" className="moon-glow" />
              <circle cx="1250" cy="92" r="48" fill="url(#uvMoonAura_d)" />
              <circle
                cx="1250"
                cy="92"
                r="30"
                fill="url(#uvMoonGrad_d)"
                mask="url(#uvCrescentMask_d)"
                className="moon-glow"
              />
            </>
          )}

          {/* ── Fixed Twinkling Stars (Horizon Sparkles) ── */}
          <path d="M 130 46 Q 130 52 124 52 Q 130 52 130 58 Q 130 52 136 52 Q 130 52 130 46 Z" fill="#F0F9FF" className="star-pulse-1" />
          <path d="M 420 42 Q 420 48 414 48 Q 420 48 420 54 Q 420 48 426 48 Q 420 48 420 42 Z" fill="#E0F2FE" className="star-pulse-2" />
          <path d="M 840 52 Q 840 58 834 58 Q 840 58 840 64 Q 840 58 846 58 Q 840 58 840 52 Z" fill="#F0F9FF" className="star-pulse-3" />

          {/* Micro Pinprick Stars */}
          <circle cx="260" cy="78" r="1.9" fill="#E0F2FE" className="star-pulse-2" />
          <circle cx="340" cy="40" r="1.8" fill="#FFFFFF" className="star-pulse-3" />
          <circle cx="510" cy="88" r="2.0" fill="#BAE6FD" className="star-pulse-1" />
          <circle cx="680" cy="42" r="2.2" fill="#FFFFFF" className="star-pulse-2" />
          <circle cx="750" cy="74" r="1.8" fill="#E0F2FE" className="star-pulse-3" />
          <circle cx="980" cy="45" r="2.0" fill="#FFFFFF" className="star-pulse-1" />
          <circle cx="1090" cy="80" r="1.9" fill="#E0F2FE" className="star-pulse-2" />
          <circle cx="1380" cy="60" r="2.0" fill="#BAE6FD" className="star-pulse-3" />
        </g>
      )}

      {/* ── Volumetric 3D Clouds ── */}
      <g
        className="cloud-a"
        opacity={isNight ? 0.22 : 0.85}
        filter={isNight ? `url(#uvCloudSoft_${isMobile ? "m" : "d"})` : undefined}
        style={{ transition: "opacity 1.2s ease" }}
      >
        <ellipse cx="160" cy="104" rx="84" ry="22" fill={isNight ? "#475569" : "#C7D4E0"} opacity="0.45" />
        <ellipse cx="220" cy="94" rx="55" ry="16" fill={isNight ? "#475569" : "#C7D4E0"} opacity="0.35" />
        <ellipse cx="160" cy="95" rx="90" ry="32" fill={isNight ? "#94A3B8" : "white"} />
        <ellipse cx="230" cy="82" rx="65" ry="26" fill={isNight ? "#94A3B8" : "white"} />
        <ellipse cx="90" cy="102" rx="60" ry="24" fill={isNight ? "#94A3B8" : "white"} />
      </g>
      <g
        className="cloud-b"
        opacity={isNight ? 0.18 : 0.75}
        filter={isNight ? `url(#uvCloudSoft_${isMobile ? "m" : "d"})` : undefined}
        style={{ transition: "opacity 1.2s ease" }}
      >
        <ellipse cx="780" cy="70" rx="70" ry="22" fill={isNight ? "#94A3B8" : "white"} />
        <ellipse cx="840" cy="58" rx="52" ry="20" fill={isNight ? "#94A3B8" : "white"} />
        <ellipse cx="720" cy="76" rx="45" ry="16" fill={isNight ? "#94A3B8" : "white"} />
      </g>
      <g
        className="cloud-c"
        opacity={isNight ? 0.14 : 0.65}
        filter={isNight ? `url(#uvCloudSoft_${isMobile ? "m" : "d"})` : undefined}
        style={{ transition: "opacity 1.2s ease" }}
      >
        <ellipse cx="1120" cy="115" rx="75" ry="20" fill={isNight ? "#94A3B8" : "white"} />
        <ellipse cx="1180" cy="104" rx="58" ry="18" fill={isNight ? "#94A3B8" : "white"} />
      </g>

      {/* ═══════════════════════════════════════════════
          LAYER 2 — DISTANT ISOMETRIC HILLS
      ═══════════════════════════════════════════════ */}
      <path
        d="M -50 340 Q 180 270 420 305 Q 680 340 920 280 Q 1160 220 1340 270 Q 1460 300 1500 330 L 1500 390 L -50 390 Z"
        fill={`url(#uvHillFarGrad_${isMobile ? "m" : "d"})`}
        filter={`url(#uvHillBlur_${isMobile ? "m" : "d"})`}
        opacity={isNight ? "0.65" : "0.55"}
      />
      <path
        d="M -50 365 Q 120 315 320 340 Q 560 365 760 320 Q 980 275 1180 325 Q 1360 365 1500 345 L 1500 420 L -50 420 Z"
        fill={`url(#uvHillNearGrad_${isMobile ? "m" : "d"})`}
        opacity={isNight ? "0.75" : "0.70"}
      />

      {/* ═══════════════════════════════════════════════
          LAYER 3 — MIDGROUND GREENERY & ISOMETRIC LAWN
      ═══════════════════════════════════════════════ */}
      <rect x="-400" y="380" width="2240" height="260" fill={`url(#uvGrassUpper_${isMobile ? "m" : "d"})`} />
      <polygon
        points="-400,380 1840,380 1840,420 -400,430"
        fill={isNight ? "#06100B" : "#266035"}
        opacity="0.55"
      />

      {/* ═══════════════════════════════════════════════
          LAYER 4 — MODERN CAMPUS LIBRARY (RIGHT WING)
      ═══════════════════════════════════════════════ */}
      <polygon points="1220,280 1240,270 1440,270 1420,280" fill={isNight ? "#020704" : "#0A2012"} opacity="0.3" />
      <rect
        x="1220"
        y="280"
        width="200"
        height="285"
        fill={`url(#uvHostelFacade_${isMobile ? "m" : "d"})`}
        filter={`url(#uvSoftShadow_${isMobile ? "m" : "d"})`}
        rx="2"
      />
      <polygon
        points="1420,280 1435,270 1435,555 1420,565"
        fill={`url(#uvHostelSideShade_${isMobile ? "m" : "d"})`}
      />
      <rect x="1220" y="280" width="200" height="12" fill="#3B82F6" />
      <polygon points="1420,280 1435,270 1435,282 1420,292" fill="#1D4ED8" />

      {/* Modern Library Tinted Glass Grid */}
      {[0, 1, 2, 3].map(row => {
        const isLitAtNight = (row === 1) || (row === 2);
        return (
          <rect
            key={`lib${row}`}
            x="1235"
            y={303 + row * 62}
            width="170"
            height="42"
            fill={isNight ? (isLitAtNight ? "#FDE047" : "#0F172A") : "#93C5FD"}
            opacity={isNight ? (isLitAtNight ? 0.85 : 0.5) : 0.65}
            className={isNight && isLitAtNight ? "night-window-glow" : undefined}
            filter={isNight && isLitAtNight ? `url(#uvNightLightGlow_${isMobile ? "m" : "d"})` : undefined}
            rx="2"
          />
        );
      })}

      <rect x="1265" y="525" width="110" height="26" fill="#1D4ED8" rx="13" />
      <text x="1320" y="542" textAnchor="middle" fill="white" fontSize="11" fontFamily="sans-serif" fontWeight="700" letterSpacing="0.8">
        LIBRARY
      </text>

      {/* ═══════════════════════════════════════════════
          LAYER 5 — MAIN ACADEMIC BLOCK (FACADE)
      ═══════════════════════════════════════════════ */}
      {/* Soft Building Drop Shadow */}
      <rect x="526" y="260" width="410" height="365" fill="#061208" opacity={isNight ? "0.35" : "0.10"} rx="2" />

      {/* Main Structure */}
      <rect
        x="520"
        y="240"
        width="400"
        height="360"
        fill={`url(#uvMainFacade_${isMobile ? "m" : "d"})`}
        filter={`url(#uvSoftShadow_${isMobile ? "m" : "d"})`}
        rx="2"
      />

      {/* Green Roof Band */}
      <rect x="520" y="240" width="400" height="14" fill="#10B981" opacity="0.95" rx="2" />
      <rect x="520" y="254" width="400" height="4" fill="#059669" opacity="0.6" />

      {/* Structural Pillars */}
      {[538, 580, 622, 664, 760, 802, 844, 886].map((x, i) => (
        <rect key={i} x={x} y="258" width="16" height="342" fill={isNight ? "#64748B" : "#E8E4DC"} opacity="0.45" rx="1" />
      ))}

      {/* Main Windows — Living Dynamic Room Lights */}
      {[0, 1, 2, 3, 4].map(row =>
        [0, 1, 2, 3, 4, 5, 6].map(col => {
          const isNightLit =
            (row === 0 && col === 5) ||
            (row === 1 && col === 2) ||
            (row === 2 && col === 4) ||
            (row === 3 && col === 1) ||
            (row === 4 && col === 3);
          return (
            <rect
              key={`mw${row}-${col}`}
              x={538 + col * 52}
              y={272 + row * 56}
              width="34"
              height="38"
              fill={isNight ? (isNightLit ? "#FDE047" : "#1E293B") : "#93C5FD"}
              opacity={isNight ? (isNightLit ? 0.82 : 0.45) : 0.65}
              className={isNight && isNightLit ? "night-window-glow" : undefined}
              filter={isNight && isNightLit ? `url(#uvNightLightGlow_${isMobile ? "m" : "d"})` : undefined}
              rx="2"
            />
          );
        })
      )}

      {/* Marwadi University Emblem Badge */}
      <rect
        x="610"
        y="462"
        width="220"
        height="32"
        fill={isNight ? "#064E3B" : "#10B981"}
        opacity={isNight ? 0.45 : 1}
        rx="6"
      />
      <text
        x="720"
        y="482"
        textAnchor="middle"
        fill="white"
        fontSize="13"
        fontFamily="sans-serif"
        fontWeight="700"
        letterSpacing="0.5"
        opacity={isNight ? 0.65 : 1}
      >
        MARWADI UNIVERSITY
      </text>

      {/* Grand Entrance */}
      <rect x="690" y="556" width="80" height="44" fill={isNight ? "#94764E" : "#C8A97A"} rx="3" />
      <rect x="690" y="556" width="80" height="6" fill={isNight ? "#785E3E" : "#B8935A"} />
      <rect x="718" y="566" width="11" height="28" fill={isNight ? "#5E462E" : "#A0804C"} rx="1.5" />
      <rect x="751" y="566" width="11" height="28" fill={isNight ? "#5E462E" : "#A0804C"} rx="1.5" />
      <rect x="672" y="544" width="116" height="14" fill={isNight ? "#064E3B" : "#059669"} rx="2" opacity={isNight ? 0.6 : 0.95} />

      {/* University Flagpole & Pennant */}
      <rect x="719" y="210" width="2.5" height="30" fill="#94A3B8" rx="1" />
      <circle cx="720.25" cy="209" r="2.5" fill="#F59E0B" />
      <path d="M 721.5 210 L 748 217 L 721.5 224 Z" fill="#10B981" />

      {/* ═══════════════════════════════════════════════
          LAYER 6 — STUDENT HOSTELS (FACADES)
      ═══════════════════════════════════════════════ */}

      {/* ── Hostel A (Amber Accent) ── */}
      <g filter={`url(#uvSoftShadow_${isMobile ? "m" : "d"})`}>
        <rect x="22" y="282" width="196" height="268" fill={`url(#uvHostelFacade_${isMobile ? "m" : "d"})`} rx="2" />
        <rect x="22" y="282" width="196" height="12" fill="#F59E0B" />
        <rect x="22" y="294" width="196" height="3" fill="#D97706" opacity="0.5" />
        {[0, 1, 2, 3].map(f => <rect key={f} x="22" y={297 + f * 62} width="196" height="1" fill={isNight ? "#475569" : "#E5E7EB"} />)}

        {[0, 1, 2, 3].map(row =>
          [0, 1, 2].map(col => {
            const isNightLit = (row === 1 && col === 2) || (row === 3 && col === 0);
            return (
              <rect
                key={`aw${row}-${col}`}
                x={38 + col * 58}
                y={303 + row * 62}
                width="38"
                height="42"
                fill={isNight ? (isNightLit ? "#FDE047" : "#1E293B") : "#93C5FD"}
                opacity={isNight ? (isNightLit ? 0.9 : 0.45) : 0.65}
                className={isNight && isNightLit ? "night-window-glow" : undefined}
                filter={isNight && isNightLit ? `url(#uvNightLightGlow_${isMobile ? "m" : "d"})` : undefined}
                rx="2"
              />
            );
          })
        )}

        <rect x="70" y="524" width="100" height="26" fill="#F59E0B" rx="13" />
        <text x="120" y="541" textAnchor="middle" fill="white" fontSize="12" fontFamily="sans-serif" fontWeight="700" letterSpacing="0.5">HOSTEL A</text>
        <rect x="98" y="508" width="44" height="42" fill={isNight ? "#8A6635" : "#C09050"} rx="2" />
        <rect x="98" y="508" width="44" height="6" fill={isNight ? "#6D4E26" : "#A07030"} />
        <rect x="118" y="518" width="5" height="22" fill={isNight ? "#4F3618" : "#8B6040"} rx="1" />
      </g>

      {/* ── Hostel B (Emerald Accent) ── */}
      <g filter={`url(#uvSoftShadow_${isMobile ? "m" : "d"})`}>
        <rect x="262" y="298" width="182" height="252" fill={`url(#uvHostelFacade_${isMobile ? "m" : "d"})`} rx="2" />
        <rect x="262" y="298" width="182" height="12" fill="#10B981" />
        <rect x="262" y="310" width="182" height="3" fill="#059669" opacity="0.5" />
        {[0, 1, 2, 3].map(f => <rect key={f} x="262" y={313 + f * 59} width="182" height="1" fill={isNight ? "#475569" : "#E5E7EB"} />)}

        {[0, 1, 2, 3].map(row =>
          [0, 1, 2].map(col => {
            const isNightLit = (row === 0 && col === 1) || (row === 2 && col === 2);
            return (
              <rect
                key={`bw${row}-${col}`}
                x={276 + col * 54}
                y={320 + row * 59}
                width="36"
                height="40"
                fill={isNight ? (isNightLit ? "#FDE047" : "#1E293B") : "#93C5FD"}
                opacity={isNight ? (isNightLit ? 0.9 : 0.45) : 0.65}
                className={isNight && isNightLit ? "night-window-glow" : undefined}
                filter={isNight && isNightLit ? `url(#uvNightLightGlow_${isMobile ? "m" : "d"})` : undefined}
                rx="2"
              />
            );
          })
        )}

        <rect x="303" y="515" width="100" height="26" fill="#10B981" rx="13" />
        <text x="353" y="532" textAnchor="middle" fill="white" fontSize="12" fontFamily="sans-serif" fontWeight="700" letterSpacing="0.5">HOSTEL B</text>
        <rect x="331" y="498" width="44" height="42" fill={isNight ? "#244E36" : "#4A7C59"} rx="2" />
        <rect x="331" y="498" width="44" height="6" fill={isNight ? "#1B3B29" : "#365E42"} />
        <rect x="351" y="508" width="5" height="22" fill={isNight ? "#132D1F" : "#2A4B34"} rx="1" />
      </g>

      {/* ── Hostel C (Teal Accent) ── */}
      <g filter={`url(#uvSoftShadow_${isMobile ? "m" : "d"})`}>
        <rect x="994" y="298" width="182" height="252" fill={`url(#uvHostelFacade_${isMobile ? "m" : "d"})`} rx="2" />
        <rect x="994" y="298" width="182" height="12" fill="#0D9488" />
        <rect x="994" y="310" width="182" height="3" fill="#0F766E" opacity="0.5" />
        {[0, 1, 2, 3].map(f => <rect key={f} x="994" y={313 + f * 59} width="182" height="1" fill={isNight ? "#475569" : "#E5E7EB"} />)}

        {[0, 1, 2, 3].map(row =>
          [0, 1, 2].map(col => {
            const isNightLit = (row === 1 && col === 0) || (row === 3 && col === 2);
            return (
              <rect
                key={`cw${row}-${col}`}
                x={1008 + col * 54}
                y={320 + row * 59}
                width="36"
                height="40"
                fill={isNight ? (isNightLit ? "#FDE047" : "#1E293B") : "#93C5FD"}
                opacity={isNight ? (isNightLit ? 0.9 : 0.45) : 0.65}
                className={isNight && isNightLit ? "night-window-glow" : undefined}
                filter={isNight && isNightLit ? `url(#uvNightLightGlow_${isMobile ? "m" : "d"})` : undefined}
                rx="2"
              />
            );
          })
        )}

        <rect x="1035" y="515" width="100" height="26" fill="#0D9488" rx="13" />
        <text x="1085" y="532" textAnchor="middle" fill="white" fontSize="12" fontFamily="sans-serif" fontWeight="700" letterSpacing="0.5">HOSTEL C</text>
        <rect x="1063" y="498" width="44" height="42" fill={isNight ? "#1F4E4B" : "#3B7C77"} rx="2" />
        <rect x="1063" y="498" width="44" height="6" fill={isNight ? "#153937" : "#2C5E5A"} />
        <rect x="1083" y="508" width="5" height="22" fill={isNight ? "#0E2827" : "#1E4340"} rx="1" />
      </g>

      {/* ═══════════════════════════════════════════════
          LAYER 7 — CAMPUS ROAD & INFRASTRUCTURE
      ═══════════════════════════════════════════════ */}
      <rect x="-400" y="596" width="2240" height="40" fill={`url(#uvRoadGrad_${isMobile ? "m" : "d"})`} />
      {/* Dashed Center Lane Dividers */}
      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].map(i => (
        <rect
          key={i}
          x={40 + i * 106}
          y="612"
          width="56"
          height="4"
          fill={isNight ? "#E2E8F0" : "#FFFFFF"}
          opacity={isNight ? "0.35" : "0.55"}
          rx="2"
        />
      ))}

      {/* ═══════════════════════════════════════════════
          LAYER 8 — CAMPUS VENDING MACHINES (3D)
      ═══════════════════════════════════════════════ */}
      {[
        { x: 224, accent: "#10B981" },   // Hostel A
        { x: 450, accent: "#F59E0B" },   // Hostel B
        { x: 994, accent: "#10B981" },  // Hostel C
        { x: 1216, accent: "#F59E0B" },  // Hostel D
      ].map(({ x, accent }, i) => (
        <g key={i}>
          <polygon
            points={`${x+36},507 ${x+41},503 ${x+41},559 ${x+36},563`}
            fill={isNight ? "#334155" : "#D4D4D4"}
            stroke={isNight ? "#1E293B" : "#C4C4C4"}
            strokeWidth="0.5"
          />
          <polygon
            points={`${x},507 ${x+5},503 ${x+41},503 ${x+36},507`}
            fill={isNight ? "#475569" : "#F4F4F4"}
            stroke={isNight ? "#334155" : "#E2E2E2"}
            strokeWidth="0.5"
          />
          <rect
            x={x}
            y="507"
            width="36"
            height="56"
            fill={isNight ? "#1E293B" : "#ECECEC"}
            rx="3"
            stroke={isNight ? "#334155" : "#CDCDCD"}
            strokeWidth="1"
          />
          <rect
            x={x + 3}
            y="510"
            width="30"
            height="18"
            fill={accent}
            opacity={isNight ? 0.95 : 0.85}
            rx="2"
            filter={isNight ? `url(#uvNightLightGlow_${isMobile ? "m" : "d"})` : undefined}
          />
          <text x={x + 18} y="523" textAnchor="middle" fill="white" fontSize="9" fontFamily="sans-serif" fontWeight="800">
            UV
          </text>
          <rect x={x + 4} y="532" width="12" height="11" fill={accent} opacity={isNight ? 0.75 : 0.55} rx="1" />
          <rect x={x + 20} y="532" width="12" height="11" fill="#F59E0B" opacity={isNight ? 0.75 : 0.55} rx="1" />
          <rect x={x + 4} y="546" width="12" height="11" fill="#F59E0B" opacity={isNight ? 0.65 : 0.45} rx="1" />
          <rect x={x + 20} y="546" width="12" height="11" fill={accent} opacity={isNight ? 0.65 : 0.45} rx="1" />
          <rect x={x + 10} y="560" width="16" height="3" fill="#64748B" rx="1.5" />
          <rect x={x + 4} y="558" width="28" height="4" fill="#94A3B8" opacity="0.6" rx="1" />
        </g>
      ))}

      {/* ═══════════════════════════════════════════════
          LAYER 9 — ISOMETRIC TREES & FOLIAGE
      ═══════════════════════════════════════════════ */}
      {[
        { x: 490, base: 548, tH: 48, cR: 44, c1: "#2E7D52", c2: "#388E5A" },
        { x: 510, base: 548, tH: 48, cR: 30, c1: "#3D8B5A", c2: "#4CAF72" },
        { x: 930, base: 548, tH: 44, cR: 40, c1: "#2E7D52", c2: "#3D8B5A" },
        { x: 950, base: 548, tH: 44, cR: 28, c1: "#4CAF72", c2: "#388E5A" },
        { x: 218, base: 556, tH: 36, cR: 32, c1: "#2E7D52", c2: "#388E5A" },
        { x: 1228, base: 556, tH: 36, cR: 32, c1: "#388E5A", c2: "#2E7D52" },
        { x: 660, base: 558, tH: 28, cR: 24, c1: "#3D8B5A", c2: "#4CAF72" },
        { x: 782, base: 558, tH: 28, cR: 24, c1: "#2E7D52", c2: "#3D8B5A" },
        { x: 145, base: 560, tH: 22, cR: 20, c1: "#388E5A", c2: "#4CAF72" },
        { x: 1296, base: 560, tH: 22, cR: 20, c1: "#2E7D52", c2: "#388E5A" },
        { x: 455, base: 562, tH: 20, cR: 18, c1: "#4CAF72", c2: "#3D8B5A" },
        { x: 988, base: 562, tH: 20, cR: 18, c1: "#388E5A", c2: "#4CAF72" },
      ].map((t, i) => (
        <g key={i} filter={`url(#uvTreeShadow_${isMobile ? "m" : "d"})`}>
          <ellipse cx={t.x + 8} cy={t.base + 4} rx={t.cR * 0.9} ry={6} fill="#040c06" opacity={isNight ? 0.35 : 0.14} />
          <rect x={t.x - 1} y={t.base - t.tH - 2} width="6" height={t.tH} fill="#4A341E" rx="1" opacity="0.6" />
          <rect x={t.x - 4} y={t.base - t.tH} width="8" height={t.tH} fill="#6E4F30" rx="2" />
          <circle cx={t.x} cy={t.base - t.tH - t.cR * 0.4} r={t.cR * 0.9} fill={isNight ? "#0D2517" : "#1E5E38"} opacity="0.35" />
          <circle cx={t.x - 12} cy={t.base - t.tH - t.cR * 0.5} r={t.cR * 0.65} fill={isNight ? "#123320" : t.c2} />
          <circle cx={t.x + 12} cy={t.base - t.tH - t.cR * 0.5} r={t.cR * 0.65} fill={isNight ? "#123320" : t.c2} />
          <circle cx={t.x} cy={t.base - t.tH - t.cR * 0.8} r={t.cR} fill={isNight ? "#174028" : t.c1} />
          <circle cx={t.x + 5} cy={t.base - t.tH - t.cR * 1.05} r={t.cR * 0.45} fill={isNight ? "#235D3B" : "#5CC87A"} opacity={isNight ? 0.2 : 0.35} />
        </g>
      ))}

      {/* ═══════════════════════════════════════════════
          LAYER 10 — LOWER CAMPUS LAWN & ATMOSPHERE
      ═══════════════════════════════════════════════ */}
      {isMobile ? (
        <>
          <rect x="-400" y="636" width="2240" height="1500" fill="url(#uvGrassLower_m)" />
          <rect x="-400" y="635" width="2240" height="2" fill={isNight ? "#334155" : "#5DB86E"} opacity="0.5" />
          <rect x="-400" y="636" width="2240" height="6" fill={isNight ? "#1E293B" : "#CBD2DD"} opacity="0.3" />
        </>
      ) : (
        <>
          <rect x="0" y="636" width="1440" height="164" fill="url(#uvGrassLower_d)" />
          <rect x="0" y="635" width="1440" height="2" fill={isNight ? "#334155" : "#5DB86E"} opacity="0.5" />
          <rect x="0" y="636" width="1440" height="6" fill={isNight ? "#1E293B" : "#CBD2DD"} opacity="0.3" />
        </>
      )}

      {/* Subtle Turf Shading */}
      {[80, 220, 380, 540, 700, 860, 1020, 1180, 1340].map((gx, gi) => (
        <g key={`g${gi}`} opacity={isNight ? "0.10" : "0.22"}>
          <ellipse cx={gx} cy={665 + (gi % 3) * 18} rx={16 + (gi % 4) * 4} ry={2.5} fill={isNight ? "#0D1C14" : "#3D8B5A"} />
          <ellipse cx={gx + 35} cy={675 + (gi % 2) * 22} rx={12 + (gi % 3) * 3} ry={2} fill={isNight ? "#112319" : "#4CAF72"} />
        </g>
      ))}

      {/* Cinematic Edge Soft Vignettes (Preserves center text readability) */}
      <rect x="0" y="0" width="80" height="800" fill={isNight ? "#020617" : "#5B9EC9"} opacity={isMobile ? 0 : 0.08} />
      <rect x="1360" y="0" width="80" height="800" fill={isNight ? "#020617" : "#5B9EC9"} opacity={isMobile ? 0 : 0.08} />
    </>
  );
}

export function CampusBackground() {
  const [isNight, setIsNight] = useState(false);

  useEffect(() => {
    const hour = new Date().getHours();
    setIsNight(hour >= 19 || hour < 6);
  }, []);

  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none select-none"
      style={{ backgroundColor: isNight ? "#020617" : "#5B9EC9" }}
    >
      <style>{`
        /* ── Cloud Drift Animations ── */
        @keyframes cloud-drift-a {
          0%   { transform: translateX(-240px); }
          100% { transform: translateX(1680px); }
        }
        @keyframes cloud-drift-b {
          0%   { transform: translateX(-200px); }
          100% { transform: translateX(1640px); }
        }
        @keyframes cloud-drift-c {
          0%   { transform: translateX(-180px); }
          100% { transform: translateX(1620px); }
        }

        /* ── Sun & Rays Breathing ── */
        @keyframes sun-shimmer {
          0%, 100% { opacity: 0.85; transform: scale(1); }
          50%       { opacity: 1.00; transform: scale(1.04); }
        }
        @keyframes rays-rotate {
          0%   { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* ── Moon Breathing ── */
        @keyframes moon-breathe {
          0%, 100% { opacity: 0.92; filter: drop-shadow(0 0 14px rgba(186, 230, 253, 0.45)); }
          50%       { opacity: 1.00; filter: drop-shadow(0 0 24px rgba(224, 242, 254, 0.8)); }
        }

        /* ── Twinkling Stars ── */
        @keyframes star-fade-1 {
          0%, 100% { opacity: 0.35; filter: drop-shadow(0 0 2px rgba(224, 242, 254, 0.5)); }
          50%       { opacity: 1.00; filter: drop-shadow(0 0 6px rgba(224, 242, 254, 0.95)); }
        }
        @keyframes star-fade-2 {
          0%, 100% { opacity: 0.30; filter: drop-shadow(0 0 2px rgba(186, 230, 253, 0.45)); }
          50%       { opacity: 0.95; filter: drop-shadow(0 0 5px rgba(186, 230, 253, 0.9)); }
        }
        @keyframes star-fade-3 {
          0%, 100% { opacity: 0.40; filter: drop-shadow(0 0 2px rgba(240, 249, 255, 0.6)); }
          50%       { opacity: 1.00; filter: drop-shadow(0 0 7px rgba(255, 255, 255, 1)); }
        }

        /* ── Window Glow Pulse (Night Mode Cozy Study Lights) ── */
        @keyframes room-light-flicker {
          0%, 100% { opacity: 0.88; }
          45%       { opacity: 0.98; }
          75%       { opacity: 0.82; }
        }

        .cloud-a { animation: cloud-drift-a 58s linear infinite; }
        .cloud-b { animation: cloud-drift-b 76s linear infinite 14s; }
        .cloud-c { animation: cloud-drift-c 94s linear infinite 28s; }
        .sun-core { transform-origin: 1330px 88px; animation: sun-shimmer 5s ease-in-out infinite; }
        .sun-beams { transform-origin: 1330px 88px; animation: rays-rotate 120s linear infinite; }
        .m-sun-core { transform-origin: 940px -220px; animation: sun-shimmer 5s ease-in-out infinite; }
        .m-sun-beams { transform-origin: 940px -220px; animation: rays-rotate 120s linear infinite; }
        .moon-glow { animation: moon-breathe 4.5s ease-in-out infinite; }
        .star-pulse-1 { animation: star-fade-1 3.5s ease-in-out infinite; }
        .star-pulse-2 { animation: star-fade-2 4.2s ease-in-out infinite 1.1s; }
        .star-pulse-3 { animation: star-fade-3 2.9s ease-in-out infinite 1.8s; }
        .night-window-glow { animation: room-light-flicker 6s ease-in-out infinite; }
      `}</style>

      {/* ── Desktop Campus (Landscape Wide-Angle Panorama) ── */}
      <svg
        viewBox="0 0 1440 800"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
        className="hidden md:block w-full h-full"
        aria-hidden="true"
        role="presentation"
      >
        <CampusScene isNight={isNight} isMobile={false} />
      </svg>

      {/* ── Mobile Campus (Full-Screen Immersive Portrait Atmosphere) ── */}
      <svg
        viewBox="180 -650 1080 2150"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
        className="block md:hidden w-full h-full"
        aria-hidden="true"
        role="presentation"
      >
        <CampusScene isNight={isNight} isMobile={true} />
      </svg>
    </div>
  );
}
