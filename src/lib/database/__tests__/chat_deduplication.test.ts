import { describe, it, expect, vi, beforeEach } from "vitest";
import { getOrCreateConversation } from "@/lib/database/chat";
import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/types/database";

describe("Chat Conversation Deduplication (1 Chat Per Person)", () => {
  let mockSupabase: any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return null if either user ID is missing", async () => {
    mockSupabase = {
      from: vi.fn(),
      rpc: vi.fn(),
    };

    const result1 = await getOrCreateConversation(
      mockSupabase as unknown as SupabaseClient<Database>,
      "",
      "user-2"
    );
    const result2 = await getOrCreateConversation(
      mockSupabase as unknown as SupabaseClient<Database>,
      "user-1",
      ""
    );

    expect(result1).toBeNull();
    expect(result2).toBeNull();
  });

  it("should handle self-delivery test conversation gracefully", async () => {
    const mockSelectUser1 = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({
        data: [{ conversation_id: "conv-self-123" }],
        error: null,
      }),
    };

    const mockUpdate = {
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ data: null, error: null }),
    };

    mockSupabase = {
      from: vi.fn((table: string) => {
        if (table === "conversation_participants") {
          return mockSelectUser1;
        }
        if (table === "conversations") {
          return mockUpdate;
        }
        return {};
      }),
      rpc: vi.fn(),
    };

    const result = await getOrCreateConversation(
      mockSupabase as unknown as SupabaseClient<Database>,
      "user-1",
      "user-1",
      "req-1"
    );

    expect(result).toBe("conv-self-123");
    expect(mockUpdate.update).toHaveBeenCalledWith(
      expect.objectContaining({ request_id: "req-1" })
    );
  });

  it("should return the existing conversation ID if users already share a conversation", async () => {
    const mockSelectUser1 = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({
        data: [{ conversation_id: "conv-shared-123" }, { conversation_id: "conv-other-456" }],
        error: null,
      }),
    };

    const mockSelectUser2 = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      in: vi.fn().mockResolvedValue({
        data: [{ conversation_id: "conv-shared-123" }],
        error: null,
      }),
    };

    const mockUpdate = {
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ data: null, error: null }),
    };

    mockSupabase = {
      from: vi.fn((table: string) => {
        if (table === "conversation_participants") {
          if (mockSupabase.from.mock.calls.filter((c: any) => c[0] === "conversation_participants").length === 1) {
            return mockSelectUser1;
          }
          return mockSelectUser2;
        }
        if (table === "conversations") {
          return mockUpdate;
        }
        return {};
      }),
      rpc: vi.fn(),
    };

    const convId = await getOrCreateConversation(
      mockSupabase as unknown as SupabaseClient<Database>,
      "user-1",
      "user-2",
      "req-new-999"
    );

    expect(convId).toBe("conv-shared-123");
    // Ensure RPC was NOT called since conversation exists
    expect(mockSupabase.rpc).not.toHaveBeenCalled();
    // Ensure existing conversation was updated with the latest request_id
    expect(mockUpdate.update).toHaveBeenCalledWith(
      expect.objectContaining({ request_id: "req-new-999" })
    );
  });

  it("should create a new conversation via RPC when no conversation exists", async () => {
    const mockSelectUser1 = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({
        data: [],
        error: null,
      }),
    };

    mockSupabase = {
      from: vi.fn((table: string) => {
        if (table === "conversation_participants") {
          return mockSelectUser1;
        }
        return {};
      }),
      rpc: vi.fn().mockResolvedValue({
        data: "conv-new-789",
        error: null,
      }),
    };

    const convId = await getOrCreateConversation(
      mockSupabase as unknown as SupabaseClient<Database>,
      "user-1",
      "user-2",
      "req-101"
    );

    expect(convId).toBe("conv-new-789");
    expect(mockSupabase.rpc).toHaveBeenCalledWith("create_delivery_conversation", {
      p_other_user_id: "user-2",
      p_request_id: "req-101",
    });
  });

  it("should fallback to direct insert if RPC fails", async () => {
    const mockSelectUser1 = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({
        data: [],
        error: null,
      }),
    };

    const mockInsertConv = {
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { id: "conv-fallback-456" },
        error: null,
      }),
    };

    const mockInsertParticipants = {
      insert: vi.fn().mockResolvedValue({
        data: null,
        error: null,
      }),
    };

    mockSupabase = {
      from: vi.fn((table: string) => {
        if (table === "conversation_participants") {
          if (mockSupabase.from.mock.calls.filter((c: any) => c[0] === "conversation_participants").length === 1) {
            return mockSelectUser1;
          }
          return mockInsertParticipants;
        }
        if (table === "conversations") {
          return mockInsertConv;
        }
        return {};
      }),
      rpc: vi.fn().mockResolvedValue({
        data: null,
        error: new Error("RPC error"),
      }),
    };

    const convId = await getOrCreateConversation(
      mockSupabase as unknown as SupabaseClient<Database>,
      "user-1",
      "user-2",
      "req-102"
    );

    expect(convId).toBe("conv-fallback-456");
    expect(mockInsertConv.insert).toHaveBeenCalledWith({ request_id: "req-102" });
    expect(mockInsertParticipants.insert).toHaveBeenCalledWith([
      { conversation_id: "conv-fallback-456", profile_id: "user-1" },
      { conversation_id: "conv-fallback-456", profile_id: "user-2" },
    ]);
  });
});
