"use client";

/**
 * UniVerse — Hero Section
 *
 * Full-screen cinematic hero with:
 * - Animated campus background & cosmic overlay
 * - Dynamic auth-aware CTAs
 * - Campus quick-action shortcuts (Delivery, Marketplace, Sell, Runner)
 * - Live campus activity ticker (recent deliveries & campus trades)
 * - Live status glass strip
 */

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ChevronDown,
  Users,
  Bike,
  Package,
  ShoppingBag,
  Zap,
  PlusCircle,
  TrendingUp,
} from "lucide-react";
import { CampusBackground } from "./CampusBackground";
import { FloatingObjects } from "./FloatingObjects";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

// ─── Live Campus Activity Ticker ──────────────────────────────────────────────

const LIVE_ACTIVITIES = [
  { icon: "⚡", text: "Snack & Drink delivery completed at Hostel B (4 mins ago)" },
  { icon: "📚", text: "Engineering Mathematics-II listed for ₹220" },
  { icon: "🛍️", text: "Casio FX-991EX Calculator sold to Mechanical Dept student" },
  { icon: "🏃", text: "New Runner joined active fleet in Main Canteen area" },
  { icon: "📐", text: "Engineering Drafter & Sheet Holder listed for ₹350" },
  { icon: "🟢", text: "142 verified Marwadi University students active now" },
];

function LiveCampusTicker() {
  return (
    <div className="w-full overflow-hidden py-2 bg-emerald-950/40 border-y border-emerald-500/15 backdrop-blur-md relative z-20">
      <div className="flex w-[200%] animate-marquee gap-8 items-center text-xs font-mono text-emerald-300/80">
        {[...LIVE_ACTIVITIES, ...LIVE_ACTIVITIES].map((act, idx) => (
          <div key={idx} className="flex items-center gap-2 whitespace-nowrap">
            <span>{act.icon}</span>
            <span>{act.text}</span>
            <span className="text-white/20 mx-2">·</span>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 28s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}

// ─── Quick Action Shortcuts Bar ───────────────────────────────────────────────

function QuickActionShortcuts() {
  const actions = [
    {
      label: "Order Delivery",
      desc: "Snacks & Hostel Needs",
      href: "/request/new",
      icon: Zap,
      color: "#10B981",
    },
    {
      label: "Campus Resale",
      desc: "Buy Books & Tools",
      href: "/dashboard/marketplace",
      icon: ShoppingBag,
      color: "#06B6D4",
    },
    {
      label: "Sell an Item",
      desc: "0% Campus Fees",
      href: "/dashboard/marketplace/sell",
      icon: PlusCircle,
      color: "#F59E0B",
    },
    {
      label: "Become Runner",
      desc: "Earn Pocket Money",
      href: "/dashboard/runner",
      icon: Bike,
      color: "#8B5CF6",
    },
  ];

  return (
    <motion.div
      className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5 max-w-3xl mx-auto mt-8 px-2"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.8 }}
    >
      {actions.map((act) => {
        const Icon = act.icon;
        return (
          <Link
            key={act.label}
            href={act.href}
            className="group flex flex-col items-start p-3 sm:p-3.5 rounded-2xl bg-black/40 border border-white/10 hover:border-emerald-500/40 hover:bg-emerald-950/20 backdrop-blur-xl shadow-lg transition-all duration-200 hover:-translate-y-0.5 text-left"
          >
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center mb-2 transition-transform group-hover:scale-110"
              style={{ backgroundColor: `${act.color}20`, color: act.color }}
            >
              <Icon size={16} />
            </div>
            <span className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">
              {act.label}
            </span>
            <span className="text-[10px] text-white/50 leading-tight mt-0.5 font-mono">
              {act.desc}
            </span>
          </Link>
        );
      })}
    </motion.div>
  );
}

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
    { icon: <Users size={14} />, label: "Students Online", value: "142", color: "#10B981" },
    { icon: <Bike size={14} />, label: "Active Runners", value: "38", color: "#F59E0B" },
    { icon: <Package size={14} />, label: "Active Requests", value: "27", color: "#10B981" },
  ];

  return (
    <motion.div
      className="absolute bottom-20 left-1/2 -translate-x-1/2 w-full max-w-lg px-4 z-20 hidden sm:block"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 1.4, ease: [0.4, 0, 0.2, 1] }}
    >
      <div
        className="rounded-2xl flex items-center justify-around"
        style={{
          background: "rgba(10, 20, 15, 0.65)",
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
          border: "1px solid rgba(16,185,129,0.2)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
        }}
      >
        {stats.map((s, i) => (
          <div key={s.label} className="flex items-center flex-1">
            <StatItem {...s} />
            {i < stats.length - 1 && <div className="h-8 w-px bg-white/12 flex-shrink-0" />}
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
      className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 z-20"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, delay: 2.0 }}
    >
      <span
        className="text-[9px] uppercase tracking-[0.2em] text-white/40 font-mono font-medium"
      >
        Scroll Down
      </span>
      <motion.div
        animate={{ y: [0, 5, 0] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
      >
        <ChevronDown size={15} className="text-white/40" />
      </motion.div>
    </motion.div>
  );
}

// ─── Hero Buttons ─────────────────────────────────────────────────────────────

function HeroButtons({ hasUser }: { hasUser: boolean }) {
  if (hasUser) {
    return (
      <motion.div
        className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-7"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.7 }}
      >
        <Link
          href={ROUTES.DASHBOARD}
          className="group inline-flex items-center gap-2.5 px-7 py-3.5 text-sm font-bold text-black rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-105 active:scale-95 transition-all duration-200"
        >
          <span>Open Dashboard</span>
          <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
        </Link>

        <Link
          href={ROUTES.MARKETPLACE}
          className="inline-flex items-center gap-2 px-7 py-3.5 text-sm font-semibold text-white rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 backdrop-blur-xl transition-all duration-200"
        >
          <ShoppingBag size={16} className="text-emerald-400" />
          <span>Explore Marketplace</span>
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-7"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.7 }}
    >
      <Link
        href={ROUTES.REGISTER}
        id="hero-cta-register"
        className="group inline-flex items-center gap-2.5 px-8 py-3.5 text-sm font-bold text-black rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-105 active:scale-95 transition-all duration-200"
      >
        <span>Get Started — Free</span>
        <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
      </Link>

      <Link
        href={ROUTES.MARKETPLACE}
        className="inline-flex items-center gap-2 px-7 py-3.5 text-sm font-semibold text-white rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 backdrop-blur-xl transition-all duration-200"
      >
        <ShoppingBag size={16} className="text-emerald-400" />
        <span>Browse Campus Deals</span>
      </Link>
    </motion.div>
  );
}

// ─── Main Hero Section ────────────────────────────────────────────────────────

export function HeroSection() {
  const [hasUser, setHasUser] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setHasUser(!!user);
    });
  }, [supabase]);

  return (
    <section
      id="home"
      aria-label="UniVerse hero"
      className="relative w-full min-h-screen pt-28 pb-16 overflow-hidden flex flex-col justify-between"
    >
      {/* ── Campus Background ── */}
      <CampusBackground />

      {/* ── Dark overlay — radial from center ── */}
      <div
        className="absolute inset-0 z-10"
        style={{
          background: `
            radial-gradient(ellipse 85% 65% at 50% 35%, rgba(5,15,10,0.4) 0%, rgba(5,15,10,0.78) 100%),
            linear-gradient(to bottom, rgba(5,15,10,0.65) 0%, rgba(5,15,10,0.30) 40%, rgba(5,15,10,0.85) 100%)
          `,
        }}
        aria-hidden="true"
      />

      {/* ── Floating Product Objects ── */}
      <div className="absolute inset-0 z-10">
        <FloatingObjects />
      </div>

      {/* ── Hero Content ── */}
      <div className="relative z-20 w-full max-w-4xl mx-auto px-4 text-center my-auto">
        {/* Overline badge */}
        <motion.div
          className="inline-flex items-center gap-2 mb-4"
          initial={{ opacity: 0, y: -14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase bg-emerald-500/15 border border-emerald-500/35 text-emerald-300 font-mono backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Exclusively for Marwadi University Students
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          className="font-extrabold leading-[1.04] tracking-tight text-white"
          style={{
            fontFamily: "var(--font-plus-jakarta-sans)",
            fontSize: "clamp(2.4rem, 6.5vw, 4.8rem)",
            textShadow: "0 2px 40px rgba(0,0,0,0.5)",
          }}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35, ease: [0.4, 0, 0.2, 1] }}
        >
          Skip the Stairs.
          <br />
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 bg-clip-text text-transparent">
            Deliver & Trade on Campus.
          </span>
        </motion.h1>

        {/* Subheading */}
        <motion.p
          className="mt-5 text-white/75 leading-relaxed max-w-2xl mx-auto text-sm sm:text-base font-[family-name:var(--font-inter)]"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.55, ease: [0.4, 0, 0.2, 1] }}
        >
          The official student super-app for Marwadi University. Request instant snack & canteen room
          deliveries, or buy & sell books, drafters, calculators, and electronics with verified peers
          at 0% commission.
        </motion.p>

        {/* Dynamic CTA Buttons */}
        <HeroButtons hasUser={hasUser} />

        {/* Quick Action Shortcuts Grid */}
        <QuickActionShortcuts />

        {/* Trust indicators */}
        <motion.div
          className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-7"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.0 }}
        >
          {[
            "🛡️ 100% Verified MU Students",
            "⚡ 5-Minute Room Delivery",
            "🤝 0% Fee Peer-to-Peer Resale",
            "📍 Library & Hostel Safe Zones",
          ].map((item) => (
            <span
              key={item}
              className="text-xs text-white/55 font-medium font-mono"
            >
              {item}
            </span>
          ))}
        </motion.div>
      </div>

      {/* ── Live Campus Activity Ticker ── */}
      <div className="w-full mt-8">
        <LiveCampusTicker />
      </div>

      {/* ── Live Status Strip ── */}
      <LiveStatusStrip />

      {/* ── Scroll Indicator ── */}
      <ScrollIndicator />
    </section>
  );
}
