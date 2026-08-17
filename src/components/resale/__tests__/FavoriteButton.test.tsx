import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { FavoriteButton } from "../FavoriteButton";
import * as resaleDb from "@/lib/database/resale";

// Mock the services
vi.mock("@/lib/database/resale", async (importOriginal) => {
  const mod = await importOriginal<typeof import("@/lib/database/resale")>();
  return {
    ...mod,
    toggleFavorite: vi.fn(),
  };
});

vi.mock("@/lib/supabase/client", () => ({
  createClient: vi.fn(() => ({})),
}));

describe("FavoriteButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders correctly with initial state", () => {
    const { rerender } = render(<FavoriteButton listingId="list-1" initialIsFavorited={false} />);
    expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "false");

    rerender(<FavoriteButton listingId="list-1" initialIsFavorited={true} />);
    expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "true");
  });

  it("toggles favorite state optimistically and calls API", async () => {
    vi.mocked(resaleDb.toggleFavorite).mockResolvedValue({ isFavorited: true });
    
    render(<FavoriteButton listingId="list-1" initialIsFavorited={false} />);
    const button = screen.getByRole("button");
    
    expect(button).toHaveAttribute("aria-pressed", "false");
    
    // Click it
    fireEvent.click(button);
    
    // Should immediately update optimistically
    expect(button).toHaveAttribute("aria-pressed", "true");
    
    await waitFor(() => {
      expect(resaleDb.toggleFavorite).toHaveBeenCalledTimes(1);
    });
  });

  it("reverts state and shows alert on API error", async () => {
    vi.mocked(resaleDb.toggleFavorite).mockRejectedValue(new Error("API Error"));
    window.alert = vi.fn();
    
    render(<FavoriteButton listingId="list-1" initialIsFavorited={false} />);
    const button = screen.getByRole("button");
    
    fireEvent.click(button);
    expect(button).toHaveAttribute("aria-pressed", "true"); // optimistic
    
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith("Failed to update wishlist. Please try again.");
      expect(button).toHaveAttribute("aria-pressed", "false"); // reverted
    });
  });
});
