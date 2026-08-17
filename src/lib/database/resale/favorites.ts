import type { SupabaseClient } from "@supabase/supabase-js";
import { ResaleServiceError } from "./index";
import type { ResaleListingWithImages } from "./index";

/**
 * Toggles a listing's favorite status for the current user.
 * Automatically inserts or deletes based on whether it already exists.
 * Requires an authenticated user.
 */
export async function toggleFavorite(
  supabase: SupabaseClient,
  listingId: string
): Promise<{ isFavorited: boolean }> {
  // Check auth
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new ResaleServiceError(
      "UNAUTHENTICATED",
      "User must be signed in to favorite a listing."
    );
  }

  // Check if it already exists
  const { data: existing, error: fetchError } = await supabase
    .from("resale_favorites")
    .select("id")
    .eq("listing_id", listingId)
    .eq("user_id", user.id)
    .single();

  if (fetchError && fetchError.code !== "PGRST116") {
    throw new ResaleServiceError("DATABASE_ERROR", fetchError.message);
  }

  if (existing) {
    // Delete it
    const { error: deleteError } = await supabase
      .from("resale_favorites")
      .delete()
      .eq("id", existing.id);

    if (deleteError) {
      throw new ResaleServiceError("DATABASE_ERROR", deleteError.message);
    }
    return { isFavorited: false };
  } else {
    // Insert it
    const { error: insertError } = await supabase
      .from("resale_favorites")
      .insert({ listing_id: listingId, user_id: user.id });

    if (insertError) {
      // Handle unique constraint violation gracefully in case of race condition
      if (insertError.code === "23505") {
        return { isFavorited: true };
      }
      throw new ResaleServiceError("DATABASE_ERROR", insertError.message);
    }
    return { isFavorited: true };
  }
}

/**
 * Returns a Set of listing IDs favorited by the current authenticated user.
 */
export async function getUserFavoriteIds(
  supabase: SupabaseClient
): Promise<Set<string>> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new Set();
  }

  const { data, error } = await supabase
    .from("resale_favorites")
    .select("listing_id")
    .eq("user_id", user.id);

  if (error) {
    throw new ResaleServiceError("DATABASE_ERROR", error.message);
  }

  return new Set(data.map((row: { listing_id: string }) => row.listing_id));
}

/**
 * Returns the active saved listings for the current user.
 */
export async function getSavedListings(
  supabase: SupabaseClient
): Promise<ResaleListingWithImages[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new ResaleServiceError(
      "UNAUTHENTICATED",
      "User must be signed in to view saved listings."
    );
  }

  // We only fetch listings where status = 'active'
  const { data, error } = await supabase
    .from("resale_listings")
    .select(`
      *,
      images:resale_listing_images(id, storage_path, display_order),
      favorites:resale_favorites!inner(id, created_at)
    `)
    .eq("status", "active")
    .eq("resale_favorites.user_id", user.id);

  if (error) {
    throw new ResaleServiceError("DATABASE_ERROR", error.message);
  }

  // Sort by favorite created_at descending (newest favorites first)
  const sortedData = (data || []).sort(
    (
      a: { favorites: { created_at: string }[] },
      b: { favorites: { created_at: string }[] }
    ) => {
      const timeA = new Date(a.favorites[0]?.created_at || 0).getTime();
      const timeB = new Date(b.favorites[0]?.created_at || 0).getTime();
      return timeB - timeA;
    }
  );

  // Map and sort images
  return sortedData.map(
    (listing: { favorites: unknown; images: { display_order: number }[]; [key: string]: unknown }) => {
      // remove the joined favorites array so it matches the expected return type
      const { favorites: _favorites, ...rest } = listing;
      return {
        ...rest,
        images: Array.isArray(listing.images)
          ? listing.images.sort(
              (a: { display_order: number }, b: { display_order: number }) =>
                a.display_order - b.display_order
            )
          : [],
      };
    }
  ) as ResaleListingWithImages[];
}
