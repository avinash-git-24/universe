"use client";

import { useMemo, useState } from "react";
import { Search, Zap, X, MessageSquare } from "lucide-react";
import { ConversationWithDetails } from "@/lib/database/chat";
import type { ActiveDeliveryContact } from "@/components/chat/ChatClient";
import { format, isToday, isYesterday } from "date-fns";
import { formatStudentName } from "@/lib/utils";

interface ChatListProps {
  userId: string;
  initialConversations: ConversationWithDetails[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onStartChatWithUser?: (otherUserId: string) => void;
  onlineUsers: Set<string>;
  activeDeliveries?: ActiveDeliveryContact[];
}

function formatConvTime(dateStr?: string | null): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isToday(d)) return format(d, "h:mm a");
  if (isYesterday(d)) return "Yesterday";
  return format(d, "MMM d");
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
    return initialConversations.filter((c) => {
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

  const totalUnread = useMemo(() => {
    return initialConversations.reduce((acc, curr) => acc + (curr.unread_count || 0), 0);
  }, [initialConversations]);

  return (
    <div className="flex flex-col h-full bg-[#090e0b] relative overflow-hidden shrink-0 select-none">
      {/* ── Sidebar Header ── */}
      <div className="p-4 border-b border-white/[0.08] shrink-0 bg-[#0c130f]/80 backdrop-blur-md relative z-10 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="font-extrabold text-lg text-white tracking-tight">Messages</h2>
            {totalUnread > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-black">
                {totalUnread}
              </span>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/[0.04] border border-white/10 rounded-xl py-2 pl-9 pr-8 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-500/50 focus:bg-white/[0.07] transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-white/40 hover:text-white rounded-md"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* ── Scrollable List Container ── */}
      <div className="flex-1 min-h-0 overflow-y-auto p-2 space-y-3">
        {/* Active Deliveries Quick-Launch Section */}
        {activeDeliveries.length > 0 && !searchQuery.trim() && (
          <div className="space-y-1.5 pb-2 border-b border-white/[0.08]">
            <div className="px-2.5 py-1 flex items-center justify-between text-[10.5px] font-extrabold tracking-wider text-emerald-400 uppercase">
              <span className="flex items-center gap-1.5">
                <Zap className="w-3 h-3 fill-emerald-400" /> Active Deliveries
              </span>
              <span className="px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 font-bold">
                {activeDeliveries.length}
              </span>
            </div>
            {activeDeliveries.map((del) => {
              const nameInfo = formatStudentName(del.otherUser.full_name);
              return (
                <button
                  key={del.otherUserId}
                  type="button"
                  onClick={() => onStartChatWithUser?.(del.otherUserId)}
                  className="w-full text-left p-2.5 rounded-xl bg-emerald-500/[0.06] hover:bg-emerald-500/15 border border-emerald-500/20 hover:border-emerald-500/40 transition-all flex items-center justify-between gap-2.5 group cursor-pointer"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-xs text-white truncate">
                        {nameInfo.fullName}
                      </span>
                      {nameInfo.rollPrefix && (
                        <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-white/10 text-white/50">
                          #{nameInfo.rollPrefix}
                        </span>
                      )}
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                        {del.isRunner ? "Requester" : "Runner"}
                      </span>
                      {del.deliveryCount > 1 && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-white/10 text-white/60 font-bold">
                          {del.deliveryCount} orders
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-white/50 truncate mt-0.5">
                      {del.latestPickup} → {del.latestDropoff}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-emerald-400 font-bold px-2.5 py-1 rounded-lg bg-emerald-500/20 group-hover:bg-emerald-400 group-hover:text-black transition-all">
                    Chat
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Conversations List */}
        {filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 opacity-50 px-4 text-center">
            <MessageSquare className="w-8 h-8 text-white/30 mb-2" />
            <p className="text-xs text-white/70">No conversations found</p>
          </div>
        ) : (
          <div className="space-y-1">
            {filteredConversations.map((conv) => {
              const isUnread = (conv.unread_count || 0) > 0;
              const isActive = conv.id === activeConversationId;
              const isOnline = Boolean(
                conv.other_participant?.id && onlineUsers.has(conv.other_participant.id)
              );
              const nameInfo = formatStudentName(conv.other_participant?.full_name);
              
              return (
                <button
                  key={conv.id}
                  onClick={() => onSelectConversation(conv.id)}
                  className={`w-full text-left p-3 rounded-2xl transition-all duration-150 group flex gap-3 relative overflow-hidden ${
                    isActive 
                      ? 'bg-emerald-500/10 border border-emerald-500/25 shadow-sm before:absolute before:left-0 before:top-2.5 before:bottom-2.5 before:w-1 before:bg-emerald-400 before:rounded-r-full' 
                      : 'hover:bg-white/[0.04] border border-transparent'
                  }`}
                >
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <div className={`w-11 h-11 rounded-full overflow-hidden flex items-center justify-center font-extrabold text-sm transition-transform group-hover:scale-105 ${
                      isActive 
                        ? 'bg-gradient-to-tr from-emerald-500 to-teal-400 text-black shadow-md' 
                        : 'bg-gradient-to-br from-white/10 to-white/5 text-white border border-white/10'
                    }`}>
                      {nameInfo.initial || '?'}
                    </div>
                    {/* Online Status Indicator */}
                    <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#090e0b] transition-colors ${
                      isOnline ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-neutral-600'
                    }`} />
                  </div>

                  {/* Content Snippet */}
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <div className="flex items-center gap-1.5 truncate pr-2">
                        <span className={`text-[14px] truncate ${
                          isUnread 
                            ? 'font-black text-white' 
                            : isActive 
                            ? 'font-bold text-emerald-400' 
                            : 'font-semibold text-white/90'
                        }`}>
                          {nameInfo.fullName || "University Peer"}
                        </span>
                        {nameInfo.rollPrefix && (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-white/5 text-white/40 border border-white/5 shrink-0">
                            #{nameInfo.rollPrefix}
                          </span>
                        )}
                      </div>
                      {conv.last_message && (
                        <span className={`text-[10.5px] shrink-0 ${
                          isUnread ? 'text-emerald-400 font-extrabold' : 'text-white/40 font-medium'
                        }`}>
                          {formatConvTime(conv.last_message.created_at)}
                        </span>
                      )}
                    </div>
                    
                    {conv.resale_listing && (
                      <p className="text-[10px] text-emerald-400/70 truncate mb-0.5 font-medium">
                        Item: {conv.resale_listing.title}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between gap-2">
                      <p className={`text-xs truncate ${
                        isUnread ? 'text-emerald-300 font-bold' : 'text-white/50'
                      }`}>
                        {conv.last_message?.image_url 
                          ? 'Sent an image 📷' 
                          : (conv.last_message?.content || 'No messages yet')}
                      </p>
                      {isUnread && (
                        <span className="shrink-0 min-w-[20px] h-5 px-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 flex items-center justify-center text-[10px] font-black text-black shadow-[0_0_12px_rgba(16,185,129,0.5)]">
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
