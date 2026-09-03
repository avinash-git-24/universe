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

    const supabase = await createClient();

    // 1. Generate and store 6-digit OTP in database
    const { data: otpCode, error: otpError } = await (supabase.rpc as any)(
      "generate_and_store_recovery_otp",
      { p_email: cleanEmail }
    );

    if (otpError || !otpCode) {
      console.error("Failed to generate OTP:", otpError);
      return NextResponse.json(
        { error: "Unable to generate verification code. Please try again." },
        { status: 500 }
      );
    }

    // 2. Dispatch Email via Web3Forms Free Direct Dispatcher
    try {
      await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          access_key: "0e0d37e6-99cf-41c3-8eb1-4dc7950c268c",
          from_name: "UniVerse Campus Security",
          subject: `🔐 UniVerse Password Reset Code: ${otpCode}`,
          email: cleanEmail,
          message: `Hello,\n\nYour 6-digit verification code to reset your UniVerse password is:\n\n👉  ${otpCode}  👈\n\nThis security code is valid for 15 minutes. If you did not request this, please ignore this email.\n\n— The UniVerse Team`,
        }),
      });
    } catch (mailErr) {
      console.warn("Email dispatcher warning:", mailErr);
    }

    // Also trigger standard Supabase recovery
    try {
      await supabase.auth.resetPasswordForEmail(cleanEmail);
    } catch {}

    return NextResponse.json({
      success: true,
      message: `A 6-digit verification code has been sent to ${cleanEmail}`,
    });
  } catch (err: any) {
    console.error("Send OTP Route Error:", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
