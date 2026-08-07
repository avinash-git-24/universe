import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CreateRequestForm } from "@/components/request/CreateRequestForm";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { Plus, Zap } from "lucide-react";
import Link from "next/link";
import { RealtimeProvider } from "@/providers/RealtimeProvider";

export default async function NewRequestPage() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login?redirectTo=/request/new");
  }

  return (
    <RealtimeProvider userId={user.id}>
      <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#050805", padding: "2rem" }}>
        <main style={{ flex: 1, width: "100%" }}>
          
          {/* Top Bar */}
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3rem", alignItems: "center" }}>
            
            {/* Logo */}
            <Link href="/dashboard" style={{ textDecoration: "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <div style={{ 
                  background: "#00E676", 
                  borderRadius: "6px", 
                  padding: "4px",
                  display: "flex", alignItems: "center", justifyContent: "center"
                }}>
                  <Zap size={16} color="#050805" fill="#050805" />
                </div>
                <span style={{ color: "#fff", fontWeight: 800, fontSize: "1.2rem", letterSpacing: "-0.5px" }}>UniVerse</span>
              </div>
            </Link>

            {/* Right Actions */}
            <div style={{ display: "flex", gap: "1.25rem", alignItems: "center" }}>
              {/* Bell */}
              <div style={{ position: "relative", background: "rgba(10,15,12,0.4)", border: "1px solid rgba(102,255,178,0.1)", padding: "0.65rem", borderRadius: "12px", backdropFilter: "blur(10px)" }}>
                <NotificationBell />
                <div style={{ position: "absolute", top: "-5px", right: "-5px", background: "#00E676", color: "#000", fontSize: "0.65rem", fontWeight: 800, width: "18px", height: "18px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>3</div>
              </div>
              {/* Button */}
              <Link href="/request/new" style={{ textDecoration: "none" }}>
                <button style={{ 
                  display: "flex", alignItems: "center", gap: "0.5rem",
                  background: "rgba(0,230,118,0.15)", color: "#00E676", fontWeight: 700, fontSize: "0.85rem",
                  border: "1px solid rgba(0,230,118,0.3)", borderRadius: "12px", padding: "0.7rem 1.25rem", cursor: "pointer",
                }}>
                  <Plus size={16} /> New Request
                </button>
              </Link>
            </div>
          </div>

          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
            <h1 style={{ fontSize: "2.5rem", fontWeight: 800, color: "#fff", marginBottom: "0.5rem", letterSpacing: "-0.5px" }}>
              Create <span style={{ color: "#00E676" }}>Request</span>
            </h1>
            <p style={{ color: "#A7B8B0", fontSize: "0.95rem" }}>
              Tell us what you need and where to deliver it.
            </p>
          </div>
          
          {/* Main Form */}
          <CreateRequestForm requesterId={user.id} />
        </main>
      </div>
    </RealtimeProvider>
  );
}
