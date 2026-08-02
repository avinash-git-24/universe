/**
 * UniVerse — App Route Constants
 *
 * Single source of truth for all application routes.
 * Never hardcode strings — import from here.
 */

export const ROUTES = {
  // ── Auth ──
  LOGIN: "/login",
  REGISTER: "/register",
  VERIFY_STUDENT: "/verify",
  FORGOT_PASSWORD: "/forgot-password",

  // ── Core App ──
  HOME: "/",
  DASHBOARD: "/dashboard",

  // ── Request Flow ──
  REQUESTS: "/requests",
  REQUEST_NEW: "/requests/new",
  REQUEST_DETAILS: (id: string) => `/requests/${id}`,

  // ── Deliver Flow ──
  DELIVER: "/deliver",
  DELIVER_ACTIVE: "/deliver/active",

  // ── Profile ──
  PROFILE: "/profile",
  PROFILE_EDIT: "/profile/edit",
  PROFILE_REWARDS: "/profile/rewards",

  // ── Settings ──
  SETTINGS: "/settings",
  SETTINGS_NOTIFICATIONS: "/settings/notifications",

  // ── Legal / Info ──
  TERMS: "/terms",
  PRIVACY: "/privacy",
  ABOUT: "/about",

  // ── Error / Misc ──
  NOT_FOUND: "/404",
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];
