import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — UniVerse Campus Platform",
  description:
    "Privacy Policy for UniVerse Campus Platform. Learn how your data is collected, used, and protected.",
};

const summaryCards = [
  { icon: "🔐", title: "Encrypted Storage", desc: "Supabase PostgreSQL with RLS — only you can access your personal data" },
  { icon: "🚫", title: "No Data Selling", desc: "We never sell or monetize your data with advertisers or third parties" },
  { icon: "🗑️", title: "Right to Delete", desc: "Delete your account anytime — personal data permanently erased within 30 days" },
  { icon: "📧", title: "MU Email Only", desc: "@marwadiuniversity.ac.in — verified campus emails only, no external third-party profiles" },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#060b14] via-[#0a0f1e] to-[#060b14] text-white font-sans pb-16 sm:pb-24 selection:bg-cyan-500/20 selection:text-cyan-200">
      {/* ── Sticky Header ── */}
      <header className="border-b border-white/10 bg-[#060b14]/90 backdrop-blur-xl sticky top-0 z-50 px-3.5 sm:px-6 py-2.5 sm:py-3.5 flex items-center justify-between gap-3">
        <Link href="/" className="flex items-center gap-2 sm:gap-2.5 text-white no-underline shrink-0 group">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-[#00d2ff] to-[#0077ff] flex items-center justify-center shadow-[0_0_16px_rgba(0,210,255,0.4)] shrink-0 transition-transform group-hover:scale-105">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="black" stroke="black" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
          </div>
          <span className="text-lg sm:text-xl font-bold tracking-widest text-white">UniVerse</span>
        </Link>
        <Link
          href="/"
          className="no-underline px-3 py-1.5 sm:px-4 sm:py-2 rounded-md border border-cyan-400/40 text-cyan-400 hover:bg-cyan-400/10 transition-colors text-[11px] sm:text-xs font-mono tracking-wider shrink-0 flex items-center gap-1"
        >
          <span>&larr;</span>
          <span className="hidden sm:inline">Back to UniVerse</span>
          <span className="sm:hidden">Back</span>
        </Link>
      </header>

      {/* ── Main Container ── */}
      <main className="max-w-4xl mx-auto px-3.5 sm:px-6 pt-6 sm:pt-12 w-full">
        {/* ── Hero Section ── */}
        <section className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full bg-cyan-400/10 border border-cyan-400/25 mb-4 sm:mb-5">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#00d2ff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <span className="text-[9px] sm:text-[10px] md:text-xs text-cyan-400 font-mono tracking-widest uppercase">
              Data Privacy &amp; Security
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 tracking-tight bg-gradient-to-br from-white via-slate-100 to-blue-200 bg-clip-text text-transparent leading-[1.2]">
            Privacy Policy
          </h1>
          <p className="text-xs sm:text-sm text-white/50 leading-relaxed max-w-lg mx-auto mb-5 sm:mb-6 px-1">
            Your data belongs to you. UniVerse takes your privacy seriously.
            Here is a transparent breakdown of what we collect, why we collect it, and how it is protected.
          </p>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/25 mb-6 sm:mb-8">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <span className="text-[10px] sm:text-xs text-emerald-400 font-mono tracking-wide">
              We do NOT sell your data to any third party
            </span>
          </div>

          {/* Quick-Jump Navigation Pills */}
          <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 max-w-2xl mx-auto">
            {[
              { label: "Data Collected", href: "#data-collected" },
              { label: "Usage", href: "#data-usage" },
              { label: "Sharing", href: "#data-sharing" },
              { label: "Security", href: "#security" },
              { label: "Your Rights", href: "#your-rights" },
              { label: "Cookies", href: "#cookies" },
              { label: "Retention", href: "#retention" },
              { label: "Grievance", href: "#grievance" },
            ].map((pill, i) => (
              <a
                key={i}
                href={pill.href}
                className="px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full bg-white/[0.03] border border-white/10 text-white/70 hover:bg-white/[0.08] text-[10px] sm:text-xs font-mono no-underline transition-all active:scale-95 whitespace-nowrap"
              >
                {pill.label}
              </a>
            ))}
          </div>
        </section>

        {/* ── Summary Cards Grid (2 cols on mobile, 4 cols on tablet/desktop) ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5 mb-8 sm:mb-10 text-center">
          {summaryCards.map((card, i) => (
            <div
              key={i}
              className="p-3 sm:p-4 md:p-5 rounded-xl bg-white/[0.03] border border-white/[0.08] flex flex-col items-center transition-colors hover:border-white/15"
            >
              <div className="text-xl sm:text-2xl mb-1.5 sm:mb-2">{card.icon}</div>
              <div className="text-xs sm:text-sm font-semibold text-white mb-1">{card.title}</div>
              <div className="text-[10px] sm:text-xs text-white/50 leading-snug sm:leading-relaxed">{card.desc}</div>
            </div>
          ))}
        </div>

        {/* ── Section 1 ── */}
        <PSection id="data-collected" title="1. Information We Collect">
          <p>When you use UniVerse, we collect the following categories of information:</p>

          <div className="mt-3.5 space-y-2.5 sm:space-y-3">
            {[
              {
                category: "Account Data",
                items: [
                  "Full name",
                  "Marwadi University email address (@marwadiuniversity.ac.in)",
                  "Encrypted passwords (never stored or viewable in plain text)",
                  "Profile photo (optional)",
                ],
                color: "#00d2ff",
              },
              {
                category: "Activity Data",
                items: [
                  "Delivery requests (pickup, destination, tip incentives)",
                  "Marketplace listings (photos, prices, descriptions, conditions)",
                  "Chat messages (buyer-seller and runner-student communication)",
                  "Order lifecycle and delivery status updates",
                ],
                color: "#a78bfa",
              },
              {
                category: "Technical Data",
                items: [
                  "Browser type and device specifications",
                  "IP address (for security logging and fraud prevention)",
                  "Session timestamps and access tokens",
                  "Error telemetry and diagnostic logs (to identify and fix platform bugs)",
                ],
                color: "#fbbf24",
              },
            ].map((group, i) => (
              <div
                key={i}
                className="p-3 sm:p-4 rounded-lg bg-white/[0.02] border border-white/[0.06]"
              >
                <div
                  className="text-[10px] sm:text-xs font-bold font-mono tracking-wider uppercase mb-2"
                  style={{ color: group.color }}
                >
                  {group.category}
                </div>
                <ul className="pl-4 sm:pl-5 m-0 space-y-1 sm:space-y-1.5 list-disc text-xs sm:text-[13px] text-white/60 leading-relaxed">
                  {group.items.map((item, j) => (
                    <li key={j}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </PSection>

        {/* ── Section 2 ── */}
        <PSection id="data-usage" title="2. How We Use Your Information">
          <ul className="pl-4 sm:pl-5 m-0 space-y-1.5 sm:space-y-2 list-disc text-xs sm:text-[13px] text-white/70 leading-relaxed">
            <li><strong>Account Management:</strong> Authentication, campus identity verification, and account security</li>
            <li><strong>Platform Functionality:</strong> Real-time delivery matching, campus marketplace listings, and in-app chat</li>
            <li><strong>Campus Safety:</strong> Fraud prevention, policy enforcement, prohibited items monitoring, and moderation</li>
            <li><strong>Transactional Communication:</strong> Security OTP emails, handover confirmations, and live order status notifications</li>
            <li><strong>Platform Optimization:</strong> Performance enhancements, caching, and bug fixes</li>
          </ul>
          <div className="mt-3.5 p-3 sm:p-3.5 rounded-lg bg-cyan-500/[0.07] border border-cyan-400/20">
            <p className="m-0 text-xs text-cyan-200 leading-relaxed">
              ✅ We <strong>never use your personal data for commercial marketing</strong>, and we never share it with third-party advertisers.
            </p>
          </div>
        </PSection>

        {/* ── Section 3 ── */}
        <PSection id="data-sharing" title="3. Data Sharing — When &amp; With Whom">
          <p>We only share personal data with trusted infrastructure providers and under strict campus safety requirements:</p>
          <ul className="pl-4 sm:pl-5 mt-3 space-y-1.5 sm:space-y-2 list-disc text-xs sm:text-[13px] text-white/70 leading-relaxed">
            <li><strong>Supabase (Cloud Database Provider):</strong> Encrypted PostgreSQL storage adhering to SOC2 Type II and strict data protection standards</li>
            <li><strong>Vercel (Edge Hosting Infrastructure):</strong> High-availability edge network deployment, GDPR compliant</li>
            <li><strong>University Administration:</strong> Strictly in cases of serious safety misconduct or prohibited items violations, limited to enrollment verification</li>
            <li><strong>Legal Authorities:</strong> Solely when compelled by a valid legal order, warrant, or statutory requirement</li>
          </ul>
          <div className="mt-3.5 p-3 sm:p-3.5 rounded-lg bg-red-500/[0.07] border border-red-500/25">
            <p className="m-0 text-xs text-red-300 leading-relaxed">
              🚫 We never sell, rent, or trade your personal information with social media platforms, advertisers, or data brokers.
            </p>
          </div>
        </PSection>

        {/* ── Section 4 ── */}
        <PSection id="security" title="4. Data Security">
          <ul className="pl-4 sm:pl-5 m-0 space-y-1.5 sm:space-y-2 list-disc text-xs sm:text-[13px] text-white/70 leading-relaxed">
            <li><strong>Row-Level Security (RLS):</strong> Database-enforced isolation ensuring students can only access authorized data</li>
            <li><strong>Transport Layer Security:</strong> All client-server communication is strictly encrypted over TLS/HTTPS</li>
            <li><strong>Cryptographic Password Hashing:</strong> Passwords are never stored in plain text; authenticated via secure salted hashes</li>
            <li><strong>Cryptographic OTP Handover:</strong> High-trust transactions (escrow handover and delivery) require 6-digit one-time codes</li>
            <li><strong>Secure Session Management:</strong> Cryptographically signed JWT tokens with automatic expiration and revocation</li>
          </ul>
        </PSection>

        {/* ── Section 5 ── */}
        <PSection id="your-rights" title="5. Your Rights (Your Data, Your Control)">
          <ul className="pl-4 sm:pl-5 m-0 space-y-1.5 sm:space-y-2 list-disc text-xs sm:text-[13px] text-white/70 leading-relaxed">
            <li>
              <strong>Right to Access:</strong> You can inspect and review all personal profile details directly within your dashboard settings.
            </li>
            <li>
              <strong>Right to Rectification:</strong> You may update or correct inaccurate profile details at any time.
            </li>
            <li>
              <strong>Right to Erasure (Right to be Forgotten):</strong> Request permanent account deletion; all personal data will be purged within 30 days.
            </li>
            <li>
              <strong>Data Portability:</strong> Request an export of your personal platform activity in a machine-readable JSON format.
            </li>
            <li>
              <strong>Right to Object:</strong> Object to non-essential automated data processing or administrative communications.
            </li>
          </ul>
          <div className="mt-3.5 p-3 sm:p-3.5 rounded-lg bg-cyan-500/[0.07] border border-cyan-400/20">
            <p className="m-0 text-xs text-cyan-200 leading-relaxed">
              To exercise any of these privacy rights, reach out to our team at{" "}
              <a href="mailto:support@universe.mu.ac.in" className="text-cyan-400 underline hover:text-cyan-300">
                support@universe.mu.ac.in
              </a>.
            </p>
          </div>
        </PSection>

        {/* ── Section 6 ── */}
        <PSection id="cookies" title="6. Cookies &amp; Local Storage">
          <p>UniVerse only utilizes essential, functional cookies and local storage tokens:</p>
          <ul className="pl-4 sm:pl-5 mt-3 space-y-1.5 sm:space-y-2 list-disc text-xs sm:text-[13px] text-white/70 leading-relaxed">
            <li><strong>Authentication Session:</strong> Secure HTTP cookies to keep you signed in securely across sessions</li>
            <li><strong>Local Storage Preferences:</strong> UI theme choices and localized client state stored strictly on your device</li>
          </ul>
          <p className="mt-3 text-white/50 text-xs leading-relaxed">
            We do not deploy third-party advertising cookies, behavioral ad pixels, or commercial tracking beacons.
          </p>
        </PSection>

        {/* ── Section 7 ── */}
        <PSection id="retention" title="7. Data Retention">
          <ul className="pl-4 sm:pl-5 m-0 space-y-1.5 sm:space-y-2 list-disc text-xs sm:text-[13px] text-white/70 leading-relaxed">
            <li><strong>Active Accounts:</strong> Maintained for as long as your university enrollment and platform account remain active</li>
            <li><strong>Inactive Accounts:</strong> Accounts dormant for over 12 months receive a notification, followed by deletion after 30 days</li>
            <li><strong>Account Erasure:</strong> Fully purged across active systems and automated backup snapshots within 30 days</li>
            <li><strong>Transient Chat Messages:</strong> Delivery runner and buyer-seller chat history auto-expires after 90 days</li>
            <li><strong>Completed Transaction Records:</strong> Retained for 6 months solely for dispute resolution and financial audit trails</li>
          </ul>
        </PSection>

        {/* ── Section 8 ── */}
        <PSection id="updates" title="8. Changes to Privacy Policy">
          <p>
            We may periodically update this policy to reflect new campus features or statutory requirements. Significant revisions will be notified via university email at least 14 days prior to taking effect.
          </p>
          <p className="mt-3 text-white/45 text-[11px] sm:text-xs font-mono">
            Last updated: September 2026 &middot; Governed by: Indian laws (IT Act 2000, DPDPA 2023)
          </p>
        </PSection>

        {/* ── Grievance Redressal & Contact (DPDPA 2023 Compliance) ── */}
        <div
          id="grievance"
          className="bg-cyan-500/[0.04] border border-cyan-500/20 rounded-xl p-4 sm:p-6 md:p-7 mb-4 sm:mb-6 scroll-mt-24"
        >
          <div className="text-center mb-4 sm:mb-5">
            <h2 className="text-sm sm:text-base font-semibold text-white mb-1.5">
              ⚖️ Grievance Redressal Officer (DPDPA 2023)
            </h2>
            <p className="m-0 text-xs sm:text-sm text-white/50 leading-relaxed">
              Pursuant to the Digital Personal Data Protection Act (DPDPA), 2023, the designated campus data grievance contact is:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5 mb-4 sm:mb-5">
            <div className="p-3 sm:p-3.5 rounded-lg bg-white/[0.02] border border-white/[0.06]">
              <div className="text-[9px] sm:text-[10px] text-cyan-400 font-mono tracking-wider uppercase mb-1">DESIGNATED OFFICER</div>
              <div className="text-xs sm:text-sm font-semibold text-white">Lead Platform Administrator</div>
              <div className="text-[11px] sm:text-xs text-white/50 mt-0.5">Marwadi University, Rajkot</div>
            </div>

            <div className="p-3 sm:p-3.5 rounded-lg bg-white/[0.02] border border-white/[0.06]">
              <div className="text-[9px] sm:text-[10px] text-emerald-400 font-mono tracking-wider uppercase mb-1">RESOLUTION TIMELINE</div>
              <div className="text-xs sm:text-sm font-semibold text-emerald-400">48 Hours Acknowledgment</div>
              <div className="text-[11px] sm:text-xs text-white/50 mt-0.5">Max 15 working days resolution</div>
            </div>
          </div>

          <div className="text-center pt-1">
            <a
              href="mailto:support@universe.mu.ac.in"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 sm:py-3 rounded-lg bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 hover:bg-cyan-500/20 text-xs sm:text-sm font-mono tracking-wide no-underline transition-all break-all"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                <rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
              support@universe.mu.ac.in
            </a>
          </div>
        </div>

        {/* ── Footer Nav ── */}
        <div className="flex items-center justify-center gap-3 sm:gap-5 flex-wrap text-xs font-mono pt-4">
          <Link href="/terms" className="text-cyan-400 hover:text-cyan-300 no-underline transition-colors">Terms of Service</Link>
          <span className="text-white/15">&bull;</span>
          <Link href="/register" className="text-white/45 hover:text-white no-underline transition-colors">Create Account &rarr;</Link>
          <span className="text-white/15">&bull;</span>
          <Link href="/" className="text-white/45 hover:text-white no-underline transition-colors">Home</Link>
        </div>

        {/* ── Copyright ── */}
        <p className="text-center mt-4 text-[10px] sm:text-xs text-white/25 font-mono tracking-wide">
          &copy; 2026 UniVerse &middot; Crafted with &hearts; for Marwadi University Students
        </p>
      </main>
    </div>
  );
}

function PSection({ id, title, children }: { id?: string; title: string; children: React.ReactNode }) {
  return (
    <section
      id={id}
      className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-4 sm:p-6 md:p-7 mb-4 sm:mb-6 scroll-mt-24"
    >
      <h2 className="text-sm sm:text-base font-semibold text-white mb-3">{title}</h2>
      <div className="text-xs sm:text-sm text-white/60 leading-relaxed">{children}</div>
    </section>
  );
}
