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

    // 1. Generate & store 6-digit secure OTP in Supabase database
    const { data: otpCode, error: otpError } = await (supabase.rpc as any)(
      "generate_and_store_recovery_otp",
      { p_email: cleanEmail }
    );

    if (otpError) {
      console.warn("RPC Warning:", otpError);
    }

    // 2. Trigger native Supabase recovery email dispatch with explicit callback redirectTo
    const origin = req.headers.get("origin") || req.nextUrl.origin || "https://universe-brown-seven.vercel.app";
    try {
      await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: `${origin}/auth/callback?type=recovery`,
      });
    } catch (e) {
      console.warn("Supabase auth email reset error:", e);
    }

    // 3. Dispatch Email via Web3Forms dynamic delivery
    try {
      const codeToSend = otpCode || Math.floor(100000 + Math.random() * 900000).toString();
      await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          access_key: "0e0d37e6-99cf-41c3-8eb1-4dc7950c268c",
          from_name: "UniVerse Campus Security",
          subject: `🔐 UniVerse Password Reset Code: ${codeToSend}`,
          email: cleanEmail,
          message: `Hello,\n\nYour 6-digit verification code to reset your UniVerse password is:\n\n👉  ${codeToSend}  👈\n\nThis security code is valid for 15 minutes. Please do not share this code with anyone.\n\n— The UniVerse Team`,
        }),
      });
    } catch (mailErr) {
      console.warn("Email dispatcher warning:", mailErr);
    }

    // 4. Return success
    return NextResponse.json({
      success: true,
      message: `A password reset link has been sent to ${cleanEmail}`,
    });
  } catch (err: any) {
    console.error("Send OTP Route Error:", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
