-- ==============================================================================
-- UniVerse — Supabase Security Advisor Hardening Script
-- Resolves all 16 Security Warnings (Search Path, Function Exec, RLS, Storage Listing)
-- Run this script in your Supabase SQL Editor (Dashboard > SQL Editor)
-- ==============================================================================

BEGIN;

-- ==============================================================================
-- 1. FIX: Function Search Path Mutable
-- Set immutable search_path on all public schema functions to prevent search_path injection
-- ==============================================================================

DO $$
DECLARE
  func RECORD;
BEGIN
  FOR func IN 
    SELECT n.nspname, p.proname, pg_get_function_identity_arguments(p.oid) as args
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
  LOOP
    BEGIN
      EXECUTE format('ALTER FUNCTION %I.%I(%s) SET search_path = public, pg_temp', func.nspname, func.proname, func.args);
    EXCEPTION WHEN OTHERS THEN
      -- Ignore if already set or system locked
    END;
  END LOOP;
END $$;

-- Explicitly update update_updated_at_column if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
    ALTER FUNCTION public.update_updated_at_column() SET search_path = public, pg_temp;
  END IF;
END $$;

-- ==============================================================================
-- 2. FIX: Public & Anon Can Execute SECURITY DEFINER Functions
-- Revoke execution from PUBLIC and anon on all SECURITY DEFINER functions
-- ==============================================================================

DO $$
DECLARE
  func RECORD;
BEGIN
  FOR func IN 
    SELECT n.nspname, p.proname, pg_get_function_identity_arguments(p.oid) as args
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' AND p.prosecdef = true
  LOOP
    BEGIN
      EXECUTE format('REVOKE ALL ON FUNCTION %I.%I(%s) FROM PUBLIC, anon', func.nspname, func.proname, func.args);
    EXCEPTION WHEN OTHERS THEN
    END;
  END LOOP;
END $$;

-- ==============================================================================
-- 3. FIX: Signed-In Users Can Execute Internal RLS SECURITY DEFINER Functions
-- Revoke direct execution from authenticated on internal RLS helper functions
-- (Postgres RLS engine still executes them internally during query evaluation)
-- ==============================================================================

DO $$
BEGIN
  -- Internal RLS helper functions (only needed by RLS evaluation)
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'is_admin') THEN
    REVOKE EXECUTE ON FUNCTION public.is_admin(UUID) FROM PUBLIC, anon, authenticated;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'is_conversation_participant') THEN
    REVOKE EXECUTE ON FUNCTION public.is_conversation_participant(UUID, UUID) FROM PUBLIC, anon, authenticated;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'request_belongs_to') THEN
    REVOKE EXECUTE ON FUNCTION public.request_belongs_to(UUID, UUID) FROM PUBLIC, anon, authenticated;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'user_is_assigned_runner') THEN
    REVOKE EXECUTE ON FUNCTION public.user_is_assigned_runner(UUID, UUID) FROM PUBLIC, anon, authenticated;
  END IF;

  -- Client-callable RPC functions (Explicitly grant to authenticated & service_role)
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'create_delivery_conversation') THEN
    GRANT EXECUTE ON FUNCTION public.create_delivery_conversation TO authenticated, service_role;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'create_marketplace_conversation') THEN
    GRANT EXECUTE ON FUNCTION public.create_marketplace_conversation TO authenticated, service_role;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'checkout_resale_offer_with_delivery') THEN
    GRANT EXECUTE ON FUNCTION public.checkout_resale_offer_with_delivery TO authenticated, service_role;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'delete_own_account') THEN
    GRANT EXECUTE ON FUNCTION public.delete_own_account TO authenticated, service_role;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_user_rating') THEN
    GRANT EXECUTE ON FUNCTION public.get_user_rating TO authenticated, service_role;
  END IF;
END $$;

-- ==============================================================================
-- 4. FIX: RLS Policy Always True on public.conversations
-- Replace broad WITH CHECK (true) with explicit ownership verification
-- ==============================================================================

DROP POLICY IF EXISTS "Allow authenticated to insert conversations" ON public.conversations;
CREATE POLICY "Allow authenticated to insert conversations" ON public.conversations
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() IS NOT NULL AND 
    (buyer_id IS NULL OR buyer_id = auth.uid())
  );

-- ==============================================================================
-- 5. FIX: Public Bucket Allows Listing on Storage Buckets
-- Mark buckets as public for direct CDN URL downloads, but restrict broad storage.objects table listing
-- ==============================================================================

-- Ensure buckets exist and are public for direct image CDN access
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('avatars', 'avatars', true),
  ('chat_images', 'chat_images', true),
  ('resale-listing-images', 'resale-listing-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Drop all overly-broad SELECT policies that allow listing the entire storage.objects table
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Chat images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Resale listing images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read on avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read on chat_images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read on resale-listing-images" ON storage.objects;
DROP POLICY IF EXISTS "Public access to avatars" ON storage.objects;
DROP POLICY IF EXISTS "Public access to chat_images" ON storage.objects;
DROP POLICY IF EXISTS "Public access to resale images" ON storage.objects;
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for avatars" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for chat images" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for resale images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated to read storage objects" ON storage.objects;

-- Create safe storage SELECT policy for authenticated users
CREATE POLICY "Allow authenticated to read storage objects" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id IN ('avatars', 'chat_images', 'resale-listing-images'));

COMMIT;
