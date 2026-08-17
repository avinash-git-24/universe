import { createClient } from "@/lib/supabase/client";

export type ResaleReviewRole = "buyer" | "seller";

export interface CreateReviewParams {
  listingId: string;
  revieweeId: string;
  role: ResaleReviewRole;
  rating: number;
  comment?: string;
}

export interface UserRatingStats {
  avg_rating: number;
  total_reviews: number;
}

export async function createReview(params: CreateReviewParams) {
  const supabase = createClient();
  const { data: user, error: authError } = await supabase.auth.getUser();

  if (authError || !user.user) {
    throw new Error("Authentication required to leave a review.");
  }

  const { data, error } = await supabase
    .from("resale_reviews")
    .insert([
      {
        listing_id: params.listingId,
        reviewer_id: user.user.id,
        reviewee_id: params.revieweeId,
        role: params.role,
        rating: params.rating,
        comment: params.comment || null,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Error creating review:", error);
    throw new Error(error.message);
  }

  return data;
}

export async function getUserRatingStats(userId: string): Promise<UserRatingStats | null> {
  const supabase = createClient();

  const { data, error } = await supabase.rpc("get_user_rating", {
    target_user_id: userId,
  });

  if (error) {
    console.error("Error fetching user rating stats:", error);
    return null;
  }

  // The RPC returns a single row if successful
  if (data && data.length > 0) {
    return {
      avg_rating: data[0].avg_rating,
      total_reviews: data[0].total_reviews,
    };
  }

  return { avg_rating: 0, total_reviews: 0 };
}

export async function hasUserReviewed(listingId: string, reviewerId: string): Promise<boolean> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("resale_reviews")
    .select("id")
    .eq("listing_id", listingId)
    .eq("reviewer_id", reviewerId)
    .single();

  if (error && error.code !== "PGRST116") { // PGRST116 is no rows returned
    console.error("Error checking review status:", error);
    return false;
  }

  return !!data;
}
