import { describe, it, expect, vi } from "vitest";
import { retryAsync, safeAsync } from "../async";

describe("Async Utilities", () => {
  describe("retryAsync", () => {
    it("should return result if operation succeeds on first attempt", async () => {
      const fn = vi.fn().mockResolvedValue("success");
      const result = await retryAsync(fn, { retries: 3, delayMs: 10 });
      expect(result).toBe("success");
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it("should retry up to specified limit and succeed if subsequent attempt passes", async () => {
      const fn = vi
        .fn()
        .mockRejectedValueOnce(new Error("Fail 1"))
        .mockResolvedValueOnce("recovered");

      const result = await retryAsync(fn, { retries: 3, delayMs: 10 });
      expect(result).toBe("recovered");
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it("should throw error if all retry attempts fail", async () => {
      const fn = vi.fn().mockRejectedValue(new Error("Persistent error"));
      await expect(retryAsync(fn, { retries: 2, delayMs: 5 })).rejects.toThrow("Persistent error");
      expect(fn).toHaveBeenCalledTimes(2);
    });
  });

  describe("safeAsync", () => {
    it("should return data and null error on success", async () => {
      const [data, error] = await safeAsync(Promise.resolve("data"));
      expect(data).toBe("data");
      expect(error).toBeNull();
    });

    it("should return null data and error instance on rejection", async () => {
      const [data, error] = await safeAsync(Promise.reject(new Error("Failed")));
      expect(data).toBeNull();
      expect(error).toBeInstanceOf(Error);
      expect(error?.message).toBe("Failed");
    });
  });
});
