import { Suspense } from "react";
import type { Metadata } from "next";
import { getUser } from "@/lib/supabase/queries";
import { redirect } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import { ResaleSkeleton } from "@/components/resale/ResaleSkeleton";
import { MyListingsView } from "@/components/resale/MyListingsView";

export const metadata: Metadata = {
  title: "My Listings · UniVerse",
  description: "Manage your active, reserved, and sold listings on UniVerse Resale.",
};

export default async function MyListingsPage() {
  const {
    data: { user },
    error: authError,
  } = await getUser();

  if (authError || !user) {
    redirect(ROUTES.LOGIN);
  }

  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", paddingTop: "2rem", paddingBottom: "4rem", paddingLeft: "2rem", paddingRight: "2rem" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
          {/* Header skeleton */}
          <div style={{ marginBottom: "2rem" }}>
            <div style={{ height: "12px", borderRadius: "6px", background: "rgba(255,255,255,0.05)", width: "200px", marginBottom: "1rem", animation: "pulse 1.8s ease-in-out infinite" }} />
            <div style={{ height: "32px", borderRadius: "8px", background: "rgba(255,255,255,0.06)", width: "280px", marginBottom: "0.5rem", animation: "pulse 1.8s ease-in-out infinite" }} />
            <div style={{ height: "14px", borderRadius: "6px", background: "rgba(255,255,255,0.04)", width: "360px", animation: "pulse 1.8s ease-in-out infinite" }} />
          </div>
          <ResaleSkeleton count={4} />
        </div>
      </div>
    }>
      <MyListingsView />
    </Suspense>
  );
}
