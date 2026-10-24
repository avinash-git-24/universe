"use client";

import { motion } from "framer-motion";
import Image from "next/image";

interface FloatingItem {
  id: string;
  name: string;
  src: string;
  width: number;
  height: number;
  filter: string;
  contrastClass?: string;
  position: React.CSSProperties;
  floatY: number[];
  floatDuration: number;
  floatDelay: number;
  rotate: number;
  rotateRange: number;
}

const ITEMS: FloatingItem[] = [
  // ── Left Side (3 items: Top, Middle, Bottom) ──
  {
    id: "snack",
    name: "Balaji Wafers Crunchex Chilli Tadka",
    src: "/images/products/balaji-crunchex.png",
    width: 68,
    height: 82,
    filter: "drop-shadow(0 20px 26px rgba(0,0,0,0.75)) drop-shadow(0 8px 14px rgba(14,165,233,0.35))",
    contrastClass: "filter contrast-[1.04] brightness-[1.02]",
    position: { top: "24%", left: "4.5%" },
    floatY: [0, -14, 0],
    floatDuration: 5.2,
    floatDelay: 0,
    rotate: -12,
    rotateRange: 6,
  },
  {
    id: "choco",
    name: "Cadbury Dairy Milk",
    src: "/images/products/cadbury-dairy-milk.png",
    width: 84,
    height: 42,
    filter: "drop-shadow(0 20px 26px rgba(0,0,0,0.75)) drop-shadow(0 8px 12px rgba(107,33,168,0.35))",
    contrastClass: "filter contrast-[1.04] brightness-[1.02]",
    position: { top: "52%", left: "2.5%" },
    floatY: [0, -15, 0],
    floatDuration: 6.0,
    floatDelay: 0.8,
    rotate: -18,
    rotateRange: 5,
  },
  {
    id: "lays",
    name: "Lay's American Style Cream & Onion",
    src: "/images/products/lays-cream-onion.png",
    width: 72,
    height: 88,
    filter: "drop-shadow(0 20px 26px rgba(0,0,0,0.75)) drop-shadow(0 8px 14px rgba(34,197,94,0.3))",
    contrastClass: "filter contrast-[1.04] brightness-[1.02]",
    position: { top: "80%", left: "4%" },
    floatY: [0, -15, 0],
    floatDuration: 6.5,
    floatDelay: 0.6,
    rotate: -10,
    rotateRange: 5,
  },

  // ── Right Side (3 items: Top, Middle, Bottom) ──
  {
    id: "can",
    name: "Original Coca-Cola Can",
    src: "/images/products/coca-cola-can.png",
    width: 52,
    height: 98,
    filter: "drop-shadow(0 22px 28px rgba(0,0,0,0.75)) drop-shadow(0 8px 12px rgba(220,38,38,0.3))",
    contrastClass: "filter contrast-[1.05] brightness-[1.02]",
    position: { top: "24%", right: "5%" },
    floatY: [0, -14, 0],
    floatDuration: 4.8,
    floatDelay: 0.4,
    rotate: 14,
    rotateRange: 7,
  },
  {
    id: "amul-chocolate",
    name: "Amul Dark Chocolate Drink",
    src: "/images/products/amul-chocolate.png",
    width: 54,
    height: 112,
    filter: "drop-shadow(0 22px 28px rgba(0,0,0,0.75)) drop-shadow(0 8px 12px rgba(0,0,0,0.45))",
    contrastClass: "filter contrast-[1.04] brightness-[1.01]",
    position: { top: "52%", right: "3%" },
    floatY: [0, -15, 0],
    floatDuration: 5.6,
    floatDelay: 1.2,
    rotate: 8,
    rotateRange: 5,
  },
  {
    id: "noodles",
    name: "Maggi Cuppa Noodles",
    src: "/images/products/maggi-cuppa-noodles.png",
    width: 68,
    height: 82,
    filter: "drop-shadow(0 20px 26px rgba(0,0,0,0.75)) drop-shadow(0 8px 12px rgba(234,179,8,0.25))",
    contrastClass: "filter contrast-[1.04] brightness-[1.02]",
    position: { top: "80%", right: "4.5%" },
    floatY: [0, -15, 0],
    floatDuration: 6.8,
    floatDelay: 1.8,
    rotate: -6,
    rotateRange: 4,
  },
];

export function FloatingObjects() {
  return (
    <div className="hidden lg:block absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 10 }}>
      {ITEMS.map((item) => (
        <motion.div
          key={item.id}
          style={{
            position: "absolute",
            ...item.position,
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
          <div
            className="relative select-none pointer-events-none"
            style={{
              width: `${item.width}px`,
              height: `${item.height}px`,
              filter: item.filter,
            }}
          >
            <Image
              src={item.src}
              alt={item.name}
              width={item.width}
              height={item.height}
              priority
              className={`w-full h-full object-contain ${item.contrastClass || "filter contrast-[1.04] brightness-[1.02]"}`}
            />
          </div>
        </motion.div>
      ))}
    </div>
  );
}
