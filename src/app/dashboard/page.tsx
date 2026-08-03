import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getStudentRequests } from "@/lib/database/requests";
import { ROUTES } from "@/constants/routes";
import { Button } from "@/components/ui/button";
import { StudentRequestCard } from "@/components/request/StudentRequestCard";
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

  const displayName =
    (user.user_metadata?.full_name as string | undefined) ??
    user.email?.split("@")[0] ??
    "Student";

  const requests = await getStudentRequests(supabase, user.id);
  
  // Sort requests: Active (pending, accepted, picked_up) first, then completed/cancelled
  const activeRequests = requests.filter(r => !["delivered", "cancelled"].includes(r.status));
  const pastRequests = requests.filter(r => ["delivered", "cancelled"].includes(r.status));

  return (
    <div className="min-h-screen bg-secondary/30 pt-24 pb-12 px-4">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Welcome, {displayName}!</h1>
            <p className="text-muted-foreground mt-1">Track your requests or create a new one.</p>
          </div>
          
          <div className="flex gap-2">
            <Link href="/dashboard/runner">
              <Button variant="secondary">Runner Mode</Button>
            </Link>
            <Link href="/request/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Request
              </Button>
            </Link>
          </div>
        </div>

        {/* Active Requests */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold border-b pb-2">Active Requests</h2>
          {activeRequests.length === 0 ? (
            <div className="bg-background rounded-lg border border-dashed p-8 text-center text-muted-foreground">
              You have no active requests.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {activeRequests.map(req => (
                <StudentRequestCard key={req.id} request={req} />
              ))}
            </div>
          )}
        </section>

        {/* Past Requests */}
        {pastRequests.length > 0 && (
          <section className="space-y-4 pt-4">
            <h2 className="text-xl font-bold border-b pb-2">Past Requests</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {pastRequests.map(req => (
                <StudentRequestCard key={req.id} request={req} />
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  );
}
