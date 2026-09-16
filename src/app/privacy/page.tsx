import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — UniVerse Campus Platform",
  description:
    "UniVerse Campus Platform ki Privacy Policy. Aapka data kaise collect, use, aur protect kiya jata hai.",
};

export default function PrivacyPage() {
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
      {/* ── Sticky Header ── */}
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
            transition: "all 0.2s ease",
          }}
        >
          ← Back to UniVerse
        </Link>
      </header>

      <div style={{ maxWidth: 840, margin: "0 auto", padding: "48px 20px 0" }}>
        {/* ── Hero ── */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "6px 16px", borderRadius: 100,
              background: "rgba(0,210,255,0.08)", border: "1px solid rgba(0,210,255,0.22)",
              marginBottom: 20,
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#00d2ff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <span style={{ fontSize: 10, color: "#00d2ff", fontFamily: "'Space Mono', monospace", letterSpacing: "2px", textTransform: "uppercase" }}>
              Data Privacy & Security
            </span>
          </div>

          <h1
            style={{
              fontSize: "clamp(26px, 5vw, 40px)", fontWeight: 700, margin: "0 0 12px",
              background: "linear-gradient(135deg, #ffffff 0%, #a0c4ff 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", lineHeight: 1.2,
            }}
          >
            Privacy Policy
          </h1>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", lineHeight: 1.7, maxWidth: 520, margin: "0 auto 20px" }}>
            Aapka data aapka hai. UniVerse aapki privacy ko seriously leta hai.
            Yahan transparently padhein ki hum kya collect karte hain aur kyun.
          </p>

          <div
            style={{
              display: "inline-flex", alignItems: "center", gap: 10,
              padding: "10px 20px", borderRadius: 8,
              background: "rgba(0,200,100,0.07)", border: "1px solid rgba(0,200,100,0.22)",
              marginBottom: 24,
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <span style={{ fontSize: 11, color: "#4ade80", fontFamily: "'Space Mono', monospace", letterSpacing: "0.8px" }}>
              We do NOT sell your data to any third party
            </span>
          </div>

          {/* Quick-Jump Navigation Pills */}
          <div
            style={{
              display: "flex", flexWrap: "wrap", justifyContent: "center",
              gap: 8, maxWidth: 650, margin: "0 auto",
            }}
          >
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
                style={{
                  padding: "6px 12px", borderRadius: 100,
                  background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.09)",
                  color: "rgba(255,255,255,0.7)", fontSize: 11,
                  fontFamily: "'Space Mono', monospace", textDecoration: "none",
                  transition: "all 0.15s ease",
                }}
              >
                {pill.label}
              </a>
            ))}
          </div>
        </div>

        {/* ── Summary Cards Grid (2x2 on Mobile, 4x1 on Desktop) ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mb-10">
          {[
            { icon: "🔐", title: "Encrypted Storage", desc: "Supabase PostgreSQL with RLS — sirf aap apna data dekh sakte hain" },
            { icon: "🚫", title: "No Data Selling", desc: "Hum kabhi bhi aapka data advertisers ya third-parties ko nahi bechte" },
            { icon: "🗑️", title: "Right to Delete", desc: "Account delete karo — aapka data 30 din mein permanently erase" },
            { icon: "📧", title: "MU Email Only", desc: "@marwadiuniversity.ac.in — sirf campus email, koi bahar ki information nahi" },
          ].map((card, i) => (
            <div
              key={i}
              style={{
                background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 10, padding: "20px 14px", textAlign: "center",
                display: "flex", flexDirection: "column", alignItems: "center",
              }}
            >
              <div style={{ fontSize: 26, marginBottom: 10 }}>{card.icon}</div>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: "#fff", marginBottom: 6 }}>{card.title}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", lineHeight: 1.5 }}>{card.desc}</div>
            </div>
          ))}
        </div>

        {/* ── Sections ── */}

        <PSection id="data-collected" title="1. Data Jo Hum Collect Karte Hain">
          <p>Jab aap UniVerse use karte hain, hum yeh information collect karte hain:</p>

          <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
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
                style={{
                  padding: "14px 16px", borderRadius: 8,
                  background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <div
                  style={{
                    fontSize: 11, fontWeight: 600, color: group.color,
                    fontFamily: "'Space Mono', monospace", letterSpacing: "1px",
                    textTransform: "uppercase", marginBottom: 10,
                  }}
                >
                  {group.category}
                </div>
                <ul style={{ paddingLeft: 18, margin: 0, lineHeight: 1.9 }}>
                  {group.items.map((item, j) => (
                    <li key={j} style={{ fontSize: 12.5, color: "rgba(255,255,255,0.6)" }}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </PSection>

        <PSection id="data-usage" title="2. Hum Data Ka Use Kaise Karte Hain">
          <ul style={{ paddingLeft: 20, margin: 0, lineHeight: 2 }}>
            <li><strong>Account management:</strong> Login, verification, aur security</li>
            <li><strong>Platform functionality:</strong> Delivery matching, marketplace listings, chat</li>
            <li><strong>Safety:</strong> Fraud detection, prohibited items monitoring, account bans</li>
            <li><strong>Communication:</strong> OTP emails, order status notifications</li>
            <li><strong>Improvements:</strong> Bug fixes aur performance optimization</li>
          </ul>
          <div
            style={{
              marginTop: 14, padding: "11px 16px", borderRadius: 8,
              background: "rgba(0,210,255,0.06)", border: "1px solid rgba(0,210,255,0.18)",
            }}
          >
            <p style={{ margin: 0, fontSize: 12, color: "rgba(180,230,255,0.9)", lineHeight: 1.7 }}>
              ✅ Hum aapka data <strong>kabhi bhi marketing ke liye use nahi karte</strong>, aur kisi bhi third-party advertiser ko nahi dete.
            </p>
          </div>
        </PSection>

        <PSection id="data-sharing" title="3. Data Sharing — Kab Aur Kiske Saath">
          <p>Hum aapka data <strong>sirf</strong> inke saath share kar sakte hain:</p>
          <ul style={{ paddingLeft: 20, margin: "12px 0 0", lineHeight: 2 }}>
            <li><strong>Supabase (Database Provider):</strong> Aapka data securely store karta hai — EU data protection standards follow karta hai</li>
            <li><strong>Vercel (Hosting):</strong> Platform deploy karta hai — GDPR compliant</li>
            <li><strong>University Administration:</strong> Sirf prohibited items violations ya serious misconduct reports ke case mein, aur sirf enrollment ID share hogi</li>
            <li><strong>Law Enforcement:</strong> Sirf valid legal order/court directive ke case mein</li>
          </ul>
          <div
            style={{
              marginTop: 14, padding: "11px 16px", borderRadius: 8,
              background: "rgba(255,60,60,0.05)", border: "1px solid rgba(255,60,60,0.18)",
            }}
          >
            <p style={{ margin: 0, fontSize: 12, color: "#ff8b8b", lineHeight: 1.7 }}>
              🚫 Hum kabhi bhi aapka data social media companies, advertisers, ya data brokers ko nahi bechte ya share karte.
            </p>
          </div>
        </PSection>

        <PSection id="security" title="4. Data Security">
          <ul style={{ paddingLeft: 20, margin: 0, lineHeight: 2 }}>
            <li><strong>Row Level Security (RLS):</strong> Supabase database mein — aap sirf apna data dekh sakte hain</li>
            <li><strong>HTTPS Encryption:</strong> Sab communication end-to-end encrypted</li>
            <li><strong>Password Hashing:</strong> Aapka password hum kabhi plain text mein store nahi karte</li>
            <li><strong>OTP Verification:</strong> Sensitive transactions (escrow handover) ke liye 6-digit OTP</li>
            <li><strong>Session Management:</strong> Secure JWT tokens with automatic expiry</li>
          </ul>
        </PSection>

        <PSection id="your-rights" title="5. Aapke Rights (Aapka Data, Aapka Control)">
          <ul style={{ paddingLeft: 20, margin: 0, lineHeight: 2 }}>
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
          <div
            style={{
              marginTop: 14, padding: "11px 16px", borderRadius: 8,
              background: "rgba(0,210,255,0.06)", border: "1px solid rgba(0,210,255,0.18)",
            }}
          >
            <p style={{ margin: 0, fontSize: 12, color: "rgba(180,230,255,0.9)", lineHeight: 1.7 }}>
              Inme se koi bhi right exercise karne ke liye:{" "}
              <a href="mailto:support@universe.mu.ac.in" style={{ color: "#00d2ff" }}>
                support@universe.mu.ac.in
              </a>{" "}
              par email karein.
            </p>
          </div>
        </PSection>

        <PSection id="cookies" title="6. Cookies & Local Storage">
          <p>UniVerse sirf zaroorat ki cookies use karta hai:</p>
          <ul style={{ paddingLeft: 20, margin: "12px 0 0", lineHeight: 2 }}>
            <li><strong>Session Cookie:</strong> Aapको logged in rakhne ke liye (authentication)</li>
            <li><strong>Preference Storage:</strong> Theme, language settings (local storage only)</li>
          </ul>
          <p style={{ marginTop: 12, color: "rgba(255,255,255,0.5)", fontSize: 12 }}>
            Hum koi tracking cookies, analytics cookies (Google Analytics), ya advertising cookies use nahi karte.
          </p>
        </PSection>

        <PSection id="retention" title="7. Data Retention">
          <ul style={{ paddingLeft: 20, margin: 0, lineHeight: 2 }}>
            <li><strong>Active account:</strong> Jab tak aap use karte hain</li>
            <li><strong>Inactive account:</strong> 1 saal inactivity ke baad email notification, phir 30 din mein delete</li>
            <li><strong>Deleted account:</strong> 30 din mein complete erasure (backups se bhi)</li>
            <li><strong>Chat messages:</strong> 90 din ke baad automatically delete</li>
            <li><strong>Completed orders:</strong> 6 mahine ke liye retain (dispute resolution ke liye)</li>
          </ul>
        </PSection>

        <PSection id="updates" title="8. Changes to Privacy Policy">
          <p>
            Hum is policy ko update kar sakte hain. Significant changes ke liye aapko email se notify kiya jayega
            kam se kam 14 din pehle.
          </p>
          <p style={{ marginTop: 12, color: "rgba(255,255,255,0.45)", fontSize: 12, fontFamily: "'Space Mono', monospace" }}>
            Last updated: September 2026 · Governed by: Indian laws (IT Act 2000, DPDPA 2023)
          </p>
        </PSection>

        {/* ── Grievance Redressal & Contact (DPDPA 2023 Compliance) ── */}
        <div
          id="grievance"
          style={{
            background: "rgba(0,210,255,0.04)", border: "1px solid rgba(0,210,255,0.18)",
            borderRadius: 12, padding: "28px", marginBottom: 24, scrollMarginTop: 90,
          }}
        >
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <h2 style={{ margin: "0 0 8px", fontSize: 16, fontWeight: 600, color: "#fff" }}>
              ⚖️ Grievance Redressal Officer (DPDPA 2023)
            </h2>
            <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>
              Digital Personal Data Protection Act, 2023 ke anusaar designated campus grievance contact:
            </p>
          </div>

          <div
            style={{
              display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 12, marginBottom: 20,
            }}
          >
            <div style={{ padding: "14px", borderRadius: 8, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ fontSize: 10, color: "#00d2ff", fontFamily: "'Space Mono', monospace", letterSpacing: "1px", marginBottom: 4 }}>DESIGNATED OFFICER</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>Lead Platform Administrator</div>
              <div style={{ fontSize: 11.5, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>Marwadi University, Rajkot</div>
            </div>

            <div style={{ padding: "14px", borderRadius: 8, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ fontSize: 10, color: "#4ade80", fontFamily: "'Space Mono', monospace", letterSpacing: "1px", marginBottom: 4 }}>RESOLUTION TIMELINE</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#4ade80" }}>48 Hours Acknowledgment</div>
              <div style={{ fontSize: 11.5, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>Max 15 working days resolution</div>
            </div>
          </div>

          <div style={{ textAlign: "center" }}>
            <a
              href="mailto:support@universe.mu.ac.in"
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "10px 20px", borderRadius: 6,
                background: "rgba(0,210,255,0.1)", border: "1px solid rgba(0,210,255,0.28)",
                color: "#00d2ff", textDecoration: "none",
                fontSize: 12, fontFamily: "'Space Mono', monospace", letterSpacing: "0.5px",
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
              support@universe.mu.ac.in
            </a>
          </div>
        </div>

        {/* ── Footer Nav ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 20, flexWrap: "wrap" }}>
          <Link href="/terms" style={{ color: "#00d2ff", textDecoration: "none", fontSize: 12, fontFamily: "'Space Mono', monospace" }}>Terms of Service</Link>
          <span style={{ color: "rgba(255,255,255,0.15)" }}>•</span>
          <Link href="/register" style={{ color: "rgba(255,255,255,0.45)", textDecoration: "none", fontSize: 12, fontFamily: "'Space Mono', monospace" }}>Create Account →</Link>
          <span style={{ color: "rgba(255,255,255,0.15)" }}>•</span>
          <Link href="/" style={{ color: "rgba(255,255,255,0.45)", textDecoration: "none", fontSize: 12, fontFamily: "'Space Mono', monospace" }}>Home</Link>
        </div>
      </div>
    </div>
  );
}

// ─── Helper Component ─────────────────────────────────────────────────────────

function PSection({ id, title, children }: { id?: string; title: string; children: React.ReactNode }) {
  return (
    <div
      id={id}
      style={{
        background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 12, padding: "28px", marginBottom: 24,
        scrollMarginTop: 90,
      }}
    >
      <h2 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 600, color: "#fff" }}>{title}</h2>
      <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.8 }}>{children}</div>
    </div>
  );
}
