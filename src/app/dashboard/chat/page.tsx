import { getUser } from "@/lib/supabase/queries";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ROUTES } from "@/constants/routes";
import { getConversations, getOrCreateConversation } from "@/lib/database/chat";
import { ChatClient, type ActiveDeliveryContact } from "@/components/chat/ChatClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Messages · UniVerse",
  description: "Chat with students, runners, and admins.",
};

export default async function ChatPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string; startWithUserId?: string; requestId?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await getUser();

  if (authError || !user) {
    redirect(ROUTES.LOGIN);
  }

  const { startWithUserId, requestId } = await searchParams;

  if (startWithUserId) {
    // Attempt to ensure a conversation exists on the server using authenticated client (or admin if available)
    try {
      const hasRealServiceKey = Boolean(
        process.env.SUPABASE_SERVICE_ROLE_KEY &&
        process.env.SUPABASE_SERVICE_ROLE_KEY !== process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
      );
      const clientToUse = hasRealServiceKey ? createAdminClient() : supabase;
      const convId = await getOrCreateConversation(
        clientToUse,
        user.id,
        startWithUserId.trim(),
        requestId ? String(requestId).trim() : null
      );
      if (convId) {
        redirect(`/dashboard/chat?id=${convId}`);
      }
    } catch (e: any) {
      if (e?.message === "NEXT_REDIRECT" || e?.digest?.startsWith?.("NEXT_REDIRECT")) {
        throw e;
      }
      console.warn("[chat/page] Server-side getOrCreateConversation error:", e);
    }
  }

  const initialConversations = await getConversations(supabase, user.id);

  // Fetch active delivery contacts and GROUP BY person (not per-request)
  const activeDeliveries: ActiveDeliveryContact[] = [];

  // Helper map: otherUserId -> grouped contact
  const contactMap = new Map<string, ActiveDeliveryContact>();

  try {
    // 1. As Requester (fetch requests with assigned runner)
    const { data: requesterRequests } = await supabase
      .from("delivery_requests")
      .select(`
        id,
        pickup_location,
        dropoff_location,
        status,
        created_at,
        items:request_items(name, quantity),
        assignments:delivery_assignments(
          status,
          runner:profiles(*)
        )
      `)
      .eq("requester_id", user.id)
      .in("status", ["accepted", "picked_up", "in_transit", "delivered"])
      .order("created_at", { ascending: false })
      .limit(20);

    if (requesterRequests) {
      for (const req of requesterRequests) {
        const activeAssign = (req.assignments as any[])?.find(
          (a) => a.status === "active" || a.status === "completed"
        );
        if (activeAssign?.runner) {
          const runnerId = activeAssign.runner.id;
          const itemNames = (req.items as any[])?.map((i) => i.name).join(", ") || "Delivery";

          if (!contactMap.has(runnerId)) {
            contactMap.set(runnerId, {
              otherUserId: runnerId,
              requestId: req.id,
              otherUser: activeAssign.runner,
              deliveryCount: 1,
              latestItemsSummary: itemNames,
              latestPickup: req.pickup_location,
              latestDropoff: req.dropoff_location,
              isRunner: false,
            });
          } else {
            const existing = contactMap.get(runnerId)!;
            existing.deliveryCount += 1;
            if (!existing.requestId) existing.requestId = req.id;
          }
        }
      }
    }

    // 2. As Runner (fetch assignments with requester profile)
    const { data: runnerAssignments } = await supabase
      .from("delivery_assignments")
      .select(`
        status,
        request:delivery_requests(
          id,
          pickup_location,
          dropoff_location,
          status,
          created_at,
          requester:profiles(*),
          items:request_items(name, quantity)
        )
      `)
      .eq("runner_id", user.id)
      .in("status", ["active", "completed"])
      .order("assigned_at", { ascending: false })
      .limit(20);

    if (runnerAssignments) {
      for (const a of runnerAssignments) {
        const req = (a as any).request;
        if (req?.requester) {
          const requesterId = req.requester.id;
          const itemNames = (req.items as any[])?.map((i) => i.name).join(", ") || "Delivery";

          if (!contactMap.has(requesterId)) {
            contactMap.set(requesterId, {
              otherUserId: requesterId,
              requestId: req.id,
              otherUser: req.requester,
              deliveryCount: 1,
              latestItemsSummary: itemNames,
              latestPickup: req.pickup_location,
              latestDropoff: req.dropoff_location,
              isRunner: true,
            });
          } else {
            const existing = contactMap.get(requesterId)!;
            existing.deliveryCount += 1;
            if (!existing.requestId) existing.requestId = req.id;
          }
        }
      }
    }
  } catch (err) {
    console.error("Error fetching active delivery contacts for chat:", err);
  }

  // Convert map to array
  activeDeliveries.push(...contactMap.values());

  return (
    <div className="h-[calc(100dvh-60px)] lg:h-screen p-2 sm:p-4 lg:p-6 flex flex-col overflow-hidden">
      <div className="max-w-[1400px] w-full mx-auto h-full flex flex-col min-h-0">
        <ChatClient
          userId={user.id}
          initialConversations={initialConversations}
          activeDeliveries={activeDeliveries}
        />
      </div>
    </div>
  );
}
