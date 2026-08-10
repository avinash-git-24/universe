-- ------------------------------------------------------------------------------
-- Phase X: Chat Upgrades - Image Sharing
-- ------------------------------------------------------------------------------

BEGIN;

-- 1. Add image_url to messages
ALTER TABLE public.messages
  ADD COLUMN IF NOT EXISTS image_url TEXT;

-- 2. Create Storage Bucket for chat images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'chat_images', 
  'chat_images', 
  false, 
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 3. Storage RLS Policies
-- Only conversation participants can access images in their conversation's folder.
-- Path format: [conversation_id]/[filename]

-- Allow authenticated users to upload to a folder if they are a participant
DROP POLICY IF EXISTS "Users can upload images to their conversations" ON storage.objects;
CREATE POLICY "Users can upload images to their conversations"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'chat_images' AND
    auth.role() = 'authenticated' AND
    public.is_conversation_participant((storage.foldername(name))[1]::uuid, auth.uid())
  );

-- Allow users to view images in their conversations
DROP POLICY IF EXISTS "Users can view images in their conversations" ON storage.objects;
CREATE POLICY "Users can view images in their conversations"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'chat_images' AND
    auth.role() = 'authenticated' AND
    public.is_conversation_participant((storage.foldername(name))[1]::uuid, auth.uid())
  );

-- Allow users to delete their own uploaded images (optional, good for cleanup if message deletes)
DROP POLICY IF EXISTS "Users can delete their own chat images" ON storage.objects;
CREATE POLICY "Users can delete their own chat images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'chat_images' AND
    auth.role() = 'authenticated' AND
    owner_id = auth.uid()::text
  );

COMMIT;
