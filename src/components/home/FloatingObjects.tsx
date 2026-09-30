"use client";

import { motion } from "framer-motion";

// ─── Individual product SVGs ──────────────────────────────────────────────────

const SnackPacket = () => (
  <svg width="60" height="74" viewBox="0 0 52 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: "drop-shadow(0 15px 20px rgba(0,0,0,0.4))" }}>
    <rect x="6" y="14" width="40" height="44" fill="url(#snackGrad)" rx="6" stroke="#C09040" strokeWidth="1.5"/>
    <path d="M 6 14 Q 26 8 46 14" fill="#E8B040" stroke="#B07030" strokeWidth="1"/>
    <path d="M 8 16 Q 26 10 44 16" fill="#F0C060" stroke="none"/>
    <rect x="6" y="28" width="40" height="16" fill="#10B981" opacity="0.9"/>
    <rect x="12" y="32" width="28" height="8" fill="#059669" rx="4" />
    <text x="26" y="39.5" textAnchor="middle" fill="white" fontSize="7" fontFamily="sans-serif" fontWeight="800" letterSpacing="1">SNACK</text>
    <rect x="8" y="16" width="6" height="38" fill="white" opacity="0.4" rx="3"/>
    <path d="M 8 56 Q 26 62 44 56" fill="#C09040" stroke="none"/>
    <defs>
      <linearGradient id="snackGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#FDE68A"/>
        <stop offset="100%" stopColor="#F59E0B"/>
      </linearGradient>
    </defs>
  </svg>
);

const ChocolateBar = () => (
  <svg width="64" height="50" viewBox="0 0 56 44" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: "drop-shadow(0 15px 20px rgba(0,0,0,0.4))" }}>
    <rect x="2" y="4" width="52" height="36" fill="url(#chocoWrap)" rx="5" stroke="#904020" strokeWidth="1.5"/>
    <rect x="2" y="4" width="52" height="8" fill="#B05030" rx="5"/>
    <rect x="2" y="12" width="52" height="2" fill="#904020"/>
    {[0,1,2,3].map(col =>
      [0,1].map(row => (
        <rect
          key={`${col}-${row}`}
          x={8 + col * 11} y={18 + row * 10}
          width="9" height="8"
          fill="#4A2511" rx="1.5"
        />
      ))
    )}
    <rect x="4" y="6" width="5" height="32" fill="white" opacity="0.4" rx="2.5"/>
    <text x="28" y="11.5" textAnchor="middle" fill="white" fontSize="6" fontFamily="sans-serif" fontWeight="800" letterSpacing="1">CHOCO</text>
    <defs>
      <linearGradient id="chocoWrap" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#D97706"/>
        <stop offset="100%" stopColor="#92400E"/>
      </linearGradient>
    </defs>
  </svg>
);

const SodaCan = () => (
  <svg width="46" height="74" viewBox="0 0 38 62" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: "drop-shadow(0 15px 20px rgba(0,0,0,0.4))" }}>
    <rect x="4" y="10" width="30" height="46" fill="url(#canGrad)" rx="4"/>
    <ellipse cx="19" cy="10" rx="15" ry="5" fill="#C0C0C0"/>
    <ellipse cx="19" cy="10" rx="8" ry="3" fill="#A0A0A0" stroke="#808080" strokeWidth="0.5"/>
    <rect x="17" y="5" width="5" height="7" fill="#E0E0E0" rx="1"/>
    <ellipse cx="19" cy="56" rx="15" ry="5" fill="#C0C0C0"/>
    <rect x="4" y="22" width="30" height="22" fill="#064E3B" opacity="0.9"/>
    <text x="19" y="31" textAnchor="middle" fill="#6EE7B7" fontSize="10" fontFamily="sans-serif" fontWeight="900" letterSpacing="1">UV</text>
    <text x="19" y="41" textAnchor="middle" fill="white" fontSize="6" fontFamily="sans-serif" fontWeight="700" opacity="0.9">REFRESH</text>
    <rect x="6" y="12" width="4" height="42" fill="white" opacity="0.4" rx="2"/>
    <rect x="28" y="12" width="2" height="42" fill="white" opacity="0.2" rx="1"/>
    <defs>
      <linearGradient id="canGrad" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#059669"/>
        <stop offset="50%" stopColor="#34D399"/>
        <stop offset="100%" stopColor="#047857"/>
      </linearGradient>
    </defs>
  </svg>
);

const WaterBottle = () => (
  <svg width="40" height="84" viewBox="0 0 34 72" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: "drop-shadow(0 15px 20px rgba(0,0,0,0.3))" }}>
    <rect x="11" y="6" width="12" height="14" fill="#E0F2FE" rx="3" stroke="#BAE6FD" strokeWidth="1"/>
    <rect x="10" y="2" width="14" height="8" fill="#38BDF8" rx="3"/>
    <path d="M 8 20 Q 4 24 4 30 L 4 60 Q 4 66 17 66 Q 30 66 30 60 L 30 30 Q 30 24 26 20 Z"
          fill="#E0F2FE" stroke="#7DD3FC" strokeWidth="1.5" opacity="0.7"/>
    <path d="M 5 45 Q 8 43 17 44 Q 26 43 29 45 L 30 60 Q 30 66 17 66 Q 4 66 4 60 Z"
          fill="#38BDF8" opacity="0.6"/>
    <path d="M 6 44 Q 17 40 28 44" fill="none" stroke="white" strokeWidth="1.5" opacity="0.8"/>
    <rect x="7" y="22" width="5" height="40" fill="white" opacity="0.5" rx="2.5"/>
    <rect x="8" y="30" width="18" height="16" fill="white" opacity="0.9" rx="2"/>
    <text x="17" y="40.5" textAnchor="middle" fill="#0284C7" fontSize="8" fontFamily="sans-serif" fontWeight="800">H₂O</text>
  </svg>
);

const CoffeeCup = () => (
  <svg width="68" height="82" viewBox="0 0 60 72" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: "drop-shadow(0 20px 25px rgba(0,0,0,0.55)) drop-shadow(0 8px 10px rgba(0,0,0,0.3))" }}>
    <defs>
      {/* 3D Cylindrical Lighting: Rim Light, Core Highlight, Diffuse, Ambient Shadow */}
      <linearGradient id="cup3D" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#CBD5E1" />
        <stop offset="12%" stopColor="#F1F5F9" />
        <stop offset="35%" stopColor="#FFFFFF" />
        <stop offset="70%" stopColor="#E2E8F0" />
        <stop offset="90%" stopColor="#94A3B8" />
        <stop offset="100%" stopColor="#64748B" />
      </linearGradient>

      {/* 3D Emerald Sleeve with cylindrical curve shading */}
      <linearGradient id="sleeve3D" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#022C22" />
        <stop offset="12%" stopColor="#065F46" />
        <stop offset="35%" stopColor="#10B981" />
        <stop offset="65%" stopColor="#059669" />
        <stop offset="88%" stopColor="#047857" />
        <stop offset="100%" stopColor="#022C22" />
      </linearGradient>

      {/* 3D Lid Rim & Bevel Gradient */}
      <linearGradient id="lidRim3D" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#475569" />
        <stop offset="40%" stopColor="#334155" />
        <stop offset="100%" stopColor="#0F172A" />
      </linearGradient>

      <linearGradient id="lidTop3D" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#1E293B" />
        <stop offset="30%" stopColor="#334155" />
        <stop offset="70%" stopColor="#1E293B" />
        <stop offset="100%" stopColor="#0F172A" />
      </linearGradient>

      {/* Steam Gradient */}
      <linearGradient id="steamFade" x1="0" y1="1" x2="0" y2="0">
        <stop offset="0%" stopColor="#FDE68A" stopOpacity="0.9" />
        <stop offset="60%" stopColor="#FEF3C7" stopOpacity="0.6" />
        <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
      </linearGradient>

      {/* Badge Depth Gradient */}
      <radialGradient id="badgeGrad" cx="40%" cy="35%" r="65%">
        <stop offset="0%" stopColor="#065F46" />
        <stop offset="70%" stopColor="#022C22" />
        <stop offset="100%" stopColor="#011612" />
      </radialGradient>
    </defs>

    {/* 3D Rising Steam Wisps */}
    <path d="M 23 15 C 20 10, 25 5, 22 0" fill="none" stroke="url(#steamFade)" strokeWidth="2.2" strokeLinecap="round" />
    <path d="M 30 14 C 34 8, 28 4, 31 -2" fill="none" stroke="url(#steamFade)" strokeWidth="2.6" strokeLinecap="round" />
    <path d="M 37 16 C 41 11, 36 6, 38 1" fill="none" stroke="url(#steamFade)" strokeWidth="1.8" strokeLinecap="round" />

    {/* 3D Cup Base Shadow Cast */}
    <ellipse cx="30" cy="65.5" rx="13" ry="2.8" fill="#000000" opacity="0.35" />

    {/* 3D Cup Main Body (Cylindrical Paper Cup) */}
    <path d="M 12 21 L 17 63.5 Q 30 67 43 63.5 L 48 21 Q 30 24.5 12 21 Z" fill="url(#cup3D)" />
    
    {/* Base Rounding Curve */}
    <ellipse cx="30" cy="63.5" rx="13" ry="2.5" fill="#94A3B8" opacity="0.5" />

    {/* Left Specular Light Sheen (Vertical Cylindrical Reflection) */}
    <path d="M 15 22.5 L 19 62.5 Q 22 63 24 62.5 L 20 22.5 Q 17.5 22.3 15 22.5 Z" fill="#FFFFFF" opacity="0.65" />
    <path d="M 17 23 L 19.5 61.5 Q 20.8 62 22 61.5 L 19.5 23 Z" fill="#FFFFFF" opacity="0.85" />

    {/* Shadow cast by the sleeve onto the lower cup (True 3D Physical Separation) */}
    <path d="M 15.5 53.5 Q 30 57.5 44.5 53.5 L 44.7 55.5 Q 30 59.5 15.3 55.5 Z" fill="#0F172A" opacity="0.35" />

    {/* 3D Emerald Coffee Sleeve */}
    <path d="M 13.5 32 L 15.8 53 Q 30 57 44.2 53 L 46.5 32 Q 30 35.5 13.5 32 Z" fill="url(#sleeve3D)" />
    
    {/* Sleeve 3D Beveled Edges */}
    <path d="M 13.5 32 Q 30 35.5 46.5 32" fill="none" stroke="#6EE7B7" strokeWidth="0.9" opacity="0.85" />
    <path d="M 15.8 53 Q 30 57 44.2 53" fill="none" stroke="#022C22" strokeWidth="1.2" opacity="0.9" />
    
    {/* Sleeve Corrugated Texture Ribs */}
    <path d="M 14.3 39 Q 30 42.5 45.7 39" fill="none" stroke="#047857" strokeWidth="0.6" opacity="0.45" />
    <path d="M 15.1 46 Q 30 49.5 44.9 46" fill="none" stroke="#047857" strokeWidth="0.6" opacity="0.45" />

    {/* 3D Center Emblem Badge */}
    <circle cx="30" cy="43.5" r="9" fill="url(#badgeGrad)" stroke="#34D399" strokeWidth="1.2" style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))" }} />
    <circle cx="30" cy="43.5" r="7.4" fill="none" stroke="#A7F3D0" strokeWidth="0.6" strokeDasharray="1.5 1" opacity="0.85" />
    
    {/* Mini Coffee Bean Icon on top of emblem */}
    <g transform="translate(27.5, 36.8) scale(0.24)">
      <path d="M 10 2 C 5 2, 1 6, 1 12 C 1 18, 6 22, 12 22 C 18 22, 22 17, 22 11 C 22 5, 17 2, 10 2 Z" fill="#FBBF24" />
      <path d="M 4 12 Q 11 11 11 4 Q 11 11 19 12 Q 11 13 11 20 Q 11 13 4 12 Z" fill="#78350F" />
    </g>

    {/* BOLD "COFFEE" Text (High Contrast & 3D Depth) */}
    <text x="30" y="47.2" textAnchor="middle" fill="#011612" fontSize="5.2" fontFamily="'Impact', 'Arial Black', -apple-system, sans-serif" fontWeight="900" letterSpacing="0.8">COFFEE</text>
    <text x="30" y="46.5" textAnchor="middle" fill="#FFFFFF" fontSize="5.2" fontFamily="'Impact', 'Arial Black', -apple-system, sans-serif" fontWeight="900" letterSpacing="0.8">COFFEE</text>

    {/* 3D Takeaway Snap Lid */}
    {/* 1. Undercut Lip */}
    <ellipse cx="30" cy="21.5" rx="19.5" ry="5.2" fill="#090D16" />

    {/* 2. Main Overhanging Lid Rim */}
    <ellipse cx="30" cy="20.5" rx="19.5" ry="5.2" fill="url(#lidRim3D)" />
    
    {/* 3. Rim Specular Highlight (Crisp 3D plastic shine) */}
    <path d="M 11.5 20.2 Q 30 23.8 48.5 20.2" fill="none" stroke="#94A3B8" strokeWidth="1.1" opacity="0.75" />
    
    {/* 4. Recessed Inner Ring / Basin */}
    <ellipse cx="30" cy="18" rx="16.5" ry="4.2" fill="#0F172A" />
    <ellipse cx="30" cy="17" rx="15.5" ry="3.8" fill="url(#lidTop3D)" />

    {/* 5. Elevated 3D Drinking Spout (Mouthpiece) */}
    <path d="M 23 15 C 23 13, 37 13, 37 15 L 36 17 C 36 18.5, 24 18.5, 24 17 Z" fill="#334155" stroke="#475569" strokeWidth="0.5" />
    <ellipse cx="30" cy="14.8" rx="3.5" ry="1.2" fill="#020617" />
    <ellipse cx="30" cy="14.5" rx="3" ry="0.8" fill="#000000" />
    <path d="M 25 15.5 Q 30 16.5 35 15.5" fill="none" stroke="#94A3B8" strokeWidth="0.7" opacity="0.8" />
  </svg>
);

const JuiceBox = () => (
  <svg width="56" height="68" viewBox="0 0 48 58" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: "drop-shadow(0 15px 20px rgba(0,0,0,0.4))" }}>
    <rect x="4" y="10" width="40" height="44" fill="url(#juiceGrad)" rx="4" stroke="#D97706" strokeWidth="1.5"/>
    <rect x="4" y="10" width="40" height="8" fill="#F59E0B" rx="4"/>
    <rect x="4" y="15" width="40" height="3" fill="#D97706" opacity="0.6"/>
    <rect x="8" y="24" width="32" height="22" fill="#7C2D12" rx="3" opacity="0.95"/>
    <circle cx="24" cy="32" r="7" fill="#F59E0B"/>
    <path d="M 24 26 L 26 22" fill="none" stroke="#4ADE80" strokeWidth="2" strokeLinecap="round"/>
    <text x="24" y="43.5" textAnchor="middle" fill="white" fontSize="7" fontFamily="sans-serif" fontWeight="800" letterSpacing="1">JUICE</text>
    <rect x="30" y="2" width="5" height="16" fill="#FFF" rx="2.5" stroke="#FDE68A" strokeWidth="1"/>
    <rect x="6" y="12" width="5" height="40" fill="white" opacity="0.4" rx="2.5"/>
    <defs>
      <linearGradient id="juiceGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#FCD34D"/>
        <stop offset="100%" stopColor="#F59E0B"/>
      </linearGradient>
    </defs>
  </svg>
);

const NoodleCup = () => (
  <svg width="62" height="70" viewBox="0 0 54 60" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: "drop-shadow(0 15px 20px rgba(0,0,0,0.4))" }}>
    <path d="M 6 18 L 10 56 Q 10 58 27 58 Q 44 58 44 56 L 48 18 Z" fill="url(#noodleGrad)"/>
    <path d="M 7 20 L 11 55 Q 11 57 27 57 Q 43 57 43 55 L 47 20 Z" fill="#FFF" stroke="#E2E8F0" strokeWidth="1"/>
    <ellipse cx="27" cy="18" rx="22" ry="7" fill="#EF4444"/>
    <ellipse cx="27" cy="16" rx="18" ry="5" fill="#DC2626"/>
    <path d="M 23 13 Q 25 8 23 3"  fill="none" stroke="#FDE68A" strokeWidth="2" strokeLinecap="round" opacity="0.8"/>
    <path d="M 31 14 Q 33 9 31 4"  fill="none" stroke="#FDE68A" strokeWidth="2" strokeLinecap="round" opacity="0.8"/>
    <rect x="11" y="26" width="32" height="20" fill="#EF4444" rx="3"/>
    <text x="27" y="35" textAnchor="middle" fill="white" fontSize="9" fontFamily="sans-serif" fontWeight="900" letterSpacing="1">RAMEN</text>
    <text x="27" y="44" textAnchor="middle" fill="#FEF2F2" fontSize="6" fontFamily="sans-serif" fontWeight="700">HOT & SPICY</text>
    <path d="M 16 16 Q 22 12 28 16 Q 34 12 40 16" fill="none" stroke="#F59E0B" strokeWidth="2" opacity="0.9"/>
    <path d="M 18 14 Q 24 10 30 14" fill="none" stroke="#F59E0B" strokeWidth="1.5" opacity="0.7"/>
    <rect x="9" y="22" width="5" height="34" fill="white" opacity="0.5" rx="2.5"/>
    <defs>
      <linearGradient id="noodleGrad" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#FECACA"/>
        <stop offset="100%" stopColor="#F87171"/>
      </linearGradient>
    </defs>
  </svg>
);

// ─── Floating Item definitions ────────────────────────────────────────────────

interface FloatItem {
  id: string;
  component: React.ReactNode;
  style: React.CSSProperties;
  floatY: number[];
  floatDuration: number;
  floatDelay: number;
  rotate: number;
  rotateRange: number;
  mobileHidden?: boolean;
}

const ITEMS: FloatItem[] = [
  {
    id: "snack",
    component: <SnackPacket />,
    style: { top: "12%", left: "5%" },
    floatY: [0, -20, 0],
    floatDuration: 5.2,
    floatDelay: 0,
    rotate: -15,
    rotateRange: 8,
  },
  {
    id: "choco",
    component: <ChocolateBar />,
    style: { top: "32%", left: "2%" },
    floatY: [0, -15, 0],
    floatDuration: 6.1,
    floatDelay: 0.8,
    rotate: -25,
    rotateRange: 6,
    mobileHidden: true,
  },
  {
    id: "can",
    component: <SodaCan />,
    style: { top: "15%", right: "6%" },
    floatY: [0, -25, 0],
    floatDuration: 4.8,
    floatDelay: 0.4,
    rotate: 15,
    rotateRange: 10,
  },
  {
    id: "coffee",
    component: <CoffeeCup />,
    style: { top: "35%", right: "3%" },
    floatY: [0, -18, 0],
    floatDuration: 5.6,
    floatDelay: 1.2,
    rotate: 10,
    rotateRange: 5,
    mobileHidden: true,
  },
  {
    id: "water",
    component: <WaterBottle />,
    style: { top: "58%", left: "3.5%" },
    floatY: [0, -22, 0],
    floatDuration: 6.5,
    floatDelay: 0.6,
    rotate: -12,
    rotateRange: 6,
    mobileHidden: true,
  },
  {
    id: "juice",
    component: <JuiceBox />,
    style: { top: "60%", right: "4%" },
    floatY: [0, -20, 0],
    floatDuration: 5.8,
    floatDelay: 1.5,
    rotate: 18,
    rotateRange: 8,
    mobileHidden: true,
  },
  {
    id: "noodles",
    component: <NoodleCup />,
    style: { top: "67%", left: "5%" },
    floatY: [0, -16, 0],
    floatDuration: 7.0,
    floatDelay: 2.0,
    rotate: -8,
    rotateRange: 4,
    mobileHidden: true,
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function FloatingObjects() {
  return (
    <div className="hidden lg:block absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 10 }}>
      {ITEMS.map((item) => (
        <motion.div
          key={item.id}
          className={item.mobileHidden ? "hidden md:block" : "block"}
          style={{
            position: "absolute",
            ...item.style,
            rotate: item.rotate,
          }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{
            opacity: 1,
            scale: 1,
            y: item.floatY,
            rotate: [
              item.rotate,
              item.rotate + item.rotateRange,
              item.rotate - item.rotateRange,
              item.rotate,
            ],
          }}
          transition={{
            opacity: { duration: 1.5, delay: item.floatDelay, ease: "easeOut" },
            scale:   { duration: 1.5, delay: item.floatDelay, type: "spring", bounce: 0.4 },
            y: {
              duration: item.floatDuration,
              repeat: Infinity,
              ease: "easeInOut",
              delay: item.floatDelay,
            },
            rotate: {
              duration: item.floatDuration * 1.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: item.floatDelay,
            },
          }}
        >
          {item.component}
        </motion.div>
      ))}
    </div>
  );
}
