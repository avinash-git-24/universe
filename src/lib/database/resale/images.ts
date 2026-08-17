/**
 * UniVerse Resale — Image Service
 *
 * Handles upload, deletion, retrieval, and signed-URL generation
 * for resale listing images stored in the private 'resale-listing-images' bucket.
 *
 * Security contract:
 *   - Auth is checked server-side before any storage operation.
 *   - Storage paths are ALWAYS constructed server-side — never accepted from client.
 *   - The bucket is private; images are served via short-lived signed URLs only.
 *   - If DB insertion fails after upload, the orphaned storage object is cleaned up.
 *   - MIME type and file size are validated before upload.
 *   - No service-role credentials are used.
 */

import { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import {
  ResaleServiceError,
  MAX_IMAGES_PER_LISTING,
  type ResaleListingImageRow,
  type UploadedImageResult,
} from "./types";
import {
  assertValidUuid,
  validateImageFile,
  buildImageStoragePath,
} from "./validation";

/** The Supabase Storage bucket name. Created in Phase 1B. */
const BUCKET = "resale-listing-images";

/**
 * Signed URL expiry: 1 hour (3600 seconds).
 * Short-lived to avoid stale URLs being cached or shared.
 */
const SIGNED_URL_EXPIRY_SECONDS = 3600;

// ─── Auth Helper (mirrored from listings.ts — kept local to avoid coupling) ───

async function requireAuth(supabase: SupabaseClient<Database>): Promise<string> {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    throw new ResaleServiceError(
      "UNAUTHENTICATED",
      "You must be signed in to perform this action."
    );
  }
  return data.user.id;
}

// ─── Ownership Helper ─────────────────────────────────────────────────────────

/**
 * Verifies that the given listing exists and belongs to the authenticated user.
 * Throws UNAUTHORIZED or NOT_FOUND as appropriate.
 * Returns the verified listing row on success.
 */
async function requireListingOwnership(
  supabase: SupabaseClient<Database>,
  listingId: string,
  sellerId: string
): Promise<{ id: string; seller_id: string; status: string }> {
  const { data, error } = await supabase
    .from("resale_listings")
    .select("id, seller_id, status")
    .eq("id", listingId)
    .single();

  if (error || !data) {
    throw new ResaleServiceError("NOT_FOUND", "Listing not found.");
  }

  if (data.seller_id !== sellerId) {
    throw new ResaleServiceError(
      "UNAUTHORIZED",
      "You do not have permission to modify this listing's images."
    );
  }

  return data;
}

// ─── UPLOAD ───────────────────────────────────────────────────────────────────

/**
 * Uploads a single image to the private resale-listing-images bucket
 * and inserts the corresponding row into resale_listing_images.
 *
 * Failure safety:
 *   - If the DB insertion fails after a successful upload, the orphaned
 *     storage object is deleted. This prevents storage leaks.
 *
 * Image count:
 *   - The existing DB trigger (Phase 1B) enforces max 6 images at the DB level.
 *   - This function also checks the count first as a fast early rejection.
 */
export async function uploadResaleListingImage(
  supabase: SupabaseClient<Database>,
  listingId: string,
  file: File,
  displayOrder = 0
): Promise<UploadedImageResult> {
  const sellerId = await requireAuth(supabase);
  assertValidUuid(listingId, "listingId");

  // Validate MIME type and size before doing anything else
  const { mimeType } = validateImageFile(file);

  // Verify listing ownership (defence-in-depth — Storage RLS also enforces this)
  await requireListingOwnership(supabase, listingId, sellerId);

  // Fast early rejection: count existing images before hitting the DB trigger
  const { count: existingCount, error: countError } = await supabase
    .from("resale_listing_images")
    .select("id", { count: "exact", head: true })
    .eq("listing_id", listingId);

  if (countError) {
    console.error("[resale] uploadResaleListingImage count error:", countError);
    throw new ResaleServiceError(
      "DATABASE_ERROR",
      "Failed to check image count.",
      countError
    );
  }

  if ((existingCount ?? 0) >= MAX_IMAGES_PER_LISTING) {
    throw new ResaleServiceError(
      "VALIDATION_ERROR",
      `A listing may have at most ${MAX_IMAGES_PER_LISTING} images.`
    );
  }

  // Construct storage path server-side — never from client input
  const storagePath = buildImageStoragePath(sellerId, listingId, mimeType);

  // Upload to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, file, {
      contentType: mimeType,
      upsert: false, // Do not overwrite existing objects
    });

  if (uploadError) {
    console.error("[resale] uploadResaleListingImage upload error:", uploadError);
    throw new ResaleServiceError(
      "STORAGE_ERROR",
      "Image upload failed. Please try again.",
      uploadError
    );
  }

  // Insert DB record
  const { data: imageRow, error: dbError } = await supabase
    .from("resale_listing_images")
    .insert({
      listing_id: listingId,
      storage_path: storagePath,
      display_order: displayOrder,
    })
    .select()
    .single();

  if (dbError || !imageRow) {
    // DB insertion failed — clean up the orphaned storage object
    console.error("[resale] uploadResaleListingImage DB insert error:", dbError);
    const { error: cleanupError } = await supabase.storage
      .from(BUCKET)
      .remove([storagePath]);

    if (cleanupError) {
      // Log but do not throw the cleanup error — the primary error takes priority
      console.error(
        "[resale] uploadResaleListingImage cleanup failed for orphaned object:",
        storagePath,
        cleanupError
      );
    }

    throw new ResaleServiceError(
      "DATABASE_ERROR",
      "Image record could not be saved. The uploaded file has been removed.",
      dbError
    );
  }

  return {
    imageRow: imageRow as ResaleListingImageRow,
    storagePath,
  };
}

// ─── DELETE ───────────────────────────────────────────────────────────────────

/**
 * Deletes a single listing image (both storage object and DB record).
 *
 * Order of operations:
 *   1. Verify auth and ownership via the DB record.
 *   2. Delete the storage object.
 *   3. Delete the DB record.
 *
 * If storage deletion fails, the error is surfaced rather than silently ignored.
 * If DB deletion fails after storage deletion, the state is logged for reconciliation.
 */
export async function deleteResaleListingImage(
  supabase: SupabaseClient<Database>,
  imageId: string
): Promise<void> {
  const sellerId = await requireAuth(supabase);
  assertValidUuid(imageId, "imageId");

  // Fetch the image record and verify ownership through the parent listing
  const { data: imageRow, error: fetchError } = await supabase
    .from("resale_listing_images")
    .select("id, listing_id, storage_path")
    .eq("id", imageId)
    .single();

  if (fetchError || !imageRow) {
    throw new ResaleServiceError("NOT_FOUND", "Image not found.");
  }

  // Verify ownership of the parent listing
  await requireListingOwnership(supabase, imageRow.listing_id, sellerId);

  // Delete from storage first
  const { error: storageError } = await supabase.storage
    .from(BUCKET)
    .remove([imageRow.storage_path]);

  if (storageError) {
    console.error("[resale] deleteResaleListingImage storage error:", storageError);
    throw new ResaleServiceError(
      "STORAGE_ERROR",
      "Failed to delete image from storage. Please try again.",
      storageError
    );
  }

  // Delete the DB record
  const { error: dbError } = await supabase
    .from("resale_listing_images")
    .delete()
    .eq("id", imageId);

  if (dbError) {
    // Storage object deleted but DB row remains — log for reconciliation
    console.error(
      "[resale] deleteResaleListingImage DB delete failed after storage delete. " +
        "Orphaned DB record:",
      imageId,
      dbError
    );
    throw new ResaleServiceError(
      "DATABASE_ERROR",
      "Image was removed from storage but the database record could not be deleted.",
      dbError
    );
  }
}

/**
 * Deletes ALL images for a listing (storage objects + DB records).
 *
 * This should be called BEFORE deleteResaleListing() to prevent orphaned
 * storage objects (DB ON DELETE CASCADE handles the DB rows but not storage).
 *
 * Ownership is verified once at the start, then storage paths are batch-removed.
 */
export async function deleteAllListingImages(
  supabase: SupabaseClient<Database>,
  listingId: string
): Promise<void> {
  const sellerId = await requireAuth(supabase);
  assertValidUuid(listingId, "listingId");

  // Verify ownership
  await requireListingOwnership(supabase, listingId, sellerId);

  // Fetch all image records for the listing
  const { data: images, error: fetchError } = await supabase
    .from("resale_listing_images")
    .select("id, storage_path")
    .eq("listing_id", listingId);

  if (fetchError) {
    console.error("[resale] deleteAllListingImages fetch error:", fetchError);
    throw new ResaleServiceError(
      "DATABASE_ERROR",
      "Failed to fetch listing images.",
      fetchError
    );
  }

  if (!images || images.length === 0) {
    return; // Nothing to delete
  }

  const storagePaths = images.map((img) => img.storage_path);

  // Batch remove from storage
  const { error: storageError } = await supabase.storage
    .from(BUCKET)
    .remove(storagePaths);

  if (storageError) {
    console.error("[resale] deleteAllListingImages storage error:", storageError);
    throw new ResaleServiceError(
      "STORAGE_ERROR",
      "Failed to remove listing images from storage.",
      storageError
    );
  }

  // DB rows are cleaned up by ON DELETE CASCADE when the listing is deleted,
  // but we explicitly delete them here for clarity and to avoid relying solely
  // on implicit cascade ordering.
  const { error: dbError } = await supabase
    .from("resale_listing_images")
    .delete()
    .eq("listing_id", listingId);

  if (dbError) {
    console.error("[resale] deleteAllListingImages DB error:", dbError);
    throw new ResaleServiceError(
      "DATABASE_ERROR",
      "Images removed from storage but database records could not be cleaned up.",
      dbError
    );
  }
}

// ─── READ ─────────────────────────────────────────────────────────────────────

/**
 * Returns the image records for a given listing.
 * Respects RLS — only returns images for listings the current user can access.
 */
export async function getResaleListingImages(
  supabase: SupabaseClient<Database>,
  listingId: string
): Promise<ResaleListingImageRow[]> {
  assertValidUuid(listingId, "listingId");

  const { data, error } = await supabase
    .from("resale_listing_images")
    .select("id, listing_id, storage_path, display_order, created_at")
    .eq("listing_id", listingId)
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[resale] getResaleListingImages error:", error);
    throw new ResaleServiceError(
      "DATABASE_ERROR",
      "Failed to fetch listing images.",
      error
    );
  }

  return (data ?? []) as ResaleListingImageRow[];
}

// ─── SIGNED URLS ──────────────────────────────────────────────────────────────

/**
 * Generates a short-lived signed URL for a private storage object.
 *
 * The URL expires after SIGNED_URL_EXPIRY_SECONDS (1 hour).
 * Signed URLs must NOT be stored in the database.
 * The bucket remains private — this does not change bucket visibility.
 */
export async function getSignedImageUrl(
  supabase: SupabaseClient<Database>,
  storagePath: string
): Promise<string> {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(storagePath, SIGNED_URL_EXPIRY_SECONDS);

  if (error || !data?.signedUrl) {
    console.error("[resale] getSignedImageUrl error:", error);
    throw new ResaleServiceError(
      "STORAGE_ERROR",
      "Failed to generate image URL.",
      error
    );
  }

  return data.signedUrl;
}

/**
 * Generates signed URLs for all images of a listing in one call.
 * Returns an array of { imageId, storagePath, signedUrl } objects.
 *
 * Uses Supabase's batch createSignedUrls for efficiency.
 */
export async function getSignedImageUrls(
  supabase: SupabaseClient<Database>,
  images: Pick<ResaleListingImageRow, "id" | "storage_path">[]
): Promise<Array<{ imageId: string; storagePath: string; signedUrl: string }>> {
  if (images.length === 0) return [];

  const paths = images.map((img) => img.storage_path);

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrls(paths, SIGNED_URL_EXPIRY_SECONDS);

  if (error || !data) {
    console.error("[resale] getSignedImageUrls error:", error);
    throw new ResaleServiceError(
      "STORAGE_ERROR",
      "Failed to generate image URLs.",
      error
    );
  }

  // Map back to image IDs using the original order
  return images.map((img, i) => ({
    imageId: img.id,
    storagePath: img.storage_path,
    signedUrl: data[i]?.signedUrl ?? "",
  }));
}
