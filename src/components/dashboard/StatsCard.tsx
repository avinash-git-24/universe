import { memo } from "react";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  gradient?: string;
  iconBg?: string;
  trend?: string;
  color?: string; // legacy prop — ignored in new design
}

export const StatsCard = memo(function StatsCard({
  label, value, icon: Icon,
  gradient = "rgba(10,15,12,0.4)",
  iconBg = "rgba(0,230,118,0.1)",
  trend,
}: StatsCardProps) {
  const isActiveCard = label.toLowerCase().includes("active") && value > 0;
  const isCancelledZero = label.toLowerCase().includes("cancelled") && value === 0;

  return (
    <div
      className={`rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 lg:p-6 relative overflow-hidden backdrop-blur-xl transition-all duration-300 group hover:-translate-y-1 ${
        isActiveCard
          ? "bg-[#0a0f0c]/60 border border-emerald-500/40 shadow-[0_0_25px_rgba(16,185,129,0.15)]"
          : "bg-[#0a0f0c]/40 border border-white/10 hover:border-emerald-500/30 shadow-[0_8px_24px_rgba(0,0,0,0.35)]"
      }`}
    >
      {/* Background ambient glow */}
      <div
        className={`absolute -top-8 -right-8 w-20 sm:w-24 h-20 sm:h-24 rounded-full blur-2xl transition-all duration-500 pointer-events-none ${
          isActiveCard ? "bg-emerald-500/20 group-hover:bg-emerald-500/30" : "bg-emerald-500/10 group-hover:bg-emerald-500/20"
        }`}
      />

      <div className="flex items-start justify-between relative z-10 gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-[#A7B8B0] text-[10px] sm:text-xs font-mono font-bold tracking-wider uppercase mb-1 sm:mb-1.5 truncate">
            {label}
          </p>
          <p className="text-white text-2xl sm:text-3xl lg:text-4xl font-extrabold font-mono tracking-tight leading-none mb-1 sm:mb-1.5 group-hover:text-emerald-400 transition-all">
            {value}
          </p>
          {isActiveCard ? (
            <p className="text-emerald-400 text-[10px] sm:text-xs font-semibold flex items-center gap-1.5 truncate">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0 shadow-[0_0_8px_rgba(52,211,153,0.9)]" />
              <span className="truncate">Live in progress</span>
            </p>
          ) : isCancelledZero ? (
            <p className="text-white/40 text-[10px] sm:text-xs font-medium truncate">All clean · 0 issues</p>
          ) : trend ? (
            <p className="text-white/40 text-[10px] sm:text-xs font-medium truncate">{trend}</p>
          ) : null}
        </div>

        <div
          className={`w-8 h-8 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 border transition-all duration-300 group-hover:scale-110 shadow-sm ${
            isActiveCard
              ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
              : isCancelledZero
              ? "bg-white/5 border-white/10 text-white/40"
              : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
          }`}
        >
          <Icon size={16} className="sm:hidden" />
          <Icon size={20} className="hidden sm:block" />
        </div>
      </div>
    </div>
  );
});
