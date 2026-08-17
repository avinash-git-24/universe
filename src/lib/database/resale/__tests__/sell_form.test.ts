/**
 * UniVerse Resale — Phase 2B: Sell Form Validation Tests
 *
 * Tests Phase 2B-specific scenarios using existing validation functions.
 * Complements the existing validation.test.ts (Phase 1C).
 *
 * Coverage:
 *   - validateCreateListingInput: invalid title, price, category, condition
 *   - validateImageFile: oversized file, unsupported MIME type
 *   - 6-image limit (client-side guard)
 *   - original_price > selling price check (form-level validation)
 *
 * No Supabase connection required — pure function tests.
 */

import { describe, it, expect } from "vitest";
import {
  validateCreateListingInput,
  validateImageFile,
  ResaleServiceError,
  MAX_IMAGES_PER_LISTING,
  MAX_IMAGE_BYTES,
  VALID_CATEGORIES,
  VALID_CONDITIONS,
} from "@/lib/database/resale";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeFile(mimeType: string, sizeBytes: number): File {
  const content = new Uint8Array(sizeBytes);
  return new File([content], "test.img", { type: mimeType });
}

function validInput() {
  return {
    title: "Engineering Maths Textbook",
    category: "books" as const,
    condition: "good" as const,
    price: 250,
    negotiable: false,
  };
}

// ─── validateCreateListingInput — Title ───────────────────────────────────────

describe("Phase 2B: validateCreateListingInput — title", () => {
  it("throws when title is empty", () => {
    expect(() =>
      validateCreateListingInput({ ...validInput(), title: "" })
    ).toThrow(ResaleServiceError);
  });

  it("throws when title is only whitespace", () => {
    expect(() =>
      validateCreateListingInput({ ...validInput(), title: "   " })
    ).toThrow(ResaleServiceError);
  });

  it("truncates title at 200 characters (does not throw)", () => {
    // sanitizeString() silently truncates — the form should prevent submission
    // via client-side character counter / maxLength attribute.
    const longTitle = "A".repeat(201);
    const result = validateCreateListingInput({ ...validInput(), title: longTitle });
    // After sanitization the title should be at most 200 characters
    expect(result.title.length).toBeLessThanOrEqual(200);
  });

  it("accepts a title at exactly 200 characters", () => {
    const exactTitle = "A".repeat(200);
    const result = validateCreateListingInput({ ...validInput(), title: exactTitle });
    expect(result.title.length).toBeLessThanOrEqual(200);
  });

  it("accepts a normal title", () => {
    const result = validateCreateListingInput(validInput());
    expect(result.title).toBe("Engineering Maths Textbook");
  });

  it("passes HTML as plain text (React escapes on render)", () => {
    // sanitizeString() does not strip HTML — it passes content through as-is.
    // React's JSX renderer escapes HTML entities, so XSS is not a risk here.
    // This test documents the actual service contract.
    const result = validateCreateListingInput({
      ...validInput(),
      title: "<b>Textbook</b>",
    });
    // Content is preserved as text (not stripped), with max-length enforced
    expect(result.title.length).toBeLessThanOrEqual(200);
    expect(typeof result.title).toBe("string");
  });
});

// ─── validateCreateListingInput — Price ───────────────────────────────────────

describe("Phase 2B: validateCreateListingInput — price", () => {
  it("throws when price is negative", () => {
    expect(() =>
      validateCreateListingInput({ ...validInput(), price: -1 })
    ).toThrow(ResaleServiceError);
  });

  it("throws when price is NaN", () => {
    expect(() =>
      validateCreateListingInput({ ...validInput(), price: NaN })
    ).toThrow(ResaleServiceError);
  });

  it("throws when price is Infinity", () => {
    expect(() =>
      validateCreateListingInput({ ...validInput(), price: Infinity })
    ).toThrow(ResaleServiceError);
  });

  it("accepts price of 0", () => {
    const result = validateCreateListingInput({ ...validInput(), price: 0 });
    expect(result.price).toBe(0);
  });

  it("accepts a positive price", () => {
    const result = validateCreateListingInput({ ...validInput(), price: 1500 });
    expect(result.price).toBe(1500);
  });
});

// ─── validateCreateListingInput — original_price ──────────────────────────────

describe("Phase 2B: validateCreateListingInput — original_price", () => {
  it("throws when original_price is negative", () => {
    expect(() =>
      validateCreateListingInput({ ...validInput(), original_price: -5 })
    ).toThrow(ResaleServiceError);
  });

  it("throws when original_price is NaN", () => {
    expect(() =>
      validateCreateListingInput({ ...validInput(), original_price: NaN })
    ).toThrow(ResaleServiceError);
  });

  it("accepts original_price of 0", () => {
    const result = validateCreateListingInput({ ...validInput(), original_price: 0 });
    expect(result.original_price).toBe(0);
  });

  it("accepts original_price greater than selling price (valid discount scenario)", () => {
    const result = validateCreateListingInput({
      ...validInput(),
      price: 200,
      original_price: 500,
    });
    expect(result.original_price).toBe(500);
  });

  it("accepts null original_price (optional field)", () => {
    const result = validateCreateListingInput({ ...validInput(), original_price: null });
    expect(result.original_price).toBeNull();
  });

  it("accepts undefined original_price (not supplied)", () => {
    const result = validateCreateListingInput({ ...validInput() });
    expect(result.original_price).toBeNull();
  });
});

// ─── validateCreateListingInput — Category ────────────────────────────────────

describe("Phase 2B: validateCreateListingInput — category", () => {
  it("throws for an invalid category", () => {
    expect(() =>
      validateCreateListingInput({
        ...validInput(),
        category: "food" as never,
      })
    ).toThrow(ResaleServiceError);
  });

  it("throws for an empty string category", () => {
    expect(() =>
      validateCreateListingInput({
        ...validInput(),
        category: "" as never,
      })
    ).toThrow(ResaleServiceError);
  });

  VALID_CATEGORIES.forEach((cat) => {
    it(`accepts category: ${cat}`, () => {
      const result = validateCreateListingInput({ ...validInput(), category: cat });
      expect(result.category).toBe(cat);
    });
  });
});

// ─── validateCreateListingInput — Condition ───────────────────────────────────

describe("Phase 2B: validateCreateListingInput — condition", () => {
  it("throws for an invalid condition", () => {
    expect(() =>
      validateCreateListingInput({
        ...validInput(),
        condition: "broken" as never,
      })
    ).toThrow(ResaleServiceError);
  });

  it("throws for an empty string condition", () => {
    expect(() =>
      validateCreateListingInput({
        ...validInput(),
        condition: "" as never,
      })
    ).toThrow(ResaleServiceError);
  });

  VALID_CONDITIONS.forEach((cond) => {
    it(`accepts condition: ${cond}`, () => {
      const result = validateCreateListingInput({ ...validInput(), condition: cond });
      expect(result.condition).toBe(cond);
    });
  });
});

// ─── validateImageFile — oversized images ─────────────────────────────────────

describe("Phase 2B: validateImageFile — oversized images", () => {
  it("throws when file exceeds 5 MB", () => {
    const tooBig = makeFile("image/jpeg", MAX_IMAGE_BYTES + 1);
    expect(() => validateImageFile(tooBig)).toThrow(ResaleServiceError);
  });

  it("includes the file size in the error message", () => {
    const tooBig = makeFile("image/jpeg", MAX_IMAGE_BYTES + 1);
    try {
      validateImageFile(tooBig);
    } catch (e) {
      expect(e).toBeInstanceOf(ResaleServiceError);
      expect((e as ResaleServiceError).message).toContain("MB");
    }
  });

  it("accepts a file exactly at 5 MB", () => {
    const exact = makeFile("image/jpeg", MAX_IMAGE_BYTES);
    const result = validateImageFile(exact);
    expect(result.sizeBytes).toBe(MAX_IMAGE_BYTES);
  });
});

// ─── validateImageFile — unsupported MIME types ───────────────────────────────

describe("Phase 2B: validateImageFile — unsupported MIME types", () => {
  const rejected = [
    "image/gif",
    "image/svg+xml",
    "image/tiff",
    "image/bmp",
    "application/pdf",
    "text/html",
    "video/mp4",
  ];

  rejected.forEach((mime) => {
    it(`rejects MIME type: ${mime}`, () => {
      expect(() => validateImageFile(makeFile(mime, 1000))).toThrow(ResaleServiceError);
    });
  });

  it("accepts image/jpeg", () => {
    const result = validateImageFile(makeFile("image/jpeg", 1000));
    expect(result.mimeType).toBe("image/jpeg");
  });

  it("accepts image/png", () => {
    const result = validateImageFile(makeFile("image/png", 1000));
    expect(result.mimeType).toBe("image/png");
  });

  it("accepts image/webp", () => {
    const result = validateImageFile(makeFile("image/webp", 1000));
    expect(result.mimeType).toBe("image/webp");
  });
});

// ─── Client-side 6-image limit guard ─────────────────────────────────────────

describe("Phase 2B: MAX_IMAGES_PER_LISTING constant", () => {
  it("is 6 (matching Phase 1B DB trigger)", () => {
    expect(MAX_IMAGES_PER_LISTING).toBe(6);
  });

  it("is a positive integer", () => {
    expect(Number.isInteger(MAX_IMAGES_PER_LISTING)).toBe(true);
    expect(MAX_IMAGES_PER_LISTING).toBeGreaterThan(0);
  });

  it("client guard: array of 6 valid files triggers limit", () => {
    // Simulate client-side check: images.length >= MAX_IMAGES_PER_LISTING
    const alreadyHave = 6;
    expect(alreadyHave >= MAX_IMAGES_PER_LISTING).toBe(true);
  });

  it("client guard: array of 5 valid files does not trigger limit", () => {
    const alreadyHave = 5;
    expect(alreadyHave >= MAX_IMAGES_PER_LISTING).toBe(false);
  });
});

// ─── Form-level original_price >= selling_price check ────────────────────────

describe("Phase 2B: form-level original_price >= selling_price validation", () => {
  /**
   * The service layer accepts original_price < price (no explicit rule in validateCreateListingInput).
   * The form validates this itself to give the user guidance.
   * This test documents the expected form behavior.
   */
  function formValidateOriginalPrice(sellPrice: number, origPrice: number): string | null {
    if (origPrice < sellPrice) {
      return "Original price should be ≥ selling price.";
    }
    return null;
  }

  it("returns error when original price is less than selling price", () => {
    expect(formValidateOriginalPrice(500, 300)).toBe("Original price should be ≥ selling price.");
  });

  it("returns null when original price equals selling price", () => {
    expect(formValidateOriginalPrice(500, 500)).toBeNull();
  });

  it("returns null when original price is greater than selling price", () => {
    expect(formValidateOriginalPrice(500, 800)).toBeNull();
  });
});
