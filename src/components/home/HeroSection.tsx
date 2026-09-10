"use client";

/**
 * UniVerse — Hero Section
 *
 * Full-screen cinematic hero with:
 * - Animated campus background
 * - Floating product objects
 * - Premium headline + CTA
 * - Live status glass strip
 * - Scroll indicator
 */

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ChevronDown, Users, Bike, Package } from "lucide-react";
import { CampusBackground } from "./CampusBackground";
import { FloatingObjects } from "./FloatingObjects";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

// ─── Animated Stat Item ───────────────────────────────────────────────────────

function StatItem({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-1.5 sm:gap-3 px-1.5 sm:px-4 py-1.5 sm:py-2 justify-center">
      {/* Pulsing dot + icon */}
      <div className="relative flex-shrink-0">
        <span
          className="absolute inset-0 rounded-full animate-ping"
          style={{ background: color, opacity: 0.35 }}
        />
        <span
          className="relative flex items-center justify-center w-5 h-5 sm:w-7 sm:h-7 rounded-full"
          style={{ background: `${color}25` }}
        >
          <span style={{ color }}>{icon}</span>
        </span>
      </div>

      {/* Text */}
      <div className="flex flex-col min-w-0">
        <motion.span
          className="text-sm sm:text-lg font-bold text-white leading-none font-[family-name:var(--font-plus-jakarta-sans)]"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.6 }}
        >
          {value}
        </motion.span>
        <span className="text-[8.5px] sm:text-[11px] text-white/60 font-[family-name:var(--font-inter)] leading-tight mt-0.5 whitespace-nowrap truncate">
          {label}
        </span>
      </div>
    </div>
  );
}

// ─── Live Status Strip ────────────────────────────────────────────────────────

function LiveStatusStrip() {
  const stats = [
    { icon: <Users size={12} className="sm:w-3.5 sm:h-3.5" />, label: "Students Online", value: "142", color: "#10B981" },
    { icon: <Bike  size={12} className="sm:w-3.5 sm:h-3.5" />, label: "Active Runners",  value: "38",  color: "#F59E0B" },
    { icon: <Package size={12} className="sm:w-3.5 sm:h-3.5" />, label: "Active Requests", value: "27", color: "#10B981" },
  ];

  return (
    <motion.div
      className="w-full max-w-sm sm:max-w-lg px-3 sm:px-4 z-20 mt-6 sm:mt-0 sm:absolute sm:bottom-16 sm:left-1/2 sm:-translate-x-1/2"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 1.2, ease: [0.4, 0, 0.2, 1] }}
    >
      <div
        className="rounded-xl sm:rounded-2xl flex items-center justify-around py-1 px-1 sm:px-2 sm:py-0"
        style={{
          background: "rgba(8, 18, 12, 0.85)",
          backdropFilter: "blur(24px) saturate(190%)",
          WebkitBackdropFilter: "blur(24px) saturate(190%)",
          border: "1px solid rgba(16, 185, 129, 0.2)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.08)",
        }}
      >
        {stats.map((s, i) => (
          <div key={s.label} className="flex items-center flex-1 justify-center min-w-0">
            <StatItem {...s} />
            {i < stats.length - 1 && (
              <div className="h-5 sm:h-8 w-px bg-white/10 flex-shrink-0"/>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Scroll Indicator ─────────────────────────────────────────────────────────

function ScrollIndicator() {
  return (
    <motion.div
      className="hidden sm:flex sm:absolute sm:bottom-6 sm:left-1/2 sm:-translate-x-1/2 flex-col items-center gap-1.5 z-20"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, delay: 2.0 }}
    >
      <span
        className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-medium"
        style={{ fontFamily: "var(--font-inter)" }}
      >
        Scroll
      </span>
      <motion.div
        animate={{ y: [0, 7, 0] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
      >
        <ChevronDown size={18} className="text-white/40" />
      </motion.div>
    </motion.div>
  );
}

// ─── Hero Buttons ─────────────────────────────────────────────────────────────

function HeroButtons() {
  return (
    <motion.div
      className="flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-4 mt-6 sm:mt-9 w-full max-w-[280px] sm:max-w-none mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.9, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* Primary CTA */}
      <motion.div className="w-full sm:w-auto" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
        <Link
          href={ROUTES.REGISTER}
          id="hero-cta-register"
          className={cn(
            "group flex items-center justify-center gap-2 w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4",
            "text-sm sm:text-base font-bold text-white rounded-xl sm:rounded-[var(--radius-md)]",
            "font-[family-name:var(--font-inter)]",
            "transition-all duration-300 shadow-[0_0_25px_rgba(16,185,129,0.35)] hover:shadow-[0_0_35px_rgba(16,185,129,0.55)]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
          )}
          style={{
            background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
          }}
        >
          Get Started
          <ArrowRight
            size={16}
            className="transition-transform duration-200 group-hover:translate-x-1"
          />
        </Link>
      </motion.div>

      {/* Secondary CTA — glass */}
      <motion.div className="w-full sm:w-auto" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
        <Link
          href="#how-it-works"
          id="hero-cta-how-it-works"
          className={cn(
            "flex items-center justify-center gap-2 w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4",
            "text-sm sm:text-base font-semibold text-white/90 rounded-xl sm:rounded-[var(--radius-md)]",
            "font-[family-name:var(--font-inter)]",
            "transition-all duration-300",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
          )}
          style={{
            background: "rgba(255,255,255,0.08)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: "1px solid rgba(255,255,255,0.18)",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.16)";
            (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,255,255,0.32)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.08)";
            (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,255,255,0.18)";
          }}
        >
          How It Works
        </Link>
      </motion.div>
    </motion.div>
  );
}

// ─── Main Hero Section ────────────────────────────────────────────────────────

export function HeroSection() {
  return (
    <section
      id="home"
      aria-label="UniVerse hero"
      className="relative w-full min-h-[100dvh] overflow-hidden flex flex-col justify-center items-center pt-20 pb-12 sm:py-0"
    >
      {/* ── Campus Background ── */}
      <CampusBackground />

      {/* ── Dark overlay — radial from center with rich contrast ── */}
      <div
        className="absolute inset-0 z-10"
        style={{
          background: `
            radial-gradient(ellipse 92% 75% at 50% 35%, rgba(4,14,9,0.76) 0%, rgba(3,10,7,0.92) 100%),
            linear-gradient(to bottom, rgba(4,14,9,0.70) 0%, rgba(4,14,9,0.48) 40%, rgba(4,14,9,0.92) 100%)
          `,
        }}
        aria-hidden="true"
      />

      {/* ── Floating Product Objects ── */}
      <div className="absolute inset-0 z-10">
        <FloatingObjects />
      </div>

      {/* ── Hero Content ── */}
      <div className="relative z-20 w-full max-w-4xl mx-auto px-4 text-center">

        {/* Overline badge */}
        <motion.div
          className="inline-flex items-center gap-2 mb-3 sm:mb-6"
          initial={{ opacity: 0, y: -14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <span
            className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-[10.5px] sm:text-xs font-semibold tracking-wider uppercase max-w-[92vw]"
            style={{
              background: "rgba(16,185,129,0.15)",
              border: "1px solid rgba(16,185,129,0.35)",
              color: "#4ADE80",
              fontFamily: "var(--font-inter)",
              backdropFilter: "blur(8px)",
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#4ADE80] animate-pulse flex-shrink-0"/>
            <span className="truncate">Exclusively for Marwadi University Students</span>
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          className="font-extrabold leading-[1.1] sm:leading-[1.08] tracking-tight text-white"
          style={{
            fontFamily: "var(--font-plus-jakarta-sans)",
            fontSize: "clamp(2.15rem, 7vw, 5.5rem)",
            textShadow: "0 2px 25px rgba(0,0,0,0.85)",
          }}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35, ease: [0.4, 0, 0.2, 1] }}
        >
          Skip the Stairs.
          <br />
          <span
            style={{
              background: "linear-gradient(90deg, #10B981 20%, #F59E0B 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Get It Delivered.
          </span>
        </motion.h1>

        {/* Subheading */}
        <motion.p
          className="mt-3 sm:mt-5 text-white/75 leading-relaxed max-w-xl mx-auto px-3 text-xs sm:text-base"
          style={{
            fontFamily: "var(--font-inter)",
          }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.55, ease: [0.4, 0, 0.2, 1] }}
        >
          A smarter way for verified Marwadi University students to request snacks
          and drinks directly from hostel vending machines — and receive them in
          their rooms through trusted fellow students.
        </motion.p>

        {/* CTA Buttons */}
        <HeroButtons />

        {/* Trust indicators (Pill chips on mobile) */}
        <motion.div
          className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-4 mt-5 sm:mt-7"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.0 }}
        >
          {[
            { icon: "🛡️", text: "Verified Students" },
            { icon: "⚡", text: "5-Min Delivery" },
            { icon: "🏫", text: "Campus Exclusive" },
          ].map((item) => (
            <span
              key={item.text}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/[0.05] border border-white/10 text-[10.5px] sm:text-xs text-white/70 font-medium backdrop-blur-sm shadow-sm"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              <span className="text-[11px] sm:text-xs">{item.icon}</span>
              <span>{item.text}</span>
            </span>
          ))}
        </motion.div>
      </div>

      {/* ── Live Status Strip ── */}
      <LiveStatusStrip />

      {/* ── Scroll Indicator ── */}
      <ScrollIndicator />
    </section>
  );
}

