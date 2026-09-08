/**
 * UniVerse — Supabase Admin / Service Role Client
 *
 * Use this client ONLY in secure Server Routes (e.g. /api/auth/*)
 * where elevated privileges are needed for OTP generation & password updates.
 *
 * @module lib/supabase/admin
 */

import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/database";

export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

  return createClient<Database>(supabaseUrl, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
