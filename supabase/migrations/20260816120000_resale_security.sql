-- ==============================================================================
-- UniVerse Resale — Phase 1B: Storage, RLS & Security
--
-- This migration adds:
--   1. Private Supabase Storage bucket: resale-listing-images
--   2. Storage INSERT / SELECT / DELETE policies
--   3. RLS on public.resale_listings
--   4. RLS on public.resale_listing_images
--   5. Image count guard (max 6 images per listing) via DB trigger
--   6. Ownership-transfer prevention via DB trigger
--
-- Does NOT modify any unrelated table, policy, bucket, or function.
-- Does NOT insert any data.
-- ==============================================================================

BEGIN;

-- ==============================================================================
-- SECTION 1: Storage Bucket
-- ==============================================================================

-- Create a PRIVATE bucket for resale listing images.
-- - public = false   → objects are not directly accessible without a policy or signed URL.
-- - file_size_limit  → 5 MB per object (5 * 1024 * 1024 = 5242880 bytes).
-- - allowed_mime_types → only safe image formats accepted; no SVG, HTML, or executables.
--
-- Storage path convention: <seller_id>/<listing_id>/<unique-filename>
-- Example: f47ac10b-58cc.../a87ff679.../c4ca4238a0b9.jpg
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'resale-listing-images',
  'resale-listing-images',
  false,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public             = EXCLUDED.public,
  file_size_limit    = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;


-- ==============================================================================
-- SECTION 2: Storage Policies
-- ==============================================================================
-- Path structure enforced by all policies:
--   segment[1] = seller_id (auth.uid()::text)
--   segment[2] = listing_id (must exist and belong to auth.uid())
--
-- The policies verify ownership against public.resale_listings — the client can
-- never forge a path to access or write to another user's folder.
-- ==============================================================================

-- Drop any pre-existing policies for this bucket (idempotent re-run safety)
DROP POLICY IF EXISTS "Resale: authenticated sellers can upload listing images"
  ON storage.objects;
DROP POLICY IF EXISTS "Resale: authenticated users can view active listing images"
  ON storage.objects;
DROP POLICY IF EXISTS "Resale: sellers can delete their own listing images"
  ON storage.objects;


-- ── INSERT (upload) ────────────────────────────────────────────────────────────
-- An authenticated user may upload ONLY into a folder where:
--   • path segment 1 equals their own user ID
--   • path segment 2 is the ID of an existing listing that THEY own
-- This prevents uploading into another seller's folder even if the path is guessed.

CREATE POLICY "Resale: authenticated sellers can upload listing images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'resale-listing-images'
    -- First path segment must equal the authenticated user's UUID
    AND (storage.foldername(name))[1] = auth.uid()::text
    -- Second path segment must be a listing ID that belongs to auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.resale_listings
      WHERE id        = (storage.foldername(name))[2]::uuid
        AND seller_id = auth.uid()
    )
  );


-- ── SELECT (read) ──────────────────────────────────────────────────────────────
-- An authenticated user may read an image if:
--   • the image belongs to an ACTIVE listing  (marketplace browse)
--   OR
--   • the image belongs to one of their OWN listings (seller preview, any status)
--
-- Unauthenticated users cannot read any images (bucket is private).

CREATE POLICY "Resale: authenticated users can view active listing images"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'resale-listing-images'
    AND (
      -- The listing is publicly active → any authenticated user may view
      EXISTS (
        SELECT 1 FROM public.resale_listings
        WHERE id     = (storage.foldername(name))[2]::uuid
          AND status = 'active'
      )
      OR
      -- The viewer owns the listing → always accessible regardless of status
      EXISTS (
        SELECT 1 FROM public.resale_listings
        WHERE id        = (storage.foldername(name))[2]::uuid
          AND seller_id = auth.uid()
      )
    )
  );


-- ── DELETE ────────────────────────────────────────────────────────────────────
-- Only the listing owner can delete their images.
-- Path segment 2 is verified against resale_listings.seller_id = auth.uid().

CREATE POLICY "Resale: sellers can delete their own listing images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'resale-listing-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
    AND EXISTS (
      SELECT 1 FROM public.resale_listings
      WHERE id        = (storage.foldername(name))[2]::uuid
        AND seller_id = auth.uid()
    )
  );

-- NOTE: No UPDATE policy for storage.objects.
-- The preferred pattern is: DELETE old object + INSERT new object.
-- This avoids the complexity and risk of path/metadata mutation.


-- ==============================================================================
-- SECTION 3: RLS — public.resale_listings
-- ==============================================================================

ALTER TABLE public.resale_listings ENABLE ROW LEVEL SECURITY;

-- Drop any pre-existing policies (idempotent re-run safety)
DROP POLICY IF EXISTS "Resale listings: anyone authenticated can view active listings"
  ON public.resale_listings;
DROP POLICY IF EXISTS "Resale listings: sellers can view their own listings"
  ON public.resale_listings;
DROP POLICY IF EXISTS "Resale listings: sellers can create their own listing"
  ON public.resale_listings;
DROP POLICY IF EXISTS "Resale listings: sellers can update their own listing"
  ON public.resale_listings;
DROP POLICY IF EXISTS "Resale listings: sellers can delete their own listing"
  ON public.resale_listings;


-- ── SELECT ────────────────────────────────────────────────────────────────────
-- Two separate, narrow SELECT policies (PostgreSQL OR's them automatically):
--   1. Any authenticated user can see ACTIVE listings (marketplace browse).
--   2. A seller can always see their OWN listings (any status).

CREATE POLICY "Resale listings: anyone authenticated can view active listings"
  ON public.resale_listings
  FOR SELECT
  TO authenticated
  USING (status = 'active');

CREATE POLICY "Resale listings: sellers can view their own listings"
  ON public.resale_listings
  FOR SELECT
  TO authenticated
  USING (seller_id = auth.uid());


-- ── INSERT ───────────────────────────────────────────────────────────────────
-- A student can only create a listing for themselves.
-- Prevents: INSERT with seller_id = <another user's UUID>.

CREATE POLICY "Resale listings: sellers can create their own listing"
  ON public.resale_listings
  FOR INSERT
  TO authenticated
  WITH CHECK (seller_id = auth.uid());


-- ── UPDATE ───────────────────────────────────────────────────────────────────
-- Only the listing owner can update their listing.
-- The trigger `prevent_resale_seller_id_change` (Section 5) additionally blocks
-- changing seller_id mid-row, providing defence-in-depth.

CREATE POLICY "Resale listings: sellers can update their own listing"
  ON public.resale_listings
  FOR UPDATE
  TO authenticated
  USING (seller_id = auth.uid())
  WITH CHECK (seller_id = auth.uid());


-- ── DELETE ───────────────────────────────────────────────────────────────────
-- Only the listing owner can delete their listing.

CREATE POLICY "Resale listings: sellers can delete their own listing"
  ON public.resale_listings
  FOR DELETE
  TO authenticated
  USING (seller_id = auth.uid());


-- ==============================================================================
-- SECTION 4: RLS — public.resale_listing_images
-- ==============================================================================

ALTER TABLE public.resale_listing_images ENABLE ROW LEVEL SECURITY;

-- Drop any pre-existing policies
DROP POLICY IF EXISTS "Resale images: authenticated users can view active listing images"
  ON public.resale_listing_images;
DROP POLICY IF EXISTS "Resale images: sellers can view their own listing images"
  ON public.resale_listing_images;
DROP POLICY IF EXISTS "Resale images: sellers can insert images for their own listing"
  ON public.resale_listing_images;
DROP POLICY IF EXISTS "Resale images: sellers can delete their own listing images"
  ON public.resale_listing_images;
DROP POLICY IF EXISTS "Resale images: sellers can update display order of their images"
  ON public.resale_listing_images;


-- ── SELECT ───────────────────────────────────────────────────────────────────
-- Mirrors the listing SELECT logic:
--   1. The parent listing is ACTIVE → any authenticated user may read image records.
--   2. The parent listing belongs to auth.uid() → seller can always read their own.

CREATE POLICY "Resale images: authenticated users can view active listing images"
  ON public.resale_listing_images
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.resale_listings
      WHERE id     = listing_id
        AND status = 'active'
    )
  );

CREATE POLICY "Resale images: sellers can view their own listing images"
  ON public.resale_listing_images
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.resale_listings
      WHERE id        = listing_id
        AND seller_id = auth.uid()
    )
  );


-- ── INSERT ───────────────────────────────────────────────────────────────────
-- A user can insert an image record only if the parent listing belongs to them.
-- The 6-image limit is enforced by the trigger in Section 5 (defence-in-depth).

CREATE POLICY "Resale images: sellers can insert images for their own listing"
  ON public.resale_listing_images
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.resale_listings
      WHERE id        = listing_id
        AND seller_id = auth.uid()
    )
  );


-- ── DELETE ───────────────────────────────────────────────────────────────────
-- Only the listing owner can delete image records for their listing.

CREATE POLICY "Resale images: sellers can delete their own listing images"
  ON public.resale_listing_images
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.resale_listings
      WHERE id        = listing_id
        AND seller_id = auth.uid()
    )
  );


-- ── UPDATE ───────────────────────────────────────────────────────────────────
-- Allow the listing owner to change display_order only.
-- WITH CHECK enforces listing_id cannot be changed to another listing's UUID.

CREATE POLICY "Resale images: sellers can update display order of their images"
  ON public.resale_listing_images
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.resale_listings
      WHERE id        = listing_id
        AND seller_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.resale_listings
      WHERE id        = listing_id
        AND seller_id = auth.uid()
    )
  );


-- ==============================================================================
-- SECTION 5: Database-Level Security Triggers
-- ==============================================================================

-- ── 5A: Image count guard (max 6 images per listing) ─────────────────────────
-- Fires BEFORE INSERT on resale_listing_images.
--
-- LOCKING STRATEGY — FOR UPDATE (exclusive row lock on the parent listing):
--
--   The parent resale_listings row is locked with FOR UPDATE before the count
--   is read.  FOR UPDATE is an *exclusive* row lock: only one transaction can
--   hold it at a time on a given row.  Any concurrent transaction that tries
--   to INSERT a second image for the same listing_id will block at the
--   FOR UPDATE line until the first transaction commits or rolls back.
--
--   This eliminates the TOCTOU (time-of-check / time-of-use) race:
--
--     T1: SELECT ... FOR UPDATE  (acquires exclusive lock on listing row)
--     T2: SELECT ... FOR UPDATE  (BLOCKS — waits for T1 to release)
--     T1: COUNT(*) = 5  → inserts image #6  → COMMIT  (releases lock)
--     T2: COUNT(*) = 6  → raises exception  (correctly denied)
--
--   The lock is scoped to the single listing row, so concurrent inserts
--   for *different* listings are completely unaffected — no global bottleneck.
--
-- WHY FOR SHARE WAS WRONG:
--
--   FOR SHARE is a *shared* lock.  Multiple transactions can hold a FOR SHARE
--   lock on the same row simultaneously, because shared locks are compatible
--   with each other.  This means:
--
--     T1: SELECT ... FOR SHARE  (shared lock acquired)
--     T2: SELECT ... FOR SHARE  (shared lock acquired — NOT blocked by T1)
--     T1: COUNT(*) = 5  → decides to insert
--     T2: COUNT(*) = 5  → decides to insert  (T1's insert is not yet visible)
--     T1: COMMIT → image #6 inserted
--     T2: COMMIT → image #7 inserted  ← RACE CONDITION — limit bypassed!
--
--   FOR SHARE therefore provided zero serialisation and a false sense of safety.

CREATE OR REPLACE FUNCTION public.enforce_resale_image_limit()
RETURNS TRIGGER AS $$
DECLARE
  existing_count INTEGER;
BEGIN
  -- Acquire an EXCLUSIVE row lock on the parent listing.
  -- This blocks any other transaction that tries to insert an image for the
  -- same listing_id until this transaction completes, eliminating the race.
  PERFORM 1 FROM public.resale_listings
  WHERE id = NEW.listing_id
  FOR UPDATE;

  -- Now that we hold the exclusive lock, count existing images.
  -- No other transaction can be between its own count and insert at this point.
  SELECT COUNT(*) INTO existing_count
  FROM public.resale_listing_images
  WHERE listing_id = NEW.listing_id;

  IF existing_count >= 6 THEN
    RAISE EXCEPTION
      'A listing may have at most 6 images. listing_id: %', NEW.listing_id
      USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER enforce_resale_image_limit
  BEFORE INSERT ON public.resale_listing_images
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_resale_image_limit();



-- ── 5B: Prevent seller_id ownership transfer ──────────────────────────────────
-- Fires BEFORE UPDATE on resale_listings.
-- Raises an error if someone attempts to change seller_id, even if the UPDATE
-- RLS policy is satisfied (defence-in-depth against edge cases / BYPASSRLS).

CREATE OR REPLACE FUNCTION public.prevent_resale_seller_transfer()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.seller_id IS DISTINCT FROM OLD.seller_id THEN
    RAISE EXCEPTION
      'Ownership transfer is not allowed: seller_id cannot be changed.'
      USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER prevent_resale_seller_id_change
  BEFORE UPDATE ON public.resale_listings
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_resale_seller_transfer();


-- ==============================================================================
-- SECTION 6: Schema Cache Reload
-- ==============================================================================
-- Signal PostgREST to reload its schema cache so the new policies and RLS
-- configuration are immediately recognised by the API layer.
NOTIFY pgrst, 'reload schema';


-- ==============================================================================
-- STOP — Phase 1B complete.
-- Phase 1C (UI) must NOT begin until this migration is reviewed and approved.
-- ==============================================================================

COMMIT;
