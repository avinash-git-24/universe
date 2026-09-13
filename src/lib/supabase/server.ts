/**
 * UniVerse — Supabase Server Client
 *
 * Use this client in Server Components, Server Actions, and Route Handlers.
 * Reads cookies from the incoming request to restore the session.
 *
 * @module lib/supabase/server
 */

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  const supabaseUrl =
    process.env.SUPABASE_INTERNAL_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL!;

  return createServerClient(
    supabaseUrl,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookieOptions: {
        name: "universe-auth-token",
      },
      cookies: {
        getAll() {
          const all = cookieStore.getAll();
          const hasCustom = all.some((c) => c.name.startsWith("universe-auth-token"));
          if (hasCustom) {
            return all.filter((c) => !(c.name.startsWith("sb-") && c.name.includes("auth-token")));
          }
          return all.map((c) => {
            if (c.name.startsWith("sb-") && c.name.includes("auth-token")) {
              return {
                name: c.name.replace(/^sb-.*-auth-token/, "universe-auth-token"),
                value: c.value,
              };
            }
            return c;
          });
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // setAll() called from a Server Component where cookies are read-only.
            // The middleware handles cookie refresh in this case.
          }
        },
      },
    }
  );
}
