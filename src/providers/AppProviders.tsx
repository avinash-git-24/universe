"use client";

/**
 * UniVerse — App Providers
 *
 * Root context wrapper. All global providers go here.
 * This is a client component that wraps the entire application tree.
 */

import * as React from "react";
import { AnimatePresence } from "framer-motion";
import { UIStateProvider } from "@/providers/UIStateProvider";
import { RealtimeProvider } from "@/providers/RealtimeProvider";

interface AppProvidersProps {
  children: React.ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <UIStateProvider>
      <RealtimeProvider>
        <AnimatePresence mode="wait" initial={false}>
          {children}
        </AnimatePresence>
      </RealtimeProvider>
    </UIStateProvider>
  );
}
