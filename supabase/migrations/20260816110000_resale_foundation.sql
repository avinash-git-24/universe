-- ==============================================================================
-- UniVerse Resale — Phase 1A: Database Foundation
--
-- Creates the core tables for the UniVerse Resale marketplace:
--   1. resale_listings       — the main marketplace listing table
--   2. resale_listing_images — stores storage paths for listing images
--
-- Uses the existing public.profiles table for seller identity.
-- Reuses the existing public.handle_updated_at() trigger function.
-- No RLS policies, Storage buckets, or Storage policies (those are Phase 1B).
-- No fake/demo data inserted.
-- ==============================================================================

BEGIN;

-- ------------------------------------------------------------------------------
-- 1. resale_listings — Core marketplace listing table
-- ------------------------------------------------------------------------------
CREATE TABLE public.resale_listings (
  -- Primary key: auto-generated UUID, never supplied by frontend
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Seller: references the existing authenticated user profile
  -- ON DELETE CASCADE ensures listings are cleaned up if a user deletes their account
  seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- Listing title: required, non-empty, max 200 chars
  title TEXT NOT NULL,

  -- Listing description: optional, max 5000 chars
  description TEXT,

  -- Category: constrained to allowed values at database level
  category TEXT NOT NULL,

  -- Item condition: constrained to allowed values at database level
  condition TEXT NOT NULL,

  -- Sale price in INR: required, non-negative
  price NUMERIC(10, 2) NOT NULL,

  -- Original/MRP price: optional, non-negative when provided
  original_price NUMERIC(10, 2),

  -- Whether the seller accepts price negotiation
  negotiable BOOLEAN NOT NULL DEFAULT false,

  -- Pickup/meetup location on campus: optional, max 300 chars
  pickup_location TEXT,

  -- Listing status: active by default
  status TEXT NOT NULL DEFAULT 'active',

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- ── CHECK CONSTRAINTS ────────────────────────────────────────────────────────

  -- Title must not be blank and must not exceed 200 characters
  CONSTRAINT resale_listings_title_length
    CHECK (char_length(trim(title)) > 0 AND char_length(title) <= 200),

  -- Description max 5000 characters
  CONSTRAINT resale_listings_description_length
    CHECK (description IS NULL OR char_length(description) <= 5000),

  -- Pickup location max 300 characters
  CONSTRAINT resale_listings_pickup_location_length
    CHECK (pickup_location IS NULL OR char_length(pickup_location) <= 300),

  -- Price must be non-negative
  CONSTRAINT resale_listings_price_non_negative
    CHECK (price >= 0),

  -- Original price must be non-negative when provided
  CONSTRAINT resale_listings_original_price_non_negative
    CHECK (original_price IS NULL OR original_price >= 0),

  -- Category must be one of the approved values
  CONSTRAINT resale_listings_category_valid
    CHECK (category IN (
      'books',
      'electronics',
      'study_materials',
      'hostel',
      'sports',
      'furniture',
      'clothing',
      'gaming',
      'other'
    )),

  -- Condition must be one of the approved values
  CONSTRAINT resale_listings_condition_valid
    CHECK (condition IN (
      'new',
      'like_new',
      'good',
      'fair'
    )),

  -- Status must be one of the approved values
  CONSTRAINT resale_listings_status_valid
    CHECK (status IN (
      'active',
      'reserved',
      'sold',
      'removed'
    ))
);

-- Add a comment to document the table's purpose
COMMENT ON TABLE public.resale_listings IS
  'UniVerse Resale — Marketplace listings created by authenticated students.';

COMMENT ON COLUMN public.resale_listings.seller_id IS
  'References public.profiles(id). The authenticated user who created this listing.';

COMMENT ON COLUMN public.resale_listings.price IS
  'Sale price in INR. Must be >= 0.';

COMMENT ON COLUMN public.resale_listings.original_price IS
  'Original / MRP price in INR. NULL if not provided. Must be >= 0 when set.';

COMMENT ON COLUMN public.resale_listings.status IS
  'active | reserved | sold | removed. Defaults to active.';


-- ------------------------------------------------------------------------------
-- 2. resale_listing_images — Image storage paths for listings
-- ------------------------------------------------------------------------------
CREATE TABLE public.resale_listing_images (
  -- Primary key: auto-generated UUID
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Parent listing: required. Cascade delete so orphaned image records are cleaned up
  -- when the parent listing is deleted.
  listing_id UUID NOT NULL REFERENCES public.resale_listings(id) ON DELETE CASCADE,

  -- Path in Supabase Storage (e.g. "user-id/listing-id/filename.jpg")
  -- Binary image data is NEVER stored in the database.
  storage_path TEXT NOT NULL,

  -- Display order for the image carousel (0 = primary/cover image)
  display_order INTEGER NOT NULL DEFAULT 0,

  -- Timestamp
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Storage path must not be blank
  CONSTRAINT resale_listing_images_storage_path_nonempty
    CHECK (char_length(trim(storage_path)) > 0)
);

COMMENT ON TABLE public.resale_listing_images IS
  'UniVerse Resale — Storage paths for listing images. Up to 6 images per listing. Binary data is NOT stored here.';

COMMENT ON COLUMN public.resale_listing_images.storage_path IS
  'Supabase Storage object path, e.g. listings/{listing_id}/{filename}. No binary data stored.';

COMMENT ON COLUMN public.resale_listing_images.display_order IS
  '0 = primary/cover image. Used to order images in the listing carousel.';


-- ------------------------------------------------------------------------------
-- 3. Indexes for marketplace query patterns
-- ------------------------------------------------------------------------------

-- Browsing active listings (the most common query)
CREATE INDEX idx_resale_listings_status
  ON public.resale_listings(status);

-- Browsing/filtering by category
CREATE INDEX idx_resale_listings_category
  ON public.resale_listings(category);

-- Seller's own listings page
CREATE INDEX idx_resale_listings_seller_id
  ON public.resale_listings(seller_id);

-- Sorting by recency (latest listings first)
CREATE INDEX idx_resale_listings_created_at
  ON public.resale_listings(created_at DESC);

-- Sorting/filtering by price
CREATE INDEX idx_resale_listings_price
  ON public.resale_listings(price);

-- Composite index: the most common marketplace browse query
-- (status = 'active' + category filter + created_at sort)
CREATE INDEX idx_resale_listings_status_category_created
  ON public.resale_listings(status, category, created_at DESC);

-- Images: fast lookup of all images for a given listing
CREATE INDEX idx_resale_listing_images_listing_id
  ON public.resale_listing_images(listing_id);


-- ------------------------------------------------------------------------------
-- 4. updated_at trigger — reuses the existing handle_updated_at() function
--    defined in 20260803_init.sql
-- ------------------------------------------------------------------------------
CREATE TRIGGER on_resale_listings_updated
  BEFORE UPDATE ON public.resale_listings
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();


-- ------------------------------------------------------------------------------
-- Phase 1B (NOT IN THIS MIGRATION):
--   - Row Level Security policies for resale_listings
--   - Row Level Security policies for resale_listing_images
--   - Supabase Storage bucket for listing images
--   - Storage RLS policies
-- ------------------------------------------------------------------------------

COMMIT;
