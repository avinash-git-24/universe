-- ==============================================================================
-- UniVerse Resale — Phase 2I: Marketplace Delivery Integration
--
-- Connects delivery_requests directly to resale_listings, allowing buyers
-- to request campus runners to deliver purchased items from sellers.
-- ==============================================================================

BEGIN;

-- ------------------------------------------------------------------------------
-- 1. Schema Modifications
-- ------------------------------------------------------------------------------

-- Add linked_listing_id to delivery_requests
ALTER TABLE public.delivery_requests 
ADD COLUMN linked_listing_id UUID REFERENCES public.resale_listings(id) ON DELETE CASCADE;

-- Ensure a listing can only have ONE active/historical delivery request
CREATE UNIQUE INDEX idx_delivery_requests_linked_listing 
ON public.delivery_requests(linked_listing_id) 
WHERE linked_listing_id IS NOT NULL;

-- ------------------------------------------------------------------------------
-- 2. State-Machine Automation (Triggers)
-- ------------------------------------------------------------------------------

-- When a delivery request is marked 'delivered', automatically mark the 
-- linked listing as 'sold' to complete the marketplace transaction.
CREATE OR REPLACE FUNCTION handle_resale_delivery_completed()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'delivered' AND OLD.status != 'delivered' AND NEW.linked_listing_id IS NOT NULL THEN
    UPDATE public.resale_listings
    SET status = 'sold', updated_at = now()
    WHERE id = NEW.linked_listing_id 
      AND status = 'reserved'; -- Ensure we only transition from reserved
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_resale_delivery_completed
  AFTER UPDATE OF status ON public.delivery_requests
  FOR EACH ROW
  EXECUTE FUNCTION handle_resale_delivery_completed();


-- ------------------------------------------------------------------------------
-- 3. Row Level Security (RLS) Extensions for delivery_requests
-- ------------------------------------------------------------------------------

-- Currently, delivery_requests has policies for:
-- "Users can view their own requests"
-- "Users can insert their own requests"
-- We need to restrict INSERT when linked_listing_id is provided, to ensure
-- only the verified buyer of an accepted offer can request delivery.

-- Wait, if we redefine the INSERT policy, we might break existing ones.
-- The existing policy in init.sql: 
-- CREATE POLICY "Users can insert their own requests" ON public.delivery_requests FOR INSERT WITH CHECK (auth.uid() = requester_id);
-- We should DROP it and recreate it with the strict check for linked_listing_id.

DROP POLICY IF EXISTS "Users can insert their own requests" ON public.delivery_requests;

CREATE POLICY "Users can insert their own requests" 
  ON public.delivery_requests
  FOR INSERT 
  WITH CHECK (
    auth.uid() = requester_id
    AND (
      linked_listing_id IS NULL
      OR
      (
        -- Must be the buyer of an accepted offer for this listing
        EXISTS (
          SELECT 1 FROM public.resale_offers
          WHERE listing_id = linked_listing_id
            AND buyer_id = auth.uid()
            AND status = 'accepted'
        )
        -- The listing must be 'reserved' (not already sold)
        AND EXISTS (
          SELECT 1 FROM public.resale_listings
          WHERE id = linked_listing_id
            AND status = 'reserved'
        )
      )
    )
  );

-- Select policy: Allow the Seller of the item to view the delivery request to track the runner.
-- Existing policies cover requester and runner. We just add one for the seller.
CREATE POLICY "Sellers can view delivery requests for their listings"
  ON public.delivery_requests
  FOR SELECT
  TO authenticated
  USING (
    linked_listing_id IS NOT NULL 
    AND EXISTS (
      SELECT 1 FROM public.resale_listings
      WHERE id = linked_listing_id
        AND seller_id = auth.uid()
    )
  );

COMMIT;
