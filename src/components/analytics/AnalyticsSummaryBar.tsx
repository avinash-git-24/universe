"use client";

import { Calculator, TrendingUp, TrendingDown, CheckCircle2, XCircle, IndianRupee } from "lucide-react";

interface AnalyticsSummaryBarProps {
  avgSpending: number;
  highestCost: number;
  lowestCost: number;
  completed: number;
  cancelled: number;
}

export function AnalyticsSummaryBar({
  avgSpending,
  highestCost,
  lowestCost,
  completed,
  cancelled,
}: AnalyticsSummaryBarProps) {
  return (
    <div className="border border-white/10 rounded-2xl w-full grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-[1px] bg-white/10 overflow-hidden shadow-sm backdrop-blur-md">
      
      {/* Average Spent */}
      <div className="flex items-center gap-3 sm:gap-4 p-4 sm:p-5 bg-[#0c1410]/90 hover:bg-[#101b15] transition-colors">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
          <Calculator className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
        </div>
        <div>
          <p className="text-[11px] sm:text-xs font-medium text-white/50 mb-0.5 leading-tight">Average Spent</p>
          <div className="text-base sm:text-lg font-bold text-white tracking-tight">₹{avgSpending.toFixed(2)}</div>
        </div>
      </div>

      {/* Highest Request Cost */}
      <div className="flex items-center gap-3 sm:gap-4 p-4 sm:p-5 bg-[#0c1410]/90 hover:bg-[#101b15] transition-colors">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
          <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
        </div>
        <div>
          <p className="text-[11px] sm:text-xs font-medium text-white/50 mb-0.5 leading-tight">Highest Cost</p>
          <div className="text-base sm:text-lg font-bold text-white tracking-tight">₹{highestCost.toFixed(2)}</div>
        </div>
      </div>

      {/* Lowest Request Cost */}
      <div className="flex items-center gap-3 sm:gap-4 p-4 sm:p-5 bg-[#0c1410]/90 hover:bg-[#101b15] transition-colors">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-yellow-500/10 flex items-center justify-center shrink-0">
          <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
        </div>
        <div>
          <p className="text-[11px] sm:text-xs font-medium text-white/50 mb-0.5 leading-tight">Lowest Cost</p>
          <div className="text-base sm:text-lg font-bold text-white tracking-tight">₹{lowestCost.toFixed(2)}</div>
        </div>
      </div>

      {/* Completed Requests */}
      <div className="flex items-center gap-3 sm:gap-4 p-4 sm:p-5 bg-[#0c1410]/90 hover:bg-[#101b15] transition-colors">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
          <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
        </div>
        <div>
          <p className="text-[11px] sm:text-xs font-medium text-white/50 mb-0.5 leading-tight">Completed</p>
          <div className="text-base sm:text-lg font-bold text-white tracking-tight">{completed}</div>
        </div>
      </div>

      {/* Cancelled Requests */}
      <div className="col-span-2 sm:col-span-1 flex items-center gap-3 sm:gap-4 p-4 sm:p-5 bg-[#0c1410]/90 hover:bg-[#101b15] transition-colors">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
          <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" />
        </div>
        <div>
          <p className="text-[11px] sm:text-xs font-medium text-white/50 mb-0.5 leading-tight">Cancelled</p>
          <div className="text-base sm:text-lg font-bold text-white tracking-tight">{cancelled}</div>
        </div>
      </div>

    </div>
  );
}
