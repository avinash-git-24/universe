/**
 * Validates whether a given URL path is safe for relative redirects.
 * Prevents open redirect vulnerabilities (e.g. `//evil.com` or `javascript:` links).
 */
export function isSafeRedirectUrl(url: unknown): boolean {
  if (typeof url !== "string") return false;
  const trimmed = url.trim();

  // Relative path must start with `/` and not `//` or `/\`
  if (trimmed.startsWith("/") && !trimmed.startsWith("//") && !trimmed.startsWith("/\\")) {
    return true;
  }

  return false;
}

/**
 * Sanitizes redirect URL or returns fallback route.
 */
export function sanitizeRedirectUrl(url: unknown, fallback = "/dashboard"): string {
  if (isSafeRedirectUrl(url)) {
    return (url as string).trim();
  }
  return fallback;
}
