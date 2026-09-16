import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — UniVerse Campus Platform",
  description:
    "UniVerse Campus Platform ki Privacy Policy. Aapka data kaise collect, use, aur protect kiya jata hai.",
};

const summaryCards = [
  { icon: "🔐", title: "Encrypted Storage", desc: "Supabase PostgreSQL with RLS — sirf aap apna data dekh sakte hain" },
  { icon: "🚫", title: "No Data Selling", desc: "Hum kabhi bhi aapka data advertisers ya third-parties ko nahi bechte" },
  { icon: "🗑️", title: "Right to Delete", desc: "Account delete karo — aapka data 30 din mein permanently erase" },
  { icon: "📧", title: "MU Email Only", desc: "@marwadiuniversity.ac.in — sirf campus email, koi bahar ki information nahi" },
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
            Aapka data aapka hai. UniVerse aapki privacy ko seriously leta hai.
            Yahan transparently padhein ki hum kya collect karte hain aur kyun.
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
        <PSection id="data-collected" title="1. Data Jo Hum Collect Karte Hain">
          <p>Jab aap UniVerse use karte hain, hum yeh information collect karte hain:</p>

          <div className="mt-3.5 space-y-2.5 sm:space-y-3">
            {[
              {
                category: "Account Data",
                items: ["Full name", "Marwadi University email address", "Encrypted password (hum plain text kabhi nahi dekhte)", "Profile photo (optional)"],
                color: "#00d2ff",
              },
              {
                category: "Activity Data",
                items: ["Delivery requests (pickup, destination, tip)", "Marketplace listings (photos, prices, descriptions)", "Chat messages (buyer-seller communication)", "Order status updates"],
                color: "#a78bfa",
              },
              {
                category: "Technical Data",
                items: ["Browser type aur device information", "IP address (security ke liye)", "Session timestamps", "Error logs (bugs fix karne ke liye)"],
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
        <PSection id="data-usage" title="2. Hum Data Ka Use Kaise Karte Hain">
          <ul className="pl-4 sm:pl-5 m-0 space-y-1.5 sm:space-y-2 list-disc text-xs sm:text-[13px] text-white/70 leading-relaxed">
            <li><strong>Account management:</strong> Login, verification, aur security</li>
            <li><strong>Platform functionality:</strong> Delivery matching, marketplace listings, chat</li>
            <li><strong>Safety:</strong> Fraud detection, prohibited items monitoring, account bans</li>
            <li><strong>Communication:</strong> OTP emails, order status notifications</li>
            <li><strong>Improvements:</strong> Bug fixes aur performance optimization</li>
          </ul>
          <div className="mt-3.5 p-3 sm:p-3.5 rounded-lg bg-cyan-500/[0.07] border border-cyan-400/20">
            <p className="m-0 text-xs text-cyan-200 leading-relaxed">
              ✅ Hum aapka data <strong>kabhi bhi marketing ke liye use nahi karte</strong>, aur kisi bhi third-party advertiser ko nahi dete.
            </p>
          </div>
        </PSection>

        {/* ── Section 3 ── */}
        <PSection id="data-sharing" title="3. Data Sharing — Kab Aur Kiske Saath">
          <p>Hum aapka data <strong>sirf</strong> inke saath share kar sakte hain:</p>
          <ul className="pl-4 sm:pl-5 mt-3 space-y-1.5 sm:space-y-2 list-disc text-xs sm:text-[13px] text-white/70 leading-relaxed">
            <li><strong>Supabase (Database Provider):</strong> Aapka data securely store karta hai — EU data protection standards follow karta hai</li>
            <li><strong>Vercel (Hosting):</strong> Platform deploy karta hai — GDPR compliant</li>
            <li><strong>University Administration:</strong> Sirf prohibited items violations ya serious misconduct reports ke case mein, aur sirf enrollment ID share hogi</li>
            <li><strong>Law Enforcement:</strong> Sirf valid legal order/court directive ke case mein</li>
          </ul>
          <div className="mt-3.5 p-3 sm:p-3.5 rounded-lg bg-red-500/[0.07] border border-red-500/25">
            <p className="m-0 text-xs text-red-300 leading-relaxed">
              🚫 Hum kabhi bhi aapka data social media companies, advertisers, ya data brokers ko nahi bechte ya share karte.
            </p>
          </div>
        </PSection>

        {/* ── Section 4 ── */}
        <PSection id="security" title="4. Data Security">
          <ul className="pl-4 sm:pl-5 m-0 space-y-1.5 sm:space-y-2 list-disc text-xs sm:text-[13px] text-white/70 leading-relaxed">
            <li><strong>Row Level Security (RLS):</strong> Supabase database mein — aap sirf apna data dekh sakte hain</li>
            <li><strong>HTTPS Encryption:</strong> Sab communication end-to-end encrypted</li>
            <li><strong>Password Hashing:</strong> Aapka password hum kabhi plain text mein store nahi karte</li>
            <li><strong>OTP Verification:</strong> Sensitive transactions (escrow handover) ke liye 6-digit OTP</li>
            <li><strong>Session Management:</strong> Secure JWT tokens with automatic expiry</li>
          </ul>
        </PSection>

        {/* ── Section 5 ── */}
        <PSection id="your-rights" title="5. Aapke Rights (Aapka Data, Aapka Control)">
          <ul className="pl-4 sm:pl-5 m-0 space-y-1.5 sm:space-y-2 list-disc text-xs sm:text-[13px] text-white/70 leading-relaxed">
            <li>
              <strong>Access:</strong> Apna data download karne ka right — settings se request karein
            </li>
            <li>
              <strong>Correction:</strong> Galat information correct karne ka right
            </li>
            <li>
              <strong>Deletion:</strong> Account aur sab data delete karne ka right — 30 din mein complete erasure
            </li>
            <li>
              <strong>Portability:</strong> Apna data JSON format mein export karne ka right
            </li>
            <li>
              <strong>Object:</strong> Kisi bhi specific data processing ke against objection karne ka right
            </li>
          </ul>
          <div className="mt-3.5 p-3 sm:p-3.5 rounded-lg bg-cyan-500/[0.07] border border-cyan-400/20">
            <p className="m-0 text-xs text-cyan-200 leading-relaxed">
              Inme se koi bhi right exercise karne ke liye:{" "}
              <a href="mailto:support@universe.mu.ac.in" className="text-cyan-400 underline hover:text-cyan-300">
                support@universe.mu.ac.in
              </a>{" "}
              par email karein.
            </p>
          </div>
        </PSection>

        {/* ── Section 6 ── */}
        <PSection id="cookies" title="6. Cookies &amp; Local Storage">
          <p>UniVerse sirf zaroorat ki cookies use karta hai:</p>
          <ul className="pl-4 sm:pl-5 mt-3 space-y-1.5 sm:space-y-2 list-disc text-xs sm:text-[13px] text-white/70 leading-relaxed">
            <li><strong>Session Cookie:</strong> Aapko logged in rakhne ke liye (authentication)</li>
            <li><strong>Preference Storage:</strong> Theme, language settings (local storage only)</li>
          </ul>
          <p className="mt-3 text-white/50 text-xs leading-relaxed">
            Hum koi tracking cookies, analytics cookies (Google Analytics), ya advertising cookies use nahi karte.
          </p>
        </PSection>

        {/* ── Section 7 ── */}
        <PSection id="retention" title="7. Data Retention">
          <ul className="pl-4 sm:pl-5 m-0 space-y-1.5 sm:space-y-2 list-disc text-xs sm:text-[13px] text-white/70 leading-relaxed">
            <li><strong>Active account:</strong> Jab tak aap use karte hain</li>
            <li><strong>Inactive account:</strong> 1 saal inactivity ke baad email notification, phir 30 din mein delete</li>
            <li><strong>Deleted account:</strong> 30 din mein complete erasure (backups se bhi)</li>
            <li><strong>Chat messages:</strong> 90 din ke baad automatically delete</li>
            <li><strong>Completed orders:</strong> 6 mahine ke liye retain (dispute resolution ke liye)</li>
          </ul>
        </PSection>

        {/* ── Section 8 ── */}
        <PSection id="updates" title="8. Changes to Privacy Policy">
          <p>
            Hum is policy ko update kar sakte hain. Significant changes ke liye aapko email se notify kiya jayega
            kam se kam 14 din pehle.
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
              Digital Personal Data Protection Act, 2023 ke anusaar designated campus grievance contact:
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
