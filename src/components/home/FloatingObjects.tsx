"use client";

/**
 * UniVerse — Floating Product Objects
 *
 * Ambient floating items around the hero section.
 * Premium SVG illustrations of snack/drink items.
 * All Framer Motion — performant RAF-based animations.
 */

import { motion } from "framer-motion";

// ─── Individual product SVGs ──────────────────────────────────────────────────

const SnackPacket = () => (
  <svg width="52" height="64" viewBox="0 0 52 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Bag body */}
    <rect x="6" y="14" width="40" height="44" fill="#FFF7ED" rx="6" stroke="#E8D5B7" strokeWidth="1.5"/>
    {/* Crimp top */}
    <path d="M 6 14 Q 26 8 46 14" fill="#F0E0C0" stroke="#D4C090" strokeWidth="1"/>
    <path d="M 8 16 Q 26 10 44 16" fill="#F8EDD4" stroke="none"/>
    {/* Brand stripe */}
    <rect x="6" y="28" width="40" height="16" fill="#10B981" opacity="0.15"/>
    {/* Label area */}
    <rect x="12" y="32" width="28" height="8" fill="#10B981" rx="4" opacity="0.8"/>
    <text x="26" y="39.5" textAnchor="middle" fill="white" fontSize="7" fontFamily="sans-serif" fontWeight="700">SNACK</text>
    {/* Shine */}
    <rect x="8" y="16" width="6" height="38" fill="white" opacity="0.25" rx="3"/>
    {/* Crimp bottom */}
    <path d="M 8 56 Q 26 62 44 56" fill="#E8D5B7" stroke="none"/>
  </svg>
);

const ChocolateBar = () => (
  <svg width="56" height="44" viewBox="0 0 56 44" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Wrapper */}
    <rect x="2" y="4" width="52" height="36" fill="#FFF7ED" rx="5" stroke="#E8D5B7" strokeWidth="1.5"/>
    {/* Wrapper fold */}
    <rect x="2" y="4" width="52" height="8" fill="#F0E0C0" rx="5"/>
    <rect x="2" y="12" width="52" height="2" fill="#E0C8A0"/>
    {/* Chocolate squares */}
    {[0,1,2,3].map(col =>
      [0,1].map(row => (
        <rect
          key={`${col}-${row}`}
          x={8 + col * 11} y={18 + row * 10}
          width="9" height="8"
          fill="#7B4F28" rx="1.5" opacity="0.85"
        />
      ))
    )}
    {/* Shine on wrapper */}
    <rect x="4" y="6" width="5" height="32" fill="white" opacity="0.3" rx="2.5"/>
    {/* Brand text */}
    <text x="28" y="11.5" textAnchor="middle" fill="#8B6020" fontSize="6" fontFamily="sans-serif" fontWeight="700">CHOCO</text>
  </svg>
);

const SodaCan = () => (
  <svg width="38" height="62" viewBox="0 0 38 62" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Can body */}
    <rect x="4" y="10" width="30" height="46" fill="#10B981" rx="4"/>
    {/* Top cap */}
    <ellipse cx="19" cy="10" rx="15" ry="5" fill="#0D9668"/>
    {/* Top ring */}
    <ellipse cx="19" cy="10" rx="8" ry="3" fill="#0B8058" stroke="#0A6844" strokeWidth="0.5"/>
    {/* Pull tab */}
    <rect x="17" y="5" width="5" height="7" fill="#C8C8C8" rx="1"/>
    {/* Bottom cap */}
    <ellipse cx="19" cy="56" rx="15" ry="5" fill="#0D9668"/>
    {/* Label stripe */}
    <rect x="4" y="22" width="30" height="22" fill="#0B8058" opacity="0.4"/>
    {/* Label text */}
    <text x="19" y="31" textAnchor="middle" fill="white" fontSize="10" fontFamily="sans-serif" fontWeight="800">UV</text>
    <text x="19" y="41" textAnchor="middle" fill="white" fontSize="6" fontFamily="sans-serif" fontWeight="500" opacity="0.9">REFRESH</text>
    {/* Can shine */}
    <rect x="5" y="12" width="6" height="42" fill="white" opacity="0.18" rx="3"/>
    <rect x="26" y="12" width="3" height="42" fill="white" opacity="0.1" rx="1.5"/>
  </svg>
);

const WaterBottle = () => (
  <svg width="34" height="72" viewBox="0 0 34 72" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Bottle neck */}
    <rect x="11" y="6" width="12" height="14" fill="#E8F8F2" rx="3" stroke="#C0E8D8" strokeWidth="1"/>
    {/* Cap */}
    <rect x="10" y="2" width="14" height="8" fill="#10B981" rx="3"/>
    {/* Bottle body */}
    <path d="M 8 20 Q 4 24 4 30 L 4 60 Q 4 66 17 66 Q 30 66 30 60 L 30 30 Q 30 24 26 20 Z"
          fill="#E8F8F2" stroke="#C0E8D8" strokeWidth="1.5"/>
    {/* Water level */}
    <path d="M 5 45 Q 8 43 17 44 Q 26 43 29 45 L 30 60 Q 30 66 17 66 Q 4 66 4 60 Z"
          fill="#A8DCCC" opacity="0.45"/>
    {/* Ripple */}
    <path d="M 6 44 Q 17 40 28 44" fill="none" stroke="white" strokeWidth="1" opacity="0.6"/>
    {/* Shine */}
    <rect x="7" y="22" width="5" height="40" fill="white" opacity="0.35" rx="2.5"/>
    {/* Label */}
    <rect x="8" y="30" width="18" height="16" fill="white" opacity="0.5" rx="2"/>
    <text x="17" y="40.5" textAnchor="middle" fill="#10B981" fontSize="8" fontFamily="sans-serif" fontWeight="700">H₂O</text>
  </svg>
);

const CoffeeCup = () => (
  <svg width="52" height="60" viewBox="0 0 52 60" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Steam lines */}
    <path d="M 18 10 Q 20 5 18 0" fill="none" stroke="#D4B896" strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
    <path d="M 26 12 Q 28 7 26 2"  fill="none" stroke="#D4B896" strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
    <path d="M 34 10 Q 36 5 34 0"  fill="none" stroke="#D4B896" strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
    {/* Cup sleeve */}
    <path d="M 8 22 L 12 58 Q 12 60 26 60 Q 40 60 40 58 L 44 22 Z" fill="#7B4F28"/>
    {/* Cup body */}
    <path d="M 10 18 L 14 58 Q 14 60 26 60 Q 38 60 38 58 L 42 18 Z" fill="#F5EBD8"/>
    {/* Lid */}
    <ellipse cx="26" cy="18" rx="17" ry="6" fill="#E8D5B7"/>
    <ellipse cx="26" cy="16" rx="13" ry="4" fill="#F5EBD8"/>
    {/* Sip hole */}
    <rect x="21" y="13" width="10" height="4" fill="#C8A870" rx="2"/>
    {/* Handle */}
    <path d="M 42 28 Q 52 28 52 36 Q 52 44 42 44" fill="none" stroke="#E8D5B7" strokeWidth="4" strokeLinecap="round"/>
    {/* Brand on sleeve */}
    <text x="26" y="40" textAnchor="middle" fill="white" fontSize="8" fontFamily="sans-serif" fontWeight="700" opacity="0.9">UV</text>
    {/* Shine */}
    <rect x="12" y="22" width="5" height="34" fill="white" opacity="0.25" rx="2.5"/>
  </svg>
);

const JuiceBox = () => (
  <svg width="48" height="58" viewBox="0 0 48 58" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Main box */}
    <rect x="4" y="10" width="40" height="44" fill="#FEF3C7" rx="4" stroke="#FDE68A" strokeWidth="1.5"/>
    {/* Top fold */}
    <rect x="4" y="10" width="40" height="8" fill="#FDE68A" rx="4"/>
    <rect x="4" y="15" width="40" height="3" fill="#FCD34D" opacity="0.5"/>
    {/* Front label */}
    <rect x="8" y="24" width="32" height="22" fill="#F59E0B" rx="3" opacity="0.9"/>
    {/* Orange/fruit graphic (simplified) */}
    <circle cx="24" cy="32" r="7" fill="#FFA525" opacity="0.85"/>
    <path d="M 24 26 L 26 22" fill="none" stroke="#5D8A00" strokeWidth="1.5" strokeLinecap="round"/>
    {/* Label text */}
    <text x="24" y="43.5" textAnchor="middle" fill="white" fontSize="7" fontFamily="sans-serif" fontWeight="700">JUICE</text>
    {/* Straw */}
    <rect x="30" y="2" width="5" height="16" fill="#FFF" rx="2.5" stroke="#FDE68A" strokeWidth="1"/>
    {/* Shine */}
    <rect x="6" y="12" width="5" height="40" fill="white" opacity="0.3" rx="2.5"/>
  </svg>
);

const NoodleCup = () => (
  <svg width="54" height="60" viewBox="0 0 54 60" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Cup body (trapezoidal) */}
    <path d="M 6 18 L 10 56 Q 10 58 27 58 Q 44 58 44 56 L 48 18 Z" fill="#FFF7ED"/>
    <path d="M 7 20 L 11 55 Q 11 57 27 57 Q 43 57 43 55 L 47 20 Z" fill="#FFFDF9" stroke="#F0E0C8" strokeWidth="1"/>
    {/* Lid */}
    <ellipse cx="27" cy="18" rx="22" ry="7" fill="#E8D5B7"/>
    <ellipse cx="27" cy="16" rx="18" ry="5" fill="#F5EAD4"/>
    {/* Steam vent */}
    <path d="M 23 13 Q 25 8 23 3"  fill="none" stroke="#D4B896" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
    <path d="M 31 14 Q 33 9 31 4"  fill="none" stroke="#D4B896" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
    {/* Label */}
    <rect x="11" y="26" width="32" height="20" fill="#F59E0B" opacity="0.15" rx="3"/>
    <text x="27" y="35" textAnchor="middle" fill="#B45309" fontSize="9" fontFamily="sans-serif" fontWeight="700">NOODLES</text>
    <text x="27" y="44" textAnchor="middle" fill="#B45309" fontSize="7" fontFamily="sans-serif" fontWeight="500">HOT CUP</text>
    {/* Noodle lines peeking from top */}
    <path d="M 16 16 Q 22 12 28 16 Q 34 12 40 16" fill="none" stroke="#D4A060" strokeWidth="1.5" opacity="0.7"/>
    <path d="M 18 14 Q 24 10 30 14" fill="none" stroke="#D4A060" strokeWidth="1.2" opacity="0.5"/>
    {/* Shine */}
    <rect x="9" y="22" width="5" height="34" fill="white" opacity="0.3" rx="2.5"/>
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
    style: { top: "12%", left: "3%" },
    floatY: [0, -14, 0],
    floatDuration: 4.2,
    floatDelay: 0,
    rotate: -15,
    rotateRange: 4,
  },
  {
    id: "choco",
    component: <ChocolateBar />,
    style: { top: "28%", left: "1.5%" },
    floatY: [0, -10, 0],
    floatDuration: 5.1,
    floatDelay: 0.8,
    rotate: -22,
    rotateRange: 3,
    mobileHidden: true,
  },
  {
    id: "can",
    component: <SodaCan />,
    style: { top: "10%", right: "3%" },
    floatY: [0, -16, 0],
    floatDuration: 3.8,
    floatDelay: 0.4,
    rotate: 12,
    rotateRange: 5,
  },
  {
    id: "coffee",
    component: <CoffeeCup />,
    style: { top: "30%", right: "2%" },
    floatY: [0, -12, 0],
    floatDuration: 4.6,
    floatDelay: 1.2,
    rotate: 8,
    rotateRange: 3,
    mobileHidden: true,
  },
  {
    id: "water",
    component: <WaterBottle />,
    style: { top: "52%", left: "2.5%" },
    floatY: [0, -18, 0],
    floatDuration: 5.5,
    floatDelay: 0.6,
    rotate: -8,
    rotateRange: 4,
    mobileHidden: true,
  },
  {
    id: "juice",
    component: <JuiceBox />,
    style: { top: "50%", right: "2%" },
    floatY: [0, -14, 0],
    floatDuration: 4.8,
    floatDelay: 1.5,
    rotate: 14,
    rotateRange: 3,
    mobileHidden: true,
  },
  {
    id: "noodles",
    component: <NoodleCup />,
    style: { top: "68%", left: "4%" },
    floatY: [0, -10, 0],
    floatDuration: 6.0,
    floatDelay: 2.0,
    rotate: -5,
    rotateRange: 2,
    mobileHidden: true,
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function FloatingObjects() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {ITEMS.map((item) => (
        <motion.div
          key={item.id}
          className={item.mobileHidden ? "hidden md:block" : "block"}
          style={{
            position: "absolute",
            ...item.style,
            rotate: item.rotate,
            filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.28))",
            zIndex: 5,
          }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{
            opacity: [0, 0.82, 0.82],
            scale: [0.8, 1, 1],
            y: item.floatY,
            rotate: [
              item.rotate,
              item.rotate + item.rotateRange,
              item.rotate - item.rotateRange,
              item.rotate,
            ],
          }}
          transition={{
            opacity: { duration: 1.2, delay: item.floatDelay },
            scale:   { duration: 1.0, delay: item.floatDelay },
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
