"use client";

import Link from "next/link";
import { Mail, Phone, Edit } from "lucide-react";
import type { Profile } from "@/lib/database/requests";

interface ProfileSummaryProps {
  profile: Profile;
  email: string;
}

export function ProfileSummary({ profile, email }: ProfileSummaryProps) {
  const name = profile?.full_name || email?.split("@")[0] || "Student";
  const initial = name.charAt(0).toUpperCase();

  return (
    <div style={{
      background: "rgba(10,15,12,0.4)",
      borderRadius: "24px",
      padding: "1.5rem",
      border: "1px solid rgba(102,255,178,0.1)",
      backdropFilter: "blur(20px)",
      boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
      position: "relative",
      overflow: "hidden",
      display: "flex", flexDirection: "column", gap: "1.25rem"
    }}>
      {/* Subtle top-right glow */}
      <div style={{
        position: "absolute", top: "-30px", right: "-30px", width: "100px", height: "100px",
        background: "radial-gradient(circle, rgba(0,230,118,0.2) 0%, transparent 70%)",
        borderRadius: "50%"
      }} />

      {/* Avatar and Name */}
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", position: "relative", zIndex: 1 }}>
        <div style={{
          width: "48px", height: "48px", borderRadius: "50%",
          background: "#00E676", color: "#000",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontWeight: 800, fontSize: "1.2rem",
          boxShadow: "0 0 15px rgba(0,230,118,0.4)"
        }}>
          {initial}
        </div>
        <div>
          <h3 style={{ color: "#fff", fontWeight: 800, fontSize: "1rem", marginBottom: "0.25rem" }}>{name}</h3>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "0.3rem",
            background: "rgba(255,255,255,0.05)", padding: "0.15rem 0.5rem", borderRadius: "10px",
            border: "1px solid rgba(255,255,255,0.1)"
          }}>
            <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#00E676" }} />
            <span style={{ color: "#A7B8B0", fontSize: "0.65rem", fontWeight: 700 }}>Student</span>
          </div>
        </div>
      </div>

      {/* Contact Info */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <Mail size={14} color="#00E676" />
          <span style={{ color: "#A7B8B0", fontSize: "0.8rem" }}>{email || "No email provided"}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <Phone size={14} color="#00E676" />
          <span style={{ color: "#A7B8B0", fontSize: "0.8rem" }}>{(profile as Record<string, unknown>)?.phone_number as string | undefined || "Add phone number"}</span>
        </div>
      </div>

      {/* Edit Profile Button */}
      <Link href="/dashboard/profile" style={{ textDecoration: "none", position: "relative", zIndex: 1 }}>
        <button style={{
          width: "100%",
          display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
          background: "rgba(0,230,118,0.05)", color: "#00E676", fontWeight: 700, fontSize: "0.85rem",
          border: "1px solid rgba(0,230,118,0.2)", borderRadius: "12px", padding: "0.6rem", cursor: "pointer",
          transition: "all 0.2s"
        }} className="hover:bg-[rgba(0,230,118,0.1)] hover:border-[rgba(0,230,118,0.4)]">
          <Edit size={14} /> Edit Profile
        </button>
      </Link>
    </div>
  );
}
