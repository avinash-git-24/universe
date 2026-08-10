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
    <div className="bg-[#0d1310] border border-white/5 rounded-2xl w-full flex flex-col md:flex-row items-center divide-y md:divide-y-0 md:divide-x divide-white/5 overflow-hidden">
      
      {/* Average Spent */}
      <div className="flex-1 flex items-center gap-4 p-6 w-full hover:bg-white/5 transition-colors">
        <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
          <Calculator className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <p className="text-xs font-medium text-white/50 mb-1 leading-tight">Average Spent<br/>Per Request</p>
          <div className="text-xl font-bold text-white tracking-tight">₹{avgSpending.toFixed(2)}</div>
        </div>
      </div>

      {/* Highest Request Cost */}
      <div className="flex-1 flex items-center gap-4 p-6 w-full hover:bg-white/5 transition-colors">
        <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
          <TrendingUp className="w-5 h-5 text-emerald-400" />
        </div>
        <div>
          <p className="text-xs font-medium text-white/50 mb-1 leading-tight">Highest Request<br/>Cost</p>
          <div className="text-xl font-bold text-white tracking-tight">₹{highestCost.toFixed(2)}</div>
        </div>
      </div>

      {/* Lowest Request Cost */}
      <div className="flex-1 flex items-center gap-4 p-6 w-full hover:bg-white/5 transition-colors">
        <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center shrink-0">
          <TrendingDown className="w-5 h-5 text-yellow-400" />
        </div>
        <div>
          <p className="text-xs font-medium text-white/50 mb-1 leading-tight">Lowest Request<br/>Cost</p>
          <div className="text-xl font-bold text-white tracking-tight">₹{lowestCost.toFixed(2)}</div>
        </div>
      </div>

      {/* Completed Requests */}
      <div className="flex-1 flex items-center gap-4 p-6 w-full hover:bg-white/5 transition-colors">
        <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
        </div>
        <div>
          <p className="text-xs font-medium text-white/50 mb-1 leading-tight">Completed<br/>Requests</p>
          <div className="text-xl font-bold text-white tracking-tight">{completed}</div>
        </div>
      </div>

      {/* Cancelled Requests */}
      <div className="flex-1 flex items-center gap-4 p-6 w-full hover:bg-white/5 transition-colors">
        <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
          <XCircle className="w-5 h-5 text-red-400" />
        </div>
        <div>
          <p className="text-xs font-medium text-white/50 mb-1 leading-tight">Cancelled<br/>Requests</p>
          <div className="text-xl font-bold text-white tracking-tight">{cancelled}</div>
        </div>
      </div>

    </div>
  );
}
