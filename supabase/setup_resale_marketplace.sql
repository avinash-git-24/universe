-- ==============================================================================
-- UniVerse — Resale Marketplace Complete Database Setup
-- Run this script in your Supabase Cloud SQL Editor (Dashboard > SQL Editor)
-- ==============================================================================

BEGIN;

-- 1. Create resale_listings table
CREATE TABLE IF NOT EXISTS public.resale_listings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  condition TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  original_price NUMERIC(10, 2),
  negotiable BOOLEAN NOT NULL DEFAULT false,
  pickup_location TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Create resale_listing_images table
CREATE TABLE IF NOT EXISTS public.resale_listing_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID NOT NULL REFERENCES public.resale_listings(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Create resale_favorites table
CREATE TABLE IF NOT EXISTS public.resale_favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES public.resale_listings(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, listing_id)
);

-- 4. Create resale_offers table
CREATE TABLE IF NOT EXISTS public.resale_offers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID NOT NULL REFERENCES public.resale_listings(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  offer_amount NUMERIC(10, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Enable RLS on all tables
ALTER TABLE public.resale_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resale_listing_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resale_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resale_offers ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies for resale_listings
DROP POLICY IF EXISTS "Public can view active listings" ON public.resale_listings;
CREATE POLICY "Public can view active listings"
  ON public.resale_listings FOR SELECT
  USING (status = 'active' OR auth.uid() = seller_id);

DROP POLICY IF EXISTS "Users can insert their own listings" ON public.resale_listings;
CREATE POLICY "Users can insert their own listings"
  ON public.resale_listings FOR INSERT
  WITH CHECK (auth.uid() = seller_id);

DROP POLICY IF EXISTS "Users can update their own listings" ON public.resale_listings;
CREATE POLICY "Users can update their own listings"
  ON public.resale_listings FOR UPDATE
  USING (auth.uid() = seller_id);

DROP POLICY IF EXISTS "Users can delete their own listings" ON public.resale_listings;
CREATE POLICY "Users can delete their own listings"
  ON public.resale_listings FOR DELETE
  USING (auth.uid() = seller_id);

-- 7. RLS Policies for resale_listing_images
DROP POLICY IF EXISTS "Public can view images for active listings" ON public.resale_listing_images;
CREATE POLICY "Public can view images for active listings"
  ON public.resale_listing_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.resale_listings
      WHERE id = resale_listing_images.listing_id
        AND (status = 'active' OR seller_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Sellers can manage their listing images" ON public.resale_listing_images;
CREATE POLICY "Sellers can manage their listing images"
  ON public.resale_listing_images FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.resale_listings
      WHERE id = resale_listing_images.listing_id
        AND seller_id = auth.uid()
    )
  );

-- 8. RLS Policies for resale_favorites
DROP POLICY IF EXISTS "Users can manage their favorites" ON public.resale_favorites;
CREATE POLICY "Users can manage their favorites"
  ON public.resale_favorites FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 9. Create Storage bucket for listing images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'resale-listing-images',
  'resale-listing-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 10. Storage policies
DROP POLICY IF EXISTS "Authenticated users can upload resale images" ON storage.objects;
CREATE POLICY "Authenticated users can upload resale images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'resale-listing-images');

DROP POLICY IF EXISTS "Anyone can view resale images" ON storage.objects;
CREATE POLICY "Anyone can view resale images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'resale-listing-images');

COMMIT;
