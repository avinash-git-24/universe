import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { SavedListingsView } from "../SavedListingsView";
import * as resaleDb from "@/lib/database/resale";
import * as nextNav from "next/navigation";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    refresh: vi.fn(),
    replace: vi.fn(),
  })),
  useSearchParams: vi.fn(() => new URLSearchParams()),
  usePathname: vi.fn(() => "/dashboard/marketplace/saved"),
}));

// Mock services
vi.mock("@/lib/database/resale", async (importOriginal) => {
  const mod = await importOriginal<typeof import("@/lib/database/resale")>();
  return {
    ...mod,
    getSavedListings: vi.fn(),
    getSignedImageUrls: vi.fn(() => Promise.resolve([])),
  };
});

vi.mock("@/lib/supabase/client", () => ({
  createClient: vi.fn(() => ({})),
}));

describe("SavedListingsView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows empty state when no saved listings", async () => {
    vi.mocked(resaleDb.getSavedListings).mockResolvedValue([]);
    render(<SavedListingsView />);
    
    // Initial loading skeleton should be replaced by empty state
    await waitFor(() => {
      expect(screen.getByText("No saved listings")).toBeInTheDocument();
      expect(screen.getByText("Browse Marketplace")).toBeInTheDocument();
    });
  });

  it("renders saved listings", async () => {
    vi.mocked(resaleDb.getSavedListings).mockResolvedValue([
      {
        id: "l1",
        title: "Test Book",
        description: "Desc",
        price: 500,
        condition: "good",
        category: "books",
        status: "active",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        seller_id: "u1",
        images: [],
        negotiable: false,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any
    ]);
    
    render(<SavedListingsView />);
    
    await waitFor(() => {
      expect(screen.getByText("Test Book")).toBeInTheDocument();
      // Should show favorite button since we pass isFavorited=true & showFavoriteButton=true
      expect(screen.getAllByRole("button", { name: "Remove from saved" }).length).toBeGreaterThan(0);
    });
  });

  it("shows error state on failure", async () => {
    vi.mocked(resaleDb.getSavedListings).mockRejectedValue(new Error("DB Error"));
    
    render(<SavedListingsView />);
    
    await waitFor(() => {
      expect(screen.getByText("Failed to load saved listings.")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Try Again" })).toBeInTheDocument();
    });
  });
});
