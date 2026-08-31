import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/types/database";
import { Profile, DeliveryRequest } from "./requests";

export type Message = Database["public"]["Tables"]["messages"]["Row"];
export type Conversation = Database["public"]["Tables"]["conversations"]["Row"];
export type ResaleListing = Database["public"]["Tables"]["resale_listings"]["Row"];

export interface ConversationWithDetails extends Conversation {
  other_participant: Profile;
  last_message?: Message;
  unread_count: number;
  delivery_request?: DeliveryRequest;
  resale_listing?: ResaleListing;
  other_last_read_at?: string | null;
}

/**
 * Fetches all active conversations for a user.
 */
export async function getConversations(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<ConversationWithDetails[]> {
  try {
    // First get the conversation IDs the user is a part of
    const { data: participants, error: pError } = await supabase
      .from("conversation_participants")
      .select("conversation_id")
      .eq("profile_id", userId);

    if (pError || !participants || participants.length === 0) return [];

    const conversationIds = participants.map((p) => p.conversation_id);

    // Fetch the conversations with other participants and latest message
    const { data: conversations, error: cError } = await supabase
      .from("conversations")
      .select(`
        *,
        participants:conversation_participants(
          profile_id,
          last_read_at,
          profile:profiles(*)
        ),
        messages(
          *
        ),
        delivery_request:delivery_requests(*),
        resale_listing:resale_listings(*)
      `)
      .in("id", conversationIds)
      .order("updated_at", { ascending: false });

    if (cError || !conversations) {
      console.error("Error fetching conversations:", cError);
      return [];
    }

    // Map and calculate unread counts safely
    const mapped: ConversationWithDetails[] = await Promise.all(
      conversations.map(async (conv) => {
        const participantList = (conv.participants || []) as Array<{
          profile_id: string;
          last_read_at: string | null;
          profile?: Profile | null;
        }>;

        // Find the other participant record (or own record if self-conversation)
        const otherRecord = participantList.find((p) => p.profile_id !== userId) || participantList.find((p) => p.profile_id === userId);
        const myRecord = participantList.find((p) => p.profile_id === userId);

        let otherParticipant: Profile | null = otherRecord?.profile || null;

        // If profile wasn't populated via relation join, fetch it directly
        if (!otherParticipant && otherRecord?.profile_id) {
          const { data: prof } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", otherRecord.profile_id)
            .single();
          otherParticipant = prof as Profile | null;
        }

        // Final fallback profile to prevent UI crashes
        if (!otherParticipant) {
          otherParticipant = {
            id: otherRecord?.profile_id || "unknown",
            full_name: "University Student",
            avatar_url: null,
            role: "student",
            enrollment_number: null,
            account_status: "active",
            department: null,
            semester: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          } as unknown as Profile;
        }

        const lastReadAt = myRecord?.last_read_at ? new Date(myRecord.last_read_at) : new Date(0);
        
        const rawMessages = (conv.messages || []) as Message[];
        const sortedMessages = [...rawMessages].sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

        const unreadCount = sortedMessages.filter(
          (m) => m.sender_id !== userId && new Date(m.created_at) > lastReadAt
        ).length;

        return {
          ...conv,
          other_participant: otherParticipant,
          last_message: sortedMessages[0] || null,
          unread_count: unreadCount,
          delivery_request: conv.delivery_request || undefined,
          resale_listing: conv.resale_listing || undefined,
          other_last_read_at: otherRecord?.last_read_at || null,
        } as ConversationWithDetails;
      })
    );

    return mapped;
  } catch (err) {
    console.error("Critical error in getConversations:", err);
    return [];
  }
}

/**
 * Fetches a single conversation by its ID with full details.
 */
export async function getConversationById(
  supabase: SupabaseClient<Database>,
  conversationId: string,
  userId: string
): Promise<ConversationWithDetails | null> {
  try {
    const { data: conv, error: cError } = await supabase
      .from("conversations")
      .select(`
        *,
        participants:conversation_participants(
          profile_id,
          last_read_at,
          profile:profiles(*)
        ),
        messages(
          *
        ),
        delivery_request:delivery_requests(*)
      `)
      .eq("id", conversationId)
      .single();

    if (cError || !conv) {
      console.error("Error fetching single conversation:", cError);
      return null;
    }

    const participantList = (conv.participants || []) as Array<{
      profile_id: string;
      last_read_at: string | null;
      profile?: Profile | null;
    }>;

    const otherRecord = participantList.find((p) => p.profile_id !== userId) || participantList.find((p) => p.profile_id === userId);
    const myRecord = participantList.find((p) => p.profile_id === userId);

    let otherParticipant: Profile | null = otherRecord?.profile || null;

    if (!otherParticipant && otherRecord?.profile_id) {
      const { data: prof } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", otherRecord.profile_id)
        .single();
      otherParticipant = prof as Profile | null;
    }

    if (!otherParticipant) {
      otherParticipant = {
        id: otherRecord?.profile_id || "unknown",
        full_name: "University Student",
        avatar_url: null,
        role: "student",
        enrollment_number: null,
        account_status: "active",
        department: null,
        semester: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as unknown as Profile;
    }

    const lastReadAt = myRecord?.last_read_at ? new Date(myRecord.last_read_at) : new Date(0);
    const rawMessages = (conv.messages || []) as Message[];
    const sortedMessages = [...rawMessages].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    const unreadCount = sortedMessages.filter(
      (m) => m.sender_id !== userId && new Date(m.created_at) > lastReadAt
    ).length;

    return {
      ...conv,
      other_participant: otherParticipant,
      last_message: sortedMessages[0] || null,
      unread_count: unreadCount,
      delivery_request: conv.delivery_request || undefined,
      other_last_read_at: otherRecord?.last_read_at || null,
    } as ConversationWithDetails;
  } catch (err) {
    console.error("Error in getConversationById:", err);
    return null;
  }
}

/**
 * Gets or creates a 1-on-1 conversation between two users.
 * KEY RULE: One conversation per unique user pair. If a conversation already
 * exists between userId1 and userId2, we return that — regardless of requestId.
 */
export async function getOrCreateConversation(
  supabase: SupabaseClient<Database>,
  userId1: string,
  userId2: string,
  requestId?: string | null
): Promise<string | null> {
  if (!userId1 || !userId2) {
    return null;
  }

  try {
    const trimmedReqId = requestId && requestId.trim() ? requestId.trim() : null;

    // 1. Find any existing shared conversation between these 2 users
    const { data: myConvs } = await supabase
      .from("conversation_participants")
      .select("conversation_id")
      .eq("profile_id", userId1);

    if (myConvs && myConvs.length > 0) {
      const convIds = myConvs.map((c) => c.conversation_id);

      if (userId1 === userId2) {
        const existingConvId = convIds[0];
        if (trimmedReqId) {
          await supabase
            .from("conversations")
            .update({ request_id: trimmedReqId, updated_at: new Date().toISOString() })
            .eq("id", existingConvId);
        }
        return existingConvId;
      }

      const { data: otherConvs } = await supabase
        .from("conversation_participants")
        .select("conversation_id")
        .eq("profile_id", userId2)
        .in("conversation_id", convIds);

      if (otherConvs && otherConvs.length > 0) {
        const existingConvId = otherConvs[0].conversation_id;
        // Optionally update the conversation to link to the latest delivery request
        if (trimmedReqId) {
          await supabase
            .from("conversations")
            .update({ request_id: trimmedReqId, updated_at: new Date().toISOString() })
            .eq("id", existingConvId);
        }
        return existingConvId;
      }
    }

    // 2. No existing conversation — create one
    // Try RPC first (handles RLS via SECURITY DEFINER)
    try {
      const { data: rpcConvId, error: rpcError } = await supabase.rpc("create_delivery_conversation", {
        p_other_user_id: userId2,
        p_request_id: trimmedReqId,
      });

      if (!rpcError && rpcConvId) {
        return rpcConvId;
      }
    } catch {
      // RPC not available, proceed to fallback
    }

    // Fallback: Direct table insert
    let newConvId: string | null = null;

    // Try inserting with request_id first
    if (trimmedReqId) {
      const { data: convWithReq } = await supabase
        .from("conversations")
        .insert({ request_id: trimmedReqId })
        .select("id")
        .single();
      if (convWithReq?.id) {
        newConvId = convWithReq.id;
      }
    }

    // If no request_id or if insert with request_id failed (e.g. FK constraint)
    if (!newConvId) {
      const { data: convWithoutReq, error: insertError } = await supabase
        .from("conversations")
        .insert({})
        .select("id")
        .single();

      if (insertError || !convWithoutReq) {
        console.error("Error creating conversation fallback:", insertError);
        return null;
      }
      newConvId = convWithoutReq.id;
    }

    // Insert participants (unique list to avoid duplicate keys)
    const uniqueParticipants = Array.from(new Set([userId1, userId2]));
    await supabase.from("conversation_participants").insert(
      uniqueParticipants.map((pid) => ({
        conversation_id: newConvId!,
        profile_id: pid,
      }))
    );

    return newConvId;
  } catch (err) {
    console.error("Error in getOrCreateConversation:", err);
    return null;
  }
}

/**
 * Gets or creates a 1-on-1 conversation between a buyer and seller for a specific listing.
 */
export async function getOrCreateMarketplaceConversation(
  supabase: SupabaseClient<Database>,
  buyerId: string,
  sellerId: string,
  listingId: string
): Promise<string | null> {
  const { data, error } = await supabase.rpc("create_marketplace_conversation", {
    p_listing_id: listingId,
  });

  if (error || !data) {
    console.error("Error creating marketplace conversation:", error);
    return null;
  }

  return data;
}

/**
 * Loads historical messages for a conversation.
 */
export async function getMessages(
  supabase: SupabaseClient<Database>,
  conversationId: string
): Promise<Message[]> {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error) return [];
  return data;
}

/**
 * Sends a new message.
 */
export async function sendMessage(
  supabase: SupabaseClient<Database>,
  conversationId: string,
  senderId: string,
  content: string,
  imageUrl?: string | null,
  messageType: string = "text",
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata?: any | null
): Promise<Message | null> {
  const { data, error } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversationId,
      sender_id: senderId,
      content,
      image_url: imageUrl,
      message_type: messageType,
      metadata: metadata || null,
    })
    .select("*")
    .single();

  if (error) {
    console.error("Error sending message:", error);
    return null;
  }
  
  // Touch the conversation to update its updated_at timestamp
  await supabase
    .from("conversations")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", conversationId);

  return data;
}

/**
 * Marks all messages in a conversation as read up to this point.
 */
export async function markConversationAsRead(
  supabase: SupabaseClient<Database>,
  conversationId: string,
  userId: string
) {
  // Update participant's last read time
  await supabase
    .from("conversation_participants")
    .update({ last_read_at: new Date().toISOString() })
    .eq("conversation_id", conversationId)
    .eq("profile_id", userId);

  // Update statuses of unread messages sent by the OTHER person
  await supabase
    .from("messages")
    .update({ status: "read" })
    .eq("conversation_id", conversationId)
    .neq("sender_id", userId)
    .in("status", ["sent", "delivered"]);
}

/**
 * Uploads an image to the chat_images bucket and returns the public URL.
 */
export async function uploadChatImage(
  supabase: SupabaseClient<Database>,
  conversationId: string,
  file: File
): Promise<string | null> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
    const filePath = `${conversationId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('chat_images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error("Error uploading chat image:", uploadError);
      return null;
    }

    const { data } = supabase.storage
      .from('chat_images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  } catch (error) {
    console.error("Exception uploading chat image:", error);
    return null;
  }
}
