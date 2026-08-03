import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getPendingRequestsWithItems, getActiveRunnerAssignment } from "@/lib/database/requests";
import { RunnerDashboardClient } from "@/components/runner/RunnerDashboardClient";

export default async function RunnerDashboardPage() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login?redirectTo=/dashboard/runner");
  }

  // Fetch active assignment to prevent accepting multiple
  const activeAssignment = await getActiveRunnerAssignment(supabase, user.id);
  
  // Fetch pending requests
  const pendingRequests = await getPendingRequestsWithItems(supabase);

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
          activeAssignment={activeAssignment} 
        />
      </div>
    </div>
  );
}
