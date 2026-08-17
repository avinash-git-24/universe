-- ==============================================================================
-- UniVerse Resale — Phase 2G: Offers & Transactions
--
-- Creates the resale_offers table to formally track negotiations.
-- Adds message_type and metadata to the messages table for rich chat UI.
-- ==============================================================================

BEGIN;

-- ------------------------------------------------------------------------------
-- 1. Modify public.messages to support rich "Offer" cards in Chat
-- ------------------------------------------------------------------------------

ALTER TABLE public.messages ADD COLUMN message_type TEXT NOT NULL DEFAULT 'text';
ALTER TABLE public.messages ADD COLUMN metadata JSONB;

-- ------------------------------------------------------------------------------
-- 2. Create resale_offers table
-- ------------------------------------------------------------------------------

CREATE TABLE public.resale_offers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID NOT NULL REFERENCES public.resale_listings(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  offer_price NUMERIC(10, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT resale_offers_price_positive CHECK (offer_price > 0),
  CONSTRAINT resale_offers_status_check CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn', 'completed'))
);

-- Buyers can only have one pending offer per listing at a time
CREATE UNIQUE INDEX idx_resale_offers_buyer_pending 
ON public.resale_offers(buyer_id, listing_id) 
WHERE status = 'pending';

-- Fast lookups
CREATE INDEX idx_resale_offers_listing_id ON public.resale_offers(listing_id);
CREATE INDEX idx_resale_offers_buyer_id ON public.resale_offers(buyer_id);
CREATE INDEX idx_resale_offers_seller_id ON public.resale_offers(seller_id);

-- Attach the updated_at trigger
CREATE TRIGGER on_resale_offers_updated
  BEFORE UPDATE ON public.resale_offers
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ------------------------------------------------------------------------------
-- 3. Row Level Security for resale_offers
-- ------------------------------------------------------------------------------

ALTER TABLE public.resale_offers ENABLE ROW LEVEL SECURITY;

-- Select: Buyers and Sellers can read their own offers
CREATE POLICY "Users can read their own offers"
  ON public.resale_offers
  FOR SELECT
  TO authenticated
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- Insert: Buyers can insert offers where they are the buyer. They cannot offer on their own listing.
-- Enforce that the seller_id matches the actual owner of the listing_id.
CREATE POLICY "Buyers can create offers"
  ON public.resale_offers
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = buyer_id 
    AND auth.uid() != seller_id
    AND seller_id = (SELECT seller_id FROM public.resale_listings WHERE id = listing_id)
  );

-- Update: Buyers can withdraw, Sellers can accept/reject
CREATE POLICY "Users can update their offers"
  ON public.resale_offers
  FOR UPDATE
  TO authenticated
  USING (
    -- Buyers can update if they are withdrawing their own offer
    (auth.uid() = buyer_id AND status = 'pending')
    OR
    -- Sellers can update if they are accepting/rejecting an offer
    (auth.uid() = seller_id AND status = 'pending')
  );

-- Delete: Allow deletions for cleanup (e.g. by buyer if pending)
CREATE POLICY "Buyers can delete their pending offers"
  ON public.resale_offers
  FOR DELETE
  TO authenticated
  USING (auth.uid() = buyer_id AND status = 'pending');

-- ------------------------------------------------------------------------------
-- 4. Database Trigger for auto-reserving
-- ------------------------------------------------------------------------------
-- When a seller accepts an offer, automatically set the listing to 'reserved' 
-- and mark all other 'pending' offers for that listing as 'rejected'.

CREATE OR REPLACE FUNCTION handle_offer_accepted()
RETURNS TRIGGER AS $$
DECLARE
  current_listing_status TEXT;
BEGIN
  IF NEW.status = 'accepted' AND OLD.status = 'pending' THEN
    
    -- Verify the listing is currently 'active' before reserving
    SELECT status INTO current_listing_status
    FROM public.resale_listings
    WHERE id = NEW.listing_id;
    
    IF current_listing_status = 'active' THEN
      -- 1. Reserve the listing
      UPDATE public.resale_listings
      SET status = 'reserved', updated_at = now()
      WHERE id = NEW.listing_id;
      
      -- 2. Reject all other pending offers for this listing
      UPDATE public.resale_offers
      SET status = 'rejected', updated_at = now()
      WHERE listing_id = NEW.listing_id 
        AND id != NEW.id 
        AND status = 'pending';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_offer_accepted
  AFTER UPDATE OF status ON public.resale_offers
  FOR EACH ROW
  EXECUTE FUNCTION handle_offer_accepted();

COMMIT;
