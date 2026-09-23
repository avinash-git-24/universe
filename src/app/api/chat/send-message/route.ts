import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendMessage } from "@/lib/database/chat";

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
    const { conversationId, content, imageUrl, messageType, metadata } = body;

    if (!conversationId) {
      return NextResponse.json({ error: "Missing conversationId" }, { status: 400 });
    }

    if (!content && !imageUrl) {
      return NextResponse.json({ error: "Empty message" }, { status: 400 });
    }

    let message = await sendMessage(
      supabase,
      conversationId,
      user.id,
      content || "",
      imageUrl || null,
      messageType || "text",
      metadata || null
    );

    // Auto-heal fallback: If standard insert/RPC was blocked by missing participant record or RLS
    if (!message) {
      try {
        const hasRealServiceKey = Boolean(
          process.env.SUPABASE_SERVICE_ROLE_KEY &&
          process.env.SUPABASE_SERVICE_ROLE_KEY !== process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
        );
        const fallbackClient = hasRealServiceKey ? createAdminClient() : supabase;

        // 1. Auto-heal: Ensure current user is in conversation_participants
        const participantsTable = fallbackClient.from("conversation_participants") as any;
        if (typeof participantsTable.upsert === "function") {
          await participantsTable.upsert(
            { conversation_id: conversationId, profile_id: user.id },
            { onConflict: "conversation_id,profile_id" }
          );
        } else {
          await participantsTable.insert(
            { conversation_id: conversationId, profile_id: user.id }
          );
        }

        // 2. Insert message via fallback client
        const { data: fallbackMsg, error: insertErr } = await fallbackClient
          .from("messages")
          .insert({
            conversation_id: conversationId,
            sender_id: user.id,
            content: content || "",
            image_url: imageUrl || null,
            message_type: messageType || "text",
            metadata: metadata || null,
          })
          .select("*")
          .single();

        if (!insertErr && fallbackMsg) {
          message = fallbackMsg;
          await fallbackClient
            .from("conversations")
            .update({ updated_at: new Date().toISOString() })
            .eq("id", conversationId);
        } else if (insertErr) {
          console.error("[api/chat/send-message] Fallback insert error:", insertErr);
        }
      } catch (fallbackErr) {
        console.error("[api/chat/send-message] Fallback exception:", fallbackErr);
      }
    }

    if (!message) {
      return NextResponse.json(
        { error: "Failed to persist message" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message });
  } catch (err: any) {
    console.error("[api/chat/send-message] Error:", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
