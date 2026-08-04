import React, { ReactElement } from "react";
import { render, RenderOptions } from "@testing-library/react";

/**
 * Reusable test renderer that wraps UI components with required context providers.
 */
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) {
  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    return <>{children}</>;
  };

  return render(ui, { wrapper: Wrapper, ...options });
}

export * from "@testing-library/react";
