"use client";

import Link from "next/link";
import { Plus, ChevronRight, FileText, Bike, Wallet, MessageSquare, BarChart2 } from "lucide-react";

export function QuickActions() {
  const actions = [
    { label: "My Requests", icon: FileText, href: "/dashboard/requests" },
    { label: "Runner Mode", icon: Bike, href: "/dashboard/runner" },
    { label: "Wallet", icon: Wallet, href: "/dashboard/wallet" },
    { label: "Chat Support", icon: MessageSquare, href: "/dashboard/chat" },
    { label: "Analytics", icon: BarChart2, href: "/dashboard/analytics" },
  ];

  return (
    <div className="bg-[#0b120e]/90 border border-white/10 hover:border-emerald-500/30 rounded-2xl sm:rounded-3xl p-5 sm:p-6 backdrop-blur-xl shadow-lg flex flex-col gap-4 relative overflow-hidden transition-all group">
      <div className="absolute -top-10 -right-10 w-28 h-28 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

      <h3 className="text-white font-bold text-base tracking-tight relative z-10 flex items-center justify-between">
        <span>Quick Actions</span>
        <span className="text-emerald-400 text-xs font-mono">✦ Shortcuts</span>
      </h3>

      <Link href="/request/new" className="no-underline relative z-10 block">
        <button className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-black font-extrabold text-xs sm:text-sm shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transition-all cursor-pointer active:scale-[0.98]">
          <Plus size={16} /> Create New Request
        </button>
      </Link>

      <div className="flex flex-col gap-2 relative z-10">
        {actions.map((action, i) => (
          <Link key={i} href={action.href} className="no-underline block">
            <div className="flex justify-between items-center p-3 rounded-xl bg-white/[0.02] hover:bg-emerald-500/10 border border-white/5 hover:border-emerald-500/30 transition-all group/item cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover/item:scale-110 transition-transform">
                  <action.icon size={14} />
                </div>
                <span className="text-[#A7B8B0] group-hover/item:text-white text-xs sm:text-sm font-semibold transition-colors">
                  {action.label}
                </span>
              </div>
              <ChevronRight size={14} className="text-white/20 group-hover/item:text-emerald-400 group-hover/item:translate-x-0.5 transition-all" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
