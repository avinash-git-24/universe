-- ==============================================================================
-- UniVerse — Fix RLS Policies for public.resale_offers (Schema-Aligned)
-- Run this script in your Supabase SQL Editor (Dashboard > SQL Editor)
-- ==============================================================================

BEGIN;

-- 1. Ensure RLS is enabled on public.resale_offers
ALTER TABLE IF EXISTS public.resale_offers ENABLE ROW LEVEL SECURITY;

-- 2. Drop any previous policies
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN 
    SELECT policyname 
    FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'resale_offers'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.resale_offers', pol.policyname);
  END LOOP;
END $$;

-- 3. SELECT: Buyer, Seller of the listing, or Admin can view offers
CREATE POLICY "resale_offers_select_policy"
  ON public.resale_offers
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = buyer_id 
    OR EXISTS (SELECT 1 FROM public.resale_listings WHERE id = listing_id AND seller_id = auth.uid())
    OR public.is_admin(auth.uid())
  );

-- 4. INSERT: Buyer can create an offer (only on listings they do not own)
CREATE POLICY "resale_offers_insert_policy"
  ON public.resale_offers
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = buyer_id 
    AND NOT EXISTS (SELECT 1 FROM public.resale_listings WHERE id = listing_id AND seller_id = auth.uid())
  );

-- 5. UPDATE: Buyer can withdraw pending offer; Seller of listing can accept/reject
CREATE POLICY "resale_offers_update_policy"
  ON public.resale_offers
  FOR UPDATE
  TO authenticated
  USING (
    (auth.uid() = buyer_id AND status = 'pending')
    OR EXISTS (SELECT 1 FROM public.resale_listings WHERE id = listing_id AND seller_id = auth.uid())
    OR public.is_admin(auth.uid())
  )
  WITH CHECK (
    (auth.uid() = buyer_id AND status IN ('pending', 'withdrawn'))
    OR EXISTS (SELECT 1 FROM public.resale_listings WHERE id = listing_id AND seller_id = auth.uid())
    OR public.is_admin(auth.uid())
  );

-- 6. DELETE: Buyer can delete pending offers or Admin
CREATE POLICY "resale_offers_delete_policy"
  ON public.resale_offers
  FOR DELETE
  TO authenticated
  USING (
    (auth.uid() = buyer_id AND status = 'pending')
    OR public.is_admin(auth.uid())
  );

COMMIT;
