import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/types/database";
import { startOfDay, subDays, format } from "date-fns";

export async function getUserAnalytics(
  supabase: SupabaseClient<Database>,
  userId: string,
  role: "student" | "runner"
) {
  // Common time frame: last 30 days
  const thirtyDaysAgo = subDays(new Date(), 30).toISOString();

  if (role === "student") {
    // Student specific: requests and spending
    const { data: requests } = await supabase
      .from("delivery_requests")
      .select("*")
      .eq("requester_id", userId)
      .gte("created_at", thirtyDaysAgo);

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
        .eq("type", "payment") // outgoing payments for deliveries
        .gte("created_at", thirtyDaysAgo);
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
    // Runner specific: earnings and completed deliveries
    const { data: assignments } = await supabase
      .from("delivery_assignments")
      .select("*, delivery_requests(*)")
      .eq("runner_id", userId)
      .eq("status", "completed")
      .gte("created_at", thirtyDaysAgo);

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
        .eq("type", "earning") // incoming earnings
        .gte("created_at", thirtyDaysAgo);
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
    .eq("type", "payment") // represent true volume moving
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

type Transaction = Database["public"]["Tables"]["transactions"]["Row"];

export function aggregateDailyVolume(transactions: Transaction[]) {
  const days = Array.from({ length: 30 }).map((_, i) => {
    const d = startOfDay(subDays(new Date(), 29 - i));
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
