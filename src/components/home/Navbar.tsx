"use client";

/**
 * UniVerse — Apple-Style Floating Glassmorphic Navbar
 *
 * - Floating dark-glass capsule with frosted backdrop blur and top-edge light rim.
 * - Sliding pill micro-interaction for desktop nav links.
 * - Auto-hides on scroll down, reveals smoothly on scroll up.
 * - Real-time Supabase auth tracking for Dashboard & Auth buttons.
 * - Glassmorphic mobile drawer with touch backdrop dismiss.
 */

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Zap, ArrowRight } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { createClient } from "@/lib/supabase/client";
import { LogoutButton } from "@/components/auth/LogoutButton";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "How It Works", href: "/#how-it-works" },
] as const;

// ─── Logo ─────────────────────────────────────────────────────────────────────

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5 group select-none" aria-label="UniVerse — Home">
      {/* Mark */}
      <motion.div
        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-105 shadow-md shadow-emerald-500/25"
        style={{ background: "linear-gradient(135deg, #10B981 0%, #059669 100%)" }}
        whileTap={{ scale: 0.92 }}
      >
        <Zap size={16} className="text-white fill-white" />
      </motion.div>

      {/* Wordmark */}
      <span className="text-lg font-bold tracking-tight text-white transition-colors duration-300 font-[family-name:var(--font-plus-jakarta-sans)]">
        Uni<span className="text-emerald-400">Verse</span>
      </span>
    </Link>
  );
}

// ─── Desktop Nav Links (Apple-Style Sliding Capsule) ──────────────────────────

function NavLinks() {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <nav aria-label="Main navigation" className="hidden md:block">
      <ul
        className="flex items-center gap-1 p-1 rounded-full bg-white/[0.03] border border-white/[0.06] backdrop-blur-md"
        role="list"
        onMouseLeave={() => setHovered(null)}
      >
        {NAV_LINKS.map(({ label, href }) => {
          const isHovered = hovered === label;
          return (
            <li key={label} className="relative">
              <Link
                href={href}
                onMouseEnter={() => setHovered(label)}
                className="relative z-10 block px-4 py-1.5 text-xs font-medium tracking-wide text-white/75 hover:text-white transition-colors duration-200 font-[family-name:var(--font-inter)] select-none"
              >
                {label}
              </Link>
              {isHovered && (
                <motion.div
                  layoutId="navbar-hover-pill"
                  className="absolute inset-0 rounded-full bg-white/[0.1] shadow-[0_0_12px_rgba(255,255,255,0.06)]"
                  transition={{ type: "spring", stiffness: 450, damping: 30 }}
                />
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

// ─── CTA Buttons ──────────────────────────────────────────────────────────────

function NavCTAs({ hasUser }: { hasUser: boolean }) {
  if (hasUser) {
    return (
      <div className="flex items-center gap-1.5 sm:gap-2">
        <Link
          href={ROUTES.DASHBOARD}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 text-black shadow-md shadow-emerald-500/20 hover:shadow-emerald-500/35 hover:scale-105 active:scale-95 transition-all duration-200 select-none"
        >
          <span>Dashboard</span>
          <ArrowRight size={12} strokeWidth={2.5} />
        </Link>
        <LogoutButton
          variant="ghost"
          showIcon={false}
          label="Sign out"
          className="hidden sm:inline-flex px-3 py-1.5 text-xs font-medium h-auto rounded-full bg-white/[0.04] border border-white/10 text-white/70 hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/10 transition-all duration-200"
        />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 sm:gap-2">
      {/* Login — desktop */}
      <Link
        href={ROUTES.LOGIN}
        className="hidden md:inline-flex px-3.5 py-1.5 text-xs font-medium rounded-full text-white/75 hover:text-white hover:bg-white/[0.08] transition-all duration-200 select-none"
      >
        Login
      </Link>

      {/* Mobile: Sign In */}
      <Link
        href={ROUTES.LOGIN}
        className="inline-flex md:hidden items-center gap-1 px-3 py-1.5 text-[11px] font-bold rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 text-black shadow-md shadow-emerald-500/20 active:scale-95 transition-all duration-200 select-none"
      >
        <span>Sign In</span>
        <ArrowRight size={12} strokeWidth={2.5} />
      </Link>

      {/* Desktop: Register */}
      <motion.div className="hidden md:block" whileTap={{ scale: 0.96 }}>
        <Link
          href={ROUTES.REGISTER}
          className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 text-black shadow-md shadow-emerald-500/20 hover:shadow-emerald-500/35 hover:scale-105 active:scale-95 transition-all duration-200 select-none"
        >
          Sign Up
        </Link>
      </motion.div>
    </div>
  );
}

// ─── Mobile Menu ──────────────────────────────────────────────────────────────

function MobileMenu({
  open,
  onClose,
  hasUser,
}: {
  open: boolean;
  onClose: () => void;
  hasUser: boolean;
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-40 md:hidden pointer-events-auto"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Menu Dropdown Card */}
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="absolute top-full left-3 right-3 sm:left-4 sm:right-4 mt-2 md:hidden rounded-3xl overflow-hidden border border-white/15 shadow-[0_20px_40px_rgba(0,0,0,0.7)] z-50 pointer-events-auto"
            style={{
              background: "rgba(7, 11, 14, 0.95)",
              backdropFilter: "blur(24px) saturate(180%)",
              WebkitBackdropFilter: "blur(24px) saturate(180%)",
            }}
          >
            {/* Top glass highlight */}
            <div className="pointer-events-none absolute inset-x-8 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent" />

            <nav aria-label="Mobile navigation" className="p-3.5 sm:p-4">
              {hasUser && (
                <div className="flex items-center justify-between px-3.5 py-2 mb-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                  <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Verified Student Logged In
                  </span>
                </div>
              )}

              <ul className="flex flex-col gap-1" role="list">
                {NAV_LINKS.map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      onClick={onClose}
                      className="flex items-center justify-between px-4 py-2.5 text-sm font-medium text-white/80 rounded-2xl hover:text-white hover:bg-white/[0.08] font-[family-name:var(--font-inter)] transition-colors duration-150"
                    >
                      <span>{label}</span>
                      <ArrowRight size={13} className="text-white/30" />
                    </Link>
                  </li>
                ))}
              </ul>

              {/* Divider */}
              <div className="my-2.5 border-t border-white/10" />

              {/* Auth */}
              <div className="flex flex-col gap-2 p-1">
                {hasUser ? (
                  <>
                    <Link
                      href={ROUTES.DASHBOARD}
                      onClick={onClose}
                      className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold text-center bg-gradient-to-r from-emerald-400 to-teal-400 text-black rounded-2xl shadow-md shadow-emerald-500/20 active:scale-98 transition-transform duration-150"
                    >
                      <span>Go to Dashboard</span>
                      <ArrowRight size={14} strokeWidth={2.5} />
                    </Link>
                    <LogoutButton
                      variant="ghost"
                      showIcon={true}
                      label="Log out"
                      className="w-full justify-center px-4 py-2.5 h-auto text-xs font-semibold text-white/70 hover:text-red-400 hover:bg-red-500/10 border border-white/10 rounded-2xl transition-colors duration-150"
                    />
                  </>
                ) : (
                  <>
                    <Link
                      href={ROUTES.LOGIN}
                      onClick={onClose}
                      className="block px-4 py-2.5 text-sm font-semibold text-center text-white/80 rounded-2xl hover:bg-white/[0.08] border border-white/10 transition-colors duration-150"
                    >
                      Login
                    </Link>
                    <Link
                      href={ROUTES.REGISTER}
                      onClick={onClose}
                      className="block px-4 py-2.5 text-sm font-bold text-center bg-gradient-to-r from-emerald-400 to-teal-400 text-black rounded-2xl shadow-md shadow-emerald-500/20 active:scale-98 transition-transform duration-150"
                    >
                      Sign Up — It&apos;s Free
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Main Navbar ──────────────────────────────────────────────────────────────

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [hasUser, setHasUser] = useState(false);
  const [visible, setVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setHasUser(!!user);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setHasUser(!!session?.user);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Smart Auto-Hide on Scroll Down / Reveal on Scroll Up
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Always show at top of page
      if (currentScrollY <= 40) {
        setVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 70) {
        // Scrolling DOWN -> Hide navbar smoothly
        setVisible(false);
        setMenuOpen(false);
      } else if (currentScrollY < lastScrollY) {
        // Scrolling UP -> Reveal navbar smoothly
        setVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) setMenuOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <motion.header
      role="banner"
      className="fixed top-0 left-0 right-0 z-[var(--z-sticky)] px-3 sm:px-6 pt-3 sm:pt-4 pointer-events-none"
      initial={{ y: -80, opacity: 0 }}
      animate={{
        y: visible ? 0 : -90,
        opacity: visible ? 1 : 0,
      }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="max-w-5xl mx-auto pointer-events-auto">
        <div
          className="relative flex items-center justify-between px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-full bg-[#05080A]/85 border border-white/[0.12] shadow-[0_8px_32px_rgba(0,0,0,0.5),0_1px_2px_rgba(255,255,255,0.08)_inset] backdrop-blur-2xl transition-all duration-300"
        >
          {/* Top Subtle Apple Highlight Rim */}
          <div className="pointer-events-none absolute inset-x-8 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent" />

          {/* Brand Logo */}
          <Logo />

          {/* Center Links (Sliding Capsule) */}
          <NavLinks />

          {/* Right CTAs & Mobile Toggle */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            <NavCTAs hasUser={hasUser} />

            {/* Hamburger Button */}
            <motion.button
              className="md:hidden flex items-center justify-center w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-white transition-colors duration-200"
              onClick={() => setMenuOpen((o) => !o)}
              whileTap={{ scale: 0.9 }}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
            >
              <AnimatePresence mode="wait" initial={false}>
                {menuOpen ? (
                  <motion.span
                    key="x"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <X size={16} />
                  </motion.span>
                ) : (
                  <motion.span
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Menu size={16} />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <div className="pointer-events-auto max-w-5xl mx-auto">
        <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} hasUser={hasUser} />
      </div>
    </motion.header>
  );
}

