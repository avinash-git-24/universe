"use client";

/**
 * UniVerse — Footer
 *
 * Minimal, premium dark footer.
 * Brand column, navigation, contact, social icons.
 */

import Link from "next/link";
import { Zap, Globe, Mail, ArrowUpRight, MapPin } from "lucide-react";

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
            <p
              className="text-sm text-white/40 leading-relaxed max-w-xs"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              Skip the Stairs. Get It Delivered.
              <br />
              The verified student delivery platform — exclusively for Marwadi University.
            </p>

            {/* Location badge */}
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full w-fit"
              style={{
                background: "rgba(16,185,129,0.08)",
                border: "1px solid rgba(16,185,129,0.2)",
              }}
            >
              <MapPin size={12} style={{ color: "#10B981" }} />
              <span
                className="text-xs text-white/50"
                style={{ fontFamily: "var(--font-inter)" }}
              >
                Marwadi University, Rajkot, Gujarat
              </span>
            </div>

            {/* Social icons */}
            <div className="flex items-center gap-2 mt-1">
              {SOCIAL.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 rounded-[var(--radius-md)] flex items-center justify-center text-white/35 hover:text-white transition-all duration-200"
                  style={{ background: "rgba(255,255,255,0.05)" }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.background =
                      "rgba(255,255,255,0.1)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.background =
                      "rgba(255,255,255,0.05)";
                  }}
                >
                  <Icon size={16} />
                </a>
              ))}
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
              { label: "Contact", href: "/contact" },
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
