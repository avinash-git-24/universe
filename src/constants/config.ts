/**
 * UniVerse — App Configuration Constants
 *
 * Environment-aware config. Always read from here, never from process.env directly.
 */

export const APP_CONFIG = {
  // ── Brand ──
  name: "UniVerse",
  tagline: "Skip the Stairs. Get It Delivered.",
  description:
    "UniVerse connects hostel students — request snacks from the vending machine and a verified student delivers it to your room.",
  version: "1.0.0",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "https://universe.app",
  supportEmail: "support@universe.app",

  // ── Social ──
  social: {
    twitter: "https://twitter.com/universeapp",
    instagram: "https://instagram.com/universeapp",
  },

  // ── Delivery Settings ──
  delivery: {
    /** Maximum allowed request amount in INR */
    maxRequestAmount: 500,
    /** Auto-cancel request after N minutes if no deliverer picks up */
    autoExpireMinutes: 15,
    /** Default reward percentage for deliverers */
    defaultRewardPercent: 10,
    /** Minimum reward amount in INR */
    minRewardAmount: 2,
  },

  // ── Feature Flags ──
  features: {
    enablePushNotifications: true,
    enableOfflineMode: true,
    enableAnalytics: process.env.NODE_ENV === "production",
  },

  // ── API ──
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL ?? "/api",
    timeout: 10000, // 10 seconds
  },
} as const;

/**
 * Environment helpers
 */
export const IS_PRODUCTION = process.env.NODE_ENV === "production";
export const IS_DEVELOPMENT = process.env.NODE_ENV === "development";
export const IS_TEST = process.env.NODE_ENV === "test";
