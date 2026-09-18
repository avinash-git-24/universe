import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  purgeExpiredPendingRequests,
  getPendingRequestsWithItems,
  acceptRequest,
} from "@/lib/database/requests";
import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/types/database";

describe("Expired Requests & Anti-Self Delivery Guard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("purgeExpiredPendingRequests calls RPC when available and returns count", async () => {
    const mockSupabase = {
      rpc: vi.fn().mockResolvedValue({ data: 3, error: null }),
      from: vi.fn(),
    };

    const count = await purgeExpiredPendingRequests(
      mockSupabase as unknown as SupabaseClient<Database>
    );

    expect(mockSupabase.rpc).toHaveBeenCalledWith("cleanup_expired_delivery_requests");
    expect(count).toBe(3);
  });

  it("purgeExpiredPendingRequests falls back to direct delete if RPC fails", async () => {
    const mockDelete = {
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      lt: vi.fn().mockReturnThis(),
      select: vi.fn().mockResolvedValue({
        data: [{ id: "expired-req-1" }, { id: "expired-req-2" }],
        error: null,
      }),
    };

    const mockSupabase = {
      rpc: vi.fn().mockResolvedValue({ data: null, error: { message: "function not found" } }),
      from: vi.fn().mockReturnValue(mockDelete),
    };

    const count = await purgeExpiredPendingRequests(
      mockSupabase as unknown as SupabaseClient<Database>
    );

    expect(mockSupabase.from).toHaveBeenCalledWith("delivery_requests");
    expect(mockDelete.eq).toHaveBeenCalledWith("status", "pending");
    expect(count).toBe(2);
  });

  it("getPendingRequestsWithItems applies 6-hour cutoff and excludes current user", async () => {
    const mockChain: any = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      neq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({
        data: [
          {
            id: "req-1",
            requester_id: "other-user",
            status: "pending",
            created_at: new Date().toISOString(),
            items: [],
          },
        ],
        error: null,
      }),
    };

    const mockSupabase = {
      rpc: vi.fn().mockResolvedValue({ data: 0, error: null }),
      from: vi.fn().mockReturnValue(mockChain),
    };

    const results = await getPendingRequestsWithItems(
      mockSupabase as unknown as SupabaseClient<Database>,
      "my-user-id"
    );

    expect(mockChain.eq).toHaveBeenCalledWith("status", "pending");
    expect(mockChain.gte).toHaveBeenCalledWith("created_at", expect.any(String));
    expect(mockChain.neq).toHaveBeenCalledWith("requester_id", "my-user-id");
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe("req-1");
  });

  it("acceptRequest rejects if request was created by runner themselves (self-delivery)", async () => {
    const mockSupabase = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            requester_id: "runner-123",
            status: "pending",
            created_at: new Date().toISOString(),
          },
          error: null,
        }),
      }),
    };

    const success = await acceptRequest(
      mockSupabase as unknown as SupabaseClient<Database>,
      "req-abc",
      "runner-123"
    );

    expect(success).toBe(false);
  });

  it("acceptRequest rejects if request is older than 6 hours", async () => {
    const sevenHoursAgo = new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString();
    const mockSupabase = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            requester_id: "student-456",
            status: "pending",
            created_at: sevenHoursAgo,
          },
          error: null,
        }),
      }),
    };

    const success = await acceptRequest(
      mockSupabase as unknown as SupabaseClient<Database>,
      "req-abc",
      "runner-123"
    );

    expect(success).toBe(false);
  });
});
