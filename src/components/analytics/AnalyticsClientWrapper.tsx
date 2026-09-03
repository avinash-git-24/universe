"use client";

import { useState, useMemo } from "react";
import { format, subDays, startOfDay, isAfter } from "date-fns";
import { ExportReportButton } from "@/components/analytics/ExportReportButton";
import { StatCard } from "@/components/analytics/StatCard";
import { VolumeChart } from "@/components/analytics/VolumeChart";
import { RequestActivityChart } from "@/components/analytics/RequestActivityChart";
import { RequestStatusDonut } from "@/components/analytics/RequestStatusDonut";
import { AnalyticsSummaryBar } from "@/components/analytics/AnalyticsSummaryBar";
import { RecentActivityList } from "@/components/analytics/RecentActivityList";
import { aggregateDailyVolume } from "@/lib/database/analytics";
import { IndianRupee, Package, ShieldCheck } from "lucide-react";
import type { Database } from "@/types/database";

type TimeRange = 7 | 30 | 90;
type DeliveryRequestRow = Database["public"]["Tables"]["delivery_requests"]["Row"];
type AssignmentRow = Database["public"]["Tables"]["delivery_assignments"]["Row"];
type TransactionRow = Database["public"]["Tables"]["transactions"]["Row"];

interface ActivityEntry {
  id: string;
  type: "request_created" | "request_completed" | "request_cancelled" | "payment" | "earning";
  title: string;
  description: string;
  date: Date;
}

interface AnalyticsClientWrapperProps {
  role: "student" | "runner";
  initialData: {
    requestsData: DeliveryRequestRow[];
    assignmentsData: AssignmentRow[];
    transactionsData: TransactionRow[];
  };
}

export function AnalyticsClientWrapper({ role, initialData }: AnalyticsClientWrapperProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>(7);

  // Helper to filter items for a specific date range (start date inclusive, end date exclusive)
  const filterByDateRange = <T extends { created_at?: string; assigned_at?: string }>(items: T[], startCutoff: Date, endCutoff?: Date): T[] => {
    return items.filter(item => {
      const dateStr = (item.created_at ?? item.assigned_at) ?? '';
      if (!dateStr) return false;
      const date = new Date(dateStr);
      if (endCutoff) {
        return isAfter(date, startCutoff) && !isAfter(date, endCutoff);
      }
      return isAfter(date, startCutoff);
    });
  };

  const cutoffDate = useMemo(() => startOfDay(subDays(new Date(), timeRange)), [timeRange]);
  const previousCutoffDate = useMemo(() => startOfDay(subDays(new Date(), timeRange * 2)), [timeRange]);

  // Current period data
  const filteredData = useMemo(() => {
    return {
      requestsData: filterByDateRange(initialData.requestsData, cutoffDate),
      assignmentsData: filterByDateRange(initialData.assignmentsData, cutoffDate),
      transactionsData: filterByDateRange(initialData.transactionsData, cutoffDate),
    };
  }, [initialData, cutoffDate]);

  // Previous period data (for trend calculation)
  const previousFilteredData = useMemo(() => {
    return {
      requestsData: filterByDateRange(initialData.requestsData, previousCutoffDate, cutoffDate),
      assignmentsData: filterByDateRange(initialData.assignmentsData, previousCutoffDate, cutoffDate),
      transactionsData: filterByDateRange(initialData.transactionsData, previousCutoffDate, cutoffDate),
    };
  }, [initialData, previousCutoffDate, cutoffDate]);

  // Aggregate Volume Chart Data (uses transactions, falls back to requests delivery_fee if no wallet transactions)
  const volumeChartData = useMemo(() => {
    const txVolume = aggregateDailyVolume(filteredData.transactionsData, timeRange);
    const hasTxVolume = txVolume.some(t => t.amount > 0);
    if (hasTxVolume || role !== "student" || filteredData.requestsData.length === 0) {
      return txVolume;
    }
    // Fallback using request fees so spending trend renders real data
    const days = Array.from({ length: timeRange }).map((_, i) => {
      const d = startOfDay(subDays(new Date(), timeRange - 1 - i));
      return {
        date: format(d, "MMM dd"),
        rawDate: d,
        amount: 0,
      };
    });
    filteredData.requestsData.forEach(r => {
      const rDate = format(startOfDay(new Date(r.created_at)), "MMM dd");
      const day = days.find(d => d.date === rDate);
      if (day) {
        day.amount += Number(r.delivery_fee) || 0;
      }
    });
    return days;
  }, [filteredData, timeRange, role]);

  // Calculate metrics function
  const calculateMetrics = (dataObj: typeof filteredData, currentRole: typeof role) => {
    let totalSpent = 0;
    let totalEarned = 0;
    
    if (currentRole === "student") {
      totalSpent = dataObj.transactionsData
        .filter(t => t.type === "payment")
        .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

      // Fallback: If wallet payment transactions are 0, use delivery_fee sum
      if (totalSpent === 0 && dataObj.requestsData.length > 0) {
        totalSpent = dataObj.requestsData.reduce((sum, r) => sum + (Number(r.delivery_fee) || 0), 0);
      }
    } else {
      totalEarned = dataObj.transactionsData
        .filter(t => t.type === "earning")
        .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

      // Fallback for runner: if wallet earnings are 0, sum up completed delivery fees
      if (totalEarned === 0 && dataObj.assignmentsData.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        totalEarned = dataObj.assignmentsData.reduce((sum, a: any) => sum + (Number(a.delivery_requests?.delivery_fee) || 0), 0);
      }
    }

    const totalRequests = currentRole === "student" ? dataObj.requestsData.length : 0;
    const deliveriesCompleted = currentRole === "runner" ? dataObj.assignmentsData.filter(a => a.status === "completed").length : 0;

    const completedRequests = currentRole === "student" 
      ? dataObj.requestsData.filter((r) => r.status === "delivered").length
      : deliveriesCompleted;
      
    const cancelledRequests = currentRole === "student"
      ? dataObj.requestsData.filter((r) => r.status === "cancelled").length
      : 0;

    const avgSpending = currentRole === "student"
      ? (totalRequests > 0 ? (totalSpent / totalRequests) : 0)
      : (deliveriesCompleted > 0 ? (totalEarned / deliveriesCompleted) : 0);

    const amounts = dataObj.transactionsData.map(t => Math.abs(t.amount));
    const requestFees = dataObj.requestsData.map(r => Number(r.delivery_fee) || 0).filter(f => f > 0);
    const pool = amounts.length > 0 ? amounts : requestFees;
    const highestCost = pool.length > 0 ? Math.max(...pool) : 0;
    const lowestCost = pool.length > 0 ? Math.min(...pool) : 0;

    return { totalSpent, totalEarned, totalRequests, deliveriesCompleted, completedRequests, cancelledRequests, avgSpending, highestCost, lowestCost };
  };

  const summaryMetrics = calculateMetrics(filteredData, role);
  const previousMetrics = calculateMetrics(previousFilteredData, role);

  // Calculate Trends
  const calcTrend = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  const spentTrend = calcTrend(role === "student" ? summaryMetrics.totalSpent : summaryMetrics.totalEarned, role === "student" ? previousMetrics.totalSpent : previousMetrics.totalEarned);
  const requestsTrend = calcTrend(role === "student" ? summaryMetrics.totalRequests : summaryMetrics.deliveriesCompleted, role === "student" ? previousMetrics.totalRequests : previousMetrics.deliveriesCompleted);

  // Calculate Request Activity Chart Data
  const requestActivityData = useMemo(() => {
    const days = Array.from({ length: timeRange }).map((_, i) => {
      const d = startOfDay(subDays(new Date(), timeRange - 1 - i));
      return { date: format(d, "MMM dd"), rawDate: d, created: 0, completed: 0, cancelled: 0 };
    });

    const items = role === "student" ? filteredData.requestsData : filteredData.assignmentsData;
    
    (items as Array<{ created_at?: string; assigned_at?: string; status: string }>).forEach((item) => {
      const itemDateStr = format(startOfDay(new Date((item.created_at ?? item.assigned_at) as string)), "MMM dd");
      const day = days.find(d => d.date === itemDateStr);
      if (day) {
        day.created += 1;
        if (item.status === "delivered" || item.status === "completed") day.completed += 1;
        if (item.status === "cancelled") day.cancelled += 1;
      }
    });

    return days;
  }, [filteredData, timeRange, role]);

  // Calculate Request Status Donut Data
  const statusDonutData = useMemo(() => {
    const active = role === "student" 
      ? filteredData.requestsData.filter(r => !["delivered", "cancelled"].includes(r.status)).length
      : 0;
    
    return [
      { name: "Active", value: active, color: "#22c55e" }, // Green
      { name: "Completed", value: summaryMetrics.completedRequests, color: "#3b82f6" }, // Blue
      { name: "Cancelled", value: summaryMetrics.cancelledRequests, color: "#ef4444" }, // Red
    ];
  }, [filteredData, role, summaryMetrics]);

  // Compile Recent Activity Feed with campus routes & fee info
  const recentActivities = useMemo(() => {
    const activities: ActivityEntry[] = [];
    
    if (role === "student") {
      filteredData.requestsData.forEach(r => {
        const route = r.pickup_location && r.dropoff_location
          ? `${r.pickup_location} → ${r.dropoff_location}`
          : "Campus Delivery";
        const feeBadge = r.delivery_fee ? ` · ₹${r.delivery_fee}` : "";

        activities.push({
          id: `req-${r.id}-created`,
          type: "request_created",
          title: "Request Created",
          description: `📍 ${route}${feeBadge}`,
          date: new Date(r.created_at)
        });

        if (r.status === "delivered") {
          activities.push({
            id: `req-${r.id}-completed`,
            type: "request_completed",
            title: "Delivery Completed",
            description: `✅ Delivered to ${r.dropoff_location || "Hostel"}`,
            date: new Date(r.updated_at || r.created_at)
          });
        }
        if (r.status === "cancelled") {
          activities.push({
            id: `req-${r.id}-cancelled`,
            type: "request_cancelled",
            title: "Request Cancelled",
            description: `❌ Cancelled: ${route}`,
            date: new Date(r.updated_at || r.created_at)
          });
        }
      });
    } else {
      filteredData.assignmentsData.forEach(a => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const req = (a as any).delivery_requests;
        const route = req?.pickup_location && req?.dropoff_location
          ? `${req.pickup_location} → ${req.dropoff_location}`
          : "Campus Delivery";
        activities.push({
          id: `assign-${a.id}`,
          type: "request_completed",
          title: "Delivery Completed",
          description: `🚴 Delivered: ${route}`,
          date: new Date(a.assigned_at || (a as any).created_at || new Date())
        });
      });
    }

    return activities.sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 5);
  }, [filteredData, role]);

  return (
    <div className="min-h-screen bg-[#060a08] relative overflow-hidden pt-4 sm:pt-8 pb-12 px-3 sm:px-6 selection:bg-emerald-500/30">
      {/* Ambient Stardust & Nebula Glows */}
      <div className="absolute inset-0 bg-[radial-gradient(#10b98110_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none opacity-50" />
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -right-40 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto space-y-6 relative z-10">
        
        {/* Page Header & Filters */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 sm:gap-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
              <span>Analytics & Reports</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold">
                Live
              </span>
            </h1>
            <p className="text-white/50 mt-1 text-xs sm:text-sm font-medium">
              Track your {role === "student" ? "spending, requests," : "earnings, deliveries,"} and activity.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full md:w-auto">
            {/* Time Range Filter (Pill style matching reference) */}
            <div className="flex items-center bg-[#0c1410] rounded-full border border-white/10 p-1 overflow-hidden w-full sm:w-auto shadow-sm">
              {[7, 30, 90].map((days) => (
                <button
                  key={days}
                  onClick={() => setTimeRange(days as TimeRange)}
                  className={`flex-1 sm:flex-none px-4 sm:px-5 py-1.5 text-xs font-semibold rounded-full transition-all cursor-pointer ${
                    timeRange === days 
                    ? "bg-emerald-500 text-black font-extrabold shadow-[0_0_12px_rgba(16,185,129,0.4)]" 
                    : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {days} Days
                </button>
              ))}
            </div>

            <ExportReportButton 
              data={(role === "student" ? filteredData.requestsData : filteredData.assignmentsData) as Record<string, unknown>[]} 
              filename={`${role}_report_${timeRange}d`} 
            />
          </div>
        </div>
        
        {/* Summary Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5">
          <StatCard 
            title={role === "student" ? `Total Spent (${timeRange}d)` : `Total Earnings (${timeRange}d)`}
            value={`₹${(role === "student" ? summaryMetrics.totalSpent : summaryMetrics.totalEarned).toFixed(2)}`} 
            icon={<IndianRupee className="w-5 h-5" />} 
            description={role === "student" ? "Total funds used for deliveries" : "Total funds earned from deliveries"}
            trend={spentTrend}
            trendLabel={`from previous ${timeRange} days`}
          />
          <StatCard 
            title={role === "student" ? `Requests Made (${timeRange}d)` : `Deliveries Completed (${timeRange}d)`}
            value={role === "student" ? summaryMetrics.totalRequests : summaryMetrics.deliveriesCompleted} 
            icon={<Package className="w-5 h-5" />} 
            description={role === "student" ? "Total delivery requests posted" : "Successful deliveries"}
            trend={requestsTrend}
            trendLabel={`from previous ${timeRange} days`}
          />
          <StatCard 
            title="Wallet Status" 
            value="Active" 
            icon={<ShieldCheck className="w-5 h-5" />} 
            description="Your wallet is secure and ready"
            isStatusCard={true}
            trendLabel="Wallet is in good standing"
          />
        </div>

        {/* Spending Trend Chart Row */}
        <div className="w-full">
          <VolumeChart 
            data={volumeChartData} 
            title={role === "student" ? "Spending Trend" : "Earnings Trend"} 
            description={`Daily volume over the last ${timeRange} days`}
          />
        </div>

        {/* Request Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          <div className="lg:col-span-3">
            <RequestActivityChart 
              data={requestActivityData}
              title="Request Activity"
              description={`Volume over the last ${timeRange} days`}
            />
          </div>
          <div className="lg:col-span-2">
            <RequestStatusDonut 
              data={statusDonutData}
              title="Request Status Breakdown"
              description="Overview of request statuses"
              total={role === "student" ? summaryMetrics.totalRequests : summaryMetrics.deliveriesCompleted}
            />
          </div>
        </div>

        {/* Analytics Summary Bar */}
        <div className="w-full">
          <AnalyticsSummaryBar 
            avgSpending={summaryMetrics.avgSpending}
            highestCost={summaryMetrics.highestCost}
            lowestCost={summaryMetrics.lowestCost}
            completed={summaryMetrics.completedRequests}
            cancelled={summaryMetrics.cancelledRequests}
          />
        </div>

        {/* Recent Activity List Full Width */}
        <div className="w-full">
          <RecentActivityList activities={recentActivities} />
        </div>

      </div>
    </div>
  );
}
