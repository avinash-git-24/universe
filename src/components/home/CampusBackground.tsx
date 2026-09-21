"use client";

/**
 * UniVerse — Animated Campus Background (Living Dynamic Edition)
 *
 * A hand-crafted SVG illustration of Marwadi University campus that
 * automatically adapts to:
 *   - Rajkot local time (Dawn / Day / Sunset / Night)
 *   - Live Rajkot weather  (Clear / Overcast / Rain)
 *
 * Features:
 *   - Dynamic sky gradient   — 12 phase × weather colour combinations
 *   - Seasonal cloud tints   — white/golden/purple/storm-grey
 *   - Sun arc movement       — rises left at dawn, sets right at sunset
 *   - Night mode             — crescent moon + 8 twinkling stars
 *   - Hostel window lights   — warm amber glow when lights are on
 *   - Campus street lights   — cone-shaped ground halos at sunset/night
 *   - Rain streaks           — 60 animated diagonal rain lines
 *   - Wet-road overlay       — glistening asphalt reflection
 *   - Seamless transitions   — CSS transition on all SVG attributes
 *
 * Performance: pure CSS keyframes — zero JS on the render thread.
 */

import type { AtmosphereState } from "@/lib/weather/rajkotAtmosphere";

// Pre-computed deterministic rain drop positions (avoids Math.random() on
// every render which would cause hydration mismatches).
const RAIN_DROPS = Array.from({ length: 60 }, (_, i) => ({
  x: ((i * 137 + 31) % 1440),
  delay: ((i * 73) % 100) / 100,
  dur: 0.55 + ((i * 17) % 30) / 100,
}));

// Hostel window indices that light up at night (deterministic subset)
const LIT_WINDOWS = new Set([0, 2, 4, 6, 8, 10, 13, 15, 17, 19, 22, 25, 27]);

interface CampusBackgroundProps {
  atmos: AtmosphereState;
}

export function CampusBackground({ atmos }: CampusBackgroundProps) {
  const {
    skyTop, skyBottom,
    cloudFill, cloudOpacity,
    cloudDurationA, cloudDurationB, cloudDurationC,
    showSun, sunCx, sunCy, sunIntensity, sunCoreColor, sunHaloColor,
    showMoon, showStars,
    showRain, wetRoadOpacity,
    hostelLightsOn, streetLightsOn,
    phase,
  } = atmos;

  // Window fill: lit = warm amber, unlit = sky-blue reflection
  function windowFill(index: number): string {
    if (!hostelLightsOn) return "#A8C8E0";
    return LIT_WINDOWS.has(index % 28) ? "#FEF08A" : "#A8C8E0";
  }
  function windowOpacity(index: number): number {
    if (!hostelLightsOn) return 0.68;
    return LIT_WINDOWS.has(index % 28) ? 0.90 : 0.40;
  }

  // Sun glow radius — slightly larger at noon, smaller at dawn/sunset
  const sunGlowR = phase === "day" ? 76 : 62;
  const sunMidR  = phase === "day" ? 54 : 44;
  const sunInR   = phase === "day" ? 38 : 32;
  const sunCoreR = phase === "day" ? 26 : 22;

  return (
    <div className="absolute inset-0 overflow-hidden">
      <style>{`
        /* ── Cloud Animations — dynamic duration via inline style ── */
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

        /* ── Student Animations ── */
        @keyframes student-bob {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-4px); }
        }
        @keyframes student-walk {
          0%, 100% { transform: translateX(0px) scaleX(1); }
          25%       { transform: translateX(3px)  scaleX(1); }
          75%       { transform: translateX(-3px) scaleX(1); }
        }
        @keyframes arm-swing {
          0%, 100% { transform: rotate(-10deg); }
          50%       { transform: rotate(15deg); }
        }
        @keyframes phone-pulse {
          0%, 100% { opacity: 0.7; }
          50%       { opacity: 1; }
        }
        @keyframes leg-stride-l {
          0%, 100% { transform: rotate(12deg); }
          50%       { transform: rotate(-14deg); }
        }
        @keyframes leg-stride-r {
          0%, 100% { transform: rotate(-14deg); }
          50%       { transform: rotate(12deg); }
        }
        @keyframes flag-wave {
          0%, 100% { d: path("M 724 168 L 760 175 L 724 182"); }
          50%       { d: path("M 724 168 L 762 180 L 724 185"); }
        }

        /* ── Celestial Animations ── */
        @keyframes sun-breathe {
          0%, 100% { opacity: 0.12; }
          50%       { opacity: 0.24; }
        }
        @keyframes moon-glow {
          0%, 100% { opacity: 0.82; }
          50%       { opacity: 1.0; }
        }
        @keyframes star-twinkle-a {
          0%, 100% { opacity: 0.20; transform: scale(0.75); }
          50%       { opacity: 1.00; transform: scale(1.30); }
        }
        @keyframes star-twinkle-b {
          0%, 100% { opacity: 0.10; transform: scale(0.60); }
          50%       { opacity: 0.85; transform: scale(1.20); }
        }

        /* ── Rain ── */
        @keyframes rain-fall {
          0%   { transform: translate(0px,   -20px); opacity: 0;   }
          8%   { opacity: 0.55; }
          92%  { opacity: 0.55; }
          100% { transform: translate(-110px, 830px); opacity: 0; }
        }

        /* ── Street Light Pulse ── */
        @keyframes streetlight-pulse {
          0%, 100% { opacity: 0.45; }
          50%       { opacity: 0.70; }
        }

        /* ── Window flicker (occasional) ── */
        @keyframes window-flicker {
          0%,95%,100% { opacity: 0.90; }
          96%         { opacity: 0.70; }
          97%         { opacity: 0.90; }
          98%         { opacity: 0.55; }
          99%         { opacity: 0.90; }
        }

        /* ─────── Class bindings ─────── */
        .cloud-a { animation: cloud-drift-a ${cloudDurationA}s linear infinite; }
        .cloud-b { animation: cloud-drift-b ${cloudDurationB}s linear infinite 18s; }
        .cloud-c { animation: cloud-drift-c ${cloudDurationC}s linear infinite 36s; }

        .s1-body  { animation: student-bob  2.1s ease-in-out infinite; transform-origin: 130px 585px; }
        .s2-body  { animation: student-bob  2.4s ease-in-out infinite 0.3s; transform-origin: 435px 580px; }
        .s3-body  { animation: student-walk 0.9s ease-in-out infinite; transform-origin: 705px 580px; }
        .s3-arm-l { animation: arm-swing    0.9s ease-in-out infinite; transform-origin: 699px 563px; }
        .s3-arm-r { animation: arm-swing    0.9s ease-in-out infinite 0.45s; transform-origin: 715px 563px; }
        .s3-leg-l { animation: leg-stride-l 0.9s ease-in-out infinite; transform-origin: 700px 582px; }
        .s3-leg-r { animation: leg-stride-r 0.9s ease-in-out infinite; transform-origin: 710px 582px; }
        .phone-screen  { animation: phone-pulse    1.8s ease-in-out infinite; }
        .sun-halo      { animation: sun-breathe    4.0s ease-in-out infinite; }
        .moon-body     { animation: moon-glow      5.0s ease-in-out infinite; }
        .star-a        { animation: star-twinkle-a 3.2s ease-in-out infinite; }
        .star-b        { animation: star-twinkle-b 4.0s ease-in-out infinite 0.8s; }
        .star-c        { animation: star-twinkle-a 3.7s ease-in-out infinite 1.6s; }
        .star-d        { animation: star-twinkle-b 2.9s ease-in-out infinite 0.4s; }
        .star-e        { animation: star-twinkle-a 4.3s ease-in-out infinite 2.1s; }
        .star-f        { animation: star-twinkle-b 3.5s ease-in-out infinite 1.0s; }
        .star-g        { animation: star-twinkle-a 2.7s ease-in-out infinite 0.6s; }
        .star-h        { animation: star-twinkle-b 3.9s ease-in-out infinite 1.9s; }
        .streetlight   { animation: streetlight-pulse 3.5s ease-in-out infinite; }
        .lit-window    { animation: window-flicker 28s ease-in-out infinite; }
      `}</style>

      <svg
        viewBox="0 0 1440 800"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
        className="w-full h-full"
        aria-hidden="true"
        role="presentation"
        style={{ transition: "all 1.8s ease-in-out" }}
      >
        <defs>
          {/* ── Dynamic Sky ── */}
          <linearGradient id="uvSkyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={skyTop}    style={{ transition: "stop-color 1.8s ease-in-out" }} />
            <stop offset="100%" stopColor={skyBottom} style={{ transition: "stop-color 1.8s ease-in-out" }} />
          </linearGradient>

          {/* Ground */}
          <linearGradient id="uvGrassGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#4A9E62" />
            <stop offset="100%" stopColor="#2D6B3A" />
          </linearGradient>

          {/* Building base */}
          <linearGradient id="uvBuildGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#F6F4F0" />
            <stop offset="100%" stopColor="#EDEBE5" />
          </linearGradient>

          {/* Glass facade */}
          <linearGradient id="uvGlassGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%"   stopColor="#CBE6F4" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#A8CEDE" stopOpacity="0.7" />
          </linearGradient>

          {/* Hostel walls */}
          <linearGradient id="uvHostelGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#F8F7F3" />
          </linearGradient>

          {/* Road */}
          <linearGradient id="uvRoadGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#BFC5CF" />
            <stop offset="100%" stopColor="#AEB6C2" />
          </linearGradient>

          {/* Moon gradient */}
          <linearGradient id="uvMoonGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%"   stopColor="#FFFFFF" />
            <stop offset="55%"  stopColor="#E0F2FE" />
            <stop offset="100%" stopColor="#BAE6FD" />
          </linearGradient>

          {/* Crescent mask */}
          <mask id="uvCrescentMask">
            <circle cx="1330" cy="88" r="30" fill="white" />
            <circle cx="1342" cy="78" r="25" fill="black" />
          </mask>

          {/* Street light glow gradient */}
          <radialGradient id="uvStreetGlow" cx="50%" cy="0%" r="100%">
            <stop offset="0%"   stopColor="#FEF08A" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#FEF08A" stopOpacity="0.00" />
          </radialGradient>

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

          {/* Moon glow filter */}
          <filter id="uvMoonFilter" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="3" result="glow" />
            <feMerge><feMergeNode in="glow" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>

          {/* Hostel window glow */}
          <filter id="uvWindowGlow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* ═══════════════════════════════════════════════
            LAYER 1 — SKY
        ═══════════════════════════════════════════════ */}
        <rect x="0" y="0" width="1440" height="800" fill="url(#uvSkyGrad)" />

        {/* ── Sun (Dawn / Day / Sunset) ── */}
        {showSun && (
          <>
            {/* Outer breathing halo */}
            <circle
              className="sun-halo"
              cx={sunCx} cy={sunCy} r={sunGlowR}
              fill={sunHaloColor}
              opacity={0.14 * sunIntensity}
            />
            <circle cx={sunCx} cy={sunCy} r={sunMidR} fill={sunHaloColor} opacity={0.22 * sunIntensity} />
            <circle cx={sunCx} cy={sunCy} r={sunInR}  fill={sunCoreColor} opacity={0.55 * sunIntensity} />
            <circle cx={sunCx} cy={sunCy} r={sunCoreR} fill={sunCoreColor} opacity={sunIntensity} />
            {/* Shine flare */}
            <ellipse cx={sunCx - 6} cy={sunCy - 7} rx="7" ry="4" fill="#FFFFFF" opacity={0.35 * sunIntensity} />
          </>
        )}

        {/* ── Moon (Night only) ── */}
        {showMoon && (
          <>
            {/* Atmospheric halos */}
            <circle cx="1330" cy="88" r="68" fill="#38BDF8" opacity="0.08" className="moon-body" />
            <circle cx="1330" cy="88" r="48" fill="#BAE6FD" opacity="0.14" />
            {/* Crescent moon body */}
            <circle
              cx="1330" cy="88" r="30"
              fill="url(#uvMoonGrad)"
              mask="url(#uvCrescentMask)"
              filter="url(#uvMoonFilter)"
              className="moon-body"
            />
          </>
        )}

        {/* ── Stars (Night only) ── */}
        {showStars && (
          <>
            {/* Diamond-point stars scattered across the sky */}
            <g className="star-a" style={{ transformOrigin: "180px 55px" }}>
              <path d="M 180 50 Q 180 55 175 55 Q 180 55 180 60 Q 180 55 185 55 Q 180 55 180 50 Z" fill="#E0F2FE" />
            </g>
            <g className="star-b" style={{ transformOrigin: "420px 75px" }}>
              <path d="M 420 71 Q 420 75 416 75 Q 420 75 420 79 Q 420 75 424 75 Q 420 75 420 71 Z" fill="#BAE6FD" />
            </g>
            <g className="star-c" style={{ transformOrigin: "680px 42px" }}>
              <path d="M 680 38 Q 680 42 676 42 Q 680 42 680 46 Q 680 42 684 42 Q 680 42 680 38 Z" fill="#F0FAFE" />
              <circle cx="680" cy="42" r="0.8" fill="#FFFFFF" />
            </g>
            <g className="star-d" style={{ transformOrigin: "920px 62px" }}>
              <path d="M 920 57 Q 920 62 915 62 Q 920 62 920 67 Q 920 62 925 62 Q 920 62 920 57 Z" fill="#BAE6FD" />
            </g>
            <g className="star-e" style={{ transformOrigin: "1100px 35px" }}>
              <path d="M 1100 31 Q 1100 35 1096 35 Q 1100 35 1100 39 Q 1100 35 1104 35 Q 1100 35 1100 31 Z" fill="#E0F2FE" />
              <circle cx="1100" cy="35" r="0.8" fill="#FFFFFF" />
            </g>
            <g className="star-f" style={{ transformOrigin: "320px 100px" }}>
              <circle cx="320" cy="100" r="1.5" fill="#BAE6FD" opacity="0.90" />
            </g>
            <g className="star-g" style={{ transformOrigin: "760px 80px" }}>
              <circle cx="760" cy="80" r="1.2" fill="#E0F2FE" opacity="0.85" />
            </g>
            <g className="star-h" style={{ transformOrigin: "1240px 55px" }}>
              <path d="M 1240 51 Q 1240 55 1237 55 Q 1240 55 1240 59 Q 1240 55 1243 55 Q 1240 55 1240 51 Z" fill="#67E8F9" />
            </g>
          </>
        )}

        {/* ── Clouds ── */}
        <g className="cloud-a">
          <ellipse cx="160" cy="95"  rx="90" ry="32" fill={cloudFill} opacity={cloudOpacity} />
          <ellipse cx="230" cy="82"  rx="65" ry="26" fill={cloudFill} opacity={cloudOpacity} />
          <ellipse cx="90"  cy="102" rx="60" ry="24" fill={cloudFill} opacity={cloudOpacity} />
          <ellipse cx="190" cy="75"  rx="45" ry="20" fill={cloudFill} opacity={cloudOpacity * 0.90} />
        </g>
        <g className="cloud-b">
          <ellipse cx="560" cy="68"  rx="110" ry="38" fill={cloudFill} opacity={cloudOpacity * 0.82} />
          <ellipse cx="648" cy="55"  rx="78"  ry="30" fill={cloudFill} opacity={cloudOpacity * 0.82} />
          <ellipse cx="472" cy="74"  rx="72"  ry="29" fill={cloudFill} opacity={cloudOpacity * 0.82} />
          <ellipse cx="600" cy="48"  rx="52"  ry="22" fill={cloudFill} opacity={cloudOpacity * 0.74} />
        </g>
        <g className="cloud-c">
          <ellipse cx="900" cy="115" rx="80" ry="30" fill={cloudFill} opacity={cloudOpacity * 0.74} />
          <ellipse cx="970" cy="103" rx="58" ry="23" fill={cloudFill} opacity={cloudOpacity * 0.74} />
          <ellipse cx="828" cy="120" rx="55" ry="22" fill={cloudFill} opacity={cloudOpacity * 0.74} />
        </g>

        {/* ── Rain Streaks (Rain mode only) ── */}
        {showRain && (
          <g>
            {RAIN_DROPS.map((d, i) => (
              <line
                key={i}
                x1={d.x} y1={-10}
                x2={d.x - 80} y2={90}
                stroke="rgba(147,210,255,0.55)"
                strokeWidth="1"
                style={{
                  animation: `rain-fall ${d.dur}s linear infinite`,
                  animationDelay: `${d.delay}s`,
                }}
              />
            ))}
          </g>
        )}

        {/* ═══════════════════════════════════════════════
            LAYER 2 — DISTANT TREE LINE / HILLS
        ═══════════════════════════════════════════════ */}
        <ellipse cx="200"  cy="400" rx="280" ry="90" fill="#6BAF7C" opacity="0.22" />
        <ellipse cx="750"  cy="418" rx="360" ry="80" fill="#5A9E6A" opacity="0.18" />
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
        <rect x="520" y="254" width="400" height="4"  fill="#059669" opacity="0.5" />

        {/* Structural columns */}
        {[538, 580, 622, 664, 760, 802, 844, 886].map((x, i) => (
          <rect key={i} x={x} y="258" width="16" height="342" fill="#E8E4DC" opacity="0.55" rx="1" />
        ))}

        {/* Windows — main block (dynamic lit/unlit) */}
        {[0, 1, 2, 3, 4].map(row =>
          [0, 1, 2, 3, 4, 5, 6].map(col => {
            const idx = row * 7 + col;
            const isLit = hostelLightsOn && LIT_WINDOWS.has(idx % 28);
            return (
              <rect
                key={`mw${row}-${col}`}
                x={538 + col * 52}
                y={272 + row * 56}
                width="34" height="38"
                fill={isLit ? "#FEF08A" : "#A8C8E0"}
                opacity={isLit ? 0.88 : 0.68}
                rx="2"
                className={isLit ? "lit-window" : undefined}
                filter={isLit ? "url(#uvWindowGlow)" : undefined}
              />
            );
          })
        )}

        {/* Campus name badge */}
        <rect x="610" y="462" width="220" height="32" fill="#10B981" rx="6" />
        <text x="720" y="482" textAnchor="middle" fill="white" fontSize="13" fontFamily="sans-serif" fontWeight="700" letterSpacing="0.5">MARWADI UNIVERSITY</text>

        {/* Main entrance */}
        <rect x="690" y="556" width="80" height="44" fill="#C8A97A" rx="3" />
        <rect x="690" y="556" width="80" height="6"  fill="#B8935A" />
        <rect x="718" y="566" width="11" height="28" fill="#A0804C" rx="1.5" />
        <rect x="751" y="566" width="11" height="28" fill="#A0804C" rx="1.5" />

        {/* Entrance canopy */}
        <rect x="672" y="544" width="116" height="14" fill="#059669" rx="2" opacity="0.9" />

        {/* ═══════════════════════════════════════════════
            LAYER 3B — ADMIN TOWER (center, taller)
        ═══════════════════════════════════════════════ */}
        <rect x="750" y="148" width="84"  height="458" fill="#1a2a1a" opacity="0.08" rx="2" />
        <rect x="742" y="140" width="76"  height="460" fill="url(#uvGlassGrad)" filter="url(#uvShadow)" rx="2" />
        <rect x="778" y="140" width="4"   height="460" fill="white" opacity="0.25" />

        {/* Tower windows */}
        {[0, 1, 2, 3, 4, 5, 6, 7].map(row => {
          const isLit = hostelLightsOn && row % 2 === 1;
          return (
            <g key={row}>
              <rect x="750" y={155 + row * 52} width="28" height="36"
                fill={isLit ? "#FEF08A" : "#87BEDB"}
                opacity={isLit ? 0.85 : 0.55} rx="1"
                className={isLit ? "lit-window" : undefined}
                filter={isLit ? "url(#uvWindowGlow)" : undefined}
              />
              <rect x="782" y={155 + row * 52} width="28" height="36"
                fill={isLit ? "#FEF08A" : "#87BEDB"}
                opacity={isLit ? 0.85 : 0.55} rx="1"
                className={isLit ? "lit-window" : undefined}
                filter={isLit ? "url(#uvWindowGlow)" : undefined}
              />
            </g>
          );
        })}

        {/* Tower roof / flag */}
        <rect x="748" y="130" width="64" height="12" fill="#10B981" rx="2" />
        <rect x="776" y="108" width="3"  height="24" fill="#6B7280" />
        <path d="M 779 108 L 808 116 L 779 124 Z" fill="#F59E0B" />

        {/* ═══════════════════════════════════════════════
            LAYER 4 — HOSTEL BUILDINGS
        ═══════════════════════════════════════════════ */}

        {/* ── Hostel A (far left, amber accent) ── */}
        <g filter="url(#uvShadow)">
          <rect x="22" y="282" width="196" height="268" fill="url(#uvHostelGrad)" rx="2" />
          <rect x="22" y="282" width="196" height="12" fill="#F59E0B" />
          <rect x="22" y="294" width="196" height="3"  fill="#D97706" opacity="0.5" />
          {[0, 1, 2, 3].map(f => <rect key={f} x="22" y={297 + f * 62} width="196" height="1" fill="#E5E7EB" />)}
          {[0, 1, 2, 3].map(row =>
            [0, 1, 2].map(col => {
              const idx = row * 3 + col;
              const fill = windowFill(idx);
              const op   = windowOpacity(idx);
              const isLit = hostelLightsOn && LIT_WINDOWS.has(idx % 28);
              return (
                <rect key={`aw${row}-${col}`}
                  x={38 + col * 58} y={303 + row * 62}
                  width="38" height="42"
                  fill={fill} opacity={op} rx="2"
                  className={isLit ? "lit-window" : undefined}
                  filter={isLit ? "url(#uvWindowGlow)" : undefined}
                />
              );
            })
          )}
          <rect x="70"  y="524" width="100" height="26" fill="#F59E0B" rx="13" />
          <text x="120" y="541" textAnchor="middle" fill="white" fontSize="12" fontFamily="sans-serif" fontWeight="700" letterSpacing="0.5">HOSTEL A</text>
          <rect x="98" y="508" width="44" height="42" fill="#C09050" rx="2" />
          <rect x="98" y="508" width="44" height="6"  fill="#A07030" />
          <rect x="118" y="518" width="5" height="22" fill="#8B6040" rx="1" />
        </g>

        {/* ── Hostel B (center-left, emerald accent) ── */}
        <g filter="url(#uvShadow)">
          <rect x="262" y="298" width="182" height="252" fill="url(#uvHostelGrad)" rx="2" />
          <rect x="262" y="298" width="182" height="12" fill="#10B981" />
          <rect x="262" y="310" width="182" height="3"  fill="#059669" opacity="0.5" />
          {[0, 1, 2, 3].map(f => <rect key={f} x="262" y={313 + f * 59} width="182" height="1" fill="#E5E7EB" />)}
          {[0, 1, 2, 3].map(row =>
            [0, 1, 2].map(col => {
              const idx = row * 3 + col + 12;
              const fill = windowFill(idx);
              const op   = windowOpacity(idx);
              const isLit = hostelLightsOn && LIT_WINDOWS.has(idx % 28);
              return (
                <rect key={`bw${row}-${col}`}
                  x={276 + col * 54} y={320 + row * 59}
                  width="36" height="40"
                  fill={fill} opacity={op} rx="2"
                  className={isLit ? "lit-window" : undefined}
                  filter={isLit ? "url(#uvWindowGlow)" : undefined}
                />
              );
            })
          )}
          <rect x="306" y="525" width="100" height="26" fill="#10B981" rx="13" />
          <text x="356" y="542" textAnchor="middle" fill="white" fontSize="12" fontFamily="sans-serif" fontWeight="700" letterSpacing="0.5">HOSTEL B</text>
          <rect x="330" y="508" width="44" height="42" fill="#C09050" rx="2" />
          <rect x="330" y="508" width="44" height="6"  fill="#A07030" />
          <rect x="350" y="518" width="5" height="22" fill="#8B6040" rx="1" />
        </g>

        {/* ── Hostel C (center-right, emerald accent) ── */}
        <g filter="url(#uvShadow)">
          <rect x="1000" y="298" width="182" height="252" fill="url(#uvHostelGrad)" rx="2" />
          <rect x="1000" y="298" width="182" height="12" fill="#10B981" />
          <rect x="1000" y="310" width="182" height="3"  fill="#059669" opacity="0.5" />
          {[0, 1, 2, 3].map(f => <rect key={f} x="1000" y={313 + f * 59} width="182" height="1" fill="#E5E7EB" />)}
          {[0, 1, 2, 3].map(row =>
            [0, 1, 2].map(col => {
              const idx = row * 3 + col + 24;
              const fill = windowFill(idx);
              const op   = windowOpacity(idx);
              const isLit = hostelLightsOn && LIT_WINDOWS.has(idx % 28);
              return (
                <rect key={`cw${row}-${col}`}
                  x={1014 + col * 54} y={320 + row * 59}
                  width="36" height="40"
                  fill={fill} opacity={op} rx="2"
                  className={isLit ? "lit-window" : undefined}
                  filter={isLit ? "url(#uvWindowGlow)" : undefined}
                />
              );
            })
          )}
          <rect x="1042" y="525" width="100" height="26" fill="#10B981" rx="13" />
          <text x="1092" y="542" textAnchor="middle" fill="white" fontSize="12" fontFamily="sans-serif" fontWeight="700" letterSpacing="0.5">HOSTEL C</text>
          <rect x="1066" y="508" width="44" height="42" fill="#C09050" rx="2" />
          <rect x="1066" y="508" width="44" height="6"  fill="#A07030" />
          <rect x="1086" y="518" width="5" height="22" fill="#8B6040" rx="1" />
        </g>

        {/* ── Hostel D (far right, amber accent) ── */}
        <g filter="url(#uvShadow)">
          <rect x="1226" y="282" width="196" height="268" fill="url(#uvHostelGrad)" rx="2" />
          <rect x="1226" y="282" width="196" height="12" fill="#F59E0B" />
          <rect x="1226" y="294" width="196" height="3"  fill="#D97706" opacity="0.5" />
          {[0, 1, 2, 3].map(f => <rect key={f} x="1226" y={297 + f * 62} width="196" height="1" fill="#E5E7EB" />)}
          {[0, 1, 2, 3].map(row =>
            [0, 1, 2].map(col => {
              const idx = row * 3 + col + 36;
              const fill = windowFill(idx);
              const op   = windowOpacity(idx);
              const isLit = hostelLightsOn && LIT_WINDOWS.has(idx % 28);
              return (
                <rect key={`dw${row}-${col}`}
                  x={1242 + col * 58} y={303 + row * 62}
                  width="38" height="42"
                  fill={fill} opacity={op} rx="2"
                  className={isLit ? "lit-window" : undefined}
                  filter={isLit ? "url(#uvWindowGlow)" : undefined}
                />
              );
            })
          )}
          <rect x="1274" y="524" width="100" height="26" fill="#F59E0B" rx="13" />
          <text x="1324" y="541" textAnchor="middle" fill="white" fontSize="12" fontFamily="sans-serif" fontWeight="700" letterSpacing="0.5">HOSTEL D</text>
          <rect x="1302" y="508" width="44" height="42" fill="#C09050" rx="2" />
          <rect x="1302" y="508" width="44" height="6"  fill="#A07030" />
          <rect x="1322" y="518" width="5" height="22" fill="#8B6040" rx="1" />
        </g>

        {/* ═══════════════════════════════════════════════
            LAYER 5 — ROADS & PATHS
        ═══════════════════════════════════════════════ */}

        {/* Main horizontal road */}
        <rect x="0" y="592" width="1440" height="44" fill="url(#uvRoadGrad)" />
        <rect x="0" y="592" width="1440" height="2"  fill="#CDD2DC" opacity="0.6" />

        {/* Road lane dashes */}
        {Array.from({ length: 14 }).map((_, i) => (
          <rect key={i} x={40 + i * 106} y="611" width="56" height="5" fill="white" opacity="0.45" rx="2" />
        ))}

        {/* Wet road overlay (rain mode) */}
        {wetRoadOpacity > 0 && (
          <rect x="0" y="592" width="1440" height="44" fill="#475569" opacity={wetRoadOpacity} />
        )}

        {/* Vertical paths */}
        <rect x="107"  y="553" width="28" height="44" fill="#C4CAD6" opacity="0.7" />
        <rect x="341"  y="553" width="28" height="44" fill="#C4CAD6" opacity="0.7" />
        <rect x="1075" y="553" width="28" height="44" fill="#C4CAD6" opacity="0.7" />
        <rect x="1309" y="553" width="28" height="44" fill="#C4CAD6" opacity="0.7" />

        {/* Curved campus paths */}
        <path d="M 520 590 Q 420 575 360 592" stroke="#C4CAD6" strokeWidth="18" fill="none" opacity="0.65" strokeLinecap="round" />
        <path d="M 920 590 Q 1020 575 1082 592" stroke="#C4CAD6" strokeWidth="18" fill="none" opacity="0.65" strokeLinecap="round" />

        {/* ═══════════════════════════════════════════════
            LAYER 5B — STREET LIGHTS (Sunset / Night)
        ═══════════════════════════════════════════════ */}
        {streetLightsOn && (
          <>
            {/* 4 lamp poles at hostel path intersections */}
            {[121, 355, 1089, 1323].map((x, i) => (
              <g key={i}>
                {/* Pole */}
                <rect x={x} y="548" width="4" height="48" fill="#6B7280" rx="1" />
                {/* Lamp head */}
                <rect x={x - 4} y="543" width="12" height="7" fill="#9CA3AF" rx="2" />
                {/* Light cone glow on road */}
                <ellipse
                  cx={x + 2} cy="594"
                  rx="38" ry="12"
                  fill="url(#uvStreetGlow)"
                  className="streetlight"
                />
              </g>
            ))}
          </>
        )}

        {/* ═══════════════════════════════════════════════
            LAYER 6 — VENDING MACHINES
        ═══════════════════════════════════════════════ */}
        {[
          { x: 224,  accent: "#10B981" },
          { x: 450,  accent: "#F59E0B" },
          { x: 994,  accent: "#10B981" },
          { x: 1216, accent: "#F59E0B" },
        ].map(({ x, accent }, i) => (
          <g key={i} filter="url(#uvVendGlow)">
            <rect x={x}     y="507" width="36" height="56" fill="#EBEBEB" rx="4" stroke="#CECECE" strokeWidth="1" />
            <rect x={x + 3} y="510" width="30" height="18" fill={accent} opacity="0.85" rx="2" />
            <text x={x + 18} y="523" textAnchor="middle" fill="white" fontSize="9" fontFamily="sans-serif" fontWeight="800">UV</text>
            <rect x={x + 4}  y="532" width="12" height="11" fill={accent}    opacity="0.55" rx="1" />
            <rect x={x + 20} y="532" width="12" height="11" fill="#F59E0B"   opacity="0.55" rx="1" />
            <rect x={x + 4}  y="546" width="12" height="11" fill="#F59E0B"   opacity="0.45" rx="1" />
            <rect x={x + 20} y="546" width="12" height="11" fill={accent}    opacity="0.45" rx="1" />
            <rect x={x + 10} y="560" width="16" height="3"  fill="#AAAAAA"   rx="1.5" />
            <rect x={x + 4}  y="558" width="28" height="4"  fill="#D0D0D0"   rx="1" />
          </g>
        ))}

        {/* ═══════════════════════════════════════════════
            LAYER 7 — TREES
        ═══════════════════════════════════════════════ */}
        {[
          { x: 490,  base: 548, tH: 48, cR: 44, c1: "#2E7D52", c2: "#388E5A" },
          { x: 510,  base: 548, tH: 48, cR: 30, c1: "#3D8B5A", c2: "#4CAF72" },
          { x: 930,  base: 548, tH: 44, cR: 40, c1: "#2E7D52", c2: "#3D8B5A" },
          { x: 950,  base: 548, tH: 44, cR: 28, c1: "#4CAF72", c2: "#388E5A" },
          { x: 218,  base: 556, tH: 36, cR: 32, c1: "#2E7D52", c2: "#388E5A" },
          { x: 1228, base: 556, tH: 36, cR: 32, c1: "#388E5A", c2: "#2E7D52" },
          { x: 660,  base: 558, tH: 28, cR: 24, c1: "#3D8B5A", c2: "#4CAF72" },
          { x: 782,  base: 558, tH: 28, cR: 24, c1: "#2E7D52", c2: "#3D8B5A" },
          { x: 145,  base: 560, tH: 22, cR: 20, c1: "#388E5A", c2: "#4CAF72" },
          { x: 1296, base: 560, tH: 22, cR: 20, c1: "#2E7D52", c2: "#388E5A" },
          { x: 455,  base: 562, tH: 20, cR: 18, c1: "#4CAF72", c2: "#3D8B5A" },
          { x: 988,  base: 562, tH: 20, cR: 18, c1: "#388E5A", c2: "#4CAF72" },
        ].map((t, i) => (
          <g key={i} filter="url(#uvTreeShadow)">
            <rect x={t.x - 4} y={t.base - t.tH} width="8" height={t.tH} fill="#7B5A3A" rx="2" />
            <circle cx={t.x - 12} cy={t.base - t.tH - t.cR * 0.5} r={t.cR * 0.65} fill={t.c2} />
            <circle cx={t.x + 12} cy={t.base - t.tH - t.cR * 0.5} r={t.cR * 0.65} fill={t.c2} />
            <circle cx={t.x}      cy={t.base - t.tH - t.cR * 0.8} r={t.cR}         fill={t.c1} />
          </g>
        ))}

        {/* ═══════════════════════════════════════════════
            LAYER 8 — GROUND
        ═══════════════════════════════════════════════ */}
        <rect x="0" y="636" width="1440" height="164" fill="url(#uvGrassGrad)" />
        <rect x="0" y="635" width="1440" height="3"   fill="#5DB86E" opacity="0.5" />
        <rect x="0" y="636" width="1440" height="8"   fill="#D4D8DF" opacity="0.35" />

        {/* ═══════════════════════════════════════════════
            LAYER 9 — STUDENTS
        ═══════════════════════════════════════════════ */}

        {/* ── Student 1: Requester (phone) — near Hostel A ── */}
        <g className="s1-body">
          <ellipse cx="130" cy="601" rx="16" ry="5" fill="#000" opacity="0.12" />
          <rect x="122" y="578" width="8"  height="22" fill="#1E3A5F" rx="3" />
          <rect x="133" y="578" width="8"  height="22" fill="#1E3A5F" rx="3" />
          <rect x="118" y="553" width="26" height="28" fill="#10B981" rx="5" />
          <rect x="106" y="550" width="14" height="6"  fill="#D4A070" rx="3" transform="rotate(-45, 113, 553)" />
          <rect x="98"  y="540" width="13" height="20" fill="#1A1A2E" rx="3" />
          <rect x="100" y="542" width="9"  height="14" rx="1.5" fill="#4FC3F7" className="phone-screen" />
          <rect x="144" y="558" width="13" height="6"  fill="#D4A070" rx="3" transform="rotate(20, 150, 561)" />
          <circle cx="131" cy="545" r="11" fill="#D4A070" />
          <ellipse cx="131" cy="537" rx="11" ry="5" fill="#2C1810" />
          <ellipse cx="142" cy="545" rx="3"  ry="4" fill="#C08060" />
          <rect x="120" y="598" width="10" height="5" fill="#1A1A2E" rx="2" />
          <rect x="133" y="598" width="10" height="5" fill="#1A1A2E" rx="2" />
        </g>

        {/* ── Student 2: Collector — vending machine near Hostel B ── */}
        <g className="s2-body">
          <ellipse cx="435" cy="603" rx="16" ry="5" fill="#000" opacity="0.12" />
          <rect x="427" y="578" width="8"  height="22" fill="#374151" rx="3" />
          <rect x="438" y="578" width="8"  height="22" fill="#374151" rx="3" />
          <rect x="423" y="553" width="26" height="28" fill="#F59E0B" rx="5" />
          <rect x="449" y="555" width="20" height="6"  fill="#C8956C" rx="3" transform="rotate(-8, 459, 558)" />
          <rect x="467" y="547" width="14" height="18" fill="#10B981" rx="3" opacity="0.95" />
          <text x="474" y="559" textAnchor="middle" fill="white" fontSize="7" fontFamily="sans-serif" fontWeight="800">UV</text>
          <rect x="404" y="558" width="20" height="6"  fill="#C8956C" rx="3" transform="rotate(10, 414, 561)" />
          <circle cx="436" cy="545" r="11" fill="#C8956C" />
          <ellipse cx="436" cy="537" rx="11" ry="5" fill="#1A0A04" />
          <rect x="425" y="598" width="10" height="5" fill="#374151" rx="2" />
          <rect x="438" y="598" width="10" height="5" fill="#374151" rx="2" />
        </g>

        {/* ── Student 3: Deliverer — walking with UniVerse bag ── */}
        <g className="s3-body">
          <ellipse cx="705" cy="604" rx="16" ry="5" fill="#000" opacity="0.12" />
          <rect className="s3-leg-l" x="697" y="580" width="8"  height="22" fill="#1E3A5F" rx="3" />
          <rect className="s3-leg-r" x="709" y="580" width="8"  height="22" fill="#1E3A5F" rx="3" />
          <rect x="693" y="554" width="26" height="28" fill="#6366F1" rx="5" />
          <rect className="s3-arm-l" x="680" y="559" width="14" height="6" fill="#C8956C" rx="3" />
          <rect className="s3-arm-r" x="718" y="556" width="14" height="6" fill="#C8956C" rx="3" />
          <rect x="728" y="544" width="22" height="26" fill="#10B981" rx="4" />
          <text x="739" y="556" textAnchor="middle" fill="white" fontSize="8" fontFamily="sans-serif" fontWeight="800">UV</text>
          <rect x="731" y="565" width="16" height="2" fill="white" opacity="0.4" rx="1" />
          <path d="M 733 544 Q 735 538 739 538 Q 743 538 745 544" fill="none" stroke="white" strokeWidth="1.5" opacity="0.6" />
          <circle cx="706" cy="546" r="11" fill="#D4A070" />
          <ellipse cx="706" cy="538" rx="11" ry="5" fill="#3D2B1F" />
          <rect x="695" y="600" width="10" height="5" fill="#1E3A5F" rx="2" />
          <rect x="709" y="600" width="10" height="5" fill="#1E3A5F" rx="2" />
        </g>

        {/* ═══════════════════════════════════════════════
            LAYER 10 — ATMOSPHERIC DEPTH
        ═══════════════════════════════════════════════ */}
        <rect x="0" y="720" width="1440" height="80" fill="#1A3A22" opacity="0.35" />

      </svg>
    </div>
  );
}
