"use client";

/**
 * UniVerse - Footer
 *
 * Premium dark campus footer.
 * Balanced 4-column layout:
 * - Brand & mission
 * - Campus Super-App services
 * - Trust & platform legal
 * - Marwadi University student hub card
 */

import { useState } from "react";
import Link from "next/link";
import { Zap, Mail, Share2, Check, ShieldCheck, ArrowRight, Sparkles, MapPin } from "lucide-react";

function ShareButton() {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url =
      typeof window !== "undefined"
        ? window.location.origin
        : "https://universe-brown-seven.vercel.app";
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "UniVerse - Marwadi University Campus Super-App",
          text: "Hostel food delivery, student resale marketplace, and campus network for Marwadi University!",
          url,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2200);
      } catch {
        // clipboard error
      }
    }
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-[var(--radius-md)] text-xs font-medium text-white/75 hover:text-white transition-all duration-200 border border-white/10 hover:border-emerald-500/40 hover:bg-white/[0.08] cursor-pointer active:scale-95"
      style={{ background: "rgba(255,255,255,0.04)" }}
      title="Share UniVerse with campus friends"
    >
      {copied ? (
        <>
          <Check size={13} className="text-emerald-400" />
          <span className="text-emerald-400 font-semibold">Link Copied! 🎉</span>
        </>
      ) : (
        <>
          <Share2 size={13} className="text-emerald-400" />
          <span>Share App</span>
        </>
      )}
    </button>
  );
}

const YEAR = new Date().getFullYear();

interface FooterLinkItem {
  label: string;
  href: string;
  badge?: string | null;
}

const FOOTER_SECTIONS: Record<string, FooterLinkItem[]> = {
  "Campus Super-App": [
    { label: "Hostel Deliveries", href: "/#features", badge: "Live" },
    { label: "Resale Marketplace", href: "/dashboard/marketplace", badge: null },
    { label: "Become a Runner", href: "/#how-it-works", badge: "Earn" },
    { label: "Live Order Radar", href: "/dashboard/requests", badge: null },
    { label: "Student Peer Chat", href: "/dashboard/chat", badge: null },
  ],
  "Trust & Safety": [
    { label: "How It Works", href: "/#how-it-works", badge: null },
    { label: "Why UniVerse", href: "/#why", badge: null },
    { label: "About Our Team", href: "/about", badge: null },
    { label: "Escrow OTP Protocol", href: "/terms", badge: "Safe" },
    { label: "Privacy Policy", href: "/privacy", badge: null },
    { label: "Terms of Service", href: "/terms", badge: null },
  ],
};

// ─── Footer Link Column ───────────────────────────────────────────────────────

function FooterColumn({
  heading,
  links,
}: {
  heading: string;
  links: FooterLinkItem[];
}) {
  return (
    <div className="flex flex-col gap-4">
      <h4
        className="text-xs font-extrabold uppercase tracking-[0.14em] text-white/40"
        style={{ fontFamily: "var(--font-inter)" }}
      >
        {heading}
      </h4>
      <ul className="flex flex-col gap-2.5" role="list">
        {links.map(({ label, href, badge }) => (
          <li key={label}>
            <Link
              href={href}
              className="group inline-flex items-center gap-2 text-sm text-white/55 hover:text-white transition-colors duration-200 font-[family-name:var(--font-inter)]"
            >
              <span className="group-hover:translate-x-0.5 transition-transform duration-200">
                {label}
              </span>
              {badge && (
                <span className="text-[9px] font-black px-1.5 py-0.2 rounded-full bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 group-hover:bg-emerald-500/25 transition-colors">
                  {badge}
                </span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Main Footer ──────────────────────────────────────────────────────────────

export function Footer() {
  return (
    <footer
      role="contentinfo"
      className="relative overflow-hidden bg-[#05080A]"
    >
      {/* Top divider - high precision subtle gradient line */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(16,185,129,0.35) 25%, rgba(255,255,255,0.15) 50%, rgba(16,185,129,0.35) 75%, transparent 100%)",
        }}
        aria-hidden="true"
      />

      {/* Top-center ambient emerald bloom */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[850px] h-[280px] pointer-events-none select-none"
        style={{
          background:
            "radial-gradient(ellipse 650px 200px at 50% 0%, rgba(16,185,129,0.09) 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      {/* Subtle bottom accent glow */}
      <div
        className="absolute bottom-0 right-1/4 w-[500px] h-44 rounded-full pointer-events-none select-none"
        style={{
          background:
            "radial-gradient(ellipse, rgba(56,189,248,0.025) 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Top 4-Column Balanced Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 py-16">

          {/* Col 1: Brand column (Span 4 on large screens) */}
          <div className="lg:col-span-4 flex flex-col gap-5">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group w-fit" aria-label="UniVerse">
              <div
                className="w-9 h-9 rounded-[10px] flex items-center justify-center group-hover:scale-105 transition-transform duration-200 shadow-[0_0_15px_rgba(16,185,129,0.25)]"
                style={{ background: "linear-gradient(135deg, #10B981 0%, #059669 100%)" }}
              >
                <Zap size={18} className="text-white fill-white" />
              </div>
              <span
                className="text-xl font-extrabold text-white tracking-tight"
                style={{ fontFamily: "var(--font-plus-jakarta-sans)" }}
              >
                Uni<span className="text-[#10B981]">Verse</span>
              </span>
            </Link>

            {/* Tagline */}
            <div className="flex flex-col gap-1.5 max-w-sm">
              <p
                className="text-sm font-semibold text-white/90 tracking-tight"
                style={{ fontFamily: "var(--font-plus-jakarta-sans)" }}
              >
                Skip the Stairs. Buy &amp; Sell Smarter.
              </p>
              <p
                className="text-xs text-white/50 leading-relaxed"
                style={{ fontFamily: "var(--font-inter)" }}
              >
                The verified campus super-app for fast deliveries, student resale marketplace, and campus community: exclusively for Marwadi University.
              </p>
            </div>

            {/* Location & Live campus status badge */}
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full w-fit shadow-[0_0_12px_rgba(16,185,129,0.08)]"
              style={{
                background: "rgba(16,185,129,0.08)",
                border: "1px solid rgba(16,185,129,0.25)",
              }}
            >
              <span className="relative flex h-2 w-2" aria-hidden="true">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span
                className="text-xs font-semibold text-emerald-400/90"
                style={{ fontFamily: "var(--font-inter)" }}
              >
                Live on Campus · Marwadi University, Rajkot
              </span>
            </div>

            {/* Direct Touchpoints: Support & Share */}
            <div className="flex items-center gap-2.5 mt-1 flex-wrap">
              <a
                href="mailto:abhiavi619@gmail.com?subject=UniVerse%20Campus%20Support"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-[var(--radius-md)] text-xs font-medium text-white/75 hover:text-white transition-all duration-200 border border-white/10 hover:border-emerald-500/40 hover:bg-white/[0.08] active:scale-95"
                style={{ background: "rgba(255,255,255,0.04)" }}
                title="Email UniVerse Campus Support"
              >
                <Mail size={13} className="text-emerald-400" />
                <span>Support Desk</span>
              </a>

              <ShareButton />
            </div>
          </div>

          {/* Col 2: Campus Super-App Links (Span 2) */}
          <div className="lg:col-span-2">
            <FooterColumn
              heading="Campus Services"
              links={FOOTER_SECTIONS["Campus Super-App"]}
            />
          </div>

          {/* Col 3: Trust & Safety Links (Span 2) */}
          <div className="lg:col-span-2">
            <FooterColumn
              heading="Trust & Safety"
              links={FOOTER_SECTIONS["Trust & Safety"]}
            />
          </div>

          {/* Col 4: Marwadi University Student Hub Card (Span 4) */}
          <div className="lg:col-span-4 flex flex-col justify-between p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-white/[0.05] via-white/[0.02] to-transparent border border-white/10 hover:border-emerald-500/30 transition-all duration-300 relative overflow-hidden group shadow-[0_8px_30px_rgba(0,0,0,0.35)] backdrop-blur-md">
            {/* Ambient card corner glow */}
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all duration-500 pointer-events-none" />

            <div className="relative z-10 flex flex-col gap-3">
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider text-emerald-400 bg-emerald-500/15 border border-emerald-500/25">
                  <Sparkles size={11} className="text-emerald-400" />
                  MU Student Hub
                </span>
                <span className="text-[11px] font-mono text-white/40">Rajkot Campus</span>
              </div>

              <div>
                <h3
                  className="text-base font-bold text-white tracking-tight"
                  style={{ fontFamily: "var(--font-plus-jakarta-sans)" }}
                >
                  Built by Students, for Students
                </h3>
                <p
                  className="text-xs text-white/50 leading-relaxed mt-1"
                  style={{ fontFamily: "var(--font-inter)" }}
                >
                  Fast hostel food deliveries and peer-to-peer student marketplace with zero middleman commissions.
                </p>
              </div>

              {/* Micro Trust Pills */}
              <div className="flex flex-col gap-2 mt-1">
                <div className="flex items-center gap-2 text-xs text-white/70">
                  <div className="w-5 h-5 rounded-md bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center shrink-0">
                    <Zap size={11} className="text-emerald-400" />
                  </div>
                  <span>Sub-15m doorstep hostel room deliveries</span>
                </div>

                <div className="flex items-center gap-2 text-xs text-white/70">
                  <div className="w-5 h-5 rounded-md bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center shrink-0">
                    <ShieldCheck size={11} className="text-emerald-400" />
                  </div>
                  <span>6-digit OTP verified secure escrow handover</span>
                </div>

                <div className="flex items-center gap-2 text-xs text-white/70">
                  <div className="w-5 h-5 rounded-md bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center shrink-0">
                    <MapPin size={11} className="text-emerald-400" />
                  </div>
                  <span>Main Gate, Hostels A-D &amp; Canteens</span>
                </div>
              </div>
            </div>

            <Link
              href="/register"
              className="relative z-10 mt-5 inline-flex items-center justify-between w-full p-2.5 px-3.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-bold transition-all duration-200 group-hover:border-emerald-400/50 group-hover:text-emerald-200"
            >
              <span>Join Verified Campus Network</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-200" />
            </Link>
          </div>
        </div>

        {/* ── Divider ── */}
        <div
          className="border-t"
          style={{ borderColor: "rgba(255,255,255,0.07)" }}
        />

        {/* ── Bottom bar ── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-8">
          <p
            className="text-xs text-white/35 font-[family-name:var(--font-inter)]"
          >
            © {YEAR} UniVerse. All rights reserved.
          </p>

          <div className="flex items-center gap-6">
            {[
              { label: "Privacy Policy", href: "/privacy" },
              { label: "Terms of Use", href: "/terms" },
              { label: "Support Desk", href: "mailto:abhiavi619@gmail.com?subject=UniVerse%20Campus%20Support" },
            ].map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                className="text-xs text-white/35 hover:text-white/80 transition-colors duration-200 font-[family-name:var(--font-inter)]"
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Status indicator */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400/90 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span
              style={{ fontFamily: "var(--font-inter)" }}
            >
              All systems operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
