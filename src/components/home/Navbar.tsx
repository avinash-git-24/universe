"use client";

/**
 * UniVerse — Cosmic Navbar
 *
 * Glassmorphic floating navigation bar with student profile recognition,
 * direct marketplace & delivery shortcuts, and glowing CTA interactions.
 */

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Zap, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/constants/routes";
import { createClient } from "@/lib/supabase/client";
import { LogoutButton } from "@/components/auth/LogoutButton";

interface UserProfile {
  full_name: string | null;
  avatar_url: string | null;
  role: string | null;
}

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Marketplace", href: "/dashboard/marketplace", badge: "HOT" },
  { label: "Deliveries", href: "/dashboard/requests" },
  { label: "About", href: "/about" },
  { label: "How It Works", href: "/#how-it-works" },
] as const;

// ─── Logo ─────────────────────────────────────────────────────────────────────

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5 group" aria-label="UniVerse — Home">
      {/* Mark */}
      <motion.div
        className={cn(
          "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 relative overflow-hidden",
          "transition-all duration-300 shadow-md shadow-emerald-500/20",
          "group-hover:scale-105 group-hover:shadow-emerald-500/40"
        )}
        style={{ background: "linear-gradient(135deg, #10B981 0%, #059669 100%)" }}
        whileTap={{ scale: 0.95 }}
      >
        <Zap size={18} className="text-white fill-white relative z-10" />
        <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
      </motion.div>

      {/* Wordmark */}
      <div className="flex flex-col">
        <span
          className={cn(
            "text-xl font-extrabold tracking-tight text-white transition-colors duration-300 leading-none",
            "font-[family-name:var(--font-plus-jakarta-sans)]"
          )}
        >
          Uni<span className="text-emerald-400">Verse</span>
        </span>
        <span className="text-[9px] font-mono tracking-widest text-emerald-400/70 uppercase mt-0.5">
          Campus Super-App
        </span>
      </div>
    </Link>
  );
}

// ─── Desktop Nav Links ────────────────────────────────────────────────────────

function NavLinks() {
  return (
    <nav aria-label="Main navigation">
      <ul className="hidden lg:flex items-center gap-1" role="list">
        {NAV_LINKS.map(({ label, href, ...rest }) => {
          const badge = "badge" in rest ? rest.badge : undefined;
          return (
            <li key={label}>
              <Link
                href={href}
                className={cn(
                  "relative px-3.5 py-1.5 text-sm font-medium rounded-lg",
                  "font-[family-name:var(--font-inter)]",
                  "transition-all duration-200 flex items-center gap-1.5",
                  "text-white/75 hover:text-white hover:bg-white/5"
                )}
              >
                <span>{label}</span>
                {badge && (
                  <span className="px-1.5 py-0.5 text-[9px] font-bold tracking-wider uppercase rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 animate-pulse">
                    {badge}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

// ─── CTA Buttons ──────────────────────────────────────────────────────────────

function NavCTAs({
  hasUser,
  profile,
}: {
  hasUser: boolean;
  profile: UserProfile | null;
}) {
  if (hasUser) {
    const firstName = profile?.full_name?.split(" ")[0] || "Student";
    const initial = profile?.full_name ? profile.full_name[0].toUpperCase() : "U";

    return (
      <div className="hidden md:flex items-center gap-3">
        {/* Student Profile Chip */}
        <Link
          href="/dashboard/profile"
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:border-emerald-500/30 hover:bg-emerald-500/[0.06] transition-all duration-200 group"
        >
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={firstName}
              className="w-6 h-6 rounded-full object-cover border border-emerald-400/40"
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-[11px] font-bold text-black font-mono shadow-xs">
              {initial}
            </div>
          )}
          <span className="text-xs font-semibold text-white/90 group-hover:text-emerald-300 transition-colors">
            {firstName}
          </span>
          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            🎓 MU
          </span>
        </Link>

        {/* Glowing Dashboard CTA */}
        <Link
          href={ROUTES.DASHBOARD}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 text-black shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:scale-[1.03] active:scale-[0.98] transition-all duration-200"
        >
          <span>Dashboard</span>
          <ArrowRight size={13} strokeWidth={2.5} />
        </Link>

        {/* Logout */}
        <LogoutButton
          variant="ghost"
          showIcon={false}
          className="px-3 py-1.5 text-xs font-semibold h-auto rounded-xl bg-transparent border border-white/10 text-white/60 hover:text-red-300 hover:border-red-500/30 hover:bg-red-500/10 transition-all duration-200"
        />
      </div>
    );
  }

  return (
    <div className="hidden md:flex items-center gap-2.5">
      {/* Login */}
      <Link
        href={ROUTES.LOGIN}
        className="px-4 py-2 text-xs font-semibold rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200"
      >
        Sign In
      </Link>

      {/* Register */}
      <motion.div whileTap={{ scale: 0.97 }}>
        <Link
          href={ROUTES.REGISTER}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 text-black shadow-md shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:scale-[1.03] transition-all duration-200"
        >
          <span>Join UniVerse</span>
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
  profile,
}: {
  open: boolean;
  onClose: () => void;
  hasUser: boolean;
  profile: UserProfile | null;
}) {
  const firstName = profile?.full_name?.split(" ")[0] || "Student";
  const initial = profile?.full_name ? profile.full_name[0].toUpperCase() : "U";

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
            background: "rgba(10, 16, 13, 0.94)",
            backdropFilter: "blur(24px) saturate(200%)",
            WebkitBackdropFilter: "blur(24px) saturate(200%)",
          }}
        >
          <nav aria-label="Mobile navigation" className="p-4 space-y-3">
            {/* Student Profile Header in Mobile if Logged In */}
            {hasUser && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.04] border border-white/[0.08] mb-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-xs font-bold text-black font-mono">
                  {initial}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-white">{firstName}</span>
                  <span className="text-[10px] text-emerald-400 font-mono">🎓 Marwadi University</span>
                </div>
              </div>
            )}

            <ul className="flex flex-col gap-1" role="list">
              {NAV_LINKS.map(({ label, href, ...rest }) => {
                const badge = "badge" in rest ? rest.badge : undefined;
                return (
                  <li key={label}>
                    <Link
                      href={href}
                      onClick={onClose}
                      className="flex items-center justify-between px-3.5 py-2.5 text-sm font-medium text-white/80 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                    >
                      <span>{label}</span>
                      {badge && (
                        <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          {badge}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>

            {/* Divider */}
            <div className="border-t border-white/10 my-2" />

            {/* Auth Buttons */}
            <div className="flex flex-col gap-2 pt-1">
              {hasUser ? (
                <>
                  <Link
                    href={ROUTES.DASHBOARD}
                    onClick={onClose}
                    className="w-full py-2.5 text-center text-sm font-bold rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 text-black shadow-md shadow-emerald-500/20"
                  >
                    Go to Dashboard →
                  </Link>
                  <LogoutButton
                    variant="ghost"
                    className="w-full justify-center py-2.5 h-auto text-xs font-semibold text-white/60 hover:text-red-400 hover:bg-red-500/10 rounded-xl"
                  />
                </>
              ) : (
                <>
                  <Link
                    href={ROUTES.LOGIN}
                    onClick={onClose}
                    className="w-full py-2.5 text-center text-sm font-semibold text-white/80 hover:text-white rounded-xl bg-white/5 border border-white/10"
                  >
                    Sign In
                  </Link>
                  <Link
                    href={ROUTES.REGISTER}
                    onClick={onClose}
                    className="w-full py-2.5 text-center text-sm font-bold rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 text-black shadow-md shadow-emerald-500/20"
                  >
                    Join UniVerse Free
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
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [hasUser, setHasUser] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setHasUser(!!user);
      if (user) {
        supabase
          .from("profiles")
          .select("full_name, avatar_url, role")
          .eq("id", user.id)
          .maybeSingle()
          .then(({ data }) => {
            if (data) setProfile(data);
          });
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setHasUser(!!session?.user);
      if (session?.user) {
        supabase
          .from("profiles")
          .select("full_name, avatar_url, role")
          .eq("id", session.user.id)
          .maybeSingle()
          .then(({ data }) => {
            if (data) setProfile(data);
          });
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > 20);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) setMenuOpen(false);
    };
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
        className="max-w-6xl mx-auto mx-3 sm:mx-6 lg:mx-auto mt-3 rounded-2xl border"
        style={{
          backgroundColor: scrolled ? "rgba(6, 10, 8, 0.92)" : "rgba(8, 14, 11, 0.75)",
          borderColor: scrolled ? "rgba(16, 185, 129, 0.28)" : "rgba(16, 185, 129, 0.16)",
          boxShadow: scrolled
            ? "0 10px 30px rgba(0, 0, 0, 0.6), 0 0 20px rgba(16, 185, 129, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.08)"
            : "0 4px 20px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
          transition: "all 0.3s ease",
        }}
      >
        <div className="relative flex items-center justify-between px-4 sm:px-6 py-3">
          <Logo />
          <NavLinks />
          <NavCTAs hasUser={hasUser} profile={profile} />

          {/* Mobile Hamburger Button */}
          <motion.button
            className="lg:hidden flex items-center justify-center w-9 h-9 rounded-xl bg-white/[0.05] border border-white/10 text-white hover:bg-white/15 transition-colors"
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
                  <X size={18} />
                </motion.span>
              ) : (
                <motion.span
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <Menu size={18} />
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </motion.div>

      {/* Mobile menu */}
      <MobileMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        hasUser={hasUser}
        profile={profile}
      />
    </motion.header>
  );
}
