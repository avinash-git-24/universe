"use client";

import { useMemo, useState } from "react";
import { Search, Zap } from "lucide-react";
import { ConversationWithDetails } from "@/lib/database/chat";
import type { ActiveDeliveryContact } from "@/components/chat/ChatClient";
import { format } from "date-fns";

interface ChatListProps {
  userId: string;
  initialConversations: ConversationWithDetails[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onStartChatWithUser?: (otherUserId: string) => void;
  onlineUsers: Set<string>;
  activeDeliveries?: ActiveDeliveryContact[];
}

export function ChatList({
  initialConversations,
  activeConversationId,
  onSelectConversation,
  onStartChatWithUser,
  onlineUsers,
  activeDeliveries = [],
}: ChatListProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return initialConversations;
    
    const lowerQuery = searchQuery.toLowerCase();
    return initialConversations.filter(c => {
      const nameMatch = c.other_participant?.full_name?.toLowerCase().includes(lowerQuery);
      const reqMatch = c.delivery_request && (
        c.delivery_request.pickup_location.toLowerCase().includes(lowerQuery) ||
        c.delivery_request.dropoff_location.toLowerCase().includes(lowerQuery) ||
        c.delivery_request.id.toLowerCase().includes(lowerQuery)
      );
      const listMatch = c.resale_listing && (
        c.resale_listing.title.toLowerCase().includes(lowerQuery) ||
        c.resale_listing.id.toLowerCase().includes(lowerQuery)
      );
      return nameMatch || reqMatch || listMatch;
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

      <div className="flex-1 overflow-y-auto z-0 p-2 space-y-4">
        {/* Active Deliveries Quick-Launch Section */}
        {activeDeliveries.length > 0 && !searchQuery.trim() && (
          <div className="space-y-1.5 pb-2 border-b border-white/10">
            <div className="px-3 py-1 flex items-center justify-between text-[11px] font-bold tracking-wider text-emerald-400 uppercase">
              <span className="flex items-center gap-1">
                <Zap className="w-3 h-3 fill-emerald-400" /> Active Deliveries
              </span>
              <span className="text-white/40">{activeDeliveries.length}</span>
            </div>
            {activeDeliveries.map((del) => (
              <button
                key={del.otherUserId}
                type="button"
                onClick={() => onStartChatWithUser?.(del.otherUserId)}
                className="w-full text-left p-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 transition-all flex items-center justify-between gap-2 group cursor-pointer"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-xs text-white truncate">
                      {del.otherUser.full_name || "User"}
                    </span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                      {del.isRunner ? "Requester" : "Runner"}
                    </span>
                    {del.deliveryCount > 1 && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/10 text-white/50 font-bold">
                        {del.deliveryCount} orders
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-white/40 truncate mt-0.5">
                    {del.latestPickup} → {del.latestDropoff}
                  </p>
                </div>
                <span className="shrink-0 text-xs text-emerald-400 font-bold px-2 py-1 rounded-lg bg-emerald-500/20 group-hover:bg-emerald-400 group-hover:text-black transition-all">
                  Chat
                </span>
              </button>
            ))}
          </div>
        )}

        {filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 opacity-50 px-4 text-center">
            <p className="text-sm text-white/70">No conversations found</p>
          </div>
        ) : (
          <div className="space-y-1">
            {filteredConversations.map((conv) => {
              const isUnread = conv.unread_count > 0;
              const isActive = conv.id === activeConversationId;
              const isOnline = Boolean(conv.other_participant?.id && onlineUsers.has(conv.other_participant.id));
              
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
                      {conv.other_participant?.full_name?.charAt(0) || '?'}
                    </div>
                    {/* Status Indicator */}
                    <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-[#0a0f0d] transition-colors ${
                      isOnline ? 'bg-[#10b981]' : 'bg-white/20'
                    }`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <div className="flex justify-between items-baseline mb-1">
                      <span className={`text-[14.5px] truncate pr-2 ${
                        isUnread ? 'font-extrabold text-white' : isActive ? 'font-bold text-[#10b981]' : 'font-semibold text-white/90'
                      }`}>
                        {conv.other_participant?.full_name || "User"}
                      </span>
                      {conv.last_message && (
                        <span className={`text-[11px] shrink-0 font-medium ${isUnread ? 'text-emerald-400 font-bold' : 'text-white/40'}`}>
                          {format(new Date(conv.last_message.created_at), "h:mm a")}
                        </span>
                      )}
                    </div>
                    
                    {conv.resale_listing && (
                      <p className="text-[10px] text-[#10b981]/70 truncate mb-1">
                        Regarding: {conv.resale_listing.title}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between gap-2">
                      <p className={`text-xs truncate ${isUnread ? 'text-emerald-300 font-semibold' : 'text-white/50'}`}>
                        {conv.last_message?.image_url 
                          ? 'Sent an image 📷' 
                          : (conv.last_message?.content || 'No messages yet')}
                      </p>
                      {isUnread && (
                        <span className="shrink-0 min-w-[20px] h-5 px-1.5 rounded-full bg-[#00E676] flex items-center justify-center text-[10px] font-black text-[#050A07] shadow-[0_0_12px_rgba(0,230,118,0.5)] animate-pulse">
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
