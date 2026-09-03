"use client";

/**
 * UniVerse — Smart Cosmic Navbar
 *
 * - Auto-Hides when scrolling down for clean, distraction-free reading.
 * - Smoothly slides back in when scrolling up for quick access to Dashboard/Links.
 * - Always deep dark cosmic glass (never turns white).
 * - Real-time Supabase auth tracking for Dashboard & Logout buttons.
 */

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Zap, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
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
    <Link href="/" className="flex items-center gap-2.5 group" aria-label="UniVerse — Home">
      {/* Mark */}
      <motion.div
        className="w-9 h-9 rounded-[10px] flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-105 shadow-md shadow-emerald-500/20"
        style={{ background: "linear-gradient(135deg, #10B981 0%, #059669 100%)" }}
        whileTap={{ scale: 0.95 }}
      >
        <Zap size={18} className="text-white fill-white" />
      </motion.div>

      {/* Wordmark */}
      <span
        className="text-xl font-extrabold tracking-tight text-white transition-colors duration-300 font-[family-name:var(--font-plus-jakarta-sans)]"
      >
        Uni<span className="text-emerald-400">Verse</span>
      </span>
    </Link>
  );
}

// ─── Desktop Nav Links ────────────────────────────────────────────────────────

function NavLinks() {
  return (
    <nav aria-label="Main navigation">
      <ul className="hidden md:flex items-center gap-1" role="list">
        {NAV_LINKS.map(({ label, href }) => (
          <li key={label}>
            <Link
              href={href}
              className="relative px-4 py-2 text-sm font-medium rounded-lg font-[family-name:var(--font-inter)] transition-colors duration-200 text-white/80 hover:text-white hover:bg-white/10"
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

// ─── CTA Buttons ──────────────────────────────────────────────────────────────

function NavCTAs({ hasUser }: { hasUser: boolean }) {
  if (hasUser) {
    return (
      <div className="hidden md:flex items-center gap-2.5">
        <Link
          href={ROUTES.DASHBOARD}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 text-black shadow-md shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:scale-105 active:scale-95 transition-all duration-200"
        >
          <span>Dashboard</span>
          <ArrowRight size={13} strokeWidth={2.5} />
        </Link>
        <LogoutButton
          variant="ghost"
          showIcon={false}
          className="px-3 py-2 text-xs font-semibold h-auto rounded-xl bg-transparent border border-white/15 text-white/70 hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/10 transition-all duration-200"
        />
      </div>
    );
  }

  return (
    <div className="hidden md:flex items-center gap-2.5">
      {/* Login — ghost */}
      <Link
        href={ROUTES.LOGIN}
        className="px-4 py-2 text-xs font-semibold rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200"
      >
        Login
      </Link>

      {/* Register — primary */}
      <motion.div whileTap={{ scale: 0.97 }}>
        <Link
          href={ROUTES.REGISTER}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 text-black shadow-md shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:scale-105 active:scale-95 transition-all duration-200"
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
        <motion.div
          initial={{ opacity: 0, y: -12, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.97 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="absolute top-full left-4 right-4 mt-2 md:hidden rounded-2xl overflow-hidden border border-emerald-500/20 shadow-2xl z-50"
          style={{
            background: "rgba(8, 14, 11, 0.95)",
            backdropFilter: "blur(24px) saturate(200%)",
            WebkitBackdropFilter: "blur(24px) saturate(200%)",
          }}
        >
          <nav aria-label="Mobile navigation" className="p-3">
            <ul className="flex flex-col gap-1" role="list">
              {NAV_LINKS.map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    onClick={onClose}
                    className="block px-4 py-3 text-sm font-medium text-white/80 rounded-xl hover:bg-white/10 font-[family-name:var(--font-inter)] transition-colors duration-150"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Divider */}
            <div className="my-2 border-t border-white/10" />

            {/* Auth */}
            <div className="flex flex-col gap-2 p-1">
              {hasUser ? (
                <>
                  <Link
                    href={ROUTES.DASHBOARD}
                    onClick={onClose}
                    className="block px-4 py-3 text-sm font-bold text-center bg-gradient-to-r from-emerald-400 to-teal-400 text-black rounded-xl shadow-md shadow-emerald-500/20"
                  >
                    Dashboard →
                  </Link>
                  <LogoutButton
                    variant="ghost"
                    className="w-full justify-center px-4 py-2.5 h-auto text-xs font-semibold text-white/60 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors duration-150"
                  />
                </>
              ) : (
                <>
                  <Link
                    href={ROUTES.LOGIN}
                    onClick={onClose}
                    className="block px-4 py-2.5 text-sm font-semibold text-center text-white/80 rounded-xl hover:bg-white/10 border border-white/10 transition-colors duration-150"
                  >
                    Login
                  </Link>
                  <Link
                    href={ROUTES.REGISTER}
                    onClick={onClose}
                    className="block px-4 py-2.5 text-sm font-bold text-center bg-gradient-to-r from-emerald-400 to-teal-400 text-black rounded-xl shadow-md shadow-emerald-500/20 transition-colors duration-150"
                  >
                    Sign Up — It&apos;s Free
                  </Link>
                </>
              )}
            </div>
          </nav>
        </motion.div>
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
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setHasUser(!!user);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setHasUser(!!session?.user);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

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
      className="fixed top-0 left-0 right-0 z-[var(--z-sticky)] pointer-events-none"
      initial={{ y: -80, opacity: 0 }}
      animate={{
        y: visible ? 0 : -90,
        opacity: visible ? 1 : 0,
      }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      <div
        className="mx-4 mt-3 rounded-[var(--radius-xl)] pointer-events-auto"
        style={{
          borderColor: "rgba(16, 185, 129, 0.18)",
          backgroundColor: "rgba(8, 14, 11, 0.85)",
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
          border: "1px solid rgba(16, 185, 129, 0.18)",
          boxShadow: "0 10px 32px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.08)",
          transition: "border-color 0.25s ease, background-color 0.25s ease",
        }}
      >
        <div className="relative flex items-center justify-between px-5 py-3">
          <Logo />
          <NavLinks />
          <NavCTAs hasUser={hasUser} />

          {/* Hamburger */}
          <motion.button
            className="md:hidden flex items-center justify-center w-9 h-9 rounded-[var(--radius-md)] text-white hover:bg-white/15 transition-colors duration-200"
            onClick={() => setMenuOpen((o) => !o)}
            whileTap={{ scale: 0.92 }}
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
                  <X size={20} />
                </motion.span>
              ) : (
                <motion.span
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <Menu size={20} />
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>

      {/* Mobile menu */}
      <div className="pointer-events-auto">
        <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} hasUser={hasUser} />
      </div>
    </motion.header>
  );
}
