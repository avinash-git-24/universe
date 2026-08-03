"use client";

import { useEffect, useState, useRef } from "react";
import { Send, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Message, ConversationWithDetails, getMessages, sendMessage, markConversationAsRead } from "@/lib/database/chat";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ChatWindowProps {
  userId: string;
  conversation: ConversationWithDetails;
}

export function ChatWindow({ userId, conversation }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [otherTyping, setOtherTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
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
    // 1. Messages Postgres Channel
    const msgChannel = supabase
      .channel(`chat:messages:${conversation.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${conversation.id}` },
        async (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
          // If I'm the receiver, immediately mark it read
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

    // 2. Typing Indicator Broadcast
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
  }, [messages, otherTyping]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const content = newMessage.trim();
    setNewMessage("");
    handleTypingChange(false);
    
    await sendMessage(supabase, conversation.id, userId, content);
  };

  const handleTypingChange = (typing: boolean) => {
    setIsTyping(typing);
    supabase.channel(`chat:typing:${conversation.id}`).send({
      type: "broadcast",
      event: "typing",
      payload: { userId, isTyping: typing },
    });
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    
    if (!isTyping) {
      handleTypingChange(true);
    }
    
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    
    typingTimeoutRef.current = setTimeout(() => {
      handleTypingChange(false);
    }, 2000);
  };

  return (
    <div className="flex flex-col h-full bg-background relative">
      {/* Header */}
      <div className="p-4 border-b flex items-center shadow-sm z-10 bg-card">
        <div>
          <h2 className="font-bold text-lg">{conversation.other_participant.full_name}</h2>
          <p className="text-xs text-muted-foreground capitalize">{conversation.other_participant.role}</p>
        </div>
      </div>

      {/* Message History */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col relative z-0">
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {messages.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
                No messages here yet... Start the conversation!
              </div>
            ) : (
              messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} isMe={msg.sender_id === userId} />
              ))
            )}
            
            {otherTyping && (
              <div className="flex items-center text-muted-foreground text-sm italic mb-4">
                Typing...
              </div>
            )}
            <div ref={bottomRef} className="h-1" />
          </>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t bg-card z-10">
        <form onSubmit={handleSend} className="flex gap-2">
          <Input 
            placeholder="Type your message..." 
            value={newMessage}
            onChange={onInputChange}
            className="flex-1 rounded-full"
            autoComplete="off"
          />
          <Button type="submit" size="icon" className="rounded-full shrink-0" disabled={!newMessage.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
