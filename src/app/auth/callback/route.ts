/**
 * UniVerse — Auth Callback Route Handler
 *
 * Supabase redirects here after:
 *   - Email verification (signup confirmation)
 *   - Password reset email link
 *   - OAuth flows (Google, etc.)
 *
 * The handler exchanges the code for a session and then
 * redirects the user to the appropriate page.
 *
 * Route: /auth/callback
 */

import { NextResponse } from "next/server";
import { type NextRequest } from "next/server";
import { type EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);

  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash") || searchParams.get("token");
  let type = searchParams.get("type") as EmailOtpType | null;

  if (token_hash && !type) {
    type = "signup";
  }

  console.log("[Auth Callback] Hit with URL:", request.url);
  console.log("[Auth Callback] Extracted params ->", { code, token_hash, type });

  const supabase = await createClient();

  let errorMessage = "auth_callback_failed";

  if (token_hash && type) {
    console.log("[Auth Callback] Attempting verifyOtp", { type, token_hash });
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });

    if (!error) {
      console.log("[Auth Callback] verifyOtp SUCCESS");
      if (type === "recovery") {
        return NextResponse.redirect(`${origin}/reset-password`);
      }
      return NextResponse.redirect(`${origin}/complete-profile`);
    } else {
      console.error("[Auth Callback] verifyOtp ERROR:", error);
      errorMessage = error.message;
    }
  } else if (code) {
    console.log("[Auth Callback] Attempting exchangeCodeForSession");
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      console.log("[Auth Callback] exchangeCodeForSession SUCCESS");
      // Password reset flow
      if (type === "recovery") {
        return NextResponse.redirect(`${origin}/reset-password`);
      }
      // Email confirmation flow
      return NextResponse.redirect(`${origin}/complete-profile`);
    } else {
      console.error("[Auth Callback] exchangeCodeForSession ERROR:", error);
      errorMessage = error.message;
    }
  } else {
    // Neither token_hash nor code is present.
    // This happens if the URL uses a hash fragment (implicit flow) or is missing parameters.
    errorMessage = "No auth code or token hash found in URL";
  }

  // Something went wrong — redirect to login with an error param
  return NextResponse.redirect(
    `${origin}/login?error=${encodeURIComponent(errorMessage)}`
  );
}
