import { redirect } from "next/navigation";
import { Package, Bike, CheckCircle2, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getStudentRequests, type Profile } from "@/lib/database/requests";
import { ROUTES } from "@/constants/routes";
import { StudentRequestCard } from "@/components/request/StudentRequestCard";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardGrid } from "@/components/dashboard/DashboardGrid";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { ProfileSummary } from "@/components/dashboard/ProfileSummary";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard · UniVerse",
  description: "Your UniVerse campus dashboard.",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect(ROUTES.LOGIN);
  }

  // Fetch the user's profile from the DB to get their full data (e.g. enrollment_number)
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const displayName =
    profile?.full_name ??
    user.email?.split("@")[0] ??
    "Student";

  const requests = await getStudentRequests(supabase, user.id);
  
  // Calculate Stats
  const activeRequests = requests.filter(r => !["delivered", "cancelled"].includes(r.status));
  const completedRequests = requests.filter(r => r.status === "delivered");
  const cancelledRequests = requests.filter(r => r.status === "cancelled");

  // Layout Columns
  const LeftColumn = (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard label="Total Requests" value={requests.length} icon={Package} />
        <StatsCard label="Active" value={activeRequests.length} icon={Bike} color="text-accent" />
        <StatsCard label="Completed" value={completedRequests.length} icon={CheckCircle2} color="text-emerald-500" />
        <StatsCard label="Cancelled" value={cancelledRequests.length} icon={AlertCircle} color="text-error" />
      </div>

      <section className="space-y-4 pt-4">
        <h2 className="text-xl font-bold border-b pb-2">Active Deliveries</h2>
        {activeRequests.length === 0 ? (
          <div className="bg-background rounded-lg border border-dashed p-8 text-center text-muted-foreground">
            You have no active requests right now.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {activeRequests.map(req => (
              <StudentRequestCard key={req.id} request={req} />
            ))}
          </div>
        )}
      </section>

      {completedRequests.length > 0 && (
        <section className="space-y-4 pt-4">
          <h2 className="text-xl font-bold border-b pb-2">Recent Completed Deliveries</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {completedRequests.slice(0, 4).map(req => (
              <StudentRequestCard key={req.id} request={req} />
            ))}
          </div>
        </section>
      )}
    </>
  );

  const RightColumn = (
    <>
      <QuickActions />
      <ProfileSummary profile={profile as Profile} email={user.email || ""} />
      <ActivityFeed requests={requests} />
    </>
  );

  return (
    <div className="min-h-screen bg-secondary/30 pt-24 pb-12 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        <DashboardHeader displayName={displayName} />
        <DashboardGrid leftColumn={LeftColumn} rightColumn={RightColumn} />
      </div>
    </div>
  );
}
