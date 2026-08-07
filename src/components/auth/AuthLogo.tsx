/**
 * UniVerse — Auth Logo
 *
 * Reusable branded logo lockup used across all auth pages.
 */

import Link from "next/link";
import { Zap } from "lucide-react";
import { ROUTES } from "@/constants/routes";

export function AuthLogo() {
  return (
    <Link
      href={ROUTES.HOME}
      className="inline-flex items-center gap-2.5 group"
      aria-label="UniVerse — Back to Home"
    >
      <div
        className="w-9 h-9 rounded-[10px] flex items-center justify-center group-hover:scale-105 transition-transform duration-200 flex-shrink-0"
        style={{ background: "linear-gradient(135deg, #10B981 0%, #059669 100%)" }}
      >
        <Zap size={18} className="text-white fill-white" />
      </div>
      <span
        className="text-2xl font-extrabold tracking-tight text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]"
        style={{ fontFamily: "var(--font-plus-jakarta-sans)" }}
      >
        Uni<span className="text-[#00E676] drop-shadow-[0_0_15px_rgba(0,230,118,0.5)]">Verse</span>
      </span>
    </Link>
  );
}
