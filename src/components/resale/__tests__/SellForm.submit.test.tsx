import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { SellForm } from "../SellForm";
import * as SupabaseClientMod from "@/lib/supabase/client";
import * as ResaleDbMod from "@/lib/database/resale";
import type { ResaleListingRow, UploadedImageResult } from "@/lib/database/resale/types";

const createMockListing = (id: string = "listing-123"): ResaleListingRow => ({
  id,
  seller_id: "seller-1",
  title: "Test Title",
  description: "Test Description",
  category: "books",
  condition: "good",
  price: 100,
  original_price: null,
  negotiable: false,
  pickup_location: null,
  status: "active",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
});

const mockUploadedImage: UploadedImageResult = {
  imageRow: {
    id: "image-1",
    listing_id: "listing-123",
    storage_path: "path/to/image.jpg",
    display_order: 0,
    created_at: new Date().toISOString(),
  },
  storagePath: "path/to/image.jpg",
};

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

// Mock Supabase client
vi.mock("@/lib/supabase/client", () => ({
  createClient: vi.fn(),
}));

// Mock the resale services
vi.mock("@/lib/database/resale", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/database/resale")>();
  return {
    ...actual,
    createResaleListing: vi.fn(),
    uploadResaleListingImage: vi.fn(),
    deleteAllListingImages: vi.fn(),
    deleteResaleListing: vi.fn(),
    // Keep validation real so the form can pass it
  };
});

describe("Phase 2B: SellForm Submit Orchestration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default happy path for createClient
    vi.mocked(SupabaseClientMod.createClient).mockReturnValue({} as never);
    
    // Mock URL.createObjectURL so images can be added without error
    URL.createObjectURL = vi.fn(() => "blob:test");
    URL.revokeObjectURL = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  /** Helper to fill out the form so validation passes */
  const fillValidForm = async () => {
    fireEvent.change(screen.getByLabelText(/Title/i), { target: { value: "Test Title" } });
    fireEvent.change(screen.getByLabelText(/Selling Price/i), { target: { value: "100" } });
    
    // Using custom buttons for Category and Condition by text content
    fireEvent.click(screen.getByText("Books"));
    fireEvent.click(screen.getByText("Good"));
  };

  /** Helper to add a mocked image file */
  const addImage = () => {
    // The drop zone actually clicks a hidden input. We can just find the hidden input directly or mock the state.
    // The hidden input has type="file". We can query by type.
    const hiddenInput = document.querySelector("input[type='file']") as HTMLInputElement;
    const file = new File(["dummy"], "test.jpg", { type: "image/jpeg" });
    
    // Define size to pass validation (5MB max)
    Object.defineProperty(file, 'size', { value: 1024 * 1024 }); 
    
    fireEvent.change(hiddenInput, { target: { files: [file] } });
  };

  it("Listing creation fails → no cleanup attempted", async () => {
    const mockError = new Error("DB Error");
    vi.mocked(ResaleDbMod.createResaleListing).mockRejectedValueOnce(mockError);

    render(<SellForm />);
    await fillValidForm();
    
    // Submit
    fireEvent.click(screen.getByText("Publish Listing"));

    await waitFor(() => {
      // Must show the error message
      expect(screen.getByText(/We couldn't publish your listing. Please try again./i)).toBeInTheDocument();
    });

    // Verify cleanup was NOT called (because listing was never created)
    expect(ResaleDbMod.deleteAllListingImages).not.toHaveBeenCalled();
    expect(ResaleDbMod.deleteResaleListing).not.toHaveBeenCalled();
  });

  it("Listing creation succeeds + all images succeed → listing remains", async () => {
    vi.mocked(ResaleDbMod.createResaleListing).mockResolvedValueOnce(createMockListing("listing-123"));
    vi.mocked(ResaleDbMod.uploadResaleListingImage).mockResolvedValue(mockUploadedImage);

    render(<SellForm />);
    await fillValidForm();
    addImage(); // Add 1 image

    fireEvent.click(screen.getByText("Publish Listing"));

    await waitFor(() => {
      expect(screen.getByText(/Listing Published!/i)).toBeInTheDocument();
    });

    // Cleanup shouldn't have been called
    expect(ResaleDbMod.deleteAllListingImages).not.toHaveBeenCalled();
    expect(ResaleDbMod.deleteResaleListing).not.toHaveBeenCalled();
  });

  it("Listing creation succeeds + first image fails → listing is deleted", async () => {
    vi.mocked(ResaleDbMod.createResaleListing).mockResolvedValueOnce(createMockListing("listing-123"));
    // First image fails
    vi.mocked(ResaleDbMod.uploadResaleListingImage).mockRejectedValueOnce(new Error("Upload failed"));

    render(<SellForm />);
    await fillValidForm();
    addImage(); // Add 1 image

    fireEvent.click(screen.getByText("Publish Listing"));

    await waitFor(() => {
      expect(screen.getByText(/One or more images could not be uploaded/i)).toBeInTheDocument();
    });

    // Should have called both cleanups for the created listing
    expect(ResaleDbMod.deleteAllListingImages).toHaveBeenCalledWith(expect.anything(), "listing-123");
    expect(ResaleDbMod.deleteResaleListing).toHaveBeenCalledWith(expect.anything(), "listing-123");
  });

  it("Listing creation succeeds + second image fails → previously uploaded image is cleaned + listing deleted", async () => {
    vi.mocked(ResaleDbMod.createResaleListing).mockResolvedValueOnce(createMockListing("listing-123"));
    // First succeeds, second fails
    vi.mocked(ResaleDbMod.uploadResaleListingImage)
      .mockResolvedValueOnce(mockUploadedImage)
      .mockRejectedValueOnce(new Error("Second upload failed"));

    render(<SellForm />);
    await fillValidForm();
    addImage(); // 1st
    addImage(); // 2nd

    fireEvent.click(screen.getByText("Publish Listing"));

    await waitFor(() => {
      expect(screen.getByText(/One or more images could not be uploaded/i)).toBeInTheDocument();
    });

    // Cleanup should be triggered exactly once for the parent listing, which cleans all images
    expect(ResaleDbMod.deleteAllListingImages).toHaveBeenCalledTimes(1);
    expect(ResaleDbMod.deleteResaleListing).toHaveBeenCalledTimes(1);
  });

  it("Cleanup failure does not expose internal errors to the user", async () => {
    vi.mocked(ResaleDbMod.createResaleListing).mockResolvedValueOnce(createMockListing("listing-123"));
    vi.mocked(ResaleDbMod.uploadResaleListingImage).mockRejectedValueOnce(new Error("Upload failed"));
    
    // Simulate cleanup failure
    vi.mocked(ResaleDbMod.deleteAllListingImages).mockRejectedValueOnce(new Error("Secret internal storage error"));
    vi.mocked(ResaleDbMod.deleteResaleListing).mockRejectedValueOnce(new Error("Secret internal db error"));

    render(<SellForm />);
    await fillValidForm();
    addImage(); 

    fireEvent.click(screen.getByText("Publish Listing"));

    await waitFor(() => {
      // Should show the safe generic upload error, NOT the secret internal errors
      expect(screen.getByText(/One or more images could not be uploaded/i)).toBeInTheDocument();
      const textContent = document.body.textContent || "";
      expect(textContent).not.toContain("Secret internal storage error");
      expect(textContent).not.toContain("Secret internal db error");
    });
  });

  it("Double-click submission protection still works", async () => {
    // We delay the creation to allow a double click
    let resolveCreation: (value: { id: string }) => void = () => {};
    const creationPromise = new Promise<{ id: string }>((res) => { resolveCreation = res; });
    vi.mocked(ResaleDbMod.createResaleListing).mockReturnValue(creationPromise as never);

    render(<SellForm />);
    await fillValidForm();

    const publishBtn = screen.getByText("Publish Listing");
    
    // Click twice rapidly
    fireEvent.click(publishBtn);
    fireEvent.click(publishBtn);

    // It should have only called createResaleListing once
    expect(ResaleDbMod.createResaleListing).toHaveBeenCalledTimes(1);
    
    // Resolve it to finish the test cleanly
    resolveCreation(createMockListing("listing-123"));
  });

  it("Retry after failed publish does not create an orphan from the previous attempt", async () => {
    // Attempt 1: Listing creates but upload fails
    vi.mocked(ResaleDbMod.createResaleListing).mockResolvedValueOnce(createMockListing("listing-attempt-1"));
    vi.mocked(ResaleDbMod.uploadResaleListingImage).mockRejectedValueOnce(new Error("Upload failed"));

    render(<SellForm />);
    await fillValidForm();
    addImage(); 

    const publishBtn = screen.getByText("Publish Listing");
    fireEvent.click(publishBtn);

    // Wait for the failure state
    await waitFor(() => {
      expect(screen.getByText(/One or more images could not be uploaded/i)).toBeInTheDocument();
    });

    // Verify it cleaned up attempt 1
    expect(ResaleDbMod.deleteResaleListing).toHaveBeenCalledWith(expect.anything(), "listing-attempt-1");

    // Attempt 2: Listing creates and upload succeeds
    vi.mocked(ResaleDbMod.createResaleListing).mockResolvedValueOnce(createMockListing("listing-attempt-2"));
    vi.mocked(ResaleDbMod.uploadResaleListingImage).mockResolvedValue(mockUploadedImage);

    fireEvent.click(publishBtn); // retry

    await waitFor(() => {
      expect(screen.getByText(/Listing Published!/i)).toBeInTheDocument();
    });

    // The second listing succeeded, so it should NOT be deleted
    // Ensure deleteResaleListing was still only called once (for attempt 1)
    expect(ResaleDbMod.deleteResaleListing).toHaveBeenCalledTimes(1);
  });
});
