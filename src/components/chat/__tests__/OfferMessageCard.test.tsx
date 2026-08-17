import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { OfferMessageCard } from "../OfferMessageCard";
import * as offersService from "@/lib/database/resale/offers";

// Mock Supabase client
vi.mock("@/lib/supabase/client", () => ({
  createClient: vi.fn(() => ({})),
}));

// Mock the offers service
vi.mock("@/lib/database/resale/offers", () => ({
  acceptOffer: vi.fn(),
  rejectOffer: vi.fn(),
  withdrawOffer: vi.fn(),
}));

// Mock window.location.reload
const originalLocation = window.location;
beforeAll(() => {
  Object.defineProperty(window, "location", {
    configurable: true,
    value: { reload: vi.fn() },
  });
});
afterAll(() => {
  Object.defineProperty(window, "location", { configurable: true, value: originalLocation });
});

describe("OfferMessageCard", () => {
  const buyerId = "buyer-123";
  const sellerId = "seller-456";
  const conversationId = "conv-789";

  const createMsg = (senderId: string, type: string) => ({
    id: "msg-1",
    conversation_id: conversationId,
    sender_id: senderId,
    content: "Offer",
    image_url: null,
    message_type: "offer",
    metadata: { offer_id: "offer-1", type, offer_price: 500 },
    status: "sent" as const,
    created_at: new Date().toISOString(),
  });

  it("renders pending offer for buyer (withdraw button)", () => {
    const msg = createMsg(buyerId, "created");
    render(<OfferMessageCard message={msg} currentUserId={buyerId} conversationId={conversationId} />);
    
    expect(screen.getByText("You made an offer")).toBeInTheDocument();
    expect(screen.getByText("₹500")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Withdraw Offer/i })).toBeInTheDocument();
  });

  it("renders pending offer for seller (accept/reject buttons)", () => {
    const msg = createMsg(buyerId, "created");
    render(<OfferMessageCard message={msg} currentUserId={sellerId} conversationId={conversationId} />);
    
    expect(screen.getByText("Buyer made an offer")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Accept/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Reject/i })).toBeInTheDocument();
  });

  it("calls acceptOffer when seller clicks Accept", async () => {
    const msg = createMsg(buyerId, "created");
    render(<OfferMessageCard message={msg} currentUserId={sellerId} conversationId={conversationId} />);
    
    fireEvent.click(screen.getByRole("button", { name: /Accept/i }));
    
    await waitFor(() => {
      expect(offersService.acceptOffer).toHaveBeenCalledWith(
        expect.anything(),
        { id: "offer-1", offer_price: 500 },
        conversationId
      );
      expect(window.location.reload).toHaveBeenCalled();
    });
  });

  it("calls withdrawOffer when buyer clicks Withdraw", async () => {
    const msg = createMsg(buyerId, "created");
    render(<OfferMessageCard message={msg} currentUserId={buyerId} conversationId={conversationId} />);
    
    fireEvent.click(screen.getByRole("button", { name: /Withdraw Offer/i }));
    
    await waitFor(() => {
      expect(offersService.withdrawOffer).toHaveBeenCalledWith(
        expect.anything(),
        { id: "offer-1", offer_price: 500 },
        conversationId
      );
      expect(window.location.reload).toHaveBeenCalled();
    });
  });

  it("renders accepted state correctly", () => {
    const msg = createMsg(buyerId, "accepted");
    render(<OfferMessageCard message={msg} currentUserId={sellerId} conversationId={conversationId} />);
    
    expect(screen.getByText("Offer Accepted")).toBeInTheDocument();
    expect(screen.queryByRole("button")).toBeNull();
  });
});
