"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  FileText, 
  Bike, 
  Wallet, 
  MessageSquare, 
  BarChart2, 
  User, 
  Settings,
  LogOut,
  Crown,
  Zap
} from "lucide-react";
import { LogoutButton } from "../auth/LogoutButton";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "My Requests", href: "/dashboard/requests", icon: FileText },
  { name: "Runner Mode", href: "/dashboard/runner", icon: Bike },
  { name: "Wallet", href: "/dashboard/wallet", icon: Wallet, dot: true },
  { name: "Chat", href: "/dashboard/chat", icon: MessageSquare },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart2 },
  { name: "Profile", href: "/dashboard/profile", icon: User },
  { name: "Setting", href: "/dashboard/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const isProfilePage = pathname === "/dashboard/profile";

  return (
    <aside style={{
      width: "240px",
      height: "100vh",
      position: "fixed",
      top: 0, left: 0,
      background: "#050A07",
      borderRight: "1px solid rgba(102,255,178,0.05)",
      display: "flex",
      flexDirection: "column",
      padding: "1.5rem 1rem",
      zIndex: 50,
    }}>
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "2rem", paddingLeft: "0.5rem" }}>
        <div style={{ 
          background: "#00E676", 
          borderRadius: "6px", 
          padding: "4px",
          display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <Zap size={16} color="#050A07" fill="#050A07" />
        </div>
        <span style={{ color: "#fff", fontWeight: 800, fontSize: "1.2rem", letterSpacing: "-0.5px" }}>UniVerse</span>
      </div>

      {/* Nav Links */}
      <nav style={{ display: "flex", flexDirection: "column", gap: "0.25rem", flex: 1 }}>
        {!isProfilePage && navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.name} href={item.href} style={{ textDecoration: "none" }}>
              <div style={{
                display: "flex", alignItems: "center", gap: "0.75rem",
                padding: "0.75rem 1rem",
                borderRadius: "12px",
                background: isActive ? "rgba(0,230,118,0.1)" : "transparent",
                color: isActive ? "#00E676" : "#A7B8B0",
                transition: "all 0.2s ease",
                fontWeight: isActive ? 700 : 500,
                fontSize: "0.875rem",
                position: "relative"
              }} className="hover:bg-[rgba(0,230,118,0.05)] hover:text-[#00E676]">
                <item.icon size={18} />
                <span>{item.name}</span>
                {item.dot && (
                  <div style={{ 
                    position: "absolute", right: "1rem", 
                    width: "6px", height: "6px", 
                    borderRadius: "50%", background: "#00E676",
                    boxShadow: "0 0 5px #00E676"
                  }} />
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Upgrade to Pro */}
      {!isProfilePage && (
        <div style={{
          background: "rgba(10,15,12,0.6)",
          border: "1px solid rgba(102,255,178,0.1)",
          borderRadius: "16px",
          padding: "1.25rem",
          marginBottom: "1rem",
          backdropFilter: "blur(10px)"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
            <Crown size={16} color="#F59E0B" />
            <h4 style={{ color: "#fff", fontWeight: 700, fontSize: "0.875rem" }}>Upgrade to Pro</h4>
          </div>
          <p style={{ color: "#A7B8B0", fontSize: "0.7rem", lineHeight: 1.4, marginBottom: "1rem" }}>
            Unlock more features and get unlimited requests.
          </p>
          <button style={{
            width: "100%",
            padding: "0.6rem",
            background: "linear-gradient(135deg, #00C853 0%, #00E676 100%)",
            color: "#000",
            border: "none",
            borderRadius: "8px",
            fontWeight: 800,
            fontSize: "0.8rem",
            cursor: "pointer",
            boxShadow: "0 0 15px rgba(0,230,118,0.3)",
            transition: "transform 0.2s"
          }} className="hover:scale-105">
            Upgrade Now
          </button>
        </div>
      )}

      {/* Logout */}
      <div style={{ paddingTop: "0.5rem", borderTop: "1px solid rgba(102,255,178,0.05)" }}>
        <LogoutButton 
          variant="ghost"
          className="w-full flex justify-start gap-3 items-center px-4 py-3 text-[#ef4444] hover:bg-[#ef4444]/10 hover:text-[#f87171] rounded-xl font-bold text-sm transition-colors"
        >
          <LogOut size={18} />
          Log out
        </LogoutButton>
      </div>
    </aside>
  );
}
