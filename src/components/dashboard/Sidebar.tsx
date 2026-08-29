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
  X,
  Menu,
  ShoppingBag,
  Home,
  LogOut, 
  Crown, 
  Zap, 
  FileText, 
  Bike 
} from "lucide-react";
import { LogoutButton } from "../auth/LogoutButton";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState, useCallback } from "react";

const navItems = [
  { name: "Home", href: "/", icon: Home },
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "My Requests", href: "/dashboard/requests", icon: FileText },
  { name: "Runner Mode", href: "/dashboard/runner", icon: Bike },
  { name: "Wallet", href: "/dashboard/wallet", icon: Wallet, dot: true },
  { name: "Marketplace", href: "/dashboard/marketplace", icon: ShoppingBag },
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
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  
  // Toast Notification State
  const [toast, setToast] = useState<{ id: string; message: string; conversationId: string } | null>(null);

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  // Handle Escape key to close mobile drawer
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsMobileOpen(false);
    }
  }, []);

  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMobileOpen, handleKeyDown]);

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

  const renderNavLinks = (onItemClick?: () => void) => (
    <nav className="flex flex-col gap-1 flex-1 py-2 overflow-y-auto">
      {!isProfilePage && navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link 
            key={item.name} 
            href={item.href} 
            onClick={onItemClick}
            className="no-underline"
          >
            <div 
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium relative ${
                isActive 
                  ? "bg-[#00E676]/10 text-[#00E676] font-bold" 
                  : "text-[#A7B8B0] hover:bg-[#00E676]/5 hover:text-[#00E676]"
              }`}
            >
              <item.icon size={18} className="shrink-0" />
              <span className="truncate">{item.name}</span>
              {item.name === "Chat" && unreadCount > 0 && (
                <div className="ml-auto bg-[#00E676] text-[#050A07] text-[11px] font-black px-1.5 py-0.5 rounded-full shadow-[0_0_10px_rgba(0,230,118,0.4)]">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </div>
              )}
              {item.dot && item.name !== "Chat" && (
                <div className="absolute right-4 w-1.5 h-1.5 rounded-full bg-[#00E676] shadow-[0_0_5px_#00E676]" />
              )}
            </div>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* ── Toast Notification ── */}
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
            aria-label="Close notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── Mobile Top Bar (<1024px) ── */}
      <header className="lg:hidden sticky top-0 left-0 right-0 z-30 bg-[#050A07]/95 backdrop-blur-xl border-b border-[#66FFB2]/10 px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 no-underline">
          <div className="bg-[#00E676] rounded-md p-1 flex items-center justify-center">
            <Zap size={16} color="#050A07" fill="#050A07" />
          </div>
          <span className="text-white font-extrabold text-lg tracking-tight">UniVerse</span>
        </Link>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Link 
              href="/dashboard/chat" 
              className="px-2.5 py-1 rounded-full bg-[#00E676]/15 border border-[#00E676]/30 text-[#00E676] text-xs font-bold flex items-center gap-1.5"
            >
              <MessageSquare size={13} />
              <span>{unreadCount}</span>
            </Link>
          )}

          <button
            onClick={() => setIsMobileOpen(true)}
            aria-label="Open Navigation Menu"
            className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white flex items-center justify-center transition-colors active:scale-95"
          >
            <Menu size={20} />
          </button>
        </div>
      </header>

      {/* ── Mobile Drawer Backdrop & Slide-out Menu (<1024px) ── */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm lg:hidden animate-in fade-in duration-200"
          onClick={() => setIsMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-[280px] max-w-[85vw] bg-[#050A07] border-r border-[#66FFB2]/15 p-6 flex flex-col justify-between shadow-2xl transition-transform duration-300 ease-out lg:hidden ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="Mobile Dashboard Navigation"
      >
        {/* Drawer Header */}
        <div>
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#66FFB2]/10">
            <Link href="/" onClick={() => setIsMobileOpen(false)} className="flex items-center gap-2 no-underline">
              <div className="bg-[#00E676] rounded-md p-1 flex items-center justify-center">
                <Zap size={16} color="#050A07" fill="#050A07" />
              </div>
              <span className="text-white font-extrabold text-lg tracking-tight">UniVerse</span>
            </Link>

            <button
              onClick={() => setIsMobileOpen(false)}
              aria-label="Close Navigation Menu"
              className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white flex items-center justify-center transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Nav links */}
          {renderNavLinks(() => setIsMobileOpen(false))}
        </div>

        {/* Drawer Footer */}
        <div className="pt-4 border-t border-[#66FFB2]/10 space-y-4">
          {!isProfilePage && (
            <div className="bg-[#0A0F0C]/80 border border-[#66FFB2]/15 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-1.5">
                <Crown size={15} color="#F59E0B" />
                <h4 className="text-white font-bold text-xs">Upgrade to Pro</h4>
              </div>
              <p className="text-[#A7B8B0] text-[11px] leading-relaxed mb-3">
                Unlock unlimited requests & priority perks.
              </p>
              <button 
                className="w-full py-2 bg-gradient-to-r from-[#00C853] to-[#00E676] text-black font-extrabold text-xs rounded-lg shadow-[0_0_12px_rgba(0,230,118,0.3)] active:scale-95 transition-transform"
              >
                Upgrade Now
              </button>
            </div>
          )}

          <LogoutButton 
            variant="ghost"
            className="w-full flex justify-start gap-3 items-center px-4 py-3 text-[#ef4444] hover:bg-[#ef4444]/10 hover:text-[#f87171] rounded-xl font-bold text-sm transition-colors"
          >
            <LogOut size={18} />
            Log out
          </LogoutButton>
        </div>
      </aside>

      {/* ── Desktop Fixed Sidebar (>=1024px) ── */}
      <aside 
        className="hidden lg:flex fixed top-0 left-0 w-[240px] h-screen bg-[#050A07] border-r border-[#66FFB2]/5 flex-col p-6 z-40"
        aria-label="Desktop Dashboard Navigation"
      >
        {/* Logo */}
        <Link href="/" className="no-underline">
          <div className="flex items-center gap-2 mb-8 pl-1">
            <div className="bg-[#00E676] rounded-md p-1 flex items-center justify-center">
              <Zap size={16} color="#050A07" fill="#050A07" />
            </div>
            <span className="text-white font-extrabold text-xl tracking-tight">UniVerse</span>
          </div>
        </Link>

        {/* Desktop Nav links */}
        {renderNavLinks()}

        {/* Upgrade to Pro */}
        {!isProfilePage && (
          <div className="bg-[#0A0F0C]/80 border border-[#66FFB2]/10 rounded-2xl p-4 mb-4 backdrop-blur-md">
            <div className="flex items-center gap-2 mb-1.5">
              <Crown size={15} color="#F59E0B" />
              <h4 className="text-white font-bold text-xs">Upgrade to Pro</h4>
            </div>
            <p className="text-[#A7B8B0] text-[11px] leading-relaxed mb-3">
              Unlock more features and get unlimited requests.
            </p>
            <button className="w-full py-2 bg-gradient-to-r from-[#00C853] to-[#00E676] text-black font-extrabold text-xs rounded-lg shadow-[0_0_15px_rgba(0,230,118,0.25)] hover:scale-105 transition-transform">
              Upgrade Now
            </button>
          </div>
        )}

        {/* Logout */}
        <div className="pt-2 border-t border-[#66FFB2]/5">
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

