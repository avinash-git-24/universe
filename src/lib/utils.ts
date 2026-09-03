/**
 * UniVerse — Utility Functions
 *
 * Production-grade helpers used across the entire application.
 */

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// ─── Tailwind Class Merger ────────────────────────────────────────────────────

/**
 * Merge Tailwind CSS class names safely.
 * Handles conditional classes and resolves conflicts automatically.
 *
 * @example
 * cn("px-4 py-2", isActive && "bg-primary", className)
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// ─── Currency Formatters ──────────────────────────────────────────────────────

/**
 * Format a number as Indian Rupee currency.
 * @example formatCurrency(49.5) → "₹49.50"
 */
export function formatCurrency(
  amount: number,
  options: { compact?: boolean } = {}
): string {
  if (options.compact && amount >= 1000) {
    return `₹${(amount / 1000).toFixed(1)}k`;
  }
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

// ─── Date & Time Formatters ───────────────────────────────────────────────────

/**
 * Format a date string to a human-readable relative time.
 * @example formatRelativeTime("2024-01-01T10:00:00Z") → "2 hours ago"
 */
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 30) return "just now";
  if (diffSeconds < 60) return `${diffSeconds}s ago`;
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: diffDays > 365 ? "numeric" : undefined,
  });
}

/**
 * Format a countdown — returns time remaining from now to deadline.
 * @example formatCountdown("2024-01-01T10:15:00Z") → "12:34"
 */
export function formatCountdown(deadlineString: string): string {
  const deadline = new Date(deadlineString);
  const now = new Date();
  const remainingMs = deadline.getTime() - now.getTime();

  if (remainingMs <= 0) return "Expired";

  const totalSeconds = Math.floor(remainingMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

/**
 * Format time as HH:MM (12h or 24h).
 */
export function formatTime(
  dateString: string,
  hour12 = true
): string {
  return new Date(dateString).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12,
  });
}

// ─── String Utilities ─────────────────────────────────────────────────────────

/**
 * Generate initials from a full name.
 * @example getInitials("Avinash Kumar") → "AK"
 */
export function getInitials(name: string, maxLength = 2): string {
  return name
    .split(" ")
    .slice(0, maxLength)
    .map((n) => n[0]?.toUpperCase() ?? "")
    .join("");
}

/**
 * Truncate a string to a maximum length with ellipsis.
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return `${str.slice(0, maxLength - 3)}...`;
}

/**
 * Capitalize the first letter of each word.
 */
export function titleCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

/**
 * Convert a camelCase or snake_case string to a readable label.
 * @example toLabel("orderStatus") → "Order Status"
 */
export function toLabel(str: string): string {
  return str
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

// ─── Array / Object Utilities ─────────────────────────────────────────────────

/**
 * Group an array of objects by a key.
 */
export function groupBy<T>(
  array: T[],
  key: keyof T
): Record<string, T[]> {
  return array.reduce(
    (acc, item) => {
      const groupKey = String(item[key]);
      if (!acc[groupKey]) acc[groupKey] = [];
      acc[groupKey].push(item);
      return acc;
    },
    {} as Record<string, T[]>
  );
}

/**
 * Remove duplicate values from an array.
 */
export function unique<T>(array: T[]): T[] {
  return [...new Set(array)];
}

// ─── Validation Utilities ─────────────────────────────────────────────────────

/**
 * Validate a student email format (e.g. john@college.edu.in).
 */
export function isStudentEmail(email: string): boolean {
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(edu|ac\.in|edu\.in)$/.test(
    email
  );
}

/**
 * Validate a room number format (e.g. A-101, 204, B3).
 */
export function isValidRoomNumber(room: string): boolean {
  return /^[A-Za-z]?-?\d{1,4}[A-Za-z]?$/.test(room.trim());
}

// ─── Number Utilities ─────────────────────────────────────────────────────────

/**
 * Clamp a value between min and max.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Round to N decimal places.
 */
export function roundTo(value: number, decimals: number): number {
  return Number(`${Math.round(Number(`${value}e${decimals}`))}e-${decimals}`);
}

// ─── Environment Utilities ────────────────────────────────────────────────────

/**
 * Check if code is running on the server (SSR).
 */
export const isServer = typeof window === "undefined";

/**
 * Check if code is running in a browser.
 */
export const isBrowser = !isServer;

// ─── Student Name Sanitizer & Formatter ───────────────────────────────────────

/**
 * Clean and format student display names.
 * Strips raw admission/roll prefixes like "3278_", converts ALL-CAPS to Title Case.
 *
 * @example
 * formatStudentName("3278_AVINASH KUMAR")
 * // returns: { fullName: "Avinash Kumar", firstName: "Avinash", initial: "A", rollPrefix: "3278" }
 */
export function formatStudentName(rawName?: string | null): {
  fullName: string;
  firstName: string;
  initial: string;
  rollPrefix: string | null;
} {
  if (!rawName || typeof rawName !== "string") {
    return { fullName: "Student", firstName: "Student", initial: "S", rollPrefix: null };
  }

  let cleaned = rawName.trim();
  let rollPrefix: string | null = null;

  // Match prefixes like 3278_, 128203_, MU123_
  const prefixMatch = cleaned.match(/^([A-Za-z0-9]+)[_\-\s]+/);
  if (prefixMatch && /^\d+$/.test(prefixMatch[1])) {
    rollPrefix = prefixMatch[1];
    cleaned = cleaned.slice(prefixMatch[0].length).trim();
  } else if (prefixMatch && prefixMatch[1].length <= 8 && /\d/.test(prefixMatch[1])) {
    rollPrefix = prefixMatch[1];
    cleaned = cleaned.slice(prefixMatch[0].length).trim();
  }

  if (!cleaned) {
    cleaned = rawName.trim();
  }

  // Convert to Title Case if all uppercase or all lowercase
  const words = cleaned.split(/\s+/).map((word) => {
    if (word.length === 0) return "";
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  });

  const fullName = words.join(" ");
  const firstName = words[0] || "Student";
  const initial = firstName.charAt(0).toUpperCase() || "S";

  return { fullName, firstName, initial, rollPrefix };
}

