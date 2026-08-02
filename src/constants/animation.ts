/**
 * UniVerse — Framer Motion Animation Variants
 *
 * Centralized animation library. Import variants directly into components.
 * All timings align with our transition token system.
 */

import type { Variants, Transition } from "framer-motion";

// ─── Shared Transitions ───────────────────────────────────────────────────────

export const transitions = {
  fast: { duration: 0.1, ease: "easeOut" } satisfies Transition,
  base: { duration: 0.15, ease: "easeOut" } satisfies Transition,
  slow: { duration: 0.25, ease: "easeOut" } satisfies Transition,
  spring: {
    type: "spring",
    stiffness: 300,
    damping: 30,
    mass: 0.8,
  } satisfies Transition,
  springBouncy: {
    type: "spring",
    stiffness: 400,
    damping: 25,
    mass: 0.8,
  } satisfies Transition,
  smooth: {
    duration: 0.3,
    ease: [0.4, 0, 0.2, 1],
  } satisfies Transition,
} as const;

// ─── Fade Variants ────────────────────────────────────────────────────────────

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: transitions.base,
  },
  exit: {
    opacity: 0,
    transition: transitions.fast,
  },
};

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: transitions.slow,
  },
  exit: {
    opacity: 0,
    y: 8,
    transition: transitions.fast,
  },
};

export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: transitions.slow,
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: transitions.fast,
  },
};

// ─── Scale Variants ───────────────────────────────────────────────────────────

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: transitions.spring,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: transitions.fast,
  },
};

export const scaleInCenter: Variants = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: transitions.springBouncy,
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    transition: transitions.fast,
  },
};

// ─── Slide Variants ───────────────────────────────────────────────────────────

export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -24 },
  visible: {
    opacity: 1,
    x: 0,
    transition: transitions.smooth,
  },
  exit: {
    opacity: 0,
    x: -16,
    transition: transitions.fast,
  },
};

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 24 },
  visible: {
    opacity: 1,
    x: 0,
    transition: transitions.smooth,
  },
  exit: {
    opacity: 0,
    x: 16,
    transition: transitions.fast,
  },
};

// ─── Modal / Overlay Variants ─────────────────────────────────────────────────

export const overlayVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.2, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.15, ease: "easeIn" },
  },
};

export const modalVariants: Variants = {
  hidden: { opacity: 0, scale: 0.94, y: 16 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: transitions.spring,
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    y: 8,
    transition: { duration: 0.15, ease: "easeIn" },
  },
};

export const drawerVariants: Variants = {
  hidden: { opacity: 0, y: "100%" },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 350, damping: 35 },
  },
  exit: {
    opacity: 0,
    y: "100%",
    transition: { duration: 0.2, ease: "easeIn" },
  },
};

// ─── List / Stagger Variants ──────────────────────────────────────────────────

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.05,
    },
  },
};

export const staggerContainerFast: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.04,
    },
  },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: transitions.slow,
  },
};

// ─── Card / Interactive Hover ─────────────────────────────────────────────────

export const cardHover = {
  rest: { y: 0, boxShadow: "var(--shadow-sm)" },
  hover: {
    y: -3,
    boxShadow: "var(--shadow-lg)",
    transition: transitions.spring,
  },
} as const;

export const buttonTap = {
  tap: { scale: 0.97 },
} as const;

// ─── Status Badge Pulse ───────────────────────────────────────────────────────

export const pulseDot: Variants = {
  animate: {
    scale: [1, 1.3, 1],
    opacity: [1, 0.6, 1],
    transition: {
      duration: 1.8,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

// ─── Page Transition ──────────────────────────────────────────────────────────

export const pageVariants: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.15 },
  },
};
