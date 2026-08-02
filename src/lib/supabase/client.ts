/**
 * UniVerse — Supabase Browser Client
 *
 * Use this client in Client Components ("use client").
 * Creates a singleton to avoid multiple client instances.
 *
 * @module lib/supabase/client
 */

import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}
