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

describe("Student Privacy: formatPublicDropoffLocation", () => {
  it("conceals room number and extracts hostel name", async () => {
    const { formatPublicDropoffLocation } = await import("@/lib/database/requests");

    const r1 = formatPublicDropoffLocation("Hostel D - Room 1140A");
    expect(r1.hostel).toBe("Hostel D");
    expect(r1.isRoomHidden).toBe(true);

    const r2 = formatPublicDropoffLocation("Hostel D - Room 400D");
    expect(r2.hostel).toBe("Hostel D");
    expect(r2.isRoomHidden).toBe(true);

    const r3 = formatPublicDropoffLocation("Girls Hostel, Room 204");
    expect(r3.hostel).toBe("Girls Hostel");
    expect(r3.isRoomHidden).toBe(true);

    const r4 = formatPublicDropoffLocation("Class Room: LH 301");
    expect(r4.hostel).toBe("Academic Block");
    expect(r4.isRoomHidden).toBe(true);

    const r5 = formatPublicDropoffLocation("Hostel B");
    expect(r5.hostel).toBe("Hostel B");
    expect(r5.isRoomHidden).toBe(false);
  });
});
