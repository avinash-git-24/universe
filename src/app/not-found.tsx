"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Menu, X, Zap, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

// Sleek Social Media SVG Icons
const SvgIcon = ({ path, viewBox = "0 0 24 24", className }: { path: string; viewBox?: string; className?: string }) => (
  <svg className={className || "w-4 h-4"} viewBox={viewBox} fill="currentColor">
    <path d={path} />
  </svg>
);

const Facebook = (props: { className?: string }) => (
  <SvgIcon {...props} path="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3V2z" />
);

const Twitter = (props: { className?: string }) => (
  <SvgIcon {...props} path="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
);

const Dribbble = (props: { className?: string }) => (
  <SvgIcon {...props} path="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm6.5 5.5c.5.8.9 1.7 1 2.6-1.4-.2-2.8-.3-4.3-.3-.4-.9-.9-1.8-1.4-2.6 1.7-.4 3.3-.2 4.7.3zm-7-1.4c.6.7 1.1 1.5 1.6 2.3-1.4.2-2.8.4-4.1.7-.1-.6-.1-1.2 0-1.8 1.5.2 3 .3 4.5-.2z" />
);

const Youtube = (props: { className?: string }) => (
  <SvgIcon {...props} path="M23.5 6.2c-.3-1-1-1.7-2-2C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.5.7c-1 .3-1.7 1-2 2C0 7.7 0 12 0 12s0 4.3.5 5.8c.3 1 1 1.7 2 2 2 .7 9.5.7 9.5.7s7.5 0 9.5-.7c1-.3 1.7-1 2-2 .5-1.5.5-5.8.5-5.8s0-4.3-.5-5.8zM9.5 15.5V8.5l6.5 3.5-6.5 3.5z" />
);

const Linkedin = (props: { className?: string }) => (
  <SvgIcon {...props} path="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2zM4 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
);

const Instagram = (props: { className?: string }) => (
  <SvgIcon {...props} path="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.4 5.6 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.6 18.4 4 16.4 4H7.6zm9.65 1.5a1.25 1.25 0 0 1 0 2.5 1.25 1.25 0 0 1 0-2.5zM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" />
);

const socialIcons = [
  { Component: Instagram, href: "https://instagram.com" },
  { Component: Twitter, href: "https://twitter.com" },
  { Component: Linkedin, href: "https://linkedin.com" },
  { Component: Youtube, href: "https://youtube.com" },
  { Component: Facebook, href: "https://facebook.com" },
  { Component: Dribbble, href: "https://dribbble.com" },
];

// UniVerse Navigation Links
const navLinks = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Deliveries", href: "/dashboard/requests" },
  { label: "Marketplace", href: "/dashboard/marketplace" },
  { label: "Runner Mode", href: "/dashboard/runner" },
  { label: "Wallet", href: "/dashboard/wallet" },
  { label: "About", href: "/about" },
];

// UniVerse Platform Footer Columns
const footerCols = [
  {
    title: "DELIVERIES",
    links: [
      { label: "Request Snacks", href: "/request/new" },
      { label: "Campus Orders", href: "/dashboard/requests" },
      { label: "Runner Mode", href: "/dashboard/runner" },
      { label: "Active Deliveries", href: "/dashboard/runner/active" },
      { label: "Vending Stations", href: "/dashboard" },
    ],
  },
  {
    title: "MARKETPLACE",
    links: [
      { label: "Browse Listings", href: "/dashboard/marketplace" },
      { label: "Sell Your Item", href: "/dashboard/marketplace/sell" },
      { label: "My Listings", href: "/dashboard/marketplace/my-listings" },
      { label: "Saved Items", href: "/dashboard/marketplace/saved" },
      { label: "Hostel Essentials", href: "/dashboard/marketplace" },
    ],
  },
  {
    title: "STUDENT HUB",
    links: [
      { label: "How It Works", href: "/about" },
      { label: "Runner Earnings", href: "/dashboard/wallet" },
      { label: "Student Verification", href: "/dashboard/profile" },
      { label: "Campus Guidelines", href: "/about" },
      { label: "Help & Support", href: "/about" },
    ],
  },
  {
    title: "UNIVERSE",
    links: [
      { label: "About UniVerse", href: "/about" },
      { label: "Campus Network", href: "/about" },
      { label: "Community Trust", href: "/about" },
      { label: "Privacy Policy", href: "/about" },
      { label: "Terms of Service", href: "/about" },
    ],
  },
];

export default function NotFound() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [emailInput, setEmailInput] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    document.title = "404 - UniVerse";

    // Check if student is already logged in
    try {
      const supabase = createClient();
      supabase.auth.getSession().then(({ data }) => {
        setIsLoggedIn(!!data.session);
      });
    } catch {
      setIsLoggedIn(false);
    }
  }, []);

  const toggleMenu = () => {
    if (!mobileMenuOpen) {
      setMobileMenuOpen(true);
      setTimeout(() => setMenuVisible(true), 50);
    } else {
      setMenuVisible(false);
      setTimeout(() => setMobileMenuOpen(false), 500);
    }
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailInput.trim()) {
      setSubscribed(true);
      setTimeout(() => {
        setEmailInput("");
        setSubscribed(false);
      }, 4000);
    }
  };

  return (
    <div
      style={{
        fontFamily:
          '"Helvetica Now Var", var(--font-plus-jakarta-sans), var(--font-inter), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
      className="relative h-screen h-[100dvh] w-full flex flex-col justify-between bg-black text-white selection:bg-emerald-500 selection:text-black overflow-hidden select-none"
    >
      {/* ── Custom CSS for exact Reel 404 Glow & Liquid Glass button ── */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
          .four-oh-four {
            text-shadow: 0 20px 60px rgba(0, 0, 0, 0.95), 0 0 90px rgba(255, 255, 255, 0.3);
          }
          .liquid-glass {
            background: rgba(255, 255, 255, 0.08);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border: 1px solid rgba(255, 255, 255, 0.25);
            box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.4), inset 0 0 12px 0 rgba(255, 255, 255, 0.12);
            transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          }
          .liquid-glass:hover {
            background: rgba(255, 255, 255, 0.16);
            border-color: rgba(52, 211, 153, 0.6);
            box-shadow: 0 10px 40px 0 rgba(16, 185, 129, 0.35), inset 0 0 16px 0 rgba(255, 255, 255, 0.25);
            transform: translateY(-2px);
          }
        `,
        }}
      />

      {/* ── Background Looping Earth Video from Reel (Local + CDN Fallback) ── */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover pointer-events-none z-0"
      >
        <source src="/videos/earth-404.mp4" type="video/mp4" />
        <source
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260613_180732_a54afbf6-b30d-470e-861f-669871f09f67.mp4"
          type="video/mp4"
        />
      </video>

      {/* ── Main Foreground Content (Fits 100vh Single-Screen Without Scrolling) ── */}
      <div className="relative z-10 flex flex-col h-full justify-between overflow-hidden">
        
        {/* ── Top Navigation Bar (UniVerse Branded with Reel Styling) ── */}
        <nav className="flex items-center justify-between px-6 md:px-12 lg:px-16 py-3 sm:py-4 flex-shrink-0">
          <Link href="/" className="flex items-center gap-2.5 group" aria-label="UniVerse — Home">
            {/* UniVerse Electric Emerald Badge */}
            <div
              className="w-8 h-8 rounded-[9px] flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-105 shadow-[0_0_15px_rgba(16,185,129,0.4)]"
              style={{ background: "linear-gradient(135deg, #10B981 0%, #059669 100%)" }}
            >
              <Zap size={17} className="text-white fill-white" />
            </div>

            {/* UniVerse Wordmark */}
            <span className="text-white text-lg sm:text-xl font-black tracking-tight">
              Uni<span className="text-emerald-400">Verse</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-7">
            {navLinks.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                className="text-white/80 hover:text-white text-xs sm:text-sm tracking-wide transition-colors duration-200"
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* Desktop Auth-Aware Action Button */}
          <div className="hidden lg:flex">
            <Link
              href={isLoggedIn ? "/dashboard" : "/login"}
              className="bg-gradient-to-r from-emerald-400 to-cyan-500 text-white text-xs sm:text-sm font-bold tracking-wider px-5 py-2 sm:px-6 sm:py-2 rounded-full flex items-center gap-2 hover:brightness-110 active:scale-95 transition-all shadow-[0_0_20px_rgba(52,211,153,0.35)]"
            >
              {isLoggedIn ? "DASHBOARD" : "LOG IN"} <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </Link>
          </div>

          {/* Mobile Hamburger Toggle Button */}
          <button
            type="button"
            onClick={toggleMenu}
            aria-label="Toggle menu"
            className="lg:hidden z-[60] relative w-6 h-6"
          >
            <Menu
              className={`absolute inset-0 w-6 h-6 text-white transition-all duration-300 ${
                mobileMenuOpen ? "opacity-0 rotate-90 scale-75" : "opacity-100 rotate-0 scale-100"
              }`}
            />
            <X
              className={`absolute inset-0 w-6 h-6 text-white transition-all duration-300 ${
                mobileMenuOpen ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-75"
              }`}
            />
          </button>
        </nav>

        {/* ── Mobile Menu Sliding Drawer ── */}
        {mobileMenuOpen && (
          <div className="lg:hidden">
            <div
              className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-md transition-opacity duration-400 ${
                menuVisible ? "opacity-100" : "opacity-0"
              }`}
              onClick={toggleMenu}
            />
            <div
              className={`absolute left-0 right-0 top-[60px] z-50 transition-opacity duration-400 ${
                menuVisible ? "opacity-100" : "opacity-0"
              }`}
            >
              <div className="absolute inset-0 backdrop-blur-2xl rounded-b-2xl bg-black/75 border-b border-white/10" />
              <div className="relative z-10 flex flex-col items-center gap-3.5 py-6">
                {navLinks.map((l, i) => (
                  <Link
                    key={l.label}
                    href={l.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-base font-light tracking-[0.08em] text-white/80 hover:text-white transition-all duration-300 ease-out"
                    style={{
                      transitionDelay: menuVisible ? `${250 + i * 40}ms` : "0ms",
                      opacity: menuVisible ? 1 : 0,
                      transform: menuVisible ? "translateY(0)" : "translateY(10px)",
                    }}
                  >
                    {l.label}
                  </Link>
                ))}
                <Link
                  href={isLoggedIn ? "/dashboard" : "/login"}
                  onClick={() => setMobileMenuOpen(false)}
                  className="mt-2 bg-gradient-to-r from-emerald-400 to-cyan-500 text-white text-sm font-bold tracking-wider px-6 py-2 rounded-full inline-block shadow-[0_0_15px_rgba(52,211,153,0.4)]"
                >
                  {isLoggedIn ? "DASHBOARD" : "LOG IN"}
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* ── Hero 404 Section (Reel Centered & Sized for 100vh Single Screen) ── */}
        <div className="flex-1 flex flex-col items-center justify-center text-center px-4 my-auto min-h-0">
          <h1 className="text-white/80 text-sm xs:text-base sm:text-xl md:text-2xl lg:text-3xl font-light leading-snug tracking-tight mb-0.5 sm:mb-1">
            This page seems to have
          </h1>
          <h2 className="text-white/80 text-sm xs:text-base sm:text-xl md:text-2xl lg:text-3xl font-light leading-snug tracking-tight mb-2 sm:mb-4">
            slipped beyond our reach :/
          </h2>

          <div className="relative mb-2 sm:mb-5 w-full flex justify-center overflow-visible">
            <span className="four-oh-four text-[75px] xs:text-[95px] sm:text-[130px] md:text-[170px] lg:text-[210px] font-black text-white leading-none tracking-tighter select-none">
              404
            </span>
          </div>

          <Link
            href="/"
            className="liquid-glass text-white text-[9px] xs:text-[10px] sm:text-xs tracking-[0.16em] sm:tracking-[0.2em] font-medium px-5 sm:px-7 py-2.5 sm:py-3 rounded-full uppercase cursor-pointer inline-flex items-center justify-center group"
          >
            Return to Main Page
          </Link>
        </div>

        {/* ── Footer Section (Floating directly on Earth Horizon, Zero Scroll) ── */}
        <footer className="relative z-10 px-4 sm:px-6 md:px-12 lg:px-16 pb-4 sm:pb-6 pt-2 sm:pt-4 flex-shrink-0">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6 lg:gap-4">
            {footerCols.map((col) => (
              <div key={col.title}>
                <h4 className="text-white text-[9px] sm:text-[11px] font-bold tracking-[0.15em] mb-1.5 sm:mb-2">
                  {col.title}
                </h4>
                <div className="space-y-1 sm:space-y-1.5">
                  {col.links.map((l) => (
                    <Link
                      key={l.label}
                      href={l.href}
                      className="block text-white/50 hover:text-white/90 text-[9px] sm:text-[11px] transition-colors duration-200 leading-tight"
                    >
                      {l.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}

            {/* Campus Drop & Exclusive Student Deals */}
            <div className="col-span-2 lg:col-span-2">
              <h4 className="text-white text-[9px] sm:text-[11px] font-bold tracking-[0.15em] mb-1.5 sm:mb-2">
                CAMPUS DROPS & OFFERS
              </h4>

              {subscribed ? (
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold py-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>You&apos;re on the snack drop list! 🚀</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex max-w-sm">
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="Enter student email..."
                    required
                    className="flex-1 bg-white/95 text-black text-[10px] sm:text-xs px-2.5 py-1.5 sm:py-2 rounded-l-md outline-none placeholder:text-gray-500 focus:bg-white transition-colors"
                  />
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-emerald-400 to-cyan-500 text-white text-[10px] sm:text-xs font-bold tracking-wider px-3 sm:px-4 py-1.5 sm:py-2 rounded-r-md hover:brightness-110 active:scale-95 transition-all flex-shrink-0"
                  >
                    SEND IT
                  </button>
                </form>
              )}

              <h4 className="text-white text-[9px] sm:text-[11px] font-bold tracking-[0.15em] mt-3 sm:mt-4 mb-1.5 sm:mb-2">
                CONNECT
              </h4>
              <div className="flex gap-3">
                {socialIcons.map(({ Component, href }, i) => (
                  <a
                    key={i}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white/50 hover:text-emerald-400 transition-colors"
                  >
                    <Component className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
}
