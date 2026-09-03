"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

import type { StudentRequestWithDetails } from "@/lib/database/requests";

interface DashboardChartsProps {
  requests: StudentRequestWithDetails[];
}

export function DashboardCharts({ requests }: DashboardChartsProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const total = requests.length;
  
  // Calculate counts
  const completed = requests.filter(r => r.status === "delivered").length;
  const cancelled = requests.filter(r => r.status === "cancelled").length;
  const inProgress = requests.filter(r => !["delivered", "cancelled"].includes(r.status)).length;
  
  // Calculate percentages (handle division by zero)
  const completedPct = total > 0 ? Math.round((completed / total) * 100) : 0;
  const cancelledPct = total > 0 ? Math.round((cancelled / total) * 100) : 0;
  const inProgressPct = total > 0 ? Math.round((inProgress / total) * 100) : 0;

  // Chart data: Group by last 7 days
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const last7DaysData = Array(7).fill(0);
  const labels = Array(7).fill("");
  
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    labels[6 - i] = d.toLocaleDateString("en-US", { weekday: "short" });
  }

  requests.forEach(req => {
    const reqDate = new Date(req.created_at);
    reqDate.setHours(0, 0, 0, 0);
    const diffTime = today.getTime() - reqDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays >= 0 && diffDays < 7) {
      last7DaysData[6 - diffDays]++;
    }
  });

  const maxVal = Math.max(...last7DaysData, 1);
  const points = last7DaysData.map((d, i) => {
    const x = (i / 6) * 500;
    const y = 130 - (d / maxVal) * 120; // 130 is 0, 10 is max
    return [x, y];
  });

  let linePath = `M ${points[0][0]},${points[0][1]}`;
  for(let i = 1; i < points.length; i++) {
    const curr = points[i];
    const prev = points[i-1];
    const midX = (prev[0] + curr[0]) / 2;
    linePath += ` C ${midX},${prev[1]} ${midX},${curr[1]} ${curr[0]},${curr[1]}`;
  }
  const fillPath = `${linePath} L 500,150 L 0,150 Z`;

  const yAxisTicks = [maxVal, maxVal * 0.8, maxVal * 0.6, maxVal * 0.4, maxVal * 0.2, 0].map(v => Math.round(v));
  // Keep unique ticks if maxVal is small
  const uniqueYTicks = Array.from(new Set(yAxisTicks)).sort((a, b) => b - a);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1.8fr_1fr] gap-4">
      {/* Line Chart Card */}
      <div className="bg-[#0b120e]/90 border border-white/10 hover:border-emerald-500/30 rounded-2xl sm:rounded-3xl p-5 sm:p-6 backdrop-blur-xl shadow-lg relative overflow-hidden transition-all group">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-white font-bold text-base tracking-tight">Overview Analytics</h3>
            <p className="text-white/40 text-xs mt-0.5 font-medium">Campus delivery activity this week</p>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-[#A7B8B0] text-xs font-semibold hover:text-white transition-colors cursor-pointer">
            This Week <ChevronDown size={14} />
          </div>
        </div>

        {/* Custom SVG Line Chart */}
        <div className="relative h-[180px] w-full mt-2">
          {/* Y-Axis Labels */}
          <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-white/30 text-[11px] font-mono pb-5">
            {uniqueYTicks.map((tick, i) => (
              <span key={i}>{tick}</span>
            ))}
          </div>

          <div className="ml-8 h-full relative overflow-hidden">
            {/* Grid lines */}
            {[0, 20, 40, 60, 80, 100].map((val, i) => (
              <div
                key={val}
                className="absolute left-0 right-0 border-b border-dashed border-white/5"
                style={{ bottom: `${(i / 5) * 100}%` }}
              />
            ))}

            {/* Hover Tooltip Overlay */}
            {hoveredIndex !== null && (
              <div
                className="absolute top-1 z-20 -translate-x-1/2 px-2.5 py-1 rounded-lg bg-emerald-950/90 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold shadow-lg pointer-events-none transition-all"
                style={{
                  left: `${(hoveredIndex / 6) * 100}%`,
                }}
              >
                {labels[hoveredIndex]}: {last7DaysData[hoveredIndex]} {last7DaysData[hoveredIndex] === 1 ? "order" : "orders"}
              </div>
            )}

            {/* Chart line and fill */}
            <svg viewBox="0 0 500 150" className="w-full h-[calc(100%-20px)]" preserveAspectRatio="none">
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
                </linearGradient>
              </defs>
              {total === 0 ? (
                <path
                  d="M 0,130 L 500,130"
                  fill="none"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="2"
                />
              ) : (
                <>
                  <path
                    d={fillPath}
                    fill="url(#chartGradient)"
                  />
                  <path
                    d={linePath}
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="2.5"
                    style={{ filter: "drop-shadow(0 0 8px rgba(16,185,129,0.5))" }}
                  />
                  {points.map((p, i) => (
                    <circle
                      key={i}
                      cx={p[0]}
                      cy={p[1]}
                      r={hoveredIndex === i ? 6 : 4}
                      fill={hoveredIndex === i ? "#34D399" : "#10B981"}
                      stroke="#050A07"
                      strokeWidth={hoveredIndex === i ? 2 : 1}
                      className="cursor-pointer transition-all"
                      onMouseEnter={() => setHoveredIndex(i)}
                      onMouseLeave={() => setHoveredIndex(null)}
                    />
                  ))}
                </>
              )}
            </svg>

            {/* X-Axis Labels */}
            <div className="absolute bottom-0 left-0 right-0 flex justify-between text-white/40 text-[11px] font-mono px-1">
              {labels.map((l, i) => (
                <span
                  key={i}
                  className={`cursor-pointer transition-colors ${hoveredIndex === i ? "text-emerald-400 font-bold" : ""}`}
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  {l}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Donut Chart Card */}
      <div className="bg-[#0b120e]/90 border border-white/10 hover:border-emerald-500/30 rounded-2xl sm:rounded-3xl p-5 sm:p-6 backdrop-blur-xl shadow-lg flex flex-col justify-between relative overflow-hidden transition-all group">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-white font-bold text-base tracking-tight">Requests by Status</h3>
          <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            {total} Total
          </span>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-6 flex-1 justify-center py-2">
          {/* Donut */}
          <div className="relative w-32 h-32 shrink-0">
            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
              {total === 0 ? (
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="3"
                />
              ) : (
                <>
                  {/* Completed */}
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="3.2"
                    strokeDasharray={`${completedPct}, 100`}
                    style={{ filter: "drop-shadow(0 0 6px rgba(16,185,129,0.5))" }}
                  />
                  {/* Cancelled */}
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="3.2"
                    strokeDasharray={`${cancelledPct}, 100`}
                    strokeDashoffset={`-${completedPct}`}
                  />
                  {/* In Progress */}
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#F59E0B"
                    strokeWidth="3.2"
                    strokeDasharray={`${inProgressPct}, 100`}
                    strokeDashoffset={`-${completedPct + cancelledPct}`}
                  />
                </>
              )}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-white text-2xl font-black font-mono tracking-tight">{total}</span>
              <span className="text-white/40 text-[10px] uppercase font-mono tracking-wider font-bold">Total</span>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-col gap-2.5 w-full sm:w-auto flex-1 text-xs">
            <div className="flex justify-between items-center p-2 rounded-lg bg-white/[0.02] border border-white/5">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
                <span className="text-white/80 font-medium">Completed</span>
              </div>
              <span className="text-white font-mono font-bold">{completedPct}%</span>
            </div>
            <div className="flex justify-between items-center p-2 rounded-lg bg-white/[0.02] border border-white/5">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.8)]" />
                <span className="text-white/80 font-medium">In Progress</span>
              </div>
              <span className="text-white font-mono font-bold">{inProgressPct}%</span>
            </div>
            <div className="flex justify-between items-center p-2 rounded-lg bg-white/[0.02] border border-white/5">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-400" />
                <span className="text-white/80 font-medium">Cancelled</span>
              </div>
              <span className="text-white font-mono font-bold">{cancelledPct}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
