"use client";

/**
 * UniVerse — Footer
 *
 * Minimal, premium dark footer.
 * Brand column, navigation, contact, social icons.
 */

import { useState } from "react";
import Link from "next/link";
import { Zap, Mail, Share2, Check } from "lucide-react";

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
          title: "UniVerse — Marwadi University Campus Super-App",
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
      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-[var(--radius-md)] text-xs font-medium text-white/75 hover:text-white transition-all duration-200 border border-white/10 hover:border-emerald-500/40 hover:bg-white/[0.08] cursor-pointer"
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

const LINKS = {
  Product: [
    { label: "How It Works", href: "#how-it-works" },
    { label: "Why UniVerse", href: "#why" },
    { label: "Get Started", href: "/register" },
    { label: "Login", href: "/login" },
  ],
  Company: [
    { label: "About Us", href: "/about" },
    { label: "Support Desk", href: "mailto:abhiavi619@gmail.com?subject=UniVerse%20Campus%20Support" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Use", href: "/terms" },
  ],
} as const;

// ─── Footer Link Column ───────────────────────────────────────────────────────

function FooterColumn({
  heading,
  links,
}: {
  heading: string;
  links: ReadonlyArray<{ label: string; href: string }>;
}) {
  return (
    <div className="flex flex-col gap-4">
      <h4
        className="text-xs font-bold uppercase tracking-[0.15em] text-white/30"
        style={{ fontFamily: "var(--font-inter)" }}
      >
        {heading}
      </h4>
      <ul className="flex flex-col gap-2.5" role="list">
        {links.map(({ label, href }) => (
          <li key={label}>
            <Link
              href={href}
              className="text-sm text-white/55 hover:text-white transition-colors duration-200 font-[family-name:var(--font-inter)]"
            >
              {label}
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
      className="relative overflow-hidden"
      style={{ background: "#060A08" }}
    >
      {/* Top divider — gradient line */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(16,185,129,0.4), rgba(245,158,11,0.3), transparent)",
        }}
        aria-hidden="true"
      />

      {/* Subtle background glow */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-60 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse, rgba(16,185,129,0.04) 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Top Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 py-16">

          {/* Brand column */}
          <div className="md:col-span-5 flex flex-col gap-5">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group w-fit" aria-label="UniVerse">
              <div
                className="w-9 h-9 rounded-[10px] flex items-center justify-center group-hover:scale-105 transition-transform duration-200"
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
            <div className="flex flex-col gap-1.5 max-w-xs">
              <p
                className="text-sm font-semibold text-white/90 tracking-tight"
                style={{ fontFamily: "var(--font-plus-jakarta-sans)" }}
              >
                Skip the Stairs. Buy &amp; Sell Smarter.
              </p>
              <p
                className="text-xs text-white/45 leading-relaxed"
                style={{ fontFamily: "var(--font-inter)" }}
              >
                The verified campus super-app for fast deliveries, student resale marketplace, and campus community — exclusively for Marwadi University.
              </p>
            </div>

            {/* Location & Live campus status badge */}
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full w-fit"
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
                className="text-xs font-medium text-emerald-400/90"
                style={{ fontFamily: "var(--font-inter)" }}
              >
                Live on Campus · Marwadi University, Rajkot
              </span>
            </div>

            {/* Direct Touchpoints: Support & Share */}
            <div className="flex items-center gap-2.5 mt-1 flex-wrap">
              <a
                href="mailto:abhiavi619@gmail.com?subject=UniVerse%20Campus%20Support"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-[var(--radius-md)] text-xs font-medium text-white/75 hover:text-white transition-all duration-200 border border-white/10 hover:border-emerald-500/40 hover:bg-white/[0.08]"
                style={{ background: "rgba(255,255,255,0.04)" }}
                title="Email UniVerse Campus Support"
              >
                <Mail size={13} className="text-emerald-400" />
                <span>Support Desk</span>
              </a>

              <ShareButton />
            </div>
          </div>

          {/* Nav columns */}
          <div className="md:col-span-7 grid grid-cols-2 gap-8">
            {Object.entries(LINKS).map(([heading, links]) => (
              <FooterColumn key={heading} heading={heading} links={links} />
            ))}
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
            className="text-xs text-white/25 font-[family-name:var(--font-inter)]"
          >
            © {YEAR} UniVerse. All rights reserved.
          </p>

          <div className="flex items-center gap-6">
            {[
              { label: "Privacy", href: "/privacy" },
              { label: "Terms", href: "/terms" },
              { label: "Support", href: "mailto:abhiavi619@gmail.com?subject=UniVerse%20Campus%20Support" },
            ].map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                className="text-xs text-white/25 hover:text-white/60 transition-colors duration-200 font-[family-name:var(--font-inter)]"
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Status indicator */}
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
            <span
              className="text-xs text-white/25"
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
