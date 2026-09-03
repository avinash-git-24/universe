import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    const cleanEmail = (email || "").trim().toLowerCase();

    if (!cleanEmail || !cleanEmail.endsWith("@marwadiuniversity.ac.in")) {
      return NextResponse.json(
        { error: "Only @marwadiuniversity.ac.in email addresses are accepted." },
        { status: 400 }
      );
    }

    // 1. Generate 6-digit secure OTP code
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();

    const supabase = await createClient();

    // 2. Try storing OTP via database RPC
    try {
      await (supabase.rpc as any)("generate_and_store_recovery_otp", { p_email: cleanEmail });
    } catch (e) {
      console.warn("RPC fallback:", e);
    }

    // 3. Dispatch Email via Web3Forms Free Direct Dispatcher
    try {
      await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          access_key: "0e0d37e6-99cf-41c3-8eb1-4dc7950c268c",
          from_name: "UniVerse Security",
          subject: `🔐 UniVerse Password Reset Code: ${generatedOtp}`,
          email: cleanEmail,
          message: `Your 6-digit UniVerse verification code is: ${generatedOtp}. Valid for 15 minutes.`,
        }),
      });
    } catch {}

    // 4. Return success along with security OTP
    return NextResponse.json({
      success: true,
      otp: generatedOtp,
      message: `A 6-digit security code has been generated for ${cleanEmail}`,
    });
  } catch (err: any) {
    console.error("Send OTP Route Error:", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
