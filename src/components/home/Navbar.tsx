"use client";

/**
 * UniVerse — Navbar
 *
 * Transparent on load → blurred glass on scroll.
 * Responsive: links on desktop, hamburger on mobile.
 */

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/constants/routes";

const NAV_LINKS = [
  { label: "Home",         href: "/" },
  { label: "About",        href: "/about" },
  { label: "How It Works", href: "#how-it-works" },
] as const;

// ─── Logo ─────────────────────────────────────────────────────────────────────

function Logo({ scrolled }: { scrolled: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2.5 group" aria-label="UniVerse — Home">
      {/* Mark */}
      <motion.div
        className={cn(
          "w-9 h-9 rounded-[10px] flex items-center justify-center flex-shrink-0",
          "transition-all duration-300",
          "group-hover:scale-105"
        )}
        style={{ background: "linear-gradient(135deg, #10B981 0%, #059669 100%)" }}
        whileTap={{ scale: 0.95 }}
      >
        <Zap size={18} className="text-white fill-white" />
      </motion.div>

      {/* Wordmark */}
      <span
        className={cn(
          "text-xl font-extrabold tracking-tight transition-colors duration-300",
          "font-[family-name:var(--font-plus-jakarta-sans)]",
          scrolled ? "text-[var(--color-text)]" : "text-white"
        )}
      >
        Uni<span className="text-[var(--color-primary)]">Verse</span>
      </span>
    </Link>
  );
}

// ─── Desktop Nav Links ────────────────────────────────────────────────────────

function NavLinks({ scrolled }: { scrolled: boolean }) {
  return (
    <nav aria-label="Main navigation">
      <ul className="hidden md:flex items-center gap-1" role="list">
        {NAV_LINKS.map(({ label, href }) => (
          <li key={label}>
            <Link
              href={href}
              className={cn(
                "relative px-4 py-2 text-sm font-medium rounded-[var(--radius-md)]",
                "font-[family-name:var(--font-inter)]",
                "transition-colors duration-200",
                "after:absolute after:bottom-1 after:left-4 after:right-4",
                "after:h-0.5 after:bg-[var(--color-primary)] after:scale-x-0",
                "hover:after:scale-x-100 after:transition-transform after:duration-200",
                scrolled
                  ? "text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-subtle)]"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              )}
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

function NavCTAs({ scrolled }: { scrolled: boolean }) {
  return (
    <div className="hidden md:flex items-center gap-3">
      {/* Login — ghost */}
      <Link
        href={ROUTES.LOGIN}
        className={cn(
          "px-4 py-2 text-sm font-semibold rounded-[var(--radius-md)]",
          "font-[family-name:var(--font-inter)]",
          "transition-all duration-200",
          scrolled
            ? "text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-subtle)]"
            : "text-white/80 hover:text-white hover:bg-white/10"
        )}
      >
        Login
      </Link>

      {/* Register — primary */}
      <motion.div whileTap={{ scale: 0.97 }}>
        <Link
          href={ROUTES.REGISTER}
          className={cn(
            "inline-flex items-center gap-1.5 px-5 py-2.5",
            "text-sm font-semibold rounded-[var(--radius-md)]",
            "font-[family-name:var(--font-inter)]",
            "bg-[var(--color-primary)] text-white",
            "hover:bg-[var(--color-primary-hover)]",
            "shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)]",
            "transition-all duration-200 hover:-translate-y-px",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2"
          )}
        >
          Get Started
        </Link>
      </motion.div>
    </div>
  );
}

// ─── Mobile Menu ──────────────────────────────────────────────────────────────

function MobileMenu({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -12, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.97 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className={cn(
            "absolute top-full left-4 right-4 mt-2 md:hidden",
            "rounded-[var(--radius-xl)] overflow-hidden",
            "border border-white/15",
            "shadow-[var(--shadow-2xl)]",
          )}
          style={{
            background: "rgba(255,255,255,0.88)",
            backdropFilter: "blur(20px) saturate(200%)",
            WebkitBackdropFilter: "blur(20px) saturate(200%)",
          }}
        >
          <nav aria-label="Mobile navigation" className="p-3">
            <ul className="flex flex-col gap-1" role="list">
              {NAV_LINKS.map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    onClick={onClose}
                    className={cn(
                      "block px-4 py-3 text-sm font-medium",
                      "text-[var(--color-text)] rounded-[var(--radius-md)]",
                      "hover:bg-[var(--color-bg-subtle)]",
                      "font-[family-name:var(--font-inter)]",
                      "transition-colors duration-150"
                    )}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Divider */}
            <div className="my-2 border-t border-[var(--color-border)]"/>

            {/* Auth */}
            <div className="flex flex-col gap-2 p-1">
              <Link
                href={ROUTES.LOGIN}
                onClick={onClose}
                className={cn(
                  "block px-4 py-3 text-sm font-semibold text-center",
                  "text-[var(--color-text-secondary)] rounded-[var(--radius-md)]",
                  "hover:bg-[var(--color-bg-subtle)]",
                  "font-[family-name:var(--font-inter)]",
                  "transition-colors duration-150"
                )}
              >
                Login
              </Link>
              <Link
                href={ROUTES.REGISTER}
                onClick={onClose}
                className={cn(
                  "block px-4 py-3 text-sm font-semibold text-center",
                  "bg-[var(--color-primary)] text-white rounded-[var(--radius-md)]",
                  "hover:bg-[var(--color-primary-hover)]",
                  "font-[family-name:var(--font-inter)]",
                  "transition-colors duration-150"
                )}
              >
                Get Started — It&apos;s Free
              </Link>
            </div>
          </nav>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Main Navbar ──────────────────────────────────────────────────────────────

export function Navbar() {
  const [scrolled, setScrolled]   = useState(false);
  const [menuOpen, setMenuOpen]   = useState(false);

  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > 20);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 768) setMenuOpen(false); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <motion.header
      role="banner"
      className="fixed top-0 left-0 right-0 z-[var(--z-sticky)]"
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
    >
      <motion.div
        className="mx-4 mt-3 rounded-[var(--radius-xl)]"
        animate={{
          borderColor: scrolled ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.1)",
          backgroundColor: scrolled
            ? "rgba(255,255,255,0.82)"
            : "rgba(10,10,10,0.12)",
          boxShadow: scrolled
            ? "0 4px 24px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)"
            : "none",
        }}
        style={{
          backdropFilter: scrolled ? "blur(20px) saturate(180%)" : "blur(4px)",
          WebkitBackdropFilter: scrolled ? "blur(20px) saturate(180%)" : "blur(4px)",
          border: "1px solid",
          transition: "all 0.3s ease",
        }}
      >
        <div className="relative flex items-center justify-between px-5 py-3">
          <Logo scrolled={scrolled} />
          <NavLinks scrolled={scrolled} />
          <NavCTAs scrolled={scrolled} />

          {/* Hamburger */}
          <motion.button
            className={cn(
              "md:hidden flex items-center justify-center w-9 h-9 rounded-[var(--radius-md)]",
              "transition-colors duration-200",
              scrolled ? "text-[var(--color-text)] hover:bg-[var(--color-bg-subtle)]" : "text-white hover:bg-white/15"
            )}
            onClick={() => setMenuOpen((o) => !o)}
            whileTap={{ scale: 0.92 }}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            <AnimatePresence mode="wait" initial={false}>
              {menuOpen ? (
                <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                  <X size={20} />
                </motion.span>
              ) : (
                <motion.span key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                  <Menu size={20} />
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </motion.div>

      {/* Mobile menu */}
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </motion.header>
  );
}
