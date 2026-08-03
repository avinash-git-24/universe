"use client";

import { useState } from "react";
import { MessageSquare } from "lucide-react";
import { ConversationWithDetails } from "@/lib/database/chat";
import { ChatList } from "@/components/chat/ChatList";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { useSearchParams, useRouter } from "next/navigation";

interface ChatClientProps {
  userId: string;
  initialConversations: ConversationWithDetails[];
}

export function ChatClient({ userId, initialConversations }: ChatClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeId = searchParams.get("id") || (initialConversations.length > 0 ? initialConversations[0].id : null);
  
  const [activeConversationId, setActiveConversationId] = useState<string | null>(activeId);

  const activeConversation = initialConversations.find(c => c.id === activeConversationId);

  const handleSelect = (id: string) => {
    setActiveConversationId(id);
    router.replace(`?id=${id}`, { scroll: false });
  };

  return (
    <div className="h-[calc(100vh-8rem)] min-h-[500px] w-full max-w-6xl mx-auto rounded-xl border bg-card shadow-sm overflow-hidden flex flex-col md:flex-row">
      
      {/* Sidebar (List) */}
      <div className={`w-full md:w-80 shrink-0 ${activeConversationId ? 'hidden md:block' : 'block'}`}>
        <ChatList 
          userId={userId} 
          initialConversations={initialConversations}
          activeConversationId={activeConversationId}
          onSelectConversation={handleSelect}
        />
      </div>

      {/* Main Area (Window) */}
      <div className={`flex-1 ${!activeConversationId ? 'hidden md:flex' : 'flex'}`}>
        {activeConversation ? (
          <div className="w-full flex flex-col">
            {/* Mobile Back Button (Rendered conditionally on small screens if we had space, but handled via CSS flex/hidden above) */}
            <div className="md:hidden p-2 bg-secondary/50 border-b">
              <button 
                onClick={() => handleSelect("")}
                className="text-sm font-semibold text-primary"
              >
                ← Back to Messages
              </button>
            </div>
            
            <div className="flex-1 overflow-hidden">
              <ChatWindow userId={userId} conversation={activeConversation} />
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8 text-center bg-secondary/10">
            <MessageSquare className="w-16 h-16 opacity-20 mb-4" />
            <p className="text-lg font-medium text-foreground">Your Messages</p>
            <p className="text-sm">Select a conversation from the sidebar to start chatting.</p>
          </div>
        )}
      </div>

    </div>
  );
}
