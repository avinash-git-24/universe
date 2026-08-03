import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/types/database";

export type Notification = Database["public"]["Tables"]["notifications"]["Row"];

/**
 * Fetches the most recent notifications for a specific user.
 */
export async function getUserNotifications(
  supabase: SupabaseClient<Database>,
  userId: string,
  limit = 20
): Promise<Notification[]> {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching notifications:", error);
    return [];
  }

  return data;
}

/**
 * Marks a specific notification as read.
 */
export async function markNotificationAsRead(
  supabase: SupabaseClient<Database>,
  notificationId: string
): Promise<boolean> {
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", notificationId);

  if (error) {
    console.error("Error marking notification as read:", error);
    return false;
  }

  return true;
}

/**
 * Marks all unread notifications as read for a specific user.
 */
export async function markAllNotificationsAsRead(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<boolean> {
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", userId)
    .eq("is_read", false);

  if (error) {
    console.error("Error marking all notifications as read:", error);
    return false;
  }

  return true;
}
