"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { ConversationWithDetails } from "@/lib/database/chat";
import { format } from "date-fns";

interface ChatListProps {
  userId: string;
  initialConversations: ConversationWithDetails[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onlineUsers: Set<string>;
}

export function ChatList({ userId, initialConversations, activeConversationId, onSelectConversation, onlineUsers }: ChatListProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return initialConversations;
    
    const lowerQuery = searchQuery.toLowerCase();
    return initialConversations.filter(c => {
      const nameMatch = c.other_participant.full_name?.toLowerCase().includes(lowerQuery);
      const reqMatch = c.delivery_request && (
        c.delivery_request.pickup_location.toLowerCase().includes(lowerQuery) ||
        c.delivery_request.dropoff_location.toLowerCase().includes(lowerQuery) ||
        c.delivery_request.id.toLowerCase().includes(lowerQuery)
      );
      return nameMatch || reqMatch;
    });
  }, [searchQuery, initialConversations]);

  return (
    <div className="flex flex-col h-full bg-[#0a0f0d] relative overflow-hidden shrink-0">
      <div className="p-4 border-b border-white/10 shrink-0 bg-[#0d1310] relative z-10">
        <h2 className="font-bold text-lg text-white mb-3 tracking-wide">Messages</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#10b981]/50 focus:bg-white/10 transition-colors"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto z-0 p-2">
        {filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full opacity-50 px-4 text-center">
            <p className="text-sm text-white/70">No conversations found</p>
          </div>
        ) : (
          <div className="space-y-1">
            {filteredConversations.map((conv) => {
              const isUnread = conv.unread_count > 0;
              const isActive = conv.id === activeConversationId;
              const isOnline = onlineUsers.has(conv.other_participant.id);
              
              return (
                <button
                  key={conv.id}
                  onClick={() => onSelectConversation(conv.id)}
                  className={`w-full text-left p-3 rounded-xl transition-all duration-200 group flex gap-3 relative overflow-hidden ${
                    isActive 
                      ? 'bg-[#10b981]/10 border border-[#10b981]/20' 
                      : 'hover:bg-white/5 border border-transparent'
                  }`}
                >
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center font-bold text-white text-lg">
                      {conv.other_participant.full_name?.charAt(0) || '?'}
                    </div>
                    {/* Status Indicator */}
                    <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-[#0a0f0d] transition-colors ${
                      isOnline ? 'bg-[#10b981]' : 'bg-white/20'
                    }`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <div className="flex justify-between items-baseline mb-1">
                      <span className={`font-semibold text-[15px] truncate pr-2 ${isActive ? 'text-[#10b981]' : 'text-white/90'}`}>
                        {conv.other_participant.full_name}
                      </span>
                      {conv.last_message && (
                        <span className="text-[11px] text-white/40 shrink-0 font-medium">
                          {format(new Date(conv.last_message.created_at), "MMM d")}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between gap-2">
                      <p className={`text-xs truncate ${isUnread ? 'text-white font-medium' : 'text-white/50'}`}>
                        {conv.last_message?.image_url 
                          ? 'Sent an image 📷' 
                          : (conv.last_message?.content || 'No messages yet')}
                      </p>
                      {isUnread && (
                        <span className="shrink-0 w-5 h-5 rounded-full bg-[#10b981] flex items-center justify-center text-[10px] font-bold text-[#0d1310] shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                          {conv.unread_count}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
