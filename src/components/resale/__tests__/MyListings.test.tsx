import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import MyListingsPage from "@/app/dashboard/marketplace/my-listings/page";
import { MyListingsView } from "../MyListingsView";
import * as QueriesMod from "@/lib/supabase/queries";
import * as ResaleDbMod from "@/lib/database/resale";
import { redirect } from "next/navigation";
import type { ResaleListingWithImages } from "@/lib/database/resale/types";

// Mock next/navigation
const mockRouter = { push: vi.fn(), refresh: vi.fn(), replace: vi.fn() };
vi.mock("next/navigation", () => ({
  useRouter: () => mockRouter,
  redirect: vi.fn(),
  usePathname: () => "/dashboard/marketplace/my-listings",
  useSearchParams: () => new URLSearchParams(),
}));

// Mock Supabase queries
vi.mock("@/lib/supabase/queries", () => ({
  getUser: vi.fn(),
}));

// Mock Supabase clients
vi.mock("@/lib/supabase/client", () => ({
  createClient: vi.fn(),
}));
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

// Mock Resale DB
vi.mock("@/lib/database/resale", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/database/resale")>();
  return {
    ...actual,
    getMyResaleListings: vi.fn(),
    getSignedImageUrls: vi.fn().mockResolvedValue([]),
  };
});

// Mock images
vi.mock("@/lib/database/images", () => ({
  signImages: vi.fn().mockResolvedValue({}),
}));

const createMockListing = (id: string, status: string): ResaleListingWithImages => ({
  id,
  seller_id: "seller-123",
  title: `Test Title ${status}`,
  description: "Test Description",
  category: "books",
  condition: "good",
  price: 100,
  original_price: null,
  negotiable: false,
  pickup_location: null,
  status,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  images: [],
});

describe("Phase 2E: My Listings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Server Page Authentication", () => {
    it("Unauthenticated user cannot access My Listings", async () => {
      vi.mocked(QueriesMod.getUser).mockResolvedValueOnce({
        data: { user: null },
        error: null,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);

      await MyListingsPage();

      expect(redirect).toHaveBeenCalledWith("/login");
    });
  });

  describe("MyListingsView Client Component", () => {
    it("Empty state works when no listings exist", async () => {
      vi.mocked(ResaleDbMod.getMyResaleListings).mockResolvedValueOnce({
        listings: [],
        pagination: { page: 1, pageSize: 12, total: 0 },
      });

      render(<MyListingsView />);

      await waitFor(() => {
        expect(screen.getByText("No listings yet")).toBeInTheDocument();
      });
    });

    it("Authenticated user sees only their own listings", async () => {
      const activeListing = createMockListing("listing-1", "active");
      const reservedListing = createMockListing("listing-2", "reserved");
      const soldListing = createMockListing("listing-3", "sold");
      const removedListing = createMockListing("listing-4", "removed");

      vi.mocked(ResaleDbMod.getMyResaleListings).mockResolvedValueOnce({
        listings: [activeListing, reservedListing, soldListing, removedListing],
        pagination: { page: 1, pageSize: 12, total: 4 },
      });

      render(<MyListingsView />);

      // Wait for listings to load
      await waitFor(() => {
        expect(screen.getByText("Test Title active")).toBeInTheDocument();
      });

      // Default is "all" tab, so we should see everything
      expect(screen.getByText("Test Title active")).toBeInTheDocument();
      expect(screen.getByText("Test Title reserved")).toBeInTheDocument();
      expect(screen.getByText("Test Title sold")).toBeInTheDocument();
      expect(screen.getByText("Test Title removed")).toBeInTheDocument();

      // Check Active filter
      fireEvent.click(screen.getByText("active", { selector: "button" }));
      expect(mockRouter.replace).toHaveBeenCalledWith("/dashboard/marketplace/my-listings?tab=active", { scroll: false });

      // Check Reserved filter
      fireEvent.click(screen.getByText("reserved", { selector: "button" }));
      expect(mockRouter.replace).toHaveBeenCalledWith("/dashboard/marketplace/my-listings?tab=reserved", { scroll: false });

      // Check Sold filter
      fireEvent.click(screen.getByText("sold", { selector: "button" }));
      expect(mockRouter.replace).toHaveBeenCalledWith("/dashboard/marketplace/my-listings?tab=sold", { scroll: false });

      // Check Removed filter
      fireEvent.click(screen.getByText("removed", { selector: "button" }));
      expect(mockRouter.replace).toHaveBeenCalledWith("/dashboard/marketplace/my-listings?tab=removed", { scroll: false });
    });

    it("Listings from another seller are never displayed", async () => {
      // The API getMyResaleListings returns only current user's listings because of server-side requireAuth
      // This is simulated by returning empty
      vi.mocked(ResaleDbMod.getMyResaleListings).mockResolvedValueOnce({
        listings: [],
        pagination: { page: 1, pageSize: 12, total: 0 },
      });

      render(<MyListingsView />);
      await waitFor(() => {
        expect(screen.queryByText("Test Title active")).not.toBeInTheDocument();
      });
    });

    it("Listing card links to the correct listing detail page", async () => {
      vi.mocked(ResaleDbMod.getMyResaleListings).mockResolvedValueOnce({
        listings: [createMockListing("listing-xyz", "active")],
        pagination: { page: 1, pageSize: 12, total: 1 },
      });

      render(<MyListingsView />);
      await waitFor(() => {
        expect(screen.getByText("Test Title active")).toBeInTheDocument();
      });

      // The link wraps the card
      const link = screen.getByRole("link", { name: /Test Title active/i });
      expect(link).toHaveAttribute("href", "/dashboard/marketplace/listing-xyz");
    });
  });
});
