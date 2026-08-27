-- ==============================================================================
-- Migration: Ensure chat_images storage bucket is public and accessible
-- ==============================================================================

BEGIN;

-- 1. Ensure chat_images bucket is public
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'chat_images', 
  'chat_images', 
  true, 
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

-- 2. Ensure public read access for chat_images
DROP POLICY IF EXISTS "Public read access on chat_images" ON storage.objects;
CREATE POLICY "Public read access on chat_images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'chat_images');

-- 3. Allow authenticated users to upload chat images
DROP POLICY IF EXISTS "Authenticated users can upload chat images" ON storage.objects;
CREATE POLICY "Authenticated users can upload chat images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'chat_images');

COMMIT;
