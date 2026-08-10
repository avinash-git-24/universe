"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  Wallet, 
  MessageSquare, 
  BarChart2, 
  User, 
  Settings,
  X
} from "lucide-react";
import { LogOut, Crown, Zap, FileText, Bike } from "lucide-react";
import { LogoutButton } from "../auth/LogoutButton";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

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
  const router = useRouter();
  const isProfilePage = pathname === "/dashboard/profile";
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Toast Notification State
  const [toast, setToast] = useState<{ id: string, message: string, conversationId: string } | null>(null);

  useEffect(() => {
    const supabase = createClient();
    let userId = "";

    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      userId = user.id;

      const { data: participants } = await supabase
        .from("conversation_participants")
        .select("conversation_id, last_read_at")
        .eq("profile_id", userId);

      if (participants && participants.length > 0) {
        let totalUnread = 0;
        
        for (const p of participants) {
          const lastRead = p.last_read_at ? new Date(p.last_read_at).toISOString() : new Date(0).toISOString();
          const { count, error } = await supabase
            .from("messages")
            .select("*", { count: 'exact', head: true })
            .eq("conversation_id", p.conversation_id)
            .neq("sender_id", userId)
            .gt("created_at", lastRead);
            
          if (!error && count) {
            totalUnread += count;
          }
        }
        setUnreadCount(totalUnread);
      }
    }

    init();

    const channel = supabase
      .channel("sidebar_unread")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        async (payload) => {
          if (payload.new.sender_id !== userId) {
            setUnreadCount(c => c + 1);
            
            // Fetch sender info for the toast
            const { data: senderProfile } = await supabase
              .from('profiles')
              .select('full_name')
              .eq('id', payload.new.sender_id)
              .single();
              
            const senderName = senderProfile?.full_name || 'Someone';
            const msgContent = payload.new.image_url ? 'Sent an image 📷' : payload.new.content;
            
            setToast({
              id: payload.new.id,
              message: `${senderName}: ${msgContent}`,
              conversationId: payload.new.conversation_id
            });
            
            // Auto hide toast after 5s
            setTimeout(() => {
              setToast(current => current?.id === payload.new.id ? null : current);
            }, 5000);
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "conversation_participants" },
        (payload) => {
          if (payload.new.profile_id === userId) {
            init();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <>
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-[100] bg-[#0d1310] border border-[#10b981]/30 p-4 rounded-xl shadow-2xl flex items-start gap-4 min-w-[280px] max-w-[400px] animate-in slide-in-from-top-10 fade-in duration-300">
          <div 
            className="flex-1 cursor-pointer"
            onClick={() => {
              router.push(`/dashboard/chat?id=${toast.conversationId}`);
              setToast(null);
            }}
          >
            <p className="text-sm font-bold text-white mb-1">New Message</p>
            <p className="text-xs text-white/70 line-clamp-2">{toast.message}</p>
          </div>
          <button 
            onClick={() => setToast(null)}
            className="text-white/40 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

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
                  {item.name === "Chat" && unreadCount > 0 && (
                    <div style={{
                      marginLeft: "auto",
                      background: "#00E676",
                      color: "#050A07",
                      fontSize: "0.7rem",
                      fontWeight: 800,
                      padding: "2px 6px",
                      borderRadius: "10px",
                      boxShadow: "0 0 10px rgba(0,230,118,0.4)"
                    }}>
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </div>
                  )}
                  {item.dot && item.name !== "Chat" && (
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
    </>
  );
}
