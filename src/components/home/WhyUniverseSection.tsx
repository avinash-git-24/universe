"use client";

/**
 * UniVerse — Why UniVerse Section
 *
 * 5 advantage items in a bento-grid layout.
 * Dark background contrast section between How It Works and Footer.
 */

import { motion } from "framer-motion";
import { ShieldCheck, Zap, MapPin, Users, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

const ADVANTAGES = [
  {
    icon: ShieldCheck,
    title: "Verified Students Only",
    description:
      "Every user on UniVerse is a verified Marwadi University student with an active university ID. No strangers, ever.",
    accentColor: "#10B981",
    size: "large" as const,
    highlight: true,
  },
  {
    icon: Zap,
    title: "Fast Delivery",
    description:
      "Most deliveries happen in under 5 minutes. No waiting — runners are always nearby.",
    accentColor: "#F59E0B",
    size: "small" as const,
    highlight: false,
  },
  {
    icon: MapPin,
    title: "Campus Only",
    description:
      "UniVerse operates exclusively within the Marwadi University campus. Hyper-local, zero traffic.",
    accentColor: "#10B981",
    size: "small" as const,
    highlight: false,
  },
  {
    icon: Users,
    title: "Safe Community",
    description:
      "Built on a trust and rating system. Every delivery is tracked and rated — keeping the community accountable.",
    accentColor: "#F59E0B",
    size: "medium" as const,
    highlight: false,
  },
  {
    icon: Clock,
    title: "Time Saving",
    description:
      "Stop losing 15 minutes every time you need a snack. Get your time back. Focus on what matters.",
    accentColor: "#10B981",
    size: "medium" as const,
    highlight: false,
  },
] as const;

// ─── Bento Card ───────────────────────────────────────────────────────────────

const cardVariants = {
  hidden:  { opacity: 0, y: 30, scale: 0.95 },
  visible: { opacity: 1, y: 0,  scale: 1    },
};

function AdvantageCard({
  icon: Icon,
  title,
  description,
  accentColor,
  highlight,
  index,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  accentColor: string;
  size: "large" | "medium" | "small";
  highlight: boolean;
  index: number;
}) {
  return (
    <motion.div
      variants={cardVariants}
      transition={{ duration: 0.6, delay: index * 0.12, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -6, scale: 1.02, transition: { duration: 0.3, ease: "easeOut" } }}
      className={cn(
        "group relative flex flex-col gap-4 p-8 rounded-[1.5rem] overflow-hidden",
        "cursor-default transition-all duration-300",
        highlight
          ? "md:col-span-2 md:row-span-2 shadow-[0_8px_30px_rgba(16,185,129,0.1)]"
          : "shadow-xl"
      )}
      style={{
        background: highlight
          ? `linear-gradient(145deg, rgba(16,185,129,0.15) 0%, rgba(16,185,129,0.02) 100%)`
          : "rgba(255, 255, 255, 0.03)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: `1px solid ${highlight ? "rgba(16,185,129,0.3)" : "rgba(255,255,255,0.08)"}`,
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.borderColor = `${accentColor}60`;
        el.style.boxShadow = `0 12px 40px ${accentColor}20`;
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.borderColor = highlight ? "rgba(16,185,129,0.3)" : "rgba(255,255,255,0.08)";
        el.style.boxShadow = highlight ? "0 8px 30px rgba(16,185,129,0.1)" : "none";
      }}
    >
      {/* Background Glow Effect on Hover */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: `radial-gradient(circle at top right, ${accentColor}15, transparent 60%)` }}
      />

      {/* Icon container */}
      <div
        className={cn(
          "w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 z-10",
          "transition-all duration-300 group-hover:scale-110 group-hover:-rotate-6"
        )}
        style={{
          background: `linear-gradient(135deg, ${accentColor}30 0%, ${accentColor}10 100%)`,
          border: `1px solid ${accentColor}40`,
          boxShadow: `0 0 20px ${accentColor}20`,
        }}
      >
        <Icon size={26} style={{ color: accentColor }} strokeWidth={2} />
      </div>

      {/* Text */}
      <div className="flex flex-col gap-3 z-10 mt-2">
        <h3
          className={cn(
            "font-extrabold text-white leading-snug tracking-tight",
            highlight ? "text-3xl" : "text-xl"
          )}
          style={{ fontFamily: "var(--font-plus-jakarta-sans)" }}
        >
          {title}
        </h3>
        <p
          className={cn(
            "text-white/60 leading-relaxed font-medium",
            highlight ? "text-lg max-w-sm" : "text-sm"
          )}
          style={{ fontFamily: "var(--font-inter)" }}
        >
          {description}
        </p>
      </div>

      {/* Highlight card large decorative element */}
      {highlight && (
        <div
          className="absolute -bottom-10 -right-10 w-64 h-64 opacity-10 pointer-events-none group-hover:opacity-20 transition-opacity duration-500"
          style={{
            background: `radial-gradient(circle, ${accentColor} 0%, transparent 70%)`,
            filter: "blur(40px)",
          }}
          aria-hidden="true"
        />
      )}

      {/* Bottom accent line on hover */}
      <div
        className="absolute bottom-0 left-0 right-0 h-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)` }}
        aria-hidden="true"
      />
    </motion.div>
  );
}

// ─── Main Section ─────────────────────────────────────────────────────────────

export function WhyUniverseSection() {
  return (
    <section
      id="why"
      aria-label="Why UniVerse"
      className="relative py-32 md:py-40 overflow-hidden"
      style={{ background: "#050907" }}
    >
      {/* Background texture & Animated Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        {/* Subtle emerald glow top-left */}
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-[20%] -left-[10%] w-[800px] h-[800px] rounded-full blur-[120px]"
          style={{ background: "radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)" }}
        />
        {/* Amber glow bottom-right */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute -bottom-[20%] -right-[10%] w-[700px] h-[700px] rounded-full blur-[100px]"
          style={{ background: "radial-gradient(circle, rgba(245,158,11,0.12) 0%, transparent 70%)" }}
        />
        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px)`,
            backgroundSize: "80px 80px",
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.span
            whileHover={{ scale: 1.05 }}
            className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest cursor-default"
            style={{
              background: "linear-gradient(135deg, rgba(16,185,129,0.15), rgba(16,185,129,0.05))",
              border: "1px solid rgba(16,185,129,0.3)",
              color: "#34D399",
              fontFamily: "var(--font-inter)",
              boxShadow: "0 0 20px rgba(16,185,129,0.1)",
            }}
          >
            Built for students, by students
          </motion.span>

          <h2
            className="text-5xl md:text-6xl font-extrabold text-white leading-tight tracking-tight drop-shadow-lg"
            style={{ fontFamily: "var(--font-plus-jakarta-sans)" }}
          >
            Why{" "}
            <span
              className="relative inline-block"
            >
              <span className="relative z-10" style={{
                background: "linear-gradient(90deg, #34D399, #FBBF24)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>
                UniVerse
              </span>
              <span className="absolute inset-x-0 bottom-2 h-3 bg-emerald-500/20 blur-md -z-10" />
            </span>
          </h2>

          <p
            className="mt-6 text-xl text-white/50 max-w-2xl mx-auto font-medium"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            Not just a delivery app. A smarter campus experience.
          </p>
        </motion.div>

        {/* Bento grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
        >
          {ADVANTAGES.map((adv, i) => (
            <AdvantageCard key={adv.title} {...adv} index={i} />
          ))}
        </motion.div>

        {/* Bottom CTA bar */}
        <motion.div
          className="mt-24 flex flex-col sm:flex-row items-center justify-center gap-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <p className="text-white/50 text-base font-semibold tracking-wide" style={{ fontFamily: "var(--font-inter)" }}>
            Ready to join?
          </p>
          <motion.a
            href="/register"
            whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(16,185,129,0.4)" }}
            whileTap={{ scale: 0.95 }}
            className="relative overflow-hidden inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-bold text-white rounded-full transition-shadow duration-300 group"
            style={{
              background: "linear-gradient(135deg, #10B981, #059669)",
              fontFamily: "var(--font-inter)",
            }}
          >
            <span className="relative z-10 flex items-center gap-2">
              Join UniVerse — It&apos;s Free
              <motion.span
                className="inline-block"
                initial={{ x: 0 }}
                whileHover={{ x: 5 }}
              >
                →
              </motion.span>
            </span>
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out" />
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}
