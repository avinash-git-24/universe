import { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export type DeliveryRequest = Database["public"]["Tables"]["delivery_requests"]["Row"];
export type RequestItem = Database["public"]["Tables"]["request_items"]["Row"];

export type RequestWithItems = DeliveryRequest & {
  items: RequestItem[];
};

/**
 * Retrieves all pending delivery requests.
 */
export async function getPendingRequests(
  supabase: SupabaseClient<Database>
): Promise<DeliveryRequest[]> {
  const { data, error } = await supabase
    .from("delivery_requests")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching pending requests:", error);
    return [];
  }

  return data;
}

/**
 * Retrieves a specific delivery request along with its items.
 */
export async function getRequestWithItems(
  supabase: SupabaseClient<Database>,
  requestId: string
): Promise<RequestWithItems | null> {
  const { data, error } = await supabase
    .from("delivery_requests")
    .select(`
      *,
      items:request_items(*)
    `)
    .eq("id", requestId)
    .single();

  if (error) {
    console.error("Error fetching request:", error);
    return null;
  }

  // The types returned by join queries can sometimes be overly broad
  return data as unknown as RequestWithItems;
}
