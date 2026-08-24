/**
 * UniVerse — Supabase Middleware Client
 *
 * Used inside src/proxy.ts.
 * Refreshes expired sessions and enforces route protection rules:
 *   1. Protects dashboard and application areas from unauthenticated access.
 *   2. Prevents unconfirmed email accounts from bypassing verification.
 *   3. Redirects authenticated users away from auth pages to dashboard.
 *   4. Ensures cookies and session tokens are preserved across all redirects.
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

  const { pathname } = request.nextUrl;

  // Auth pages (where logged-in users generally shouldn't be)
  const authRoutes = ["/login", "/register", "/forgot-password", "/verify-email"];

  // Protected pages (must be fully authenticated and email-verified)
  const protectedRoutes = [
    "/dashboard",
    "/complete-profile",
    "/profile",
    "/requests",
    "/deliver",
    "/request",
    "/settings",
    "/admin",
  ];

  const isAuthRoute = authRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
  const isProtectedRoute = protectedRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));

  // Determine if email confirmation is required & verified
  // OAuth accounts usually have email_verified or provider != email
  const isEmailConfirmed = !!user?.email_confirmed_at || (!!user && user.app_metadata?.provider !== "email");
  const isAuthenticated = !!user && isEmailConfirmed;

  // Helper to construct redirect with preserved session cookies
  const createRedirectWithCookies = (url: URL) => {
    const redirectRes = NextResponse.redirect(url);
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectRes.cookies.set(cookie.name, cookie.value, {
        path: cookie.path,
        domain: cookie.domain,
        maxAge: cookie.maxAge,
        sameSite: cookie.sameSite,
        httpOnly: cookie.httpOnly,
        secure: cookie.secure,
      });
    });
    return redirectRes;
  };

  // 1. Protected routes protection
  if (isProtectedRoute) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("redirectTo", pathname);
      return createRedirectWithCookies(url);
    }

    if (!isEmailConfirmed) {
      const url = request.nextUrl.clone();
      url.pathname = "/verify-email";
      if (user.email) {
        url.searchParams.set("email", user.email);
      }
      return createRedirectWithCookies(url);
    }
  }

  // 2. Redirect authenticated users away from auth pages
  if (isAuthenticated && isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return createRedirectWithCookies(url);
  }

  return supabaseResponse;
}
