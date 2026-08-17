import { describe, it, expect, vi, beforeEach } from "vitest";
import { contactSellerAction } from "@/app/dashboard/marketplace/actions";
import { getOrCreateMarketplaceConversation } from "@/lib/database/chat";
import { createClient } from "@/lib/supabase/server";

// Mock dependencies
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

vi.mock("@/lib/database/chat", () => ({
  getOrCreateMarketplaceConversation: vi.fn(),
}));

interface MockSupabase {
  auth: {
    getUser: ReturnType<typeof vi.fn>;
  };
  from: ReturnType<typeof vi.fn>;
}

describe("contactSellerAction", () => {
  let mockSupabase: MockSupabase;

  beforeEach(() => {
    vi.clearAllMocks();

    mockSupabase = {
      auth: {
        getUser: vi.fn(),
      },
      from: vi.fn(),
    };

    (createClient as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(mockSupabase);
  });

  it("should fail if user is unauthenticated", async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null }, error: new Error("Auth Error") });
    
    const result = await contactSellerAction("listing-1");
    expect(result.success).toBe(false);
    expect(result.error).toBe("UNAUTHENTICATED");
  });

  it("should fail if listing is not found", async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: "buyer-1" } }, error: null });
    
    const mockSelect = {
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: new Error("Not Found") }),
    };
    mockSupabase.from.mockReturnValue({ select: vi.fn().mockReturnValue(mockSelect) });

    const result = await contactSellerAction("listing-1");
    expect(result.success).toBe(false);
    expect(result.error).toBe("NOT_FOUND");
  });

  it("should fail if user tries to contact themselves", async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: "seller-1" } }, error: null });
    
    const mockSelect = {
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { id: "listing-1", seller_id: "seller-1", status: "active" }, error: null }),
    };
    mockSupabase.from.mockReturnValue({ select: vi.fn().mockReturnValue(mockSelect) });

    const result = await contactSellerAction("listing-1");
    expect(result.success).toBe(false);
    expect(result.error).toBe("CANNOT_CONTACT_SELF");
  });

  it("should fail if listing is sold or removed", async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: "buyer-1" } }, error: null });
    
    const mockSelect = {
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { id: "listing-1", seller_id: "seller-1", status: "sold" }, error: null }),
    };
    mockSupabase.from.mockReturnValue({ select: vi.fn().mockReturnValue(mockSelect) });

    const result = await contactSellerAction("listing-1");
    expect(result.success).toBe(false);
    expect(result.error).toBe("INVALID_STATUS");
  });

  it("should succeed and return conversationId for a valid request", async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: "buyer-1" } }, error: null });
    
    const mockSelect = {
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { id: "listing-1", seller_id: "seller-1", status: "active" }, error: null }),
    };
    mockSupabase.from.mockReturnValue({ select: vi.fn().mockReturnValue(mockSelect) });

    (getOrCreateMarketplaceConversation as unknown as ReturnType<typeof vi.fn>).mockResolvedValue("conv-123");

    const result = await contactSellerAction("listing-1");
    expect(result.success).toBe(true);
    expect(result.conversationId).toBe("conv-123");
    expect(getOrCreateMarketplaceConversation).toHaveBeenCalledWith(mockSupabase, "buyer-1", "seller-1", "listing-1");
  });
});
