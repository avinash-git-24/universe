"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Rocket,
  ShieldCheck,
  Zap,
  Coins,
  Building2,
  Target,
  Globe2,
  ArrowRight,
  Lightbulb,
  Code2,
  Users,
  CheckCircle2,
  CreditCard,
  MapPin,
  Clock,
  Sparkles,
  Package,
} from "lucide-react";
import { Navbar } from "@/components/home/Navbar";
import { Footer } from "@/components/home/Footer";
import { ROUTES } from "@/constants/routes";

/* ─── Data ─────────────────────────────────────────────────── */

const STATS = [
  {
    value: "100%",
    label: "Student Verified",
    desc: "Active college ID & email required",
    icon: ShieldCheck,
    color: "#10B981",
    bg: "rgba(16, 185, 129, 0.08)",
  },
  {
    value: "< 5 Min",
    label: "Average Delivery",
    desc: "Peers are already near the machines",
    icon: Zap,
    color: "#F59E0B",
    bg: "rgba(245, 158, 11, 0.08)",
  },
  {
    value: "₹0",
    label: "Platform Fees",
    desc: "Zero commission on student peer deliveries",
    icon: Coins,
    color: "#10B981",
    bg: "rgba(16, 185, 129, 0.08)",
  },
  {
    value: "Campus Only",
    label: "Closed Ecosystem",
    desc: "Hostel-to-hostel, zero outside traffic",
    icon: Building2,
    color: "#3B82F6",
    bg: "rgba(59, 130, 246, 0.08)",
  },
] as const;

const MILESTONES = [
  {
    phase: "Phase 1",
    title: "The Inception",
    desc: "UniVerse was conceived inside a college hostel room to solve late-night vending machine stair trips.",
    icon: Lightbulb,
    badge: "Origin",
  },
  {
    phase: "Phase 2",
    title: "First Prototype",
    desc: "Validated the live peer-matching model with 50 hostel wingmates using instant request routing.",
    icon: Code2,
    badge: "Beta",
  },
  {
    phase: "Phase 3",
    title: "Campus Pilot",
    desc: "Completed over 500+ successful snack, drink, and stationery deliveries with zero delivery incidents.",
    icon: Users,
    badge: "Pilot",
  },
  {
    phase: "Phase 4",
    title: "Multi-Wing Rollout",
    desc: "Expanded coverage to all student hostel blocks with automated runner incentives and live status tracking.",
    icon: Rocket,
    badge: "Live",
  },
  {
    phase: "Phase 5",
    title: "Campus Marketplace",
    desc: "Launching peer-to-peer student resale, textbook exchange, and multi-campus scaling.",
    icon: Sparkles,
    badge: "Next",
  },
] as const;

const PILLARS = [
  {
    title: "Community First",
    desc: "Built exclusively by college students, for college students. Empower your campus peers with mutual support.",
    icon: Users,
    tag: "Culture",
  },
  {
    title: "Lightning Delivery",
    desc: "Skip long canteen queues. Runners already passing the vending machine grab your items in minutes.",
    icon: Zap,
    tag: "Speed",
  },
  {
    title: "Cashless & Secure",
    desc: "Transparent digital balances with instant escrow-protected student reward distribution.",
    icon: CreditCard,
    tag: "Payments",
  },
  {
    title: "Live Status Tracking",
    desc: "Know exactly when your request is accepted, purchased, and delivered to your hostel doorstep.",
    icon: MapPin,
    tag: "Transparency",
  },
  {
    title: "Verified Student IDs",
    desc: "Restricted college domain access ensures only genuine university students participate in the network.",
    icon: ShieldCheck,
    tag: "Safety",
  },
  {
    title: "Zero Outer Traffic",
    desc: "All deliveries happen within secure campus boundaries, maintaining hostel gate rules and peace of mind.",
    icon: Building2,
    tag: "Campus Only",
  },
] as const;

/* ─── Component: Live Campus Delivery Mock Card ─────────────── */

function LiveDeliveryMockCard() {
  return (
    <div className="relative w-full max-w-[420px] mx-auto">
      {/* Background glow blob */}
      <div
        className="absolute -inset-4 rounded-3xl opacity-50 blur-2xl pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(16,185,129,0.3) 0%, rgba(59,130,246,0.15) 70%)",
        }}
        aria-hidden="true"
      />

      {/* Main Glass Card */}
      <div className="relative rounded-2xl sm:rounded-3xl p-5 sm:p-6 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-emerald-500/20 shadow-2xl shadow-emerald-500/10">
        {/* Card Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-emerald-500/20">
              AK
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5 font-[family-name:var(--font-plus-jakarta-sans)]">
                Aryan Kumar
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                Hostel Wing B • Room 304
              </div>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10.5px] font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
            <Clock size={11} />
            In Progress
          </span>
        </div>

        {/* Item Requested */}
        <div className="my-4 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Package size={16} />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  Chili Tadka Chips + Cold Drink
                </div>
                <div className="text-[10.5px] text-slate-500">Hostel Ground Floor Vending Machine</div>
              </div>
            </div>
            <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
              ₹45
            </span>
          </div>
        </div>

        {/* Route / Status timeline */}
        <div className="space-y-2.5 text-xs">
          <div className="flex items-center gap-2.5 text-emerald-600 dark:text-emerald-400 font-semibold">
            <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center text-white text-[9px] font-bold">
              ✓
            </div>
            <span>Item purchased from machine</span>
          </div>
          <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300 font-medium pl-0.5">
            <div className="w-3 h-3 rounded-full border-2 border-emerald-500 animate-ping" />
            <span>Runner heading to 3rd Floor (ETA ~2 mins)</span>
          </div>
        </div>

        {/* Floating Trust Pill */}
        <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
            <ShieldCheck size={13} />
            Verified Campus Runner
          </span>
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            Cashless PIN Handoff
          </span>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ────────────────────────────────────────────── */

export default function AboutPage() {
  const [activePhase, setActivePhase] = useState(0);

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFFFF] text-slate-900 font-[family-name:var(--font-inter)] selection:bg-emerald-500 selection:text-white overflow-x-hidden relative">
      {/* Crisp clean dot grid pattern */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: "radial-gradient(#CBD5E1 1.25px, transparent 1.25px)",
          backgroundSize: "32px 32px",
          opacity: 0.45,
        }}
        aria-hidden="true"
      />

      {/* Soft ambient aura glows */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
        <div
          className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full blur-[100px] opacity-25"
          style={{ background: "radial-gradient(circle, rgba(16,185,129,0.3) 0%, transparent 70%)" }}
        />
        <div
          className="absolute top-1/2 -right-32 w-[500px] h-[500px] rounded-full blur-[110px] opacity-20"
          style={{ background: "radial-gradient(circle, rgba(245,158,11,0.2) 0%, transparent 70%)" }}
        />
        <div
          className="absolute -bottom-32 left-1/4 w-[600px] h-[600px] rounded-full blur-[120px] opacity-20"
          style={{ background: "radial-gradient(circle, rgba(16,185,129,0.2) 0%, transparent 70%)" }}
        />
      </div>

      <Navbar />

      {/* ══════════════════════════════ HERO SECTION ══════════════════════════════ */}
      <section className="relative z-10 pt-28 sm:pt-36 md:pt-40 pb-16 sm:pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Narrative */}
            <div className="lg:col-span-7 text-center lg:text-left">
              {/* Overline pill */}
              <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="inline-flex items-center gap-2 mb-4 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400"
              >
                <Rocket size={13} className="animate-pulse" />
                <span>Redefining Campus Logistics</span>
              </motion.div>

              {/* Display Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.08] text-slate-900 dark:text-white font-[family-name:var(--font-plus-jakarta-sans)]"
              >
                The Student Economy,{" "}
                <span className="bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 bg-clip-text text-transparent">
                  Fully Realized.
                </span>
              </motion.h1>

              {/* Subheading */}
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mt-5 text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto lg:mx-0"
              >
                UniVerse connects students who need everyday hostel essentials with trusted
                campus peers ready to deliver. Zero strangers, zero outer traffic, and 100%
                verified student convenience.
              </motion.p>

              {/* CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="mt-8 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5"
              >
                <Link
                  href={ROUTES.REGISTER}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 text-sm font-bold text-black rounded-xl bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-400 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                >
                  <span>Join UniVerse — It&apos;s Free</span>
                  <ArrowRight size={15} strokeWidth={2.5} />
                </Link>
                <Link
                  href="/#how-it-works"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold text-slate-700 dark:text-white rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/80 transition-all duration-200"
                >
                  <span>See How It Works</span>
                </Link>
              </motion.div>
            </div>

            {/* Right Column: Live Mock Card Showcase */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="lg:col-span-5 flex justify-center"
            >
              <LiveDeliveryMockCard />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════ CORE METRICS ══════════════════════════════ */}
      <section className="relative z-10 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {STATS.map(({ value, label, desc, icon: Icon, color, bg }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.1 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="group relative rounded-2xl p-6 bg-white/85 dark:bg-slate-900/70 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300"
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 duration-200"
                    style={{ backgroundColor: bg }}
                  >
                    <Icon size={22} style={{ color }} />
                  </div>
                  <div>
                    <div
                      className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-[family-name:var(--font-plus-jakarta-sans)]"
                      style={{ color }}
                    >
                      {value}
                    </div>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                      {label}
                    </div>
                  </div>
                </div>
                <p className="mt-3 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════ MISSION & VISION ══════════════════════════════ */}
      <section className="relative z-10 py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {/* Mission Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              whileHover={{ y: -4 }}
              className="rounded-3xl p-8 sm:p-10 bg-white/90 dark:bg-slate-900/80 backdrop-blur-lg border border-emerald-500/20 shadow-lg shadow-emerald-500/5 relative overflow-hidden"
            >
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 mb-6">
                <Target size={28} />
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-[family-name:var(--font-plus-jakarta-sans)] mb-2">
                Our Mission
              </h2>
              <div className="w-12 h-1 rounded-full bg-emerald-500 mb-5" />
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                To build a trusted student-to-student campus micro-economy. We empower hostel
                residents to save precious study time while creating effortless, flexible earning
                opportunities for peers already running errands.
              </p>
              <div className="mt-6 flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 size={16} />
                <span>Empowering Student Self-Reliance</span>
              </div>
            </motion.div>

            {/* Vision Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              whileHover={{ y: -4 }}
              className="rounded-3xl p-8 sm:p-10 bg-white/90 dark:bg-slate-900/80 backdrop-blur-lg border border-blue-500/20 shadow-lg shadow-blue-500/5 relative overflow-hidden"
            >
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 mb-6">
                <Globe2 size={28} />
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-[family-name:var(--font-plus-jakarta-sans)] mb-2">
                Our Vision
              </h2>
              <div className="w-12 h-1 rounded-full bg-blue-500 mb-5" />
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                A modern campus where logistical friction is zero. UniVerse is becoming the
                complete operating system for university life — starting with lightning-fast
                vending deliveries and evolving into peer textbook, gear, and room essentials exchange.
              </p>
              <div className="mt-6 flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400">
                <CheckCircle2 size={16} />
                <span>The Connected Campus Future</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════ RESPONSIVE TIMELINE ══════════════════════════════ */}
      <section className="relative z-10 py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Section Heading */}
          <div className="text-center mb-12 sm:mb-16">
            <span className="inline-block px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 mb-3">
              Growth Roadmap
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white font-[family-name:var(--font-plus-jakarta-sans)]">
              The Journey So Far
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
              From a late-night hostel craving to a rapidly expanding campus logistics platform.
            </p>
          </div>

          {/* Desktop Stepper Track (Visible on md+) */}
          <div className="hidden md:block">
            {/* Horizontal Track Bar */}
            <div className="relative mb-8">
              <div className="absolute top-1/2 left-[5%] right-[5%] h-1 -translate-y-1/2 bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 rounded-full shadow-md shadow-emerald-500/30" />
              <div className="relative flex justify-between px-[5%]">
                {MILESTONES.map((item, i) => (
                  <button
                    key={item.phase}
                    onClick={() => setActivePhase(i)}
                    className={`relative z-10 w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                      activePhase === i
                        ? "bg-emerald-500 text-white scale-110 shadow-lg shadow-emerald-500/40 ring-4 ring-white dark:ring-slate-900"
                        : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-2 border-emerald-500/40 hover:scale-105"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </div>

            {/* Desktop Milestone Cards Grid */}
            <div className="grid grid-cols-5 gap-3.5">
              {MILESTONES.map(({ phase, title, desc, icon: Icon, badge }, i) => (
                <div
                  key={phase}
                  onClick={() => setActivePhase(i)}
                  className={`cursor-pointer rounded-2xl p-5 text-center transition-all duration-300 border ${
                    activePhase === i
                      ? "bg-white dark:bg-slate-800/90 border-emerald-500/50 shadow-xl shadow-emerald-500/10 -translate-y-1"
                      : "bg-white/70 dark:bg-slate-900/50 border-slate-200/60 dark:border-slate-800 hover:border-emerald-500/30 hover:bg-white"
                  }`}
                >
                  <div className="w-10 h-10 mx-auto rounded-xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-500 mb-3">
                    <Icon size={20} />
                  </div>
                  <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mb-2">
                    {badge}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white font-[family-name:var(--font-plus-jakarta-sans)] mb-2">
                    {title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile Stepper Tree (Visible on mobile only) */}
          <div className="md:hidden relative pl-6 border-l-2 border-emerald-500/30 space-y-6 ml-4">
            {MILESTONES.map(({ phase, title, desc, icon: Icon, badge }, i) => (
              <div key={phase} className="relative group">
                {/* Node circle on vertical line */}
                <div className="absolute -left-[31px] top-1 w-6 h-6 rounded-full bg-emerald-500 text-white font-bold text-xs flex items-center justify-center shadow-md shadow-emerald-500/30">
                  {i + 1}
                </div>

                {/* Milestone Card */}
                <div className="rounded-2xl p-5 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      {badge}
                    </span>
                    <span className="text-xs font-semibold text-slate-400">{phase}</span>
                  </div>
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 flex-shrink-0">
                      <Icon size={16} />
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white font-[family-name:var(--font-plus-jakarta-sans)]">
                      {title}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════ WHY UNIVERSE (6 PILLARS) ══════════════════════════════ */}
      <section className="relative z-10 py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <span className="inline-block px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 mb-3">
              Core Pillars
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white font-[family-name:var(--font-plus-jakarta-sans)]">
              Why UniVerse?
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
              Every detail engineered around the real daily routine of college students.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {PILLARS.map(({ title, desc, icon: Icon, tag }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.08 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="group relative rounded-3xl p-6 sm:p-7 bg-white/80 dark:bg-slate-900/70 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl hover:shadow-emerald-500/10 hover:border-emerald-500/30 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 transition-transform group-hover:scale-110 duration-200">
                    <Icon size={24} />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    {tag}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white font-[family-name:var(--font-plus-jakarta-sans)] mb-2">
                  {title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════ TRUST & SAFETY STANDARD ══════════════════════════════ */}
      <section className="relative z-10 py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden p-8 sm:p-14 bg-gradient-to-br from-[#041e14] via-[#063321] to-[#02140d] border border-emerald-500/30 shadow-2xl">
            {/* Ambient Radial Highlights */}
            <div
              className="absolute top-0 left-0 w-full h-full pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse at 15% 40%, rgba(16,185,129,0.3) 0%, transparent 60%), radial-gradient(ellipse at 85% 60%, rgba(59,130,246,0.15) 0%, transparent 65%)",
              }}
              aria-hidden="true"
            />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                    <ShieldCheck size={26} />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-[family-name:var(--font-plus-jakarta-sans)]">
                    The Trust We Build
                  </h2>
                </div>
                <p className="text-sm sm:text-base text-emerald-100/80 leading-relaxed max-w-2xl mb-8">
                  By restricting UniVerse exclusively to authenticated university students,
                  we have established a uniquely secure, high-trust ecosystem where hostel
                  students feel 100% comfortable requesting and fulfilling deliveries.
                </p>

                {/* Safety Badges */}
                <div className="flex flex-wrap gap-2.5 sm:gap-3">
                  {[
                    "Verified Student ID Match",
                    "Cashless Escrow Protection",
                    "Hostel-Only Secure Boundaries",
                    "Mutual Peer Star Ratings",
                  ].map((badge) => (
                    <span
                      key={badge}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold text-white bg-white/10 border border-white/15 backdrop-blur-sm shadow-sm"
                    >
                      <CheckCircle2 size={14} className="text-emerald-400" />
                      <span>{badge}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Visual 3D Shield */}
              <div className="lg:col-span-4 flex justify-center">
                <div className="relative w-44 h-44 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-pulse blur-xl" />
                  <div className="absolute inset-4 rounded-full border border-emerald-400/20" />
                  <div className="absolute inset-8 rounded-full border border-emerald-400/30" />
                  <ShieldCheck size={96} className="text-emerald-400 filter drop-shadow-[0_0_24px_rgba(16,185,129,0.6)]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════ FINAL CTA ══════════════════════════════ */}
      <section className="relative z-10 py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden p-8 sm:p-14 text-center bg-gradient-to-tr from-emerald-50 via-teal-50 to-emerald-50 dark:from-slate-900 dark:via-emerald-950/40 dark:to-slate-900 border border-emerald-500/20 shadow-xl">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-[family-name:var(--font-plus-jakarta-sans)] mb-4">
              Ready to Upgrade Your Campus Life?
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-xl mx-auto mb-8 leading-relaxed">
              Join hundreds of fellow university students already getting vending snacks delivered
              in minutes and earning flexible rewards right in their hostels.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <Link
                href={ROUTES.REGISTER}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 text-sm font-bold text-black rounded-xl bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-400 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              >
                <span>Create Student Account</span>
                <ArrowRight size={15} strokeWidth={2.5} />
              </Link>
              <Link
                href="/#how-it-works"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold text-slate-700 dark:text-white rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/80 transition-all duration-200"
              >
                <span>Explore How It Works</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
