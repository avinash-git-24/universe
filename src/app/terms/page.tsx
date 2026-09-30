import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — UniVerse Campus Platform",
  description:
    "Terms of Service, Campus Rules, and Prohibited Items guidelines for UniVerse Campus Platform. Exclusively for Marwadi University students.",
};

const prohibitedItems = [
  { emoji: "🍺", label: "Alcohol / Cigarettes / Vapes / Tobacco Products" },
  { emoji: "💊", label: "Drugs / Controlled or Restricted Medicines" },
  { emoji: "🔫", label: "Weapons / Explosives / Dangerous Objects" },
  { emoji: "📋", label: "Exam Papers / Question Papers / Answer Keys (Leaks)" },
  { emoji: "🎭", label: "Proxy Attendance Services / Academic Cheating Tools" },
  { emoji: "🛍️", label: "Stolen Goods / Items of Unknown Origin" },
  { emoji: "🔞", label: "Adult Content / Obscene Material" },
  { emoji: "💰", label: "Counterfeit Currency / Fake Documents / IDs" },
  { emoji: "📡", label: "Hacking Tools / Pirated Software / Malware" },
  { emoji: "🎰", label: "Gambling, Betting Apps / Ponzi Schemes / MLM Chains" },
];

const featureGrid = [
  { icon: "🛡️", title: "Safe Harbor", desc: "IT Act 2000, Section 79 — Intermediary protection", color: "#00d2ff" },
  { icon: "🎓", title: "Students Only", desc: "Exclusive to @marwadiuniversity.ac.in accounts", color: "#a855f7" },
  { icon: "🔐", title: "OTP Security", desc: "Escrow-based handover for all resale deals", color: "#4ade80" },
  { icon: "⚖️", title: "Zero Tolerance", desc: "Prohibited items = instant ban + university report", color: "#f87171" },
];

export default function TermsPage() {
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
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <span className="text-[9px] sm:text-[10px] md:text-xs text-cyan-400 font-mono tracking-widest uppercase">
              Legal Shield &amp; Campus Guidelines
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 tracking-tight bg-gradient-to-br from-white via-slate-100 to-blue-200 bg-clip-text text-transparent leading-[1.2]">
            Terms of Service &amp;<br />Campus Rules
          </h1>
          <p className="text-xs sm:text-sm text-white/50 leading-relaxed max-w-lg mx-auto mb-5 sm:mb-6 px-1">
            UniVerse is a peer-to-peer campus intermediary platform designed exclusively for verified Marwadi University students.
            Please read and understand these terms before registering an account.
          </p>

          {/* Badges */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-2.5 mb-6 sm:mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/25">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <span className="text-[10px] sm:text-xs text-emerald-400 font-mono tracking-wide">
                IT Act 2000 &mdash; Sec 79 (Safe Harbor)
              </span>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg bg-purple-500/10 border border-purple-500/25">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#c084fc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <span className="text-[10px] sm:text-xs text-purple-300 font-mono tracking-wide">
                Effective: September 2026
              </span>
            </div>
          </div>

          {/* Feature Grid (2 cols on mobile, 4 cols on tablet/desktop) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 mb-6 sm:mb-8 text-left">
            {featureGrid.map((f, i) => (
              <div
                key={i}
                className="p-3 sm:p-4 rounded-xl bg-white/[0.03] border border-white/[0.07] flex flex-col gap-1.5 sm:gap-2 transition-colors hover:border-white/15"
              >
                <span className="text-xl sm:text-2xl">{f.icon}</span>
                <span className="text-xs sm:text-sm font-bold" style={{ color: f.color }}>{f.title}</span>
                <span className="text-[10px] sm:text-xs text-white/45 leading-snug sm:leading-relaxed">{f.desc}</span>
              </div>
            ))}
          </div>

          {/* Quick-Jump Pills */}
          <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 max-w-2xl mx-auto">
            {[
              { label: "Safe Harbor", href: "#safe-harbor" },
              { label: "Eligibility", href: "#eligibility" },
              { label: "User Conduct", href: "#conduct" },
              { label: "Prohibited Items", href: "#prohibited-items", accent: "red" },
              { label: "Delivery Rules", href: "#delivery" },
              { label: "Resale OTP", href: "#resale" },
              { label: "Termination", href: "#termination" },
              { label: "Liability", href: "#liability" },
              { label: "Governing Law", href: "#governing-law" },
              { label: "Grievance", href: "#grievance", accent: "blue" },
            ].map((pill, i) => (
              <a
                key={i}
                href={pill.href}
                className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-mono no-underline transition-all active:scale-95 whitespace-nowrap ${
                  pill.accent === "red"
                    ? "bg-red-500/10 border border-red-500/30 text-red-300 hover:bg-red-500/20"
                    : pill.accent === "blue"
                    ? "bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20"
                    : "bg-white/[0.03] border border-white/10 text-white/70 hover:bg-white/[0.08]"
                }`}
              >
                {pill.label}
              </a>
            ))}
          </div>
        </section>

        {/* ── Section 1 ── */}
        <Section id="safe-harbor" title="1. Platform Nature — Safe Harbor (IT Act Section 79)">
          <p>
            UniVerse is a <strong>peer-to-peer intermediary platform</strong> facilitating connections among verified Marwadi University students.
            We function solely as a campus marketplace facilitator — not as a direct seller, buyer, or delivery employer.
          </p>
          <p className="mt-3">
            Under <strong>Section 79 of the Information Technology Act, 2000 (Safe Harbor)</strong>, UniVerse operates as an intermediary.
            UniVerse, its founders, and platform administrators bear no liability for private disputes, transactions, delivery outcomes, or damages arising between students, except where required by law.
          </p>
          <p className="mt-3">
            <strong>You (the student)</strong> assume complete personal responsibility and liability for your listings, delivery requests, and marketplace transactions.
          </p>
        </Section>

        {/* ── Section 2 ── */}
        <Section id="eligibility" title="2. Eligibility &amp; Account Requirements">
          <RuleList items={[
            <span key="1">Must possess a valid, verifiable <strong>@marwadiuniversity.ac.in</strong> email address</span>,
            "Must be an actively enrolled student at Marwadi University",
            "Must be at least 18 years of age or possess university hostel residency",
            <span key="4">Strict limit of <strong>one account per student</strong> (tied to student enrollment)</span>,
          ]} />
          <Callout color="orange" tag="NOTICE">
            Providing fraudulent registration information will result in immediate permanent suspension and referral to university administration.
          </Callout>
        </Section>

        {/* ── Section 3 ── */}
        <Section id="conduct" title="3. Acceptable Use &amp; User Conduct">
          <p>When using UniVerse, you strictly agree to:</p>
          <RuleList items={[
            "List only lawful, genuine, and truthfully represented items or services",
            "Maintain civil, respectful, and collegiate conduct with fellow students",
            "Refrain from fraudulent transactions, price gouging, or misleading descriptions",
            "Strictly avoid publishing or requesting prohibited items (see Section 4)",
            "Never exploit the platform for spam, harassment, phishing, or abusive messaging",
            "Protect fellow students' privacy and never distribute personal or contact data without authorization",
          ]} />
          <Callout color="orange" tag="STRICT PENALTY">
            Disciplinary ladder: <strong>1st violation</strong> — 7-day temporary suspension. <strong>2nd violation</strong> — Permanent account termination and referral to campus authorities.
          </Callout>
        </Section>

        {/* ── Section 4: Prohibited Items ── */}
        <div
          id="prohibited-items"
          className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-4 sm:p-6 md:p-7 mb-4 sm:mb-6 scroll-mt-24"
        >
          <h2 className="text-sm sm:text-base font-semibold text-white mb-2">
            4. Prohibited Items — Zero Tolerance Policy
          </h2>
          <p className="text-xs sm:text-sm text-white/55 leading-relaxed mb-4 sm:mb-5">
            The following items and activities are strictly PROHIBITED on UniVerse. Attempting to list, request, or deliver any of these items triggers immediate account termination and reporting to Marwadi University administration:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
            {prohibitedItems.map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-lg bg-red-500/[0.06] border border-red-500/20"
              >
                <span className="text-lg sm:text-xl shrink-0">{item.emoji}</span>
                <span className="text-xs sm:text-[13px] text-red-200/90 font-medium leading-snug break-words min-w-0 flex-1">
                  {item.label}
                </span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ff4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 ml-auto text-red-500">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </div>
            ))}
          </div>
          <div className="mt-3.5 sm:mt-4 p-3 sm:p-3.5 rounded-lg bg-amber-500/10 border border-amber-500/25">
            <p className="m-0 text-xs text-amber-300 leading-relaxed">
              <strong>Zero Tolerance:</strong> Posting or facilitating prohibited items will result in an immediate permanent ban, forfeiture of account privileges, and formal disciplinary reporting to campus administration.
            </p>
          </div>
        </div>

        {/* ── Section 5 ── */}
        <Section id="delivery" title="5. Delivery &amp; Campus Runner Guidelines">
          <RuleList items={[
            "Campus runners act as independent peers and may accept or decline delivery requests at their sole discretion",
            "Delivery coordination and peer agreements are the sole mutual responsibility of the requester and runner",
            "UniVerse facilitates matching only and does not warrant or guarantee delivery timing, quality, or fulfillment",
            "Food deliveries are strictly restricted to campus canteen/mess items; delivery of prohibited substances is strictly forbidden",
            "Tips and incentives are entirely voluntary and cannot be coerced or demanded under any circumstances",
            "UniVerse provides no financial underwriting or liability compensation for lost, delayed, or disputed deliveries",
          ]} />
        </Section>

        {/* ── Section 6 ── */}
        <Section id="resale" title="6. Resale Marketplace &amp; Escrow Handover Protocol">
          <RuleList items={[
            "Sellers must provide genuine, unfiltered photographs and transparent condition disclosures",
            <span key="2">Handovers are strictly finalized only upon <strong>buyer 6-digit OTP verification</strong> in the app</span>,
            "Once the buyer OTP is confirmed, transactions are deemed irrevocably fulfilled — no platform chargebacks or returns",
            "UniVerse offers no implied warranties regarding product condition, merchantability, or authenticity",
            "Fraud or dispute claims will trigger simultaneous investigation and possible account restriction of both parties",
          ]} />
        </Section>

        {/* ── Section 7 ── */}
        <Section id="termination" title="7. Account Suspension &amp; Termination">
          <p>UniVerse reserves the right to suspend or terminate any student account immediately if:</p>
          <RuleList items={[
            "A violation of these Terms of Service or campus guidelines occurs (notably prohibited item listings)",
            "Fraudulent, malicious, or deceptive platform conduct is identified",
            "Repeated substantiated peer complaints or ratings abuse are submitted",
            "Formal compliance requests are issued by Marwadi University administrative authorities",
          ]} />
          <Callout color="red" tag="STRICT PENALTY">
            <strong>Permanent Termination:</strong> Severe violations result in permanent forfeiture of account access and referral of student enrollment details to university disciplinary committees.
          </Callout>
        </Section>

        {/* ── Section 8 ── */}
        <Section id="liability" title="8. Disclaimer of Warranties &amp; Limitation of Liability">
          <p>UniVerse is provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis. We explicitly disclaim:</p>
          <RuleList items={[
            "Any warranty regarding the outcome, quality, or safety of peer-to-peer transactions",
            "Liability for service interruptions, data sync delays, or platform downtime",
            "Accuracy or integrity of third-party external links or payment gateways",
            "Physical identity verification beyond institutional email domain validation",
          ]} />
          <p className="mt-3 text-white/50 text-xs">
            Maximum aggregate platform liability is limited strictly to <strong className="text-white">₹0</strong>, as UniVerse operates as a complimentary, non-commercial student service.
          </p>
        </Section>

        {/* ── Section 9 ── */}
        <Section id="governing-law" title="9. Governing Law &amp; Jurisdiction">
          <p>These Terms shall be interpreted and governed in accordance with the laws of the Republic of India:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-2.5 mt-3.5">
            {[
              { label: "IT Act, 2000", sub: "Section 79 — Safe Harbor", color: "#00d2ff" },
              { label: "Consumer Protection Act, 2019", sub: "Buyer rights protection", color: "#4ade80" },
              { label: "DPDPA, 2023", sub: "Digital personal data privacy", color: "#c084fc" },
              { label: "Indian Contract Act, 1872", sub: "Transaction enforceability", color: "#fbbf24" },
            ].map((act, i) => (
              <div
                key={i}
                className="p-2.5 sm:p-3 rounded-lg bg-white/[0.03] flex flex-col gap-1 border transition-colors"
                style={{ borderColor: `${act.color}33` }}
              >
                <span className="text-xs sm:text-[13px] font-bold" style={{ color: act.color }}>{act.label}</span>
                <span className="text-[10px] sm:text-xs text-white/45">{act.sub}</span>
              </div>
            ))}
          </div>
          <p className="mt-3.5 text-xs sm:text-sm">
            Exclusive Territorial Jurisdiction: <strong className="text-white">Courts of Rajkot, Gujarat, India.</strong>
          </p>
        </Section>

        {/* ── Section 10 ── */}
        <Section id="changes" title="10. Amendments &amp; Updates">
          <p>
            UniVerse reserves the right to modify these terms periodically to reflect operational improvements or regulatory obligations. Students will be notified of material amendments via email at least 14 days prior to implementation. Continued use of the platform constitutes explicit acceptance of revised terms.
          </p>
          <p className="mt-3 text-white/45 text-[11px] sm:text-xs font-mono">
            Last revised: September 2026 &middot; Effective: From account registration date
          </p>
        </Section>

        {/* ── Section 11: Grievance ── */}
        <div
          id="grievance"
          className="bg-cyan-500/[0.04] border border-cyan-500/20 rounded-xl p-4 sm:p-6 md:p-7 mb-4 sm:mb-6 scroll-mt-24"
        >
          <h2 className="text-sm sm:text-base font-semibold text-white mb-2">
            11. Grievance Redressal (DPDPA 2023 Compliance)
          </h2>
          <p className="text-xs sm:text-sm text-white/55 leading-relaxed mb-4">
            In accordance with the Digital Personal Data Protection Act (DPDPA), 2023, UniVerse has designated a formal{" "}
            <strong className="text-white/80">Grievance Redressal Officer</strong> to address and resolve student data privacy concerns within statutory timelines.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5 mb-4">
            {[
              { label: "Designation", value: "Grievance Officer — UniVerse" },
              { label: "Platform", value: "UniVerse Campus App (MU)" },
              { label: "Response SLA", value: "Within 30 days of complaint" },
              { label: "Jurisdiction", value: "Rajkot, Gujarat, India" },
            ].map((item, i) => (
              <div
                key={i}
                className="p-2.5 sm:p-3 rounded-lg bg-cyan-500/[0.05] border border-cyan-500/15"
              >
                <p className="m-0 mb-1 text-[9px] sm:text-[10px] text-cyan-400/70 font-mono tracking-wider uppercase">
                  {item.label}
                </p>
                <p className="m-0 text-xs sm:text-[13px] text-white/85 font-medium">{item.value}</p>
              </div>
            ))}
          </div>
          <div className="text-center pt-1">
            <a
              href="mailto:grievance@universe.mu.ac.in"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 sm:py-3 rounded-lg bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 hover:bg-cyan-500/20 text-xs sm:text-sm font-mono tracking-wide no-underline transition-all break-all"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                <rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
              grievance@universe.mu.ac.in
            </a>
          </div>
        </div>

        {/* ── Contact ── */}
        <div
          id="contact"
          className="bg-purple-500/[0.04] border border-purple-500/20 rounded-xl p-4 sm:p-6 md:p-7 text-center mb-6 scroll-mt-24"
        >
          <h2 className="text-sm sm:text-base font-semibold text-white mb-2">Questions or Inquiries?</h2>
          <p className="text-xs sm:text-sm text-white/50 leading-relaxed mb-4 max-w-md mx-auto">
            If you have any questions or require clarification regarding these terms, contact our support team. We acknowledge all inquiries within 48 hours.
          </p>
          <a
            href="mailto:support@universe.mu.ac.in"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 sm:py-3 rounded-lg bg-purple-500/10 border border-purple-400/30 text-purple-300 hover:bg-purple-500/20 text-xs sm:text-sm font-mono tracking-wide no-underline transition-all break-all"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
              <rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
            support@universe.mu.ac.in
          </a>
        </div>

        {/* ── Footer Nav ── */}
        <div className="flex items-center justify-center gap-3 sm:gap-5 flex-wrap text-xs font-mono pt-4">
          <Link href="/privacy" className="text-white/45 hover:text-white no-underline transition-colors">Privacy Policy</Link>
          <span className="text-white/15">&bull;</span>
          <Link href="/register" className="text-cyan-400 hover:text-cyan-300 no-underline transition-colors">Create Account &rarr;</Link>
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

function Section({ id, title, children }: { id?: string; title: string; children: React.ReactNode }) {
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

function Callout({ children, color, tag }: { children: React.ReactNode; color: "orange" | "red"; tag?: string }) {
  const isRed = color === "red";
  return (
    <div
      className={`mt-3.5 p-3 sm:p-3.5 rounded-lg border ${
        isRed
          ? "bg-red-500/[0.07] border-red-500/25 text-red-300"
          : "bg-amber-500/[0.07] border-amber-500/25 text-amber-300"
      }`}
    >
      {tag && (
        <p className="m-0 mb-1 text-[9px] sm:text-[10px] font-mono tracking-wider opacity-85 uppercase flex items-center gap-1">
          <span>{isRed ? "🚨" : "⚠️"}</span>
          <span>{tag}</span>
        </p>
      )}
      <p className="m-0 text-xs leading-relaxed">{children}</p>
    </div>
  );
}

function RuleList({ items }: { items: (string | React.ReactNode)[] }) {
  return (
    <div className="flex flex-col mt-2.5 sm:mt-3 divide-y divide-white/[0.04]">
      {items.map((item, i) => (
        <div
          key={i}
          className="flex items-start gap-2.5 sm:gap-3 py-2 sm:py-2.5 first:pt-0 last:pb-0"
        >
          <span className="shrink-0 mt-0.5 text-[9px] sm:text-[10px] text-cyan-400 font-bold">
            ✦
          </span>
          <span className="text-xs sm:text-sm text-white/65 leading-relaxed min-w-0 flex-1">
            {item}
          </span>
        </div>
      ))}
    </div>
  );
}
