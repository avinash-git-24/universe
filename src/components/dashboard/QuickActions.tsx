"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Bike, User, Package, Wallet, MessageSquare, BarChart3, LogOut, Trash2 } from "lucide-react";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { createClient } from "@/lib/supabase/client";

const actions = [
  { href: "/request/new", label: "Create Request", icon: Plus, primary: true },
  { href: "/dashboard/requests", label: "My Requests", icon: Package },
  { href: "/dashboard/runner", label: "Runner Mode", icon: Bike },
  { href: "/dashboard/wallet", label: "Wallet", icon: Wallet },
  { href: "/dashboard/chat", label: "Chat", icon: MessageSquare },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/complete-profile", label: "Edit Profile", icon: User },
];

export function QuickActions() {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    const ok = window.confirm("Delete your account permanently? This cannot be undone.");
    if (!ok) return;
    setIsDeleting(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.rpc("delete_own_account");
      if (error) { alert("Failed: " + error.message); setIsDeleting(false); return; }
      await supabase.auth.signOut();
      window.location.href = "/login";
    } catch { setIsDeleting(false); }
  };

  return (
    <div style={{
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: "24px",
      padding: "1.5rem",
      backdropFilter: "blur(20px)",
    }}>
      <h3 style={{ color: "var(--color-foreground)", fontWeight: 700, fontSize: "1rem", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "linear-gradient(135deg, #10b981, #059669)", display: "inline-block" }} />
        Quick Actions
      </h3>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {actions.map(({ href, label, icon: Icon, primary }) => (
          <Link key={href} href={href}>
            <div style={{
              display: "flex", alignItems: "center", gap: "0.75rem",
              padding: "0.75rem 1rem",
              borderRadius: "14px",
              background: primary
                ? "linear-gradient(135deg, #10b981 0%, #059669 100%)"
                : "rgba(255,255,255,0.04)",
              border: primary ? "none" : "1px solid rgba(255,255,255,0.07)",
              cursor: "pointer",
              transition: "all 0.2s ease",
              color: primary ? "#fff" : "var(--color-foreground)",
            }}
              className={primary ? "hover:opacity-90" : "hover:bg-white/10 hover:border-emerald-500/30"}
            >
              <div style={{
                width: "32px", height: "32px", borderRadius: "10px",
                background: primary ? "rgba(255,255,255,0.2)" : "rgba(16,185,129,0.15)",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
                <Icon size={16} color={primary ? "#fff" : "#10b981"} />
              </div>
              <span style={{ fontWeight: 600, fontSize: "0.875rem" }}>{label}</span>
            </div>
          </Link>
        ))}

        {/* Logout */}
        <div style={{ marginTop: "0.5rem", paddingTop: "0.75rem", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
          <LogoutButton
            variant="ghost"
            className="w-full justify-start h-11 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-[14px] font-semibold"
          />
          <button
            onClick={handleDeleteAccount}
            disabled={isDeleting}
            style={{
              width: "100%", marginTop: "0.4rem",
              display: "flex", alignItems: "center", gap: "0.6rem",
              padding: "0.65rem 1rem",
              borderRadius: "14px",
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.2)",
              color: "#f87171",
              fontWeight: 600, fontSize: "0.875rem",
              cursor: isDeleting ? "not-allowed" : "pointer",
              opacity: isDeleting ? 0.6 : 1,
              transition: "all 0.2s",
            }}
          >
            <Trash2 size={15} />
            {isDeleting ? "Deleting..." : "Delete Account"}
          </button>
        </div>
      </div>
    </div>
  );
}
