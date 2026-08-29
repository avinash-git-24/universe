"use client";

import { ChevronDown } from "lucide-react";

import type { StudentRequestWithDetails } from "@/lib/database/requests";

interface DashboardChartsProps {
  requests: StudentRequestWithDetails[];
}

export function DashboardCharts({ requests }: DashboardChartsProps) {
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
      <div className="bg-[#0a0f0c]/40 border border-[#66ffb2]/10 rounded-[20px] sm:rounded-[24px] p-4 sm:p-6 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <h3 style={{ color: "#fff", fontWeight: 700, fontSize: "1.05rem" }}>Overview Analytics</h3>
          <div style={{
            display: "flex", alignItems: "center", gap: "0.5rem",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "10px", padding: "0.3rem 0.6rem",
            fontSize: "0.75rem", color: "#A7B8B0", cursor: "pointer"
          }}>
            This Week <ChevronDown size={14} />
          </div>
        </div>

        {/* Custom SVG Line Chart */}
        <div style={{ position: "relative", height: "180px", width: "100%", marginTop: "1rem" }}>
          {/* Y-Axis Labels */}
          <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, display: "flex", flexDirection: "column", justifyContent: "space-between", color: "rgba(255,255,255,0.4)", fontSize: "0.7rem", paddingBottom: "20px" }}>
            {uniqueYTicks.map((tick, i) => (
              <span key={i}>{tick}</span>
            ))}
          </div>

          <div style={{ marginLeft: "30px", height: "100%", position: "relative" }}>
            {/* Grid lines */}
            {[0, 20, 40, 60, 80, 100].map((val, i) => (
              <div key={val} style={{
                position: "absolute",
                bottom: `${(i / 5) * 100}%`,
                left: 0, right: 0,
                borderBottom: "1px dashed rgba(255,255,255,0.05)"
              }} />
            ))}

            {/* Chart line and fill */}
            <svg viewBox="0 0 500 150" style={{ width: "100%", height: "calc(100% - 20px)", overflow: "visible" }} preserveAspectRatio="none">
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00E676" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#00E676" stopOpacity="0" />
                </linearGradient>
              </defs>
              {total === 0 ? (
                <path
                  d="M 0,130 L 500,130"
                  fill="none"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="2.5"
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
                    stroke="#00E676"
                    strokeWidth="2.5"
                    style={{ filter: "drop-shadow(0 0 8px rgba(0,230,118,0.5))" }}
                  />
                  {points.map((p, i) => (
                    <circle key={i} cx={p[0]} cy={p[1]} r="3" fill="#00E676" />
                  ))}
                </>
              )}
            </svg>

            {/* X-Axis Labels */}
            <div style={{ position: "absolute", bottom: "-5px", left: 0, right: 0, display: "flex", justifyContent: "space-between", color: "rgba(255,255,255,0.4)", fontSize: "0.7rem", padding: "0 10px" }}>
              {labels.map((l, i) => (
                <span key={i}>{l}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Donut Chart Card */}
      <div className="bg-[#0a0f0c]/40 border border-[#66ffb2]/10 rounded-[20px] sm:rounded-[24px] p-4 sm:p-6 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] flex flex-col">
        <h3 style={{ color: "#fff", fontWeight: 700, fontSize: "1.05rem", marginBottom: "1.5rem" }}>Requests by Status</h3>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 flex-1">
          {/* Donut */}
          <div style={{ position: "relative", width: "130px", height: "130px" }}>
            <svg viewBox="0 0 36 36" style={{ width: "100%", height: "100%", transform: "rotate(-90deg)" }}>
              {total === 0 ? (
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3"
                />
              ) : (
                <>
                  {/* Completed */}
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none" stroke="#00E676" strokeWidth="3"
                    strokeDasharray={`${completedPct}, 100`}
                    style={{ filter: "drop-shadow(0 0 4px rgba(0,230,118,0.4))" }}
                  />
                  {/* Cancelled */}
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none" stroke="#ef4444" strokeWidth="3"
                    strokeDasharray={`${cancelledPct}, 100`} strokeDashoffset={`-${completedPct}`}
                  />
                  {/* In Progress */}
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none" stroke="#F59E0B" strokeWidth="3"
                    strokeDasharray={`${inProgressPct}, 100`} strokeDashoffset={`-${completedPct + cancelledPct}`}
                  />
                </>
              )}
            </svg>
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "#fff", fontSize: "1.5rem", fontWeight: 800 }}>{total}</span>
              <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.65rem" }}>Total</span>
            </div>
          </div>

          {/* Legend */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem", flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.75rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#00E676" }} />
                <span style={{ color: "rgba(255,255,255,0.8)" }}>Completed</span>
              </div>
              <span style={{ color: "#fff", fontWeight: 700 }}>{completedPct}%</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.75rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#F59E0B" }} />
                <span style={{ color: "rgba(255,255,255,0.8)" }}>In Progress</span>
              </div>
              <span style={{ color: "#fff", fontWeight: 700 }}>{inProgressPct}%</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.75rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#ef4444" }} />
                <span style={{ color: "rgba(255,255,255,0.8)" }}>Cancelled</span>
              </div>
              <span style={{ color: "#fff", fontWeight: 700 }}>{cancelledPct}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
