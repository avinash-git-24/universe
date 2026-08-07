"use client";

import { ChevronDown } from "lucide-react";

export function DashboardCharts() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1.8fr 1fr", gap: "1rem" }}>
      {/* Line Chart Card */}
      <div style={{
        background: "rgba(10,15,12,0.4)",
        border: "1px solid rgba(102,255,178,0.1)",
        borderRadius: "24px",
        padding: "1.5rem",
        backdropFilter: "blur(20px)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.3)"
      }}>
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
            <span>100</span><span>80</span><span>60</span><span>40</span><span>20</span><span>0</span>
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
              <path
                d="M 0,130 C 50,110 100,60 150,70 C 200,80 230,90 280,60 C 330,30 380,80 430,50 C 480,20 500,10 500,10 L 500,150 L 0,150 Z"
                fill="url(#chartGradient)"
              />
              <path
                d="M 0,130 C 50,110 100,60 150,70 C 200,80 230,90 280,60 C 330,30 380,80 430,50 C 480,20 500,10 500,10"
                fill="none"
                stroke="#00E676"
                strokeWidth="2.5"
                style={{ filter: "drop-shadow(0 0 8px rgba(0,230,118,0.5))" }}
              />
              <circle cx="150" cy="70" r="3" fill="#00E676" />
            </svg>

            {/* X-Axis Labels */}
            <div style={{ position: "absolute", bottom: "-5px", left: 0, right: 0, display: "flex", justifyContent: "space-between", color: "rgba(255,255,255,0.4)", fontSize: "0.7rem", padding: "0 10px" }}>
              <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
            </div>
          </div>
        </div>
      </div>

      {/* Donut Chart Card */}
      <div style={{
        background: "rgba(10,15,12,0.4)",
        border: "1px solid rgba(102,255,178,0.1)",
        borderRadius: "24px",
        padding: "1.5rem",
        backdropFilter: "blur(20px)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
        display: "flex", flexDirection: "column"
      }}>
        <h3 style={{ color: "#fff", fontWeight: 700, fontSize: "1.05rem", marginBottom: "1.5rem" }}>Requests by Status</h3>
        
        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", flex: 1 }}>
          {/* Donut */}
          <div style={{ position: "relative", width: "130px", height: "130px" }}>
            <svg viewBox="0 0 36 36" style={{ width: "100%", height: "100%", transform: "rotate(-90deg)" }}>
              {/* Completed: 75% */}
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none" stroke="#00E676" strokeWidth="3"
                strokeDasharray="75, 100"
                style={{ filter: "drop-shadow(0 0 4px rgba(0,230,118,0.4))" }}
              />
              {/* Cancelled: 13% */}
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none" stroke="#ef4444" strokeWidth="3"
                strokeDasharray="13, 100" strokeDashoffset="-75"
              />
              {/* In Progress: 12% */}
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none" stroke="#F59E0B" strokeWidth="3"
                strokeDasharray="12, 100" strokeDashoffset="-88"
              />
            </svg>
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "#fff", fontSize: "1.5rem", fontWeight: 800 }}>128</span>
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
              <span style={{ color: "#fff", fontWeight: 700 }}>75%</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.75rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#F59E0B" }} />
                <span style={{ color: "rgba(255,255,255,0.8)" }}>In Progress</span>
              </div>
              <span style={{ color: "#fff", fontWeight: 700 }}>12%</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.75rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#ef4444" }} />
                <span style={{ color: "rgba(255,255,255,0.8)" }}>Cancelled</span>
              </div>
              <span style={{ color: "#fff", fontWeight: 700 }}>13%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
