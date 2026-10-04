"use client";

import { useEffect } from "react";

/**
 * DesktopViewportOnMobile
 *
 * Automatically instructs mobile browsers to render the homepage in full 1024px desktop
 * width, dynamically computing the exact initialScale to fit the phone's physical screen
 * with zero horizontal overflow and zero cropped panorama.
 *
 * Restores standard responsive viewport when navigating to dashboard/auth routes.
 */
export function DesktopViewportOnMobile() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const originalViewport = "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no";

    const applyDesktopViewport = () => {
      const meta = document.querySelector('meta[name="viewport"]');
      if (!meta) return;

      const deviceW = Math.min(window.innerWidth || 1024, window.screen?.width || 1024);

      if (deviceW < 1024) {
        const scale = Number((deviceW / 1024).toFixed(4));
        meta.setAttribute(
          "content",
          `width=1024, initial-scale=${scale}, minimum-scale=${scale}, maximum-scale=3.0, user-scalable=yes`
        );
      } else {
        meta.setAttribute("content", originalViewport);
      }
    };

    applyDesktopViewport();

    window.addEventListener("resize", applyDesktopViewport);
    window.addEventListener("orientationchange", applyDesktopViewport);

    return () => {
      window.removeEventListener("resize", applyDesktopViewport);
      window.removeEventListener("orientationchange", applyDesktopViewport);
      const meta = document.querySelector('meta[name="viewport"]');
      if (meta) {
        meta.setAttribute("content", originalViewport);
      }
    };
  }, []);

  return null;
}
