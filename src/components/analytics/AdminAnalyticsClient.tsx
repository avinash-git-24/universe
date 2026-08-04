"use client";

import { useState, useMemo } from "react";
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
  GraduationCap, 
  TrendingUp, 
  Activity, 
  SearchX 
} from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { AnalyticsFilterBar } from "./AnalyticsFilterBar";
import { AnalyticsExportButtons } from "./AnalyticsExportButtons";
import { VolumeChart } from "./VolumeChart";
import { 
  ProfileRow, 
  DeliveryRequestRow, 
  DeliveryAssignmentRow, 
  Transaction,
  computeAdminAnalyticsFromData, 
  aggregateDailyVolume 
} from "@/lib/database/analytics";
import { AnalyticsFilterState } from "@/types/analytics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AdminAnalyticsClientProps {
  initialProfiles: ProfileRow[];
  initialRequests: DeliveryRequestRow[];
  initialAssignments: DeliveryAssignmentRow[];
  initialTransactions: Transaction[];
}

export function AdminAnalyticsClient({
  initialProfiles,
  initialRequests,
  initialAssignments,
  initialTransactions,
}: AdminAnalyticsClientProps) {
  const [filterState, setFilterState] = useState<AnalyticsFilterState>({
    quickRange: "30d",
  });

  // Recompute analytics when filterState changes
  const computedAnalytics = useMemo(() => {
    return computeAdminAnalyticsFromData(
      initialProfiles,
      initialRequests,
      initialAssignments,
      filterState
    );
  }, [initialProfiles, initialRequests, initialAssignments, filterState]);

  // Chart data for daily transaction volume
  const chartData = useMemo(() => {
    return aggregateDailyVolume(initialTransactions);
  }, [initialTransactions]);

  const { summary, kpis, runnerMetrics, studentMetrics } = computedAnalytics;
  const hasRequests = summary.totalRequests > 0;

  return (
    <div className="space-y-6">
      {/* Header & Export Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Platform Analytics</h1>
          <p className="text-muted-foreground mt-1">Real-time statistics, KPIs, and multi-range reporting.</p>
        </div>

        <AnalyticsExportButtons analytics={computedAnalytics} filenamePrefix="analytics" />
      </div>

      {/* Filter Bar */}
      <AnalyticsFilterBar filterState={filterState} onFilterChange={setFilterState} />

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatsCard
          label="Success Rate"
          value={kpis.deliverySuccessRate}
          icon={TrendingUp}
          color="text-emerald-500"
        />
        <StatsCard
          label="Cancellation Rate"
          value={kpis.cancellationRate}
          icon={AlertCircle}
          color="text-red-500"
        />
        <StatsCard
          label="Active Deliveries"
          value={kpis.activeDeliveryCount}
          icon={Activity}
          color="text-blue-500"
        />
        <StatsCard
          label="Avg Requests / Day"
          value={kpis.averageRequestsPerDay}
          icon={Clock}
          color="text-amber-500"
        />
      </div>

      {/* Detailed Status Breakdown Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatsCard label="Total Requests" value={summary.totalRequests} icon={Package} color="text-primary" />
        <StatsCard label="Pending" value={summary.pending} icon={Clock} color="text-blue-500" />
        <StatsCard label="Accepted" value={summary.accepted} icon={CheckCircle2} color="text-amber-500" />
        <StatsCard label="Picked Up" value={summary.pickedUp} icon={PackageCheck} color="text-purple-500" />
        <StatsCard label="In Transit" value={summary.inTransit} icon={Truck} color="text-cyan-500" />
        <StatsCard label="Delivered" value={summary.delivered} icon={MapPin} color="text-emerald-500" />
        <StatsCard label="Cancelled" value={summary.cancelled} icon={AlertCircle} color="text-red-500" />
        <StatsCard label="Runners" value={summary.runners} icon={Bike} color="text-accent" />
        <StatsCard label="Students" value={summary.students} icon={GraduationCap} color="text-indigo-500" />
        <StatsCard label="Total Users" value={summary.totalUsers} icon={Users} color="text-secondary-foreground" />
      </div>

      {/* Empty state if filtered data is empty */}
      {!hasRequests && (
        <div className="p-12 text-center border border-dashed rounded-xl bg-card">
          <SearchX className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
          <p className="font-semibold text-lg">No Data for Selected Date Range</p>
          <p className="text-sm text-muted-foreground mt-1">
            Try adjusting your quick date filter or selecting a broader custom date range.
          </p>
        </div>
      )}

      {/* Charts & Ranking Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <VolumeChart
            data={chartData}
            title="Transaction Volume"
            description="Daily transaction volume"
            type="line"
            color="hsl(var(--primary))"
          />
        </div>

        {/* Top Runners Ranking */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3 border-b">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Bike className="w-4 h-4 text-accent" /> Top Runners
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {runnerMetrics.topRunners.length === 0 ? (
              <div className="p-6 text-center text-xs text-muted-foreground">No runner activity recorded.</div>
            ) : (
              <div className="divide-y text-xs">
                {runnerMetrics.topRunners.slice(0, 5).map((runner) => (
                  <div key={runner.runnerId} className="p-3 flex justify-between items-center hover:bg-secondary/20">
                    <span className="font-medium truncate max-w-[150px]">{runner.runnerName}</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {runner.completedCount} delivered
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Students Ranking Table */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3 border-b">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-indigo-500" /> Top Requesters (Students)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {studentMetrics.topStudents.length === 0 ? (
            <div className="p-6 text-center text-xs text-muted-foreground">No student request data found.</div>
          ) : (
            <div className="divide-y text-xs">
              {studentMetrics.topStudents.slice(0, 5).map((student) => (
                <div key={student.studentId} className="p-3 flex justify-between items-center hover:bg-secondary/20">
                  <span className="font-medium">{student.studentName}</span>
                  <span className="font-bold text-primary">{student.requestCount} requests</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
