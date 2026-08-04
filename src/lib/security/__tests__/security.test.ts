import { describe, it, expect } from "vitest";
import {
  sanitizeString,
  parseSafeNumber,
  normalizeOptionalString,
  isSafeRedirectUrl,
  sanitizeRedirectUrl,
  safeJsonParse,
  deepFreeze,
} from "../index";

describe("Security & Hardening Utilities", () => {
  describe("Input Sanitization", () => {
    it("should trim strings and enforce max length", () => {
      expect(sanitizeString("   hello world   ")).toBe("hello world");
      expect(sanitizeString("1234567890", 5)).toBe("12345");
      expect(sanitizeString(123 as unknown as string)).toBe("");
    });

    it("should safely parse numbers and return fallback on NaN", () => {
      expect(parseSafeNumber(42)).toBe(42);
      expect(parseSafeNumber("99.5")).toBe(99.5);
      expect(parseSafeNumber("invalid", 10)).toBe(10);
      expect(parseSafeNumber(NaN, 5)).toBe(5);
    });

    it("should normalize optional strings", () => {
      expect(normalizeOptionalString("   some text   ")).toBe("some text");
      expect(normalizeOptionalString("   ")).toBeNull();
      expect(normalizeOptionalString(null)).toBeNull();
    });
  });

  describe("URL & Redirect Safety", () => {
    it("should identify safe relative paths", () => {
      expect(isSafeRedirectUrl("/dashboard")).toBe(true);
      expect(isSafeRedirectUrl("/admin/users")).toBe(true);
      expect(isSafeRedirectUrl("//evil.com")).toBe(false);
      expect(isSafeRedirectUrl("javascript:alert(1)")).toBe(false);
      expect(isSafeRedirectUrl("https://external.com")).toBe(false);
    });

    it("should sanitize redirect URLs", () => {
      expect(sanitizeRedirectUrl("/admin/requests")).toBe("/admin/requests");
      expect(sanitizeRedirectUrl("//malicious.com", "/dashboard")).toBe("/dashboard");
    });
  });

  describe("JSON & Object Utilities", () => {
    it("should safely parse JSON or return fallback", () => {
      expect(safeJsonParse('{"a":1}', {})).toEqual({ a: 1 });
      expect(safeJsonParse("invalid json", { fallback: true })).toEqual({ fallback: true });
    });

    it("should deeply freeze objects", () => {
      const obj = deepFreeze({ user: { name: "Alice" } });
      expect(Object.isFrozen(obj)).toBe(true);
      expect(Object.isFrozen(obj.user)).toBe(true);
    });
  });
});
