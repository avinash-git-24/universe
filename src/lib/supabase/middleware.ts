/**
 * UniVerse — Supabase Middleware Client
 *
 * Use ONLY inside middleware.ts.
 * Refreshes expired sessions by reading/writing cookies on the Response.
 *
 * @module lib/supabase/middleware
 */

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: Do NOT add logic between createServerClient and getUser().
  // Any logic here could invalidate the session refresh mechanism.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // ── Route Protection ──────────────────────────────────────────────────────

  const { pathname } = request.nextUrl;

  // Auth-only pages (no login needed)
  const authRoutes = ["/login", "/register", "/forgot-password", "/verify-email"];

  // Protected pages (must be logged in)
  const protectedRoutes = ["/dashboard", "/complete-profile", "/profile", "/requests", "/deliver", "/settings"];

  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

  // Redirect logged-in users away from auth pages
  if (user && isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  // Redirect unauthenticated users away from protected pages
  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    // Preserve the original destination so we can redirect after login
    url.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(url);
  }

  // IMPORTANT: Return supabaseResponse, NOT a new NextResponse.
  // Returning a different response drops cookies and breaks session persistence.
  return supabaseResponse;
}
