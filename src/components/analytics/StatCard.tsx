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
    <div className="relative overflow-hidden bg-[#0d1310] border border-white/5 rounded-2xl flex flex-col justify-between transition-all p-6 shadow-sm">
      <div className="flex justify-between items-start relative z-10">
        <div>
          <h3 className="text-sm font-medium text-white/60 mb-3">{title}</h3>
          <div className="text-3xl font-bold text-white tracking-tight">{value}</div>
          {description && <p className="text-xs text-white/40 mt-1.5">{description}</p>}
        </div>
        <div className="w-9 h-9 rounded-full bg-[#10b981]/10 flex items-center justify-center border border-[#10b981]/10 text-[#10b981]">
          {icon}
        </div>
      </div>
      
      <div className="mt-5 pt-4 border-t border-white/5 relative z-10">
        {isStatusCard ? (
          <div className="flex items-center text-xs font-medium text-white/50">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-[#10b981]" />
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
