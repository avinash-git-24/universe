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

/**
 * Retrieves pending requests with their items for the runner dashboard.
 */
export async function getPendingRequestsWithItems(
  supabase: SupabaseClient<Database>
): Promise<RequestWithItems[]> {
  const { data, error } = await supabase
    .from("delivery_requests")
    .select(`
      *,
      items:request_items(*)
    `)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching pending requests:", error);
    return [];
  }

  return data as unknown as RequestWithItems[];
}

export type AssignmentWithRequest = Database["public"]["Tables"]["delivery_assignments"]["Row"] & {
  request: RequestWithItems;
};

/**
 * Retrieves the currently active assignment for a runner.
 */
export async function getActiveRunnerAssignment(
  supabase: SupabaseClient<Database>,
  runnerId: string
): Promise<AssignmentWithRequest | null> {
  const { data, error } = await supabase
    .from("delivery_assignments")
    .select(`
      *,
      request:delivery_requests(
        *,
        items:request_items(*)
      )
    `)
    .eq("runner_id", runnerId)
    .eq("status", "active")
    .single();

  if (error && error.code !== "PGRST116") { // Ignore no rows found
    console.error("Error fetching active assignment:", error);
    return null;
  }

  return data as unknown as AssignmentWithRequest | null;
}

/**
 * Accepts a delivery request, assigning it to the runner.
 */
export async function acceptRequest(
  supabase: SupabaseClient<Database>,
  requestId: string,
  runnerId: string
): Promise<boolean> {
  // 1. Update request status
  const { error: reqError } = await supabase
    .from("delivery_requests")
    .update({ status: "accepted" })
    .eq("id", requestId)
    .eq("status", "pending"); // Concurrency check

  if (reqError) {
    console.error("Error accepting request:", reqError);
    return false;
  }

  // 2. Create assignment
  const { error: assignError } = await supabase
    .from("delivery_assignments")
    .insert({
      request_id: requestId,
      runner_id: runnerId,
      status: "active",
    });

  if (assignError) {
    console.error("Error creating assignment:", assignError);
    return false;
  }

  return true;
}

/**
 * Updates the status of an active request and optionally its assignment.
 */
export async function updateRequestStatus(
  supabase: SupabaseClient<Database>,
  requestId: string,
  newStatus: Database["public"]["Enums"]["request_status"]
): Promise<boolean> {
  const { error: reqError } = await supabase
    .from("delivery_requests")
    .update({ status: newStatus })
    .eq("id", requestId);

  if (reqError) {
    console.error("Error updating request status:", reqError);
    return false;
  }

  // If delivered or cancelled, mark assignment as completed/cancelled
  if (newStatus === "delivered" || newStatus === "cancelled") {
    const assignmentStatus: Database["public"]["Enums"]["assignment_status"] = newStatus === "delivered" ? "completed" : "cancelled";
    
    await supabase
      .from("delivery_assignments")
      .update({ 
        status: assignmentStatus,
        completed_at: new Date().toISOString()
      })
      .eq("request_id", requestId)
      .eq("status", "active");
  }

  return true;
}
