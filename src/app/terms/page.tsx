import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — UniVerse Campus Platform",
  description:
    "UniVerse Campus Platform ke Terms of Service, Campus Rules, aur Prohibited Items List. Marwadi University students ke liye peer-to-peer platform guidelines.",
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
            UniVerse ek peer-to-peer campus platform hai exclusively Marwadi University students ke liye.
            Account banane se pehle in rules ko padhna zaroori hai.
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
            UniVerse ek <strong>peer-to-peer intermediary platform</strong> hai jo Marwadi University students ko aapas mein connect karta hai.
            Hum ek marketplace facilitator hain — na koi party seller, buyer, ya delivery agent.
          </p>
          <p className="mt-3">
            India ke <strong>Information Technology Act, 2000 — Section 79</strong> ke under, UniVerse ek Intermediary hai.
            Kisi bhi do students ke beech ki transaction, jhagda, ya nuksan ke liye UniVerse, uske founders, ya employees
            zimmedar nahi honge, jab tak humne kisi illegal kaam mein actively participate na kiya ho.
          </p>
          <p className="mt-3">
            <strong>Aap (student)</strong> poori zimmedari lete hain apni listing, delivery request, ya kisi bhi deal ke liye.
          </p>
        </Section>

        {/* ── Section 2 ── */}
        <Section id="eligibility" title="2. Eligibility — Kaun Use Kar Sakta Hai">
          <RuleList items={[
            <span key="1">Valid <strong>@marwadiuniversity.ac.in</strong> email hona chahiye</span>,
            "Active enrolled student hona chahiye",
            "18 saal ya usse zyada ki age honi chahiye",
            <span key="4">Ek student sirf <strong>ek account</strong> rakh sakta hai</span>,
          ]} />
          <Callout color="orange" tag="NOTICE">
            Galat information par account permanently ban aur university ko report kiya jayega.
          </Callout>
        </Section>

        {/* ── Section 3 ── */}
        <Section id="conduct" title="3. Acceptable Use &amp; User Conduct">
          <p>Platform use karte waqt aap agree karte hain ki aap:</p>
          <RuleList items={[
            "Sirf legal aur genuine items/services list karenge",
            "Doosre students ke saath respect se behave karenge",
            "Koi fraud, scam, ya misleading listing nahi karenge",
            "Prohibited items bilkul nahi post karenge (Section 4 dekhein)",
            "Platform ko spam, phishing, ya harassment ke liye use nahi karenge",
            "Kisi bhi student ka personal data share ya leak nahi karenge",
          ]} />
          <Callout color="orange" tag="STRICT PENALTY">
            Violations: <strong>1st offense</strong> — 7 din suspension. <strong>2nd offense</strong> — Permanent ban + university report.
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
            Neeche diye gaye items platform par bilkul BANNED hain. Inhe post karna turant account ban
            aur college ID university administration ko report karne ka kaaran banega:
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
              <strong>Zero Tolerance:</strong> Koi bhi prohibited item list karne par account turant permanently ban hoga aur student ka college enrollment ID university administration ko report kar di jayegi.
            </p>
          </div>
        </div>

        {/* ── Section 5 ── */}
        <Section id="delivery" title="5. Delivery &amp; Campus Runner Rules">
          <RuleList items={[
            "Runners apni marzi se orders accept ya reject kar sakte hain",
            "Runner aur requester ke beech deal unki personal zimmedari hai",
            "UniVerse delivery ka guarantee nahi deta — hum sirf connect karte hain",
            "Food orders: sirf canteen/mess ka food; bahar se prohibited items bilkul nahi",
            "Tip voluntary hai — koi forced nahi kar sakta",
            "Delivery dispute mein UniVerse koi financial compensation nahi dega",
          ]} />
        </Section>

        {/* ── Section 6 ── */}
        <Section id="resale" title="6. Resale Marketplace &amp; Escrow OTP">
          <RuleList items={[
            "Seller authentic photos aur accurate condition details dega",
            <span key="2">Buyer <strong>OTP verification</strong> ke baad hi handover complete hoga</span>,
            "OTP confirm hone ke baad deal final — koi refund ya cancellation nahi",
            "UniVerse kisi bhi product ki quality, authenticity, ya condition guarantee nahi deta",
            "Scam reports par dono parties ka account investigate kiya jayega",
          ]} />
        </Section>

        {/* ── Section 7 ── */}
        <Section id="termination" title="7. Account Suspension &amp; Termination">
          <p>UniVerse kisi bhi account ko suspend ya terminate kar sakta hai agar:</p>
          <RuleList items={[
            "Terms ka violation ho (especially prohibited items)",
            "Fraudulent activity prove ho",
            "Multiple legitimate complaints aaye",
            "University administration ne request ki ho",
          ]} />
          <Callout color="red" tag="STRICT PENALTY">
            <strong>Permanent ban:</strong> College ID (enrollment number) university administration ko report ki jayegi aur disciplinary action ho sakta hai.
          </Callout>
        </Section>

        {/* ── Section 8 ── */}
        <Section id="liability" title="8. Disclaimer of Liability">
          <p>UniVerse &quot;AS IS&quot; provide kiya jata hai. Hum explicitly disclaim karte hain:</p>
          <RuleList items={[
            "Kisi bhi peer-to-peer transaction ki guarantee",
            "Platform downtime se hone wale kisi bhi nuksan ki zimmedari",
            "Third-party links ya services ki accuracy",
            "Kisi bhi student ki identity verification (sirf email verify hota hai)",
          ]} />
          <p className="mt-3 text-white/50 text-xs">
            Maximum liability: <strong className="text-white">₹0</strong> — kyunki UniVerse ek free, non-commercial student project hai.
          </p>
        </Section>

        {/* ── Section 9 ── */}
        <Section id="governing-law" title="9. Governing Law">
          <p>Ye Terms India ke laws ke anusaar govern ki jayengi:</p>
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
            Jurisdiction: <strong className="text-white">Rajkot, Gujarat, India.</strong>
          </p>
        </Section>

        {/* ── Section 10 ── */}
        <Section id="changes" title="10. Changes to Terms">
          <p>
            UniVerse in terms ko kisi bhi waqt update kar sakta hai. Material changes par aapko email notification milega.
            Continued use of platform = acceptance of new terms.
          </p>
          <p className="mt-3 text-white/45 text-[11px] sm:text-xs font-mono">
            Last updated: September 2026 &middot; Effective: From account creation date
          </p>
        </Section>

        {/* ── Section 11: Grievance ── */}
        <div
          id="grievance"
          className="bg-cyan-500/[0.04] border border-cyan-500/20 rounded-xl p-4 sm:p-6 md:p-7 mb-4 sm:mb-6 scroll-mt-24"
        >
          <h2 className="text-sm sm:text-base font-semibold text-white mb-2">
            11. Grievance Redressal — DPDPA 2023
          </h2>
          <p className="text-xs sm:text-sm text-white/55 leading-relaxed mb-4">
            Digital Personal Data Protection Act (DPDPA), 2023 ke compliance mein, UniVerse ek{" "}
            <strong className="text-white/80">Grievance Officer</strong> niyukt karta hai
            jo student complaints 30 din ke andar resolve karega.
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
          <h2 className="text-sm sm:text-base font-semibold text-white mb-2">Koi Sawaal Hai?</h2>
          <p className="text-xs sm:text-sm text-white/50 leading-relaxed mb-4 max-w-md mx-auto">
            Terms ke baare mein koi confusion ho to contact karein. Hum 48 ghante ke andar jawab denge.
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
