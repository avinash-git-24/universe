import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ResaleListingDetail } from "../ResaleListingDetail";
import { ResaleImageGallery } from "../ResaleImageGallery";
import { ResaleDetailError } from "../ResaleDetailError";
import type { ResaleListingWithImages, ResaleListingImageRow } from "@/lib/database/resale/types";
import type { Profile } from "@/lib/database/profile";

// Mock the next/navigation and lucide-react just in case
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

const mockProfile: Profile = {
  id: "seller-123",
  full_name: "John Doe",
  role: "student",
  enrollment_number: "STU001",
  account_status: "active",
  avatar_url: null,
  department: null,
  semester: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const mockListingBase: ResaleListingWithImages = {
  id: "listing-123",
  seller_id: "seller-123",
  title: "Test Listing",
  description: "A great test item.",
  category: "electronics",
  condition: "like_new",
  price: 500,
  original_price: 1000,
  negotiable: true,
  pickup_location: "Campus Gate",
  status: "active",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  images: [
    {
      id: "img-1",
      listing_id: "listing-123",
      storage_path: "path/1.jpg",
      display_order: 0,
      created_at: new Date().toISOString(),
    },
  ],
};

const mockSignedUrls = {
  "path/1.jpg": "https://signed.url/1.jpg",
};

describe("Phase 2C: Resale Listing Detail Page", () => {
  beforeAll(() => {
    global.URL.createObjectURL = vi.fn((blob: Blob) => `blob:http://localhost/${blob.size}`);
    global.URL.revokeObjectURL = vi.fn();
    global.fetch = vi.fn().mockImplementation(async (url) => ({
      ok: true,
      blob: async () => new Blob([url], { type: 'image/jpeg' })
    }));
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  it("Valid listing loads correctly", () => {
    render(
      <ResaleListingDetail
        listing={mockListingBase}
        signedUrls={mockSignedUrls}
        sellerProfile={mockProfile}
        currentUserId="buyer-456"
      />
    );
    expect(screen.getByText("Test Listing")).toBeInTheDocument();
    expect(screen.getAllByText(/₹500/)).toHaveLength(2);
    expect(screen.getByText("A great test item.")).toBeInTheDocument();
  });

  it("Active listing displays Contact Seller", () => {
    render(
      <ResaleListingDetail
        listing={{ ...mockListingBase, status: "active" }}
        signedUrls={mockSignedUrls}
        sellerProfile={mockProfile}
        currentUserId="buyer-456"
      />
    );
    const button = screen.getByText("Contact Seller").closest("button");
    expect(button).toBeInTheDocument();
    expect(button).not.toBeDisabled();
  });

  it("Owner does not see Contact Seller, sees Owner Actions", () => {
    const { rerender } = render(
      <ResaleListingDetail
        listing={mockListingBase}
        signedUrls={mockSignedUrls}
        sellerProfile={mockProfile}
        currentUserId="seller-123" // Owner!
      />
    );
    expect(screen.queryByText("Contact Seller")).not.toBeInTheDocument();
    expect(screen.getByText("Owner Actions")).toBeInTheDocument();
    expect(screen.getByText("Mark as Reserved")).toBeInTheDocument();
    expect(screen.getByText("Mark as Sold")).toBeInTheDocument();
    expect(screen.getByText("Remove Listing")).toBeInTheDocument();
    expect(screen.queryByText("Mark as Active")).not.toBeInTheDocument();

    // Re-render as reserved to check "Mark as Active" appears
    rerender(
      <ResaleListingDetail
        listing={{ ...mockListingBase, status: "reserved" }}
        signedUrls={mockSignedUrls}
        sellerProfile={mockProfile}
        currentUserId="seller-123"
      />
    );
    expect(screen.getByText("Mark as Active")).toBeInTheDocument();
    expect(screen.getByText("Mark as Sold")).toBeInTheDocument();
    expect(screen.getByText("Remove Listing")).toBeInTheDocument();
    expect(screen.queryByText("Mark as Reserved")).not.toBeInTheDocument();
    
    // Re-render as sold to ensure actions disappear
    rerender(
      <ResaleListingDetail
        listing={{ ...mockListingBase, status: "sold" }}
        signedUrls={mockSignedUrls}
        sellerProfile={mockProfile}
        currentUserId="seller-123"
      />
    );
    expect(screen.queryByText("Owner Actions")).not.toBeInTheDocument();
  });

  it("Sold listing does not appear available", () => {
    render(
      <ResaleListingDetail
        listing={{ ...mockListingBase, status: "sold" }}
        signedUrls={mockSignedUrls}
        sellerProfile={mockProfile}
        currentUserId="buyer-456"
      />
    );
    expect(screen.queryByText("Contact Seller")).not.toBeInTheDocument();
    expect(screen.getByText(/No Longer Available/i)).toBeInTheDocument();
  });

  it("Reserved listing does not appear available", () => {
    render(
      <ResaleListingDetail
        listing={{ ...mockListingBase, status: "reserved" }}
        signedUrls={mockSignedUrls}
        sellerProfile={mockProfile}
        currentUserId="buyer-456"
      />
    );
    expect(screen.queryByText("Contact Seller")).not.toBeInTheDocument();
    expect(screen.getByText(/Currently Reserved/i)).toBeInTheDocument();
  });

  it("Missing description is handled gracefully", () => {
    render(
      <ResaleListingDetail
        listing={{ ...mockListingBase, description: null }}
        signedUrls={mockSignedUrls}
        sellerProfile={mockProfile}
        currentUserId="buyer-456"
      />
    );
    expect(screen.getByText("No description provided.")).toBeInTheDocument();
  });

  it("Error page does not expose internal details", () => {
    render(<ResaleDetailError />);
    expect(screen.getByText("Listing Not Found")).toBeInTheDocument();
    expect(screen.getByText(/The listing you're looking for doesn't exist/i)).toBeInTheDocument();
    expect(screen.queryByText(/SQL/i)).not.toBeInTheDocument();
    expect(screen.getByText("Back to Marketplace")).toBeInTheDocument();
  });

  describe("ResaleImageGallery", () => {
    it("Missing images are handled securely (fallback UI)", () => {
      render(
        <ResaleImageGallery
          title="No Images"
          images={[]}
          signedUrls={{}}
        />
      );
      expect(screen.getByText("No images available")).toBeInTheDocument();
    });

    it("Multiple images can be navigated and signed URLs are used", async () => {
      const multiImages: ResaleListingImageRow[] = [
        { id: "img-1", listing_id: "listing-123", storage_path: "path/1.jpg", display_order: 0, created_at: "" },
        { id: "img-2", listing_id: "listing-123", storage_path: "path/2.jpg", display_order: 1, created_at: "" },
      ];
      const urls = {
        "path/1.jpg": "https://signed.url/1.jpg",
        "path/2.jpg": "https://signed.url/2.jpg",
      };
      
      render(
        <ResaleImageGallery
          title="Multiple Images"
          images={multiImages}
          signedUrls={urls}
        />
      );
      
      // Wait for the async blob fetch to complete and image to render
      const img = await screen.findByAltText("Multiple Images - Image 1") as HTMLImageElement;
      expect(img.src).toMatch(/^blob:/);
      expect(global.fetch).toHaveBeenCalledWith("https://signed.url/1.jpg");

      // Click next
      const nextBtn = screen.getByLabelText("Next image");
      fireEvent.click(nextBtn);

      const img2 = await screen.findByAltText("Multiple Images - Image 2") as HTMLImageElement;
      expect(img2.src).toMatch(/^blob:/);
      expect(global.fetch).toHaveBeenCalledWith("https://signed.url/2.jpg");
    });
  });
});
