import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST() {
  try {
    const admin = createAdminClient();
    const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString();

    // Delete unaccepted pending requests older than 6 hours
    const { data, error } = await admin
      .from("delivery_requests")
      .delete()
      .eq("status", "pending")
      .lt("created_at", sixHoursAgo)
      .select("id");

    if (error) {
      console.error("[api/requests/cleanup] Error deleting expired requests:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      deletedCount: data?.length || 0,
      cutoff: sixHoursAgo,
    });
  } catch (err: any) {
    console.error("[api/requests/cleanup] Unexpected error:", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return POST();
}
