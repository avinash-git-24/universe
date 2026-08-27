import { getUser } from "@/lib/supabase/queries";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
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
    // Attempt to ensure a conversation exists
    const convId = await getOrCreateConversation(supabase, user.id, startWithUserId, requestId || null);
    if (convId) {
      redirect(`/dashboard/chat?id=${convId}`);
    } else {
      redirect("/dashboard/chat");
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const activeAssign = (req.assignments as any[])?.find(
          (a) => a.status === "active" || a.status === "completed"
        );
        if (activeAssign?.runner) {
          const runnerId = activeAssign.runner.id;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const itemNames = (req.items as any[])?.map((i) => i.name).join(", ") || "Delivery";

          if (!contactMap.has(runnerId)) {
            contactMap.set(runnerId, {
              otherUserId: runnerId,
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const req = (a as any).request;
        if (req?.requester) {
          const requesterId = req.requester.id;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const itemNames = (req.items as any[])?.map((i) => i.name).join(", ") || "Delivery";

          if (!contactMap.has(requesterId)) {
            contactMap.set(requesterId, {
              otherUserId: requesterId,
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
    <div className="min-h-[calc(100vh-4rem)] bg-background">
      <div className="max-w-[1400px] mx-auto p-4 md:p-8 h-full flex flex-col pt-12 md:pt-24 space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Messages</h1>
          <p className="text-white/50 mt-1">Chat in real-time about your deliveries.</p>
        </div>
        
        <ChatClient
          userId={user.id}
          initialConversations={initialConversations}
          activeDeliveries={activeDeliveries}
        />
      </div>
    </div>
  );
}
