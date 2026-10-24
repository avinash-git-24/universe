import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { messageId } = body;

    if (!messageId) {
      return NextResponse.json({ error: "Missing messageId" }, { status: 400 });
    }

    const admin = createAdminClient();

    // 1. Fetch message to check existence & verify ownership
    const { data: initialMessage, error: fetchError } = await admin
      .from("messages")
      .select("id, sender_id, conversation_id")
      .eq("id", messageId)
      .maybeSingle();

    let targetMessage = initialMessage;

    if (fetchError || !targetMessage) {
      // Fallback: Check via authenticated user client
      const { data: clientTarget } = await supabase
        .from("messages")
        .select("id, sender_id, conversation_id")
        .eq("id", messageId)
        .maybeSingle();
      if (clientTarget) {
        targetMessage = clientTarget;
      }
    }

    // If message is already gone, consider it successfully deleted
    if (!targetMessage) {
      return NextResponse.json({ success: true, messageId });
    }

    // Security check: Only the sender can delete the message
    if (targetMessage.sender_id !== user.id) {
      return NextResponse.json(
        { error: "Forbidden: You can only delete your own messages" },
        { status: 403 }
      );
    }

    // 2. Perform deletion via elevated admin client (bypasses client RLS)
    const { error: adminDeleteError } = await admin
      .from("messages")
      .delete()
      .eq("id", messageId);

    if (adminDeleteError) {
      console.warn("[api/chat/delete-message] Admin delete error, attempting RPC/client fallback:", adminDeleteError);

      // RPC fallback
      try {
        await (supabase.rpc as any)("delete_message_for_everyone", {
          p_message_id: messageId,
        });
      } catch {}

      // Client delete fallback
      await supabase
        .from("messages")
        .delete()
        .eq("id", messageId)
        .eq("sender_id", user.id);
    }

    // 3. Double-check if the message still exists in database
    const { data: remaining } = await admin
      .from("messages")
      .select("id")
      .eq("id", messageId)
      .maybeSingle();

    if (remaining) {
      // Fail-safe: In case foreign key or database lock prevented hard deletion,
      // scrub message content and mark metadata with deleted flag so getMessages ignores it
      await admin
        .from("messages")
        .update({
          content: "This message was deleted",
          image_url: null,
          metadata: { deleted: true, deleted_at: new Date().toISOString() },
        })
        .eq("id", messageId);
    }

    // 4. Touch conversation updated_at
    try {
      await admin
        .from("conversations")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", targetMessage.conversation_id);
    } catch {}

    return NextResponse.json({ success: true, messageId });
  } catch (err: any) {
    console.error("[api/chat/delete-message] Exception:", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
