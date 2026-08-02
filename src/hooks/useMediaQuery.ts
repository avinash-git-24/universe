/**
 * UniVerse — useMediaQuery
 *
 * Reactive hook for responsive breakpoint detection.
 */

"use client";

import { useSyncExternalStore, useCallback } from "react";
import { breakpoints, type Breakpoint } from "@/styles/design-tokens";

/**
 * Returns true if the viewport matches the given media query string.
 *
 * @example
 * const isMobile = useMediaQuery("(max-width: 768px)");
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (callback: () => void) => {
      if (typeof window === "undefined") return () => {};
      const matchMedia = window.matchMedia(query);
      matchMedia.addEventListener("change", callback);
      return () => matchMedia.removeEventListener("change", callback);
    },
    [query]
  );

  const getSnapshot = () => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(query).matches;
  };

  const getServerSnapshot = () => false;

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/**
 * Returns true if the viewport is below the given breakpoint (mobile-first).
 *
 * @example
 * const isMobile = useBreakpoint("sm"); // true if < 640px
 */
export function useBreakpoint(bp: Breakpoint): boolean {
  return useMediaQuery(`(max-width: ${parseInt(breakpoints[bp]) - 1}px)`);
}

/**
 * Pre-built responsive state hooks.
 */
export function useIsMobile(): boolean {
  return useMediaQuery("(max-width: 767px)");
}

export function useIsTablet(): boolean {
  return useMediaQuery("(min-width: 768px) and (max-width: 1023px)");
}

export function useIsDesktop(): boolean {
  return useMediaQuery("(min-width: 1024px)");
}
