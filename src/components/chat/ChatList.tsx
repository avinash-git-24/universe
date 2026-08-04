"use client";

import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare } from "lucide-react";
import { ConversationWithDetails } from "@/lib/database/chat";
import { createClient } from "@/lib/supabase/client";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/EmptyState";

interface ChatListProps {
  userId: string;
  initialConversations: ConversationWithDetails[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
}

export function ChatList({ userId, initialConversations, activeConversationId, onSelectConversation }: ChatListProps) {
  const [conversations, setConversations] = useState(initialConversations);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  useEffect(() => {
    const supabase = createClient();
    
    // Subscribe to presence
    const room = supabase.channel("global_presence");
    
    room
      .on("presence", { event: "sync" }, () => {
        const state = room.presenceState();
        const online = new Set<string>();
        Object.values(state).forEach((presences: unknown) => {
          (presences as { user_id: string }[]).forEach((p) => {
            if (p.user_id) online.add(p.user_id);
          });
        });
        setOnlineUsers(online);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await room.track({ user_id: userId, online_at: new Date().toISOString() });
        }
      });

    // Listen to new messages to update the list
    const msgChannel = supabase
      .channel("chat_list_updates")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const newMsg = payload.new;
          setConversations((prev) => {
            const updated = prev.map((c) => {
              if (c.id === newMsg.conversation_id) {
                return {
                  ...c,
                  last_message: newMsg as ConversationWithDetails["last_message"],
                  unread_count: newMsg.sender_id !== userId && activeConversationId !== c.id 
                    ? c.unread_count + 1 
                    : c.unread_count,
                  updated_at: newMsg.created_at,
                };
              }
              return c;
            });
            // Re-sort
            return updated.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(room);
      supabase.removeChannel(msgChannel);
    };
  }, [userId, activeConversationId]);

  return (
    <div className="w-full h-full flex flex-col bg-card border-r">
      <div className="p-4 border-b">
        <h2 className="font-bold text-lg">Messages</h2>
      </div>
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <EmptyState
            icon={MessageSquare}
            title="No Conversations Yet"
            description="Start a chat from a delivery request or user profile."
            className="border-none bg-transparent my-6"
          />
        ) : (
          conversations.map((conv) => {
            const other = conv.other_participant;
            const isActive = activeConversationId === conv.id;
            const isOnline = onlineUsers.has(other.id);

            return (
              <button
                key={conv.id}
                onClick={() => onSelectConversation(conv.id)}
                className={`w-full p-4 flex items-start gap-3 border-b hover:bg-secondary/30 transition-colors text-left ${isActive ? "bg-secondary/50" : ""}`}
              >
                <Avatar 
                  name={other.full_name || "User"} 
                  src={other.avatar_url} 
                  online={isOnline} 
                  className="w-10 h-10" 
                />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <p className="font-semibold truncate">{other.full_name}</p>
                    {conv.last_message && (
                      <span className="text-xs text-muted-foreground shrink-0 ml-2">
                        {formatDistanceToNow(new Date(conv.last_message.created_at), { addSuffix: true })}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {conv.last_message?.content || "Say hi!"}
                  </p>
                </div>
                {conv.unread_count > 0 && (
                  <Badge variant="error" className="shrink-0 h-5 w-5 flex items-center justify-center p-0 rounded-full">
                    {conv.unread_count}
                  </Badge>
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
