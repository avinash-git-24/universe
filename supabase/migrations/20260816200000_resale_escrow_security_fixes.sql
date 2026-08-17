-- ==============================================================================
-- UniVerse Resale — Phase 2J: Escrow Security & Refund Fixes
--
-- 1. Client Price Spoofing Prevention
-- 2. Buyer Authorization Enforcement
-- 3. Escrow Refund on Cancellation
-- 4. SECURITY DEFINER Hardening (search_path)
-- ==============================================================================

BEGIN;

-- ------------------------------------------------------------------------------
-- 1. Secure Checkout RPC
-- ------------------------------------------------------------------------------

-- Drop the old signature
DROP FUNCTION IF EXISTS public.checkout_resale_offer_with_delivery(UUID, UUID, TEXT, TEXT, NUMERIC, NUMERIC);

-- Create new signature that calculates financials server-side and enforces auth
CREATE OR REPLACE FUNCTION public.checkout_resale_offer_with_delivery(
  p_offer_id UUID,
  p_dropoff_location TEXT,
  p_pickup_location TEXT
)
RETURNS UUID
SET search_path = ''
AS $$
DECLARE
  v_buyer_id UUID;
  v_wallet_id UUID;
  v_current_balance NUMERIC;
  v_total_cost NUMERIC;
  v_listing_id UUID;
  v_item_price NUMERIC;
  v_delivery_fee NUMERIC := 20.00; -- Authoritative trusted delivery fee
  v_delivery_request_id UUID;
  v_listing_status TEXT;
BEGIN
  -- Derive authoritative buyer from auth context
  v_buyer_id := auth.uid();
  IF v_buyer_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- 1. Validate Offer and resolve authoritative price
  SELECT listing_id, offer_price INTO v_listing_id, v_item_price
  FROM public.resale_offers
  WHERE id = p_offer_id AND buyer_id = v_buyer_id AND status = 'accepted';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Offer not found, not accepted, or does not belong to the authenticated user.';
  END IF;

  -- 2. Validate Listing Status (Atomicity and race condition protection)
  SELECT status INTO v_listing_status
  FROM public.resale_listings
  WHERE id = v_listing_id
  FOR UPDATE;

  IF v_listing_status != 'reserved' THEN
    RAISE EXCEPTION 'Checkout failed: Listing is no longer reserved.';
  END IF;

  -- 3. Lock and get wallet
  v_total_cost := v_item_price + v_delivery_fee;
  
  SELECT id, balance INTO v_wallet_id, v_current_balance
  FROM public.wallets
  WHERE profile_id = v_buyer_id
  FOR UPDATE; -- Row-level lock to prevent double-spending

  IF v_current_balance < v_total_cost THEN
    RAISE EXCEPTION 'Insufficient wallet balance. Please add funds.';
  END IF;

  -- 4. Deduct funds from Wallet
  UPDATE public.wallets
  SET balance = balance - v_total_cost
  WHERE id = v_wallet_id;

  -- 5. Record Transaction
  INSERT INTO public.transactions (wallet_id, amount, type, status, description)
  VALUES (v_wallet_id, -v_total_cost, 'payment', 'completed', 'Escrow for Resale Purchase & Delivery');

  -- 6. Create Escrow Hold
  INSERT INTO public.escrow_holds (buyer_id, wallet_id, target_listing_id, item_price, delivery_fee, status)
  VALUES (v_buyer_id, v_wallet_id, v_listing_id, v_item_price, v_delivery_fee, 'held');

  -- 7. Create Delivery Request
  INSERT INTO public.delivery_requests (requester_id, dropoff_location, pickup_location, delivery_fee, status, linked_listing_id)
  VALUES (v_buyer_id, p_dropoff_location, p_pickup_location, v_delivery_fee, 'pending', v_listing_id)
  RETURNING id INTO v_delivery_request_id;

  RETURN v_delivery_request_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ------------------------------------------------------------------------------
-- 2. Release & Refund Escrow on Delivery Completion/Cancellation
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.release_escrow_on_delivery()
RETURNS TRIGGER
SET search_path = ''
AS $$
DECLARE
  v_escrow_id UUID;
  v_item_price NUMERIC;
  v_delivery_fee NUMERIC;
  v_buyer_id UUID;
  v_buyer_wallet_id UUID;
  v_seller_id UUID;
  v_seller_wallet_id UUID;
  v_runner_id UUID;
  v_runner_wallet_id UUID;
  v_total_refund NUMERIC;
BEGIN
  -- Ensure it's a resale delivery
  IF NEW.linked_listing_id IS NOT NULL THEN
    
    -- SCENARIO A: DELIVERY COMPLETED
    IF NEW.status = 'delivered' AND OLD.status != 'delivered' THEN
      
      -- Find the active escrow hold
      SELECT id, item_price, delivery_fee 
      INTO v_escrow_id, v_item_price, v_delivery_fee
      FROM public.escrow_holds
      WHERE target_listing_id = NEW.linked_listing_id AND status = 'held'
      FOR UPDATE;

      IF FOUND THEN
        -- Mark escrow as released
        UPDATE public.escrow_holds SET status = 'released', updated_at = now() WHERE id = v_escrow_id;

        -- Get Seller ID and Wallet
        SELECT seller_id INTO v_seller_id FROM public.resale_listings WHERE id = NEW.linked_listing_id;
        SELECT id INTO v_seller_wallet_id FROM public.wallets WHERE profile_id = v_seller_id FOR UPDATE;

        -- Get Runner ID and Wallet (from delivery_assignments)
        SELECT runner_id INTO v_runner_id FROM public.delivery_assignments WHERE request_id = NEW.id;
        SELECT id INTO v_runner_wallet_id FROM public.wallets WHERE profile_id = v_runner_id FOR UPDATE;

        -- Credit Seller (Item Price)
        IF v_seller_wallet_id IS NOT NULL AND v_item_price > 0 THEN
          UPDATE public.wallets SET balance = balance + v_item_price WHERE id = v_seller_wallet_id;
          INSERT INTO public.transactions (wallet_id, amount, type, status, description, reference_id)
          VALUES (v_seller_wallet_id, v_item_price, 'earning', 'completed', 'Payout for Resale Item', NEW.linked_listing_id);
        END IF;

        -- Credit Runner (Delivery Fee)
        IF v_runner_wallet_id IS NOT NULL AND v_delivery_fee > 0 THEN
          UPDATE public.wallets SET balance = balance + v_delivery_fee WHERE id = v_runner_wallet_id;
          INSERT INTO public.transactions (wallet_id, amount, type, status, description, reference_id)
          VALUES (v_runner_wallet_id, v_delivery_fee, 'earning', 'completed', 'Delivery Fee for Resale Runner', NEW.id);
        END IF;
      END IF;

    -- SCENARIO B: DELIVERY CANCELLED OR FAILED
    ELSIF NEW.status IN ('cancelled', 'failed') AND OLD.status NOT IN ('cancelled', 'failed') THEN
      
      -- Find the active escrow hold
      SELECT id, item_price, delivery_fee, buyer_id, wallet_id
      INTO v_escrow_id, v_item_price, v_delivery_fee, v_buyer_id, v_buyer_wallet_id
      FROM public.escrow_holds
      WHERE target_listing_id = NEW.linked_listing_id AND status = 'held'
      FOR UPDATE;

      IF FOUND THEN
        -- Mark escrow as refunded
        UPDATE public.escrow_holds SET status = 'refunded', updated_at = now() WHERE id = v_escrow_id;

        -- Refund the buyer's wallet atomically
        v_total_refund := v_item_price + v_delivery_fee;
        
        -- Double check wallet ID to ensure we refund the original funder
        IF v_buyer_wallet_id IS NOT NULL AND v_total_refund > 0 THEN
          -- Lock wallet
          PERFORM 1 FROM public.wallets WHERE id = v_buyer_wallet_id FOR UPDATE;
          
          -- Apply refund
          UPDATE public.wallets SET balance = balance + v_total_refund WHERE id = v_buyer_wallet_id;
          INSERT INTO public.transactions (wallet_id, amount, type, status, description, reference_id)
          VALUES (v_buyer_wallet_id, v_total_refund, 'refund', 'completed', 'Refund for Cancelled Resale Order', NEW.linked_listing_id);
        END IF;
      END IF;
    END IF;

  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMIT;

-- Phase 2H bug fix: Allow buyers to read sold listings they bought
DROP POLICY IF EXISTS "Buyers_read_sold" ON public.resale_listings;
CREATE POLICY "Buyers_read_sold" ON public.resale_listings FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.resale_offers o WHERE o.listing_id = resale_listings.id AND o.buyer_id = auth.uid() AND o.status = 'accepted'));
