"use client";

/**
 * UniVerse — Footer
 *
 * Minimal, premium dark footer.
 * Brand column, navigation, contact, social icons.
 */

import Link from "next/link";
import { Zap, Mail, MapPin } from "lucide-react";

function GithubIcon({ size = 16, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}

function XTwitterIcon({ size = 15, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function InstagramIcon({ size = 16, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
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
    { label: "Contact", href: "/contact" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Use", href: "/terms" },
  ],
} as const;

const SOCIAL = [
  { icon: GithubIcon, label: "GitHub", href: "https://github.com/avinash-git-24/universe" },
  { icon: XTwitterIcon, label: "X (Twitter)", href: "https://x.com" },
  { icon: InstagramIcon, label: "Instagram", href: "https://instagram.com" },
  { icon: Mail, label: "Email", href: "mailto:abhiavi619@gmail.com" },
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
              {SOCIAL.map(({ icon: Icon, label, href }) => {
                const isMail = href.startsWith("mailto:");
                return (
                  <a
                    key={label}
                    href={href}
                    {...(!isMail ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    aria-label={label}
                    title={label}
                    className="w-9 h-9 rounded-[var(--radius-md)] flex items-center justify-center text-white/40 hover:text-white transition-all duration-200"
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
                );
              })}
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
