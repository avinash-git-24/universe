"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import {
  Send,
  MapPin,
  Package,
  Image as ImageIcon,
  Loader2,
  ExternalLink,
  Tag,
  Search,
  X,
  Volume2,
  VolumeX,
  ChevronDown,
  Smile,
  ShieldCheck,
} from "lucide-react";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { createClient } from "@/lib/supabase/client";
import {
  Message,
  ConversationWithDetails,
  getMessages,
  sendMessage,
  markConversationAsRead,
  uploadChatImage,
} from "@/lib/database/chat";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { OfferMessageCard } from "@/components/chat/OfferMessageCard";
import { sounds } from "@/lib/audio";
import Link from "next/link";
import { format, isToday, isYesterday } from "date-fns";

const CAMPUS_QUICK_REPLIES = [
  "Okay 👍",
  "I'm on the way 🛵",
  "Hostel D gate pe hoon 📍",
  "Payment done 💳",
  "OTP check karo 🔑",
  "5 mins me pahunch raha ⏱️",
  "Please wait 🙏",
  "Item collected 📦",
];

const EMOJI_LIST = [
  "😀", "😂", "😍", "🥳", "😎", "🤝", "👍", "🔥", "🚀", "🛵",
  "📦", "🍕", "☕", "💯", "🙏", "❤️", "✨", "🎉", "👀", "✅",
  "⚡", "📍", "🏃", "🍔", "🥪", "🥤", "🙌", "👏", "💪", "🤩",
  "😡", "🤬", "😠", "😤", "😢", "💀"
];

interface ChatWindowProps {
  userId: string;
  conversation: ConversationWithDetails;
  isOnline: boolean;
}

function generateTempMessageId(): string {
  return `temp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function formatDateSeparator(dateStr: string): string {
  const d = new Date(dateStr);
  if (isToday(d)) return "Today";
  if (isYesterday(d)) return "Yesterday";
  return format(d, "MMMM d, yyyy");
}

export function ChatWindow({ userId, conversation, isOnline }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [otherTyping, setOtherTyping] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showSearch, setShowSearch] = useState(false);
  const [chatSearchQuery, setChatSearchQuery] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const [unreadScrolledCount, setUnreadScrolledCount] = useState(0);

  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const supabase = createClient();

  // Keep sound setting synced
  useEffect(() => {
    sounds.enabled = soundEnabled;
  }, [soundEnabled]);

  // Initial Load
  useEffect(() => {
    let isMounted = true;

    async function load() {
      setLoading(true);
      const data = await getMessages(supabase, conversation.id);
      if (isMounted) {
        setMessages(data);
        setLoading(false);
        await markConversationAsRead(supabase, conversation.id, userId);
      }
    }

    load();
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversation.id, userId]);

  // Realtime Subscriptions & Multi-Layer Sync
  useEffect(() => {
    const msgChannel = supabase
      .channel(`chat:messages:${conversation.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversation.id}`,
        },
        async (payload) => {
          const incoming = payload.new as Message;
          setMessages((prev) => {
            if (prev.some((m) => m.id === incoming.id)) return prev;
            const tempIdx = prev.findIndex(
              (m) =>
                m.id.startsWith("temp-") &&
                m.content === incoming.content &&
                m.sender_id === incoming.sender_id
            );
            if (tempIdx !== -1) {
              const copy = [...prev];
              copy[tempIdx] = incoming;
              return copy;
            }
            return [...prev, incoming];
          });

          if (incoming.sender_id !== userId) {
            sounds.playReceive();
            await markConversationAsRead(supabase, conversation.id, userId);

            // If user scrolled up, increment unread counter
            if (scrollContainerRef.current) {
              const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
              if (scrollHeight - scrollTop - clientHeight > 150) {
                setUnreadScrolledCount((c) => c + 1);
              }
            }
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversation.id}`,
        },
        (payload) => {
          setMessages((prev) =>
            prev.map((m) => (m.id === payload.new.id ? (payload.new as Message) : m))
          );
        }
      )
      .on("broadcast", { event: "new_message" }, async (payload) => {
        const incoming = payload.payload as Message;
        if (incoming && incoming.sender_id !== userId) {
          setMessages((prev) => {
            if (prev.some((m) => m.id === incoming.id)) return prev;
            return [...prev, incoming];
          });
          sounds.playReceive();
          await markConversationAsRead(supabase, conversation.id, userId);
        }
      })
      .on("broadcast", { event: "message_reaction" }, (payload) => {
        const { messageId, reactions } = payload.payload as {
          messageId: string;
          reactions: Record<string, string[]>;
        };
        if (messageId && reactions) {
          setMessages((prev) =>
            prev.map((m) => {
              if (m.id === messageId) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const meta = (m.metadata as any) || {};
                return { ...m, metadata: { ...meta, reactions } };
              }
              return m;
            })
          );
        }
      })
      .on("broadcast", { event: "message_confirmed" }, (payload) => {
        const confirmed = payload.payload as Message;
        if (confirmed) {
          setMessages((prev) => {
            if (prev.some((m) => m.id === confirmed.id)) return prev;
            const tempIdx = prev.findIndex(
              (m) =>
                m.id.startsWith("temp-") &&
                m.content === confirmed.content &&
                m.sender_id === confirmed.sender_id
            );
            if (tempIdx !== -1) {
              const copy = [...prev];
              copy[tempIdx] = confirmed;
              return copy;
            }
            return [...prev, confirmed];
          });
        }
      })
      .subscribe();

    const typingChannel = supabase
      .channel(`chat:typing:${conversation.id}`)
      .on("broadcast", { event: "typing" }, (payload) => {
        if (payload.payload.userId !== userId) {
          setOtherTyping(payload.payload.isTyping);
        }
      })
      .subscribe();

    // Background Smart Sync Polling (every 3.5s while active)
    const pollInterval = setInterval(async () => {
      try {
        const latest = await getMessages(supabase, conversation.id);
        if (latest && latest.length > 0) {
          setMessages((prev) => {
            const tempMessages = prev.filter((m) => m.id.startsWith("temp-"));
            const nonTemp = prev.filter((m) => !m.id.startsWith("temp-"));
            if (
              latest.length !== nonTemp.length ||
              latest[latest.length - 1]?.id !== nonTemp[nonTemp.length - 1]?.id
            ) {
              return [...latest, ...tempMessages];
            }
            return prev;
          });
        }
      } catch {}
    }, 3500);

    return () => {
      supabase.removeChannel(msgChannel);
      supabase.removeChannel(typingChannel);
      clearInterval(pollInterval);
    };
  }, [conversation.id, userId, supabase]);

  // Handle Scroll to toggle scroll-to-bottom button
  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    if (distanceFromBottom > 200) {
      setShowScrollBottom(true);
    } else {
      setShowScrollBottom(false);
      setUnreadScrolledCount(0);
    }
  };

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    bottomRef.current?.scrollIntoView({ behavior });
    setUnreadScrolledCount(0);
  };

  // Auto-scroll on new messages if near bottom
  useEffect(() => {
    if (!showScrollBottom) {
      scrollToBottom("smooth");
    }
  }, [messages, otherTyping, uploadingImage, showScrollBottom]);

  // Handle Send Message
  const handleSend = async (content: string, imageUrl?: string | null) => {
    if (!content.trim() && !imageUrl) return;

    const trimmedContent = content.trim();

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
    setNewMessage("");
    setShowEmojiPicker(false);
    handleTypingChange(false);

    sounds.playSend();

    // 1. Optimistic UI
    const tempId = generateTempMessageId();
    const optimisticMsg: Message = {
      id: tempId,
      conversation_id: conversation.id,
      sender_id: userId,
      content: trimmedContent,
      image_url: imageUrl || null,
      message_type: "text",
      metadata: null,
      status: "sent",
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    scrollToBottom("smooth");

    // 2. Peer Broadcast (0ms latency)
    const activeChannel = supabase.channel(`chat:messages:${conversation.id}`);
    activeChannel.send({
      type: "broadcast",
      event: "new_message",
      payload: optimisticMsg,
    });

    // 3. Database Persistence
    try {
      const dbMsg = await sendMessage(
        supabase,
        conversation.id,
        userId,
        trimmedContent,
        imageUrl
      );
      if (dbMsg) {
        setMessages((prev) => prev.map((m) => (m.id === tempId ? dbMsg : m)));
        activeChannel.send({
          type: "broadcast",
          event: "message_confirmed",
          payload: dbMsg,
        });
      }
    } catch (err) {
      console.error("[chat] Exception sending message:", err);
    }
  };

  // Handle Message Reactions (Single reaction per user: toggle or switch)
  const handleReact = async (messageId: string, emoji: string) => {
    const targetMsg = messages.find((m) => m.id === messageId);
    if (!targetMsg) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const currentMeta = (targetMsg.metadata as any) || {};
    const oldReactions: Record<string, string[]> = currentMeta.reactions || {};
    const newReactions: Record<string, string[]> = {};

    const alreadyHadThisEmoji = oldReactions[emoji]?.includes(userId);

    // 1. Remove current user from ALL existing reactions on this message
    for (const [e, users] of Object.entries(oldReactions)) {
      const filtered = users.filter((uid) => uid !== userId);
      if (filtered.length > 0) {
        newReactions[e] = filtered;
      }
    }

    // 2. If user didn't already have this emoji, add it as their single reaction
    if (!alreadyHadThisEmoji) {
      newReactions[emoji] = [...(newReactions[emoji] || []), userId];
    }

    const updatedMeta = { ...currentMeta, reactions: newReactions };

    // 1. Optimistic local update
    setMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, metadata: updatedMeta } : m))
    );

    // 2. Broadcast reaction
    supabase.channel(`chat:messages:${conversation.id}`).send({
      type: "broadcast",
      event: "message_reaction",
      payload: { messageId, reactions: newReactions },
    });

    // 3. Persist reaction to database
    if (!messageId.startsWith("temp-")) {
      await supabase
        .from("messages")
        .update({ metadata: updatedMeta })
        .eq("id", messageId);
    }
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
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Filter messages if search is active
  const filteredMessages = useMemo(() => {
    if (!chatSearchQuery.trim()) return messages;
    const q = chatSearchQuery.toLowerCase();
    return messages.filter((m) => m.content?.toLowerCase().includes(q));
  }, [messages, chatSearchQuery]);

  const req = conversation.delivery_request;
  const otherRole = conversation.other_participant.role === "student" ? "Student" : "Runner";

  return (
    <div className="flex flex-col h-full bg-[#080d0a] relative w-full overflow-hidden">
      {/* ── Chat Header ── */}
      <div className="p-3.5 sm:p-4 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-md z-20 bg-[#0c130f]/95 backdrop-blur-xl shrink-0">
        <div className="flex items-center justify-between w-full md:w-auto">
          <div className="flex items-center gap-3">
            {/* Avatar with Online Pulse */}
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-500/20 to-teal-400/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-extrabold text-sm shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                {conversation.other_participant?.full_name?.charAt(0).toUpperCase() || "U"}
              </div>
              <span
                className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#0c130f] ${
                  isOnline ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]" : "bg-neutral-600"
                }`}
              />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-base sm:text-lg text-white">
                  {conversation.other_participant?.full_name || "University Student"}
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                  {otherRole}
                </span>
              </div>
              <p className="text-xs text-white/50 flex items-center gap-1.5 mt-0.5">
                {isOnline ? (
                  <span className="text-emerald-400 font-medium">Active Now</span>
                ) : (
                  <span>Offline</span>
                )}
              </p>
            </div>
          </div>

          {/* Header Action Controls */}
          <div className="flex items-center gap-1.5 md:hidden">
            <button
              type="button"
              onClick={() => setShowSearch(!showSearch)}
              className={`p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors ${
                showSearch ? "bg-white/10 text-emerald-400" : ""
              }`}
            >
              <Search className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-red-400" />}
            </button>
          </div>
        </div>

        {/* Right side Header Extras (Desktop) */}
        <div className="hidden md:flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowSearch(!showSearch)}
            className={`p-2.5 rounded-xl border transition-all flex items-center gap-1.5 text-xs font-medium ${
              showSearch
                ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                : "bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10"
            }`}
            title="Search in chat"
          >
            <Search className="w-4 h-4" />
            <span>Search</span>
          </button>

          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2.5 rounded-xl border transition-all ${
              soundEnabled
                ? "bg-white/5 border-white/10 text-white/70 hover:text-white hover:bg-white/10"
                : "bg-red-500/10 border-red-500/20 text-red-400"
            }`}
            title={soundEnabled ? "Mute chat sounds" : "Unmute chat sounds"}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* ── Search Input Dropdown (When toggled) ── */}
      {showSearch && (
        <div className="p-3 bg-[#0a100c] border-b border-white/10 flex items-center gap-2 animate-in slide-in-from-top-2 duration-150 z-20">
          <Search className="w-4 h-4 text-emerald-400 ml-2 shrink-0" />
          <input
            type="text"
            placeholder="Search messages in this conversation..."
            value={chatSearchQuery}
            onChange={(e) => setChatSearchQuery(e.target.value)}
            autoFocus
            className="flex-1 bg-transparent text-sm text-white placeholder:text-white/30 focus:outline-none"
          />
          {chatSearchQuery && (
            <button
              onClick={() => setChatSearchQuery("")}
              className="text-xs text-white/50 hover:text-white px-2 py-1 rounded bg-white/5"
            >
              Clear
            </button>
          )}
          <button
            onClick={() => {
              setShowSearch(false);
              setChatSearchQuery("");
            }}
            className="p-1 rounded-lg text-white/40 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── Active Delivery Live HUD Banner (Pinned Top) ── */}
      {req && (
        <div className="px-4 py-2 bg-emerald-950/25 border-b border-emerald-500/20 flex items-center justify-between gap-3 shrink-0 backdrop-blur-sm z-10">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <Package className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white truncate">
                  Req #{req.id.slice(0, 6)}
                </span>
                <span className="text-[10px] uppercase font-extrabold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                  {req.status}
                </span>
              </div>
              <p className="text-[11px] text-white/60 truncate flex items-center gap-1">
                <MapPin className="w-3 h-3 text-emerald-400/70" />
                <span className="truncate">{req.pickup_location}</span>
                <span className="opacity-40">→</span>
                <span className="truncate">{req.dropoff_location}</span>
              </p>
            </div>
          </div>

          <Link
            href={`/dashboard/requests/${req.id}`}
            className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 text-xs font-bold transition-all border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.1)]"
          >
            <span>Details</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      )}

      {/* ── Resale Listing Banner (If Marketplace Chat) ── */}
      {conversation.resale_listing && (
        <div className="px-4 py-2 bg-emerald-950/25 border-b border-emerald-500/20 flex items-center justify-between gap-3 shrink-0 backdrop-blur-sm z-10">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <Tag className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold text-white truncate block">
                {conversation.resale_listing.title}
              </span>
              <span className="text-xs font-extrabold text-emerald-400">
                ₹{conversation.resale_listing.price}
              </span>
            </div>
          </div>

          <Link
            href={`/dashboard/marketplace/${conversation.resale_listing.id}`}
            className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 text-xs font-bold transition-all border border-emerald-500/30"
          >
            <span>View Item</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      )}

      {/* ── Messages Stream Container ── */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col relative z-0 space-y-1"
      >
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <LoadingSpinner size="lg" label="Loading conversation..." />
          </div>
        ) : (
          <>
            {filteredMessages.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center opacity-60">
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-3 text-emerald-400 shadow-lg">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-white">End-to-End Encrypted Campus Chat</p>
                <p className="text-xs text-white/50 mt-1 max-w-[280px]">
                  Send a message or choose a quick reply below to begin.
                </p>
              </div>
            ) : (
              filteredMessages.map((msg, idx) => {
                const prevMsg = filteredMessages[idx - 1];
                const nextMsg = filteredMessages[idx + 1];

                // Date separator logic
                const showDateHeader =
                  !prevMsg ||
                  formatDateSeparator(prevMsg.created_at) !==
                    formatDateSeparator(msg.created_at);

                // Grouping logic (same sender within 3 mins)
                const isSameSenderAsPrev =
                  prevMsg &&
                  prevMsg.sender_id === msg.sender_id &&
                  Math.abs(
                    new Date(msg.created_at).getTime() -
                      new Date(prevMsg.created_at).getTime()
                  ) < 180000;

                const isSameSenderAsNext =
                  nextMsg &&
                  nextMsg.sender_id === msg.sender_id &&
                  Math.abs(
                    new Date(nextMsg.created_at).getTime() -
                      new Date(msg.created_at).getTime()
                  ) < 180000;

                const isFirstInGroup = !isSameSenderAsPrev;
                const isLastInGroup = !isSameSenderAsNext;

                return (
                  <div key={msg.id} className="w-full">
                    {/* Date Separator Pill */}
                    {showDateHeader && (
                      <div className="flex items-center justify-center my-4">
                        <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/60 shadow-sm backdrop-blur-md">
                          {formatDateSeparator(msg.created_at)}
                        </span>
                      </div>
                    )}

                    {msg.message_type === "offer" ? (
                      <OfferMessageCard
                        message={msg}
                        currentUserId={userId}
                        conversationId={conversation.id}
                      />
                    ) : (
                      <MessageBubble
                        message={msg}
                        isMe={msg.sender_id === userId}
                        isFirstInGroup={isFirstInGroup}
                        isLastInGroup={isLastInGroup}
                        onReact={handleReact}
                        currentUserId={userId}
                      />
                    )}
                  </div>
                );
              })
            )}

            {/* Uploading Image Skeleton */}
            {uploadingImage && (
              <div className="flex flex-col w-full items-end mb-4 animate-in fade-in duration-200">
                <div className="max-w-[75%] rounded-2xl p-4 bg-[#00E676]/10 border border-[#00E676]/30 flex items-center gap-3">
                  <Loader2 className="w-4 h-4 text-[#00E676] animate-spin" />
                  <span className="text-xs text-white/80 font-medium">Encrypting & uploading image...</span>
                </div>
              </div>
            )}

            {/* Animated Typing Wave Indicator */}
            {otherTyping && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-white/5 border border-white/10 w-fit mb-2 animate-in fade-in duration-150">
                <span className="text-xs text-emerald-400 font-medium">{otherRole} is typing</span>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" />
                </div>
              </div>
            )}

            <div ref={bottomRef} className="h-1" />
          </>
        )}
      </div>

      {/* ── Floating Scroll to Bottom Button ── */}
      {showScrollBottom && (
        <button
          type="button"
          onClick={() => scrollToBottom("smooth")}
          className="absolute bottom-28 right-6 z-30 flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#0d1612] border border-emerald-500/40 text-emerald-400 font-bold text-xs shadow-2xl hover:scale-105 transition-all backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 duration-150"
        >
          <ChevronDown className="w-4 h-4" />
          {unreadScrolledCount > 0 ? (
            <span>{unreadScrolledCount} New Message{unreadScrolledCount > 1 ? "s" : ""}</span>
          ) : (
            <span>Scroll Down</span>
          )}
        </button>
      )}

      {/* ── Input Composer & Quick Replies ── */}
      <div className="border-t border-white/10 bg-[#0c130f] z-20 shrink-0 relative">
        {/* Emoji Keyboard Popover */}
        {showEmojiPicker && (
          <div className="absolute bottom-full left-4 mb-2 p-3 rounded-2xl bg-[#0e1612] border border-emerald-500/30 shadow-2xl backdrop-blur-xl z-50 w-72 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10 text-xs font-bold text-white/70">
              <span>Quick Emojis</span>
              <button
                type="button"
                onClick={() => setShowEmojiPicker(false)}
                className="text-white/40 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-6 gap-1.5 max-h-44 overflow-y-auto">
              {EMOJI_LIST.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => {
                    setNewMessage((prev) => prev + emoji);
                    if (textareaRef.current) textareaRef.current.focus();
                  }}
                  className="w-9 h-9 flex items-center justify-center text-lg rounded-xl hover:bg-white/10 hover:scale-125 transition-transform"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Campus Quick Replies Pill Strip */}
        <div className="flex items-center gap-1.5 px-3 sm:px-4 pt-2.5 pb-1 overflow-x-auto no-scrollbar max-w-4xl mx-auto w-full">
          {CAMPUS_QUICK_REPLIES.map((reply) => (
            <button
              key={reply}
              onClick={() => handleSend(reply)}
              disabled={loading || uploadingImage}
              className="shrink-0 px-3 py-1.5 rounded-full bg-white/5 hover:bg-emerald-500/15 border border-white/10 hover:border-emerald-500/30 text-xs text-white/80 hover:text-emerald-400 transition-all active:scale-95 disabled:opacity-50"
            >
              {reply}
            </button>
          ))}
        </div>

        {/* Message Input Bar */}
        <form
          onSubmit={onSubmitForm}
          className="flex gap-2 max-w-4xl mx-auto w-full items-end p-3 pt-2"
        >
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageUpload}
          />

          {/* Image Upload Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingImage}
            className="w-[42px] h-[42px] rounded-2xl shrink-0 bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors disabled:opacity-50 border border-white/10"
            title="Attach image"
          >
            <ImageIcon className="w-5 h-5" />
          </button>

          {/* Emoji Popover Trigger */}
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className={`w-[42px] h-[42px] rounded-2xl shrink-0 border transition-colors flex items-center justify-center ${
              showEmojiPicker
                ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
                : "bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10"
            }`}
            title="Open emoji keyboard"
          >
            <Smile className="w-5 h-5" />
          </button>

          {/* Textarea Input */}
          <div className="flex-1 relative bg-white/5 border border-white/10 rounded-2xl transition-all focus-within:border-emerald-500/50 focus-within:bg-white/10 focus-within:ring-1 focus-within:ring-emerald-500/20">
            <textarea
              ref={textareaRef}
              placeholder="Type a message... (Shift + Enter for new line)"
              value={newMessage}
              onChange={onInputChange}
              onKeyDown={onKeyDown}
              disabled={uploadingImage}
              className="w-full bg-transparent border-none focus:ring-0 resize-none py-2.5 px-4 text-sm text-white placeholder:text-white/30 max-h-[120px] rounded-2xl min-h-[42px] disabled:opacity-50"
              rows={1}
            />
          </div>

          {/* Send Button */}
          <button
            type="submit"
            disabled={!newMessage.trim() || uploadingImage}
            className="w-[42px] h-[42px] rounded-2xl shrink-0 bg-gradient-to-tr from-[#00E676] to-[#00C853] hover:brightness-110 flex items-center justify-center text-[#050A07] transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(0,230,118,0.25)] active:scale-95"
            title="Send message"
          >
            <Send className="w-4 h-4 ml-0.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
