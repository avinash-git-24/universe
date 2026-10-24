"use client";

import { motion } from "framer-motion";
import Image from "next/image";

// ─── Individual product SVGs ──────────────────────────────────────────────────

const SnackPacket = () => (
  <div
    className="relative select-none pointer-events-none"
    style={{
      width: "68px",
      height: "82px",
      filter: "drop-shadow(0 20px 26px rgba(0,0,0,0.75)) drop-shadow(0 8px 14px rgba(14,165,233,0.35))",
    }}
  >
    <Image
      src="/images/products/balaji-crunchex.png"
      alt="Balaji Wafers Crunchex Chilli Tadka"
      width={68}
      height={82}
      priority
      className="w-full h-full object-contain filter contrast-[1.04] brightness-[1.02]"
    />
  </div>
);



const ChocolateBar = () => (
  <div
    className="relative select-none pointer-events-none"
    style={{
      width: "84px",
      height: "42px",
      filter: "drop-shadow(0 20px 26px rgba(0,0,0,0.75)) drop-shadow(0 8px 12px rgba(107,33,168,0.35))",
    }}
  >
    <Image
      src="/images/products/cadbury-dairy-milk.png"
      alt="Cadbury Dairy Milk"
      width={84}
      height={42}
      priority
      className="w-full h-full object-contain filter contrast-[1.04] brightness-[1.02]"
    />
  </div>
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

// ─── Individual product images ────────────────────────────────────────────────

const OreoBiscuit = () => (
  <div
    className="relative select-none pointer-events-none"
    style={{
      width: "82px",
      height: "44px",
      filter: "drop-shadow(0 20px 26px rgba(0,0,0,0.75)) drop-shadow(0 8px 14px rgba(37,99,235,0.35))",
    }}
  >
    <Image
      src="/products/oreo-vanilla-biscuit.webp"
      alt="Oreo Vanilla Sandwich Biscuit"
      width={82}
      height={44}
      priority
      className="w-full h-full object-contain filter contrast-[1.05] brightness-[1.02]"
    />
  </div>
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

const NoodleCup = () => (
  <div
    className="relative select-none pointer-events-none"
    style={{
      width: "68px",
      height: "82px",
      filter: "drop-shadow(0 20px 26px rgba(0,0,0,0.75)) drop-shadow(0 8px 12px rgba(234,179,8,0.25))",
    }}
  >
    <Image
      src="/images/products/maggi-cuppa-noodles.png"
      alt="Maggi Cuppa Noodles"
      width={68}
      height={82}
      priority
      className="w-full h-full object-contain filter contrast-[1.04] brightness-[1.02]"
    />
  </div>
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
}

const ITEMS: FloatItem[] = [
  // ── Left Side (3 items: Top, Middle, Bottom) ──
  {
    id: "snack",
    component: <SnackPacket />,
    style: { top: "24%", left: "4.5%" },
    floatY: [0, -14, 0],
    floatDuration: 5.2,
    floatDelay: 0,
    rotate: -12,
    rotateRange: 6,
  },
  {
    id: "choco",
    component: <ChocolateBar />,
    style: { top: "52%", left: "2.5%" },
    floatY: [0, -15, 0],
    floatDuration: 6.0,
    floatDelay: 0.8,
    rotate: -18,
    rotateRange: 5,
  },
  {
    id: "oreo",
    component: <OreoBiscuit />,
    style: { top: "80%", left: "4%" },
    floatY: [0, -15, 0],
    floatDuration: 6.5,
    floatDelay: 0.6,
    rotate: -10,
    rotateRange: 5,
  },

  // ── Right Side (3 items: Top, Middle, Bottom) ──
  {
    id: "can",
    component: <SodaCan />,
    style: { top: "24%", right: "5%" },
    floatY: [0, -14, 0],
    floatDuration: 4.8,
    floatDelay: 0.4,
    rotate: 14,
    rotateRange: 7,
  },
  {
    id: "amul-chocolate",
    component: <AmulDarkChocolate />,
    style: { top: "52%", right: "3%" },
    floatY: [0, -15, 0],
    floatDuration: 5.6,
    floatDelay: 1.2,
    rotate: 8,
    rotateRange: 5,
  },
  {
    id: "noodles",
    component: <NoodleCup />,
    style: { top: "80%", right: "4.5%" },
    floatY: [0, -15, 0],
    floatDuration: 6.8,
    floatDelay: 1.8,
    rotate: -6,
    rotateRange: 4,
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function FloatingObjects() {
  return (
    <div className="hidden lg:block absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 10 }}>
      {ITEMS.map((item) => (
        <motion.div
          key={item.id}
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
            scale: { duration: 1.5, delay: item.floatDelay, type: "spring", bounce: 0.4 },
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
