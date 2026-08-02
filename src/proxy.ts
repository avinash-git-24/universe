/**
 * UniVerse — Next.js Middleware
 *
 * Runs on every matched request before it reaches a page or API route.
 * Delegates to Supabase's updateSession() to:
 *   1. Refresh expired auth tokens
 *   2. Protect authenticated routes
 *   3. Redirect logged-in users away from auth pages
 */

import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static  (static files)
     * - _next/image   (image optimization)
     * - favicon.ico   (favicon)
     * - Public assets (images, icons, manifest)
     */
    "/((?!_next/static|_next/image|favicon.ico|icons|images|manifest.json|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
