-- ==============================================================================
-- UniVerse Resale — Phase 2H: Trust & Safety (Ratings & Reviews)
--
-- Creates the resale_reviews table to allow buyers and sellers to rate each
-- other after a listing is marked as "sold".
-- ==============================================================================

BEGIN;

-- ------------------------------------------------------------------------------
-- 1. Custom Types
-- ------------------------------------------------------------------------------
CREATE TYPE resale_review_role AS ENUM ('buyer', 'seller');

-- ------------------------------------------------------------------------------
-- 2. Create resale_reviews table
-- ------------------------------------------------------------------------------
CREATE TABLE public.resale_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID REFERENCES public.resale_listings(id) ON DELETE CASCADE NOT NULL,
    reviewer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    reviewee_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    role resale_review_role NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- A user can only leave one review per listing they participated in
    UNIQUE(listing_id, reviewer_id)
);

-- Index for quick lookups when calculating user ratings
CREATE INDEX idx_resale_reviews_reviewee ON public.resale_reviews(reviewee_id);
CREATE INDEX idx_resale_reviews_listing ON public.resale_reviews(listing_id);

-- ------------------------------------------------------------------------------
-- 3. RLS Policies
-- ------------------------------------------------------------------------------
ALTER TABLE public.resale_reviews ENABLE ROW LEVEL SECURITY;

-- 3A. READ: Only reviewer or reviewee can read their specific raw reviews
CREATE POLICY "Users can read reviews they are involved in"
  ON public.resale_reviews
  FOR SELECT
  USING (auth.uid() = reviewer_id OR auth.uid() = reviewee_id);

-- 3B. INSERT: Strict constraints on who can leave a review
-- Requirements:
-- 1. Reviewer is auth.uid()
-- 2. The listing must be 'sold'
-- 3. The reviewer and reviewee must be exactly the seller and the buyer with the accepted offer
CREATE POLICY "Users can insert a review if they participated in the sold listing"
  ON public.resale_reviews
  FOR INSERT
  WITH CHECK (
    reviewer_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.resale_listings l WHERE l.id = listing_id AND l.status = 'sold'
    )
    AND (
      -- Case 1: Reviewer is the Seller, Reviewee is the Buyer
      (
        role = 'seller'
        AND EXISTS (SELECT 1 FROM public.resale_listings l WHERE l.id = listing_id AND l.seller_id = reviewer_id)
        AND EXISTS (SELECT 1 FROM public.resale_offers o WHERE o.listing_id = listing_id AND o.status = 'accepted' AND o.buyer_id = reviewee_id)
      )
      OR
      -- Case 2: Reviewer is the Buyer, Reviewee is the Seller
      (
        role = 'buyer'
        AND EXISTS (SELECT 1 FROM public.resale_offers o WHERE o.listing_id = listing_id AND o.status = 'accepted' AND o.buyer_id = reviewer_id)
        AND EXISTS (SELECT 1 FROM public.resale_listings l WHERE l.id = listing_id AND l.seller_id = reviewee_id)
      )
    )
  );

-- No UPDATE or DELETE policies. Reviews are immutable from the client-side for V1 to prevent coercion.

-- ------------------------------------------------------------------------------
-- 4. RPC Functions for efficient aggregate rating fetching
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_user_rating(target_user_id UUID)
RETURNS TABLE (
    avg_rating NUMERIC,
    total_reviews BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(ROUND(AVG(rating)::NUMERIC, 1), 0.0) as avg_rating,
        COUNT(*) as total_reviews
    FROM public.resale_reviews
    WHERE reviewee_id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

COMMIT;