"use client";

import Link from "next/link";
import { Mail, Phone, Edit, ShieldCheck } from "lucide-react";
import type { Profile } from "@/lib/database/requests";
import { formatStudentName } from "@/lib/utils";

interface ProfileSummaryProps {
  profile: Profile;
  email: string;
}

export function ProfileSummary({ profile, email }: ProfileSummaryProps) {
  const rawName = profile?.full_name || email?.split("@")[0] || "Student";
  const formatted = formatStudentName(rawName);

  return (
    <div className="bg-[#0b120e]/90 border border-white/10 hover:border-emerald-500/30 rounded-2xl sm:rounded-3xl p-5 sm:p-6 backdrop-blur-xl shadow-lg relative overflow-hidden transition-all group">
      {/* Subtle top-right ambient glow */}
      <div className="absolute -top-10 -right-10 w-28 h-28 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Avatar and Name */}
      <div className="flex items-center gap-3.5 relative z-10">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-black font-extrabold text-xl flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.35)] shrink-0 border border-emerald-300/30">
          {formatted.initial}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-white font-bold text-base truncate tracking-tight">
            {formatted.fullName}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Verified Student
            </span>
            {formatted.rollPrefix && (
              <span className="text-[10px] font-mono text-white/40">
                #{formatted.rollPrefix}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Contact Info */}
      <div className="flex flex-col gap-2.5 mt-5 pt-4 border-t border-white/5 relative z-10 text-xs">
        <div className="flex items-center gap-2.5 text-white/60 truncate">
          <Mail size={14} className="text-emerald-400 shrink-0" />
          <span className="truncate">{email || "No email provided"}</span>
        </div>
        <div className="flex items-center gap-2.5 text-white/60">
          <Phone size={14} className="text-emerald-400 shrink-0" />
          <span className="truncate">
            {((profile as Record<string, unknown>)?.phone_number as string | undefined) || "Add phone number"}
          </span>
        </div>
      </div>

      {/* Edit Profile Button */}
      <Link href="/dashboard/profile" className="block mt-4 relative z-10 no-underline">
        <button className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/25 hover:border-emerald-500/40 text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-[0.98]">
          <Edit size={13} /> Edit Profile
        </button>
      </Link>
    </div>
  );
}
