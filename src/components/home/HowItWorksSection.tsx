"use client";

/**
 * UniVerse — How It Works Section
 *
 * Four step cards with premium glass illustration icons,
 * stagger animation on scroll, hover lift effect.
 */

import { motion } from "framer-motion";

// ─── Step illustration backgrounds ───────────────────────────────────────────

const STEP_ILLUSTRATIONS = [
  // Step 1: Request — phone with cart
  <svg key="s1" width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="72" height="72" rx="20" fill="#ECFDF5" />
    {/* Phone body */}
    <rect x="20" y="14" width="28" height="44" rx="6" fill="#10B981" opacity="0.15" />
    <rect x="22" y="16" width="24" height="40" rx="5" fill="white" stroke="#10B981" strokeWidth="1.5" />
    {/* Screen content */}
    <rect x="26" y="22" width="16" height="2" rx="1" fill="#10B981" opacity="0.5" />
    <rect x="26" y="27" width="12" height="2" rx="1" fill="#D1FAE5" />
    {/* Cart icon on screen */}
    <circle cx="34" cy="38" r="8" fill="#ECFDF5" />
    <path d="M 30 35 L 31 34 L 38 34 L 37 40 L 31 40 Z" fill="none" stroke="#10B981" strokeWidth="1.5" strokeLinejoin="round" />
    <circle cx="32" cy="42" r="1" fill="#10B981" />
    <circle cx="36" cy="42" r="1" fill="#10B981" />
    {/* Home button */}
    <rect x="30" y="51" width="8" height="2" rx="1" fill="#D1FAE5" />
    {/* Floating + badge */}
    <circle cx="50" cy="20" r="9" fill="#10B981" />
    <rect x="45.5" y="19.5" width="9" height="1.5" rx="0.75" fill="white" />
    <rect x="49.25" y="15.75" width="1.5" height="9" rx="0.75" fill="white" />
  </svg>,

  // Step 2: Accept — person + checkmark
  <svg key="s2" width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="72" height="72" rx="20" fill="#FFFBEB" />
    {/* Person silhouette */}
    <circle cx="36" cy="24" r="10" fill="#F59E0B" opacity="0.2" />
    <circle cx="36" cy="24" r="7" fill="#F59E0B" opacity="0.5" />
    {/* Body */}
    <path d="M 24 50 Q 24 38 36 38 Q 48 38 48 50" fill="#F59E0B" opacity="0.25" />
    <path d="M 24 50 Q 24 40 36 40 Q 48 40 48 50" fill="none" stroke="#F59E0B" strokeWidth="1.5" />
    {/* Big green check */}
    <circle cx="50" cy="50" r="12" fill="#10B981" />
    <path d="M 44 50 L 48 54 L 56 46" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>,

  // Step 3: Deliver — running person with bag
  <svg key="s3" width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="72" height="72" rx="20" fill="#EFF6FF" />
    {/* Running figure */}
    <circle cx="32" cy="20" r="6" fill="#6366F1" opacity="0.3" />
    <circle cx="32" cy="20" r="4" fill="#6366F1" opacity="0.6" />
    {/* Body */}
    <rect x="27" y="27" width="10" height="14" fill="#6366F1" rx="3" opacity="0.7" />
    {/* Legs — running */}
    <path d="M 29 41 L 24 52" stroke="#6366F1" strokeWidth="3.5" strokeLinecap="round" opacity="0.7" />
    <path d="M 35 41 L 40 52" stroke="#6366F1" strokeWidth="3.5" strokeLinecap="round" opacity="0.7" />
    {/* Arms */}
    <path d="M 37 30 L 46 26" stroke="#6366F1" strokeWidth="3" strokeLinecap="round" opacity="0.7" />
    <path d="M 27 30 L 20 36" stroke="#6366F1" strokeWidth="3" strokeLinecap="round" opacity="0.7" />
    {/* Delivery bag */}
    <rect x="44" y="20" width="16" height="18" rx="4" fill="#10B981" />
    <text x="52" y="31" textAnchor="middle" fill="white" fontSize="8" fontFamily="sans-serif" fontWeight="800">UV</text>
    <path d="M 47 20 Q 48 16 52 16 Q 56 16 57 20" fill="none" stroke="white" strokeWidth="1.5" opacity="0.7" />
    {/* Motion lines */}
    <path d="M 14 30 L 20 30" stroke="#6366F1" strokeWidth="2" strokeLinecap="round" opacity="0.3" />
    <path d="M 12 36 L 18 36" stroke="#6366F1" strokeWidth="2" strokeLinecap="round" opacity="0.2" />
    <path d="M 15 42 L 20 42" stroke="#6366F1" strokeWidth="2" strokeLinecap="round" opacity="0.15" />
  </svg>,

  // Step 4: Reward — coins + star
  <svg key="s4" width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="72" height="72" rx="20" fill="#FFFBEB" />
    {/* Big coin */}
    <circle cx="36" cy="36" r="18" fill="#F59E0B" opacity="0.18" />
    <circle cx="36" cy="36" r="14" fill="#FCD34D" opacity="0.6" />
    <circle cx="36" cy="36" r="10" fill="#F59E0B" />
    {/* Coin symbol */}
    <text x="36" y="40.5" textAnchor="middle" fill="white" fontSize="12" fontFamily="sans-serif" fontWeight="800">₹</text>
    {/* Stars */}
    <path d="M 56 14 L 57.5 18.5 L 62 18.5 L 58.5 21.5 L 60 26 L 56 23 L 52 26 L 53.5 21.5 L 50 18.5 L 54.5 18.5 Z" fill="#F59E0B" opacity="0.8" />
    <path d="M 18 20 L 19 23 L 22 23 L 19.5 25 L 20.5 28 L 18 26.5 L 15.5 28 L 16.5 25 L 14 23 L 17 23 Z" fill="#FCD34D" opacity="0.7" />
    {/* Small coins */}
    <circle cx="55" cy="48" r="6" fill="#FCD34D" opacity="0.8" />
    <text x="55" y="51.5" textAnchor="middle" fill="#B45309" fontSize="7" fontFamily="sans-serif" fontWeight="800">₹</text>
    <circle cx="16" cy="50" r="5" fill="#F59E0B" opacity="0.6" />
    <text x="16" y="53" textAnchor="middle" fill="white" fontSize="6" fontFamily="sans-serif" fontWeight="800">₹</text>
  </svg>,
];

const STEPS = [
  {
    step: "01",
    title: "Request Item",
    description:
      "Open UniVerse, pick your snack or drink from the hostel vending machine menu, and place your request in seconds.",
    accentColor: "#10B981",
    bgGlow: "rgba(16,185,129,0.06)",
    borderGlow: "rgba(16,185,129,0.18)",
  },
  {
    step: "02",
    title: "Nearby Student Accepts",
    description:
      "A verified student near the vending machine receives your request and accepts it instantly through the app.",
    accentColor: "#F59E0B",
    bgGlow: "rgba(245,158,11,0.06)",
    borderGlow: "rgba(245,158,11,0.18)",
  },
  {
    step: "03",
    title: "Delivery to Your Room",
    description:
      "The runner purchases your item, heads to your hostel room, and delivers it right to your door.",
    accentColor: "#6366F1",
    bgGlow: "rgba(99,102,241,0.06)",
    borderGlow: "rgba(99,102,241,0.18)",
  },
  {
    step: "04",
    title: "Earn Reward",
    description:
      "Both parties rate each other. The delivery student earns a reward instantly credited to their UniVerse balance.",
    accentColor: "#F59E0B",
    bgGlow: "rgba(245,158,11,0.06)",
    borderGlow: "rgba(245,158,11,0.18)",
  },
] as const;

// ─── Step Card ────────────────────────────────────────────────────────────────

const cardVariants = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0 },
};

function StepCard({
  step,
  title,
  description,
  illustration,
  accentColor,
  bgGlow,
  borderGlow,
  index,
}: {
  step: string;
  title: string;
  description: string;
  illustration: React.ReactNode;
  accentColor: string;
  bgGlow: string;
  borderGlow: string;
  index: number;
}) {
  return (
    <motion.div
      variants={cardVariants}
      transition={{ duration: 0.55, delay: index * 0.12, ease: [0.4, 0, 0.2, 1] }}
      whileHover={{ y: -6, transition: { duration: 0.25, ease: "easeOut" } }}
      className="group relative flex flex-col rounded-[var(--radius-xl)] p-7 cursor-default"
      style={{
        background: `rgba(255,255,255,0.72)`,
        backdropFilter: "blur(16px) saturate(180%)",
        WebkitBackdropFilter: "blur(16px) saturate(180%)",
        border: `1px solid`,
        borderColor: borderGlow,
        boxShadow: `0 4px 24px ${bgGlow}, 0 1px 4px rgba(0,0,0,0.04)`,
        transition: "box-shadow 0.3s ease",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow =
          `0 12px 40px ${bgGlow.replace("0.06", "0.18")}, 0 4px 16px rgba(0,0,0,0.06)`;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow =
          `0 4px 24px ${bgGlow}, 0 1px 4px rgba(0,0,0,0.04)`;
      }}
    >
      {/* Step number */}
      <span
        className="absolute top-5 right-6 text-5xl font-extrabold leading-none select-none"
        style={{
          color: accentColor,
          opacity: 0.08,
          fontFamily: "var(--font-plus-jakarta-sans)",
        }}
      >
        {step}
      </span>

      {/* Illustration */}
      <div className="mb-5 w-fit">
        {illustration}
      </div>

      {/* Step pill */}
      <span
        className="inline-flex items-center mb-3 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider w-fit"
        style={{
          background: `${accentColor}18`,
          color: accentColor,
          fontFamily: "var(--font-inter)",
        }}
      >
        Step {step}
      </span>

      {/* Title */}
      <h3
        className="text-xl font-bold text-[var(--color-text)] mb-2 leading-snug"
        style={{ fontFamily: "var(--font-plus-jakarta-sans)" }}
      >
        {title}
      </h3>

      {/* Description */}
      <p
        className="text-sm text-[var(--color-text-muted)] leading-relaxed"
        style={{ fontFamily: "var(--font-inter)" }}
      >
        {description}
      </p>

      {/* Bottom accent line */}
      <div
        className="absolute bottom-0 left-6 right-6 h-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: `linear-gradient(90deg, ${accentColor}, transparent)` }}
      />
    </motion.div>
  );
}

// ─── Main Section ─────────────────────────────────────────────────────────────

export function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      aria-label="How UniVerse works"
      className="relative py-24 md:py-32 overflow-hidden"
      style={{ background: "var(--color-bg)" }}
    >
      {/* Background glow blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div
          className="absolute -top-40 -left-40 w-96 h-96 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 70%)" }}
        />
        <div
          className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(245,158,11,0.06) 0%, transparent 70%)" }}
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
          {/* Overline */}
          <span
            className="inline-flex items-center gap-2 mb-4 px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-widest"
            style={{
              background: "rgba(16,185,129,0.1)",
              border: "1px solid rgba(16,185,129,0.25)",
              color: "#059669",
              fontFamily: "var(--font-inter)",
            }}
          >
            Simple. Fast. Smart.
          </span>

          <h2
            className="text-4xl md:text-5xl font-extrabold text-[var(--color-text)] leading-tight"
            style={{ fontFamily: "var(--font-plus-jakarta-sans)" }}
          >
            How UniVerse{" "}
            <span
              style={{
                background: "linear-gradient(90deg, #10B981, #F59E0B)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Works
            </span>
          </h2>

          <p
            className="mt-4 text-lg text-[var(--color-text-muted)] max-w-xl mx-auto"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            Four effortless steps from craving to delivery.
          </p>
        </motion.div>

        {/* Cards grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
        >
          {STEPS.map((step, i) => (
            <StepCard
              key={step.step}
              {...step}
              illustration={STEP_ILLUSTRATIONS[i]}
              index={i}
            />
          ))}
        </motion.div>

        {/* Connector arrows between cards — desktop only */}
        <div className="hidden lg:flex items-center justify-center gap-0 mt-2 pointer-events-none select-none" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex-1 flex justify-center opacity-20">
              <div className="w-full max-w-[120px] flex items-center justify-center">
                <div
                  className="h-px flex-1 opacity-50"
                  style={{ background: "linear-gradient(90deg, #10B981, #F59E0B)" }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
