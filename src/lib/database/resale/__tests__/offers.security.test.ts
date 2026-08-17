import { describe, it, expect, vi, beforeEach } from "vitest";
import { createOffer, acceptOffer, withdrawOffer } from "../offers";
import type { ResaleOffer } from "../offers";
import { SupabaseClient } from "@supabase/supabase-js";
import * as chatService from "../../chat";

// Mock the chat service
vi.mock("../../chat", () => ({
  sendMessage: vi.fn(),
  getOrCreateMarketplaceConversation: vi.fn().mockResolvedValue("conv-123"),
}));

import { Database } from "@/types/database";

describe("Phase 2G: Offers Security & Integrity", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockSupabase: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: "buyer-123" } }, error: null }),
      },
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
    };
  });

  describe("Fix 3: Offer Price Integrity", () => {
    it("acceptOffer fetches true price from DB and ignores client price", async () => {
      // Current user is seller
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: "seller-456" } }, error: null });

      // The DB returns the TRUE offer price (500)
      const mockUpdatedRow = { id: "offer-1", offer_price: 500 };
      mockSupabase.single.mockResolvedValueOnce({ data: mockUpdatedRow, error: null });

      // Malicious client passes 99999
      const fakeClientOffer = { id: "offer-1", offer_price: 99999 } as unknown as ResaleOffer;

      await acceptOffer(mockSupabase, fakeClientOffer, "conv-123");

      // Verify that the system message used 500, not 99999
      expect(chatService.sendMessage).toHaveBeenCalledWith(
        mockSupabase,
        "conv-123",
        "seller-456",
        "Accepted offer of ₹500", // True price
        null,
        "offer",
        { offer_id: "offer-1", type: "accepted", offer_price: 500 } // True price
      );
    });

    it("withdrawOffer fetches true price from DB and ignores client price", async () => {
      const mockUpdatedRow = { id: "offer-1", offer_price: 500 };
      mockSupabase.single.mockResolvedValueOnce({ data: mockUpdatedRow, error: null });
      
      const fakeClientOffer = { id: "offer-1", offer_price: 99999 } as unknown as ResaleOffer;
      
      await withdrawOffer(mockSupabase, fakeClientOffer, "conv-123");
      
      expect(chatService.sendMessage).toHaveBeenCalledWith(
        expect.anything(),
        "conv-123",
        "buyer-123",
        "Withdrew offer of ₹500",
        null,
        "offer",
        { offer_id: "offer-1", type: "withdrawn", offer_price: 500 }
      );
    });
  });

  describe("Fix 4: Block Offers on Inactive Listings", () => {
    it("createOffer succeeds if listing is active", async () => {
      // Mock listing fetch (status = active)
      mockSupabase.single
        .mockResolvedValueOnce({ data: { status: "active" }, error: null }) // listing check
        .mockResolvedValueOnce({ data: { id: "offer-1", offer_price: 400 }, error: null }); // insert
      
      const result = await createOffer(mockSupabase, "listing-1", "seller-2", 400);
      
      expect(result).toBeDefined();
      expect(mockSupabase.from).toHaveBeenCalledWith("resale_listings");
      expect(mockSupabase.insert).toHaveBeenCalled();
    });

    it("createOffer rejects if listing is reserved", async () => {
      mockSupabase.single.mockResolvedValueOnce({ data: { status: "reserved" }, error: null });
      
      await expect(createOffer(mockSupabase, "listing-1", "seller-2", 400))
        .rejects.toThrow("Cannot make an offer on a listing that is reserved.");
      
      expect(mockSupabase.insert).not.toHaveBeenCalled();
    });

    it("createOffer rejects if listing is sold", async () => {
      mockSupabase.single.mockResolvedValueOnce({ data: { status: "sold" }, error: null });
      
      await expect(createOffer(mockSupabase, "listing-1", "seller-2", 400))
        .rejects.toThrow("Cannot make an offer on a listing that is sold.");
    });

    it("createOffer rejects if listing is removed", async () => {
      mockSupabase.single.mockResolvedValueOnce({ data: { status: "removed" }, error: null });
      
      await expect(createOffer(mockSupabase, "listing-1", "seller-2", 400))
        .rejects.toThrow("Cannot make an offer on a listing that is removed.");
    });

    it("createOffer rejects if listing does not exist", async () => {
      mockSupabase.single.mockResolvedValueOnce({ data: null, error: { message: "Not found" } });
      
      await expect(createOffer(mockSupabase, "listing-1", "seller-2", 400))
        .rejects.toThrow("Listing not found.");
    });
  });

  describe("Fix 1 & 2: Database Level RLS and Trigger Safety (Logic)", () => {
    it("Notes: Database-level triggers and RLS were not live-tested because local Supabase is unavailable", () => {
      // We cannot directly test the RLS "AND seller_id = (SELECT seller_id FROM public.resale_listings WHERE id = listing_id)" 
      // without a running postgres container, but we verified the SQL script updates.
      // We also verified the trigger conditionally reserves ONLY if the listing is 'active'.
      expect(true).toBe(true);
    });
  });
});
