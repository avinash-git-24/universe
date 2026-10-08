import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "../route";
import { NextRequest } from "next/server";

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn(),
}));

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

describe("Notifications API: POST /api/notifications/create (Broadcast & Delivery Alerts)", () => {
  let mockAdminClient: any;
  let mockServerClient: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockServerClient = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: "requester-123" } },
          error: null,
        }),
      },
    };
    (createClient as any).mockResolvedValue(mockServerClient);

    mockAdminClient = {
      from: vi.fn(),
    };
    (createAdminClient as any).mockReturnValue(mockAdminClient);
  });

  it("should fail with 400 when title or message is missing", async () => {
    const req = new NextRequest("http://localhost:3000/api/notifications/create", {
      method: "POST",
      body: JSON.stringify({ userId: "requester-123" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe("Missing title or message");
  });

  it("should insert notification for single targeted user", async () => {
    const mockInsert = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({
          data: { id: "notif-1", user_id: "requester-123", title: "Test" },
          error: null,
        }),
      }),
    });

    mockAdminClient.from.mockReturnValue({
      insert: mockInsert,
    });

    const req = new NextRequest("http://localhost:3000/api/notifications/create", {
      method: "POST",
      body: JSON.stringify({
        userId: "requester-123",
        title: "🚀 Request Broadcasted",
        message: "Your request is live!",
        type: "status_broadcasted",
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: "requester-123",
        title: "🚀 Request Broadcasted",
      })
    );
  });

  it("should broadcast notifications to all other campus profiles when broadcast=true", async () => {
    const insertedRows: any[] = [];

    mockAdminClient.from.mockImplementation((table: string) => {
      if (table === "notifications") {
        return {
          insert: vi.fn().mockImplementation((rows) => {
            if (Array.isArray(rows)) {
              insertedRows.push(...rows);
            } else {
              insertedRows.push(rows);
            }
            return {
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: { id: "notif-single" },
                  error: null,
                }),
              }),
              error: null,
            };
          }),
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({
                data: [], // no existing notifications yet
                error: null,
              }),
            }),
          }),
        };
      }
      if (table === "profiles") {
        return {
          select: vi.fn().mockReturnValue({
            neq: vi.fn().mockResolvedValue({
              data: [{ id: "runner-1" }, { id: "runner-2" }, { id: "student-3" }],
              error: null,
            }),
          }),
        };
      }
      return {};
    });

    const req = new NextRequest("http://localhost:3000/api/notifications/create", {
      method: "POST",
      body: JSON.stringify({
        userId: "requester-123",
        title: "🚀 Request Broadcasted",
        message: "Your request is live!",
        broadcast: true,
        broadcastTitle: "📦 New Delivery Request Nearby!",
        broadcastMessage: "A student requested KitKat. Tap to accept!",
        referenceId: "req-999",
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);

    // Should include requester row + 3 broadcast rows
    const broadcastedToRunners = insertedRows.filter(
      (r) => r.type === "new_request_available"
    );
    expect(broadcastedToRunners).toHaveLength(3);
    expect(broadcastedToRunners.map((r) => r.user_id)).toEqual([
      "runner-1",
      "runner-2",
      "student-3",
    ]);
  });
});
