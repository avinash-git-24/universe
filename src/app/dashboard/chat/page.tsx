import { getUser } from "@/lib/supabase/queries";
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
  searchParams: Promise<{ startWithUserId?: string; requestId?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await getUser();

  if (authError || !user) {
    redirect(ROUTES.LOGIN);
  }

  const { startWithUserId, requestId } = await searchParams;

  if (startWithUserId && startWithUserId !== user.id) {
    // Attempt to ensure a conversation exists
    const convId = await getOrCreateConversation(supabase, user.id, startWithUserId, requestId || null);
    if (convId) {
      redirect(`/dashboard/chat?id=${convId}`);
    } else {
      redirect("/dashboard/chat");
    }
  }

  const initialConversations = await getConversations(supabase, user.id);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background">
      <div className="max-w-[1400px] mx-auto p-4 md:p-8 h-full flex flex-col pt-12 md:pt-24 space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Messages</h1>
          <p className="text-white/50 mt-1">Chat in real-time about your deliveries.</p>
        </div>
        
        <ChatClient userId={user.id} initialConversations={initialConversations} />
      </div>
    </div>
  );
}
