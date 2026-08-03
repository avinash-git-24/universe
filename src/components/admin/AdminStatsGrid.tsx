import { 
  Users, 
  Bike, 
  Package, 
  Clock, 
  CheckCircle2, 
  PackageCheck, 
  Truck, 
  MapPin, 
  AlertCircle, 
  GraduationCap 
} from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";

interface AdminStatsGridProps {
  stats: {
    totalUsers?: number;
    students: number;
    runners: number;
    totalRequests: number;
    pendingRequests?: number;
    acceptedRequests?: number;
    pickedUpRequests?: number;
    inTransitRequests?: number;
    deliveredRequests?: number;
    cancelledRequests?: number;
    activeRequests?: number;
    completedRequests?: number;
    totalRevenue?: number;
  };
}

export function AdminStatsGrid({ stats }: AdminStatsGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      <StatsCard 
        label="Total Requests" 
        value={stats.totalRequests} 
        icon={Package} 
        color="text-primary" 
      />
      <StatsCard 
        label="Pending Requests" 
        value={stats.pendingRequests ?? 0} 
        icon={Clock} 
        color="text-blue-500" 
      />
      <StatsCard 
        label="Accepted" 
        value={stats.acceptedRequests ?? 0} 
        icon={CheckCircle2} 
        color="text-amber-500" 
      />
      <StatsCard 
        label="Picked Up" 
        value={stats.pickedUpRequests ?? 0} 
        icon={PackageCheck} 
        color="text-purple-500" 
      />
      <StatsCard 
        label="In Transit" 
        value={stats.inTransitRequests ?? 0} 
        icon={Truck} 
        color="text-cyan-500" 
      />
      <StatsCard 
        label="Delivered" 
        value={stats.deliveredRequests ?? stats.completedRequests ?? 0} 
        icon={MapPin} 
        color="text-emerald-500" 
      />
      <StatsCard 
        label="Cancelled" 
        value={stats.cancelledRequests ?? 0} 
        icon={AlertCircle} 
        color="text-red-500" 
      />
      <StatsCard 
        label="Total Runners" 
        value={stats.runners} 
        icon={Bike} 
        color="text-accent" 
      />
      <StatsCard 
        label="Total Students" 
        value={stats.students} 
        icon={GraduationCap} 
        color="text-indigo-500" 
      />
      <StatsCard 
        label="Total Users" 
        value={stats.totalUsers ?? (stats.students + stats.runners)} 
        icon={Users} 
        color="text-secondary-foreground" 
      />
    </div>
  );
}
