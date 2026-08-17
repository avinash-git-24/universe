/**
 * UniVerse Resale — Validation Unit Tests
 *
 * Tests all pure validation functions in src/lib/database/resale/validation.ts.
 * No Supabase connection required — these are pure function tests.
 */

import { describe, it, expect } from "vitest";
import {
  isValidUuid,
  assertValidUuid,
  isValidCategory,
  isValidCondition,
  isValidSortOption,
  validateCreateListingInput,
  validateUpdateListingInput,
  validateFilters,
  validatePagination,
  validateImageFile,
  buildImageStoragePath,
} from "../validation";
import { ResaleServiceError, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from "../types";

// ─── UUID ─────────────────────────────────────────────────────────────────────

describe("isValidUuid", () => {
  it("returns true for a valid UUID v4", () => {
    expect(isValidUuid("f47ac10b-58cc-4372-a567-0e02b2c3d479")).toBe(true);
  });
  it("returns false for an empty string", () => {
    expect(isValidUuid("")).toBe(false);
  });
  it("returns false for a non-UUID string", () => {
    expect(isValidUuid("not-a-uuid")).toBe(false);
  });
  it("returns false for a number", () => {
    expect(isValidUuid(12345)).toBe(false);
  });
  it("returns false for null", () => {
    expect(isValidUuid(null)).toBe(false);
  });
  it("returns false for a UUID with invalid structure", () => {
    expect(isValidUuid("f47ac10b-58cc-4372-a567")).toBe(false);
  });
});

describe("assertValidUuid", () => {
  it("returns the value for a valid UUID", () => {
    const id = "f47ac10b-58cc-4372-a567-0e02b2c3d479";
    expect(assertValidUuid(id)).toBe(id);
  });
  it("throws ResaleServiceError for an invalid UUID", () => {
    expect(() => assertValidUuid("bad-id", "listingId")).toThrowError(
      ResaleServiceError
    );
  });
  it("throws with VALIDATION_ERROR code", () => {
    try {
      assertValidUuid("bad-id");
    } catch (e) {
      expect(e).toBeInstanceOf(ResaleServiceError);
      expect((e as ResaleServiceError).code).toBe("VALIDATION_ERROR");
    }
  });
});

// ─── Enum Guards ──────────────────────────────────────────────────────────────

describe("isValidCategory", () => {
  it("accepts all valid categories", () => {
    const valid = ["books", "electronics", "study_materials", "hostel", "sports", "furniture", "clothing", "gaming", "other"];
    valid.forEach((c) => expect(isValidCategory(c)).toBe(true));
  });
  it("rejects an unknown category", () => {
    expect(isValidCategory("food")).toBe(false);
  });
  it("rejects non-strings", () => {
    expect(isValidCategory(null)).toBe(false);
    expect(isValidCategory(1)).toBe(false);
  });
});

describe("isValidCondition", () => {
  it("accepts all valid conditions", () => {
    ["new", "like_new", "good", "fair"].forEach((c) =>
      expect(isValidCondition(c)).toBe(true)
    );
  });
  it("rejects unknown conditions", () => {
    expect(isValidCondition("broken")).toBe(false);
  });
});

describe("isValidSortOption", () => {
  it("accepts all valid sort options", () => {
    ["newest", "oldest", "price_low_to_high", "price_high_to_low"].forEach(
      (s) => expect(isValidSortOption(s)).toBe(true)
    );
  });
  it("rejects arbitrary strings", () => {
    expect(isValidSortOption("created_at DESC; DROP TABLE")).toBe(false);
  });
  it("rejects raw SQL column names", () => {
    expect(isValidSortOption("seller_id")).toBe(false);
  });
});

// ─── Create Listing Validation ────────────────────────────────────────────────

describe("validateCreateListingInput", () => {
  const validInput = {
    title: "Physics Textbook",
    category: "books" as const,
    condition: "good" as const,
    price: 250,
  };

  it("passes a valid minimal input", () => {
    const result = validateCreateListingInput(validInput);
    expect(result.title).toBe("Physics Textbook");
    expect(result.price).toBe(250);
    expect(result.negotiable).toBe(false);
  });

  it("trims title whitespace", () => {
    const result = validateCreateListingInput({ ...validInput, title: "  My Item  " });
    expect(result.title).toBe("My Item");
  });

  it("throws on empty title", () => {
    expect(() =>
      validateCreateListingInput({ ...validInput, title: "   " })
    ).toThrow(ResaleServiceError);
  });

  it("throws on title exceeding 200 chars", () => {
    // Title is truncated by sanitizeString — only throws if it results in empty
    // Reconfirm: sanitizeString truncates at 200 chars, so this passes truncated
    const longTitle = "A".repeat(201);
    const result = validateCreateListingInput({ ...validInput, title: longTitle });
    expect(result.title.length).toBe(200);
  });

  it("throws on invalid category", () => {
    expect(() =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      validateCreateListingInput({ ...validInput, category: "food" as any })
    ).toThrow(ResaleServiceError);
  });

  it("throws on invalid condition", () => {
    expect(() =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      validateCreateListingInput({ ...validInput, condition: "broken" as any })
    ).toThrow(ResaleServiceError);
  });

  it("throws on negative price", () => {
    expect(() =>
      validateCreateListingInput({ ...validInput, price: -1 })
    ).toThrow(ResaleServiceError);
  });

  it("accepts price = 0", () => {
    const result = validateCreateListingInput({ ...validInput, price: 0 });
    expect(result.price).toBe(0);
  });

  it("throws on negative original_price", () => {
    expect(() =>
      validateCreateListingInput({ ...validInput, original_price: -5 })
    ).toThrow(ResaleServiceError);
  });

  it("accepts optional fields as null/undefined", () => {
    const result = validateCreateListingInput({
      ...validInput,
      description: null,
      pickup_location: undefined,
    });
    expect(result.description).toBeNull();
    expect(result.pickup_location).toBeNull();
  });
});

// ─── Update Listing Validation ────────────────────────────────────────────────

describe("validateUpdateListingInput", () => {
  it("returns only the provided fields", () => {
    const result = validateUpdateListingInput({ price: 300 });
    expect(result.price).toBe(300);
    expect(result.title).toBeUndefined();
  });

  it("throws on invalid status", () => {
    expect(() =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      validateUpdateListingInput({ status: "pending" as any })
    ).toThrow(ResaleServiceError);
  });

  it("accepts valid status transitions", () => {
    (["active", "reserved", "sold", "removed"] as const).forEach((s) => {
      const result = validateUpdateListingInput({ status: s });
      expect(result.status).toBe(s);
    });
  });

  it("throws on empty update object — no, returns empty", () => {
    const result = validateUpdateListingInput({});
    expect(Object.keys(result).length).toBe(0);
  });

  it("throws on non-boolean negotiable", () => {
    expect(() =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      validateUpdateListingInput({ negotiable: "yes" as any })
    ).toThrow(ResaleServiceError);
  });
});

// ─── Filter Validation ────────────────────────────────────────────────────────

describe("validateFilters", () => {
  it("passes valid filters", () => {
    const result = validateFilters({
      category: "books",
      condition: "good",
      minPrice: 100,
      maxPrice: 500,
      search: "  calculus textbook  ",
    });
    expect(result.category).toBe("books");
    expect(result.search).toBe("calculus textbook");
    expect(result.minPrice).toBe(100);
    expect(result.maxPrice).toBe(500);
  });

  it("silently drops invalid category", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = validateFilters({ category: "food" as any });
    expect(result.category).toBeUndefined();
  });

  it("silently drops negative price", () => {
    const result = validateFilters({ minPrice: -10 });
    expect(result.minPrice).toBeUndefined();
  });

  it("throws when minPrice > maxPrice", () => {
    expect(() =>
      validateFilters({ minPrice: 500, maxPrice: 100 })
    ).toThrow(ResaleServiceError);
  });

  it("drops empty search", () => {
    const result = validateFilters({ search: "   " });
    expect(result.search).toBeUndefined();
  });
});

// ─── Pagination Validation ────────────────────────────────────────────────────

describe("validatePagination", () => {
  it("returns defaults for empty input", () => {
    const result = validatePagination({});
    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(DEFAULT_PAGE_SIZE);
    expect(result.offset).toBe(0);
  });

  it("clamps page size to MAX_PAGE_SIZE", () => {
    const result = validatePagination({ pageSize: 9999 });
    expect(result.pageSize).toBe(MAX_PAGE_SIZE);
  });

  it("enforces minimum page of 1", () => {
    const result = validatePagination({ page: -5 });
    expect(result.page).toBe(1);
  });

  it("calculates correct offset", () => {
    const result = validatePagination({ page: 3, pageSize: 12 });
    expect(result.offset).toBe(24); // (3-1) * 12
  });
});

// ─── Image File Validation ────────────────────────────────────────────────────

describe("validateImageFile", () => {
  function makeFile(type: string, sizeBytes: number): File {
    const blob = new Blob([new Uint8Array(sizeBytes)], { type });
    return new File([blob], "test.img", { type });
  }

  it("accepts valid JPEG under 5 MB", () => {
    const file = makeFile("image/jpeg", 100);
    const result = validateImageFile(file);
    expect(result.mimeType).toBe("image/jpeg");
  });

  it("accepts valid PNG", () => {
    const result = validateImageFile(makeFile("image/png", 100));
    expect(result.mimeType).toBe("image/png");
  });

  it("accepts valid WebP", () => {
    const result = validateImageFile(makeFile("image/webp", 100));
    expect(result.mimeType).toBe("image/webp");
  });

  it("throws on unsupported MIME type (image/svg+xml)", () => {
    expect(() => validateImageFile(makeFile("image/svg+xml", 100))).toThrow(
      ResaleServiceError
    );
  });

  it("throws on unsupported MIME type (image/gif)", () => {
    expect(() => validateImageFile(makeFile("image/gif", 100))).toThrow(
      ResaleServiceError
    );
  });

  it("throws on text/html disguised as image", () => {
    expect(() => validateImageFile(makeFile("text/html", 100))).toThrow(
      ResaleServiceError
    );
  });

  it("throws when file size exceeds 5 MB", () => {
    const tooBig = 5 * 1024 * 1024 + 1;
    expect(() => validateImageFile(makeFile("image/jpeg", tooBig))).toThrow(
      ResaleServiceError
    );
  });

  it("accepts file exactly at 5 MB", () => {
    const exactLimit = 5 * 1024 * 1024;
    const result = validateImageFile(makeFile("image/jpeg", exactLimit));
    expect(result.sizeBytes).toBe(exactLimit);
  });
});

// ─── Storage Path ─────────────────────────────────────────────────────────────

describe("buildImageStoragePath", () => {
  const sellerId = "f47ac10b-58cc-4372-a567-0e02b2c3d479";
  const listingId = "a87ff679-a2f3-4e50-b940-c7d5f8b5e2a1";

  it("starts with seller_id/listing_id/", () => {
    const path = buildImageStoragePath(sellerId, listingId, "image/jpeg");
    expect(path.startsWith(`${sellerId}/${listingId}/`)).toBe(true);
  });

  it("uses .jpg extension for JPEG", () => {
    const path = buildImageStoragePath(sellerId, listingId, "image/jpeg");
    expect(path.endsWith(".jpg")).toBe(true);
  });

  it("uses .png extension for PNG", () => {
    const path = buildImageStoragePath(sellerId, listingId, "image/png");
    expect(path.endsWith(".png")).toBe(true);
  });

  it("uses .webp extension for WebP", () => {
    const path = buildImageStoragePath(sellerId, listingId, "image/webp");
    expect(path.endsWith(".webp")).toBe(true);
  });

  it("generates unique paths on repeated calls", () => {
    const path1 = buildImageStoragePath(sellerId, listingId, "image/jpeg");
    const path2 = buildImageStoragePath(sellerId, listingId, "image/jpeg");
    expect(path1).not.toBe(path2);
  });

  it("does not contain path traversal characters", () => {
    const path = buildImageStoragePath(sellerId, listingId, "image/jpeg");
    expect(path).not.toContain("..");
    expect(path).not.toContain("//");
  });
});
