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
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);

  const code = searchParams.get("code");
  const type = searchParams.get("type"); // "recovery" for password reset

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Password reset flow — send to reset-password page
      if (type === "recovery") {
        return NextResponse.redirect(`${origin}/reset-password`);
      }
      // Email confirmation flow — send to complete-profile
      return NextResponse.redirect(`${origin}/complete-profile`);
    }
  }

  // Something went wrong — redirect to login with an error param
  return NextResponse.redirect(
    `${origin}/login?error=auth_callback_failed`
  );
}
