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
  <svg key="s1" width="80" height="80" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: "drop-shadow(0 10px 15px rgba(16,185,129,0.2))" }}>
    <rect width="72" height="72" rx="20" fill="url(#grad1)"/>
    {/* Phone body */}
    <rect x="20" y="14" width="28" height="44" rx="6" fill="#10B981" opacity="0.15"/>
    <rect x="22" y="16" width="24" height="40" rx="5" fill="white" stroke="#10B981" strokeWidth="1.5"/>
    {/* Screen content */}
    <rect x="26" y="22" width="16" height="2" rx="1" fill="#10B981" opacity="0.5"/>
    <rect x="26" y="27" width="12" height="2" rx="1" fill="#D1FAE5"/>
    {/* Cart icon on screen */}
    <circle cx="34" cy="38" r="8" fill="#ECFDF5"/>
    <path d="M 30 35 L 31 34 L 38 34 L 37 40 L 31 40 Z" fill="none" stroke="#10B981" strokeWidth="1.5" strokeLinejoin="round"/>
    <circle cx="32" cy="42" r="1" fill="#10B981"/>
    <circle cx="36" cy="42" r="1" fill="#10B981"/>
    {/* Home button */}
    <rect x="30" y="51" width="8" height="2" rx="1" fill="#D1FAE5"/>
    {/* Floating + badge */}
    <circle cx="50" cy="20" r="10" fill="#10B981"/>
    <rect x="45.5" y="19.5" width="9" height="1.5" rx="0.75" fill="white"/>
    <rect x="49.25" y="15.75" width="1.5" height="9" rx="0.75" fill="white"/>
    <defs>
      <linearGradient id="grad1" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#ECFDF5" />
        <stop offset="100%" stopColor="#D1FAE5" />
      </linearGradient>
    </defs>
  </svg>,

  // Step 2: Accept — person + checkmark
  <svg key="s2" width="80" height="80" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: "drop-shadow(0 10px 15px rgba(245,158,11,0.2))" }}>
    <rect width="72" height="72" rx="20" fill="url(#grad2)"/>
    {/* Person silhouette */}
    <circle cx="36" cy="24" r="10" fill="#F59E0B" opacity="0.2"/>
    <circle cx="36" cy="24" r="7" fill="#F59E0B" opacity="0.5"/>
    {/* Body */}
    <path d="M 24 50 Q 24 38 36 38 Q 48 38 48 50" fill="#F59E0B" opacity="0.25"/>
    <path d="M 24 50 Q 24 40 36 40 Q 48 40 48 50" fill="none" stroke="#F59E0B" strokeWidth="1.5"/>
    {/* Big green check */}
    <circle cx="50" cy="50" r="13" fill="#10B981"/>
    <path d="M 44 50 L 48 54 L 56 46" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    <defs>
      <linearGradient id="grad2" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#FFFBEB" />
        <stop offset="100%" stopColor="#FEF3C7" />
      </linearGradient>
    </defs>
  </svg>,

  // Step 3: Deliver — running person with bag
  <svg key="s3" width="80" height="80" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: "drop-shadow(0 10px 15px rgba(99,102,241,0.2))" }}>
    <rect width="72" height="72" rx="20" fill="url(#grad3)"/>
    {/* Running figure */}
    <circle cx="32" cy="20" r="6" fill="#6366F1" opacity="0.3"/>
    <circle cx="32" cy="20" r="4" fill="#6366F1" opacity="0.6"/>
    {/* Body */}
    <rect x="27" y="27" width="10" height="14" fill="#6366F1" rx="3" opacity="0.7"/>
    {/* Legs — running */}
    <path d="M 29 41 L 24 52" stroke="#6366F1" strokeWidth="3.5" strokeLinecap="round" opacity="0.7"/>
    <path d="M 35 41 L 40 52" stroke="#6366F1" strokeWidth="3.5" strokeLinecap="round" opacity="0.7"/>
    {/* Arms */}
    <path d="M 37 30 L 46 26" stroke="#6366F1" strokeWidth="3" strokeLinecap="round" opacity="0.7"/>
    <path d="M 27 30 L 20 36" stroke="#6366F1" strokeWidth="3" strokeLinecap="round" opacity="0.7"/>
    {/* Delivery bag */}
    <rect x="44" y="20" width="16" height="18" rx="4" fill="#10B981"/>
    <text x="52" y="31" textAnchor="middle" fill="white" fontSize="8" fontFamily="sans-serif" fontWeight="800">UV</text>
    <path d="M 47 20 Q 48 16 52 16 Q 56 16 57 20" fill="none" stroke="white" strokeWidth="1.5" opacity="0.7"/>
    {/* Motion lines */}
    <path d="M 14 30 L 20 30" stroke="#6366F1" strokeWidth="2" strokeLinecap="round" opacity="0.3"/>
    <path d="M 12 36 L 18 36" stroke="#6366F1" strokeWidth="2" strokeLinecap="round" opacity="0.2"/>
    <path d="M 15 42 L 20 42" stroke="#6366F1" strokeWidth="2" strokeLinecap="round" opacity="0.15"/>
    <defs>
      <linearGradient id="grad3" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#EFF6FF" />
        <stop offset="100%" stopColor="#DBEAFE" />
      </linearGradient>
    </defs>
  </svg>,

  // Step 4: Reward — coins + star
  <svg key="s4" width="80" height="80" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: "drop-shadow(0 10px 15px rgba(245,158,11,0.2))" }}>
    <rect width="72" height="72" rx="20" fill="url(#grad4)"/>
    {/* Big coin */}
    <circle cx="36" cy="36" r="18" fill="#F59E0B" opacity="0.18"/>
    <circle cx="36" cy="36" r="14" fill="#FCD34D" opacity="0.6"/>
    <circle cx="36" cy="36" r="10" fill="#F59E0B"/>
    {/* Coin symbol */}
    <text x="36" y="40.5" textAnchor="middle" fill="white" fontSize="12" fontFamily="sans-serif" fontWeight="800">₹</text>
    {/* Stars */}
    <path d="M 56 14 L 57.5 18.5 L 62 18.5 L 58.5 21.5 L 60 26 L 56 23 L 52 26 L 53.5 21.5 L 50 18.5 L 54.5 18.5 Z" fill="#F59E0B" opacity="0.8"/>
    <path d="M 18 20 L 19 23 L 22 23 L 19.5 25 L 20.5 28 L 18 26.5 L 15.5 28 L 16.5 25 L 14 23 L 17 23 Z" fill="#FCD34D" opacity="0.7"/>
    {/* Small coins */}
    <circle cx="55" cy="48" r="6" fill="#FCD34D" opacity="0.8"/>
    <text x="55" y="51.5" textAnchor="middle" fill="#B45309" fontSize="7" fontFamily="sans-serif" fontWeight="800">₹</text>
    <circle cx="16" cy="50" r="5" fill="#F59E0B" opacity="0.6"/>
    <text x="16" y="53" textAnchor="middle" fill="white" fontSize="6" fontFamily="sans-serif" fontWeight="800">₹</text>
    <defs>
      <linearGradient id="grad4" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#FFFBEB" />
        <stop offset="100%" stopColor="#FEF3C7" />
      </linearGradient>
    </defs>
  </svg>,
];

const STEPS = [
  {
    step: "01",
    title: "Request Item",
    description:
      "Open UniVerse, pick your snack or drink from the hostel vending machine menu, and place your request in seconds.",
    accentColor: "#10B981",
    bgGlow: "rgba(16,185,129,0.08)",
    borderGlow: "rgba(16,185,129,0.25)",
  },
  {
    step: "02",
    title: "Nearby Student Accepts",
    description:
      "A verified student near the vending machine receives your request and accepts it instantly through the app.",
    accentColor: "#F59E0B",
    bgGlow: "rgba(245,158,11,0.08)",
    borderGlow: "rgba(245,158,11,0.25)",
  },
  {
    step: "03",
    title: "Delivery to Your Room",
    description:
      "The runner purchases your item, heads to your hostel room, and delivers it right to your door.",
    accentColor: "#6366F1",
    bgGlow: "rgba(99,102,241,0.08)",
    borderGlow: "rgba(99,102,241,0.25)",
  },
  {
    step: "04",
    title: "Earn Reward",
    description:
      "Both parties rate each other. The delivery student earns a reward instantly credited to their UniVerse balance.",
    accentColor: "#F59E0B",
    bgGlow: "rgba(245,158,11,0.08)",
    borderGlow: "rgba(245,158,11,0.25)",
  },
] as const;

// ─── Step Card ────────────────────────────────────────────────────────────────

const cardVariants = {
  hidden:  { opacity: 0, y: 40, scale: 0.95 },
  visible: { opacity: 1, y: 0,  scale: 1    },
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
      transition={{ duration: 0.6, delay: index * 0.15, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -10, scale: 1.02, transition: { duration: 0.3, ease: "easeOut" } }}
      className="group relative flex flex-col rounded-[2rem] p-8 cursor-default overflow-hidden bg-white"
      style={{
        border: `1px solid ${borderGlow}`,
        boxShadow: `0 10px 40px ${bgGlow}, 0 2px 10px rgba(0,0,0,0.02)`,
        transition: "box-shadow 0.3s ease",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow =
          `0 20px 50px ${bgGlow.replace("0.08", "0.2")}, 0 10px 20px rgba(0,0,0,0.04)`;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow =
          `0 10px 40px ${bgGlow}, 0 2px 10px rgba(0,0,0,0.02)`;
      }}
    >
      {/* Background abstract shape */}
      <div 
        className="absolute -top-12 -right-12 w-48 h-48 rounded-full opacity-20 group-hover:opacity-40 transition-opacity duration-500 pointer-events-none blur-3xl"
        style={{ background: accentColor }}
      />

      {/* Step number */}
      <span
        className="absolute top-6 right-8 text-6xl font-black leading-none select-none transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3"
        style={{
          color: accentColor,
          opacity: 0.06,
          fontFamily: "var(--font-plus-jakarta-sans)",
        }}
      >
        {step}
      </span>

      {/* Illustration */}
      <motion.div 
        className="mb-8 w-fit relative z-10"
        whileHover={{ scale: 1.05, rotate: -2 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        {illustration}
      </motion.div>

      {/* Step pill */}
      <span
        className="inline-flex items-center mb-4 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest w-fit shadow-sm relative z-10"
        style={{
          background: `linear-gradient(135deg, ${accentColor}15, ${accentColor}05)`,
          border: `1px solid ${accentColor}30`,
          color: accentColor,
          fontFamily: "var(--font-inter)",
        }}
      >
        Step {step}
      </span>

      {/* Title */}
      <h3
        className="text-2xl font-extrabold text-slate-800 mb-3 leading-tight tracking-tight relative z-10"
        style={{ fontFamily: "var(--font-plus-jakarta-sans)" }}
      >
        {title}
      </h3>

      {/* Description */}
      <p
        className="text-base text-slate-500 leading-relaxed font-medium relative z-10"
        style={{ fontFamily: "var(--font-inter)" }}
      >
        {description}
      </p>

      {/* Bottom accent line */}
      <div
        className="absolute bottom-0 left-0 right-0 h-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: `linear-gradient(90deg, ${accentColor}80, ${accentColor})` }}
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
      className="relative py-32 md:py-40 overflow-hidden bg-slate-50"
    >
      {/* Background glow blobs & Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <motion.div
          animate={{ x: [0, 20, 0], y: [0, 30, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute top-0 -left-40 w-[800px] h-[800px] rounded-full blur-[100px]"
          style={{ background: "radial-gradient(circle, rgba(16,185,129,0.05) 0%, transparent 60%)" }}
        />
        <motion.div
          animate={{ x: [0, -30, 0], y: [0, -20, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-0 -right-40 w-[800px] h-[800px] rounded-full blur-[100px]"
          style={{ background: "radial-gradient(circle, rgba(245,158,11,0.05) 0%, transparent 60%)" }}
        />
        
        {/* Dot pattern */}
        <div className="absolute inset-0 opacity-[0.4]" style={{ backgroundImage: 'radial-gradient(#CBD5E1 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div
          className="text-center mb-24"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Overline */}
          <span
            className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest bg-white shadow-sm border border-emerald-100"
            style={{
              color: "#059669",
              fontFamily: "var(--font-inter)",
            }}
          >
            Simple. Fast. Smart.
          </span>

          <h2
            className="text-5xl md:text-6xl font-extrabold text-slate-800 leading-tight tracking-tight drop-shadow-sm"
            style={{ fontFamily: "var(--font-plus-jakarta-sans)" }}
          >
            How UniVerse{" "}
            <span
              className="relative inline-block"
            >
              <span className="relative z-10" style={{
                background: "linear-gradient(90deg, #10B981, #F59E0B)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>
                Works
              </span>
              <span className="absolute inset-x-0 bottom-2 h-3 bg-emerald-100 -z-10 rounded-full blur-sm" />
            </span>
          </h2>

          <p
            className="mt-6 text-xl text-slate-500 max-w-xl mx-auto font-medium"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            Four effortless steps from craving to delivery.
          </p>
        </motion.div>

        {/* Cards grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
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
        <div className="hidden lg:flex items-center justify-center gap-0 mt-4 pointer-events-none select-none" aria-hidden="true">
          {[0,1,2].map((i) => (
            <div key={i} className="flex-1 flex justify-center opacity-30">
              <div className="w-full max-w-[150px] flex items-center justify-center">
                <div
                  className="h-1 flex-1 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"
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
