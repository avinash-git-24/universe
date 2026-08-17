"use client";

import { useEffect, useState, useRef } from "react";
import { Send, MapPin, Package, Image as ImageIcon, Loader2, ExternalLink, Tag } from "lucide-react";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { createClient } from "@/lib/supabase/client";
import { Message, ConversationWithDetails, getMessages, sendMessage, markConversationAsRead, uploadChatImage } from "@/lib/database/chat";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { OfferMessageCard } from "@/components/chat/OfferMessageCard";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

const QUICK_REPLIES = [
  "Okay",
  "I'm on the way",
  "Please wait",
  "I'll check",
  "Not available"
];

interface ChatWindowProps {
  userId: string;
  conversation: ConversationWithDetails;
  isOnline: boolean;
}

export function ChatWindow({ userId, conversation, isOnline }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [otherTyping, setOtherTyping] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const supabase = createClient();

  // Initial Load
  useEffect(() => {
    let isMounted = true;
    
    async function load() {
      setLoading(true);
      const data = await getMessages(supabase, conversation.id);
      if (isMounted) {
        setMessages(data);
        setLoading(false);
        // Mark read
        await markConversationAsRead(supabase, conversation.id, userId);
      }
    }
    
    load();
    return () => { isMounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversation.id, userId]);

  // Realtime Subscriptions
  useEffect(() => {
    const msgChannel = supabase
      .channel(`chat:messages:${conversation.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${conversation.id}` },
        async (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
          if (payload.new.sender_id !== userId) {
            await markConversationAsRead(supabase, conversation.id, userId);
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "messages", filter: `conversation_id=eq.${conversation.id}` },
        (payload) => {
          setMessages((prev) => prev.map((m) => (m.id === payload.new.id ? payload.new as Message : m)));
        }
      )
      .subscribe();

    const typingChannel = supabase
      .channel(`chat:typing:${conversation.id}`)
      .on("broadcast", { event: "typing" }, (payload) => {
        if (payload.payload.userId !== userId) {
          setOtherTyping(payload.payload.isTyping);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(msgChannel);
      supabase.removeChannel(typingChannel);
    };
  }, [conversation.id, userId, supabase]);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, otherTyping, uploadingImage]);

  const handleSend = async (content: string, imageUrl?: string | null) => {
    if (!content.trim() && !imageUrl) return;

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
    setNewMessage("");
    handleTypingChange(false);
    
    await sendMessage(supabase, conversation.id, userId, content.trim(), imageUrl);
  };

  const onSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend(newMessage);
  };

  const handleTypingChange = (typing: boolean) => {
    setIsTyping(typing);
    supabase.channel(`chat:typing:${conversation.id}`).send({
      type: "broadcast",
      event: "typing",
      payload: { userId, isTyping: typing },
    });
  };

  const onInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(e.target.value);
    
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
    
    if (!isTyping) {
      handleTypingChange(true);
    }
    
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    
    typingTimeoutRef.current = setTimeout(() => {
      handleTypingChange(false);
    }, 2000);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (newMessage.trim()) {
        handleSend(newMessage);
      }
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Image size must be less than 5MB");
      return;
    }

    setUploadingImage(true);
    const imageUrl = await uploadChatImage(supabase, conversation.id, file);
    if (imageUrl) {
      await handleSend("", imageUrl);
    } else {
      alert("Failed to upload image. Please try again.");
    }
    setUploadingImage(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const req = conversation.delivery_request;
  const otherRole = conversation.other_participant.role === 'student' ? 'Student' : 'Runner';
  const lastSeenText = isOnline 
    ? '🟢 Online' 
    : conversation.other_last_read_at 
      ? `Last seen ${formatDistanceToNow(new Date(conversation.other_last_read_at))} ago`
      : 'Offline';

  return (
    <div className="flex flex-col h-full bg-[#0a0f0d] relative w-full overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-sm z-10 bg-[#0d1310] shrink-0">
        <div>
          <h2 className="font-bold text-lg text-white">{conversation.other_participant.full_name}</h2>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#10b981] font-medium capitalize">{conversation.other_participant.role}</span>
            <span className="text-white/20 text-xs">•</span>
            <span className="text-xs text-white/50">{lastSeenText}</span>
          </div>
        </div>
        
        {req ? (
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0 max-w-full">
            <div className="bg-white/5 border border-white/10 rounded-lg p-2.5 flex items-center gap-4 shrink-0">
              <div className="flex items-center gap-1.5 shrink-0">
                <Package className="w-3.5 h-3.5 text-white/40" />
                <span className="text-xs text-white/70 font-medium">Req #{req.id.slice(0,6)}</span>
              </div>
              <div className="w-px h-4 bg-white/10 shrink-0" />
              <div className="flex items-center gap-1.5 shrink-0 text-xs text-white/50">
                <MapPin className="w-3 h-3" />
                <span className="truncate max-w-[100px]" title={req.pickup_location}>{req.pickup_location}</span>
                <span className="opacity-50 mx-0.5">→</span>
                <span className="truncate max-w-[100px]" title={req.dropoff_location}>{req.dropoff_location}</span>
              </div>
              <div className="w-px h-4 bg-white/10 shrink-0" />
              <span className={`shrink-0 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                req.status === 'delivered' ? 'bg-[#10b981]/10 text-[#10b981]' : 
                req.status === 'cancelled' ? 'bg-red-500/10 text-red-500' :
                'bg-blue-500/10 text-blue-400'
              }`}>
                {req.status}
              </span>
            </div>
            
            <Link 
              href={`/dashboard/requests/${req.id}`}
              className="shrink-0 flex items-center justify-center p-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-colors"
              title="View Request Details"
            >
              <ExternalLink className="w-4 h-4" />
            </Link>
          </div>
        ) : conversation.resale_listing ? (
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0 max-w-full">
            <div className="bg-white/5 border border-white/10 rounded-lg p-2.5 flex items-center gap-4 shrink-0">
              <div className="flex items-center gap-1.5 shrink-0">
                <Tag className="w-3.5 h-3.5 text-[#10b981]/70" />
                <span className="text-xs text-white/70 font-medium truncate max-w-[150px]">
                  {conversation.resale_listing.title}
                </span>
              </div>
              <div className="w-px h-4 bg-white/10 shrink-0" />
              <div className="flex items-center gap-1.5 shrink-0 text-xs text-white/50 font-bold">
                ${conversation.resale_listing.price.toFixed(2)}
              </div>
              <div className="w-px h-4 bg-white/10 shrink-0" />
              <span className={`shrink-0 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                conversation.resale_listing.status === 'active' ? 'bg-[#10b981]/10 text-[#10b981]' : 
                conversation.resale_listing.status === 'reserved' ? 'bg-orange-500/10 text-orange-400' :
                'bg-white/10 text-white/50'
              }`}>
                {conversation.resale_listing.status}
              </span>
            </div>
            
            <Link 
              href={`/dashboard/marketplace/${conversation.resale_listing.id}`}
              className="shrink-0 flex items-center justify-center p-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-colors"
              title="View Listing Details"
            >
              <ExternalLink className="w-4 h-4" />
            </Link>
          </div>
        ) : null}
      </div>

      {/* Message History */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col relative z-0">
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <LoadingSpinner size="lg" label="Loading conversation..." />
          </div>
        ) : (
          <>
            {messages.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center opacity-60">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3">
                  <Send className="w-5 h-5 text-white/40 ml-1" />
                </div>
                <p className="text-sm font-medium text-white/80">No messages yet</p>
                <p className="text-xs text-white/40 mt-1 max-w-[250px]">Send a message to discuss this delivery request.</p>
              </div>
            ) : (
              messages.map((msg) => (
                msg.message_type === "offer" ? (
                  <OfferMessageCard 
                    key={msg.id} 
                    message={msg} 
                    currentUserId={userId} 
                    conversationId={conversation.id} 
                  />
                ) : (
                  <MessageBubble key={msg.id} message={msg} isMe={msg.sender_id === userId} />
                )
              ))
            )}
            
            {uploadingImage && (
              <div className="flex flex-col w-full items-end mb-4">
                <div className="max-w-[75%] rounded-2xl p-4 bg-white/5 border border-white/10 flex items-center gap-3">
                  <Loader2 className="w-4 h-4 text-[#10b981] animate-spin" />
                  <span className="text-xs text-white/60">Uploading image...</span>
                </div>
              </div>
            )}

            {otherTyping && (
              <div className="flex items-center text-[#10b981] text-xs font-medium italic mb-4">
                {otherRole} is typing...
              </div>
            )}
            <div ref={bottomRef} className="h-1" />
          </>
        )}
      </div>

      {/* Input Composer */}
      <div className="border-t border-white/10 bg-[#0d1310] z-10 shrink-0">
        {/* Quick Replies */}
        <div className="flex items-center gap-2 px-4 pt-3 pb-1 overflow-x-auto no-scrollbar max-w-4xl mx-auto w-full">
          {QUICK_REPLIES.map((reply) => (
            <button
              key={reply}
              onClick={() => handleSend(reply)}
              disabled={loading || uploadingImage}
              className="shrink-0 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-white/70 hover:text-white transition-colors disabled:opacity-50"
            >
              {reply}
            </button>
          ))}
        </div>
        
        <form onSubmit={onSubmitForm} className="flex gap-2 max-w-4xl mx-auto w-full items-end p-3 pt-2">
          <input 
            type="file" 
            accept="image/jpeg,image/png,image/webp" 
            className="hidden" 
            ref={fileInputRef}
            onChange={handleImageUpload}
          />
          
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingImage}
            className="w-[44px] h-[44px] rounded-full shrink-0 bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors disabled:opacity-50 border border-white/10"
          >
            <ImageIcon className="w-5 h-5" />
          </button>

          <div className="flex-1 relative bg-white/5 border border-white/10 rounded-2xl transition-colors focus-within:border-[#10b981]/50 focus-within:bg-white/10">
            <textarea
              ref={textareaRef}
              placeholder="Type a message... (Shift + Enter for new line)" 
              value={newMessage}
              onChange={onInputChange}
              onKeyDown={onKeyDown}
              disabled={uploadingImage}
              className="w-full bg-transparent border-none focus:ring-0 resize-none py-3 px-4 text-sm text-white placeholder:text-white/30 max-h-[120px] rounded-2xl min-h-[44px] disabled:opacity-50"
              rows={1}
            />
          </div>
          
          <button 
            type="submit" 
            disabled={!newMessage.trim() || uploadingImage}
            className="w-[44px] h-[44px] rounded-full shrink-0 bg-[#10b981] hover:bg-[#10b981]/90 flex items-center justify-center text-[#0d1310] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(16,185,129,0.2)]"
          >
            <Send className="w-4 h-4 ml-0.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
