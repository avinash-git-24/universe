"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { MessageSquare, Zap, X, ArrowRight, MessageCircle } from "lucide-react";
import { 
  ConversationWithDetails, 
  getConversationById, 
  getOrCreateConversation,
  markConversationAsRead,
  Message
} from "@/lib/database/chat";
import { ChatList } from "@/components/chat/ChatList";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { sounds } from "@/lib/audio";

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

interface InAppToast {
  id: string;
  conversationId: string;
  senderName: string;
  avatarChar: string;
  content: string;
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
  const [toasts, setToasts] = useState<InAppToast[]>([]);

  const activeIdRef = useRef<string | null>(activeConversationId);
  useEffect(() => {
    activeIdRef.current = activeConversationId;
  }, [activeConversationId]);

  const supabase = createClient();

  const showToast = useCallback((toast: Omit<InAppToast, "id">) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const newToast: InAppToast = { ...toast, id };
    setToasts((prev) => [newToast, ...prev.slice(0, 2)]);

    // Auto remove after 5.5s
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5500);
  }, []);

  const handleSelect = useCallback(async (id: string) => {
    setActiveConversationId(id);
    router.replace(`?id=${id}`, { scroll: false });
    
    // Clear unread count locally and in db
    if (id) {
      setConversations((prev) =>
        prev.map((c) => (c.id === id ? { ...c, unread_count: 0 } : c))
      );
      setToasts((prev) => prev.filter((t) => t.conversationId !== id));
      await markConversationAsRead(supabase, id, userId);
    }
  }, [router, supabase, userId]);

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
      getConversationById(supabase, activeConversationId, userId).then((conv) => {
        if (conv) {
          setConversations((prev) => [conv, ...prev.filter((c) => c.id !== conv.id)]);
        }
      });
    }
  }, [activeConversationId, conversations, userId, supabase]);

  // Global Realtime Listener for All Incoming Messages
  useEffect(() => {
    // 1. Database level INSERT on messages
    const globalMsgChannel = supabase
      .channel(`chat:global_user_messages:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        async (payload) => {
          const newMsg = payload.new as Message;
          if (newMsg.sender_id === userId) return; // Don't notify on own sent messages

          const currentActive = activeIdRef.current;

          // If message is for another conversation, notify user!
          if (newMsg.conversation_id !== currentActive) {
            sounds.playReceive();

            // Find sender details
            setConversations((prev) => {
              const target = prev.find((c) => c.id === newMsg.conversation_id);
              if (target) {
                const name = target.other_participant?.full_name || "New Message";
                showToast({
                  conversationId: newMsg.conversation_id,
                  senderName: name,
                  avatarChar: name.charAt(0).toUpperCase() || "U",
                  content: newMsg.image_url ? "Sent an image 📷" : newMsg.content,
                });

                const updated = prev.map((c) => {
                  if (c.id === newMsg.conversation_id) {
                    return {
                      ...c,
                      last_message: newMsg,
                      unread_count: (c.unread_count || 0) + 1,
                      updated_at: newMsg.created_at,
                    };
                  }
                  return c;
                });

                // Sort newest on top
                return updated.sort((a, b) => {
                  const tA = new Date(a.last_message?.created_at || a.updated_at).getTime();
                  const tB = new Date(b.last_message?.created_at || b.updated_at).getTime();
                  return tB - tA;
                });
              } else {
                // If brand new conversation not yet in list, fetch and add to top
                getConversationById(supabase, newMsg.conversation_id, userId).then((fresh) => {
                  if (fresh) {
                    const freshWithUnread = { ...fresh, unread_count: 1 };
                    setConversations((current) => [freshWithUnread, ...current.filter((c) => c.id !== fresh.id)]);
                    showToast({
                      conversationId: fresh.id,
                      senderName: fresh.other_participant?.full_name || "New Message",
                      avatarChar: fresh.other_participant?.full_name?.charAt(0).toUpperCase() || "U",
                      content: newMsg.image_url ? "Sent an image 📷" : newMsg.content,
                    });
                  }
                });
                return prev;
              }
            });
          } else {
            // For currently open conversation, just update the sidebar snippet
            setConversations((prev) =>
              prev.map((c) =>
                c.id === newMsg.conversation_id
                  ? { ...c, last_message: newMsg, updated_at: newMsg.created_at }
                  : c
              )
            );
          }
        }
      )
      .subscribe();

    // 2. Direct Peer-to-Peer Incoming Chat Broadcast (0ms)
    const directChannel = supabase
      .channel(`user_direct:${userId}`)
      .on("broadcast", { event: "incoming_chat" }, (payload) => {
        const { conversationId, senderName, content } = payload.payload as {
          conversationId: string;
          senderName: string;
          content: string;
        };
        const currentActive = activeIdRef.current;

        if (conversationId && conversationId !== currentActive) {
          sounds.playReceive();
          showToast({
            conversationId,
            senderName: senderName || "New Message",
            avatarChar: senderName?.charAt(0).toUpperCase() || "U",
            content: content || "New message received",
          });
          setConversations((prev) => {
            const updated = prev.map((c) =>
              c.id === conversationId ? { ...c, unread_count: (c.unread_count || 0) + 1 } : c
            );
            return updated.sort((a, b) => {
              const tA = new Date(a.last_message?.created_at || a.updated_at).getTime();
              const tB = new Date(b.last_message?.created_at || b.updated_at).getTime();
              return tB - tA;
            });
          });
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(globalMsgChannel);
      supabase.removeChannel(directChannel);
    };
  }, [userId, supabase, showToast]);

  const handleStartChatWithUser = async (otherUserId: string) => {
    try {
      setStartingChatUserId(otherUserId);
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
  }, [userId, supabase]);

  const activeConversation = conversations.find((c) => c.id === activeConversationId);

  return (
    <div className="relative flex-1 h-full w-full rounded-2xl sm:rounded-3xl border border-white/10 bg-[#060a08] overflow-hidden flex flex-col md:flex-row shadow-2xl min-h-0">
      
      {/* ── In-App Floating Toast Notifications (Top-Right) ── */}
      <div className="absolute top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            onClick={() => handleSelect(toast.conversationId)}
            className="pointer-events-auto cursor-pointer p-3.5 rounded-2xl bg-[#0d1612]/95 border border-emerald-500/40 shadow-[0_8px_30px_rgba(0,0,0,0.6)] backdrop-blur-xl flex items-center justify-between gap-3 animate-in slide-in-from-top-4 fade-in duration-200 hover:border-emerald-400 transition-all group"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-black font-extrabold flex items-center justify-center text-sm shrink-0 shadow-md">
                {toast.avatarChar}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-white truncate group-hover:text-emerald-400 transition-colors">
                    {toast.senderName}
                  </span>
                  <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400">
                    New
                  </span>
                </div>
                <p className="text-xs text-white/70 truncate mt-0.5">
                  {toast.content}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                Reply <ArrowRight className="w-3.5 h-3.5" />
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setToasts((prev) => prev.filter((t) => t.id !== toast.id));
                }}
                className="p-1 text-white/40 hover:text-white rounded-full hover:bg-white/10"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ── Sidebar (List of Conversations) ── */}
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

      {/* ── Main Area (Active Chat Window) ── */}
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
                  <h3 className="text-xl font-bold text-white mb-2">Active Deliveries</h3>
                  <p className="text-sm text-white/50">
                    Connect directly with the runners or requesters of your ongoing orders.
                  </p>
                </div>
                <div className="grid gap-2.5 text-left">
                  {activeDeliveries.map((del) => (
                    <button
                      key={del.otherUserId}
                      type="button"
                      disabled={startingChatUserId === del.otherUserId}
                      onClick={() => handleStartChatWithUser(del.otherUserId)}
                      className="p-3.5 rounded-2xl bg-white/5 hover:bg-emerald-500/10 border border-white/10 hover:border-emerald-500/30 transition-all flex items-center justify-between group cursor-pointer"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-white truncate">
                            {del.otherUser.full_name || "User"}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold">
                            {del.isRunner ? "Requester" : "Runner"}
                          </span>
                        </div>
                        <p className="text-xs text-white/50 truncate mt-1">
                          {del.latestPickup} → {del.latestDropoff}
                        </p>
                      </div>
                      <span className="shrink-0 text-xs font-bold text-emerald-400 bg-emerald-500/20 group-hover:bg-emerald-400 group-hover:text-black px-3 py-1.5 rounded-xl transition-all">
                        {startingChatUserId === del.otherUserId ? "Opening..." : "Chat Now"}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="max-w-md space-y-4 relative z-10">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40">
                  <MessageSquare className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-white">Select a Conversation</h3>
                <p className="text-sm text-white/50">
                  Choose a chat from the sidebar or reach out regarding an active delivery.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
