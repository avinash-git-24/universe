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
 * - Balanced Atmosphere: Softened god-rays and cinematic depth haze that preserve
 *   crisp hero text and CTA button contrast.
 * - Performance: 100% pure SVG + hardware-accelerated CSS animations — zero JS overhead.
 */

export function CampusBackground() {
  const [isNight, setIsNight] = useState(false);

  useEffect(() => {
    const hour = new Date().getHours();
    setIsNight(hour >= 19 || hour < 6);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
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
        @keyframes star-pulse-1 {
          0%, 100% { opacity: 0.25; transform: scale(0.85); }
          50%       { opacity: 1.00; transform: scale(1.2); }
        }
        @keyframes star-pulse-2 {
          0%, 100% { opacity: 0.20; transform: scale(0.9); }
          50%       { opacity: 0.95; transform: scale(1.15); }
        }
        @keyframes star-pulse-3 {
          0%, 100% { opacity: 0.30; transform: scale(0.8); }
          50%       { opacity: 1.00; transform: scale(1.25); }
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
        .moon-glow { animation: moon-breathe 4.5s ease-in-out infinite; }
        .star-1 { transform-origin: center; animation: star-pulse-1 3.2s ease-in-out infinite; }
        .star-2 { transform-origin: center; animation: star-pulse-2 4.1s ease-in-out infinite 0.9s; }
        .star-3 { transform-origin: center; animation: star-pulse-3 2.8s ease-in-out infinite 1.6s; }
        .night-window-glow { animation: room-light-flicker 6s ease-in-out infinite; }
      `}</style>

      <svg
        viewBox="0 0 1440 800"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
        className="w-full h-full"
        aria-hidden="true"
        role="presentation"
      >
        <defs>
          {/* ── Sky Gradient ── */}
          <linearGradient id="uvSkyGrad" x1="0" y1="0" x2="0" y2="1">
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
          <linearGradient id="uvHorizonHaze" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={isNight ? "#0A1734" : "#C8E8F5"} stopOpacity="0" />
            <stop offset="60%" stopColor={isNight ? "#142A58" : "#E2F4FA"} stopOpacity="0.3" />
            <stop offset="100%" stopColor={isNight ? "#1E3B75" : "#F4FAFD"} stopOpacity="0.6" />
          </linearGradient>

          {/* Sun Radial Glow */}
          <radialGradient id="uvSunGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFFBEB" stopOpacity="0.75" />
            <stop offset="35%" stopColor="#FEF08A" stopOpacity="0.35" />
            <stop offset="70%" stopColor="#FDE047" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
          </radialGradient>

          {/* Moon Radial Glow */}
          <radialGradient id="uvMoonAura" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#F0F9FF" stopOpacity="0.45" />
            <stop offset="35%" stopColor="#BAE6FD" stopOpacity="0.22" />
            <stop offset="70%" stopColor="#38BDF8" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#0284C7" stopOpacity="0" />
          </radialGradient>

          {/* Lunar Sky Wash */}
          <radialGradient id="uvMoonWash" cx="87%" cy="12%" r="55%">
            <stop offset="0%" stopColor="#BAE6FD" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#020617" stopOpacity="0" />
          </radialGradient>

          {/* Crescent Moon Fill */}
          <linearGradient id="uvMoonGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="45%" stopColor="#F0F9FF" />
            <stop offset="100%" stopColor="#BAE6FD" />
          </linearGradient>

          <mask id="uvCrescentMask">
            <circle cx="1250" cy="92" r="30" fill="white" />
            <circle cx="1264" cy="80" r="26" fill="black" />
          </mask>

          {/* Distant Hills Gradients */}
          <linearGradient id="uvHillFarGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={isNight ? "#0A1D16" : "#7CB992"} />
            <stop offset="100%" stopColor={isNight ? "#06130E" : "#62A478"} />
          </linearGradient>
          <linearGradient id="uvHillNearGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={isNight ? "#0F2B20" : "#549E6C"} />
            <stop offset="100%" stopColor={isNight ? "#091C14" : "#3F8756"} />
          </linearGradient>

          {/* Lush Campus Turf (Ground) */}
          <linearGradient id="uvGrassUpper" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={isNight ? "#0D2517" : "#3B8C53"} />
            <stop offset="100%" stopColor={isNight ? "#091D12" : "#2B6F3E"} />
          </linearGradient>
          <linearGradient id="uvGrassLower" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={isNight ? "#091D12" : "#2E7543"} />
            <stop offset="100%" stopColor={isNight ? "#05130A" : "#1F542F"} />
          </linearGradient>

          {/* Building Facade Gradients */}
          <linearGradient id="uvMainFacade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={isNight ? "#CBD5E1" : "#FAF8F5"} />
            <stop offset="100%" stopColor={isNight ? "#94A3B8" : "#EDE8DF"} />
          </linearGradient>
          <linearGradient id="uvHostelFacade" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={isNight ? "#E2E8F0" : "#FFFFFF"} />
            <stop offset="100%" stopColor={isNight ? "#CBD5E1" : "#F8F6F2"} />
          </linearGradient>

          {/* 3D Isometric Depth Surfaces */}
          <linearGradient id="uvSideShade" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={isNight ? "#64748B" : "#D4CEC5"} />
            <stop offset="100%" stopColor={isNight ? "#475569" : "#C4BDAE"} />
          </linearGradient>
          <linearGradient id="uvHostelSideShade" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={isNight ? "#94A3B8" : "#E4DFD7"} />
            <stop offset="100%" stopColor={isNight ? "#64748B" : "#D5CEBF"} />
          </linearGradient>
          <linearGradient id="uvRoofSlab" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor={isNight ? "#94A3B8" : "#EFECE5"} />
            <stop offset="100%" stopColor={isNight ? "#64748B" : "#E0DCD3"} />
          </linearGradient>

          {/* Road Gradient */}
          <linearGradient id="uvRoadGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={isNight ? "#1E293B" : "#B4BCC8"} />
            <stop offset="100%" stopColor={isNight ? "#0F172A" : "#9DA6B3"} />
          </linearGradient>

          {/* Soft Ground Shadows Filter */}
          <filter id="uvSoftShadow" x="-10%" y="-10%" width="120%" height="130%">
            <feDropShadow dx="2" dy="6" stdDeviation="6" floodColor="#040c06" floodOpacity={isNight ? "0.45" : "0.15"} />
          </filter>

          <filter id="uvTreeShadow">
            <feDropShadow dx="3" dy="5" stdDeviation="4" floodColor="#040c06" floodOpacity={isNight ? "0.4" : "0.14"} />
          </filter>

          <filter id="uvNightLightGlow">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="uvHillBlur">
            <feGaussianBlur stdDeviation="1.8" />
          </filter>

          <filter id="uvCloudSoft">
            <feGaussianBlur stdDeviation="3" />
          </filter>
        </defs>

        {/* ═══════════════════════════════════════════════
            LAYER 1 — SKY & ATMOSPHERE
        ═══════════════════════════════════════════════ */}
        <rect x="0" y="0" width="1440" height="800" fill="url(#uvSkyGrad)" />
        <rect x="0" y="320" width="1440" height="480" fill="url(#uvHorizonHaze)" />

        {/* ── Day Mode: Sun, God-Rays & Shimmer ── */}
        {!isNight && (
          <g>
            {/* Ambient Sun Corona */}
            <circle cx="1330" cy="88" r="220" fill="url(#uvSunGlow)" />
            <circle cx="1330" cy="88" r="140" fill="#FEF3C7" opacity="0.12" />

            {/* Subtle Rotating Sun Beams */}
            <g className="sun-beams" opacity="0.3">
              {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle, ri) => {
                const rad = (angle * Math.PI) / 180;
                const x2 = 1330 + Math.cos(rad) * 160;
                const y2 = 88 + Math.sin(rad) * 160;
                return (
                  <line
                    key={ri}
                    x1="1330"
                    y1="88"
                    x2={x2}
                    y2={y2}
                    stroke="#FDE047"
                    strokeWidth={ri % 2 === 0 ? 2 : 1}
                    opacity={ri % 2 === 0 ? 0.35 : 0.18}
                  />
                );
              })}
            </g>

            {/* Golden Core */}
            <circle className="sun-core" cx="1330" cy="88" r="54" fill="#FEF08A" opacity="0.4" />
            <circle cx="1330" cy="88" r="34" fill="#FDE047" opacity="0.75" />
            <circle cx="1330" cy="88" r="22" fill="#FBBF24" />
          </g>
        )}

        {/* ── Night Mode: Moon, Moonlight Wash & Stars ── */}
        {isNight && (
          <g>
            <rect x="0" y="0" width="1440" height="800" fill="url(#uvMoonWash)" />
            {/* Luminous Lunar Auras */}
            <circle cx="1250" cy="92" r="160" fill="url(#uvMoonAura)" opacity="0.4" />
            <circle cx="1250" cy="92" r="80" fill="url(#uvMoonAura)" className="moon-glow" />
            <circle cx="1250" cy="92" r="48" fill="url(#uvMoonAura)" />

            {/* Crescent Moon */}
            <circle
              cx="1250"
              cy="92"
              r="30"
              fill="url(#uvMoonGrad)"
              mask="url(#uvCrescentMask)"
              className="moon-glow"
            />

            {/* Sparkle Diamond Stars */}
            <path d="M 130 46 Q 130 52 124 52 Q 130 52 130 58 Q 130 52 136 52 Q 130 52 130 46 Z" fill="#F0F9FF" className="star-1" />
            <path d="M 420 42 Q 420 48 414 48 Q 420 48 420 54 Q 420 48 426 48 Q 420 48 420 42 Z" fill="#E0F2FE" className="star-2" />
            <path d="M 840 52 Q 840 58 834 58 Q 840 58 840 64 Q 840 58 846 58 Q 840 58 840 52 Z" fill="#F0F9FF" className="star-3" />
            <path d="M 1150 38 Q 1150 44 1144 44 Q 1150 44 1150 50 Q 1150 44 1156 44 Q 1150 44 1150 38 Z" fill="#E0F2FE" className="star-1" />
            <path d="M 680 32 Q 680 38 674 38 Q 680 38 680 44 Q 680 38 686 38 Q 680 38 680 32 Z" fill="#F0F9FF" className="star-3" />

            {/* Micro Pinprick Stars */}
            <circle cx="260" cy="78" r="1.8" fill="#E0F2FE" className="star-2" />
            <circle cx="340" cy="40" r="1.6" fill="#FFFFFF" className="star-3" />
            <circle cx="510" cy="88" r="1.9" fill="#BAE6FD" className="star-1" />
            <circle cx="750" cy="74" r="1.7" fill="#E0F2FE" className="star-3" />
            <circle cx="980" cy="45" r="1.8" fill="#FFFFFF" className="star-1" />
            <circle cx="1090" cy="80" r="1.7" fill="#E0F2FE" className="star-2" />
            <circle cx="1380" cy="60" r="1.9" fill="#BAE6FD" className="star-3" />
            <circle cx="80" cy="32" r="1.4" fill="#E0F2FE" className="star-1" />
            <circle cx="450" cy="55" r="1.5" fill="#FFFFFF" className="star-2" />
            <circle cx="620" cy="95" r="1.4" fill="#E0F2FE" className="star-1" />
            <circle cx="870" cy="35" r="1.5" fill="#FFFFFF" className="star-3" />
            <circle cx="1040" cy="58" r="1.7" fill="#BAE6FD" className="star-2" />
            <circle cx="1320" cy="35" r="1.4" fill="#FFFFFF" className="star-3" />
          </g>
        )}

        {/* ── Volumetric 3D Clouds ── */}
        <g
          className="cloud-a"
          opacity={isNight ? 0.22 : 0.85}
          filter={isNight ? "url(#uvCloudSoft)" : undefined}
          style={{ transition: "opacity 1.2s ease" }}
        >
          {/* Cloud under-shadow */}
          <ellipse cx="160" cy="104" rx="84" ry="22" fill={isNight ? "#475569" : "#C7D4E0"} opacity="0.45" />
          <ellipse cx="220" cy="94" rx="55" ry="16" fill={isNight ? "#475569" : "#C7D4E0"} opacity="0.35" />
          {/* Main puffy cloud body */}
          <ellipse cx="160" cy="95" rx="90" ry="32" fill={isNight ? "#94A3B8" : "white"} />
          <ellipse cx="230" cy="82" rx="65" ry="26" fill={isNight ? "#94A3B8" : "white"} />
          <ellipse cx="90" cy="102" rx="60" ry="24" fill={isNight ? "#94A3B8" : "white"} />
          <ellipse cx="190" cy="75" rx="45" ry="20" fill={isNight ? "#94A3B8" : "white"} />
          {/* Top highlight */}
          <ellipse cx="175" cy="72" rx="35" ry="14" fill="#FFFFFF" opacity={isNight ? 0.3 : 0.65} />
        </g>

        <g
          className="cloud-b"
          opacity={isNight ? 0.18 : 0.72}
          filter={isNight ? "url(#uvCloudSoft)" : undefined}
          style={{ transition: "opacity 1.2s ease" }}
        >
          <ellipse cx="560" cy="80" rx="96" ry="22" fill={isNight ? "#475569" : "#C7D4E0"} opacity="0.4" />
          <ellipse cx="560" cy="68" rx="110" ry="38" fill={isNight ? "#94A3B8" : "white"} />
          <ellipse cx="648" cy="55" rx="78" ry="30" fill={isNight ? "#94A3B8" : "white"} />
          <ellipse cx="472" cy="74" rx="72" ry="29" fill={isNight ? "#94A3B8" : "white"} />
          <ellipse cx="600" cy="48" rx="52" ry="22" fill={isNight ? "#94A3B8" : "white"} />
          <ellipse cx="580" cy="44" rx="40" ry="15" fill="#FFFFFF" opacity={isNight ? 0.3 : 0.6} />
        </g>

        <g
          className="cloud-c"
          opacity={isNight ? 0.15 : 0.65}
          filter={isNight ? "url(#uvCloudSoft)" : undefined}
          style={{ transition: "opacity 1.2s ease" }}
        >
          <ellipse cx="900" cy="125" rx="74" ry="18" fill={isNight ? "#475569" : "#C7D4E0"} opacity="0.4" />
          <ellipse cx="900" cy="115" rx="80" ry="30" fill={isNight ? "#94A3B8" : "white"} />
          <ellipse cx="970" cy="103" rx="58" ry="23" fill={isNight ? "#94A3B8" : "white"} />
          <ellipse cx="828" cy="120" rx="55" ry="22" fill={isNight ? "#94A3B8" : "white"} />
          <ellipse cx="910" cy="102" rx="30" ry="12" fill="#FFFFFF" opacity={isNight ? 0.3 : 0.55} />
        </g>

        {/* ═══════════════════════════════════════════════
            LAYER 2 — DISTANT HILLS (Atmospheric Depth)
        ═══════════════════════════════════════════════ */}
        <g filter="url(#uvHillBlur)" opacity={isNight ? 0.55 : 0.42}>
          <ellipse cx="200" cy="522" rx="300" ry="55" fill="url(#uvHillFarGrad)" />
          <ellipse cx="720" cy="516" rx="420" ry="64" fill="url(#uvHillFarGrad)" />
          <ellipse cx="1250" cy="522" rx="340" ry="58" fill="url(#uvHillFarGrad)" />
        </g>
        <g opacity={isNight ? 0.7 : 0.52}>
          <ellipse cx="100" cy="535" rx="210" ry="38" fill="url(#uvHillNearGrad)" />
          <ellipse cx="500" cy="530" rx="270" ry="44" fill="url(#uvHillNearGrad)" />
          <ellipse cx="950" cy="532" rx="290" ry="40" fill="url(#uvHillNearGrad)" />
          <ellipse cx="1350" cy="535" rx="230" ry="38" fill="url(#uvHillNearGrad)" />
        </g>

        {/* ═══════════════════════════════════════════════
            LAYER 3 — UPPER CAMPUS LAWN (Behind Road)
        ═══════════════════════════════════════════════ */}
        <rect x="0" y="535" width="1440" height="57" fill="url(#uvGrassUpper)" />

        {/* ═══════════════════════════════════════════════
            LAYER 4 — 3D ISOMETRIC FACETS & GROUND SHADOWS
        ═══════════════════════════════════════════════ */}

        {/* Ground Cast Shadows (Isometric oblique projection from top-right sun) */}
        <g opacity={isNight ? 0.45 : 0.11}>
          {/* Main Academic Block shadow */}
          <polygon points="520,600 920,600 938,620 538,620" fill="#040c06" />
          {/* Hostel A shadow */}
          <polygon points="22,550 218,550 234,564 38,564" fill="#040c06" />
          {/* Hostel B shadow */}
          <polygon points="262,550 444,550 460,564 278,564" fill="#040c06" />
          {/* Hostel C shadow */}
          <polygon points="1000,550 1182,550 1198,564 1016,564" fill="#040c06" />
          {/* Hostel D shadow */}
          <polygon points="1226,550 1422,550 1438,564 1242,564" fill="#040c06" />
        </g>

        {/* ── Hostel A (3D Isometric Side & Roof) ── */}
        <polygon points="218,282 233,272 233,540 218,550" fill="url(#uvHostelSideShade)" />
        {/* Hostel A Side Windows */}
        {[0, 1, 2, 3].map(row => {
          const isLitAtNight = (row % 2 === 0);
          return (
            <polygon
              key={`sa${row}`}
              points={`222,${303 + row * 62} 230,${296 + row * 62} 230,${332 + row * 62} 222,${339 + row * 62}`}
              fill={isNight ? (isLitAtNight ? "#FDE047" : "#1E293B") : "#93C5FD"}
              opacity={isNight ? (isLitAtNight ? 0.85 : 0.45) : 0.6}
              className={isNight && isLitAtNight ? "night-window-glow" : undefined}
            />
          );
        })}
        {/* Hostel A Roof Top Slab */}
        <polygon points="22,282 37,272 233,272 218,282" fill="url(#uvRoofSlab)" />
        <polygon points="22,282 37,272 233,272 218,282" fill="#F59E0B" opacity="0.4" />
        <polygon points="218,282 233,272 233,284 218,294" fill="#D97706" opacity="0.7" />

        {/* ── Hostel B (3D Isometric Side & Roof) ── */}
        <polygon points="444,298 459,288 459,540 444,550" fill="url(#uvHostelSideShade)" />
        {[0, 1, 2, 3].map(row => {
          const isLitAtNight = (row === 1 || row === 3);
          return (
            <polygon
              key={`sb${row}`}
              points={`448,${320 + row * 59} 456,${313 + row * 59} 456,${347 + row * 59} 448,${354 + row * 59}`}
              fill={isNight ? (isLitAtNight ? "#FDE047" : "#1E293B") : "#93C5FD"}
              opacity={isNight ? (isLitAtNight ? 0.85 : 0.45) : 0.6}
              className={isNight && isLitAtNight ? "night-window-glow" : undefined}
            />
          );
        })}
        <polygon points="262,298 277,288 459,288 444,298" fill="url(#uvRoofSlab)" />
        <polygon points="262,298 277,288 459,288 444,298" fill="#10B981" opacity="0.4" />
        <polygon points="444,298 459,288 459,300 444,310" fill="#059669" opacity="0.7" />

        {/* ── Main Academic Block (3D Isometric Side & Roof) ── */}
        <polygon points="920,240 935,230 935,590 920,600" fill="url(#uvSideShade)" />
        {[0, 1, 2, 3, 4].map(row => {
          const isLitAtNight = (row === 0 || row === 2 || row === 4);
          return (
            <polygon
              key={`sm${row}`}
              points={`923,${272 + row * 56} 932,${264 + row * 56} 932,${298 + row * 56} 923,${306 + row * 56}`}
              fill={isNight ? (isLitAtNight ? "#FDE047" : "#1E293B") : "#93C5FD"}
              opacity={isNight ? (isLitAtNight ? 0.9 : 0.5) : 0.55}
              className={isNight && isLitAtNight ? "night-window-glow" : undefined}
            />
          );
        })}
        <polygon points="520,240 535,230 935,230 920,240" fill="url(#uvRoofSlab)" />
        <polygon points="520,240 535,230 935,230 920,240" fill="#10B981" opacity="0.5" />
        <polygon points="920,240 935,230 935,244 920,254" fill="#059669" opacity="0.8" />
        <polygon points="920,254 935,244 935,248 920,258" fill="#047857" opacity="0.45" />

        {/* ── Hostel C (3D Isometric Side & Roof) ── */}
        <polygon points="1182,298 1197,288 1197,540 1182,550" fill="url(#uvHostelSideShade)" />
        {[0, 1, 2, 3].map(row => {
          const isLitAtNight = (row === 0 || row === 2);
          return (
            <polygon
              key={`sc${row}`}
              points={`1186,${320 + row * 59} 1194,${313 + row * 59} 1194,${347 + row * 59} 1186,${354 + row * 59}`}
              fill={isNight ? (isLitAtNight ? "#FDE047" : "#1E293B") : "#93C5FD"}
              opacity={isNight ? (isLitAtNight ? 0.85 : 0.45) : 0.6}
              className={isNight && isLitAtNight ? "night-window-glow" : undefined}
            />
          );
        })}
        <polygon points="1000,298 1015,288 1197,288 1182,298" fill="url(#uvRoofSlab)" />
        <polygon points="1000,298 1015,288 1197,288 1182,298" fill="#10B981" opacity="0.4" />
        <polygon points="1182,298 1197,288 1197,300 1182,310" fill="#059669" opacity="0.7" />

        {/* ── Hostel D (3D Isometric Side & Roof) ── */}
        <polygon points="1422,282 1437,272 1437,540 1422,550" fill="url(#uvHostelSideShade)" />
        {[0, 1, 2, 3].map(row => {
          const isLitAtNight = (row === 1 || row === 2);
          return (
            <polygon
              key={`sd${row}`}
              points={`1426,${303 + row * 62} 1434,${296 + row * 62} 1434,${332 + row * 62} 1426,${339 + row * 62}`}
              fill={isNight ? (isLitAtNight ? "#FDE047" : "#1E293B") : "#93C5FD"}
              opacity={isNight ? (isLitAtNight ? 0.85 : 0.45) : 0.6}
              className={isNight && isLitAtNight ? "night-window-glow" : undefined}
            />
          );
        })}
        <polygon points="1226,282 1241,272 1437,272 1422,282" fill="url(#uvRoofSlab)" />
        <polygon points="1226,282 1241,272 1437,272 1422,282" fill="#F59E0B" opacity="0.4" />
        <polygon points="1422,282 1437,272 1437,284 1422,294" fill="#D97706" opacity="0.7" />

        {/* ═══════════════════════════════════════════════
            LAYER 5 — MAIN ACADEMIC BLOCK (FACADE)
        ═══════════════════════════════════════════════ */}
        {/* Soft Building Drop Shadow */}
        <rect x="526" y="260" width="410" height="365" fill="#061208" opacity={isNight ? "0.35" : "0.10"} rx="2" />

        {/* Main Structure */}
        <rect x="520" y="240" width="400" height="360" fill="url(#uvMainFacade)" filter="url(#uvSoftShadow)" rx="2" />

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
            // Night lighting pattern: classrooms and labs have active study lighting
            const isNightLit = (row + col * 2) % 3 !== 1;
            return (
              <rect
                key={`mw${row}-${col}`}
                x={538 + col * 52}
                y={272 + row * 56}
                width="34"
                height="38"
                fill={isNight ? (isNightLit ? "#FDE047" : "#1E293B") : "#93C5FD"}
                opacity={isNight ? (isNightLit ? 0.92 : 0.45) : 0.65}
                className={isNight && isNightLit ? "night-window-glow" : undefined}
                filter={isNight && isNightLit ? "url(#uvNightLightGlow)" : undefined}
                rx="2"
              />
            );
          })
        )}

        {/* Marwadi University Emblem Badge */}
        <rect x="610" y="462" width="220" height="32" fill="#10B981" rx="6" />
        <text x="720" y="482" textAnchor="middle" fill="white" fontSize="13" fontFamily="sans-serif" fontWeight="700" letterSpacing="0.5">
          MARWADI UNIVERSITY
        </text>

        {/* Grand Entrance */}
        <rect x="690" y="556" width="80" height="44" fill={isNight ? "#94764E" : "#C8A97A"} rx="3" />
        <rect x="690" y="556" width="80" height="6" fill={isNight ? "#785E3E" : "#B8935A"} />
        <rect x="718" y="566" width="11" height="28" fill={isNight ? "#5E462E" : "#A0804C"} rx="1.5" />
        <rect x="751" y="566" width="11" height="28" fill={isNight ? "#5E462E" : "#A0804C"} rx="1.5" />
        <rect x="672" y="544" width="116" height="14" fill="#059669" rx="2" opacity="0.95" />

        {/* University Flagpole & Pennant */}
        <rect x="719" y="210" width="2.5" height="30" fill="#94A3B8" rx="1" />
        <circle cx="720.25" cy="209" r="2.5" fill="#F59E0B" />
        <path d="M 721.5 210 L 748 217 L 721.5 224 Z" fill="#10B981" />

        {/* ═══════════════════════════════════════════════
            LAYER 6 — STUDENT HOSTELS (FACADES)
        ═══════════════════════════════════════════════ */}

        {/* ── Hostel A (Amber Accent) ── */}
        <g filter="url(#uvSoftShadow)">
          <rect x="22" y="282" width="196" height="268" fill="url(#uvHostelFacade)" rx="2" />
          <rect x="22" y="282" width="196" height="12" fill="#F59E0B" />
          <rect x="22" y="294" width="196" height="3" fill="#D97706" opacity="0.5" />
          {[0, 1, 2, 3].map(f => <rect key={f} x="22" y={297 + f * 62} width="196" height="1" fill={isNight ? "#475569" : "#E5E7EB"} />)}

          {/* Living Hostel Windows */}
          {[0, 1, 2, 3].map(row =>
            [0, 1, 2].map(col => {
              const isNightLit = (row + col) % 2 === 0;
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
                  filter={isNight && isNightLit ? "url(#uvNightLightGlow)" : undefined}
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
        <g filter="url(#uvSoftShadow)">
          <rect x="262" y="298" width="182" height="252" fill="url(#uvHostelFacade)" rx="2" />
          <rect x="262" y="298" width="182" height="12" fill="#10B981" />
          <rect x="262" y="310" width="182" height="3" fill="#059669" opacity="0.5" />
          {[0, 1, 2, 3].map(f => <rect key={f} x="262" y={313 + f * 59} width="182" height="1" fill={isNight ? "#475569" : "#E5E7EB"} />)}

          {[0, 1, 2, 3].map(row =>
            [0, 1, 2].map(col => {
              const isNightLit = (row * 2 + col) % 3 === 0;
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
                  filter={isNight && isNightLit ? "url(#uvNightLightGlow)" : undefined}
                  rx="2"
                />
              );
            })
          )}

          <rect x="306" y="525" width="100" height="26" fill="#10B981" rx="13" />
          <text x="356" y="542" textAnchor="middle" fill="white" fontSize="12" fontFamily="sans-serif" fontWeight="700" letterSpacing="0.5">HOSTEL B</text>
          <rect x="330" y="508" width="44" height="42" fill={isNight ? "#8A6635" : "#C09050"} rx="2" />
          <rect x="330" y="508" width="44" height="6" fill={isNight ? "#6D4E26" : "#A07030"} />
          <rect x="350" y="518" width="5" height="22" fill={isNight ? "#4F3618" : "#8B6040"} rx="1" />
        </g>

        {/* ── Hostel C (Emerald Accent) ── */}
        <g filter="url(#uvSoftShadow)">
          <rect x="1000" y="298" width="182" height="252" fill="url(#uvHostelFacade)" rx="2" />
          <rect x="1000" y="298" width="182" height="12" fill="#10B981" />
          <rect x="1000" y="310" width="182" height="3" fill="#059669" opacity="0.5" />
          {[0, 1, 2, 3].map(f => <rect key={f} x="1000" y={313 + f * 59} width="182" height="1" fill={isNight ? "#475569" : "#E5E7EB"} />)}

          {[0, 1, 2, 3].map(row =>
            [0, 1, 2].map(col => {
              const isNightLit = (row + col * 3) % 2 === 1;
              return (
                <rect
                  key={`cw${row}-${col}`}
                  x={1014 + col * 54}
                  y={320 + row * 59}
                  width="36"
                  height="40"
                  fill={isNight ? (isNightLit ? "#FDE047" : "#1E293B") : "#93C5FD"}
                  opacity={isNight ? (isNightLit ? 0.9 : 0.45) : 0.65}
                  className={isNight && isNightLit ? "night-window-glow" : undefined}
                  filter={isNight && isNightLit ? "url(#uvNightLightGlow)" : undefined}
                  rx="2"
                />
              );
            })
          )}

          <rect x="1042" y="525" width="100" height="26" fill="#10B981" rx="13" />
          <text x="1092" y="542" textAnchor="middle" fill="white" fontSize="12" fontFamily="sans-serif" fontWeight="700" letterSpacing="0.5">HOSTEL C</text>
          <rect x="1066" y="508" width="44" height="42" fill={isNight ? "#8A6635" : "#C09050"} rx="2" />
          <rect x="1066" y="508" width="44" height="6" fill={isNight ? "#6D4E26" : "#A07030"} />
          <rect x="1086" y="518" width="5" height="22" fill={isNight ? "#4F3618" : "#8B6040"} rx="1" />
        </g>

        {/* ── Hostel D (Amber Accent) ── */}
        <g filter="url(#uvSoftShadow)">
          <rect x="1226" y="282" width="196" height="268" fill="url(#uvHostelFacade)" rx="2" />
          <rect x="1226" y="282" width="196" height="12" fill="#F59E0B" />
          <rect x="1226" y="294" width="196" height="3" fill="#D97706" opacity="0.5" />
          {[0, 1, 2, 3].map(f => <rect key={f} x="1226" y={297 + f * 62} width="196" height="1" fill={isNight ? "#475569" : "#E5E7EB"} />)}

          {[0, 1, 2, 3].map(row =>
            [0, 1, 2].map(col => {
              const isNightLit = (row * col + 1) % 2 === 0;
              return (
                <rect
                  key={`dw${row}-${col}`}
                  x={1242 + col * 58}
                  y={303 + row * 62}
                  width="38"
                  height="42"
                  fill={isNight ? (isNightLit ? "#FDE047" : "#1E293B") : "#93C5FD"}
                  opacity={isNight ? (isNightLit ? 0.9 : 0.45) : 0.65}
                  className={isNight && isNightLit ? "night-window-glow" : undefined}
                  filter={isNight && isNightLit ? "url(#uvNightLightGlow)" : undefined}
                  rx="2"
                />
              );
            })
          )}

          <rect x="1274" y="524" width="100" height="26" fill="#F59E0B" rx="13" />
          <text x="1324" y="541" textAnchor="middle" fill="white" fontSize="12" fontFamily="sans-serif" fontWeight="700" letterSpacing="0.5">HOSTEL D</text>
          <rect x="1302" y="508" width="44" height="42" fill={isNight ? "#8A6635" : "#C09050"} rx="2" />
          <rect x="1302" y="508" width="44" height="6" fill={isNight ? "#6D4E26" : "#A07030"} />
          <rect x="1322" y="518" width="5" height="22" fill={isNight ? "#4F3618" : "#8B6040"} rx="1" />
        </g>

        {/* ═══════════════════════════════════════════════
            LAYER 7 — CAMPUS ROAD & SIDEWALK
        ═══════════════════════════════════════════════ */}
        {/* Main Road Surface */}
        <rect x="0" y="592" width="1440" height="44" fill="url(#uvRoadGrad)" />
        {/* Road Curb Lines & 3D Depth */}
        <rect x="0" y="592" width="1440" height="2" fill={isNight ? "#334155" : "#CAD0DC"} opacity="0.7" />
        <rect x="0" y="594" width="1440" height="5" fill="#000000" opacity={isNight ? "0.35" : "0.15"} />
        <rect x="0" y="633" width="1440" height="3" fill="#000000" opacity={isNight ? "0.45" : "0.22"} />

        {/* Crisp Road Dashes */}
        {Array.from({ length: 14 }).map((_, i) => (
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
            {/* 3D Isometric Side & Top Faces */}
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

            {/* Front Body */}
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

            {/* Header Display Banner */}
            <rect
              x={x + 3}
              y="510"
              width="30"
              height="18"
              fill={accent}
              opacity={isNight ? 0.95 : 0.85}
              rx="2"
              filter={isNight ? "url(#uvNightLightGlow)" : undefined}
            />
            <text x={x + 18} y="523" textAnchor="middle" fill="white" fontSize="9" fontFamily="sans-serif" fontWeight="800">
              UV
            </text>

            {/* Snack Tiers */}
            <rect x={x + 4} y="532" width="12" height="11" fill={accent} opacity={isNight ? 0.75 : 0.55} rx="1" />
            <rect x={x + 20} y="532" width="12" height="11" fill="#F59E0B" opacity={isNight ? 0.75 : 0.55} rx="1" />
            <rect x={x + 4} y="546" width="12" height="11" fill="#F59E0B" opacity={isNight ? 0.65 : 0.45} rx="1" />
            <rect x={x + 20} y="546" width="12" height="11" fill={accent} opacity={isNight ? 0.65 : 0.45} rx="1" />

            {/* Dispenser slot */}
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
          <g key={i} filter="url(#uvTreeShadow)">
            {/* Elongated Ground Shadow */}
            <ellipse cx={t.x + 8} cy={t.base + 4} rx={t.cR * 0.9} ry={6} fill="#040c06" opacity={isNight ? 0.35 : 0.14} />

            {/* Tree Trunk */}
            <rect x={t.x - 1} y={t.base - t.tH - 2} width="6" height={t.tH} fill="#4A341E" rx="1" opacity="0.6" />
            <rect x={t.x - 4} y={t.base - t.tH} width="8" height={t.tH} fill="#6E4F30" rx="2" />

            {/* Canopy 3D Sphere Layers */}
            <circle cx={t.x} cy={t.base - t.tH - t.cR * 0.4} r={t.cR * 0.9} fill={isNight ? "#0D2517" : "#1E5E38"} opacity="0.35" />
            <circle cx={t.x - 12} cy={t.base - t.tH - t.cR * 0.5} r={t.cR * 0.65} fill={isNight ? "#123320" : t.c2} />
            <circle cx={t.x + 12} cy={t.base - t.tH - t.cR * 0.5} r={t.cR * 0.65} fill={isNight ? "#123320" : t.c2} />
            <circle cx={t.x} cy={t.base - t.tH - t.cR * 0.8} r={t.cR} fill={isNight ? "#174028" : t.c1} />
            {/* Top-Right Sunlight Highlight */}
            <circle cx={t.x + 5} cy={t.base - t.tH - t.cR * 1.05} r={t.cR * 0.45} fill={isNight ? "#235D3B" : "#5CC87A"} opacity={isNight ? 0.2 : 0.35} />
          </g>
        ))}

        {/* ═══════════════════════════════════════════════
            LAYER 10 — LOWER CAMPUS LAWN & ATMOSPHERE
        ═══════════════════════════════════════════════ */}
        <rect x="0" y="636" width="1440" height="164" fill="url(#uvGrassLower)" />
        {/* Sidewalk curb strip */}
        <rect x="0" y="635" width="1440" height="2" fill={isNight ? "#334155" : "#5DB86E"} opacity="0.5" />
        <rect x="0" y="636" width="1440" height="6" fill={isNight ? "#1E293B" : "#CBD2DD"} opacity="0.3" />

        {/* Subtle Turf Shading */}
        {[80, 220, 380, 540, 700, 860, 1020, 1180, 1340].map((gx, gi) => (
          <g key={`g${gi}`} opacity={isNight ? "0.15" : "0.22"}>
            <ellipse cx={gx} cy={665 + (gi % 3) * 18} rx={16 + (gi % 4) * 4} ry={2.5} fill={isNight ? "#1E4730" : "#3D8B5A"} />
            <ellipse cx={gx + 35} cy={675 + (gi % 2) * 22} rx={12 + (gi % 3) * 3} ry={2} fill={isNight ? "#265C3E" : "#4CAF72"} />
          </g>
        ))}

        {/* Cinematic Edge Soft Vignettes (Preserves center text readability) */}
        <rect x="0" y="0" width="80" height="800" fill={isNight ? "#020617" : "#5B9EC9"} opacity="0.08" />
        <rect x="1360" y="0" width="80" height="800" fill={isNight ? "#020617" : "#5B9EC9"} opacity="0.08" />
      </svg>
    </div>
  );
}

