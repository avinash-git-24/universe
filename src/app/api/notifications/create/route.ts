import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const body = await req.json();
    const { userId, title, message, type, referenceId } = body;

    const targetUserId = userId || user?.id;

    if (!targetUserId) {
      return NextResponse.json({ error: "Missing target userId" }, { status: 400 });
    }

    if (!title || !message) {
      return NextResponse.json({ error: "Missing title or message" }, { status: 400 });
    }

    // Use admin client with elevated privileges to ensure insertion succeeds regardless of RLS
    const admin = createAdminClient();
    const { data: notification, error: insertError } = await admin
      .from("notifications")
      .insert({
        user_id: targetUserId,
        title,
        message,
        type: type || "system",
        reference_id: referenceId || null,
        is_read: false,
      })
      .select()
      .single();

    if (insertError) {
      console.error("[api/notifications/create] Insert error:", insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, notification });
  } catch (err: any) {
    console.error("[api/notifications/create] Unexpected error:", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
