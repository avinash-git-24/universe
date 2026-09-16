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
];

const featureGrid = [
  { icon: "🛡️", title: "Safe Harbor", desc: "IT Act 2000, Section 79 — Intermediary protection", color: "#00d2ff" },
  { icon: "🎓", title: "Students Only", desc: "Exclusive to @marwadiuniversity.ac.in accounts", color: "#a855f7" },
  { icon: "🔐", title: "OTP Security", desc: "Escrow-based handover for all resale deals", color: "#4ade80" },
  { icon: "⚖️", title: "Zero Tolerance", desc: "Prohibited items = instant ban + university report", color: "#f87171" },
];

export default function TermsPage() {
  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "linear-gradient(135deg, #060b14 0%, #0a0f1e 50%, #060b14 100%)",
        color: "#fff",
        fontFamily: "'Inter', sans-serif",
        paddingBottom: 80,
      }}
    >
      {/* Header */}
      <header
        style={{
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          background: "rgba(6,11,20,0.92)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          position: "sticky",
          top: 0,
          zIndex: 50,
          padding: "14px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
        }}
      >
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 32, height: 32, borderRadius: 8,
              background: "linear-gradient(135deg, #00d2ff 0%, #0077ff 100%)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 0 16px rgba(0,210,255,0.4)", flexShrink: 0,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="black" stroke="black" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
          </div>
          <span style={{ fontSize: 20, fontWeight: 700, color: "#fff", letterSpacing: "1.5px" }}>UniVerse</span>
        </Link>
        <Link
          href="/"
          style={{
            textDecoration: "none", padding: "7px 16px", borderRadius: 6,
            border: "1px solid rgba(0,210,255,0.4)", color: "#00d2ff",
            fontSize: 11, fontFamily: "'Space Mono', monospace", letterSpacing: "1px",
          }}
        >
          &larr; Back to UniVerse
        </Link>
      </header>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "48px 20px 0" }}>
        {/* Hero */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "6px 16px", borderRadius: 100,
              background: "rgba(0,210,255,0.08)", border: "1px solid rgba(0,210,255,0.22)",
              marginBottom: 20,
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#00d2ff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <span style={{ fontSize: 10, color: "#00d2ff", fontFamily: "'Space Mono', monospace", letterSpacing: "2px", textTransform: "uppercase" }}>
              Legal Shield &amp; Campus Guidelines
            </span>
          </div>

          <h1
            style={{
              fontSize: "clamp(26px, 5vw, 40px)", fontWeight: 700, margin: "0 0 12px",
              background: "linear-gradient(135deg, #ffffff 0%, #a0c4ff 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", lineHeight: 1.2,
            }}
          >
            Terms of Service &amp;<br />Campus Rules
          </h1>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", lineHeight: 1.7, maxWidth: 520, margin: "0 auto 20px" }}>
            UniVerse ek peer-to-peer campus platform hai exclusively Marwadi University students ke liye.
            Account banane se pehle in rules ko padhna zaroori hai.
          </p>

          {/* Badges */}
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 10, marginBottom: 28 }}>
            <div
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "8px 16px", borderRadius: 8,
                background: "rgba(0,200,100,0.07)", border: "1px solid rgba(0,200,100,0.22)",
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <span style={{ fontSize: 11, color: "#4ade80", fontFamily: "'Space Mono', monospace", letterSpacing: "0.8px" }}>
                IT Act 2000 &mdash; Section 79 (Safe Harbor)
              </span>
            </div>
            <div
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "8px 16px", borderRadius: 8,
                background: "rgba(168,85,247,0.07)", border: "1px solid rgba(168,85,247,0.22)",
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#c084fc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <span style={{ fontSize: 11, color: "#c084fc", fontFamily: "'Space Mono', monospace", letterSpacing: "0.8px" }}>
                Effective: September 2026
              </span>
            </div>
          </div>

          {/* Feature Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: 12, marginBottom: 28, textAlign: "left",
            }}
          >
            {featureGrid.map((f, i) => (
              <div
                key={i}
                style={{
                  padding: "16px 18px", borderRadius: 10,
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  display: "flex", flexDirection: "column", gap: 8,
                }}
              >
                <span style={{ fontSize: 22 }}>{f.icon}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: f.color }}>{f.title}</span>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", lineHeight: 1.5 }}>{f.desc}</span>
              </div>
            ))}
          </div>

          {/* Quick-Jump Pills */}
          <div
            style={{
              display: "flex", flexWrap: "wrap", justifyContent: "center",
              gap: 8, maxWidth: 720, margin: "0 auto",
            }}
          >
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
                style={{
                  padding: "6px 12px", borderRadius: 100,
                  background: pill.accent === "red" ? "rgba(255,60,60,0.08)" : pill.accent === "blue" ? "rgba(0,210,255,0.08)" : "rgba(255,255,255,0.03)",
                  border: pill.accent === "red" ? "1px solid rgba(255,60,60,0.25)" : pill.accent === "blue" ? "1px solid rgba(0,210,255,0.25)" : "1px solid rgba(255,255,255,0.09)",
                  color: pill.accent === "red" ? "#ff8b8b" : pill.accent === "blue" ? "#00d2ff" : "rgba(255,255,255,0.7)",
                  fontSize: 11, fontFamily: "'Space Mono', monospace", textDecoration: "none",
                  whiteSpace: "nowrap",
                }}
              >
                {pill.label}
              </a>
            ))}
          </div>
        </div>

        {/* Section 1 */}
        <Section id="safe-harbor" title="1. Platform Nature — Safe Harbor (IT Act Section 79)">
          <p>
            UniVerse ek <strong>peer-to-peer intermediary platform</strong> hai jo Marwadi University students ko aapas mein connect karta hai.
            Hum ek marketplace facilitator hain — na koi party seller, buyer, ya delivery agent.
          </p>
          <p style={{ marginTop: 12 }}>
            India ke <strong>Information Technology Act, 2000 — Section 79</strong> ke under, UniVerse ek Intermediary hai.
            Kisi bhi do students ke beech ki transaction, jhagda, ya nuksan ke liye UniVerse, uske founders, ya employees
            zimmedar nahi honge, jab tak humne kisi illegal kaam mein actively participate na kiya ho.
          </p>
          <p style={{ marginTop: 12 }}>
            <strong>Aap (student)</strong> poori zimmedari lete hain apni listing, delivery request, ya kisi bhi deal ke liye.
          </p>
        </Section>

        {/* Section 2 */}
        <Section id="eligibility" title="2. Eligibility — Kaun Use Kar Sakta Hai">
          <ul style={{ paddingLeft: 20, margin: 0, lineHeight: 2 }}>
            <li>Valid <strong>@marwadiuniversity.ac.in</strong> email hona chahiye</li>
            <li>Active enrolled student hona chahiye</li>
            <li>18 saal ya usse zyada ki age honi chahiye</li>
            <li>Ek student sirf <strong>ek account</strong> rakh sakta hai</li>
          </ul>
          <Callout color="orange">
            Galat information par account permanently ban aur university ko report kiya jayega.
          </Callout>
        </Section>

        {/* Section 3 */}
        <Section id="conduct" title="3. Acceptable Use &amp; User Conduct">
          <p>Platform use karte waqt aap agree karte hain ki aap:</p>
          <ul style={{ paddingLeft: 20, margin: "12px 0 0", lineHeight: 2 }}>
            <li>Sirf legal aur genuine items/services list karenge</li>
            <li>Doosre students ke saath respect se behave karenge</li>
            <li>Koi fraud, scam, ya misleading listing nahi karenge</li>
            <li>Prohibited items bilkul nahi post karenge (Section 4 dekhein)</li>
            <li>Platform ko spam, phishing, ya harassment ke liye use nahi karenge</li>
            <li>Kisi bhi student ka personal data share ya leak nahi karenge</li>
          </ul>
          <Callout color="orange">
            Violations: <strong>1st offense</strong> — 7 din suspension. <strong>2nd offense</strong> — Permanent ban + university report.
          </Callout>
        </Section>

        {/* Section 4: Prohibited Items */}
        <div
          id="prohibited-items"
          style={{
            background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 12, padding: "28px", marginBottom: 24, scrollMarginTop: 90,
          }}
        >
          <h2 style={{ margin: "0 0 8px", fontSize: 16, fontWeight: 600, color: "#fff" }}>
            4. Prohibited Items — Zero Tolerance Policy
          </h2>
          <p style={{ margin: "0 0 20px", fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.7 }}>
            Neeche diye gaye items platform par bilkul BANNED hain. Inhe post karna turant account ban
            aur college ID university administration ko report karne ka kaaran banega:
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 10,
            }}
          >
            {prohibitedItems.map((item, i) => (
              <div
                key={i}
                style={{
                  display: "flex", alignItems: "center", gap: 14,
                  padding: "11px 16px", borderRadius: 8,
                  background: "rgba(255,60,60,0.06)", border: "1px solid rgba(255,60,60,0.18)",
                }}
              >
                <span style={{ fontSize: 20, flexShrink: 0 }}>{item.emoji}</span>
                <span style={{ fontSize: 12, color: "rgba(255,200,200,0.9)", fontWeight: 500, lineHeight: 1.4 }}>{item.label}</span>
                <div style={{ marginLeft: "auto", flexShrink: 0 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ff4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
          <div
            style={{
              marginTop: 16, padding: "12px 16px", borderRadius: 8,
              background: "rgba(255,150,0,0.07)", border: "1px solid rgba(255,150,0,0.25)",
            }}
          >
            <p style={{ margin: 0, fontSize: 12, color: "#fbbf24", lineHeight: 1.7 }}>
              Zero Tolerance: Koi bhi prohibited item list karne par account turant permanently ban hoga aur student ka college enrollment ID university administration ko report kar di jayegi.
            </p>
          </div>
        </div>

        {/* Section 5 */}
        <Section id="delivery" title="5. Delivery &amp; Campus Runner Rules">
          <ul style={{ paddingLeft: 20, margin: 0, lineHeight: 2 }}>
            <li>Runners apni marzi se orders accept ya reject kar sakte hain</li>
            <li>Runner aur requester ke beech deal unki personal zimmedari hai</li>
            <li>UniVerse delivery ka guarantee nahi deta — hum sirf connect karte hain</li>
            <li>Food orders: sirf canteen/mess ka food; bahar se prohibited items bilkul nahi</li>
            <li>Tip voluntary hai — koi forced nahi kar sakta</li>
            <li>Delivery dispute mein UniVerse koi financial compensation nahi dega</li>
          </ul>
        </Section>

        {/* Section 6 */}
        <Section id="resale" title="6. Resale Marketplace &amp; Escrow OTP">
          <ul style={{ paddingLeft: 20, margin: 0, lineHeight: 2 }}>
            <li>Seller authentic photos aur accurate condition details dega</li>
            <li>Buyer <strong>OTP verification</strong> ke baad hi handover complete hoga</li>
            <li>OTP confirm hone ke baad deal final — koi refund ya cancellation nahi</li>
            <li>UniVerse kisi bhi product ki quality, authenticity, ya condition guarantee nahi deta</li>
            <li>Scam reports par dono parties ka account investigate kiya jayega</li>
          </ul>
        </Section>

        {/* Section 7 */}
        <Section id="termination" title="7. Account Suspension &amp; Termination">
          <p>UniVerse kisi bhi account ko suspend ya terminate kar sakta hai agar:</p>
          <ul style={{ paddingLeft: 20, margin: "12px 0 0", lineHeight: 2 }}>
            <li>Terms ka violation ho (especially prohibited items)</li>
            <li>Fraudulent activity prove ho</li>
            <li>Multiple legitimate complaints aaye</li>
            <li>University administration ne request ki ho</li>
          </ul>
          <Callout color="red">
            <strong>Permanent ban:</strong> College ID (enrollment number) university administration ko report ki jayegi aur disciplinary action ho sakta hai.
          </Callout>
        </Section>

        {/* Section 8 */}
        <Section id="liability" title="8. Disclaimer of Liability">
          <p>UniVerse &quot;AS IS&quot; provide kiya jata hai. Hum explicitly disclaim karte hain:</p>
          <ul style={{ paddingLeft: 20, margin: "12px 0 0", lineHeight: 2 }}>
            <li>Kisi bhi peer-to-peer transaction ki guarantee</li>
            <li>Platform downtime se hone wale kisi bhi nuksan ki zimmedari</li>
            <li>Third-party links ya services ki accuracy</li>
            <li>Kisi bhi student ki identity verification (sirf email verify hota hai)</li>
          </ul>
          <p style={{ marginTop: 12, color: "rgba(255,255,255,0.5)", fontSize: 12 }}>
            Maximum liability: <strong>₹0</strong> — kyunki UniVerse ek free, non-commercial student project hai.
          </p>
        </Section>

        {/* Section 9 */}
        <Section id="governing-law" title="9. Governing Law">
          <p>Ye Terms India ke laws ke anusaar govern ki jayengi:</p>
          <ul style={{ paddingLeft: 20, margin: "12px 0 0", lineHeight: 2 }}>
            <li>Information Technology Act, 2000 (Section 79 — Safe Harbor)</li>
            <li>Consumer Protection Act, 2019</li>
            <li>Digital Personal Data Protection Act (DPDPA), 2023</li>
            <li>Indian Contract Act, 1872</li>
          </ul>
          <p style={{ marginTop: 12 }}>
            Jurisdiction: <strong>Rajkot, Gujarat, India.</strong>
          </p>
        </Section>

        {/* Section 10 */}
        <Section id="changes" title="10. Changes to Terms">
          <p>
            UniVerse in terms ko kisi bhi waqt update kar sakta hai. Material changes par aapko email notification milega.
            Continued use of platform = acceptance of new terms.
          </p>
          <p style={{ marginTop: 12, color: "rgba(255,255,255,0.45)", fontSize: 12, fontFamily: "'Space Mono', monospace" }}>
            Last updated: September 2026 &middot; Effective: From account creation date
          </p>
        </Section>

        {/* Section 11: Grievance */}
        <div
          id="grievance"
          style={{
            background: "rgba(0,210,255,0.04)",
            border: "1px solid rgba(0,210,255,0.18)",
            borderRadius: 12, padding: "28px", marginBottom: 24, scrollMarginTop: 90,
          }}
        >
          <h2 style={{ margin: "0 0 8px", fontSize: 16, fontWeight: 600, color: "#fff" }}>
            11. Grievance Redressal — DPDPA 2023
          </h2>
          <p style={{ margin: "0 0 16px", fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.7 }}>
            Digital Personal Data Protection Act (DPDPA), 2023 ke compliance mein, UniVerse ek{" "}
            <strong style={{ color: "rgba(255,255,255,0.8)" }}>Grievance Officer</strong> niyukt karta hai
            jo student complaints 30 din ke andar resolve karega.
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 12, marginBottom: 16,
            }}
          >
            {[
              { label: "Designation", value: "Grievance Officer — UniVerse" },
              { label: "Platform", value: "UniVerse Campus App (MU)" },
              { label: "Response SLA", value: "Within 30 days of complaint" },
              { label: "Jurisdiction", value: "Rajkot, Gujarat, India" },
            ].map((item, i) => (
              <div
                key={i}
                style={{
                  padding: "12px 16px", borderRadius: 8,
                  background: "rgba(0,210,255,0.05)", border: "1px solid rgba(0,210,255,0.14)",
                }}
              >
                <p style={{ margin: "0 0 4px", fontSize: 10, color: "rgba(0,210,255,0.6)", fontFamily: "'Space Mono', monospace", letterSpacing: "0.8px", textTransform: "uppercase" }}>
                  {item.label}
                </p>
                <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.8)", fontWeight: 500 }}>{item.value}</p>
              </div>
            ))}
          </div>
          <div style={{ textAlign: "center" }}>
            <a
              href="mailto:grievance@universe.mu.ac.in"
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "10px 22px", borderRadius: 6,
                background: "rgba(0,210,255,0.1)", border: "1px solid rgba(0,210,255,0.28)",
                color: "#00d2ff", textDecoration: "none",
                fontSize: 12, fontFamily: "'Space Mono', monospace", letterSpacing: "0.5px",
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
              grievance@universe.mu.ac.in
            </a>
          </div>
        </div>

        {/* Contact */}
        <div
          id="contact"
          style={{
            background: "rgba(168,85,247,0.04)", border: "1px solid rgba(168,85,247,0.18)",
            borderRadius: 12, padding: "28px", textAlign: "center", marginBottom: 24, scrollMarginTop: 90,
          }}
        >
          <h2 style={{ margin: "0 0 8px", fontSize: 16, fontWeight: 600, color: "#fff" }}>Koi Sawaal Hai?</h2>
          <p style={{ margin: "0 0 16px", fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>
            Terms ke baare mein koi confusion ho to contact karein. Hum 48 ghante ke andar jawab denge.
          </p>
          <a
            href="mailto:support@universe.mu.ac.in"
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "10px 20px", borderRadius: 6,
              background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.28)",
              color: "#c084fc", textDecoration: "none",
              fontSize: 12, fontFamily: "'Space Mono', monospace", letterSpacing: "0.5px",
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
            support@universe.mu.ac.in
          </a>
        </div>

        {/* Footer Nav */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 20, flexWrap: "wrap" }}>
          <Link href="/privacy" style={{ color: "rgba(255,255,255,0.45)", textDecoration: "none", fontSize: 12, fontFamily: "'Space Mono', monospace" }}>Privacy Policy</Link>
          <span style={{ color: "rgba(255,255,255,0.15)" }}>&bull;</span>
          <Link href="/register" style={{ color: "#00d2ff", textDecoration: "none", fontSize: 12, fontFamily: "'Space Mono', monospace" }}>Create Account &rarr;</Link>
          <span style={{ color: "rgba(255,255,255,0.15)" }}>&bull;</span>
          <Link href="/" style={{ color: "rgba(255,255,255,0.45)", textDecoration: "none", fontSize: 12, fontFamily: "'Space Mono', monospace" }}>Home</Link>
        </div>
      </div>
    </div>
  );
}

function Section({ id, title, children }: { id?: string; title: string; children: React.ReactNode }) {
  return (
    <div
      id={id}
      style={{
        background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 12, padding: "28px", marginBottom: 24, scrollMarginTop: 90,
      }}
    >
      <h2 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 600, color: "#fff" }}>{title}</h2>
      <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.8 }}>{children}</div>
    </div>
  );
}

function Callout({ children, color }: { children: React.ReactNode; color: "orange" | "red" }) {
  const colors = {
    orange: { bg: "rgba(255,150,0,0.07)", border: "rgba(255,150,0,0.25)", text: "#fbbf24" },
    red: { bg: "rgba(255,60,60,0.07)", border: "rgba(255,60,60,0.25)", text: "#ff8b8b" },
  };
  const c = colors[color];
  return (
    <div style={{ marginTop: 14, padding: "11px 16px", borderRadius: 8, background: c.bg, border: `1px solid ${c.border}` }}>
      <p style={{ margin: 0, fontSize: 12, color: c.text, lineHeight: 1.7 }}>{children}</p>
    </div>
  );
}
