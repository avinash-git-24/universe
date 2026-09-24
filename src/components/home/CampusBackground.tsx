"use client";

import { useState, useEffect } from "react";

/**
 * UniVerse — Animated Campus Background
 *
 * A hand-crafted SVG illustration of a modern Indian university campus
 * inspired by Marwadi University. Features animated clouds, students,
 * and a vending machine near each hostel block.
 *
 * Dynamic Atmosphere:
 * - Day (06:00 - 18:59): Radiant blue sky, vibrant clouds, glowing daytime sun.
 * - Night (19:00 - 05:59): Deep royal indigo sky, luminous crescent moon, twinkling micro-stars.
 *
 * All buildings, trees, roads, and campus structures remain 100% crisp and untouched.
 * Performance: pure CSS animations — zero JS on the render thread.
 */

export function CampusBackground() {
  const [isNight, setIsNight] = useState(false);

  useEffect(() => {
    const hour = new Date().getHours();
    // Night is from 7:00 PM (19:00) to 5:59 AM (05:59)
    setIsNight(hour >= 19 || hour < 6);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      <style>{`
        /* ── Cloud Animations ── */
        @keyframes cloud-drift-a {
          0%   { transform: translateX(-220px); }
          100% { transform: translateX(1660px); }
        }
        @keyframes cloud-drift-b {
          0%   { transform: translateX(-180px); }
          100% { transform: translateX(1620px); }
        }
        @keyframes cloud-drift-c {
          0%   { transform: translateX(-160px); }
          100% { transform: translateX(1600px); }
        }

        @keyframes flag-wave {
          0%, 100% { d: path("M 724 168 L 760 175 L 724 182"); }
          50%       { d: path("M 724 168 L 762 180 L 724 185"); }
        }

        /* ── Celestial Animations ── */
        @keyframes moon-breathe {
          0%, 100% { opacity: 0.92; filter: drop-shadow(0 0 10px rgba(186, 230, 253, 0.55)); }
          50%       { opacity: 1.00; filter: drop-shadow(0 0 20px rgba(224, 242, 254, 0.85)); }
        }
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

        /* ── Modern Campus Students Walking Animations ── */
        @keyframes walk-traverse-ltr {
          0%   { transform: translateX(-880px); }
          100% { transform: translateX(880px); }
        }
        @keyframes walk-traverse-rtl {
          0%   { transform: translateX(880px); }
          100% { transform: translateX(-880px); }
        }
        @keyframes walk-bounce {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-2.2px); }
        }
        @keyframes leg-swing-fwd {
          0%, 100% { transform: rotate(18deg); }
          50%       { transform: rotate(-18deg); }
        }
        @keyframes leg-swing-bwd {
          0%, 100% { transform: rotate(-18deg); }
          50%       { transform: rotate(18deg); }
        }
        @keyframes arm-swing-fwd {
          0%, 100% { transform: rotate(-14deg); }
          50%       { transform: rotate(16deg); }
        }
        @keyframes arm-swing-bwd {
          0%, 100% { transform: rotate(16deg); }
          50%       { transform: rotate(-14deg); }
        }
        @keyframes phone-screen-glow {
          0%, 100% { opacity: 0.80; filter: drop-shadow(0 0 2px rgba(6, 182, 212, 0.7)); }
          50%       { opacity: 1.00; filter: drop-shadow(0 0 6px rgba(6, 182, 212, 1)); }
        }
        @keyframes phone-ambient-cast {
          0%, 100% { opacity: 0.30; }
          50%       { opacity: 0.75; }
        }

        .student-ltr-fast { animation: walk-traverse-ltr 22s linear infinite -4s; }
        .student-ltr-slow { animation: walk-traverse-ltr 32s linear infinite -20s; }
        .student-rtl      { animation: walk-traverse-rtl 26s linear infinite -10s; }

        .walk-bob-1 { animation: walk-bounce 0.48s ease-in-out infinite; }
        .walk-bob-2 { animation: walk-bounce 0.52s ease-in-out infinite; }
        .walk-bob-3 { animation: walk-bounce 0.44s ease-in-out infinite; }

        .char-leg-l {
          animation: leg-swing-fwd 0.88s ease-in-out infinite;
          transform-box: fill-box;
          transform-origin: 50% 0%;
        }
        .char-leg-r {
          animation: leg-swing-bwd 0.88s ease-in-out infinite;
          transform-box: fill-box;
          transform-origin: 50% 0%;
        }
        .char-arm-l {
          animation: arm-swing-bwd 0.88s ease-in-out infinite;
          transform-box: fill-box;
          transform-origin: 50% 0%;
        }
        .char-arm-r {
          animation: arm-swing-fwd 0.88s ease-in-out infinite;
          transform-box: fill-box;
          transform-origin: 50% 0%;
        }
        @keyframes arm-carry-steady {
          0%, 100% { transform: rotate(0deg); }
          50%       { transform: rotate(2deg); }
        }
        .char-arm-carry {
          animation: arm-carry-steady 0.88s ease-in-out infinite;
          transform-box: fill-box;
          transform-origin: 20% 0%;
        }
        .phone-pulse-screen { animation: phone-screen-glow 1.8s ease-in-out infinite; }
        .phone-ambient-pulse { animation: phone-ambient-cast 1.8s ease-in-out infinite; }

        .cloud-a { animation: cloud-drift-a 55s linear infinite; }
        .cloud-b { animation: cloud-drift-b 72s linear infinite 18s; }
        .cloud-c { animation: cloud-drift-c 90s linear infinite 36s; }
        .sun-halo { animation: sun-glow 4s ease-in-out infinite; }
        .moon-glow { animation: moon-breathe 4s ease-in-out infinite; }
        .star-pulse-1 { animation: star-fade-1 3.5s ease-in-out infinite; }
        .star-pulse-2 { animation: star-fade-2 4.2s ease-in-out infinite 1.1s; }
        .star-pulse-3 { animation: star-fade-3 2.9s ease-in-out infinite 1.8s; }
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
          {/* Sky Gradient: adapts to Day / Night smoothly */}
          <linearGradient id="uvSkyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="0%"
              stopColor={isNight ? "#060D20" : "#9EC8E0"}
              style={{ transition: "stop-color 1.2s ease-in-out" }}
            />
            <stop
              offset="45%"
              stopColor={isNight ? "#0D1D42" : "#BDDAED"}
              style={{ transition: "stop-color 1.2s ease-in-out" }}
            />
            <stop
              offset="100%"
              stopColor={isNight ? "#173166" : "#D9EDF6"}
              style={{ transition: "stop-color 1.2s ease-in-out" }}
            />
          </linearGradient>

          {/* Moon Gradients & Mask (Active during Night) */}
          <radialGradient id="uvMoonAura" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#E0F2FE" stopOpacity="0.45" />
            <stop offset="60%" stopColor="#BAE6FD" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#38BDF8" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="uvMoonGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="40%" stopColor="#F0F9FF" />
            <stop offset="100%" stopColor="#BAE6FD" />
          </linearGradient>
          <mask id="uvCrescentMask">
            <circle cx="1250" cy="92" r="30" fill="white" />
            <circle cx="1264" cy="80" r="26" fill="black" />
          </mask>

          {/* Ground */}
          <linearGradient id="uvGrassGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4A9E62" />
            <stop offset="100%" stopColor="#2D6B3A" />
          </linearGradient>

          {/* Building base */}
          <linearGradient id="uvBuildGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F6F4F0" />
            <stop offset="100%" stopColor="#EDEBE5" />
          </linearGradient>

          {/* Glass facade for tower */}
          <linearGradient id="uvGlassGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#CBE6F4" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#A8CEDE" stopOpacity="0.7" />
          </linearGradient>

          {/* Hostel walls */}
          <linearGradient id="uvHostelGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#F8F7F3" />
          </linearGradient>

          {/* Road */}
          <linearGradient id="uvRoadGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#BFC5CF" />
            <stop offset="100%" stopColor="#AEB6C2" />
          </linearGradient>

          {/* Soft drop shadow */}
          <filter id="uvShadow" x="-8%" y="-4%" width="120%" height="130%">
            <feDropShadow dx="3" dy="8" stdDeviation="10" floodColor="#0a1a0a" floodOpacity="0.18" />
          </filter>

          {/* Tree shadow */}
          <filter id="uvTreeShadow">
            <feDropShadow dx="2" dy="5" stdDeviation="5" floodColor="#000000" floodOpacity="0.15" />
          </filter>

          {/* Vending machine glow */}
          <filter id="uvVendGlow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>

          {/* Soft Night Cloud Filter (feathery blur so clouds look organic and smoky, zero hard edges) */}
          <filter id="uvCloudSoft" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3.5" />
          </filter>

          {/* Stitch-Engineered Character Gradients & Ambient Lighting */}
          <linearGradient id="uvBomberGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#6366F1" />
            <stop offset="60%" stopColor="#4F46E5" />
            <stop offset="100%" stopColor="#3730A3" />
          </linearGradient>
          <linearGradient id="uvAmberGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FBBF24" />
            <stop offset="55%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>
          <linearGradient id="uvEmeraldGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#34D399" />
            <stop offset="50%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
          <linearGradient id="uvDeliveryBagGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#047857" />
          </linearGradient>
          <radialGradient id="uvPhoneFaceGlow" cx="60%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.65" />
            <stop offset="50%" stopColor="#06B6D4" stopOpacity="0.30" />
            <stop offset="100%" stopColor="#06B6D4" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* ═══════════════════════════════════════════════
            LAYER 1 — SKY & CELESTIAL
        ═══════════════════════════════════════════════ */}
        <rect x="0" y="0" width="1440" height="800" fill="url(#uvSkyGrad)" />

        {/* ── Day Mode: Radiant Sun ── */}
        {!isNight && (
          <>
            <circle className="sun-halo" cx="1330" cy="88" r="72" fill="#FDE68A" opacity="0.14" />
            <circle cx="1330" cy="88" r="52" fill="#FEF3C7" opacity="0.25" />
            <circle cx="1330" cy="88" r="36" fill="#FDE68A" opacity="0.55" />
            <circle cx="1330" cy="88" r="24" fill="#FCD34D" />
          </>
        )}

        {/* ── Night Mode: Glowing Crescent Moon ── */}
        {isNight && (
          <>
            {/* Outer Lunar Aura */}
            <circle cx="1250" cy="92" r="85" fill="url(#uvMoonAura)" className="moon-glow" />
            <circle cx="1250" cy="92" r="50" fill="url(#uvMoonAura)" />
            {/* Radiant Crescent Moon */}
            <circle
              cx="1250"
              cy="92"
              r="30"
              fill="url(#uvMoonGrad)"
              mask="url(#uvCrescentMask)"
              className="moon-glow"
            />

            {/* ── Fixed Twinkling Stars (Pure Opacity Breathing — 100% Stable Position) ── */}
            {/* Delicate 4-Point Sparkle Diamonds */}
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
          </>
        )}

        {/* ── Clouds (Visible in Both Day & Night — group-level opacity eliminates all internal seams/dots) ── */}
        <g
          className="cloud-a"
          opacity={isNight ? 0.22 : 0.88}
          filter={isNight ? "url(#uvCloudSoft)" : undefined}
          style={{ transition: "opacity 1.2s ease" }}
        >
          <ellipse cx="160" cy="95" rx="90" ry="32" fill={isNight ? "#E0F2FE" : "white"} />
          <ellipse cx="230" cy="82" rx="65" ry="26" fill={isNight ? "#E0F2FE" : "white"} />
          <ellipse cx="90" cy="102" rx="60" ry="24" fill={isNight ? "#E0F2FE" : "white"} />
          <ellipse cx="190" cy="75" rx="45" ry="20" fill={isNight ? "#E0F2FE" : "white"} />
        </g>
        <g
          className="cloud-b"
          opacity={isNight ? 0.18 : 0.72}
          filter={isNight ? "url(#uvCloudSoft)" : undefined}
          style={{ transition: "opacity 1.2s ease" }}
        >
          <ellipse cx="560" cy="68" rx="110" ry="38" fill={isNight ? "#E0F2FE" : "white"} />
          <ellipse cx="648" cy="55" rx="78" ry="30" fill={isNight ? "#E0F2FE" : "white"} />
          <ellipse cx="472" cy="74" rx="72" ry="29" fill={isNight ? "#E0F2FE" : "white"} />
          <ellipse cx="600" cy="48" rx="52" ry="22" fill={isNight ? "#E0F2FE" : "white"} />
        </g>
        <g
          className="cloud-c"
          opacity={isNight ? 0.16 : 0.65}
          filter={isNight ? "url(#uvCloudSoft)" : undefined}
          style={{ transition: "opacity 1.2s ease" }}
        >
          <ellipse cx="900" cy="115" rx="80" ry="30" fill={isNight ? "#E0F2FE" : "white"} />
          <ellipse cx="970" cy="103" rx="58" ry="23" fill={isNight ? "#E0F2FE" : "white"} />
          <ellipse cx="828" cy="120" rx="55" ry="22" fill={isNight ? "#E0F2FE" : "white"} />
        </g>

        {/* ═══════════════════════════════════════════════
            LAYER 2 — DISTANT TREE LINE / HILLS
        ═══════════════════════════════════════════════ */}
        <ellipse cx="200" cy="400" rx="280" ry="90" fill="#6BAF7C" opacity="0.22" />
        <ellipse cx="750" cy="418" rx="360" ry="80" fill="#5A9E6A" opacity="0.18" />
        <ellipse cx="1280" cy="405" rx="260" ry="85" fill="#6BAF7C" opacity="0.20" />

        {/* ═══════════════════════════════════════════════
            LAYER 3 — MAIN ACADEMIC BLOCK
        ═══════════════════════════════════════════════ */}

        {/* Building shadow */}
        <rect x="528" y="265" width="408" height="365" fill="#1a2a1a" opacity="0.10" rx="2" />

        {/* Main structure */}
        <rect x="520" y="240" width="400" height="360" fill="url(#uvBuildGrad)" filter="url(#uvShadow)" rx="2" />

        {/* Green roof band */}
        <rect x="520" y="240" width="400" height="14" fill="#10B981" opacity="0.92" rx="2" />
        <rect x="520" y="254" width="400" height="4" fill="#059669" opacity="0.5" />

        {/* Structural columns */}
        {[538, 580, 622, 664, 760, 802, 844, 886].map((x, i) => (
          <rect key={i} x={x} y="258" width="16" height="342" fill="#E8E4DC" opacity="0.55" rx="1" />
        ))}

        {/* Windows — main block */}
        {[0, 1, 2, 3, 4].map(row =>
          [0, 1, 2, 3, 4, 5, 6].map(col => (
            <rect
              key={`mw${row}-${col}`}
              x={538 + col * 52}
              y={272 + row * 56}
              width="34" height="38"
              fill="#A8C8E0" opacity="0.68" rx="2"
            />
          ))
        )}

        {/* Campus name badge */}
        <rect x="610" y="462" width="220" height="32" fill="#10B981" rx="6" />
        <text x="720" y="482" textAnchor="middle" fill="white" fontSize="13" fontFamily="sans-serif" fontWeight="700" letterSpacing="0.5">MARWADI UNIVERSITY</text>

        {/* Main entrance */}
        <rect x="690" y="556" width="80" height="44" fill="#C8A97A" rx="3" />
        <rect x="690" y="556" width="80" height="6" fill="#B8935A" />
        <rect x="718" y="566" width="11" height="28" fill="#A0804C" rx="1.5" />
        <rect x="751" y="566" width="11" height="28" fill="#A0804C" rx="1.5" />

        {/* Entrance canopy */}
        <rect x="672" y="544" width="116" height="14" fill="#059669" rx="2" opacity="0.9" />

        {/* ═══════════════════════════════════════════════
            LAYER 3B — ACADEMIC BLOCK FLAGPOLE
        ═══════════════════════════════════════════════ */}
        {/* Central Flagpole & University Pennant */}
        <rect x="719" y="210" width="2.5" height="30" fill="#94A3B8" rx="1" />
        <circle cx="720.25" cy="209" r="2.5" fill="#F59E0B" />
        <path d="M 721.5 210 L 748 217 L 721.5 224 Z" fill="#10B981" />

        {/* ═══════════════════════════════════════════════
            LAYER 4 — HOSTEL BUILDINGS
        ═══════════════════════════════════════════════ */}

        {/* ── Hostel A (far left, amber accent) ── */}
        <g filter="url(#uvShadow)">
          <rect x="22" y="282" width="196" height="268" fill="url(#uvHostelGrad)" rx="2" />
          <rect x="22" y="282" width="196" height="12" fill="#F59E0B" />
          <rect x="22" y="294" width="196" height="3" fill="#D97706" opacity="0.5" />

          {/* Floor dividers */}
          {[0, 1, 2, 3].map(f => <rect key={f} x="22" y={297 + f * 62} width="196" height="1" fill="#E5E7EB" />)}

          {/* Windows */}
          {[0, 1, 2, 3].map(row =>
            [0, 1, 2].map(col => (
              <rect key={`aw${row}-${col}`}
                x={38 + col * 58} y={303 + row * 62}
                width="38" height="42" fill="#A8C8E0" opacity="0.65" rx="2"
              />
            ))
          )}

          {/* Label badge */}
          <rect x="70" y="524" width="100" height="26" fill="#F59E0B" rx="13" />
          <text x="120" y="541" textAnchor="middle" fill="white" fontSize="12" fontFamily="sans-serif" fontWeight="700" letterSpacing="0.5">HOSTEL A</text>

          {/* Door */}
          <rect x="98" y="508" width="44" height="42" fill="#C09050" rx="2" />
          <rect x="98" y="508" width="44" height="6" fill="#A07030" />
          <rect x="118" y="518" width="5" height="22" fill="#8B6040" rx="1" />
        </g>

        {/* ── Hostel B (center-left, emerald accent) ── */}
        <g filter="url(#uvShadow)">
          <rect x="262" y="298" width="182" height="252" fill="url(#uvHostelGrad)" rx="2" />
          <rect x="262" y="298" width="182" height="12" fill="#10B981" />
          <rect x="262" y="310" width="182" height="3" fill="#059669" opacity="0.5" />

          {[0, 1, 2, 3].map(f => <rect key={f} x="262" y={313 + f * 59} width="182" height="1" fill="#E5E7EB" />)}

          {[0, 1, 2, 3].map(row =>
            [0, 1, 2].map(col => (
              <rect key={`bw${row}-${col}`}
                x={276 + col * 54} y={320 + row * 59}
                width="36" height="40" fill="#A8C8E0" opacity="0.65" rx="2"
              />
            ))
          )}

          <rect x="306" y="525" width="100" height="26" fill="#10B981" rx="13" />
          <text x="356" y="542" textAnchor="middle" fill="white" fontSize="12" fontFamily="sans-serif" fontWeight="700" letterSpacing="0.5">HOSTEL B</text>

          <rect x="330" y="508" width="44" height="42" fill="#C09050" rx="2" />
          <rect x="330" y="508" width="44" height="6" fill="#A07030" />
          <rect x="350" y="518" width="5" height="22" fill="#8B6040" rx="1" />
        </g>

        {/* ── Hostel C (center-right, emerald accent) ── */}
        <g filter="url(#uvShadow)">
          <rect x="1000" y="298" width="182" height="252" fill="url(#uvHostelGrad)" rx="2" />
          <rect x="1000" y="298" width="182" height="12" fill="#10B981" />
          <rect x="1000" y="310" width="182" height="3" fill="#059669" opacity="0.5" />

          {[0, 1, 2, 3].map(f => <rect key={f} x="1000" y={313 + f * 59} width="182" height="1" fill="#E5E7EB" />)}

          {[0, 1, 2, 3].map(row =>
            [0, 1, 2].map(col => (
              <rect key={`cw${row}-${col}`}
                x={1014 + col * 54} y={320 + row * 59}
                width="36" height="40" fill="#A8C8E0" opacity="0.65" rx="2"
              />
            ))
          )}

          <rect x="1042" y="525" width="100" height="26" fill="#10B981" rx="13" />
          <text x="1092" y="542" textAnchor="middle" fill="white" fontSize="12" fontFamily="sans-serif" fontWeight="700" letterSpacing="0.5">HOSTEL C</text>

          <rect x="1066" y="508" width="44" height="42" fill="#C09050" rx="2" />
          <rect x="1066" y="508" width="44" height="6" fill="#A07030" />
          <rect x="1086" y="518" width="5" height="22" fill="#8B6040" rx="1" />
        </g>

        {/* ── Hostel D (far right, amber accent) ── */}
        <g filter="url(#uvShadow)">
          <rect x="1226" y="282" width="196" height="268" fill="url(#uvHostelGrad)" rx="2" />
          <rect x="1226" y="282" width="196" height="12" fill="#F59E0B" />
          <rect x="1226" y="294" width="196" height="3" fill="#D97706" opacity="0.5" />

          {[0, 1, 2, 3].map(f => <rect key={f} x="1226" y={297 + f * 62} width="196" height="1" fill="#E5E7EB" />)}

          {[0, 1, 2, 3].map(row =>
            [0, 1, 2].map(col => (
              <rect key={`dw${row}-${col}`}
                x={1242 + col * 58} y={303 + row * 62}
                width="38" height="42" fill="#A8C8E0" opacity="0.65" rx="2"
              />
            ))
          )}

          <rect x="1274" y="524" width="100" height="26" fill="#F59E0B" rx="13" />
          <text x="1324" y="541" textAnchor="middle" fill="white" fontSize="12" fontFamily="sans-serif" fontWeight="700" letterSpacing="0.5">HOSTEL D</text>

          <rect x="1302" y="508" width="44" height="42" fill="#C09050" rx="2" />
          <rect x="1302" y="508" width="44" height="6" fill="#A07030" />
          <rect x="1322" y="518" width="5" height="22" fill="#8B6040" rx="1" />
        </g>

        {/* ═══════════════════════════════════════════════
            LAYER 5 — ROADS & PATHS
        ═══════════════════════════════════════════════ */}

        {/* Main horizontal road */}
        <rect x="0" y="592" width="1440" height="44" fill="url(#uvRoadGrad)" />
        <rect x="0" y="592" width="1440" height="2" fill="#CDD2DC" opacity="0.6" />

        {/* Road lane dashes */}
        {Array.from({ length: 14 }).map((_, i) => (
          <rect key={i} x={40 + i * 106} y="611" width="56" height="5" fill="white" opacity="0.45" rx="2" />
        ))}

        {/* Vertical paths from each hostel to main road */}
        <rect x="107" y="553" width="28" height="44" fill="#C4CAD6" opacity="0.7" />
        <rect x="341" y="553" width="28" height="44" fill="#C4CAD6" opacity="0.7" />
        <rect x="1075" y="553" width="28" height="44" fill="#C4CAD6" opacity="0.7" />
        <rect x="1309" y="553" width="28" height="44" fill="#C4CAD6" opacity="0.7" />

        {/* Curved campus path (left side) */}
        <path d="M 520 590 Q 420 575 360 592" stroke="#C4CAD6" strokeWidth="18" fill="none" opacity="0.65" strokeLinecap="round" />
        {/* Curved campus path (right side) */}
        <path d="M 920 590 Q 1020 575 1082 592" stroke="#C4CAD6" strokeWidth="18" fill="none" opacity="0.65" strokeLinecap="round" />

        {/* ═══════════════════════════════════════════════
            LAYER 6 — VENDING MACHINES
        ═══════════════════════════════════════════════ */}

        {/* Helper macro — vending machine shape */}
        {[
          { x: 224, accent: "#10B981" },   // near Hostel A
          { x: 450, accent: "#F59E0B" },   // near Hostel B
          { x: 994, accent: "#10B981" },  // near Hostel C
          { x: 1216, accent: "#F59E0B" },  // near Hostel D
        ].map(({ x, accent }, i) => (
          <g key={i} filter="url(#uvVendGlow)">
            {/* Body */}
            <rect x={x} y="507" width="36" height="56" fill="#EBEBEB" rx="4" stroke="#CECECE" strokeWidth="1" />
            {/* Top display strip */}
            <rect x={x + 3} y="510" width="30" height="18" fill={accent} opacity="0.85" rx="2" />
            {/* UV logo on display */}
            <text x={x + 18} y="523" textAnchor="middle" fill="white" fontSize="9" fontFamily="sans-serif" fontWeight="800">UV</text>
            {/* Product grid */}
            <rect x={x + 4} y="532" width="12" height="11" fill={accent} opacity="0.55" rx="1" />
            <rect x={x + 20} y="532" width="12" height="11" fill="#F59E0B" opacity="0.55" rx="1" />
            <rect x={x + 4} y="546" width="12" height="11" fill="#F59E0B" opacity="0.45" rx="1" />
            <rect x={x + 20} y="546" width="12" height="11" fill={accent} opacity="0.45" rx="1" />
            {/* Coin slot */}
            <rect x={x + 10} y="560" width="16" height="3" fill="#AAAAAA" rx="1.5" />
            {/* Output tray */}
            <rect x={x + 4} y="558" width="28" height="4" fill="#D0D0D0" rx="1" />
          </g>
        ))}

        {/* ═══════════════════════════════════════════════
            LAYER 7 — TREES
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
            {/* Trunk */}
            <rect x={t.x - 4} y={t.base - t.tH} width="8" height={t.tH} fill="#7B5A3A" rx="2" />
            {/* Crown layers */}
            <circle cx={t.x - 12} cy={t.base - t.tH - t.cR * 0.5} r={t.cR * 0.65} fill={t.c2} />
            <circle cx={t.x + 12} cy={t.base - t.tH - t.cR * 0.5} r={t.cR * 0.65} fill={t.c2} />
            <circle cx={t.x} cy={t.base - t.tH - t.cR * 0.8} r={t.cR} fill={t.c1} />
          </g>
        ))}

        {/* ═══════════════════════════════════════════════
            LAYER 8 — GROUND
        ═══════════════════════════════════════════════ */}
        <rect x="0" y="636" width="1440" height="164" fill="url(#uvGrassGrad)" />
        {/* Grass edge highlight */}
        <rect x="0" y="635" width="1440" height="3" fill="#5DB86E" opacity="0.5" />
        {/* Footpath near road */}
        <rect x="0" y="636" width="1440" height="8" fill="#D4D8DF" opacity="0.35" />

        {/* ═══════════════════════════════════════════════
            LAYER 9 — STUDENTS (Campus Life with Expressive Faces & Detailed Hands)
        ═══════════════════════════════════════════════ */}

        {/* ── Student 3: UniVerse Campus Courier Runner — Upper Lane (y=604, Left ➔ Right) ── */}
        <g className="student-ltr-fast">
          <g className="walk-bob-3">
            {/* Dynamic Ground Shadow */}
            <ellipse cx="720" cy="604" rx="18" ry="4" fill="#000" opacity="0.20" />

            {/* Back Leg (Right) with white-sole sneaker */}
            <g className="char-leg-r">
              <rect x="721" y="576" width="6" height="23" rx="3" fill="#1E293B" />
              <rect x="721" y="596" width="6" height="2" rx="1" fill="#334155" />
              <rect x="720" y="597" width="12" height="6" rx="2" fill="#0F172A" />
              <rect x="719" y="601" width="14" height="2.5" rx="1" fill="#FFFFFF" />
              <rect x="722" y="599" width="4" height="1.2" rx="0.4" fill="#38BDF8" />
            </g>

            {/* Back Arm (Left) swinging naturally */}
            <g className="char-arm-l">
              <rect x="710" y="552" width="5.5" height="18" rx="2.7" fill="#4338CA" />
              <rect x="710" y="558" width="5.5" height="2" fill="#FFFFFF" opacity="0.8" />
              <rect x="710" y="567" width="5.5" height="2.5" rx="1" fill="#312E81" />
              <circle cx="712.7" cy="571.5" r="2.8" fill="#E2A676" />
              <rect x="712" y="571.5" width="2" height="3.5" rx="1" fill="#C08354" />
            </g>

            {/* Front Leg (Left) with white-sole sneaker */}
            <g className="char-leg-l">
              <rect x="714" y="576" width="6" height="23" rx="3" fill="#334155" />
              <rect x="714" y="596" width="6" height="2" rx="1" fill="#475569" />
              <rect x="713" y="597" width="12" height="6" rx="2" fill="#1E293B" />
              <rect x="712" y="601" width="14" height="2.5" rx="1" fill="#FFFFFF" />
              <rect x="715" y="599" width="4" height="1.2" rx="0.4" fill="#38BDF8" />
            </g>

            {/* Torso — Varsity Bomber Jacket */}
            <rect x="709" y="549" width="22" height="28" rx="6" fill="#6366F1" />
            <rect x="719" y="549" width="1.5" height="28" fill="#4338CA" />
            <polygon points="716,549 724,549 720,555" fill="#FFFFFF" />
            <rect x="710" y="574" width="20" height="3" rx="1.5" fill="#312E81" />
            <circle cx="714" cy="556" r="2" fill="#10B981" />

            {/* Neck */}
            <rect x="718" y="544" width="4.5" height="6" fill="#C08354" rx="1.5" />

            {/* Head Base */}
            <ellipse cx="720" cy="537" rx="8" ry="9.5" fill="#E2A676" />
            <path d="M 714 538 Q 721 547 726 542" fill="#E2A676" />

            {/* Backwards Snapback University Cap */}
            <path d="M 713 538 Q 713 527 721 527 Q 729 527 728 535 Q 724 534 717 534 Z" fill="#312E81" />
            <path d="M 713 535 Q 708 536 706 539 Q 710 538 714 537 Z" fill="#1E1B4B" />
            <path d="M 712 534 A 2.5 2.5 0 0 1 715 534" fill="none" stroke="#D49B6A" strokeWidth="1" />
            {/* Hair Fade at Temples & Fringe */}
            <path d="M 717 534 L 719 541 L 716 541 Z" fill="#0F172A" />
            <path d="M 726 534 Q 728 535 727 538 Q 725 536 724 535 Z" fill="#0F172A" />

            {/* Ear */}
            <ellipse cx="714.5" cy="537.5" rx="2.2" ry="3.2" fill="#E2A676" />
            <path d="M 715 536.5 Q 714 537.5 715 539" stroke="#C08354" strokeWidth="0.8" fill="none" strokeLinecap="round" />

            {/* Eyebrow & Expressive Eye */}
            <path d="M 721 532.5 Q 723.5 531.5 726 533" stroke="#0F172A" strokeWidth="1.2" fill="none" strokeLinecap="round" />
            <ellipse cx="724.5" cy="536" rx="2" ry="1.5" fill="#FFFFFF" />
            <circle cx="725.2" cy="536" r="1.1" fill="#0F172A" />
            <circle cx="725.5" cy="535.6" r="0.4" fill="#FFFFFF" />
            <path d="M 722.5 535.2 Q 724.5 534.5 726.5 535.5" stroke="#0F172A" strokeWidth="0.7" fill="none" />

            {/* Nose */}
            <path d="M 726 536 L 728.2 539 L 726.2 539.6" stroke="#C08354" strokeWidth="1" fill="#E2A676" strokeLinejoin="round" strokeLinecap="round" />

            {/* Smiling Mouth */}
            <path d="M 723 542.5 Q 725.5 544 727.5 542" stroke="#9A3412" strokeWidth="1" fill="none" strokeLinecap="round" />

            {/* Cross-body Bag Strap */}
            <path d="M 713 551 L 726 567" stroke="#047857" strokeWidth="3" strokeLinecap="round" />

            {/* Front Arm & Hand gripping bag strap */}
            <g className="char-arm-carry">
              <rect x="723" y="551" width="5.5" height="9" rx="2.5" fill="#4F46E5" />
              <rect x="723" y="556" width="5.5" height="2" fill="#FFFFFF" opacity="0.8" />
              <polygon points="723,558 728.5,558 727,566 722,565" fill="#6366F1" />
              <rect x="721" y="563" width="5.5" height="2.5" rx="1" fill="#312E81" />
              {/* Hand Palm */}
              <circle cx="725" cy="567" r="3" fill="#E2A676" />
              {/* Thumb */}
              <path d="M 723 565 Q 725 564 726 566" stroke="#C08354" strokeWidth="1.2" fill="none" strokeLinecap="round" />
              {/* Distinct Fingers wrapped on strap */}
              <rect x="724" y="566" width="3.2" height="1.8" rx="0.8" fill="#E2A676" stroke="#C08354" strokeWidth="0.4" />
              <rect x="723.8" y="568" width="3.2" height="1.8" rx="0.8" fill="#E2A676" stroke="#C08354" strokeWidth="0.4" />
              <rect x="723.5" y="570" width="3" height="1.7" rx="0.8" fill="#E2A676" stroke="#C08354" strokeWidth="0.4" />
              <rect x="723.2" y="571.8" width="2.8" height="1.6" rx="0.7" fill="#C08354" stroke="#C08354" strokeWidth="0.4" />
              {/* UniVerse Green Delivery Bag */}
              <rect x="722" y="567" width="20" height="22" rx="4" fill="#10B981" stroke="#059669" strokeWidth="1" />
              <path d="M 722 567 L 742 567 L 742 575 L 722 575 Z" fill="#059669" />
              <rect x="730.5" y="573.5" width="3" height="3" rx="0.5" fill="#F59E0B" />
              <text x="732" y="582" textAnchor="middle" fill="white" fontSize="7.5" fontFamily="system-ui, sans-serif" fontWeight="900" letterSpacing="0.5">UV</text>
              <rect x="725" y="584" width="14" height="1.5" rx="0.7" fill="#FFFFFF" opacity="0.85" />
            </g>
          </g>
        </g>

        {/* ── Student 2: Campus Stroller (Amber Sweater, Headphones, Holding Drink) — Middle Lane (y=614, Left ➔ Right) ── */}
        <g className="student-ltr-slow">
          <g className="walk-bob-2">
            {/* Dynamic Ground Shadow */}
            <ellipse cx="720" cy="614" rx="18" ry="4" fill="#000" opacity="0.22" />

            {/* Back Leg (Right) with white-sole sneaker */}
            <g className="char-leg-r">
              <rect x="721" y="586" width="6" height="23" rx="3" fill="#1E3A5F" />
              <rect x="721" y="606" width="6" height="2" rx="1" fill="#2563EB" opacity="0.4" />
              <rect x="720" y="607" width="12" height="6" rx="2" fill="#0F172A" />
              <rect x="719" y="611" width="14" height="2.5" rx="1" fill="#FFFFFF" />
              <rect x="722" y="609" width="4" height="1.2" rx="0.4" fill="#F59E0B" />
            </g>

            {/* Back Arm swinging naturally */}
            <g className="char-arm-l">
              <rect x="710" y="562" width="5.5" height="18" rx="2.7" fill="#D97706" />
              <rect x="710" y="577" width="5.5" height="2.5" rx="1" fill="#B45309" />
              <circle cx="712.7" cy="581.5" r="2.8" fill="#C8956C" />
              <rect x="712" y="581.5" width="2" height="3.5" rx="1" fill="#A8704A" />
            </g>

            {/* Front Leg (Left) with white-sole sneaker */}
            <g className="char-leg-l">
              <rect x="714" y="586" width="6" height="23" rx="3" fill="#2563EB" />
              <rect x="714" y="606" width="6" height="2" rx="1" fill="#3B82F6" opacity="0.4" />
              <rect x="713" y="607" width="12" height="6" rx="2" fill="#1E293B" />
              <rect x="712" y="611" width="14" height="2.5" rx="1" fill="#FFFFFF" />
              <rect x="715" y="609" width="4" height="1.2" rx="0.4" fill="#F59E0B" />
            </g>

            {/* Torso — Amber Sweater with ribbed cuffs & athletic stripe */}
            <rect x="709" y="559" width="22" height="28" rx="6" fill="#F59E0B" />
            <path d="M 716 559 Q 720 562 724 559" stroke="#D97706" strokeWidth="1.8" fill="none" strokeLinecap="round" />
            <polygon points="718,559 722,559 720,562" fill="#FFFFFF" />
            <rect x="709" y="568" width="22" height="3" fill="#FFFFFF" opacity="0.85" />
            <rect x="710" y="584" width="20" height="3" rx="1.5" fill="#D97706" />

            {/* Neck */}
            <rect x="718" y="554" width="4.5" height="6" fill="#A8704A" rx="1.5" />

            {/* Head Base */}
            <ellipse cx="720" cy="547" rx="8" ry="9.5" fill="#C8956C" />
            <path d="M 714 548 Q 721 557 726 552" fill="#C8956C" />

            {/* Voluminous Wavy Hair */}
            <path d="M 712 548 Q 711 535 721 535 Q 730 535 729 544 Q 727 541 721 541 Q 716 541 713 548 Z" fill="#2C1810" />
            <path d="M 717 539 Q 722 537 727 542 Q 725 544 722 543 Q 719 543 717 539 Z" fill="#3D2314" />

            {/* Sleek Over-Ear Headphones */}
            <path d="M 713 547 Q 720 532 727 547" fill="none" stroke="#E2E8F0" strokeWidth="2.2" strokeLinecap="round" />
            <rect x="712" y="544" width="3" height="7" rx="1.5" fill="#0F172A" />
            <rect x="711" y="545" width="2" height="5" rx="1" fill="#38BDF8" />

            {/* Ear Lobe */}
            <ellipse cx="714" cy="549.5" rx="1.8" ry="2.2" fill="#C8956C" />

            {/* Eyebrow & Expressive Eye */}
            <path d="M 721 542.5 Q 723.5 541.5 726 543" stroke="#2C1810" strokeWidth="1.2" fill="none" strokeLinecap="round" />
            <ellipse cx="724.5" cy="546" rx="2" ry="1.5" fill="#FFFFFF" />
            <circle cx="725" cy="546" r="1.1" fill="#3D2314" />
            <circle cx="725.4" cy="545.6" r="0.4" fill="#FFFFFF" />
            <path d="M 722.5 545.2 Q 724.5 544.5 726.5 545.5" stroke="#2C1810" strokeWidth="0.7" fill="none" />

            {/* Nose */}
            <path d="M 726 546 L 728.2 549 L 726.2 549.6" stroke="#A8704A" strokeWidth="1" fill="#C8956C" strokeLinejoin="round" strokeLinecap="round" />

            {/* Cheerful Friendly Smile */}
            <path d="M 723 552.5 Q 725.5 554 727.5 552" stroke="#9A3412" strokeWidth="1" fill="none" strokeLinecap="round" />

            {/* Front Arm & Hand holding Iced Coffee Drink Tumbler */}
            <g className="char-arm-carry">
              <rect x="723" y="561" width="5.5" height="9" rx="2.5" fill="#D97706" />
              <polygon points="723,568 728.5,568 732,574 726.5,576" fill="#F59E0B" />
              <rect x="728" y="572" width="4" height="4.5" rx="1.5" fill="#D97706" transform="rotate(25 730 574)" />
              {/* Hand Palm */}
              <circle cx="732" cy="576" r="3" fill="#C8956C" />
              {/* Thumb */}
              <path d="M 732 574 Q 734 573 735 575 Q 734 576.5 732 576" fill="#A8704A" />
              {/* 4 Distinct Fingers wrapping cup */}
              <rect x="733.5" y="573.5" width="2.8" height="2" rx="0.9" fill="#C8956C" stroke="#A8704A" strokeWidth="0.4" />
              <rect x="733.5" y="576" width="2.8" height="2" rx="0.9" fill="#C8956C" stroke="#A8704A" strokeWidth="0.4" />
              <rect x="733.2" y="578.5" width="2.6" height="1.9" rx="0.9" fill="#C8956C" stroke="#A8704A" strokeWidth="0.4" />
              <rect x="732.8" y="580.7" width="2.4" height="1.8" rx="0.8" fill="#A8704A" stroke="#A8704A" strokeWidth="0.4" />
              {/* Clear Iced Tumbler */}
              <polygon points="734,569 741,569 739.5,582 735.5,582" fill="#F8FAFC" opacity="0.85" stroke="#CBD5E1" strokeWidth="0.6" />
              <polygon points="734.5,573 740.5,573 739.2,581.5 735.8,581.5" fill="#10B981" opacity="0.75" />
              <rect x="736" y="574" width="2.5" height="2" fill="#FFFFFF" opacity="0.7" rx="0.5" />
              <polygon points="735,575 740,575 739.5,578.5 735.5,578.5" fill="#D97706" opacity="0.8" />
              <path d="M 733.5 569 Q 737.5 566.5 741.5 569 Z" fill="#E2E8F0" stroke="#CBD5E1" strokeWidth="0.5" />
              <line x1="738.5" y1="563" x2="737.5" y2="569" stroke="#059669" strokeWidth="1.3" strokeLinecap="round" />
            </g>
          </g>
        </g>

        {/* ── Student 1: Tech Requester (Emerald Hoodie, Holding Phone Naturally with Clear Hand) — Front Lane (y=626, Walking Right ➔ Left) ── */}
        <g className="student-rtl">
          <g transform="translate(1440, 0) scale(-1, 1)">
            <g className="walk-bob-1">
              {/* Dynamic Ground Shadow */}
              <ellipse cx="720" cy="626" rx="18" ry="4" fill="#000" opacity="0.25" />

              {/* Back Leg (Right) with white-sole sneaker */}
              <g className="char-leg-r">
                <rect x="721" y="598" width="6" height="23" rx="3" fill="#1E293B" />
                <rect x="721" y="618" width="6" height="2" rx="1" fill="#334155" />
                <rect x="720" y="619" width="12" height="6" rx="2" fill="#0F172A" />
                <rect x="719" y="623" width="14" height="2.5" rx="1" fill="#FFFFFF" />
                <rect x="722" y="621" width="3" height="1.5" rx="0.5" fill="#10B981" />
              </g>

              {/* Back Arm swinging naturally */}
              <g className="char-arm-l">
                <rect x="710" y="574" width="5.5" height="18" rx="2.7" fill="#047857" />
                <rect x="710" y="589" width="5.5" height="2.5" rx="1" fill="#065F46" />
                <circle cx="712.7" cy="593.5" r="2.8" fill="#D4A070" />
                <rect x="712" y="593.5" width="2" height="3.5" rx="1" fill="#C08B5C" />
              </g>

              {/* Front Leg (Left) with white-sole sneaker */}
              <g className="char-leg-l">
                <rect x="714" y="598" width="6" height="23" rx="3" fill="#334155" />
                <rect x="714" y="618" width="6" height="2" rx="1" fill="#475569" />
                <rect x="713" y="619" width="12" height="6" rx="2" fill="#1E293B" />
                <rect x="712" y="623" width="14" height="2.5" rx="1" fill="#FFFFFF" />
                <rect x="715" y="621" width="3" height="1.5" rx="0.5" fill="#10B981" />
              </g>

              {/* Torso — Emerald Green Campus Hoodie with kangaroo pocket */}
              <rect x="709" y="571" width="22" height="28" rx="6" fill="#10B981" />
              <rect x="710" y="596" width="20" height="3" rx="1.5" fill="#059669" />
              <path d="M 714 588 L 728 588 L 726 595 L 716 595 Z" fill="#059669" opacity="0.7" />
              {/* Hoodie drawstrings */}
              <path d="M 718 574 Q 717 580 718 585" stroke="#FFFFFF" strokeWidth="1" fill="none" strokeLinecap="round" />
              <path d="M 721 574 Q 722 579 720 584" stroke="#FFFFFF" strokeWidth="1" fill="none" strokeLinecap="round" />
              <circle cx="718" cy="585" r="0.8" fill="#D1D5DB" />
              <circle cx="720" cy="584" r="0.8" fill="#D1D5DB" />
              {/* Backpack strap */}
              <path d="M 714 572 L 717 596" stroke="#047857" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />

              {/* Neck */}
              <rect x="718" y="566" width="4.5" height="6" fill="#B77950" rx="1.5" />

              {/* Head Base */}
              <ellipse cx="720" cy="559" rx="8" ry="9.5" fill="#D4A070" />
              <path d="M 714 560 Q 721 569 726 564" fill="#D4A070" />

              {/* Modern Textured Taper Fade Haircut */}
              <path d="M 712 559 Q 712 548 721 548 Q 729 548 728 556 Q 726 553 721 553 Q 716 553 714 559 Z" fill="#18181B" />
              <path d="M 713 553 Q 716 546 722 547 Q 727 547 729 552 Q 727 550 722 550 Q 717 550 713 553 Z" fill="#27272A" />
              <path d="M 717 557 L 718 563 L 716 563 Z" fill="#18181B" />

              {/* Ear */}
              <ellipse cx="714.5" cy="559.5" rx="2.2" ry="3.2" fill="#D4A070" />
              <path d="M 715 558.5 Q 714 559.5 715 561" stroke="#B77950" strokeWidth="0.8" fill="none" strokeLinecap="round" />

              {/* Eyebrow & Expressive Eye looking at phone */}
              <path d="M 721 554 Q 724 553.5 726.5 555" stroke="#18181B" strokeWidth="1.2" fill="none" strokeLinecap="round" />
              <ellipse cx="724.5" cy="558" rx="2" ry="1.5" fill="#FFFFFF" />
              <circle cx="725.2" cy="558.5" r="1.1" fill="#1E293B" />
              <circle cx="725.6" cy="558.2" r="0.4" fill="#FFFFFF" />
              <path d="M 722.5 557.2 Q 724.5 556.5 726.5 557.5" stroke="#18181B" strokeWidth="0.7" fill="none" />

              {/* Nose */}
              <path d="M 726 558 L 728.2 561.2 L 726.2 561.8" stroke="#B77950" strokeWidth="1" fill="#D4A070" strokeLinejoin="round" strokeLinecap="round" />

              {/* Focused Gentle Smile */}
              <path d="M 723.5 564.5 Q 725.5 565.5 727 564" stroke="#9A3412" strokeWidth="0.9" fill="none" strokeLinecap="round" />

              {/* Subtle Cyan Screen Reflection on Face */}
              <ellipse cx="725" cy="563" rx="4" ry="4" fill="url(#uvPhoneFaceGlow)" className="phone-ambient-pulse" opacity="0.6" />

              {/* Front Arm & Connected Hand holding smartphone naturally */}
              <g className="char-arm-carry">
                {/* Upper arm from shoulder */}
                <rect x="723" y="573" width="5.5" height="9" rx="2.5" fill="#047857" />
                {/* Forearm angled forward */}
                <polygon points="723,580 728.5,580 732,586 726.5,588" fill="#059669" />
                {/* Sleeve cuff */}
                <rect x="728" y="584" width="4" height="4.5" rx="1.5" fill="#065F46" transform="rotate(25 730 586)" />
                {/* Connected Hand Palm */}
                <circle cx="732" cy="588" r="3" fill="#D4A070" />
                {/* Thumb resting on front edge of phone */}
                <path d="M 732 586 Q 734 585 735 587 Q 734 588.5 732 588" fill="#C08B5C" />
                {/* 4 Distinct Fingers firmly wrapping around phone edge */}
                <rect x="733.5" y="585" width="2.8" height="2" rx="0.9" fill="#D4A070" stroke="#B77950" strokeWidth="0.4" />
                <rect x="733.5" y="587.5" width="2.8" height="2" rx="0.9" fill="#D4A070" stroke="#B77950" strokeWidth="0.4" />
                <rect x="733.2" y="590" width="2.6" height="1.9" rx="0.9" fill="#D4A070" stroke="#B77950" strokeWidth="0.4" />
                <rect x="732.8" y="592.2" width="2.4" height="1.8" rx="0.8" fill="#C08B5C" stroke="#B77950" strokeWidth="0.4" />
                {/* Smartphone firmly in hand */}
                <rect x="734" y="580" width="8" height="15" rx="2" fill="#0F172A" stroke="#475569" strokeWidth="0.6" />
                {/* Glowing OLED phone screen with app cards */}
                <rect x="735" y="581.5" width="6" height="12" rx="1" fill="#0284C7" className="phone-pulse-screen" />
                <rect x="735.8" y="582.5" width="4.4" height="1.5" rx="0.5" fill="#38BDF8" />
                <rect x="735.8" y="585" width="4.4" height="3" rx="0.5" fill="#E0F2FE" opacity="0.9" />
                <rect x="735.8" y="589" width="3" height="1.2" rx="0.4" fill="#10B981" />
              </g>
            </g>
          </g>
        </g>

        {/* ═══════════════════════════════════════════════
            LAYER 10 — ATMOSPHERIC DEPTH
        ═══════════════════════════════════════════════ */}
        {/* Bottom ground gradient for depth */}
        <rect x="0" y="720" width="1440" height="80" fill="#1A3A22" opacity="0.35" />

      </svg>
    </div>
  );
}
