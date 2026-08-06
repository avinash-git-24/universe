"use client";

/**
 * UniVerse — Footer
 *
 * Minimal, premium dark footer.
 * Brand column, navigation, contact, social icons.
 */

import Link from "next/link";
import { Zap, Globe, Mail, ArrowUpRight, MapPin } from "lucide-react";
import { motion } from "framer-motion";

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
    { label: "Contact", href: "/contact" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Use", href: "/terms" },
  ],
} as const;

const SOCIAL = [
  { icon: Globe, label: "Twitter", href: "https://twitter.com/universe_app" },
  { icon: ArrowUpRight, label: "Instagram", href: "https://instagram.com/universe_app" },
  { icon: Globe, label: "GitHub", href: "https://github.com/universe-app" },
  { icon: Mail, label: "Email", href: "mailto:hello@universe.app" },
] as const;

// ─── Footer Link Column ───────────────────────────────────────────────────────

function FooterColumn({
  heading,
  links,
}: {
  heading: string;
  links: ReadonlyArray<{ label: string; href: string }>;
}) {
  return (
    <div className="flex flex-col gap-5">
      <h4
        className="text-xs font-black uppercase tracking-[0.2em] text-white/40"
        style={{ fontFamily: "var(--font-inter)" }}
      >
        {heading}
      </h4>
      <ul className="flex flex-col gap-3.5" role="list">
        {links.map(({ label, href }) => (
          <li key={label}>
            <Link
              href={href}
              className="text-sm text-white/50 hover:text-emerald-400 hover:translate-x-1 transition-all duration-300 font-[family-name:var(--font-inter)] inline-block"
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
      style={{ background: "#030605" }}
    >
      {/* Top divider — thick glowing gradient line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] w-full">
        <div
          className="w-full h-full"
          style={{
            background:
              "linear-gradient(90deg, transparent, #10B981, #F59E0B, transparent)",
            boxShadow: "0 0 20px rgba(16,185,129,0.5)",
          }}
          aria-hidden="true"
        />
      </div>

      {/* Subtle background glow */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-80 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse, rgba(16,185,129,0.06) 0%, transparent 60%)",
        }}
        aria-hidden="true"
      />
      
      {/* Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,1) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
        aria-hidden="true"
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Top Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-16 py-24">

          {/* Brand column */}
          <div className="md:col-span-5 flex flex-col gap-6">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group w-fit" aria-label="UniVerse">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                style={{ background: "linear-gradient(135deg, #10B981 0%, #059669 100%)" }}
              >
                <Zap size={20} className="text-white fill-white" />
              </div>
              <span
                className="text-2xl font-black text-white tracking-tight"
                style={{ fontFamily: "var(--font-plus-jakarta-sans)" }}
              >
                Uni<span className="text-[#10B981]">Verse</span>
              </span>
            </Link>

            {/* Tagline */}
            <p
              className="text-sm text-white/50 leading-loose max-w-sm font-medium"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              Skip the Stairs. Get It Delivered.
              <br />
              <span className="text-white/30">The verified student delivery platform — exclusively for Marwadi University.</span>
            </p>

            {/* Location badge */}
            <div
              className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full w-fit shadow-lg backdrop-blur-md"
              style={{
                background: "rgba(16,185,129,0.1)",
                border: "1px solid rgba(16,185,129,0.3)",
              }}
            >
              <MapPin size={14} style={{ color: "#34D399" }} />
              <span
                className="text-xs text-white/70 font-semibold tracking-wide"
                style={{ fontFamily: "var(--font-inter)" }}
              >
                Marwadi University, Rajkot, Gujarat
              </span>
            </div>

            {/* Social icons */}
            <div className="flex items-center gap-3 mt-2">
              {SOCIAL.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white/40 hover:text-white transition-all duration-300 hover:scale-110 hover:-translate-y-1"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.background = "rgba(16,185,129,0.2)";
                    (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(16,185,129,0.5)";
                    (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 0 15px rgba(16,185,129,0.3)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.03)";
                    (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,255,255,0.05)";
                    (e.currentTarget as HTMLAnchorElement).style.boxShadow = "none";
                  }}
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Nav columns */}
          <div className="md:col-span-7 grid grid-cols-2 gap-12 md:pl-12">
            {Object.entries(LINKS).map(([heading, links]) => (
              <FooterColumn key={heading} heading={heading} links={links} />
            ))}
          </div>
        </div>

        {/* ── Divider ── */}
        <div
          className="border-t"
          style={{ borderColor: "rgba(255,255,255,0.1)" }}
        />

        {/* ── Bottom bar ── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 py-10">
          <p
            className="text-xs text-white/30 font-medium font-[family-name:var(--font-inter)]"
          >
            © {YEAR} UniVerse. All rights reserved.
          </p>

          <div className="flex items-center gap-8">
            {[
              { label: "Privacy", href: "/privacy" },
              { label: "Terms", href: "/terms" },
              { label: "Contact", href: "/contact" },
            ].map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                className="text-xs text-white/30 hover:text-white/80 transition-colors duration-300 font-medium font-[family-name:var(--font-inter)]"
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Status indicator */}
          <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-full border border-white/10">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span
              className="text-xs font-bold text-white/60 tracking-wide"
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
