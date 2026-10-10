"use client";

import { motion } from "framer-motion";
import Image from "next/image";

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
  <div
    className="relative select-none pointer-events-none"
    style={{
      width: "52px",
      height: "98px",
      filter: "drop-shadow(0 22px 28px rgba(0,0,0,0.75)) drop-shadow(0 8px 12px rgba(220,38,38,0.3))",
    }}
  >
    <Image
      src="/images/products/coca-cola-can.png"
      alt="Original Coca-Cola Can"
      width={52}
      height={98}
      priority
      className="w-full h-full object-contain filter contrast-[1.05] brightness-[1.02]"
    />
  </div>
);

const WaterBottle = () => (
  <svg
    width="50"
    height="105"
    viewBox="0 0 40 84"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{
      filter: "drop-shadow(0 20px 25px rgba(0,0,0,0.65)) drop-shadow(0 8px 14px rgba(2,132,199,0.35))",
    }}
  >
    <defs>
      {/* MASTER BOTTLE BODY CLIP PATH: Prevents any highlight or line from leaking outside! */}
      <clipPath id="bodyClip">
        <path d="M 16.5 19.4 Q 12 23.5 8.2 28.5 L 8.8 73.5 Q 20 77.5 31.2 73.5 L 31.8 28.5 Q 28 23.5 23.5 19.4 Z" />
      </clipPath>

      {/* Glassy PET Plastic Outer Shell Gradient */}
      <linearGradient id="petGrad" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.45" />
        <stop offset="14%" stopColor="#BAE6FD" stopOpacity="0.3" />
        <stop offset="28%" stopColor="#FFFFFF" stopOpacity="0.85" />
        <stop offset="45%" stopColor="#E0F2FE" stopOpacity="0.1" />
        <stop offset="70%" stopColor="#0284C7" stopOpacity="0.1" />
        <stop offset="88%" stopColor="#7DD3FC" stopOpacity="0.4" />
        <stop offset="100%" stopColor="#0369A1" stopOpacity="0.65" />
      </linearGradient>

      {/* Pure Sparkling Water Fill */}
      <linearGradient id="waterGrad" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#0284C7" stopOpacity="0.35" />
        <stop offset="25%" stopColor="#38BDF8" stopOpacity="0.2" />
        <stop offset="50%" stopColor="#BAE6FD" stopOpacity="0.1" />
        <stop offset="75%" stopColor="#0EA5E9" stopOpacity="0.25" />
        <stop offset="100%" stopColor="#075985" stopOpacity="0.45" />
      </linearGradient>

      {/* Deep Glacier Blue Label */}
      <linearGradient id="labelGrad" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#0284C7" />
        <stop offset="20%" stopColor="#0EA5E9" />
        <stop offset="50%" stopColor="#38BDF8" />
        <stop offset="80%" stopColor="#0EA5E9" />
        <stop offset="100%" stopColor="#0369A1" />
      </linearGradient>

      {/* Silver Foil Trim Borders */}
      <linearGradient id="foilGrad" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#94A3B8" />
        <stop offset="25%" stopColor="#FFFFFF" />
        <stop offset="50%" stopColor="#CBD5E1" />
        <stop offset="75%" stopColor="#FFFFFF" />
        <stop offset="100%" stopColor="#64748B" />
      </linearGradient>

      {/* 3D Cyan Screw Cap */}
      <linearGradient id="capGrad" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#0284C7" />
        <stop offset="25%" stopColor="#0EA5E9" />
        <stop offset="50%" stopColor="#38BDF8" />
        <stop offset="78%" stopColor="#0284C7" />
        <stop offset="100%" stopColor="#0369A1" />
      </linearGradient>
    </defs>

    {/* Floor Drop Shadow */}
    <ellipse cx="20" cy="80.5" rx="12" ry="2.5" fill="#000000" opacity="0.6" />

    {/* Molded Petaloid Base Feet */}
    <path d="M 8.8 73.5 L 9.8 78 Q 20 81 30.2 78 L 31.2 73.5 Z" fill="#0284C7" opacity="0.5" stroke="#38BDF8" strokeWidth="0.4" />
    <ellipse cx="20" cy="77.8" rx="8.5" ry="1.6" fill="#075985" opacity="0.8" />
    <ellipse cx="20" cy="77.4" rx="5" ry="0.9" fill="#E0F2FE" opacity="0.7" />

    {/* ── CLIPPED BODY CONTENT (GUARANTEED NO SPILLS) ── */}
    <g clipPath="url(#bodyClip)">
      {/* Outer Glassy Bottle Shell */}
      <rect x="0" y="0" width="40" height="84" fill="url(#petGrad)" stroke="#38BDF8" strokeWidth="0.6" />

      {/* Water Liquid Volume (Filled to 85% shoulder) */}
      <rect x="0" y="27" width="40" height="57" fill="url(#waterGrad)" />

      {/* Water Meniscus (Curved Surface) */}
      <ellipse cx="20" cy="27" rx="11.8" ry="2" fill="#7DD3FC" opacity="0.45" />
      <ellipse cx="20" cy="26.8" rx="9.5" ry="1.4" fill="#F0F9FF" opacity="0.8" />
      <path d="M 7 27 Q 20 29.2 33 27" fill="none" stroke="#FFFFFF" strokeWidth="0.65" opacity="0.95" />

      {/* Molded Grip Reinforcement Ribs */}
      <path d="M 7 31.5 Q 20 33.8 33 31.5" fill="none" stroke="#FFFFFF" strokeWidth="0.45" opacity="0.6" />
      <path d="M 7 34.5 Q 20 36.8 33 34.5" fill="none" stroke="#FFFFFF" strokeWidth="0.4" opacity="0.5" />
      <path d="M 7 58 Q 20 60.5 33 58" fill="none" stroke="#FFFFFF" strokeWidth="0.45" opacity="0.5" />
      <path d="M 7 62 Q 20 64.5 33 62" fill="none" stroke="#FFFFFF" strokeWidth="0.4" opacity="0.45" />
      <path d="M 7 66 Q 20 68.5 33 66" fill="none" stroke="#FFFFFF" strokeWidth="0.35" opacity="0.4" />

      {/* Sparkling Micro Air Bubbles */}
      <circle cx="15" cy="70" r="0.55" fill="#FFFFFF" opacity="0.85" />
      <circle cx="25" cy="64" r="0.5" fill="#FFFFFF" opacity="0.8" />
      <circle cx="16" cy="30" r="0.45" fill="#FFFFFF" opacity="0.75" />

      {/* ── WRAPAROUND MINERAL WATER LABEL ── */}
      {/* Label Base */}
      <path d="M 7 37.5 L 7.5 54 Q 20 56.5 32.5 54 L 33 37.5 Q 20 40 7 37.5 Z" fill="url(#labelGrad)" stroke="#0284C7" strokeWidth="0.4" />
      {/* Silver Foil Accent Borders */}
      <path d="M 7 38.2 Q 20 40.7 33 38.2" fill="none" stroke="url(#foilGrad)" strokeWidth="0.65" />
      <path d="M 7.5 53.3 Q 20 55.8 32.5 53.3" fill="none" stroke="url(#foilGrad)" strokeWidth="0.65" />

      {/* Alpine Crest Emblem */}
      <g transform="translate(20, 41.2)">
        <polygon points="-4.2,2.4 -2,-0.8 -0.3,2.4" fill="#38BDF8" opacity="0.9" />
        <polygon points="-2.2,2.4 0,-2.4 2.2,2.4" fill="#FFFFFF" />
        <polygon points="0.3,2.4 2,-0.6 4.2,2.4" fill="#7DD3FC" opacity="0.9" />
      </g>

      {/* Bold Razor-Sharp "AQUA" Wordmark */}
      <text x="20" y="47.2" textAnchor="middle" fill="#082F49" fontSize="5.2" fontFamily="'Impact', 'Arial Black', -apple-system, sans-serif" fontWeight="900" letterSpacing="1.2">AQUA</text>
      <text x="20" y="46.7" textAnchor="middle" fill="#FFFFFF" fontSize="5.2" fontFamily="'Impact', 'Arial Black', -apple-system, sans-serif" fontWeight="900" letterSpacing="1.2">AQUA</text>

      {/* Clean Compact Subtitle (No overflow!) */}
      <text x="20" y="50.4" textAnchor="middle" fill="#BAE6FD" fontSize="1.8" fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Inter, sans-serif" fontWeight="800" letterSpacing="0.8">PURE WATER</text>

      {/* Specular Gloss Reflections (Shoulder Highlight: stops at label y=37.5) */}
      <path d="M 16.5 19.4 Q 12 23.5 9.5 28.5 L 10 37.5 L 11.8 37.5 L 11.2 28.5 Q 13.5 23.5 17.5 19.4 Z" fill="#FFFFFF" opacity="0.8" />
      <path d="M 16.8 19.8 Q 12.5 23.8 10.3 28.5 L 10.7 37 Q 11.2 37.2 11.5 37 L 11.0 28.5 Q 13.5 23.8 17.5 19.8 Z" fill="#FFFFFF" opacity="0.95" />

      {/* Specular Gloss Reflections (Lower Body Highlight: starts at y=54) */}
      <path d="M 10 54 L 10.8 73.5 L 12.5 73.5 L 11.8 54 Z" fill="#FFFFFF" opacity="0.8" />
      <path d="M 10.6 54.5 L 11.2 73 L 12.0 73 L 11.5 54.5 Z" fill="#FFFFFF" opacity="0.95" />

      {/* Soft Satin Sheen on Label (Gentle, does not hide letters) */}
      <path d="M 10.2 38 L 10.5 53.5 L 11.8 53.5 L 11.5 38 Z" fill="#FFFFFF" opacity="0.16" />

      {/* Right Rim Highlight */}
      <path d="M 29.5 28.5 L 29 73.5 L 30.5 73.5 L 31 28.5 Z" fill="#FFFFFF" opacity="0.25" />

      {/* Chilled Condensation Water Droplets */}
      <ellipse cx="9.5" cy="25" rx="0.4" ry="0.8" fill="#FFFFFF" opacity="0.95" />
      <circle cx="9.2" cy="62" r="0.5" fill="#FFFFFF" opacity="0.9" />
      <circle cx="30.5" cy="66" r="0.45" fill="#FFFFFF" opacity="0.85" />
    </g>

    {/* Bottle Outer Stroke Ring */}
    <path d="M 16.5 19.4 Q 12 23.5 8.2 28.5 L 8.8 73.5 Q 20 77.5 31.2 73.5 L 31.8 28.5 Q 28 23.5 23.5 19.4 Z" fill="none" stroke="#38BDF8" strokeWidth="0.55" />

    {/* Transparent Threaded Neck */}
    <rect x="16.5" y="13.2" width="7" height="5.2" fill="url(#petGrad)" stroke="#38BDF8" strokeWidth="0.4" />
    <line x1="17" y1="14.6" x2="23" y2="15.2" stroke="#FFFFFF" strokeWidth="0.35" opacity="0.8" />
    <line x1="17" y1="16.4" x2="23" y2="17.0" stroke="#FFFFFF" strokeWidth="0.35" opacity="0.8" />

    {/* Support Ledge Collar Ring */}
    <rect x="15.5" y="18.2" width="9" height="1.4" rx="0.35" fill="#BAE6FD" stroke="#0284C7" strokeWidth="0.35" />
    <ellipse cx="20" cy="18.6" rx="4" ry="0.35" fill="#FFFFFF" opacity="0.9" />

    {/* Tamper-Evident Security Break-Ring */}
    <rect x="16" y="12.2" width="8" height="1.3" rx="0.35" fill="url(#capGrad)" stroke="#0284C7" strokeWidth="0.35" />
    <line x1="16.5" y1="12.8" x2="23.5" y2="12.8" stroke="#075985" strokeWidth="0.25" strokeDasharray="0.8 0.8" />

    {/* 3D Cyan Screw Cap Body (Compact & Proportional) */}
    <rect x="15.5" y="7" width="9" height="5.2" rx="1.2" fill="url(#capGrad)" stroke="#0284C7" strokeWidth="0.45" />

    {/* Fine Vertical Knurling Lines on Cap */}
    <line x1="16.8" y1="7.5" x2="16.8" y2="12.0" stroke="#FFFFFF" strokeWidth="0.35" opacity="0.5" />
    <line x1="18.2" y1="7.5" x2="18.2" y2="12.0" stroke="#FFFFFF" strokeWidth="0.5" opacity="0.8" />
    <line x1="19.6" y1="7.5" x2="19.6" y2="12.0" stroke="#FFFFFF" strokeWidth="0.55" opacity="0.95" />
    <line x1="21.0" y1="7.5" x2="21.0" y2="12.0" stroke="#FFFFFF" strokeWidth="0.5" opacity="0.75" />
    <line x1="22.4" y1="7.5" x2="22.4" y2="12.0" stroke="#075985" strokeWidth="0.35" opacity="0.6" />

    {/* Cap Crown & Top Bevel */}
    <ellipse cx="20" cy="7.3" rx="4.5" ry="1.2" fill="#38BDF8" stroke="#0284C7" strokeWidth="0.25" />
    <ellipse cx="20" cy="7.1" rx="3.6" ry="0.8" fill="#BAE6FD" opacity="0.9" />
  </svg>
);

const AmulDarkChocolate = () => (
  <div
    className="relative select-none pointer-events-none"
    style={{
      width: "54px",
      height: "112px",
      filter: "drop-shadow(0 22px 28px rgba(0,0,0,0.75)) drop-shadow(0 8px 12px rgba(0,0,0,0.45))",
    }}
  >
    <Image
      src="/images/products/amul-chocolate.png"
      alt="Amul Dark Chocolate Drink"
      width={54}
      height={112}
      priority
      className="w-full h-full object-contain filter contrast-[1.04] brightness-[1.01]"
    />
  </div>
);

const _JuiceBox = () => (
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
  // ── Left Side (3 items: Top, Middle, Bottom) ──
  {
    id: "snack",
    component: <SnackPacket />,
    style: { top: "14%", left: "4.5%" },
    floatY: [0, -18, 0],
    floatDuration: 5.2,
    floatDelay: 0,
    rotate: -12,
    rotateRange: 6,
  },
  {
    id: "choco",
    component: <ChocolateBar />,
    style: { top: "45%", left: "2.5%" },
    floatY: [0, -16, 0],
    floatDuration: 6.0,
    floatDelay: 0.8,
    rotate: -18,
    rotateRange: 5,
    mobileHidden: true,
  },
  {
    id: "water",
    component: <WaterBottle />,
    style: { top: "75%", left: "4%" },
    floatY: [0, -18, 0],
    floatDuration: 6.5,
    floatDelay: 0.6,
    rotate: -10,
    rotateRange: 5,
    mobileHidden: true,
  },

  // ── Right Side (3 items: Top, Middle, Bottom) ──
  {
    id: "can",
    component: <SodaCan />,
    style: { top: "14%", right: "5%" },
    floatY: [0, -20, 0],
    floatDuration: 4.8,
    floatDelay: 0.4,
    rotate: 14,
    rotateRange: 7,
  },
  {
    id: "amul-chocolate",
    component: <AmulDarkChocolate />,
    style: { top: "45%", right: "3%" },
    floatY: [0, -16, 0],
    floatDuration: 5.6,
    floatDelay: 1.2,
    rotate: 8,
    rotateRange: 5,
    mobileHidden: true,
  },
  {
    id: "noodles",
    component: <NoodleCup />,
    style: { top: "75%", right: "4.5%" },
    floatY: [0, -16, 0],
    floatDuration: 6.8,
    floatDelay: 1.8,
    rotate: -6,
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
