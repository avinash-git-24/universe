"use client";

/**
 * UniVerse — App Providers
 *
 * Root context wrapper. All global providers go here.
 * This is a client component that wraps the entire application tree.
 */

import * as React from "react";
import { AnimatePresence } from "framer-motion";

interface AppProvidersProps {
  children: React.ReactNode;
}

/**
 * Root provider composition.
 *
 * Add providers here as the app grows:
 * - Auth context
 * - React Query / SWR
 * - Toast notifications
 * - Theme provider
 */
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      {children}
    </AnimatePresence>
  );
}
