import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/types/database";
import { Profile, DeliveryRequest } from "./requests";

export type Message = Database["public"]["Tables"]["messages"]["Row"];
export type Conversation = Database["public"]["Tables"]["conversations"]["Row"];

export interface ConversationWithDetails extends Conversation {
  other_participant: Profile;
  last_message?: Message;
  unread_count: number;
  delivery_request?: DeliveryRequest;
  other_last_read_at?: string | null;
}

/**
 * Fetches all active conversations for a user.
 */
export async function getConversations(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<ConversationWithDetails[]> {
  // First get the conversation IDs the user is a part of
  const { data: participants, error: pError } = await supabase
    .from("conversation_participants")
    .select("conversation_id")
    .eq("profile_id", userId);

  if (pError || !participants) return [];

  const conversationIds = participants.map((p) => p.conversation_id);
  if (conversationIds.length === 0) return [];

  // Fetch the conversations with other participants and latest message
  const { data: conversations, error: cError } = await supabase
    .from("conversations")
    .select(`
      *,
      participants:conversation_participants(
        last_read_at,
        profile:profiles(*)
      ),
      messages(
        *
      ),
      delivery_request:delivery_requests(*)
    `)
    .in("id", conversationIds)
    .order("updated_at", { ascending: false });

  if (cError || !conversations) return [];

  // Map and calculate unread counts (all messages created after last_read_at)
  const mapped = await Promise.all(
    conversations.map(async (conv) => {
      // Find the other participant
      const otherParticipant = conv.participants.find(
        (p: { profile: { id: string } }) => p.profile.id !== userId
      )?.profile as unknown as Profile;

      // Get my participant record to check last_read_at
      const { data: myParticipant } = await supabase
        .from("conversation_participants")
        .select("last_read_at")
        .eq("conversation_id", conv.id)
        .eq("profile_id", userId)
        .single();

      const lastReadAt = myParticipant?.last_read_at ? new Date(myParticipant.last_read_at) : new Date(0);
      
      const sortedMessages = (conv.messages as Message[]).sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      const unreadCount = sortedMessages.filter(
        (m) => m.sender_id !== userId && new Date(m.created_at) > lastReadAt
      ).length;

      const otherParticipantRecord = conv.participants.find(
        (p: { profile: { id: string }; last_read_at: string | null }) => p.profile.id !== userId
      );

      return {
        ...conv,
        other_participant: otherParticipant,
        last_message: sortedMessages[0],
        unread_count: unreadCount,
        delivery_request: conv.delivery_request || undefined,
        other_last_read_at: otherParticipantRecord?.last_read_at || null,
      };
    })
  );

  return mapped;
}

/**
 * Gets or creates a 1-on-1 conversation between two users.
 */
export async function getOrCreateConversation(
  supabase: SupabaseClient<Database>,
  userId1: string,
  userId2: string,
  requestId: string
): Promise<string | null> {
  // Check if a conversation already exists between these two
  // We can do it via a query

  // If we don't have this RPC, we can do it via a query
  // Find conversations where both users are participants
  const { data: p1 } = await supabase
    .from("conversation_participants")
    .select("conversation_id")
    .eq("profile_id", userId1);

  const { data: p2 } = await supabase
    .from("conversation_participants")
    .select("conversation_id")
    .eq("profile_id", userId2);

  if (p1 && p2) {
    const p1Ids = p1.map((p) => p.conversation_id);
    const p2Ids = p2.map((p) => p.conversation_id);
    const common = p1Ids.filter((id) => p2Ids.includes(id));
    if (common.length > 0) {
      // If a request ID is provided, verify it matches or update it?
      // Actually, just find the specific conversation for this request ID
      const { data: convWithReq } = await supabase
        .from("conversations")
        .select("id")
        .in("id", common)
        .eq("request_id", requestId);
      
      if (convWithReq && convWithReq.length > 0) {
        return convWithReq[0].id;
      }
    }
  }

  // Create new conversation
  const { data: newConv, error: createError } = await supabase
    .from("conversations")
    .insert({ request_id: requestId })
    .select("id")
    .single();

  if (createError || !newConv) return null;

  // Add participants
  await supabase.from("conversation_participants").insert([
    { conversation_id: newConv.id, profile_id: userId1 },
    { conversation_id: newConv.id, profile_id: userId2 },
  ]);

  return newConv.id;
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
  imageUrl?: string | null
): Promise<Message | null> {
  const { data, error } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversationId,
      sender_id: senderId,
      content,
      image_url: imageUrl,
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
