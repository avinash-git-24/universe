"use client";

/**
 * UniVerse — AnimatedWrapper
 *
 * Drop-in Framer Motion wrapper for applying named animation variants
 * to any child element. Use this instead of writing motion.div inline.
 */

import * as React from "react";
import { motion, type Variants, type HTMLMotionProps } from "framer-motion";
import {
  fadeIn,
  fadeInUp,
  fadeInDown,
  scaleIn,
  scaleInCenter,
  slideInLeft,
  slideInRight,
  staggerContainer,
  staggerItem,
} from "@/constants/animation";

// ─── Animation name map ───────────────────────────────────────────────────────

const VARIANT_MAP: Record<string, Variants> = {
  fadeIn,
  fadeInUp,
  fadeInDown,
  scaleIn,
  scaleInCenter,
  slideInLeft,
  slideInRight,
  staggerContainer,
  staggerItem,
} as const;

export type AnimationName = keyof typeof VARIANT_MAP;

// ─── Props ────────────────────────────────────────────────────────────────────

export interface AnimatedWrapperProps
  extends Omit<HTMLMotionProps<"div">, "variants" | "initial" | "animate" | "exit"> {
  /** Named animation preset */
  animation?: AnimationName;
  /** Custom variants (overrides animation preset) */
  variants?: Variants;
  /** Delay before animation starts (seconds) */
  delay?: number;
  /** Custom viewport threshold for scroll-triggered animations */
  viewportThreshold?: number;
  /** Trigger animation when element enters viewport */
  triggerOnView?: boolean;
  /** Element to render as (defaults to "div") */
  as?: keyof HTMLElementTagNameMap;
}

// ─── Component ────────────────────────────────────────────────────────────────

const AnimatedWrapper = React.forwardRef<HTMLDivElement, AnimatedWrapperProps>(
  (
    {
      animation = "fadeInUp",
      variants,
      delay = 0,
      triggerOnView = false,
      viewportThreshold = 0.1,
      children,
      ...props
    },
    ref
  ) => {
    const resolvedVariants = variants ?? VARIANT_MAP[animation];

    const transition = delay
      ? { transition: { delay } }
      : {};

    if (triggerOnView) {
      return (
        <motion.div
          ref={ref}
          variants={resolvedVariants}
          initial="hidden"
          whileInView="visible"
          exit="exit"
          viewport={{ once: true, amount: viewportThreshold }}
          {...transition}
          {...props}
        >
          {children}
        </motion.div>
      );
    }

    return (
      <motion.div
        ref={ref}
        variants={resolvedVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        {...(delay ? { transition: { delay } } : {})}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

AnimatedWrapper.displayName = "AnimatedWrapper";

// ─── StaggerGroup ─────────────────────────────────────────────────────────────

/**
 * Convenience wrapper that applies staggerContainer to a list parent
 * and automatically wraps each child with staggerItem.
 */
export interface StaggerGroupProps extends Omit<HTMLMotionProps<"div">, "variants"> {
  triggerOnView?: boolean;
}

const StaggerGroup: React.FC<StaggerGroupProps> = ({
  children,
  triggerOnView = false,
  ...props
}) => {
  const motionProps = triggerOnView
    ? {
        variants: staggerContainer,
        initial: "hidden",
        whileInView: "visible",
        viewport: { once: true, amount: 0.1 } as const,
      }
    : {
        variants: staggerContainer,
        initial: "hidden",
        animate: "visible",
      };

  return (
    <motion.div {...motionProps} {...props}>
      {React.Children.map(children as React.ReactNode, (child) =>
        child ? (
          <motion.div variants={staggerItem}>{child as React.ReactNode}</motion.div>
        ) : null
      )}
    </motion.div>
  );
};

export { AnimatedWrapper, StaggerGroup };
