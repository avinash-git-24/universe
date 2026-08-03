import { Users, Bike, PackageCheck, IndianRupee } from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";

interface AdminStatsGridProps {
  stats: {
    totalUsers: number;
    students: number;
    runners: number;
    totalRequests: number;
    activeRequests: number;
    completedRequests: number;
    totalRevenue: number;
  };
}

export function AdminStatsGrid({ stats }: AdminStatsGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatsCard 
        label="Total Users" 
        value={stats.totalUsers} 
        icon={Users} 
        color="text-primary" 
      />
      <StatsCard 
        label="Active Runners" 
        value={stats.runners} 
        icon={Bike} 
        color="text-accent" 
      />
      <StatsCard 
        label="Deliveries Completed" 
        value={stats.completedRequests} 
        icon={PackageCheck} 
        color="text-emerald-500" 
      />
      <StatsCard 
        label="Platform Value (₹)" 
        value={stats.totalRevenue} 
        icon={IndianRupee} 
        color="text-amber-500" 
      />
    </div>
  );
}
