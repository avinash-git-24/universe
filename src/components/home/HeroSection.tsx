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
    <div className="flex items-center gap-3 px-4 py-2">
      {/* Pulsing dot + icon */}
      <div className="relative flex-shrink-0">
        <span
          className="absolute inset-0 rounded-full animate-ping"
          style={{ background: color, opacity: 0.35 }}
        />
        <span
          className="relative flex items-center justify-center w-7 h-7 rounded-full"
          style={{ background: `${color}25` }}
        >
          <span style={{ color }}>{icon}</span>
        </span>
      </div>

      {/* Text */}
      <div className="flex flex-col">
        <motion.span
          className="text-lg font-bold text-white leading-none font-[family-name:var(--font-plus-jakarta-sans)]"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.6 }}
        >
          {value}
        </motion.span>
        <span className="text-[11px] text-white/55 font-[family-name:var(--font-inter)] leading-tight mt-0.5 whitespace-nowrap">
          {label}
        </span>
      </div>
    </div>
  );
}

// ─── Live Status Strip ────────────────────────────────────────────────────────

function LiveStatusStrip() {
  const stats = [
    { icon: <Users size={14}/>, label: "Students Online", value: "142", color: "#10B981" },
    { icon: <Bike  size={14}/>, label: "Active Runners",  value: "38",  color: "#F59E0B" },
    { icon: <Package size={14}/>, label: "Active Requests", value: "27", color: "#10B981" },
  ];

  return (
    <motion.div
      className="absolute bottom-24 left-1/2 -translate-x-1/2 w-full max-w-lg px-4 z-20"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 1.4, ease: [0.4, 0, 0.2, 1] }}
    >
      <div
        className="rounded-[var(--radius-xl)] flex items-center justify-around"
        style={{
          background: "rgba(10, 20, 15, 0.52)",
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
          border: "1px solid rgba(255,255,255,0.12)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
        }}
      >
        {stats.map((s, i) => (
          <div key={s.label} className="flex items-center flex-1">
            <StatItem {...s} />
            {i < stats.length - 1 && (
              <div className="h-8 w-px bg-white/12 flex-shrink-0"/>
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
      className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 z-20"
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
      className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.9, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* Primary CTA */}
      <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
        <Link
          href={ROUTES.REGISTER}
          id="hero-cta-register"
          className={cn(
            "group inline-flex items-center gap-2.5 px-8 py-4",
            "text-base font-semibold text-white rounded-[var(--radius-md)]",
            "font-[family-name:var(--font-inter)]",
            "transition-all duration-300",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
          )}
          style={{
            background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
            boxShadow: "0 0 0 1px rgba(16,185,129,0.3), 0 8px 32px rgba(16,185,129,0.45)",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.boxShadow =
              "0 0 0 1px rgba(16,185,129,0.5), 0 12px 40px rgba(16,185,129,0.6)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.boxShadow =
              "0 0 0 1px rgba(16,185,129,0.3), 0 8px 32px rgba(16,185,129,0.45)";
          }}
        >
          Get Started
          <ArrowRight
            size={18}
            className="transition-transform duration-200 group-hover:translate-x-1"
          />
        </Link>
      </motion.div>

      {/* Secondary CTA — glass */}
      <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
        <Link
          href="#how-it-works"
          id="hero-cta-how-it-works"
          className={cn(
            "inline-flex items-center gap-2 px-8 py-4",
            "text-base font-semibold text-white rounded-[var(--radius-md)]",
            "font-[family-name:var(--font-inter)]",
            "transition-all duration-300",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
          )}
          style={{
            background: "rgba(255,255,255,0.1)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: "1px solid rgba(255,255,255,0.22)",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.18)";
            (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,255,255,0.38)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.1)";
            (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,255,255,0.22)";
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
      className="relative w-full min-h-screen overflow-hidden flex items-center justify-center"
    >
      {/* ── Campus Background ── */}
      <CampusBackground />

      {/* ── Dark overlay — radial from center ── */}
      <div
        className="absolute inset-0 z-10"
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 50% 40%, rgba(5,15,10,0.35) 0%, rgba(5,15,10,0.68) 100%),
            linear-gradient(to bottom, rgba(5,15,10,0.55) 0%, rgba(5,15,10,0.30) 40%, rgba(5,15,10,0.70) 100%)
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
          className="inline-flex items-center gap-2 mb-6"
          initial={{ opacity: 0, y: -14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <span
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase"
            style={{
              background: "rgba(16,185,129,0.15)",
              border: "1px solid rgba(16,185,129,0.35)",
              color: "#4ADE80",
              fontFamily: "var(--font-inter)",
              backdropFilter: "blur(8px)",
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#4ADE80] animate-pulse"/>
            Exclusively for Marwadi University Students
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          className="font-extrabold leading-[1.05] tracking-tight text-white"
          style={{
            fontFamily: "var(--font-plus-jakarta-sans)",
            fontSize: "clamp(2.75rem, 8vw, 5.5rem)",
            textShadow: "0 2px 40px rgba(0,0,0,0.4)",
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
          className="mt-6 text-white/72 leading-relaxed max-w-2xl mx-auto"
          style={{
            fontFamily: "var(--font-inter)",
            fontSize: "clamp(0.95rem, 2.2vw, 1.15rem)",
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

        {/* Trust indicators */}
        <motion.div
          className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.1 }}
        >
          {[
            "✅ Verified Students Only",
            "⚡ 5-Minute Delivery",
            "🏫 Campus Exclusive",
          ].map((item) => (
            <span
              key={item}
              className="text-xs text-white/45 font-medium"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              {item}
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
