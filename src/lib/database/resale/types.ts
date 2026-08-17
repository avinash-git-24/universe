/**
 * UniVerse Resale — Application-Level Types
 *
 * These types build on the raw database types in src/types/database.ts.
 * They represent the shapes consumed by the service layer and future UI.
 */

import type { Database } from "@/types/database";

// ─── Raw DB Row Types ─────────────────────────────────────────────────────────

export type ResaleListingRow =
  Database["public"]["Tables"]["resale_listings"]["Row"];

export type ResaleListingImageRow =
  Database["public"]["Tables"]["resale_listing_images"]["Row"];

// ─── Enums (string literals matching DB CHECK constraints) ────────────────────

export type ResaleCategory =
  | "books"
  | "electronics"
  | "study_materials"
  | "hostel"
  | "sports"
  | "furniture"
  | "clothing"
  | "gaming"
  | "other";

export type ResaleCondition = "new" | "like_new" | "good" | "fair";

export type ResaleStatus = "active" | "reserved" | "sold" | "removed";

export type ResaleSortOption =
  | "newest"
  | "oldest"
  | "price_low_to_high"
  | "price_high_to_low";

// ─── Allowlist Maps ───────────────────────────────────────────────────────────

/** Maps safe sort option names to Supabase .order() parameters. */
export const SORT_MAP: Record<
  ResaleSortOption,
  { column: string; ascending: boolean }
> = {
  newest: { column: "created_at", ascending: false },
  oldest: { column: "created_at", ascending: true },
  price_low_to_high: { column: "price", ascending: true },
  price_high_to_low: { column: "price", ascending: false },
};

export const VALID_CATEGORIES: readonly ResaleCategory[] = [
  "books",
  "electronics",
  "study_materials",
  "hostel",
  "sports",
  "furniture",
  "clothing",
  "gaming",
  "other",
] as const;

export const VALID_CONDITIONS: readonly ResaleCondition[] = [
  "new",
  "like_new",
  "good",
  "fair",
] as const;

export const VALID_STATUSES: readonly ResaleStatus[] = [
  "active",
  "reserved",
  "sold",
  "removed",
] as const;

export const VALID_SORT_OPTIONS: readonly ResaleSortOption[] = [
  "newest",
  "oldest",
  "price_low_to_high",
  "price_high_to_low",
] as const;

// ─── Allowed MIME types (mirrors Phase 1B bucket config) ─────────────────────

export const ALLOWED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export type AllowedImageMimeType = (typeof ALLOWED_IMAGE_MIME_TYPES)[number];

/** Maximum image file size: 5 MB (matches Phase 1B bucket limit). */
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

/** Maximum images per listing (enforced by DB trigger in Phase 1B). */
export const MAX_IMAGES_PER_LISTING = 6;

// ─── Pagination ───────────────────────────────────────────────────────────────

export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number | null; // null when count is not available
}

/** Default page size for marketplace queries. */
export const DEFAULT_PAGE_SIZE = 12;

/** Hard maximum page size to prevent large data pulls. */
export const MAX_PAGE_SIZE = 50;

// ─── Filter Params ────────────────────────────────────────────────────────────

export interface ResaleListingFilters {
  category?: ResaleCategory;
  condition?: ResaleCondition;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
}

// ─── Composed Types ───────────────────────────────────────────────────────────

/** A listing row with its associated image rows attached. */
export interface ResaleListingWithImages extends ResaleListingRow {
  images: ResaleListingImageRow[];
}

/** Input shape for creating a new resale listing. seller_id is NEVER accepted from input. */
export interface CreateResaleListingInput {
  title: string;
  description?: string | null;
  category: ResaleCategory;
  condition: ResaleCondition;
  price: number;
  original_price?: number | null;
  negotiable?: boolean;
  pickup_location?: string | null;
}

/** Input shape for updating an existing resale listing. seller_id and id are NEVER accepted. */
export interface UpdateResaleListingInput {
  title?: string;
  description?: string | null;
  category?: ResaleCategory;
  condition?: ResaleCondition;
  price?: number;
  original_price?: number | null;
  negotiable?: boolean;
  pickup_location?: string | null;
  /** Only 'active', 'reserved', 'sold', or 'removed' are allowed via update. */
  status?: ResaleStatus;
}

// ─── Error Types ──────────────────────────────────────────────────────────────

export type ResaleErrorCode =
  | "UNAUTHENTICATED"
  | "UNAUTHORIZED"
  | "VALIDATION_ERROR"
  | "NOT_FOUND"
  | "STORAGE_ERROR"
  | "DATABASE_ERROR"
  | "UNKNOWN_ERROR";

export class ResaleServiceError extends Error {
  constructor(
    public readonly code: ResaleErrorCode,
    message: string,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = "ResaleServiceError";
  }
}

// ─── Result Shape (used by image upload) ─────────────────────────────────────

export interface UploadedImageResult {
  imageRow: ResaleListingImageRow;
  storagePath: string;
}
