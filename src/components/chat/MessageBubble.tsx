"use client";

import { Check, CheckCheck } from "lucide-react";
import { Message } from "@/lib/database/chat";
import { format } from "date-fns";

interface MessageBubbleProps {
  message: Message;
  isMe: boolean;
}

export function MessageBubble({ message, isMe }: MessageBubbleProps) {
  return (
    <div className={`flex flex-col w-full ${isMe ? "items-end" : "items-start"} mb-4`}>
      <div 
        className={`max-w-[75%] rounded-2xl px-4 py-2 ${
          isMe 
            ? "bg-primary text-primary-foreground rounded-br-sm" 
            : "bg-secondary text-secondary-foreground rounded-bl-sm"
        }`}
      >
        <p className="text-sm break-words">{message.content}</p>
      </div>
      
      <div className="flex items-center gap-1 mt-1 text-[10px] text-muted-foreground px-1">
        <span>{format(new Date(message.created_at), "h:mm a")}</span>
        {isMe && (
          <span>
            {message.status === "sent" && <Check className="w-3 h-3" />}
            {message.status === "delivered" && <CheckCheck className="w-3 h-3" />}
            {message.status === "read" && <CheckCheck className="w-3 h-3 text-blue-500" />}
          </span>
        )}
      </div>
    </div>
  );
}
