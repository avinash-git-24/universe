"use client";

/**
 * UniVerse — Auth Card Shell (pixel-perfect match to reference image)
 *
 * Layout:
 *  - UniVerse logo + tagline centered ABOVE the card
 *  - Glassmorphism card with green border glow
 *  - "Welcome Back!" pill badge in top-right of card header
 *  - "Welcome Back" title with sparkle on left, sparkle on right
 *  - Subtitle below title
 *  - Form content
 *  - Trust bar at bottom of page
 */

import { motion } from "framer-motion";
import Link from "next/link";
import { ROUTES } from "@/constants/routes";
import { Zap, Shield, Lock, Users } from "lucide-react";

interface AuthCardProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

// 4-pointed sparkle SVG
function Sparkle({ size = 14, opacity = 0.8 }: { size?: number; opacity?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" style={{ opacity, flexShrink: 0 }}>
      <path d="M10 0 L11.5 8.5 L20 10 L11.5 11.5 L10 20 L8.5 11.5 L0 10 L8.5 8.5 Z" fill="#00E676" />
    </svg>
  );
}

export function AuthCard({ title, subtitle, children }: AuthCardProps) {
  return (
    <motion.div
      className="w-full flex flex-col items-center"
      style={{ maxWidth: "460px" }}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* ── Logo + tagline (above card) ── */}
      <div className="flex flex-col items-center gap-2 mb-8">
        <Link
          href={ROUTES.HOME}
          className="inline-flex items-center gap-2.5 group"
          aria-label="UniVerse — Back to Home"
        >
          <div
            className="w-10 h-10 rounded-[10px] flex items-center justify-center flex-shrink-0"
            style={{
              background: "linear-gradient(135deg, #00E676 0%, #00A854 100%)",
              boxShadow: "0 0 16px rgba(0,230,118,0.4)",
            }}
          >
            <Zap size={20} className="text-black fill-black" />
          </div>
          <span
            className="text-[2rem] font-extrabold tracking-tight text-white"
            style={{ fontFamily: "var(--font-plus-jakarta-sans)", letterSpacing: "-0.02em" }}
          >
            Uni<span style={{ color: "#00E676", textShadow: "0 0 20px rgba(0,230,118,0.5)" }}>Verse</span>
          </span>
        </Link>
        <p
          className="text-sm text-center"
          style={{ color: "rgba(167,184,176,0.8)", fontFamily: "var(--font-inter)" }}
        >
          One Universe. Infinite Possibilities.
        </p>
      </div>

      {/* ── Glass card ── */}
      <div
        className="w-full rounded-[28px] relative overflow-hidden"
        style={{
          background: "rgba(8,16,11,0.75)",
          border: "1px solid rgba(0,230,118,0.2)",
          backdropFilter: "blur(32px)",
          WebkitBackdropFilter: "blur(32px)",
          boxShadow: "0 0 0 1px rgba(0,230,118,0.06), 0 0 40px rgba(0,230,118,0.12), 0 40px 80px rgba(0,0,0,0.7)",
        }}
      >
        {/* Inner top highlight line */}
        <div
          className="absolute top-0 left-0 right-0 h-[1px]"
          style={{ background: "linear-gradient(90deg, transparent, rgba(0,230,118,0.4) 40%, rgba(0,230,118,0.4) 60%, transparent)" }}
        />

        {/* ── Card Header ── */}
        <div className="px-8 pt-8 pb-6" style={{ position: "relative" }}>
          {/* "Welcome Back!" pill — top right */}
          <div
            className="absolute top-7 right-7 flex items-center gap-1.5 px-3 py-1.5 rounded-full"
            style={{
              background: "rgba(0,230,118,0.1)",
              border: "1px solid rgba(0,230,118,0.25)",
              backdropFilter: "blur(8px)",
            }}
          >
            <Sparkle size={10} />
            <span
              className="text-xs font-semibold"
              style={{ color: "#00E676", fontFamily: "var(--font-inter)" }}
            >
              Welcome Back!
            </span>
          </div>

          {/* Sparkle top-left of title area */}
          <div className="mb-3">
            <Sparkle size={12} opacity={0.6} />
          </div>

          {/* Title row */}
          <div className="flex items-center gap-2.5">
            <h1
              className="text-[1.75rem] font-bold text-white leading-tight"
              style={{ fontFamily: "var(--font-plus-jakarta-sans)", letterSpacing: "-0.02em" }}
            >
              {title}
            </h1>
            <Sparkle size={14} opacity={0.7} />
          </div>

          {/* Subtitle */}
          <p
            className="mt-1.5 text-sm"
            style={{ color: "rgba(167,184,176,0.85)", fontFamily: "var(--font-inter)" }}
          >
            {subtitle}
          </p>
        </div>

        {/* ── Form content ── */}
        <div className="px-8 pb-8">
          {children}
        </div>
      </div>

      {/* ── Trust bar (below card) ── */}
      <div
        className="flex items-center justify-center gap-6 mt-8 flex-wrap"
        style={{ opacity: 0.55 }}
      >
        <div className="flex items-center gap-1.5">
          <Shield size={13} color="#00E676" />
          <span className="text-xs text-[#A7B8B0]" style={{ fontFamily: "var(--font-inter)" }}>256-bit Encrypted</span>
        </div>
        <span className="text-[#A7B8B0] text-xs">•</span>
        <div className="flex items-center gap-1.5">
          <Lock size={13} color="#00E676" />
          <span className="text-xs text-[#A7B8B0]" style={{ fontFamily: "var(--font-inter)" }}>Your Data is Private</span>
        </div>
        <span className="text-[#A7B8B0] text-xs">•</span>
        <div className="flex items-center gap-1.5">
          <Users size={13} color="#00E676" />
          <span className="text-xs text-[#A7B8B0]" style={{ fontFamily: "var(--font-inter)" }}>Trusted by Students</span>
        </div>
      </div>
    </motion.div>
  );
}
