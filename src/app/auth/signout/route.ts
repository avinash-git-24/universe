/**
 * UniVerse — Auth Sign Out Route Handler
 *
 * Route: /auth/signout
 * Clears the user's Supabase session and redirects to the login page.
 */

import { NextResponse } from "next/server";
import { type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ROUTES } from "@/constants/routes";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    await supabase.auth.signOut();
  }

  return NextResponse.redirect(new URL(ROUTES.LOGIN, request.url));
}
