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
  const redirectTo = searchParams.get("redirectTo") || searchParams.get("next");

  if (token_hash && !type) {
    type = "signup";
  }

  const supabase = await createClient();

  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });

    if (!error) {
      if (type === "recovery") {
        return NextResponse.redirect(`${origin}/reset-password`);
      }
      return NextResponse.redirect(`${origin}/complete-profile`);
    }
  } else if (code) {
    const { error, data } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Enforce marwadiuniversity.ac.in domain for OAuth
      const email = data?.user?.email || "";
      if (!email.endsWith("@marwadiuniversity.ac.in")) {
        await supabase.auth.signOut();
        return NextResponse.redirect(
          `${origin}/login?error=${encodeURIComponent("Only @marwadiuniversity.ac.in emails are allowed.")}`
        );
      }

      // Password reset flow
      if (type === "recovery" || searchParams.get("type") === "recovery") {
        return NextResponse.redirect(`${origin}/reset-password`);
      }

      if (redirectTo && redirectTo !== "/complete-profile") {
        const dest = redirectTo.startsWith("/") ? redirectTo : `/${redirectTo}`;
        return NextResponse.redirect(`${origin}${dest}`);
      }

      return NextResponse.redirect(`${origin}/dashboard`);
    }
  }

  // Handle client-side hash fragments (#access_token=...&type=recovery)
  const clientBridgeHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>UniVerse Security</title>
</head>
<body style="background:#090d16;color:#10b981;display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;">
  <div style="text-align:center;">
    <div style="width:36px;height:36px;border:3px solid rgba(16,185,129,0.3);border-top:3px solid #10b981;border-radius:50%;animation:spin 1s linear infinite;margin:0 auto 16px;"></div>
    <p style="font-size:14px;letter-spacing:1px;">Verifying session...</p>
  </div>
  <style>@keyframes spin { 0% { transform:rotate(0deg); } 100% { transform:rotate(360deg); } }</style>
  <script>
    const hash = window.location.hash || '';
    const search = window.location.search || '';
    if (hash.includes('type=recovery') || search.includes('type=recovery')) {
      window.location.href = '/reset-password' + hash;
    } else if (hash.includes('access_token')) {
      window.location.href = '/dashboard' + hash;
    } else {
      window.location.href = '/login';
    }
  </script>
</body>
</html>`;

  return new NextResponse(clientBridgeHtml, {
    headers: { "Content-Type": "text/html" },
  });
}
