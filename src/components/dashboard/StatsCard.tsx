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
  gradient = "linear-gradient(135deg, #064e3b 0%, #059669 100%)",
  iconBg = "rgba(255,255,255,0.2)",
  trend,
}: StatsCardProps) {
  return (
    <div
      style={{
        background: gradient,
        borderRadius: "20px",
        padding: "1.5rem",
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)",
        border: "1px solid rgba(255,255,255,0.15)",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
      }}
      className="group hover:scale-[1.03] hover:shadow-2xl"
    >
      {/* Background glow */}
      <div style={{
        position: "absolute", top: "-30px", right: "-30px",
        width: "100px", height: "100px",
        borderRadius: "50%",
        background: "rgba(255,255,255,0.08)",
        filter: "blur(20px)",
      }} />
      <div style={{
        position: "absolute", bottom: "-20px", left: "-20px",
        width: "80px", height: "80px",
        borderRadius: "50%",
        background: "rgba(255,255,255,0.06)",
        filter: "blur(15px)",
      }} />

      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", position: "relative", zIndex: 1 }}>
        <div>
          <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "0.78rem", fontWeight: 500, letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: "0.5rem" }}>
            {label}
          </p>
          <p style={{ color: "#fff", fontSize: "2.4rem", fontWeight: 800, lineHeight: 1, marginBottom: "0.35rem" }}>
            {value}
          </p>
          {trend && (
            <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.72rem", fontWeight: 500 }}>{trend}</p>
          )}
        </div>
        <div style={{
          width: "48px", height: "48px",
          borderRadius: "14px",
          background: iconBg,
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        }}>
          <Icon size={22} color="#fff" />
        </div>
      </div>
    </div>
  );
});
