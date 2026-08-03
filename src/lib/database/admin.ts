import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/types/database";
import { Profile, StudentRequestWithDetails } from "./requests";

export interface AdminProfile extends Omit<Profile, 'role'> {
  role: "student" | "runner" | "admin";
  account_status: "active" | "suspended";
}

export type AdminPlatformRequest = StudentRequestWithDetails & {
  requester?: Profile;
};

/**
 * Fetches all users on the platform.
 */
export async function getAllUsers(supabase: SupabaseClient<Database>): Promise<AdminProfile[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching all users:", error);
    return [];
  }

  return data as unknown as AdminProfile[];
}

/**
 * Updates a user's account status (e.g. suspending a runner).
 */
export async function updateUserStatus(
  supabase: SupabaseClient<Database>,
  userId: string,
  newStatus: "active" | "suspended"
): Promise<boolean> {
  const { error } = await supabase
    .from("profiles")
    .update({ account_status: newStatus })
    .eq("id", userId);

  if (error) {
    console.error("Error updating user status:", error);
    return false;
  }

  return true;
}

/**
 * Fetches all delivery requests across the platform.
 */
export async function getAllPlatformRequests(
  supabase: SupabaseClient<Database>
): Promise<AdminPlatformRequest[]> {
  const { data, error } = await supabase
    .from("delivery_requests")
    .select(`
      *,
      items:request_items(*),
      assignments:delivery_assignments(
        *,
        runner:profiles(*)
      ),
      requester:profiles!requester_id(*)
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching all requests:", error);
    return [];
  }

  return data as unknown as AdminPlatformRequest[];
}

/**
 * Calculates high-level platform statistics.
 */
export async function getPlatformStats(supabase: SupabaseClient<Database>) {
  const [users, requests] = await Promise.all([
    getAllUsers(supabase),
    getAllPlatformRequests(supabase)
  ]);

  const students = users.filter(u => u.role === "student").length;
  const runners = users.filter(u => u.role === "runner").length;
  const totalRequests = requests.length;
  
  const completedRequests = requests.filter(r => r.status === "delivered");
  const activeRequests = requests.filter(r => !["delivered", "cancelled"].includes(r.status));
  
  const totalRevenue = completedRequests.reduce((sum, req) => sum + Number(req.delivery_fee), 0);

  return {
    totalUsers: users.length,
    students,
    runners,
    totalRequests,
    activeRequests: activeRequests.length,
    completedRequests: completedRequests.length,
    totalRevenue
  };
}
