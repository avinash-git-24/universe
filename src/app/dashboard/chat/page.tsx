import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ROUTES } from "@/constants/routes";
import { getConversations, getOrCreateConversation } from "@/lib/database/chat";
import { ChatClient } from "@/components/chat/ChatClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Messages · UniVerse",
  description: "Chat with students, runners, and admins.",
};

export default async function ChatPage({
  searchParams,
}: {
  searchParams: Promise<{ startWithUserId?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect(ROUTES.LOGIN);
  }

  const { startWithUserId } = await searchParams;

  if (startWithUserId && startWithUserId !== user.id) {
    // Attempt to ensure a conversation exists
    await getOrCreateConversation(supabase, user.id, startWithUserId);
    redirect("/dashboard/chat");
  }

  const initialConversations = await getConversations(supabase, user.id);

  return (
    <div className="min-h-screen bg-secondary/30 pt-24 pb-12 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Messages</h1>
          <p className="text-muted-foreground mt-1">Chat in real-time about your deliveries.</p>
        </div>
        
        <ChatClient userId={user.id} initialConversations={initialConversations} />
      </div>
    </div>
  );
}
