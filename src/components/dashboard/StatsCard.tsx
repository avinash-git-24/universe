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
  return (
    <div
      style={{
        background: gradient,
        borderRadius: "24px",
        padding: "1.5rem",
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 8px 32px rgba(0,0,0,0.4), 0 2px 8px rgba(0,0,0,0.5)",
        border: "1px solid rgba(102,255,178,0.1)",
        backdropFilter: "blur(20px)",
        transition: "all 0.3s ease",
      }}
      className="group hover:scale-[1.03] hover:border-[#00E676]/40 hover:shadow-[0_10px_40px_rgba(0,230,118,0.15)]"
    >
      {/* Background glow */}
      <div style={{
        position: "absolute", top: "-30px", right: "-30px",
        width: "100px", height: "100px",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(0,230,118,0.15) 0%, transparent 70%)",
        filter: "blur(20px)",
      }} className="group-hover:bg-[rgba(0,230,118,0.25)] transition-colors duration-500" />
      <div style={{
        position: "absolute", bottom: "-20px", left: "-20px",
        width: "80px", height: "80px",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(102,255,178,0.1) 0%, transparent 70%)",
        filter: "blur(15px)",
      }} />

      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", position: "relative", zIndex: 1 }}>
        <div>
          <p style={{ color: "#A7B8B0", fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: "0.5rem" }}>
            {label}
          </p>
          <p style={{ color: "#fff", fontSize: "2.4rem", fontWeight: 800, lineHeight: 1, marginBottom: "0.35rem" }} className="group-hover:text-[#00E676] group-hover:drop-shadow-[0_0_15px_rgba(0,230,118,0.5)] transition-all duration-300">
            {value}
          </p>
          {trend && (
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.72rem", fontWeight: 600 }}>{trend}</p>
          )}
        </div>
        <div style={{
          width: "48px", height: "48px",
          borderRadius: "14px",
          background: iconBg,
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
          border: "1px solid rgba(0,230,118,0.2)",
        }} className="group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(0,230,118,0.4)] transition-all duration-300">
          <Icon size={22} color="#00E676" />
        </div>
      </div>
    </div>
  );
});
