import { describe, it, expect, vi, beforeEach } from "vitest";
import { deleteMessage } from "@/lib/database/chat";
import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/types/database";

describe("Chat Message Deletion ('Delete for Everyone')", () => {
  let mockSupabase: any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should successfully delete message via RPC Layer 1", async () => {
    mockSupabase = {
      rpc: vi.fn().mockResolvedValue({
        data: true,
        error: null,
      }),
      from: vi.fn(),
    };

    const result = await deleteMessage(
      mockSupabase as unknown as SupabaseClient<Database>,
      "msg-123",
      "user-sender-1"
    );

    expect(result).toBe(true);
    expect(mockSupabase.rpc).toHaveBeenCalledWith("delete_message_for_everyone", {
      p_message_id: "msg-123",
    });
  });

  it("should fallback to direct delete if RPC fails and API is unavailable", async () => {
    const mockDelete = {
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
    };
    // Second eq call resolves
    mockDelete.eq.mockReturnValueOnce(mockDelete).mockResolvedValueOnce({
      error: null,
    });

    mockSupabase = {
      rpc: vi.fn().mockRejectedValue(new Error("RPC not found")),
      from: vi.fn((table: string) => {
        if (table === "messages") {
          return mockDelete;
        }
        return {};
      }),
    };

    const result = await deleteMessage(
      mockSupabase as unknown as SupabaseClient<Database>,
      "msg-456",
      "user-sender-1"
    );

    expect(result).toBe(true);
    expect(mockSupabase.from).toHaveBeenCalledWith("messages");
  });

  it("should return false if all deletion layers fail", async () => {
    const mockDelete = {
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
    };
    mockDelete.eq.mockReturnValueOnce(mockDelete).mockResolvedValueOnce({
      error: { message: "Row level security violation" },
    });

    mockSupabase = {
      rpc: vi.fn().mockResolvedValue({
        data: null,
        error: { message: "Function error" },
      }),
      from: vi.fn(() => mockDelete),
    };

    const result = await deleteMessage(
      mockSupabase as unknown as SupabaseClient<Database>,
      "msg-789",
      "unauthorized-user"
    );

    expect(result).toBe(false);
  });
});
