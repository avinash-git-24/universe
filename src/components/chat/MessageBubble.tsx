"use client";

import { memo, useState } from "react";
import { Check, CheckCheck, X, Download, SmilePlus, Trash2 } from "lucide-react";
import { Message } from "@/lib/database/chat";
import { format } from "date-fns";
import Image from "next/image";

const POPULAR_REACTIONS = ["👍", "❤️", "😂", "😮", "😡", "🔥", "🚀", "🛵"];

interface MessageBubbleProps {
  message: Message;
  isMe: boolean;
  isFirstInGroup?: boolean;
  isLastInGroup?: boolean;
  onReact?: (messageId: string, emoji: string) => void;
  onDelete?: (messageId: string) => Promise<void> | void;
  currentUserId?: string;
}

export const MessageBubble = memo(function MessageBubble({
  message,
  isMe,
  isFirstInGroup = true,
  isLastInGroup = true,
  onReact,
  onDelete,
  currentUserId,
}: MessageBubbleProps) {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Parse reactions from metadata safely
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const reactions: Record<string, string[]> = (message.metadata as any)?.reactions || {};
  const reactionEntries = Object.entries(reactions).filter(([, userIds]) => userIds.length > 0);

  const handleDownload = async (url: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `universe-chat-${message.id.slice(0, 8)}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(url, "_blank");
    }
  };

  const handleReactionClick = (emoji: string) => {
    setShowReactionPicker(false);
    onReact?.(message.id, emoji);
  };

  return (
    <>
      <div
        className={`group relative flex flex-col w-full ${isMe ? "items-end" : "items-start"} ${
          isLastInGroup ? "mb-2.5" : "mb-1"
        }`}
      >
        {/* Floating Quick Reactions Toolbar (on hover) */}
        <div
          className={`absolute -top-8 ${
            isMe ? "right-2" : "left-2"
          } hidden group-hover:flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#0d1612]/95 border border-emerald-500/30 shadow-[0_8px_20px_rgba(0,0,0,0.5)] backdrop-blur-xl z-20 animate-in fade-in zoom-in-95 duration-150`}
        >
          {POPULAR_REACTIONS.map((emoji) => {
            const hasReacted = currentUserId && reactions[emoji]?.includes(currentUserId);
            return (
              <button
                key={emoji}
                type="button"
                onClick={() => handleReactionClick(emoji)}
                className={`w-6 h-6 flex items-center justify-center text-sm rounded-full hover:scale-130 transition-transform ${
                  hasReacted ? "bg-emerald-500/30 ring-1 ring-emerald-400" : "hover:bg-white/10"
                }`}
                title={`React with ${emoji}`}
              >
                {emoji}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => setShowReactionPicker(!showReactionPicker)}
            className="w-6 h-6 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-colors ml-0.5"
            title="Add reaction"
          >
            <SmilePlus className="w-3.5 h-3.5" />
          </button>

          {isMe && onDelete && (
            <>
              <div className="w-[1px] h-3.5 bg-white/20 mx-0.5" />
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="w-6 h-6 flex items-center justify-center text-red-400/80 hover:text-red-300 hover:bg-red-500/20 rounded-full transition-colors"
                title="Delete for everyone"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>

        {/* Message Bubble Card */}
        <div
          className={`relative max-w-[85%] sm:max-w-[72%] px-4 py-2.5 shadow-lg transition-all ${
            isMe
              ? "bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 text-white font-normal shadow-[0_4px_16px_rgba(16,185,129,0.25)] border border-emerald-400/20"
              : "bg-[#0e1612] text-white/95 border border-white/10 backdrop-blur-md shadow-[0_4px_16px_rgba(0,0,0,0.35)]"
          } ${
            isFirstInGroup && isLastInGroup
              ? "rounded-2xl"
              : isMe
              ? isFirstInGroup
                ? "rounded-2xl rounded-tr-sm"
                : isLastInGroup
                ? "rounded-2xl rounded-br-sm"
                : "rounded-l-2xl rounded-r-sm"
              : isFirstInGroup
              ? "rounded-2xl rounded-tl-sm"
              : isLastInGroup
              ? "rounded-2xl rounded-bl-sm"
              : "rounded-r-2xl rounded-l-sm"
          }`}
        >
          {/* Shared Image */}
          {message.image_url && (
            <div
              className={`relative max-w-[280px] sm:max-w-[360px] max-h-[380px] rounded-xl overflow-hidden cursor-pointer border border-white/10 group/img bg-black/40 flex items-center justify-center ${
                message.content ? "mb-2" : ""
              }`}
              onClick={() => setIsLightboxOpen(true)}
            >
              <Image
                src={message.image_url}
                alt="Shared image"
                width={400}
                height={400}
                unoptimized
                className="w-full max-h-[360px] object-contain rounded-xl group-hover/img:scale-[1.02] transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                <span className="text-xs font-semibold bg-black/80 text-white px-3 py-1 rounded-full backdrop-blur-md border border-white/20 shadow-lg">
                  🔍 View Full Size
                </span>
              </div>
            </div>
          )}

          {/* Text & Inline Meta Container */}
          <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
            {message.content && (
              <p className="text-[14px] leading-relaxed whitespace-pre-wrap break-words flex-1 min-w-[30px] select-text">
                {message.content}
              </p>
            )}

            {/* Timestamp & Status Checkmarks */}
            <div
              className={`flex items-center gap-1 text-[10px] ml-auto shrink-0 select-none ${
                isMe ? "text-emerald-100/80 font-medium" : "text-white/40"
              }`}
            >
              <span>{format(new Date(message.created_at), "h:mm a")}</span>
              {isMe && (
                <span className="flex items-center ml-0.5">
                  {message.status === "sent" && <Check className="w-3.5 h-3.5 text-white/70" />}
                  {message.status === "delivered" && (
                    <CheckCheck className="w-3.5 h-3.5 text-white/80" />
                  )}
                  {message.status === "read" && (
                    <CheckCheck className="w-3.5 h-3.5 text-cyan-300 font-bold drop-shadow-[0_0_8px_rgba(34,211,238,0.95)]" />
                  )}
                </span>
              )}
              {isMe && onDelete && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDeleteConfirm(true);
                  }}
                  className="opacity-0 group-hover:opacity-100 max-sm:opacity-60 hover:opacity-100 text-white/70 hover:text-red-300 ml-1 p-0.5 rounded transition-all active:scale-95 cursor-pointer"
                  title="Delete message"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Reaction Badges Container */}
        {reactionEntries.length > 0 && (
          <div
            className={`flex flex-wrap items-center gap-1 -mt-2 z-10 ${
              isMe ? "justify-end mr-2" : "justify-start ml-2"
            }`}
          >
            {reactionEntries.map(([emoji, users]) => {
              const hasMyReaction = currentUserId && users.includes(currentUserId);
              return (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => onReact?.(message.id, emoji)}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold border transition-all ${
                    hasMyReaction
                      ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                      : "bg-[#0d1410] border-white/10 text-white/80 hover:border-white/20"
                  }`}
                  title={`${users.length} reaction${users.length > 1 ? "s" : ""}`}
                >
                  <span>{emoji}</span>
                  <span className="text-[10px] opacity-80">{users.length}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Lightbox Fullscreen HD Preview Modal */}
      {isLightboxOpen && message.image_url && (
        <div
          className="fixed inset-0 z-50 bg-[#050A07]/95 backdrop-blur-2xl flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setIsLightboxOpen(false)}
        >
          <div className="absolute top-6 right-6 flex items-center gap-3 z-50">
            <button
              className="p-2.5 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors backdrop-blur-md border border-white/10 shadow-lg"
              onClick={(e) => handleDownload(message.image_url!, e)}
              title="Download image"
            >
              <Download className="w-5 h-5" />
            </button>
            <button
              className="p-2.5 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors backdrop-blur-md border border-white/10 shadow-lg"
              onClick={(e) => {
                e.stopPropagation();
                setIsLightboxOpen(false);
              }}
              title="Close (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div
            className="relative w-full max-w-5xl h-full max-h-[88vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={message.image_url}
              alt="Shared image full size"
              fill
              unoptimized
              sizes="100vw"
              className="object-contain"
              priority
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => !isDeleting && setShowDeleteConfirm(false)}
        >
          <div
            className="relative w-full max-w-sm rounded-2xl bg-[#0c1410] border border-white/15 p-5 shadow-[0_16px_40px_rgba(0,0,0,0.8)] text-left animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3.5 mb-3.5">
              <div className="w-10 h-10 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Delete message?</h3>
                <p className="text-xs text-white/60 mt-1 leading-relaxed">
                  This message will be deleted for everyone in this chat.
                </p>
              </div>
            </div>

            {/* Message snippet preview */}
            <div className="mb-5 px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white/75 italic truncate">
              &ldquo;{message.content || (message.image_url ? "📷 Image attachment" : "Message")}&rdquo;
            </div>

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white/70 hover:text-white bg-white/5 hover:bg-white/10 transition-colors disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={async () => {
                  setIsDeleting(true);
                  try {
                    await onDelete?.(message.id);
                  } finally {
                    setIsDeleting(false);
                    setShowDeleteConfirm(false);
                  }
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 transition-all shadow-[0_4px_16px_rgba(220,38,38,0.35)] flex items-center gap-1.5 disabled:opacity-50 active:scale-95 cursor-pointer"
              >
                {isDeleting ? "Deleting..." : "Delete for everyone"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
});

