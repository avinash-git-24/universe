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
  hidden: { opacity: 0, y: 24, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1 },
};

function AdvantageCard({
  icon: Icon,
  title,
  description,
  accentColor,
  highlight,
  index,
}: {
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; style?: React.CSSProperties }>;
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
      transition={{ duration: 0.5, delay: index * 0.1, ease: [0.4, 0, 0.2, 1] }}
      whileHover={{ y: -4, transition: { duration: 0.22, ease: "easeOut" } }}
      className={cn(
        "group relative flex flex-col gap-4 p-7 rounded-[var(--radius-xl)]",
        "cursor-default transition-all duration-300",
        highlight
          ? "md:col-span-2 md:row-span-2"
          : ""
      )}
      style={{
        background: highlight
          ? `linear-gradient(135deg, rgba(16,185,129,0.12) 0%, rgba(16,185,129,0.04) 100%)`
          : "rgba(255,255,255,0.04)",
        border: `1px solid`,
        borderColor: highlight ? "rgba(16,185,129,0.25)" : "rgba(255,255,255,0.1)",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.borderColor = `${accentColor}40`;
        el.style.background = highlight
          ? `linear-gradient(135deg, rgba(16,185,129,0.18) 0%, rgba(16,185,129,0.08) 100%)`
          : "rgba(255,255,255,0.07)";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.borderColor = highlight ? "rgba(16,185,129,0.25)" : "rgba(255,255,255,0.1)";
        el.style.background = highlight
          ? `linear-gradient(135deg, rgba(16,185,129,0.12) 0%, rgba(16,185,129,0.04) 100%)`
          : "rgba(255,255,255,0.04)";
      }}
    >
      {/* Icon container */}
      <div
        className={cn(
          "w-12 h-12 rounded-[var(--radius-md)] flex items-center justify-center flex-shrink-0",
          "transition-transform duration-300 group-hover:scale-110"
        )}
        style={{
          background: `${accentColor}20`,
          border: `1px solid ${accentColor}30`,
        }}
      >
        {(() => {
          return <Icon size={22} style={{ color: accentColor }} strokeWidth={1.8} />;
        })()}
      </div>

      {/* Text */}
      <div className="flex flex-col gap-2">
        <h3
          className={cn(
            "font-bold text-white leading-snug",
            highlight ? "text-2xl" : "text-lg"
          )}
          style={{ fontFamily: "var(--font-plus-jakarta-sans)" }}
        >
          {title}
        </h3>
        <p
          className={cn(
            "text-white/55 leading-relaxed",
            highlight ? "text-base max-w-xs" : "text-sm"
          )}
          style={{ fontFamily: "var(--font-inter)" }}
        >
          {description}
        </p>
      </div>

      {/* Accent glow corner — on highlight card */}
      {highlight && (
        <div
          className="absolute top-0 right-0 w-40 h-40 rounded-[var(--radius-xl)] pointer-events-none"
          style={{
            background: "radial-gradient(circle at top right, rgba(16,185,129,0.15) 0%, transparent 70%)",
          }}
          aria-hidden="true"
        />
      )}

      {/* Bottom accent line on hover */}
      <div
        className="absolute bottom-0 left-6 right-6 h-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: `linear-gradient(90deg, ${accentColor}80, transparent)` }}
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
      className="relative py-24 md:py-32 overflow-hidden"
      style={{ background: "#0A0F0D" }}
    >
      {/* Background texture */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        {/* Subtle emerald glow top-left */}
        <div
          className="absolute -top-60 -left-60 w-[600px] h-[600px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 65%)" }}
        />
        {/* Amber glow bottom-right */}
        <div
          className="absolute -bottom-60 -right-60 w-[500px] h-[500px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(245,158,11,0.06) 0%, transparent 65%)" }}
        />
        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        >
          <span
            className="inline-flex items-center gap-2 mb-4 px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-widest"
            style={{
              background: "rgba(16,185,129,0.12)",
              border: "1px solid rgba(16,185,129,0.25)",
              color: "#10B981",
              fontFamily: "var(--font-inter)",
            }}
          >
            Built for students, by students
          </span>

          <h2
            className="text-4xl md:text-5xl font-extrabold text-white leading-tight"
            style={{ fontFamily: "var(--font-plus-jakarta-sans)" }}
          >
            Why{" "}
            <span
              style={{
                background: "linear-gradient(90deg, #10B981, #F59E0B)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              UniVerse
            </span>
          </h2>

          <p
            className="mt-4 text-lg text-white/45 max-w-lg mx-auto"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            Not just a delivery app. A smarter campus experience.
          </p>
        </motion.div>

        {/* Bento grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4"
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
          className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-4"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <p className="text-white/40 text-sm font-medium" style={{ fontFamily: "var(--font-inter)" }}>
            Ready to join?
          </p>
          <motion.a
            href="/register"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white rounded-[var(--radius-md)]"
            style={{
              background: "linear-gradient(135deg, #10B981, #059669)",
              boxShadow: "0 0 0 1px rgba(16,185,129,0.4), 0 4px 20px rgba(16,185,129,0.3)",
              fontFamily: "var(--font-inter)",
            }}
          >
            Join UniVerse — It&apos;s Free
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}
