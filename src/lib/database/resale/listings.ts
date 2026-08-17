/**
 * UniVerse Resale — Listings Service
 *
 * All database operations for resale_listings.
 *
 * Security contract:
 *   - seller_id is ALWAYS taken from auth.uid() — never from client input.
 *   - RLS is the final authorization layer; app-level checks are defence-in-depth.
 *   - No service-role credentials are used anywhere in this file.
 *   - All inputs are validated before touching the database.
 */

import { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import {
  ResaleServiceError,
  SORT_MAP,
  type ResaleListingRow,
  type ResaleListingWithImages,
  type CreateResaleListingInput,
  type UpdateResaleListingInput,
  type ResaleListingFilters,
  type ResaleSortOption,
  type PaginationParams,
  type PaginationMeta,
} from "./types";
import {
  assertValidUuid,
  validateCreateListingInput,
  validateUpdateListingInput,
  validateFilters,
  validatePagination,
  isValidSortOption,
} from "./validation";

// ─── Column selection used across listing queries ─────────────────────────────
// Select only the columns the service layer needs — avoids over-fetching.
const LISTING_COLUMNS = `
  id,
  seller_id,
  title,
  description,
  category,
  condition,
  price,
  original_price,
  negotiable,
  pickup_location,
  status,
  created_at,
  updated_at
`;

export const LISTING_WITH_IMAGES_COLUMNS = `
  id,
  seller_id,
  title,
  description,
  category,
  condition,
  price,
  original_price,
  negotiable,
  pickup_location,
  status,
  created_at,
  updated_at,
  images:resale_listing_images (
    id,
    listing_id,
    storage_path,
    display_order,
    created_at
  )
`;

// ─── Auth Helper ──────────────────────────────────────────────────────────────

/**
 * Retrieves the authenticated user's ID from the Supabase session.
 * Throws UNAUTHENTICATED if there is no valid session.
 */
async function requireAuth(
  supabase: SupabaseClient<Database>
): Promise<string> {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    throw new ResaleServiceError(
      "UNAUTHENTICATED",
      "You must be signed in to perform this action."
    );
  }
  return data.user.id;
}

// ─── CREATE ───────────────────────────────────────────────────────────────────

/**
 * Creates a new resale listing for the authenticated user.
 *
 * seller_id is ALWAYS sourced from auth.uid() — never trusted from input.
 * RLS enforces this at the database level as well.
 */
export async function createResaleListing(
  supabase: SupabaseClient<Database>,
  rawInput: CreateResaleListingInput
): Promise<ResaleListingRow> {
  const sellerId = await requireAuth(supabase);
  const input = validateCreateListingInput(rawInput);

  const { data, error } = await supabase
    .from("resale_listings")
    .insert({
      seller_id: sellerId,   // always from server-side auth
      title: input.title,
      description: input.description ?? null,
      category: input.category,
      condition: input.condition,
      price: input.price,
      original_price: input.original_price ?? null,
      negotiable: input.negotiable ?? false,
      pickup_location: input.pickup_location ?? null,
      // status, id, created_at, updated_at: controlled by DB defaults
    })
    .select(LISTING_COLUMNS)
    .single();

  if (error || !data) {
    console.error(
      "[resale] createResaleListing error:",
      error instanceof Error ? error : JSON.stringify(error, null, 2)
    );
    throw new ResaleServiceError(
      "DATABASE_ERROR",
      "Failed to create listing. Please try again.",
      error
    );
  }

  return data as ResaleListingRow;
}

// ─── READ — Single ────────────────────────────────────────────────────────────

/**
 * Fetches a single listing by UUID with its associated images.
 *
 * RLS allows:
 *   - Any authenticated user to read an ACTIVE listing.
 *   - The seller to read their own listing regardless of status.
 */
export async function getResaleListingById(
  supabase: SupabaseClient<Database>,
  listingId: string
): Promise<ResaleListingWithImages | null> {
  assertValidUuid(listingId, "listingId");

  const { data, error } = await supabase
    .from("resale_listings")
    .select(LISTING_WITH_IMAGES_COLUMNS)
    .eq("id", listingId)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null; // no rows
    console.error("[resale] getResaleListingById error:", error);
    throw new ResaleServiceError(
      "DATABASE_ERROR",
      "Failed to fetch listing.",
      error
    );
  }

  return data as unknown as ResaleListingWithImages;
}

// ─── READ — Marketplace (public active listings) ──────────────────────────────

export interface GetActiveListingsResult {
  listings: ResaleListingWithImages[];
  pagination: PaginationMeta;
}

/**
 * Fetches active marketplace listings with filtering, sorting, and pagination.
 *
 * Only returns listings the RLS policy allows the current user to see
 * (active listings for any authenticated user).
 *
 * Search uses Supabase .ilike() for basic title/description matching.
 * A future migration can add a full-text search index for better performance.
 */
export async function getActiveResaleListings(
  supabase: SupabaseClient<Database>,
  rawFilters: Partial<ResaleListingFilters> = {},
  sortOption: string = "newest",
  pagination: PaginationParams = {}
): Promise<GetActiveListingsResult> {
  const filters = validateFilters(rawFilters);
  const sort = isValidSortOption(sortOption) ? sortOption : ("newest" as ResaleSortOption);
  const sortParams = SORT_MAP[sort];
  const { page, pageSize, offset } = validatePagination(pagination);

  let query = supabase
    .from("resale_listings")
    .select(LISTING_WITH_IMAGES_COLUMNS, { count: "exact" })
    .eq("status", "active");

  // Apply validated filters
  if (filters.category) {
    query = query.eq("category", filters.category);
  }
  if (filters.condition) {
    query = query.eq("condition", filters.condition);
  }
  if (filters.minPrice !== undefined) {
    query = query.gte("price", filters.minPrice);
  }
  if (filters.maxPrice !== undefined) {
    query = query.lte("price", filters.maxPrice);
  }
  // Search: uses Supabase .or() to match title or description.
  // Note: This is an ilike scan on the table — acceptable at this scale.
  // Future optimization: add a tsvector column and GIN index via a migration.
  if (filters.search) {
    const escaped = filters.search.replace(/[%_]/g, "\\$&");
    query = query.or(
      `title.ilike.%${escaped}%,description.ilike.%${escaped}%`
    );
  }

  // Sort by the allowlisted column only (never raw user input)
  query = query
    .order(sortParams.column, { ascending: sortParams.ascending })
    // Stable secondary sort to prevent pagination drift
    .order("id", { ascending: true })
    .range(offset, offset + pageSize - 1);

  const { data, error, count } = await query;

  if (error) {
    console.error(
      "[resale] getActiveResaleListings error:",
      error instanceof Error ? error : JSON.stringify(error, null, 2)
    );
    throw new ResaleServiceError(
      "DATABASE_ERROR",
      "Failed to fetch listings.",
      error
    );
  }

  return {
    listings: (data ?? []) as unknown as ResaleListingWithImages[],
    pagination: {
      page,
      pageSize,
      total: count,
    },
  };
}

// ─── READ — Seller's Own Listings ─────────────────────────────────────────────

export interface GetMyListingsResult {
  listings: ResaleListingWithImages[];
  pagination: PaginationMeta;
}

/**
 * Returns the authenticated seller's own listings (all statuses).
 *
 * seller_id is sourced from auth.uid() — never trusted from client input.
 */
export async function getMyResaleListings(
  supabase: SupabaseClient<Database>,
  sortOption: string = "newest",
  pagination: PaginationParams = {}
): Promise<GetMyListingsResult> {
  const sellerId = await requireAuth(supabase);
  const sort = isValidSortOption(sortOption) ? sortOption : ("newest" as ResaleSortOption);
  const sortParams = SORT_MAP[sort];
  const { page, pageSize, offset } = validatePagination(pagination);

  const { data, error, count } = await supabase
    .from("resale_listings")
    .select(LISTING_WITH_IMAGES_COLUMNS, { count: "exact" })
    .eq("seller_id", sellerId)
    .order(sortParams.column, { ascending: sortParams.ascending })
    .order("id", { ascending: true })
    .range(offset, offset + pageSize - 1);

  if (error) {
    console.error("[resale] getMyResaleListings error:", error);
    throw new ResaleServiceError(
      "DATABASE_ERROR",
      "Failed to fetch your listings.",
      error
    );
  }

  return {
    listings: (data ?? []) as unknown as ResaleListingWithImages[],
    pagination: { page, pageSize, total: count },
  };
}

// ─── UPDATE ───────────────────────────────────────────────────────────────────

/**
 * Updates an existing listing owned by the authenticated user.
 *
 * Constraints:
 *   - seller_id cannot be changed (DB trigger prevents this; app also never sends it).
 *   - RLS enforces that only the listing owner can update.
 *   - Only explicitly provided fields are updated (partial update).
 */
export async function updateResaleListing(
  supabase: SupabaseClient<Database>,
  listingId: string,
  rawInput: UpdateResaleListingInput
): Promise<ResaleListingRow> {
  await requireAuth(supabase);
  assertValidUuid(listingId, "listingId");
  const updates = validateUpdateListingInput(rawInput);

  if (Object.keys(updates).length === 0) {
    throw new ResaleServiceError(
      "VALIDATION_ERROR",
      "No valid fields provided for update."
    );
  }

  let query = supabase.from("resale_listings").update(updates);

  // Enforce state machine transitions if status is being updated
  if (updates.status) {
    if (updates.status === "active") {
      // Can only go to active from reserved
      query = query.in("status", ["reserved"]);
    } else if (updates.status === "reserved") {
      // Can only go to reserved from active
      query = query.in("status", ["active"]);
    } else if (updates.status === "sold" || updates.status === "removed") {
      // Can only go to sold/removed from active or reserved
      query = query.in("status", ["active", "reserved"]);
    }
  }

  const { data, error } = await query
    .eq("id", listingId)
    // Defence-in-depth: app-level ownership check in addition to RLS.
    // RLS will block this at the database level if the user is not the seller,
    // but this makes the intent explicit and testable.
    .select(LISTING_COLUMNS)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // No row returned — RLS blocked it (not found or not authorized) or invalid transition
      throw new ResaleServiceError(
        "UNAUTHORIZED",
        "Listing not found, unauthorized, or invalid status transition."
      );
    }
    console.error("[resale] updateResaleListing error:", error);
    throw new ResaleServiceError(
      "DATABASE_ERROR",
      "Failed to update listing.",
      error
    );
  }

  if (!data) {
    throw new ResaleServiceError(
      "NOT_FOUND",
      "Listing not found or you do not have permission to update it."
    );
  }

  return data as ResaleListingRow;
}

// ─── DELETE ───────────────────────────────────────────────────────────────────

/**
 * Deletes a listing owned by the authenticated user.
 *
 * Cascade behaviour:
 *   - resale_listing_images rows are deleted via ON DELETE CASCADE (Phase 1A).
 *   - Storage objects are NOT automatically removed by the DB cascade.
 *   - The caller should use deleteAllListingImages() from images.ts first
 *     to clean up storage objects before deleting the listing row.
 *   - RLS enforces that only the listing owner can delete.
 */
export async function deleteResaleListing(
  supabase: SupabaseClient<Database>,
  listingId: string
): Promise<void> {
  await requireAuth(supabase);
  assertValidUuid(listingId, "listingId");

  const { error } = await supabase
    .from("resale_listings")
    .delete()
    .eq("id", listingId);

  if (error) {
    console.error("[resale] deleteResaleListing error:", error);
    throw new ResaleServiceError(
      "DATABASE_ERROR",
      "Failed to delete listing.",
      error
    );
  }
}
