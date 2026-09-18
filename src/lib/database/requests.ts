import { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export type DeliveryRequest = Database["public"]["Tables"]["delivery_requests"]["Row"];
export type RequestItem = Database["public"]["Tables"]["request_items"]["Row"];

export type RequestWithItems = DeliveryRequest & {
  items: RequestItem[];
};

/**
 * Automatically purges unaccepted pending delivery requests older than 6 hours.
 */
export async function purgeExpiredPendingRequests(
  supabase: SupabaseClient<Database>
): Promise<number> {
  try {
    // 1. Try calling the PostgreSQL RPC function
    const { data: rpcCount, error: rpcErr } = await supabase.rpc(
      "cleanup_expired_delivery_requests" as any
    );
    if (!rpcErr && typeof rpcCount === "number") {
      return rpcCount;
    }

    // 2. Client-side fallback delete
    const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString();
    const { data: deleted, error } = await supabase
      .from("delivery_requests")
      .delete()
      .eq("status", "pending")
      .lt("created_at", sixHoursAgo)
      .select("id");

    if (error) {
      return 0;
    }

    return deleted?.length || 0;
  } catch {
    return 0;
  }
}

/**
 * Retrieves all pending delivery requests (unexpired, within last 6 hours).
 */
export async function getPendingRequests(
  supabase: SupabaseClient<Database>
): Promise<DeliveryRequest[]> {
  const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from("delivery_requests")
    .select("*")
    .eq("status", "pending")
    .gte("created_at", sixHoursAgo)
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
  // Generate a unique 4-digit security PIN for this specific order
  const freshOtp = Math.floor(1000 + Math.random() * 9000).toString();

  // 1. Insert the request
  const { data: request, error: requestError } = await supabase
    .from("delivery_requests")
    .insert({
      ...requestData,
      requester_id: requesterId,
      delivery_otp: requestData.delivery_otp || freshOtp,
    })
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
 * - Filters out requests older than 6 hours (auto-expiration).
 * - Optionally filters out requests created by the current user to prevent self-delivery.
 */
export async function getPendingRequestsWithItems(
  supabase: SupabaseClient<Database>,
  currentUserId?: string
): Promise<RequestWithItems[]> {
  // Fire background purge of expired requests
  purgeExpiredPendingRequests(supabase).catch(() => {});

  const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString();

  let query = supabase
    .from("delivery_requests")
    .select(`
      *,
      items:request_items(*)
    `)
    .eq("status", "pending")
    .gte("created_at", sixHoursAgo);

  if (currentUserId) {
    query = query.neq("requester_id", currentUserId);
  }

  const { data, error } = await query.order("created_at", { ascending: false });

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
 * Retrieves all active delivery assignments for a runner.
 */
export async function getRunnerActiveDeliveries(
  supabase: SupabaseClient<Database>,
  runnerId: string
): Promise<AssignmentWithRequest[]> {
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
    .order("assigned_at", { ascending: false });

  if (error) {
    console.error("Error fetching runner active deliveries:", error);
    return [];
  }

  return (data as unknown as AssignmentWithRequest[]) || [];
}

/**
 * Retrieves past delivery assignments for a runner (completed or cancelled).
 */
export async function getRunnerDeliveryHistory(
  supabase: SupabaseClient<Database>,
  runnerId: string
): Promise<AssignmentWithRequest[]> {
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
    .in("status", ["completed", "cancelled"])
    .order("assigned_at", { ascending: false });

  if (error) {
    console.error("Error fetching runner delivery history:", error);
    return [];
  }

  return (data as unknown as AssignmentWithRequest[]) || [];
}

/**
 * Accepts a delivery request, assigning it to the runner.
 * Order: create assignment first → then update request status.
 * This ensures the RLS policy ("runner can update assigned requests") is satisfied.
 */
export async function acceptRequest(
  supabase: SupabaseClient<Database>,
  requestId: string,
  runnerId: string
): Promise<boolean> {
  // 0. Anti-fraud check: Ensure request exists, is pending, not expired (>6h), and runner is NOT requester
  const { data: targetReq, error: fetchErr } = await supabase
    .from("delivery_requests")
    .select("requester_id, status, created_at")
    .eq("id", requestId)
    .single();

  if (fetchErr || !targetReq) {
    console.error("acceptRequest – request not found:", fetchErr);
    return false;
  }

  if (targetReq.status !== "pending") {
    console.warn("acceptRequest – request is not pending:", targetReq.status);
    return false;
  }

  if (targetReq.requester_id === runnerId) {
    console.warn("acceptRequest – self-delivery blocked: requester cannot be runner for their own order", {
      requester_id: targetReq.requester_id,
      runner_id: runnerId,
    });
    return false;
  }

  const sixHoursAgoMs = 6 * 60 * 60 * 1000;
  if (Date.now() - new Date(targetReq.created_at).getTime() > sixHoursAgoMs) {
    console.warn("acceptRequest – request has expired (older than 6 hours)");
    return false;
  }

  // 1. Create the assignment row first (so RLS policy is satisfied for status update)
  const { error: assignError } = await supabase
    .from("delivery_assignments")
    .insert({
      request_id: requestId,
      runner_id: runnerId,
      status: "active",
    });

  if (assignError) {
    console.error("acceptRequest – assignment insert failed:", JSON.stringify(assignError, null, 2), assignError);
    return false;
  }

  // 2. Now update the request status to "accepted"
  const { error: reqError, count } = await supabase
    .from("delivery_requests")
    .update({ status: "accepted" })
    .eq("id", requestId)
    .eq("status", "pending"); // Concurrency guard: only accept if still pending

  if (reqError) {
    console.error("acceptRequest – status update failed:", {
      code: reqError.code,
      message: reqError.message,
      details: reqError.details,
      hint: reqError.hint,
    });
    // Rollback: remove the assignment we just created
    await supabase
      .from("delivery_assignments")
      .delete()
      .eq("request_id", requestId)
      .eq("runner_id", runnerId);
    return false;
  }

  // If count is 0, the request was already accepted by another runner → rollback
  if (count === 0) {
    console.warn("acceptRequest – request already taken, rolling back assignment");
    await supabase
      .from("delivery_assignments")
      .delete()
      .eq("request_id", requestId)
      .eq("runner_id", runnerId);
    return false;
  }

  // 3. Automatically initialize the conversation between requester and runner
  try {
    const { data: reqData } = await supabase
      .from("delivery_requests")
      .select("requester_id")
      .eq("id", requestId)
      .single();

    if (reqData?.requester_id && reqData.requester_id !== runnerId) {
      await supabase.rpc("create_delivery_conversation", {
        p_other_user_id: reqData.requester_id,
        p_request_id: requestId,
      });

      // Send immediate notification to requester
      fetch("/api/notifications/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: reqData.requester_id,
          title: "🎉 Request Accepted!",
          message: "A campus runner has accepted your delivery request and is on the way!",
          type: "status_accepted",
          referenceId: requestId,
        }),
      }).catch((e) => console.error("Non-blocking notification error on accept:", e));
    }
  } catch (convErr) {
    console.error("Non-blocking error initializing conversation on accept:", convErr);
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

/**
 * Cancels multiple delivery requests owned by the student in one batch (e.g. stale or unfulfilled requests).
 */
export async function cancelMultipleRequests(
  supabase: SupabaseClient<Database>,
  requestIds: string[]
): Promise<boolean> {
  if (!requestIds || requestIds.length === 0) return true;

  const { error: reqError } = await supabase
    .from("delivery_requests")
    .update({ status: "cancelled" })
    .in("id", requestIds);

  if (reqError) {
    console.error("Error cancelling multiple requests:", reqError);
    return false;
  }

  // Also cancel any active assignments for these requests
  await supabase
    .from("delivery_assignments")
    .update({
      status: "cancelled",
      completed_at: new Date().toISOString(),
    })
    .in("request_id", requestIds)
    .eq("status", "active");

  return true;
}

/**
 * Verifies 4-digit PIN with database RPC and securely completes delivery.
 */
export async function completeDeliveryWithOtp(
  supabase: SupabaseClient<Database>,
  requestId: string,
  otp: string
): Promise<{ success: boolean; message: string; error?: string }> {
  try {
    const { data, error } = await (supabase as any).rpc("verify_and_complete_delivery", {
      p_request_id: requestId,
      p_entered_otp: otp.trim(),
    });

    if (error) {
      return { success: false, message: error.message || "Failed to verify OTP", error: error.code };
    }

    if (data && typeof data === "object") {
      return data as { success: boolean; message: string; error?: string };
    }

    return { success: true, message: "Delivery completed successfully!" };
  } catch (err: any) {
    return { success: false, message: err?.message || "Unexpected verification error", error: "UNKNOWN" };
  }
}

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export type AssignmentWithRunner = Database["public"]["Tables"]["delivery_assignments"]["Row"] & {
  runner: Profile | null;
};

export type StudentRequestWithDetails = RequestWithItems & {
  assignments: AssignmentWithRunner[];
};

/**
 * Retrieves all requests made by a specific student, including items and runner assignments.
 */
export async function getStudentRequests(
  supabase: SupabaseClient<Database>,
  studentId: string
): Promise<StudentRequestWithDetails[]> {
  const { data, error } = await supabase
    .from("delivery_requests")
    .select(`
      *,
      items:request_items(*),
      assignments:delivery_assignments(
        *,
        runner:profiles(*)
      )
    `)
    .eq("requester_id", studentId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching student requests:", error);
    return [];
  }

  return data as unknown as StudentRequestWithDetails[];
}

/**
 * Retrieves full details of a specific request for a student.
 */
export async function getStudentRequestDetails(
  supabase: SupabaseClient<Database>,
  requestId: string,
  studentId: string
): Promise<StudentRequestWithDetails | null> {
  const { data, error } = await supabase
    .from("delivery_requests")
    .select(`
      *,
      items:request_items(*),
      assignments:delivery_assignments(
        *,
        runner:profiles(*)
      )
    `)
    .eq("id", requestId)
    .eq("requester_id", studentId) // Ensure ownership
    .single();

  if (error) {
    console.error("Error fetching request details:", error);
    return null;
  }

  return data as unknown as StudentRequestWithDetails;
}

