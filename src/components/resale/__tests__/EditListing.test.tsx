import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import EditListingPage from "@/app/dashboard/marketplace/[id]/edit/page";
import { EditListingForm } from "../EditListingForm";
import * as QueriesMod from "@/lib/supabase/queries";
import * as ResaleDbMod from "@/lib/database/resale";
import { notFound, redirect } from "next/navigation";
import type { ResaleListingWithImages } from "@/lib/database/resale/types";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn(), back: vi.fn() }),
  redirect: vi.fn(() => { throw new Error("REDIRECT"); }),
  notFound: vi.fn(() => { throw new Error("NOT_FOUND"); }),
  usePathname: () => "/dashboard/marketplace/123/edit",
  useSearchParams: () => new URLSearchParams(),
}));

// Mock Supabase queries
vi.mock("@/lib/supabase/queries", () => ({
  getUser: vi.fn(),
}));

// Mock Supabase client
vi.mock("@/lib/supabase/client", () => ({
  createClient: vi.fn(() => ({})),
}));
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(() => ({})),
}));

// Mock Resale DB
vi.mock("@/lib/database/resale", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/database/resale")>();
  return {
    ...actual,
    getResaleListingById: vi.fn(),
    updateResaleListing: vi.fn(),
    deleteAllListingImages: vi.fn(),
  };
});

const createMockListing = (status: string, sellerId: string = "owner-123"): ResaleListingWithImages => ({
  id: "listing-123",
  seller_id: sellerId,
  title: `Test Title`,
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

describe("Phase 2E: Edit Listing", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Server Page Authentication & Authorization", () => {
    it("Unauthenticated access is rejected", async () => {
      vi.mocked(QueriesMod.getUser).mockResolvedValueOnce({
        data: { user: null },
        error: null,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);

      await expect(EditListingPage({ params: { id: "listing-123" } })).rejects.toThrow("REDIRECT");
      expect(redirect).toHaveBeenCalledWith("/login");
    });

    it("Missing listing returns 404/safe not-found behavior", async () => {
      vi.mocked(QueriesMod.getUser).mockResolvedValueOnce({
        data: { user: { id: "owner-123" } },
        error: null,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);
      vi.mocked(ResaleDbMod.getResaleListingById).mockResolvedValueOnce(null);

      await expect(EditListingPage({ params: { id: "missing-123" } })).rejects.toThrow("NOT_FOUND");
      expect(notFound).toHaveBeenCalled();
    });

    it("Non-owner cannot edit the listing", async () => {
      vi.mocked(QueriesMod.getUser).mockResolvedValueOnce({
        data: { user: { id: "imposter-456" } },
        error: null,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);
      vi.mocked(ResaleDbMod.getResaleListingById).mockResolvedValueOnce(createMockListing("active", "owner-123"));

      await expect(EditListingPage({ params: { id: "listing-123" } })).rejects.toThrow("REDIRECT");
      expect(redirect).toHaveBeenCalledWith("/dashboard/marketplace/my-listings");
    });
  });

  describe("EditListingForm Validations & Successful Update", () => {
    const listing = createMockListing("active");

    it("Owner can edit their own listing and see fields populated", () => {
      render(<EditListingForm listing={listing} />);
      expect(screen.getByDisplayValue("Test Title")).toBeInTheDocument();
      expect(screen.getByDisplayValue("Test Description")).toBeInTheDocument();
      expect(screen.getByDisplayValue("100")).toBeInTheDocument();
    });

    it("Title, category, condition, price validations work", async () => {
      render(<EditListingForm listing={listing} />);
      
      // Clear title and price
      fireEvent.change(screen.getByLabelText(/Title/i), { target: { value: "   " } });
      fireEvent.change(screen.getByLabelText(/Selling Price/i), { target: { value: "" } });

      fireEvent.click(screen.getByText("Save Changes"));

      await waitFor(() => {
        expect(screen.getByText("A descriptive title is required.")).toBeInTheDocument();
        expect(screen.getByText("A price is required. Use 0 for free.")).toBeInTheDocument();
      });

      // Invalid original price
      fireEvent.change(screen.getByLabelText(/Selling Price/i), { target: { value: "500" } });
      fireEvent.change(screen.getByLabelText(/Original Price/i), { target: { value: "200" } });
      fireEvent.click(screen.getByText("Save Changes"));

      await waitFor(() => {
        expect(screen.getByText("Original price should be greater than the selling price.")).toBeInTheDocument();
      });

      expect(ResaleDbMod.updateResaleListing).not.toHaveBeenCalled();
    });

    it("Successful metadata update works with valid data", async () => {
      vi.mocked(ResaleDbMod.updateResaleListing).mockResolvedValueOnce(createMockListing("active"));

      render(<EditListingForm listing={listing} />);
      
      // Update fields
      fireEvent.change(screen.getByLabelText(/Title/i), { target: { value: "New Title" } });
      fireEvent.change(screen.getByLabelText(/Description/i), { target: { value: "New Description" } });
      fireEvent.change(screen.getByLabelText(/Selling Price/i), { target: { value: "150" } });
      fireEvent.click(screen.getByLabelText(/Price is negotiable/i)); // Toggle
      fireEvent.change(screen.getByLabelText(/Pickup Location/i), { target: { value: "Main Gate" } });

      fireEvent.click(screen.getByText("Save Changes"));

      await waitFor(() => {
        expect(ResaleDbMod.updateResaleListing).toHaveBeenCalledWith(
          expect.any(Object),
          "listing-123",
          expect.objectContaining({
            title: "New Title",
            description: "New Description",
            price: 150,
            negotiable: true,
            pickup_location: "Main Gate",
            status: undefined, // Status unchanged
          })
        );
        expect(screen.getByText("Listing Updated Successfully!")).toBeInTheDocument();
      });
    });
  });

  describe("Status Security & Transitions", () => {
    it("Allows VALID state transitions", async () => {
      vi.mocked(ResaleDbMod.updateResaleListing).mockResolvedValue(createMockListing("reserved"));

      // ACTIVE -> RESERVED
      const activeListing = createMockListing("active");
      const { unmount } = render(<EditListingForm listing={activeListing} />);
      fireEvent.change(screen.getByLabelText(/Status/i), { target: { value: "reserved" } });
      fireEvent.click(screen.getByText("Save Changes"));

      await waitFor(() => {
        expect(ResaleDbMod.updateResaleListing).toHaveBeenCalledWith(
          expect.anything(),
          "listing-123",
          expect.objectContaining({ status: "reserved" })
        );
      });
      unmount();
      vi.clearAllMocks();

      // RESERVED -> ACTIVE
      const reservedListing = createMockListing("reserved");
      render(<EditListingForm listing={reservedListing} />);
      fireEvent.change(screen.getByLabelText(/Status/i), { target: { value: "active" } });
      fireEvent.click(screen.getByText("Save Changes"));

      await waitFor(() => {
        expect(ResaleDbMod.updateResaleListing).toHaveBeenCalledWith(
          expect.anything(),
          "listing-123",
          expect.objectContaining({ status: "active" })
        );
      });
    });

    // Our form UI doesn't explicitly restrict the options dynamically based on state in the DOM 
    // (it just shows the note "Sold/Removed cannot be moved back"). 
    // However, if the user forcefully submits an invalid state via API or UI, updateResaleListing throws.
    // Let's verify that if updateResaleListing throws (which it does via the state machine SQL logic in listings.ts),
    // the UI gracefully handles it.
    it("Handles INVALID state transition rejected by service gracefully", async () => {
      const soldListing = createMockListing("sold");
      vi.mocked(ResaleDbMod.updateResaleListing).mockRejectedValueOnce(
        new ResaleDbMod.ResaleServiceError("UNAUTHORIZED", "Invalid status transition")
      );

      render(<EditListingForm listing={soldListing} />);
      fireEvent.change(screen.getByLabelText(/Status/i), { target: { value: "active" } });
      fireEvent.click(screen.getByText("Save Changes"));

      await waitFor(() => {
        expect(screen.getByText(/You don't have permission to edit this listing, or invalid status transition/i)).toBeInTheDocument();
      });
    });
  });

  describe("Image Safety", () => {
    it("Editing listing metadata does NOT delete or modify images", async () => {
      const activeListing = createMockListing("active");
      vi.mocked(ResaleDbMod.updateResaleListing).mockResolvedValueOnce(createMockListing("active"));

      render(<EditListingForm listing={activeListing} />);
      
      fireEvent.change(screen.getByLabelText(/Title/i), { target: { value: "New Safe Title" } });
      fireEvent.click(screen.getByText("Save Changes"));

      await waitFor(() => {
        expect(ResaleDbMod.updateResaleListing).toHaveBeenCalled();
      });

      // Assert image deletion is NEVER called
      expect(ResaleDbMod.deleteAllListingImages).not.toHaveBeenCalled();
    });
  });
});
