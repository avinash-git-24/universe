import { getUser } from "@/lib/supabase/queries";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { 
  getPendingRequestsWithItems, 
  getRunnerActiveDeliveries,
  getRunnerDeliveryHistory 
} from "@/lib/database/requests";
import { RunnerDashboardClient } from "@/components/runner/RunnerDashboardClient";
import { Bike, Sparkles, Bell, ChevronDown } from "lucide-react";

export default async function RunnerDashboardPage() {
  const supabase = await createClient();
  const { data: { user }, error } = await getUser();

  if (error || !user) {
    redirect("/login?redirectTo=/dashboard/runner");
  }

  // Fetch pending available requests
  const pendingRequests = await getPendingRequestsWithItems(supabase);

  // Fetch active deliveries for current runner (accepted, picked_up, in_transit)
  const activeDeliveries = await getRunnerActiveDeliveries(supabase, user.id);

  // Fetch delivery history for current runner (delivered, cancelled)
  const deliveryHistory = await getRunnerDeliveryHistory(supabase, user.id);

  return (
    <div className="min-h-screen bg-[#0a0f0d] pt-24 pb-12 px-4">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
              <Bike className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-white">Runner Dashboard</h1>
              <p className="text-muted-foreground flex items-center gap-1.5 text-sm mt-1">
                Earn money by delivering on campus. 
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="w-10 h-10 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/5 transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full border-2 border-[#0a0f0d]"></span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-sm font-medium hover:bg-emerald-500/20 transition-colors shadow-[0_0_15px_rgba(16,185,129,0.1)]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"></span>
              Online
              <ChevronDown className="w-4 h-4 opacity-70 ml-1" />
            </button>
          </div>
        </div>
        
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
