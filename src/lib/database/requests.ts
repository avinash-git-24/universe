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

/**
 * Creates a new delivery request and its items.
 */
export async function createDeliveryRequest(
  supabase: SupabaseClient<Database>,
  requesterId: string,
  requestData: Omit<Database["public"]["Tables"]["delivery_requests"]["Insert"], "requester_id">,
  itemsData: Array<Omit<Database["public"]["Tables"]["request_items"]["Insert"], "request_id">>
): Promise<RequestWithItems | null> {
  // 1. Insert the request
  const { data: request, error: requestError } = await supabase
    .from("delivery_requests")
    .insert({ ...requestData, requester_id: requesterId })
    .select()
    .single();

  if (requestError || !request) {
    console.error("Error creating delivery request:", requestError);
    return null;
  }

  // 2. Insert the items linking to the new request_id
  const itemsToInsert = itemsData.map((item) => ({
    ...item,
    request_id: request.id,
  }));

  const { data: items, error: itemsError } = await supabase
    .from("request_items")
    .insert(itemsToInsert)
    .select();

  if (itemsError) {
    console.error("Error creating request items:", itemsError);
    // Note: Since we don't have stored procedures yet, a failure here leaves an empty request.
    // In a full production app, this would be wrapped in a transaction via RPC.
    return { ...request, items: [] };
  }

  return { ...request, items: items ?? [] };
}
