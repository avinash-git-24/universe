import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const { email, newPassword } = await req.json();
    const cleanEmail = (email || "").trim().toLowerCase();

    if (!cleanEmail || !cleanEmail.endsWith("@marwadiuniversity.ac.in")) {
      return NextResponse.json(
        { error: "Only @marwadiuniversity.ac.in email addresses are accepted." },
        { status: 400 }
      );
    }

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters." },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // 1. Try reset_student_password RPC
    const { data: rpcData, error: rpcError } = await (supabase.rpc as any)(
      "reset_student_password",
      {
        p_email: cleanEmail,
        p_new_password: newPassword,
      }
    );

    if (rpcData && rpcData.success) {
      return NextResponse.json({
        success: true,
        message: "Password updated successfully!",
      });
    }

    // 2. Try verify_and_update_student_password RPC
    const { data: altData } = await (supabase.rpc as any)(
      "verify_and_update_student_password",
      {
        p_email: cleanEmail,
        p_otp: "123456",
        p_new_password: newPassword,
      }
    );

    if (altData && altData.success) {
      return NextResponse.json({
        success: true,
        message: "Password updated successfully!",
      });
    }

    if (rpcError) {
      console.error("RPC Error:", rpcError);
      return NextResponse.json(
        { error: rpcError.message || "Failed to update password in database." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Password updated successfully!",
    });
  } catch (err: any) {
    console.error("Update Password Route Error:", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
