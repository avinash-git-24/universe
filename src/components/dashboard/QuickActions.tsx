"use client";

import Link from "next/link";
import { Plus, ChevronRight, FileText, Bike, Wallet, MessageSquare, BarChart2 } from "lucide-react";

export function QuickActions() {
  const actions = [
    { label: "My Requests", icon: FileText, href: "/dashboard/requests" },
    { label: "Runner Mode", icon: Bike, href: "/dashboard/runner" },
    { label: "Wallet", icon: Wallet, href: "/dashboard/wallet" },
    { label: "Chat Support", icon: MessageSquare, href: "/dashboard/chat" },
    { label: "Analytics", icon: BarChart2, href: "/dashboard/analytics" },
  ];

  return (
    <div style={{
      background: "rgba(10,15,12,0.4)",
      borderRadius: "24px",
      padding: "1.5rem",
      border: "1px solid rgba(102,255,178,0.1)",
      backdropFilter: "blur(20px)",
      boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
      display: "flex", flexDirection: "column", gap: "1rem"
    }}>
      <h3 style={{ color: "#fff", fontWeight: 800, fontSize: "1.05rem", marginBottom: "0.5rem" }}>Quick Actions</h3>

      <Link href="/request/new" style={{ textDecoration: "none" }}>
        <button style={{
          width: "100%",
          display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
          background: "#00E676", color: "#000", fontWeight: 800, fontSize: "0.85rem",
          border: "none", borderRadius: "12px", padding: "0.8rem", cursor: "pointer",
          boxShadow: "0 0 15px rgba(0,230,118,0.3)"
        }} className="hover:bg-[#00C853] transition-colors">
          <Plus size={16} /> Create New Request
        </button>
      </Link>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "0.5rem" }}>
        {actions.map((action, i) => (
          <Link key={i} href={action.href} style={{ textDecoration: "none" }}>
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "0.85rem", borderRadius: "12px",
              background: "rgba(255,255,255,0.02)",
              transition: "all 0.2s"
            }} className="hover:bg-[rgba(0,230,118,0.05)] group">
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <action.icon size={16} color="#00E676" />
                <span style={{ color: "#A7B8B0", fontSize: "0.85rem", fontWeight: 600 }} className="group-hover:text-[#00E676]">{action.label}</span>
              </div>
              <ChevronRight size={16} color="rgba(255,255,255,0.2)" className="group-hover:text-[#00E676]" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
