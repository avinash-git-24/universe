/**
 * UniVerse — useMediaQuery
 *
 * Reactive hook for responsive breakpoint detection.
 */

"use client";

import { useEffect, useState } from "react";
import { breakpoints, type Breakpoint } from "@/styles/design-tokens";

/**
 * Returns true if the viewport matches the given media query string.
 *
 * @example
 * const isMobile = useMediaQuery("(max-width: 768px)");
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    setMatches(media.matches);

    const listener = (e: MediaQueryListEvent) => setMatches(e.matches);
    media.addEventListener("change", listener);

    return () => media.removeEventListener("change", listener);
  }, [query]);

  return matches;
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
