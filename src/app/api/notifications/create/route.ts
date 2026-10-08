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
    const {
      userId,
      title,
      message,
      type,
      referenceId,
      broadcast,
      broadcastTitle,
      broadcastMessage,
    } = body;

    const targetUserId = userId || user?.id;

    if (!targetUserId && !broadcast) {
      return NextResponse.json({ error: "Missing target userId" }, { status: 400 });
    }

    if (!title || !message) {
      return NextResponse.json({ error: "Missing title or message" }, { status: 400 });
    }

    // Use admin client with elevated privileges to guarantee insertion across client RLS
    const admin = createAdminClient();
    let notification = null;

    // 1. Insert notification for target user if specified
    if (targetUserId) {
      const { data, error: insertError } = await admin
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
        console.error("[api/notifications/create] Target user insert error:", insertError);
      } else {
        notification = data;
      }
    }

    // 2. Broadcast to all other campus students/runners if requested
    if (broadcast) {
      const senderId = targetUserId || user?.id;
      const { data: profiles, error: profError } = await admin
        .from("profiles")
        .select("id")
        .neq("id", senderId);

      if (profError) {
        console.error("[api/notifications/create] Broadcast profiles fetch error:", profError);
      } else if (profiles && profiles.length > 0) {
        const bTitle = broadcastTitle || "📦 New Delivery Request Nearby!";
        const bMsg =
          broadcastMessage ||
          "A student just placed a delivery request on campus radar! Tap to accept & earn.";
        const bType = "new_request_available";

        // Query existing notifications for this reference to guarantee idempotency and avoid duplicates
        let existingUserIds = new Set<string>();
        if (referenceId) {
          const { data: existing } = await admin
            .from("notifications")
            .select("user_id")
            .eq("reference_id", referenceId)
            .eq("type", bType);

          if (existing) {
            existingUserIds = new Set(existing.map((n) => n.user_id));
          }
        }

        const candidateProfiles = profiles.filter((p) => !existingUserIds.has(p.id));

        if (candidateProfiles.length > 0) {
          const broadcastRows = candidateProfiles.map((p) => ({
            user_id: p.id,
            title: bTitle,
            message: bMsg,
            type: bType,
            reference_id: referenceId || null,
            is_read: false,
          }));

          // Batch insert in chunks of 50 to maintain optimal PostgreSQL write performance
          for (let i = 0; i < broadcastRows.length; i += 50) {
            const chunk = broadcastRows.slice(i, i + 50);
            const { error: batchErr } = await admin.from("notifications").insert(chunk);
            if (batchErr) {
              console.error("[api/notifications/create] Broadcast chunk insert error:", batchErr);
            }
          }
        }
      }
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

