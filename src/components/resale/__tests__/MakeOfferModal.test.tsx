import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MakeOfferModal } from "../MakeOfferModal";
import * as offersService from "@/lib/database/resale/offers";
import type { ResaleOffer } from "@/lib/database/resale/offers";

// Mock Supabase client
vi.mock("@/lib/supabase/client", () => ({
  createClient: vi.fn(() => ({})),
}));

// Mock the offers service
vi.mock("@/lib/database/resale/offers", () => ({
  createOffer: vi.fn(),
}));

describe("MakeOfferModal", () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    listingId: "listing-123",
    sellerId: "seller-456",
    listingTitle: "Test Listing",
    originalAskingPrice: 500,
    onOfferSuccess: vi.fn(),
  };

  it("should not render when isOpen is false", () => {
    const { container } = render(<MakeOfferModal {...defaultProps} isOpen={false} />);
    expect(container.firstChild).toBeNull();
  });

  it("should render correctly when isOpen is true", () => {
    render(<MakeOfferModal {...defaultProps} />);
    expect(screen.getByText("Make an Offer")).toBeInTheDocument();
    expect(screen.getByText("Test Listing")).toBeInTheDocument();
    
    const input = screen.getByDisplayValue("500") as HTMLInputElement;
    expect(input).toBeInTheDocument();
  });

  it("should call createOffer on valid submission", async () => {
    vi.mocked(offersService.createOffer).mockResolvedValueOnce({ id: "offer-1" } as unknown as ResaleOffer);
    
    render(<MakeOfferModal {...defaultProps} />);
    
    const input = screen.getByDisplayValue("500") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "450" } });
    
    const submitBtn = screen.getByRole("button", { name: "Send Offer" });
    fireEvent.submit(submitBtn.closest("form")!);
    
    await waitFor(() => {
      expect(offersService.createOffer).toHaveBeenCalledWith(
        expect.anything(),
        "listing-123",
        "seller-456",
        450
      );
      expect(defaultProps.onOfferSuccess).toHaveBeenCalled();
      expect(defaultProps.onClose).toHaveBeenCalled();
    });
  });

  it("should display error message if createOffer fails", async () => {
    vi.mocked(offersService.createOffer).mockRejectedValueOnce(new Error("Failed to submit"));
    
    render(<MakeOfferModal {...defaultProps} />);
    
    const submitBtn = screen.getByRole("button", { name: "Send Offer" });
    fireEvent.submit(submitBtn.closest("form")!);
    
    await waitFor(() => {
      expect(screen.getByText("Failed to submit")).toBeInTheDocument();
    });
  });
});
