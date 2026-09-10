"use client";

import { Navbar } from "@/components/home/Navbar";
import { Footer } from "@/components/home/Footer";
import {
  Users, Zap, Shield, CheckCircle2, CreditCard, MapPin,
  Building, Target, Globe2, Rocket, ArrowRight,
  Lightbulb, Code2, Users2, LineChart, Star, Package, ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState } from "react";

/* ─── data ─────────────────────────────────────────────── */
const stats = [
  { label: "Verified Students", sub: "100% Closed Campus", value: "100%", Icon: ShieldCheck },
  { label: "Successful Deliveries", sub: "Handled Seamlessly", value: "500+", Icon: Package },
  { label: "Partner Universities", sub: "And Expanding Fast", value: "10+", Icon: Building },
  { label: "Campus Community", sub: "Stronger Together", value: "24/7", Icon: Users2 },
];

const milestones = [
  { Icon: Lightbulb, phase: "Phase 1", title: "The Inception", desc: "UniVerse concept born inside a college dorm to solve real student challenges." },
  { Icon: Code2, phase: "Phase 2", title: "First Prototype", desc: "Built the first web based system with a small group of highly engaged users." },
  { Icon: Users2, phase: "Phase 3", title: "Private Beta", desc: "Onboarded the first 50+ active users. Processed 100+ successful deliveries." },
  { Icon: Rocket, phase: "Phase 4", title: "Campus Launch", desc: "Official roll out across the primary university campus with incredible support." },
  { Icon: LineChart, phase: "Phase 5", title: "Hyper Growth", desc: "Expanding to multiple universities, optimizing features and student life." },
];

const features = [
  { Icon: Users, title: "Community First", desc: "Build a community and help your peers on campus. For students, by students." },
  { Icon: Zap, title: "Lightning Fast", desc: "Get what you need in minutes by leveraging the convenience of campus buddies." },
  { Icon: CreditCard, title: "Secure Payments", desc: "100% cashless, secure, protected transactions. Your money is always safe." },
  { Icon: MapPin, title: "Live Tracking", desc: "Watch your delivery partner in real-time on the map with step-by-step updates." },
  { Icon: Shield, title: "Verified Students", desc: "Exclusive access. Only active students with valid and verified email addresses can join." },
  { Icon: Building, title: "Campus Only", desc: "Hyper-focused on your specific university grounds for maximum efficiency." },
];

/* ─── hover card ─────────────────────────────────────────── */
function HoverCard({ children, style = {}, className = "" }: { children: React.ReactNode; style?: React.CSSProperties; className?: string }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className={className}
      style={{
        transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
        transform: hovered ? "translateY(-3px)" : "translateY(0)",
        borderColor: hovered ? "#bbf7d0" : undefined,
        boxShadow: hovered ? "0 8px 24px rgba(16,185,129,0.08)" : undefined,
        ...style,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
    </div>
  );
}

/* ─── page ───────────────────────────────────────────────── */
export default function AboutPage() {
  const [missionHovered, setMissionHovered] = useState(false);
  const [visionHovered, setVisionHovered] = useState(false);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", fontFamily: "Inter, system-ui, sans-serif", background: "#f8fff9", overflow: "hidden" }}>

      {/* BACKGROUND BLOBS */}
      <div aria-hidden style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
        <div style={{ position: "absolute", top: -200, left: -200, width: 800, height: 800, borderRadius: "50%", background: "radial-gradient(circle, rgba(110,231,183,0.3) 0%, transparent 70%)", filter: "blur(60px)" }} />
        <div style={{ position: "absolute", top: "40%", right: -150, width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(167,243,208,0.2) 0%, transparent 70%)", filter: "blur(60px)" }} />
        <div style={{ position: "absolute", bottom: "10%", left: "30%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(52,211,153,0.1) 0%, transparent 70%)", filter: "blur(60px)" }} />
      </div>

      <Navbar />

      {/* ══════════════════════════════ HERO ══════════════════════════════ */}
      <section style={{ position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "112px 32px 56px", display: "flex", alignItems: "center", gap: 48 }} className="about-hero-container">

          {/* Left */}
          <div style={{ flex: 1 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#fff", border: "1px solid #d1fae5", borderRadius: 999, padding: "6px 14px", fontSize: 12, fontWeight: 700, color: "#059669", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", marginBottom: 24 }}>
              <Rocket style={{ width: 13, height: 13 }} />
              Redefining Campus Logistics
            </div>

            <h1 style={{ fontSize: "clamp(2.6rem,5.5vw,4.2rem)", fontWeight: 900, lineHeight: 1.07, letterSpacing: "-0.03em", color: "#0f172a", marginBottom: 20 }}>
              The Student Economy,<br />
              <span style={{ color: "#10b981" }}>Fully Realized.</span>
            </h1>

            <p style={{ fontSize: 16, color: "#475569", lineHeight: 1.8, fontWeight: 500, maxWidth: 440, marginBottom: 32 }}>
              UniVerse is the definitive platform connecting students who need time with those who want to earn. Built exclusively for the modern campus ecosystem.
            </p>

            {/* Hero Action CTA Buttons */}
            <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
              <Link href="/register">
                <Button style={{
                  background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                  borderRadius: 999,
                  height: 48,
                  paddingLeft: 26,
                  paddingRight: 26,
                  fontSize: 14,
                  fontWeight: 700,
                  color: "#fff",
                  border: "none",
                  boxShadow: "0 4px 20px rgba(16,185,129,0.35)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  transition: "transform 0.2s ease, box-shadow 0.2s ease"
                }}>
                  <span>Get Started</span>
                  <ArrowRight style={{ width: 16, height: 16 }} />
                </Button>
              </Link>
              <Link href="/#how-it-works">
                <Button variant="ghost" style={{
                  background: "#fff",
                  borderRadius: 999,
                  height: 48,
                  paddingLeft: 22,
                  paddingRight: 22,
                  fontSize: 14,
                  fontWeight: 700,
                  color: "#0f172a",
                  border: "1px solid #d1fae5",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  transition: "all 0.2s ease"
                }}>
                  <span>How It Works</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Right — CSS Phone Mockup with smooth floating badges */}
          <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", minHeight: 440, position: "relative" }} className="hidden lg:flex">
            {/* Glow behind phone */}
            <div style={{ position: "absolute", width: 360, height: 360, borderRadius: "50%", background: "radial-gradient(circle, rgba(110,231,183,0.35) 0%, transparent 70%)", filter: "blur(40px)" }} />

            {/* Phone body */}
            <div style={{
              position: "relative", zIndex: 2,
              width: 220, height: 420, borderRadius: 36,
              background: "linear-gradient(160deg, #1e293b 0%, #0f172a 100%)",
              boxShadow: "0 30px 80px rgba(0,0,0,0.35), 0 0 0 2px rgba(255,255,255,0.08), inset 0 1px 0 rgba(255,255,255,0.1)",
              padding: 12, display: "flex", flexDirection: "column",
            }}>
              {/* Notch */}
              <div style={{ width: 70, height: 22, background: "#0f172a", borderRadius: 999, margin: "0 auto 8px", border: "2px solid #1e293b" }} />
              {/* Screen */}
              <div style={{ flex: 1, borderRadius: 24, background: "linear-gradient(160deg, #f0fdf4 0%, #ecfdf5 100%)", overflow: "hidden", padding: 14 }}>
                {/* App header with live status */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                  <div style={{ fontSize: 9, fontWeight: 800, color: "#065f46" }}>Deliver Anything,<br /><span style={{ color: "#10b981" }}>Earn Instantly.</span></div>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 3, background: "#d1fae5", padding: "2px 6px", borderRadius: 999, fontSize: 7, fontWeight: 700, color: "#065f46" }}>
                    <span className="live-pulse-dot" style={{ width: 5, height: 5, borderRadius: "50%", background: "#10b981", display: "inline-block" }} />
                    Active
                  </div>
                </div>

                {/* Mock button */}
                <div style={{ background: "#10b981", borderRadius: 8, padding: "5px 10px", fontSize: 8, fontWeight: 700, color: "#fff", display: "inline-block", marginBottom: 12 }}>New Delivery</div>
                {/* Mock list items */}
                {[{ label: "Ramen Noodles", dist: "200m" }, { label: "Textbooks", dist: "400m" }, { label: "Coffee Run", dist: "150m" }].map((item, i) => (
                  <div key={i} style={{ background: "#fff", borderRadius: 8, padding: "5px 8px", marginBottom: 5, display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                    <span style={{ fontSize: 8, fontWeight: 600, color: "#0f172a" }}>{item.label}</span>
                    <span style={{ fontSize: 7, color: "#10b981", fontWeight: 700 }}>{item.dist}</span>
                  </div>
                ))}
                {/* Map preview */}
                <div style={{ background: "linear-gradient(135deg,#d1fae5,#a7f3d0)", borderRadius: 10, height: 60, marginTop: 8, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                  <div style={{ position: "absolute", width: 28, height: 28, borderRadius: "50%", background: "rgba(16,185,129,0.2)", animation: "ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite" }} />
                  <MapPin style={{ width: 18, height: 18, color: "#059669", position: "relative", zIndex: 1 }} />
                </div>
              </div>
            </div>

            {/* Floating badge — New Delivery Request with smooth float animation */}
            <div className="float-badge-1" style={{ position: "absolute", top: 60, right: 20, background: "#fff", borderRadius: 12, padding: "8px 12px", boxShadow: "0 8px 24px rgba(0,0,0,0.1)", zIndex: 3, fontSize: 11, fontWeight: 700, color: "#0f172a", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: 6 }}>
              <span>📦</span>
              <span>New Delivery Request</span>
            </div>

            {/* Floating badge — New Message with smooth float animation */}
            <div className="float-badge-2" style={{ position: "absolute", bottom: 80, right: 10, background: "#fff", borderRadius: 12, padding: "8px 12px", boxShadow: "0 8px 24px rgba(0,0,0,0.1)", zIndex: 3, fontSize: 11, fontWeight: 700, color: "#0f172a", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: 6 }}>
              <span>💬</span>
              <span>New Message</span>
            </div>

            {/* Floating icon — package */}
            <div className="float-badge-3" style={{ position: "absolute", bottom: 40, left: 30, width: 56, height: 56, borderRadius: "50%", background: "#10b981", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 24px rgba(16,185,129,0.4)", zIndex: 3 }}>
              <Package style={{ width: 26, height: 26, color: "#fff" }} />
            </div>

            {/* Star */}
            <div className="float-badge-4" style={{ position: "absolute", top: 40, left: 50, width: 40, height: 40, borderRadius: "50%", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 16px rgba(0,0,0,0.08)", zIndex: 3 }}>
              <Star style={{ width: 20, height: 20, color: "#f59e0b" }} />
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════ STATS ══════════════════════════════ */}
      <section style={{ position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 32px 72px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }} className="about-stats-grid">
            {stats.map(({ label, sub, value, Icon }, i) => (
              <HoverCard key={i} style={{
                background: "#fff", borderRadius: 20, border: "1px solid #f1f5f9",
                boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                padding: "20px 22px", display: "flex", alignItems: "center", gap: 16,
              }}>
                <div style={{ width: 52, height: 52, borderRadius: "50%", background: "#f0fdf4", border: "1px solid #bbf7d0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon style={{ width: 22, height: 22, color: "#10b981" }} />
                </div>
                <div>
                  <div style={{ fontSize: 26, fontWeight: 900, color: "#0f172a", lineHeight: 1 }}>{value}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", marginTop: 4 }}>{label}</div>
                  <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 500, marginTop: 2 }}>{sub}</div>
                </div>
              </HoverCard>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════ MISSION & VISION ══════════════════════════════ */}
      <section style={{ position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 32px 80px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }} className="about-mv-grid">
            {/* Mission */}
            <div
              onMouseEnter={() => setMissionHovered(true)}
              onMouseLeave={() => setMissionHovered(false)}
              style={{
                background: "#fff", borderRadius: 22, border: `1px solid ${missionHovered ? "#bbf7d0" : "#f1f5f9"}`,
                boxShadow: missionHovered ? "0 8px 24px rgba(16,185,129,0.08)" : "0 2px 12px rgba(0,0,0,0.04)",
                padding: 32, display: "flex", alignItems: "flex-start", gap: 20, position: "relative",
                transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
                transform: missionHovered ? "translateY(-3px)" : "translateY(0)"
              }}
            >
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#f0fdf4", border: "1px solid #bbf7d0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Target style={{ width: 26, height: 26, color: "#10b981" }} />
              </div>
              <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", marginBottom: 4 }}>Our Mission</h2>
                <div style={{ width: 36, height: 3, background: "#10b981", borderRadius: 3, marginBottom: 12 }} />
                <p style={{ fontSize: 13, color: "#64748b", lineHeight: 1.8, fontWeight: 500 }}>
                  To build a trusted student-to-student economy that promotes convenience, creates opportunities, and strengthens campus communities.
                </p>
              </div>
              <div style={{
                position: "absolute", bottom: 20, right: 20, width: 36, height: 36, borderRadius: "50%",
                background: "#f0fdf4", border: "1px solid #bbf7d0", display: "flex", alignItems: "center", justifyContent: "center",
                transform: missionHovered ? "translateX(3px)" : "translateX(0)",
                transition: "transform 0.2s ease"
              }}>
                <ArrowRight style={{ width: 16, height: 16, color: "#10b981" }} />
              </div>
            </div>

            {/* Vision */}
            <div
              onMouseEnter={() => setVisionHovered(true)}
              onMouseLeave={() => setVisionHovered(false)}
              style={{
                background: "#fff", borderRadius: 22, border: `1px solid ${visionHovered ? "#bfdbfe" : "#f1f5f9"}`,
                boxShadow: visionHovered ? "0 8px 24px rgba(59,130,246,0.08)" : "0 2px 12px rgba(0,0,0,0.04)",
                padding: 32, display: "flex", alignItems: "flex-start", gap: 20, position: "relative",
                transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
                transform: visionHovered ? "translateY(-3px)" : "translateY(0)"
              }}
            >
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#eff6ff", border: "1px solid #bfdbfe", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Globe2 style={{ width: 26, height: 26, color: "#3b82f6" }} />
              </div>
              <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", marginBottom: 4 }}>Our Vision</h2>
                <div style={{ width: 36, height: 3, background: "#3b82f6", borderRadius: 3, marginBottom: 12 }} />
                <p style={{ fontSize: 13, color: "#64748b", lineHeight: 1.8, fontWeight: 500 }}>
                  A future where every university campus is a fully connected ecosystem. We envision UniVerse as the operating system for campus logistics, where every thing a student needs is just a request away.
                </p>
              </div>
              <div style={{
                position: "absolute", bottom: 20, right: 20, width: 36, height: 36, borderRadius: "50%",
                background: "#eff6ff", border: "1px solid #bfdbfe", display: "flex", alignItems: "center", justifyContent: "center",
                transform: visionHovered ? "translateX(3px)" : "translateX(0)",
                transition: "transform 0.2s ease"
              }}>
                <ArrowRight style={{ width: 16, height: 16, color: "#3b82f6" }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════ TIMELINE ══════════════════════════════ */}
      <section style={{ position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 32px 88px" }}>
          {/* Heading */}
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <h2 style={{ fontSize: 30, fontWeight: 800, color: "#0f172a", marginBottom: 8 }}>The Journey So Far</h2>
            <p style={{ fontSize: 13, color: "#94a3b8", fontWeight: 500 }}>From a simple dorm room idea to a rapidly expanding campus network.</p>
          </div>

          {/* Desktop Timeline */}
          <div className="about-timeline-desktop">
            {/* Nodes row */}
            <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 5%", marginBottom: 0 }}>
              {/* Connecting line */}
              <div style={{ position: "absolute", top: "50%", left: "5%", right: "5%", height: 4, background: "linear-gradient(90deg,#10b981,#34d399,#10b981)", borderRadius: 4, transform: "translateY(-50%)", boxShadow: "0 0 16px rgba(16,185,129,0.5)" }} />
              {milestones.map((_, i) => (
                <div key={i} style={{ position: "relative", zIndex: 1, width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#10b981,#059669)", color: "#fff", fontWeight: 900, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", border: "4px solid #fff", boxShadow: "0 0 0 2px #10b981, 0 4px 16px rgba(16,185,129,0.5)" }}>
                  {i + 1}
                </div>
              ))}
            </div>

            {/* Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}>
              {milestones.map(({ Icon, phase, title, desc }, i) => (
                <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  {/* Triangle pointer */}
                  <div style={{ width: 0, height: 0, borderLeft: "10px solid transparent", borderRight: "10px solid transparent", borderBottom: "10px solid #fff", filter: "drop-shadow(0 -2px 2px rgba(0,0,0,0.04))", marginBottom: -1, zIndex: 1 }} />
                  <HoverCard style={{ background: "#fff", borderRadius: 18, border: "1px solid #f1f5f9", boxShadow: "0 2px 12px rgba(0,0,0,0.05)", padding: "18px 14px", width: "100%", textAlign: "center" }}>
                    <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#f0fdf4", border: "1px solid #bbf7d0", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px" }}>
                      <Icon style={{ width: 20, height: 20, color: "#10b981" }} />
                    </div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "#10b981", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>{phase}</div>
                    <h4 style={{ fontSize: 13, fontWeight: 800, color: "#0f172a", marginBottom: 6 }}>{title}</h4>
                    <p style={{ fontSize: 11, color: "#64748b", fontWeight: 500, lineHeight: 1.65 }}>{desc}</p>
                  </HoverCard>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile Timeline (Clean Vertical Stepper for small screens) */}
          <div className="about-timeline-mobile" style={{ display: "none" }}>
            <div style={{ position: "relative", paddingLeft: 32 }}>
              {/* Vertical line */}
              <div style={{ position: "absolute", top: 12, bottom: 12, left: 15, width: 3, background: "linear-gradient(180deg,#10b981,#34d399,#10b981)", borderRadius: 3 }} />
              {milestones.map(({ Icon, phase, title, desc }, i) => (
                <div key={i} style={{ position: "relative", marginBottom: 20 }}>
                  {/* Circle node */}
                  <div style={{ position: "absolute", left: -32, top: 4, width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#10b981,#059669)", color: "#fff", fontWeight: 900, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", border: "3px solid #fff", boxShadow: "0 0 0 2px #10b981" }}>
                    {i + 1}
                  </div>
                  {/* Card */}
                  <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #f1f5f9", boxShadow: "0 2px 10px rgba(0,0,0,0.04)", padding: "16px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                      <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#f0fdf4", border: "1px solid #bbf7d0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Icon style={{ width: 16, height: 16, color: "#10b981" }} />
                      </div>
                      <div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: "#10b981", textTransform: "uppercase" }}>{phase}</div>
                        <h4 style={{ fontSize: 14, fontWeight: 800, color: "#0f172a" }}>{title}</h4>
                      </div>
                    </div>
                    <p style={{ fontSize: 12, color: "#64748b", fontWeight: 500, lineHeight: 1.6 }}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════ WHY UNIVERSE ══════════════════════════════ */}
      <section style={{ position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 32px 88px" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <h2 style={{ fontSize: 30, fontWeight: 800, color: "#0f172a", marginBottom: 8 }}>Why UniVerse?</h2>
            <p style={{ fontSize: 13, color: "#94a3b8", fontWeight: 500 }}>Built with the unique needs of college students in mind.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }} className="about-features-grid">
            {features.map(({ Icon, title, desc }, i) => (
              <HoverCard key={i} style={{ background: "#fff", borderRadius: 18, border: "1px solid #f1f5f9", boxShadow: "0 2px 12px rgba(0,0,0,0.04)", padding: "20px 18px", display: "flex", alignItems: "flex-start", gap: 14, position: "relative" }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: "#f0fdf4", border: "1px solid #bbf7d0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon style={{ width: 20, height: 20, color: "#10b981" }} />
                </div>
                <div style={{ flex: 1, paddingBottom: 16 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 800, color: "#0f172a", marginBottom: 6 }}>{title}</h3>
                  <p style={{ fontSize: 12, color: "#64748b", fontWeight: 500, lineHeight: 1.65 }}>{desc}</p>
                </div>
                <div style={{ position: "absolute", bottom: 14, right: 14 }}>
                  <ArrowRight style={{ width: 14, height: 14, color: "#10b981" }} />
                </div>
              </HoverCard>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════ TRUST ══════════════════════════════ */}
      <section style={{ position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 32px 56px" }}>
          <div style={{ position: "relative", background: "linear-gradient(135deg,#022c22 0%,#064e3b 45%,#022c22 100%)", borderRadius: 28, overflow: "hidden", padding: "56px 52px" }} className="about-trust-container">
            {/* Radial glow */}
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "radial-gradient(ellipse at 15% 50%, rgba(16,185,129,0.25) 0%, transparent 55%)", pointerEvents: "none" }} />
            <div style={{ position: "absolute", top: 0, right: 0, width: "50%", bottom: 0, background: "radial-gradient(ellipse at 85% 50%, rgba(52,211,153,0.15) 0%, transparent 60%)", pointerEvents: "none" }} />

            <div style={{ display: "flex", alignItems: "center", gap: 48, position: "relative", zIndex: 1 }}>
              {/* Left */}
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
                  <div style={{ width: 52, height: 52, borderRadius: 14, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Shield style={{ width: 26, height: 26, color: "#34d399" }} />
                  </div>
                  <h2 style={{ fontSize: 26, fontWeight: 800, color: "#fff", lineHeight: 1.2 }}>The Trust We Build</h2>
                </div>
                <p style={{ fontSize: 14, color: "rgba(236,253,245,0.85)", lineHeight: 1.85, fontWeight: 500, marginBottom: 28, maxWidth: 460 }}>
                  By restricting our platform exclusively to verified university students, we&apos;ve created a uniquely safe, high-trust environment where peers feel comfortable delivering to peers.
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#fff", borderRadius: 999, padding: "9px 18px", fontSize: 12, fontWeight: 700, color: "#0f172a", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
                    <CheckCircle2 style={{ width: 15, height: 15, color: "#10b981" }} />
                    Code Enforced Trust
                  </span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#fff", borderRadius: 999, padding: "9px 18px", fontSize: 12, fontWeight: 700, color: "#0f172a", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
                    <CheckCircle2 style={{ width: 15, height: 15, color: "#10b981" }} />
                    ID Verification
                  </span>
                </div>
              </div>

              {/* Right — 3D shield graphic */}
              <div className="hidden lg:flex" style={{ flexShrink: 0, width: 220, height: 220, position: "relative", alignItems: "center", justifyContent: "center" }}>
                {/* glow rings with gentle pulse */}
                <div className="shield-glow-pulse" style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "radial-gradient(circle, rgba(52,211,153,0.3) 0%, transparent 65%)", filter: "blur(16px)" }} />
                <div style={{ position: "absolute", inset: 16, borderRadius: "50%", border: "1px solid rgba(52,211,153,0.25)" }} />
                <div style={{ position: "absolute", inset: 32, borderRadius: "50%", border: "1px solid rgba(52,211,153,0.15)" }} />
                {/* Shield */}
                <div style={{ position: "relative", zIndex: 2, width: 120, height: 120, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Shield style={{ width: 100, height: 100, color: "#34d399", filter: "drop-shadow(0 0 24px rgba(52,211,153,0.7))", strokeWidth: 1.2 }} />
                  {/* checkmark overlay */}
                  <CheckCircle2 style={{ position: "absolute", width: 40, height: 40, color: "#fff", filter: "drop-shadow(0 0 8px rgba(255,255,255,0.5))" }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════ CTA ══════════════════════════════ */}
      <section style={{ position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 32px 96px" }}>
          <div style={{ position: "relative", background: "linear-gradient(135deg,#ecfdf5 0%,#f0fdf4 50%,#ecfdf5 100%)", borderRadius: 28, overflow: "hidden", padding: "64px 52px", textAlign: "center" }}>
            {/* Subtle dots */}
            <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle, rgba(16,185,129,0.08) 1px, transparent 1px)", backgroundSize: "28px 28px", pointerEvents: "none" }} />
            {/* Star icons floating */}
            <div style={{ position: "absolute", top: 24, right: 80, color: "#34d399", opacity: 0.6 }}><Star style={{ width: 18, height: 18 }} /></div>
            <div style={{ position: "absolute", top: 60, right: 40, color: "#10b981", opacity: 0.4 }}><Star style={{ width: 10, height: 10 }} /></div>
            <div style={{ position: "absolute", bottom: 40, left: 60, color: "#34d399", opacity: 0.5 }}><Star style={{ width: 14, height: 14 }} /></div>

            <div style={{ position: "relative", zIndex: 1 }}>
              <h2 style={{ fontSize: 34, fontWeight: 900, color: "#0f172a", marginBottom: 10 }}>Ready to Start?</h2>
              <p style={{ fontSize: 14, color: "#475569", fontWeight: 500, marginBottom: 36, lineHeight: 1.7 }}>
                Join the thousands of students already building a smarter campus economy.
              </p>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, flexWrap: "wrap" }}>
                <Link href="/register">
                  <Button style={{ background: "#10b981", borderRadius: 999, height: 48, paddingLeft: 28, paddingRight: 28, fontSize: 13, fontWeight: 700, color: "#fff", border: "none", boxShadow: "0 4px 20px rgba(16,185,129,0.35)", display: "flex", alignItems: "center", gap: 8 }}>
                    Create Account <ArrowRight style={{ width: 15, height: 15 }} />
                  </Button>
                </Link>
                <Link href="/#how-it-works">
                  <Button variant="ghost" style={{ background: "#fff", borderRadius: 999, height: 48, paddingLeft: 28, paddingRight: 28, fontSize: 13, fontWeight: 700, color: "#0f172a", border: "1px solid #d1fae5", display: "flex", alignItems: "center", gap: 8, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
                    Learn More <ArrowRight style={{ width: 15, height: 15 }} />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CSS Animations & responsive style overrides ───────────────────────── */}
      <style>{`
        @keyframes float-badge {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-7px); }
        }
        @keyframes shield-pulse {
          0%, 100% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.08); opacity: 0.5; }
        }
        @keyframes ping-slow {
          0% { transform: scale(0.9); opacity: 0.8; }
          80%, 100% { transform: scale(2.2); opacity: 0; }
        }

        .float-badge-1 {
          animation: float-badge 4s ease-in-out infinite;
        }
        .float-badge-2 {
          animation: float-badge 5s ease-in-out infinite 1.2s;
        }
        .float-badge-3 {
          animation: float-badge 4.5s ease-in-out infinite 0.6s;
        }
        .float-badge-4 {
          animation: float-badge 6s ease-in-out infinite 2s;
        }
        .shield-glow-pulse {
          animation: shield-pulse 4s ease-in-out infinite;
        }

        @media (max-width: 900px) {
          .about-hero-container { padding: 90px 24px 40px !important; flex-direction: column !important; }
          .about-stats-grid   { grid-template-columns: repeat(2, 1fr) !important; }
          .about-mv-grid      { grid-template-columns: 1fr !important; }
          .about-features-grid{ grid-template-columns: 1fr 1fr !important; }
          .about-timeline-desktop { display: none !important; }
          .about-timeline-mobile  { display: block !important; }
          .about-trust-container { padding: 40px 28px !important; }
        }
        @media (max-width: 640px) {
          .about-hero-container { padding: 80px 20px 32px !important; }
          .about-stats-grid   { grid-template-columns: 1fr !important; }
          .about-features-grid{ grid-template-columns: 1fr !important; }
        }
      `}</style>

      <Footer />
    </div>
  );
}
