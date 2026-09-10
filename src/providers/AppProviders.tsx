"use client";

/**
 * UniVerse — App Providers
 *
 * Root context wrapper. All global providers go here.
 * This is a client component that wraps the entire application tree.
 */

import * as React from "react";
import { UIStateProvider } from "@/providers/UIStateProvider";
import { RealtimeProvider } from "@/providers/RealtimeProvider";

interface AppProvidersProps {
  children: React.ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <UIStateProvider>
      <RealtimeProvider>
        {children}
      </RealtimeProvider>
    </UIStateProvider>
  );
}
