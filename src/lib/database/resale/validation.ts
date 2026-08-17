/**
 * UniVerse Resale — Input Validation
 *
 * All validation helpers used by the resale service layer.
 * These are pure functions with no Supabase dependency — fully unit-testable.
 */

import { sanitizeString, normalizeOptionalString, parseSafeNumber } from "@/lib/security/validation";
import {
  VALID_CATEGORIES,
  VALID_CONDITIONS,
  VALID_SORT_OPTIONS,
  MAX_PAGE_SIZE,
  DEFAULT_PAGE_SIZE,
  type ResaleCategory,
  type ResaleCondition,
  type ResaleSortOption,
  type CreateResaleListingInput,
  type UpdateResaleListingInput,
  type ResaleListingFilters,
  type PaginationParams,
  ResaleServiceError,
} from "./types";

// ─── UUID Validation ──────────────────────────────────────────────────────────

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Returns true if the value is a valid UUID v4 string.
 */
export function isValidUuid(value: unknown): value is string {
  return typeof value === "string" && UUID_REGEX.test(value);
}

/**
 * Asserts that a value is a valid UUID, throwing a typed ResaleServiceError if not.
 */
export function assertValidUuid(value: unknown, fieldName = "id"): string {
  if (!isValidUuid(value)) {
    throw new ResaleServiceError(
      "VALIDATION_ERROR",
      `Invalid ${fieldName}: must be a valid UUID.`
    );
  }
  return value;
}

// ─── Enum Guards ──────────────────────────────────────────────────────────────

export function isValidCategory(value: unknown): value is ResaleCategory {
  return (
    typeof value === "string" &&
    (VALID_CATEGORIES as readonly string[]).includes(value)
  );
}

export function isValidCondition(value: unknown): value is ResaleCondition {
  return (
    typeof value === "string" &&
    (VALID_CONDITIONS as readonly string[]).includes(value)
  );
}

export function isValidSortOption(value: unknown): value is ResaleSortOption {
  return (
    typeof value === "string" &&
    (VALID_SORT_OPTIONS as readonly string[]).includes(value)
  );
}

// ─── Listing Input Validation ─────────────────────────────────────────────────

/**
 * Validates and sanitizes input for creating a new resale listing.
 * Throws ResaleServiceError on any validation failure.
 * Returns a clean, server-safe payload ready for Supabase insertion.
 */
export function validateCreateListingInput(
  raw: CreateResaleListingInput
): CreateResaleListingInput {
  // title — required, non-empty, max 200 chars
  const title = sanitizeString(raw.title, 200);
  if (title.length === 0) {
    throw new ResaleServiceError(
      "VALIDATION_ERROR",
      "title is required and must not be empty."
    );
  }

  // category — strict enum
  if (!isValidCategory(raw.category)) {
    throw new ResaleServiceError(
      "VALIDATION_ERROR",
      `category must be one of: ${VALID_CATEGORIES.join(", ")}.`
    );
  }

  // condition — strict enum
  if (!isValidCondition(raw.condition)) {
    throw new ResaleServiceError(
      "VALIDATION_ERROR",
      `condition must be one of: ${VALID_CONDITIONS.join(", ")}.`
    );
  }

  // price — required, finite, >= 0
  const price = parseSafeNumber(raw.price, -1);
  if (price < 0 || !isFinite(price)) {
    throw new ResaleServiceError(
      "VALIDATION_ERROR",
      "price must be a finite number >= 0."
    );
  }

  // original_price — optional, finite, >= 0
  let originalPrice: number | null = null;
  if (raw.original_price !== undefined && raw.original_price !== null) {
    const op = parseSafeNumber(raw.original_price, -1);
    if (op < 0 || !isFinite(op)) {
      throw new ResaleServiceError(
        "VALIDATION_ERROR",
        "original_price must be a finite number >= 0."
      );
    }
    originalPrice = op;
  }

  // negotiable — boolean, default false
  const negotiable =
    typeof raw.negotiable === "boolean" ? raw.negotiable : false;

  // description — optional, max 5000
  const description = normalizeOptionalString(
    raw.description !== undefined
      ? sanitizeString(raw.description ?? "", 5000)
      : null
  );

  // pickup_location — optional, max 300
  const pickup_location = normalizeOptionalString(
    raw.pickup_location !== undefined
      ? sanitizeString(raw.pickup_location ?? "", 300)
      : null
  );

  return {
    title,
    description,
    category: raw.category,
    condition: raw.condition,
    price,
    original_price: originalPrice,
    negotiable,
    pickup_location,
  };
}

/**
 * Validates and sanitizes input for updating an existing resale listing.
 * Only the fields that are present in the input will be returned.
 * Throws ResaleServiceError on any validation failure.
 */
export function validateUpdateListingInput(
  raw: UpdateResaleListingInput
): UpdateResaleListingInput {
  const result: UpdateResaleListingInput = {};

  if (raw.title !== undefined) {
    const title = sanitizeString(raw.title, 200);
    if (title.length === 0) {
      throw new ResaleServiceError(
        "VALIDATION_ERROR",
        "title must not be empty."
      );
    }
    result.title = title;
  }

  if (raw.description !== undefined) {
    result.description = normalizeOptionalString(
      sanitizeString(raw.description ?? "", 5000)
    );
  }

  if (raw.category !== undefined) {
    if (!isValidCategory(raw.category)) {
      throw new ResaleServiceError(
        "VALIDATION_ERROR",
        `category must be one of: ${VALID_CATEGORIES.join(", ")}.`
      );
    }
    result.category = raw.category;
  }

  if (raw.condition !== undefined) {
    if (!isValidCondition(raw.condition)) {
      throw new ResaleServiceError(
        "VALIDATION_ERROR",
        `condition must be one of: ${VALID_CONDITIONS.join(", ")}.`
      );
    }
    result.condition = raw.condition;
  }

  if (raw.price !== undefined) {
    const price = parseSafeNumber(raw.price, -1);
    if (price < 0 || !isFinite(price)) {
      throw new ResaleServiceError(
        "VALIDATION_ERROR",
        "price must be a finite number >= 0."
      );
    }
    result.price = price;
  }

  if (raw.original_price !== undefined) {
    if (raw.original_price !== null) {
      const op = parseSafeNumber(raw.original_price, -1);
      if (op < 0 || !isFinite(op)) {
        throw new ResaleServiceError(
          "VALIDATION_ERROR",
          "original_price must be a finite number >= 0."
        );
      }
      result.original_price = op;
    } else {
      result.original_price = null;
    }
  }

  if (raw.negotiable !== undefined) {
    if (typeof raw.negotiable !== "boolean") {
      throw new ResaleServiceError(
        "VALIDATION_ERROR",
        "negotiable must be a boolean."
      );
    }
    result.negotiable = raw.negotiable;
  }

  if (raw.pickup_location !== undefined) {
    result.pickup_location = normalizeOptionalString(
      sanitizeString(raw.pickup_location ?? "", 300)
    );
  }

  // status — only seller-safe transitions allowed
  if (raw.status !== undefined) {
    const ALLOWED_STATUS_UPDATES = ["active", "reserved", "sold", "removed"] as const;
    if (!(ALLOWED_STATUS_UPDATES as readonly string[]).includes(raw.status)) {
      throw new ResaleServiceError(
        "VALIDATION_ERROR",
        `status may only be set to: ${ALLOWED_STATUS_UPDATES.join(", ")}.`
      );
    }
    result.status = raw.status;
  }

  return result;
}

// ─── Filter Validation ────────────────────────────────────────────────────────

/**
 * Validates and sanitizes marketplace filter inputs.
 * Invalid values are silently dropped to avoid crashing on bad query params.
 */
export function validateFilters(raw: Partial<ResaleListingFilters>): ResaleListingFilters {
  const filters: ResaleListingFilters = {};

  if (isValidCategory(raw.category)) {
    filters.category = raw.category;
  }

  if (isValidCondition(raw.condition)) {
    filters.condition = raw.condition;
  }

  if (raw.minPrice !== undefined) {
    const min = parseSafeNumber(raw.minPrice, -1);
    if (min >= 0 && isFinite(min)) filters.minPrice = min;
  }

  if (raw.maxPrice !== undefined) {
    const max = parseSafeNumber(raw.maxPrice, -1);
    if (max >= 0 && isFinite(max)) filters.maxPrice = max;
  }

  // Reject nonsensical price range
  if (
    filters.minPrice !== undefined &&
    filters.maxPrice !== undefined &&
    filters.minPrice > filters.maxPrice
  ) {
    throw new ResaleServiceError(
      "VALIDATION_ERROR",
      "minPrice must not be greater than maxPrice."
    );
  }

  // Search: max 200 chars, trimmed
  if (raw.search !== undefined) {
    const search = sanitizeString(raw.search, 200);
    if (search.length > 0) filters.search = search;
  }

  return filters;
}

// ─── Pagination Validation ────────────────────────────────────────────────────

export interface ValidatedPagination {
  page: number;
  pageSize: number;
  offset: number;
}

/**
 * Validates and clamps pagination parameters.
 */
export function validatePagination(raw: PaginationParams): ValidatedPagination {
  const page = Math.max(1, Math.floor(parseSafeNumber(raw.page, 1)));
  const pageSize = Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, Math.floor(parseSafeNumber(raw.pageSize, DEFAULT_PAGE_SIZE)))
  );
  const offset = (page - 1) * pageSize;
  return { page, pageSize, offset };
}

// ─── Image File Validation ────────────────────────────────────────────────────

import {
  ALLOWED_IMAGE_MIME_TYPES,
  MAX_IMAGE_BYTES,
  type AllowedImageMimeType,
} from "./types";

/**
 * Validates an image file before upload.
 * Throws ResaleServiceError on any failure.
 */
export function validateImageFile(file: File): {
  mimeType: AllowedImageMimeType;
  sizeBytes: number;
} {
  if (!(ALLOWED_IMAGE_MIME_TYPES as readonly string[]).includes(file.type)) {
    throw new ResaleServiceError(
      "VALIDATION_ERROR",
      `Unsupported image type: "${file.type}". Allowed types: ${ALLOWED_IMAGE_MIME_TYPES.join(", ")}.`
    );
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new ResaleServiceError(
      "VALIDATION_ERROR",
      `Image size (${(file.size / 1024 / 1024).toFixed(2)} MB) exceeds the 5 MB limit.`
    );
  }
  return {
    mimeType: file.type as AllowedImageMimeType,
    sizeBytes: file.size,
  };
}

// ─── Storage Path Utilities ───────────────────────────────────────────────────

/**
 * Constructs the storage path for a listing image.
 * Path structure: <seller_id>/<listing_id>/<unique-filename>
 *
 * The filename is generated server-side — never accepted from the client.
 */
export function buildImageStoragePath(
  sellerId: string,
  listingId: string,
  mimeType: AllowedImageMimeType
): string {
  const extension = mimeType === "image/png" ? "png" : mimeType === "image/webp" ? "webp" : "jpg";
  const uniquePart = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  return `${sellerId}/${listingId}/${uniquePart}.${extension}`;
}
