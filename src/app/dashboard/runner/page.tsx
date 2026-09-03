import { getUser } from "@/lib/supabase/queries";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { 
  getPendingRequestsWithItems, 
  getRunnerActiveDeliveries,
  getRunnerDeliveryHistory 
} from "@/lib/database/requests";
import { RunnerDashboardClient } from "@/components/runner/RunnerDashboardClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Runner Dashboard · UniVerse",
  description: "Deliver on campus and earn money with UniVerse peer delivery.",
};

export default async function RunnerDashboardPage() {
  const supabase = await createClient();
  const { data: { user }, error } = await getUser();

  if (error || !user) {
    redirect("/login?redirectTo=/dashboard/runner");
  }

  // Fetch all runner dashboard data concurrently in parallel
  const [pendingRequests, activeDeliveries, deliveryHistory] = await Promise.all([
    getPendingRequestsWithItems(supabase),
    getRunnerActiveDeliveries(supabase, user.id),
    getRunnerDeliveryHistory(supabase, user.id),
  ]);

  return (
    <div className="relative min-h-screen bg-[#0a0f0d] pt-24 pb-14 px-3 sm:px-6 text-white selection:bg-emerald-500/30 overflow-x-hidden">
      {/* ── Atmospheric Ambient Cosmic Glow Background ── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
        {/* Soft Volumetric Emerald Glow at Top */}
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[850px] h-[500px] bg-gradient-to-b from-emerald-500/10 via-emerald-500/5 to-transparent blur-3xl rounded-full" />
        {/* Subtle Cyan Relativistic Accent Light */}
        <div className="absolute top-1/3 -right-48 w-[400px] h-[400px] bg-cyan-500/5 blur-3xl rounded-full" />
        {/* Distant Cyber Stars / Dust Matrix */}
        <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:48px_48px] opacity-[0.06]" />
        {/* Deep Space Vignette */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a0f0d]/60 to-[#0a0f0d]" />
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        <RunnerDashboardClient 
          runnerId={user.id} 
          initialPending={pendingRequests} 
          initialActive={activeDeliveries}
          initialHistory={deliveryHistory}
        />
      </div>
    </div>
  );
}
