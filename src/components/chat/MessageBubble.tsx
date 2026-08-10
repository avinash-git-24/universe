"use client";

import { memo, useState } from "react";
import { Check, CheckCheck, X } from "lucide-react";
import { Message } from "@/lib/database/chat";
import { format } from "date-fns";
import Image from "next/image";

interface MessageBubbleProps {
  message: Message;
  isMe: boolean;
}

export const MessageBubble = memo(function MessageBubble({ message, isMe }: MessageBubbleProps) {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  return (
    <>
      <div className={`flex flex-col w-full ${isMe ? "items-end" : "items-start"} mb-4`}>
        <div 
          className={`max-w-[75%] rounded-2xl p-2 shadow-sm ${
            isMe 
              ? "bg-[#10b981] text-[#060a08] rounded-br-sm" 
              : "bg-white/10 text-white/90 border border-white/5 rounded-bl-sm"
          }`}
        >
          {message.image_url && (
            <div 
              className="relative w-full max-w-[250px] aspect-square rounded-xl overflow-hidden mb-2 cursor-pointer border border-white/10"
              onClick={() => setIsLightboxOpen(true)}
            >
              <Image 
                src={message.image_url} 
                alt="Shared image" 
                fill
                sizes="(max-width: 768px) 100vw, 250px"
                className="object-cover hover:scale-105 transition-transform duration-300" 
              />
            </div>
          )}
          
          {message.content && (
            <p className={`text-[15px] whitespace-pre-wrap break-words px-2 pb-1 ${!message.image_url ? 'pt-1' : ''}`}>
              {message.content}
            </p>
          )}
        </div>
        
        <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-white/40 px-1">
          <span>{format(new Date(message.created_at), "h:mm a")}</span>
          {isMe && (
            <span className="flex items-center">
              {message.status === "sent" && <Check className="w-3.5 h-3.5 opacity-70" />}
              {message.status === "delivered" && <CheckCheck className="w-3.5 h-3.5 opacity-70" />}
              {message.status === "read" && <CheckCheck className="w-3.5 h-3.5 text-[#10b981]" />}
            </span>
          )}
        </div>
      </div>

      {isLightboxOpen && message.image_url && (
        <div 
          className="fixed inset-0 z-50 bg-[#050A07]/95 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setIsLightboxOpen(false)}
        >
          <button 
            className="absolute top-6 right-6 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-50"
            onClick={(e) => { e.stopPropagation(); setIsLightboxOpen(false); }}
          >
            <X className="w-6 h-6" />
          </button>
          <div className="relative w-full max-w-5xl h-full max-h-[85vh]">
            <Image 
              src={message.image_url} 
              alt="Shared image full size" 
              fill
              sizes="100vw"
              className="object-contain"
              priority
            />
          </div>
        </div>
      )}
    </>
  );
});
