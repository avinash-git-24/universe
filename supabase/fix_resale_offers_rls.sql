-- ==============================================================================
-- UniVerse — Fix RLS Enabled No Policy for public.resale_offers
-- Run this script in your Supabase SQL Editor (Dashboard > SQL Editor)
-- ==============================================================================

BEGIN;

-- 1. Ensure RLS is enabled on public.resale_offers
ALTER TABLE IF EXISTS public.resale_offers ENABLE ROW LEVEL SECURITY;

-- 2. Drop any previous conflicting policies
DROP POLICY IF EXISTS "Users can read their own offers" ON public.resale_offers;
DROP POLICY IF EXISTS "Buyers can create offers" ON public.resale_offers;
DROP POLICY IF EXISTS "Users can update their offers" ON public.resale_offers;
DROP POLICY IF EXISTS "Buyers can delete their pending offers" ON public.resale_offers;
DROP POLICY IF EXISTS "resale_offers_select_policy" ON public.resale_offers;
DROP POLICY IF EXISTS "resale_offers_insert_policy" ON public.resale_offers;
DROP POLICY IF EXISTS "resale_offers_update_policy" ON public.resale_offers;
DROP POLICY IF EXISTS "resale_offers_delete_policy" ON public.resale_offers;

-- 3. Create clean, secure RLS policies for resale_offers

-- SELECT: Buyer, Seller, or Admin can read offers
CREATE POLICY "resale_offers_select_policy"
  ON public.resale_offers
  FOR SELECT
  TO authenticated
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id OR public.is_admin(auth.uid()));

-- INSERT: Buyer can create offer (cannot offer on own listing)
CREATE POLICY "resale_offers_insert_policy"
  ON public.resale_offers
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = buyer_id 
    AND auth.uid() != seller_id
    AND seller_id = (SELECT seller_id FROM public.resale_listings WHERE id = listing_id)
  );

-- UPDATE: Buyer can withdraw, Seller can accept/reject
CREATE POLICY "resale_offers_update_policy"
  ON public.resale_offers
  FOR UPDATE
  TO authenticated
  USING (
    (auth.uid() = buyer_id AND status = 'pending')
    OR
    (auth.uid() = seller_id AND status = 'pending')
    OR
    public.is_admin(auth.uid())
  )
  WITH CHECK (
    (auth.uid() = buyer_id AND status IN ('pending', 'withdrawn'))
    OR
    (auth.uid() = seller_id AND status IN ('pending', 'accepted', 'rejected', 'completed'))
    OR
    public.is_admin(auth.uid())
  );

-- DELETE: Buyer can delete pending offers or Admin
CREATE POLICY "resale_offers_delete_policy"
  ON public.resale_offers
  FOR DELETE
  TO authenticated
  USING (
    (auth.uid() = buyer_id AND status = 'pending')
    OR
    public.is_admin(auth.uid())
  );

COMMIT;
