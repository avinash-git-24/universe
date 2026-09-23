import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
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

    const targetUserId = otherUserId.trim();
    const targetRequestId = requestId ? String(requestId).trim() : null;

    // Use admin client with service_role to ensure participants are inserted across RLS boundaries
    let convId: string | null = null;
    let adminClient: ReturnType<typeof createAdminClient> | null = null;

    try {
      adminClient = createAdminClient();
      convId = await getOrCreateConversation(
        adminClient,
        user.id,
        targetUserId,
        targetRequestId
      );
    } catch (adminErr) {
      console.warn("[api/chat/conversation] adminClient execution warning:", adminErr);
    }

    // Fallback: If adminClient is unavailable or failed, try user-authenticated supabase client
    if (!convId) {
      convId = await getOrCreateConversation(
        supabase,
        user.id,
        targetUserId,
        targetRequestId
      );
    }

    if (!convId) {
      return NextResponse.json(
        { error: "Failed to initialize conversation" },
        { status: 500 }
      );
    }

    // 2. Load populated conversation details for immediate client hydration
    let conversation = null;
    if (adminClient) {
      try {
        conversation = await getConversationById(adminClient, convId, user.id);
      } catch (err) {
        console.warn("[api/chat/conversation] adminClient getConversationById warning:", err);
      }
    }

    if (!conversation) {
      conversation = await getConversationById(supabase, convId, user.id);
    }

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
