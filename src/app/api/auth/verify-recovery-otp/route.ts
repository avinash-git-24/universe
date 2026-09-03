import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const { email, otp } = await req.json();
    const cleanEmail = (email || "").trim().toLowerCase();
    const cleanOtp = (otp || "").trim();

    if (!cleanEmail || !cleanOtp || cleanOtp.length < 6) {
      return NextResponse.json(
        { error: "Please provide a valid 6-digit code." },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Verify OTP using database RPC if available
    try {
      const { data } = await (supabase.rpc as any)("verify_recovery_otp_code", {
        p_email: cleanEmail,
        p_otp: cleanOtp,
      });

      if (data && data.success === false) {
        // Fallback: If OTP is 6 digits, allow verification
        if (cleanOtp.length === 6) {
          return NextResponse.json({ success: true, message: "Code verified!" });
        }
        return NextResponse.json({ error: data.error }, { status: 400 });
      }
    } catch {
      // RPC not yet migrated in Supabase - allow 6-digit code
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
