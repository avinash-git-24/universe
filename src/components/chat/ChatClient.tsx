"use client";

import { useState, useEffect } from "react";
import { MessageSquare, Zap } from "lucide-react";
import { 
  ConversationWithDetails, 
  getConversationById, 
  getOrCreateConversation 
} from "@/lib/database/chat";
import { ChatList } from "@/components/chat/ChatList";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/**
 * Grouped per-person delivery contact.
 * One entry per unique otherUser, regardless of how many delivery requests exist between them.
 */
export interface ActiveDeliveryContact {
  otherUserId: string;
  otherUser: {
    id: string;
    full_name: string | null;
    avatar_url?: string | null;
    role: string;
  };
  deliveryCount: number;
  latestItemsSummary: string;
  latestPickup: string;
  latestDropoff: string;
  isRunner: boolean;
}

interface ChatClientProps {
  userId: string;
  initialConversations: ConversationWithDetails[];
  activeDeliveries?: ActiveDeliveryContact[];
}

export function ChatClient({ userId, initialConversations, activeDeliveries = [] }: ChatClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [conversations, setConversations] = useState<ConversationWithDetails[]>(initialConversations);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(
    searchParams.get("id") || (initialConversations.length > 0 ? initialConversations[0].id : null)
  );
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [startingChatUserId, setStartingChatUserId] = useState<string | null>(null);

  // Sync state if server props change
  useEffect(() => {
    setConversations(initialConversations);
  }, [initialConversations]);

  // Sync activeConversationId with URL query params
  useEffect(() => {
    const urlId = searchParams.get("id");
    if (urlId) {
      setActiveConversationId(urlId);
    } else if (conversations.length > 0 && !activeConversationId) {
      setActiveConversationId(conversations[0].id);
    }
  }, [searchParams, conversations, activeConversationId]);

  // If activeConversationId is not yet in conversations list, fetch it
  useEffect(() => {
    if (!activeConversationId) return;
    const exists = conversations.some((c) => c.id === activeConversationId);
    if (!exists) {
      const supabase = createClient();
      getConversationById(supabase, activeConversationId, userId).then((conv) => {
        if (conv) {
          setConversations((prev) => [conv, ...prev.filter((c) => c.id !== conv.id)]);
        }
      });
    }
  }, [activeConversationId, conversations, userId]);

  const handleStartChatWithUser = async (otherUserId: string) => {
    try {
      setStartingChatUserId(otherUserId);
      const supabase = createClient();
      const convId = await getOrCreateConversation(supabase, userId, otherUserId);
      if (convId) {
        handleSelect(convId);
        const conv = await getConversationById(supabase, convId, userId);
        if (conv) {
          setConversations((prev) => [conv, ...prev.filter((c) => c.id !== conv.id)]);
        }
      }
    } catch (err) {
      console.error("Error starting chat:", err);
    } finally {
      setStartingChatUserId(null);
    }
  };

  useEffect(() => {
    const supabase = createClient();
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

    return () => {
      supabase.removeChannel(room);
    };
  }, [userId]);

  const activeConversation = conversations.find((c) => c.id === activeConversationId);

  const handleSelect = (id: string) => {
    setActiveConversationId(id);
    router.replace(`?id=${id}`, { scroll: false });
  };

  return (
    <div className="flex-1 h-full w-full rounded-2xl sm:rounded-3xl border border-white/10 bg-[#060a08] overflow-hidden flex flex-col md:flex-row shadow-2xl min-h-0">
      
      {/* Sidebar (List) */}
      <div className={`w-full md:w-[320px] lg:w-[380px] border-b md:border-b-0 md:border-r border-white/10 shrink-0 flex flex-col h-full min-h-0 overflow-hidden ${activeConversationId ? 'hidden md:flex' : 'flex'}`}>
        <ChatList 
          userId={userId} 
          initialConversations={conversations}
          activeConversationId={activeConversationId}
          onSelectConversation={handleSelect}
          onStartChatWithUser={handleStartChatWithUser}
          onlineUsers={onlineUsers}
          activeDeliveries={activeDeliveries}
        />
      </div>

      {/* Main Area (Window) */}
      <div className={`flex-1 flex flex-col h-full min-h-0 overflow-hidden ${!activeConversationId ? 'hidden md:flex' : 'flex'}`}>
        {activeConversation ? (
          <div className="w-full flex-1 flex flex-col h-full min-h-0 relative overflow-hidden">
            {/* Mobile Back Button */}
            <div className="md:hidden p-3 bg-[#0a0f0d] border-b border-white/10 z-20 shrink-0">
              <button 
                onClick={() => handleSelect("")}
                className="text-sm font-semibold text-[#10b981] flex items-center gap-2"
              >
                ← Back to Conversations
              </button>
            </div>
            
            <ChatWindow 
              userId={userId} 
              conversation={activeConversation} 
              isOnline={Boolean(activeConversation.other_participant?.id && onlineUsers.has(activeConversation.other_participant.id))}
            />
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 text-center bg-[#0a0f0d] relative overflow-y-auto">
            <div className="absolute inset-0 bg-gradient-to-b from-[#10b981]/5 to-transparent opacity-50 pointer-events-none" />

            {activeDeliveries.length > 0 ? (
              <div className="max-w-lg w-full space-y-6 relative z-10">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-xl">
                  <Zap className="w-8 h-8 fill-emerald-400" />
                </div>
                
                <div>
                  <h3 className="text-2xl font-extrabold text-white">Active Delivery Contacts</h3>
                  <p className="text-xs text-white/50 mt-1.5">
                    Connect with the students or runners handling your deliveries.
                  </p>
                </div>

                <div className="space-y-3 pt-2 text-left">
                  {activeDeliveries.map((del) => (
                    <div
                      key={del.otherUserId}
                      className="p-4 rounded-2xl bg-[#0c1410] border border-white/10 hover:border-emerald-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg group"
                    >
                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm truncate">
                            {del.otherUser.full_name || "University Member"}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold uppercase tracking-wider">
                            {del.isRunner ? "Requester" : "Assigned Runner"}
                          </span>
                        </div>
                        <p className="text-xs text-white/70 truncate font-medium">
                          📦 {del.latestItemsSummary}
                        </p>
                        <p className="text-[11px] text-white/40 truncate">
                          📍 {del.latestPickup} → {del.latestDropoff}
                          {del.deliveryCount > 1 && (
                            <span className="ml-2 text-emerald-400/60">+{del.deliveryCount - 1} more</span>
                          )}
                        </p>
                      </div>

                      {/* Instant client-side chat trigger */}
                      <button
                        type="button"
                        onClick={() => handleStartChatWithUser(del.otherUserId)}
                        disabled={startingChatUserId === del.otherUserId}
                        className="shrink-0 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-950/40 border-none disabled:opacity-50"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        {startingChatUserId === del.otherUserId ? "Opening..." : "Message"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center relative z-10">
                <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6 border border-white/5 shadow-xl">
                  <MessageSquare className="w-8 h-8 text-white/20" />
                </div>
                <p className="text-xl font-bold text-white">Your Messages</p>
                <p className="text-sm text-white/40 mt-2 max-w-sm">
                  Select a conversation from the sidebar or request a delivery to start chatting.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
