"use client";

import Link from "next/link";
import { User, Mail, Hash, MapPin, ExternalLink } from "lucide-react";
import type { Profile } from "@/lib/database/requests";

interface ProfileSummaryProps {
  profile?: Profile | null;
  email: string;
}

const rows = [
  { icon: User,    label: "Name",              field: "full_name" as const },
  { icon: Mail,    label: "Email",             field: "email" as const },
  { icon: Hash,    label: "Enrollment No.",    field: "enrollment_number" as const },
];

export function ProfileSummary({ profile, email }: ProfileSummaryProps) {
  const values: Record<string, string> = {
    full_name: profile?.full_name ?? "",
    email,
    enrollment_number: profile?.enrollment_number ?? "",
  };

  const initials = (profile?.full_name ?? email)
    .split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) || "?";

  return (
    <div style={{
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: "24px",
      overflow: "hidden",
      backdropFilter: "blur(20px)",
    }}>
      {/* Header banner */}
      <div style={{
        background: "linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%)",
        padding: "1.5rem",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Decorative circles */}
        <div style={{ position: "absolute", top: "-20px", right: "-20px", width: "100px", height: "100px", borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
        <div style={{ position: "absolute", bottom: "-30px", left: "30%", width: "80px", height: "80px", borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />

        <div style={{ display: "flex", alignItems: "center", gap: "1rem", position: "relative", zIndex: 1 }}>
          {/* Avatar */}
          <div style={{
            width: "56px", height: "56px", borderRadius: "50%",
            background: "linear-gradient(135deg, #10b981, #059669)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "1.2rem", fontWeight: 800, color: "#fff",
            boxShadow: "0 4px 16px rgba(16,185,129,0.4)",
            border: "3px solid rgba(255,255,255,0.2)",
            flexShrink: 0,
          }}>
            {initials}
          </div>
          <div>
            <p style={{ color: "#fff", fontWeight: 700, fontSize: "1rem" }}>
              {profile?.full_name ?? "Set your name"}
            </p>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: "0.3rem",
              background: "rgba(255,255,255,0.15)", borderRadius: "20px",
              padding: "0.2rem 0.6rem", marginTop: "0.25rem",
            }}>
              <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#6ee7b7" }} />
              <span style={{ color: "rgba(255,255,255,0.9)", fontSize: "0.72rem", fontWeight: 600, textTransform: "capitalize" }}>
                {profile?.role ?? "student"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Fields */}
      <div style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.875rem" }}>
        {rows.map(({ icon: Icon, label, field }) => (
          <div key={field} style={{ display: "flex", alignItems: "center", gap: "0.875rem" }}>
            <div style={{
              width: "34px", height: "34px", borderRadius: "10px",
              background: "rgba(16,185,129,0.12)",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              <Icon size={15} color="#10b981" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.4)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                {label}
              </p>
              <p style={{
                fontSize: "0.875rem", fontWeight: 600,
                color: values[field] ? "var(--color-foreground)" : "rgba(255,255,255,0.25)",
                marginTop: "0.15rem",
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>
                {values[field] || "Not set"}
              </p>
            </div>
          </div>
        ))}

        <Link href="/complete-profile" style={{ textDecoration: "none", marginTop: "0.25rem" }}>
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
            padding: "0.7rem",
            borderRadius: "14px",
            background: "rgba(16,185,129,0.1)",
            border: "1px solid rgba(16,185,129,0.25)",
            color: "#10b981",
            fontWeight: 600, fontSize: "0.85rem",
            cursor: "pointer",
            transition: "all 0.2s",
          }} className="hover:bg-emerald-500/20">
            <ExternalLink size={14} />
            Edit Profile
          </div>
        </Link>
      </div>
    </div>
  );
}
