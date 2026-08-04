/**
 * Validates required environment variables for UniVerse platform.
 */
export function validateEnvironmentVariables(): { valid: boolean; missing: string[] } {
  const required = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  ];

  const missing = required.filter((key) => {
    if (key === "NEXT_PUBLIC_SUPABASE_ANON_KEY") {
      return !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    }
    return !process.env[key];
  });

  return {
    valid: missing.length === 0,
    missing,
  };
}

/**
 * Safely retrieves an environment variable or returns fallback.
 */
export function getSafeEnvVar(key: string, fallback = ""): string {
  if (typeof process === "undefined" || !process.env) return fallback;
  return process.env[key] || fallback;
}
