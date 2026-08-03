import { createClient } from "@/lib/supabase/server";
import { getPlatformStats } from "@/lib/database/admin";
import { AdminStatsGrid } from "@/components/admin/AdminStatsGrid";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Overview · UniVerse",
  description: "Platform oversight and statistics.",
};

export default async function AdminOverviewPage() {
  const supabase = await createClient();
  const stats = await getPlatformStats(supabase);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Platform Overview</h1>
        <p className="text-muted-foreground mt-1">High-level metrics for the UniVerse platform.</p>
      </div>

      <AdminStatsGrid stats={stats} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Currently, there are <span className="font-bold text-foreground">{stats.activeRequests}</span> active delivery requests happening on campus.
            </p>
            <p className="text-sm text-muted-foreground">
              Runners have successfully completed <span className="font-bold text-foreground">{stats.completedRequests}</span> deliveries to date.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
