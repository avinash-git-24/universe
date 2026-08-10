import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/types/database";
import { startOfDay, endOfDay, startOfMonth, endOfMonth, subDays, subMonths, format } from "date-fns";
import { AnalyticsFilterState } from "@/types/analytics";

export type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
export type DeliveryRequestRow = Database["public"]["Tables"]["delivery_requests"]["Row"];
export type DeliveryAssignmentRow = Database["public"]["Tables"]["delivery_assignments"]["Row"];
export type Transaction = Database["public"]["Tables"]["transactions"]["Row"];

// ─── Phase 9A.1 Analytics Engine Interfaces ───────────────────────────────────

export interface AdminAnalyticsSummary {
  totalUsers: number;
  students: number;
  runners: number;
  admins: number;
  totalRequests: number;
  pending: number;
  accepted: number;
  pickedUp: number;
  inTransit: number;
  delivered: number;
  cancelled: number;
}

export interface DeliveryKPIs {
  deliverySuccessRate: number; // Percentage 0-100
  cancellationRate: number; // Percentage 0-100
  activeDeliveryCount: number;
  averageRequestsPerDay: number;
}

export interface DailyTrendPoint {
  date: string; // e.g. "MMM dd"
  rawDate: string; // ISO date string YYYY-MM-DD
  count: number;
}

export interface AnalyticsTrendData {
  requestsByDay: DailyTrendPoint[];
  deliveriesByDay: DailyTrendPoint[];
  newUsersByDay: DailyTrendPoint[];
}

export interface RunnerMetric {
  runnerId: string;
  runnerName: string;
  completedCount: number;
  totalHandled: number;
}

export interface StudentMetric {
  studentId: string;
  studentName: string;
  requestCount: number;
}

export interface RunnerMetricsSummary {
  topRunners: RunnerMetric[];
  requestsHandledPerRunner: Record<string, number>;
  completedDeliveriesPerRunner: Record<string, number>;
}

export interface StudentMetricsSummary {
  topStudents: StudentMetric[];
  requestsCreatedPerStudent: Record<string, number>;
}

export interface FullAdminAnalytics {
  summary: AdminAnalyticsSummary;
  kpis: DeliveryKPIs;
  trends: AnalyticsTrendData;
  runnerMetrics: RunnerMetricsSummary;
  studentMetrics: StudentMetricsSummary;
}

// ─── Phase 9B.2 Date Filter Bounds Helper ────────────────────────────────────

export function getDateRangeBounds(filter: AnalyticsFilterState): { start: Date | null; end: Date | null } {
  const now = new Date();
  switch (filter.quickRange) {
    case "today":
      return { start: startOfDay(now), end: endOfDay(now) };
    case "7d":
      return { start: startOfDay(subDays(now, 7)), end: endOfDay(now) };
    case "30d":
      return { start: startOfDay(subDays(now, 30)), end: endOfDay(now) };
    case "this_month":
      return { start: startOfMonth(now), end: endOfMonth(now) };
    case "last_month": {
      const prevMonth = subMonths(now, 1);
      return { start: startOfMonth(prevMonth), end: endOfMonth(prevMonth) };
    }
    case "custom": {
      const start = filter.startDate ? startOfDay(new Date(filter.startDate)) : null;
      const end = filter.endDate ? endOfDay(new Date(filter.endDate)) : null;
      return { start, end };
    }
    case "all_time":
    default:
      return { start: null, end: null };
  }
}

export function filterDatasetByDate<T>(
  items: T[],
  bounds: { start: Date | null; end: Date | null },
  dateExtractor: (item: T) => string = (item: unknown) => {
    const obj = item as Record<string, unknown>;
    return String(obj.created_at || obj.assigned_at || "");
  }
): T[] {
  const { start, end } = bounds;
  if (!start && !end) return items;

  return items.filter((item) => {
    const rawDate = dateExtractor(item);
    if (!rawDate) return true;
    const itemDate = new Date(rawDate);
    if (start && itemDate < start) return false;
    if (end && itemDate > end) return false;
    return true;
  });
}

// ─── Existing Helper Functions (Preserved for Backwards Compatibility) ─────────

export async function getUserAnalytics(
  supabase: SupabaseClient<Database>,
  userId: string,
  role: "student" | "runner"
) {
  const oneEightyDaysAgo = subDays(new Date(), 180).toISOString();

  if (role === "student") {
    const { data: requests } = await supabase
      .from("delivery_requests")
      .select("*")
      .eq("requester_id", userId)
      .gte("created_at", oneEightyDaysAgo);

    const { data: wallet } = await supabase
      .from("wallets")
      .select("id")
      .eq("profile_id", userId)
      .single();

    let transactions: Transaction[] = [];
    if (wallet) {
      const { data } = await supabase
        .from("transactions")
        .select("*")
        .eq("wallet_id", wallet.id)
        .eq("type", "payment")
        .gte("created_at", oneEightyDaysAgo);
      transactions = data || [];
    }

    const totalSpent = transactions.reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
    const totalRequests = requests?.length || 0;
    
    return {
      totalSpent,
      totalEarned: 0,
      totalRequests,
      deliveriesCompleted: 0,
      requestsData: requests || [],
      assignmentsData: [],
      transactionsData: transactions
    };
  } else {
    const { data: assignments } = await supabase
      .from("delivery_assignments")
      .select("*, delivery_requests(*)")
      .eq("runner_id", userId)
      .eq("status", "completed")
      .gte("created_at", oneEightyDaysAgo);

    const { data: wallet } = await supabase
      .from("wallets")
      .select("id")
      .eq("profile_id", userId)
      .single();

    let transactions: Transaction[] = [];
    if (wallet) {
      const { data } = await supabase
        .from("transactions")
        .select("*")
        .eq("wallet_id", wallet.id)
        .eq("type", "earning")
        .gte("created_at", oneEightyDaysAgo);
      transactions = data || [];
    }

    const totalEarned = transactions.reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
    const deliveriesCompleted = assignments?.length || 0;

    return {
      totalSpent: 0,
      totalEarned,
      totalRequests: 0,
      deliveriesCompleted,
      requestsData: [],
      assignmentsData: assignments || [],
      transactionsData: transactions
    };
  }
}

export async function getAdminAnalytics(supabase: SupabaseClient<Database>) {
  const thirtyDaysAgo = subDays(new Date(), 30).toISOString();
  
  const { count: userCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true });
    
  const { data: recentRequests } = await supabase
    .from("delivery_requests")
    .select("*")
    .gte("created_at", thirtyDaysAgo);
    
  const { data: recentTransactions } = await supabase
    .from("transactions")
    .select("*")
    .eq("type", "payment")
    .gte("created_at", thirtyDaysAgo);

  const totalVolume = (recentTransactions || []).reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
  
  return {
    userCount: userCount || 0,
    totalVolume,
    totalRequests: recentRequests?.length || 0,
    requestsData: recentRequests || [],
    transactionsData: recentTransactions || []
  };
}

export function aggregateDailyVolume(transactions: Transaction[], daysCount = 30) {
  const days = Array.from({ length: daysCount }).map((_, i) => {
    const d = startOfDay(subDays(new Date(), daysCount - 1 - i));
    return {
      date: format(d, "MMM dd"),
      rawDate: d,
      amount: 0
    };
  });

  transactions.forEach(tx => {
    const txDate = format(startOfDay(new Date(tx.created_at)), "MMM dd");
    const day = days.find(d => d.date === txDate);
    if (day) {
      day.amount += Math.abs(tx.amount);
    }
  });

  return days;
}

// ─── Phase 9A.1 Comprehensive Analytics Query Engine ──────────────────────────

/**
 * Calculates Dashboard Summary Metrics across users and request statuses.
 */
export function calculateDashboardSummary(
  profiles: ProfileRow[],
  requests: DeliveryRequestRow[]
): AdminAnalyticsSummary {
  const students = profiles.filter((p) => p.role === "student").length;
  const runners = profiles.filter((p) => p.role === "runner").length;
  const admins = profiles.filter((p) => p.role === "admin").length;
  const totalUsers = profiles.length;

  const totalRequests = requests.length;
  const pending = requests.filter((r) => r.status === "pending").length;
  const accepted = requests.filter((r) => r.status === "accepted").length;
  const pickedUp = requests.filter((r) => r.status === "picked_up").length;
  const inTransit = requests.filter((r) => r.status === "in_transit").length;
  const delivered = requests.filter((r) => r.status === "delivered").length;
  const cancelled = requests.filter((r) => r.status === "cancelled").length;

  return {
    totalUsers,
    students,
    runners,
    admins,
    totalRequests,
    pending,
    accepted,
    pickedUp,
    inTransit,
    delivered,
    cancelled,
  };
}

/**
 * Calculates key delivery performance indicators (KPIs).
 */
export function calculateDeliveryKPIs(summary: AdminAnalyticsSummary): DeliveryKPIs {
  const { totalRequests, delivered, cancelled, pending, accepted, pickedUp, inTransit } = summary;

  const deliverySuccessRate = totalRequests > 0 ? Number(((delivered / totalRequests) * 100).toFixed(1)) : 0;
  const cancellationRate = totalRequests > 0 ? Number(((cancelled / totalRequests) * 100).toFixed(1)) : 0;
  const activeDeliveryCount = pending + accepted + pickedUp + inTransit;
  const averageRequestsPerDay = Number((totalRequests / 30).toFixed(1));

  return {
    deliverySuccessRate,
    cancellationRate,
    activeDeliveryCount,
    averageRequestsPerDay,
  };
}

/**
 * Aggregates 30-day trend data for requests, deliveries, and new users.
 */
export function calculateAnalyticsTrends(
  profiles: ProfileRow[],
  requests: DeliveryRequestRow[]
): AnalyticsTrendData {
  const days = Array.from({ length: 30 }).map((_, i) => {
    const d = startOfDay(subDays(new Date(), 29 - i));
    const dateStr = format(d, "MMM dd");
    const rawDate = format(d, "yyyy-MM-dd");
    return { date: dateStr, rawDate, count: 0 };
  });

  const requestsByDay: DailyTrendPoint[] = days.map((d) => ({ ...d }));
  const deliveriesByDay: DailyTrendPoint[] = days.map((d) => ({ ...d }));
  const newUsersByDay: DailyTrendPoint[] = days.map((d) => ({ ...d }));

  // Map requests by day
  requests.forEach((req) => {
    const reqDate = format(startOfDay(new Date(req.created_at)), "MMM dd");
    const reqSlot = requestsByDay.find((d) => d.date === reqDate);
    if (reqSlot) {
      reqSlot.count += 1;
    }

    if (req.status === "delivered") {
      const delSlot = deliveriesByDay.find((d) => d.date === reqDate);
      if (delSlot) {
        delSlot.count += 1;
      }
    }
  });

  // Map user registration by day
  profiles.forEach((profile) => {
    const userDate = format(startOfDay(new Date(profile.created_at)), "MMM dd");
    const userSlot = newUsersByDay.find((d) => d.date === userDate);
    if (userSlot) {
      userSlot.count += 1;
    }
  });

  return {
    requestsByDay,
    deliveriesByDay,
    newUsersByDay,
  };
}

/**
 * Calculates runner performance and assignment metrics.
 */
export function calculateRunnerMetrics(
  profiles: ProfileRow[],
  assignments: DeliveryAssignmentRow[]
): RunnerMetricsSummary {
  const profileMap = new Map(profiles.map((p) => [p.id, p]));
  const runnerHandledMap: Record<string, number> = {};
  const runnerCompletedMap: Record<string, number> = {};

  assignments.forEach((assign) => {
    const runnerId = assign.runner_id;
    runnerHandledMap[runnerId] = (runnerHandledMap[runnerId] || 0) + 1;
    if (assign.status === "completed") {
      runnerCompletedMap[runnerId] = (runnerCompletedMap[runnerId] || 0) + 1;
    }
  });

  const topRunners: RunnerMetric[] = Object.keys(runnerHandledMap).map((runnerId) => {
    const profile = profileMap.get(runnerId);
    return {
      runnerId,
      runnerName: profile?.full_name || `Runner #${runnerId.substring(0, 6)}`,
      completedCount: runnerCompletedMap[runnerId] || 0,
      totalHandled: runnerHandledMap[runnerId] || 0,
    };
  }).sort((a, b) => b.completedCount - a.completedCount);

  return {
    topRunners,
    requestsHandledPerRunner: runnerHandledMap,
    completedDeliveriesPerRunner: runnerCompletedMap,
  };
}

/**
 * Calculates student request creation metrics.
 */
export function calculateStudentMetrics(
  profiles: ProfileRow[],
  requests: DeliveryRequestRow[]
): StudentMetricsSummary {
  const profileMap = new Map(profiles.map((p) => [p.id, p]));
  const studentRequestMap: Record<string, number> = {};

  requests.forEach((req) => {
    const studentId = req.requester_id;
    studentRequestMap[studentId] = (studentRequestMap[studentId] || 0) + 1;
  });

  const topStudents: StudentMetric[] = Object.keys(studentRequestMap).map((studentId) => {
    const profile = profileMap.get(studentId);
    return {
      studentId,
      studentName: profile?.full_name || `Student #${studentId.substring(0, 6)}`,
      requestCount: studentRequestMap[studentId] || 0,
    };
  }).sort((a, b) => b.requestCount - a.requestCount);

  return {
    topStudents,
    requestsCreatedPerStudent: studentRequestMap,
  };
}

/**
 * Computes full admin analytics from datasets, optional date filtering.
 */
export function computeAdminAnalyticsFromData(
  allProfiles: ProfileRow[],
  allRequests: DeliveryRequestRow[],
  allAssignments: DeliveryAssignmentRow[],
  filterState?: AnalyticsFilterState
): FullAdminAnalytics {
  let profiles = allProfiles;
  let requests = allRequests;
  let assignments = allAssignments;

  if (filterState) {
    const bounds = getDateRangeBounds(filterState);
    requests = filterDatasetByDate(requests, bounds, (r) => r.created_at);
    assignments = filterDatasetByDate(assignments, bounds, (a) => a.assigned_at);
    if (filterState.quickRange !== "all_time") {
      profiles = filterDatasetByDate(profiles, bounds, (p) => p.created_at);
    }
  }

  const summary = calculateDashboardSummary(allProfiles, requests);
  const kpis = calculateDeliveryKPIs(summary);
  const trends = calculateAnalyticsTrends(profiles, requests);
  const runnerMetrics = calculateRunnerMetrics(allProfiles, assignments);
  const studentMetrics = calculateStudentMetrics(allProfiles, requests);

  return {
    summary,
    kpis,
    trends,
    runnerMetrics,
    studentMetrics,
  };
}

/**
 * Master server-side query function to fetch and compute full admin analytics.
 */
export async function getComprehensiveAdminAnalytics(
  supabase: SupabaseClient<Database>,
  filterState?: AnalyticsFilterState
): Promise<FullAdminAnalytics> {
  const [profilesRes, requestsRes, assignmentsRes] = await Promise.all([
    supabase.from("profiles").select("*"),
    supabase.from("delivery_requests").select("*"),
    supabase.from("delivery_assignments").select("*"),
  ]);

  const profiles: ProfileRow[] = profilesRes.data || [];
  const requests: DeliveryRequestRow[] = requestsRes.data || [];
  const assignments: DeliveryAssignmentRow[] = assignmentsRes.data || [];

  return computeAdminAnalyticsFromData(profiles, requests, assignments, filterState);
}
