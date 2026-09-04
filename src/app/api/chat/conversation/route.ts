import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getOrCreateConversation, getConversationById } from "@/lib/database/chat";

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
    const { otherUserId, requestId } = body;

    if (!otherUserId || typeof otherUserId !== "string") {
      return NextResponse.json({ error: "Missing otherUserId" }, { status: 400 });
    }

    // 1. Get or create the conversation (safe server execution)
    const convId = await getOrCreateConversation(
      supabase,
      user.id,
      otherUserId.trim(),
      requestId ? String(requestId).trim() : null
    );

    if (!convId) {
      return NextResponse.json(
        { error: "Failed to initialize conversation" },
        { status: 500 }
      );
    }

    // 2. Load populated conversation details for immediate client hydration
    const conversation = await getConversationById(supabase, convId, user.id);

    return NextResponse.json({
      success: true,
      conversationId: convId,
      conversation,
    });
  } catch (err: any) {
    console.error("[api/chat/conversation] Error:", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
