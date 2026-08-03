import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ROUTES } from "@/constants/routes";
import { getUserAnalytics, aggregateDailyVolume } from "@/lib/database/analytics";
import { StatCard } from "@/components/analytics/StatCard";
import { VolumeChart } from "@/components/analytics/VolumeChart";
import { ExportReportButton } from "@/components/analytics/ExportReportButton";
import { IndianRupee, PackageCheck, Wallet } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Analytics · UniVerse",
  description: "View your analytics and performance reports.",
};

export default async function UserAnalyticsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect(ROUTES.LOGIN);

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile) redirect(ROUTES.LOGIN);

  const role = profile.role as "student" | "runner";
  
  // Fetch Analytics
  const analytics = await getUserAnalytics(supabase, user.id, role);
  
  // Aggregate Chart Data
  const chartData = aggregateDailyVolume(analytics.transactionsData);

  return (
    <div className="min-h-screen bg-secondary/30 pt-24 pb-12 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Analytics & Reports</h1>
            <p className="text-muted-foreground mt-1">
              Your activity over the last 30 days.
            </p>
          </div>
          
          <ExportReportButton 
            data={(role === "student" ? analytics.requestsData : analytics.assignmentsData) as Record<string, unknown>[]} 
            filename={`${role}_report`} 
          />
        </div>
        
        <div className="grid gap-4 md:grid-cols-3">
          {role === "student" ? (
            <>
              <StatCard 
                title="Total Spent (30d)" 
                value={`₹${analytics.totalSpent.toFixed(2)}`} 
                icon={<IndianRupee className="w-4 h-4" />} 
                description="Total funds used for deliveries"
              />
              <StatCard 
                title="Requests Made (30d)" 
                value={analytics.totalRequests} 
                icon={<PackageCheck className="w-4 h-4" />} 
              />
              <StatCard 
                title="Wallet Status" 
                value="Active" 
                icon={<Wallet className="w-4 h-4" />} 
                description="Your wallet is secure and active"
              />
            </>
          ) : (
            <>
              <StatCard 
                title="Total Earnings (30d)" 
                value={`₹${analytics.totalEarned.toFixed(2)}`} 
                icon={<IndianRupee className="w-4 h-4" />} 
                description="Total funds earned from deliveries"
              />
              <StatCard 
                title="Deliveries Completed (30d)" 
                value={analytics.deliveriesCompleted} 
                icon={<PackageCheck className="w-4 h-4" />} 
              />
              <StatCard 
                title="Account Status" 
                value="Active" 
                icon={<Wallet className="w-4 h-4" />} 
                description="Your runner account is in good standing"
              />
            </>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <VolumeChart 
            data={chartData} 
            title={role === "student" ? "Spending Trend" : "Earnings Trend"} 
            description="Daily volume over the last 30 days"
            type="bar"
            color="hsl(var(--primary))"
          />
        </div>
      </div>
    </div>
  );
}
