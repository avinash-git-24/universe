import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ROUTES } from "@/constants/routes";
import { getAdminAnalytics, aggregateDailyVolume } from "@/lib/database/analytics";
import { StatCard } from "@/components/analytics/StatCard";
import { VolumeChart } from "@/components/analytics/VolumeChart";
import { ExportReportButton } from "@/components/analytics/ExportReportButton";
import { Users, Activity, Banknote } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Analytics · Admin",
};

export default async function AdminAnalyticsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect(ROUTES.LOGIN);

  const analytics = await getAdminAnalytics(supabase);
  const chartData = aggregateDailyVolume(analytics.transactionsData);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Platform Analytics</h1>
          <p className="text-muted-foreground mt-1">Platform-wide statistics for the last 30 days.</p>
        </div>
        
        <div className="flex gap-2">
          <ExportReportButton data={analytics.requestsData as Record<string, unknown>[]} filename="admin_requests_report" />
          <ExportReportButton data={analytics.transactionsData as Record<string, unknown>[]} filename="admin_transactions_report" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard 
          title="Total Active Users" 
          value={analytics.userCount} 
          icon={<Users className="w-4 h-4" />} 
          description="Total registered users"
        />
        <StatCard 
          title="Platform Volume (30d)" 
          value={`₹${analytics.totalVolume.toFixed(2)}`} 
          icon={<Banknote className="w-4 h-4" />} 
          description="Total funds moved through platform"
        />
        <StatCard 
          title="Total Requests (30d)" 
          value={analytics.totalRequests} 
          icon={<Activity className="w-4 h-4" />} 
          description="Total delivery requests created"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <VolumeChart 
          data={chartData} 
          title="Transaction Volume" 
          description="Daily transaction volume (30d)"
          type="line"
          color="hsl(var(--primary))"
        />
      </div>
    </div>
  );
}
