/**
 * Sanitizes user input string by trimming whitespace and enforcing max length.
 */
export function sanitizeString(val: unknown, maxLength = 1000): string {
  if (typeof val !== "string") return "";
  const trimmed = val.trim();
  if (maxLength > 0 && trimmed.length > maxLength) {
    return trimmed.substring(0, maxLength);
  }
  return trimmed;
}

/**
 * Safely parses unknown value into a valid number or returns fallback.
 */
export function parseSafeNumber(val: unknown, fallback = 0): number {
  if (typeof val === "number" && !isNaN(val) && isFinite(val)) {
    return val;
  }
  if (typeof val === "string") {
    const parsed = parseFloat(val);
    if (!isNaN(parsed) && isFinite(parsed)) {
      return parsed;
    }
  }
  return fallback;
}

/**
 * Normalizes optional string values, returning null if empty or non-string.
 */
export function normalizeOptionalString(val: unknown): string | null {
  if (typeof val !== "string") return null;
  const trimmed = val.trim();
  return trimmed.length > 0 ? trimmed : null;
}
