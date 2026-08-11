import { cache } from "react";
import { createClient } from "./server";

/**
 * Cached version of supabase.auth.getUser()
 * Next.js will only execute this once per Server Component render pass,
 * eliminating duplicate network calls across layouts and pages.
 */
export const getUser = cache(async () => {
  const supabase = await createClient();
  return await supabase.auth.getUser();
});

/**
 * Cached version of fetching a profile by ID
 */
export const getProfile = cache(async (userId: string) => {
  const supabase = await createClient();
  return await supabase.from("profiles").select("*").eq("id", userId).single();
});
