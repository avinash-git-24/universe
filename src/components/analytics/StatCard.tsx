"use client";

import { ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight, Minus, CheckCircle2 } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: number; // percentage, e.g., 5.2 or -2.1
  trendLabel?: string;
  description?: string;
  isStatusCard?: boolean;
}

export function StatCard({ title, value, icon, trend, trendLabel, description, isStatusCard }: StatCardProps) {
  return (
    <div className="relative overflow-hidden bg-[#0c1410]/80 backdrop-blur-md border border-white/10 hover:border-emerald-500/30 rounded-2xl flex flex-col justify-between transition-all p-6 shadow-sm hover:shadow-[0_0_24px_rgba(16,185,129,0.12)] group">
      {/* Corner Ambient Glow */}
      <div className="absolute -top-12 -right-12 w-28 h-28 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors pointer-events-none" />

      <div className="flex justify-between items-start relative z-10">
        <div>
          <h3 className="text-sm font-medium text-white/60 mb-2">{title}</h3>
          <div className="text-3xl font-extrabold text-white tracking-tight">{value}</div>
          {description && <p className="text-xs text-white/40 mt-1.5">{description}</p>}
        </div>
        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.15)] group-hover:scale-105 transition-transform">
          {icon}
        </div>
      </div>
      
      <div className="mt-5 pt-4 border-t border-white/5 relative z-10">
        {isStatusCard ? (
          <div className="flex items-center text-xs font-semibold text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 mr-2 inline-block animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            {trendLabel}
          </div>
        ) : trend !== undefined ? (
          <div className="flex items-center text-xs font-medium">
            {trend > 0 ? (
              <span className="flex items-center text-[#10b981]">
                <ArrowUpRight className="w-3.5 h-3.5 mr-1" />
                {trend}%
              </span>
            ) : trend < 0 ? (
              <span className="flex items-center text-red-400">
                <ArrowDownRight className="w-3.5 h-3.5 mr-1" />
                {Math.abs(trend)}%
              </span>
            ) : (
              <span className="flex items-center text-[#10b981]">
                <ArrowUpRight className="w-3.5 h-3.5 mr-1" />
                0%
              </span>
            )}
            <span className="text-white/40 ml-1.5">{trendLabel || "from previous period"}</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
