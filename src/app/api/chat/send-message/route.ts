import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
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

    const message = await sendMessage(
      supabase,
      conversationId,
      user.id,
      content || "",
      imageUrl || null,
      messageType || "text",
      metadata || null
    );

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
