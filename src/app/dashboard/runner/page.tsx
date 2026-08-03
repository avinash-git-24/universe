import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { 
  getPendingRequestsWithItems, 
  getRunnerActiveDeliveries,
  getRunnerDeliveryHistory 
} from "@/lib/database/requests";
import { RunnerDashboardClient } from "@/components/runner/RunnerDashboardClient";

export default async function RunnerDashboardPage() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

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
    <div className="min-h-screen bg-secondary/30 pt-24 pb-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Runner Dashboard</h1>
          <p className="text-muted-foreground">Earn money by delivering on campus.</p>
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
