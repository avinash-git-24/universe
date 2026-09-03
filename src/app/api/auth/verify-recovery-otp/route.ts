import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const { email, otp } = await req.json();
    const cleanEmail = (email || "").trim().toLowerCase();
    const cleanOtp = (otp || "").trim();

    if (!cleanEmail || !cleanOtp || cleanOtp.length < 6) {
      return NextResponse.json(
        { error: "Please provide a valid email and 6-digit code." },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Verify OTP using database RPC
    const { data, error } = await (supabase.rpc as any)("verify_recovery_otp_code", {
      p_email: cleanEmail,
      p_otp: cleanOtp,
    });

    if (error || (data && data.success === false)) {
      return NextResponse.json(
        { error: data?.error || error?.message || "Invalid or expired 6-digit OTP code." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Code verified successfully!",
    });
  } catch (err: any) {
    console.error("Verify OTP Error:", err);
    return NextResponse.json(
      { error: err?.message || "Verification failed" },
      { status: 500 }
    );
  }
}
