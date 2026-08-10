"use client";

import { useState, useEffect } from "react";
import { MessageSquare } from "lucide-react";
import { ConversationWithDetails } from "@/lib/database/chat";
import { ChatList } from "@/components/chat/ChatList";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface ChatClientProps {
  userId: string;
  initialConversations: ConversationWithDetails[];
}

export function ChatClient({ userId, initialConversations }: ChatClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeId = searchParams.get("id") || (initialConversations.length > 0 ? initialConversations[0].id : null);
  
  const [activeConversationId, setActiveConversationId] = useState<string | null>(activeId);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

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

  const activeConversation = initialConversations.find(c => c.id === activeConversationId);

  const handleSelect = (id: string) => {
    setActiveConversationId(id);
    router.replace(`?id=${id}`, { scroll: false });
  };

  return (
    <div className="flex-1 min-h-[600px] w-full rounded-3xl border border-white/20 bg-[#060a08] overflow-hidden flex flex-col md:flex-row shadow-2xl">
      
      {/* Sidebar (List) */}
      <div className={`w-full md:w-[350px] lg:w-[400px] border-b md:border-b-0 md:border-r border-white/20 shrink-0 flex flex-col ${activeConversationId ? 'hidden md:flex' : 'flex'}`}>
        <ChatList 
          userId={userId} 
          initialConversations={initialConversations}
          activeConversationId={activeConversationId}
          onSelectConversation={handleSelect}
          onlineUsers={onlineUsers}
        />
      </div>

      {/* Main Area (Window) */}
      <div className={`flex-1 flex flex-col ${!activeConversationId ? 'hidden md:flex' : 'flex'}`}>
        {activeConversation ? (
          <div className="w-full flex-1 flex flex-col h-full relative">
            {/* Mobile Back Button */}
            <div className="md:hidden p-3 bg-[#0a0f0d] border-b border-white/10 z-20">
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
              isOnline={onlineUsers.has(activeConversation.other_participant.id)}
            />
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#0a0f0d] relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-[#10b981]/5 to-transparent opacity-50" />
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6 relative z-10 border border-white/5 shadow-xl">
              <MessageSquare className="w-8 h-8 text-white/20" />
            </div>
            <p className="text-xl font-bold text-white relative z-10">Your Messages</p>
            <p className="text-sm text-white/40 mt-2 max-w-sm relative z-10">Select a conversation from the sidebar to start chatting about your deliveries.</p>
          </div>
        )}
      </div>

    </div>
  );
}
