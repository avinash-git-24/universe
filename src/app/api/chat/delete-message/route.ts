import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient, hasAdminPrivileges } from "@/lib/supabase/admin";

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

    // 1. Try safe RPC first
    try {
      const { data, error } = await (supabase.rpc as any)("delete_message_for_everyone", {
        p_message_id: messageId,
      });

      if (!error && data) {
        return NextResponse.json({ success: true, messageId });
      }
    } catch {
      // Fallback to direct client verification below
    }

    // 2. Fetch message to check ownership
    const { data: targetMessage, error: fetchError } = await supabase
      .from("messages")
      .select("id, sender_id, conversation_id")
      .eq("id", messageId)
      .maybeSingle();

    if (fetchError) {
      console.error("[api/chat/delete-message] Fetch error:", fetchError);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
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

    // 3. Delete the message using supabase client or admin fallback
    const { error: deleteError } = await supabase
      .from("messages")
      .delete()
      .eq("id", messageId)
      .eq("sender_id", user.id);

    if (deleteError) {
      console.warn("[api/chat/delete-message] Client delete error, trying admin fallback:", deleteError);
      if (hasAdminPrivileges()) {
        const adminClient = createAdminClient();
        const { error: adminDeleteError } = await adminClient
          .from("messages")
          .delete()
          .eq("id", messageId);

        if (adminDeleteError) {
          console.error("[api/chat/delete-message] Admin delete error:", adminDeleteError);
          return NextResponse.json({ error: "Failed to delete message" }, { status: 500 });
        }

        // Touch conversation updated_at
        await adminClient
          .from("conversations")
          .update({ updated_at: new Date().toISOString() })
          .eq("id", targetMessage.conversation_id);
      } else {
        return NextResponse.json({ error: deleteError.message }, { status: 500 });
      }
    } else {
      // Touch conversation updated_at
      await supabase
        .from("conversations")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", targetMessage.conversation_id);
    }

    return NextResponse.json({ success: true, messageId });
  } catch (err: any) {
    console.error("[api/chat/delete-message] Exception:", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
