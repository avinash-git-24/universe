import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const { email, otp, newPassword } = await req.json();
    const cleanEmail = (email || "").trim().toLowerCase();
    const cleanOtp = (otp || "").trim();

    if (!cleanEmail || !cleanOtp || !newPassword || newPassword.length < 6) {
      return NextResponse.json(
        { error: "Invalid data. Password must be at least 6 characters." },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Verify OTP and update password in database
    const { data, error } = await (supabase.rpc as any)(
      "verify_and_update_student_password",
      {
        p_email: cleanEmail,
        p_otp: cleanOtp,
        p_new_password: newPassword,
      }
    );

    if (error || (data && data.success === false)) {
      return NextResponse.json(
        { error: data?.error || error?.message || "Failed to update password." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Password updated successfully!",
    });
  } catch (err: any) {
    console.error("Reset Password Final Error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to save password." },
      { status: 500 }
    );
  }
}
