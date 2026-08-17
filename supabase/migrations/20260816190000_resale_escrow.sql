-- ==============================================================================
-- UniVerse Resale — Phase 2J: Escrow & Wallet Checkout Integration
--
-- Brings financial logistics on-platform. Creates escrow holds and automates
-- checkout and delivery payouts.
-- ==============================================================================

BEGIN;

-- ------------------------------------------------------------------------------
-- 1. Create Escrow Holds Table
-- ------------------------------------------------------------------------------
CREATE TYPE escrow_status AS ENUM ('held', 'released', 'refunded');

CREATE TABLE public.escrow_holds (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  buyer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  wallet_id UUID NOT NULL REFERENCES public.wallets(id) ON DELETE CASCADE,
  target_listing_id UUID NOT NULL REFERENCES public.resale_listings(id) ON DELETE CASCADE,
  item_price NUMERIC(10, 2) NOT NULL,
  delivery_fee NUMERIC(10, 2) NOT NULL,
  status escrow_status NOT NULL DEFAULT 'held',
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT escrow_positive_amounts CHECK (item_price >= 0 AND delivery_fee >= 0)
);

CREATE UNIQUE INDEX idx_escrow_holds_target_listing ON public.escrow_holds(target_listing_id) WHERE status = 'held';

-- RLS
ALTER TABLE public.escrow_holds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Buyers can view their own escrow holds" ON public.escrow_holds
  FOR SELECT USING (buyer_id = auth.uid());

-- Sellers can see escrow holds for their listings
CREATE POLICY "Sellers can view escrow holds for their listings" ON public.escrow_holds
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.resale_listings WHERE id = target_listing_id AND seller_id = auth.uid())
  );

-- Trigger for updated_at
CREATE TRIGGER on_escrow_holds_updated
  BEFORE UPDATE ON public.escrow_holds
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ------------------------------------------------------------------------------
-- 2. Secure Checkout RPC
-- ------------------------------------------------------------------------------
-- Atomically deducts funds, creates an escrow hold, and creates the delivery request.
CREATE OR REPLACE FUNCTION public.checkout_resale_offer_with_delivery(
  p_offer_id UUID,
  p_buyer_id UUID,
  p_dropoff_location TEXT,
  p_pickup_location TEXT,
  p_item_price NUMERIC,
  p_delivery_fee NUMERIC
)
RETURNS UUID AS $$
DECLARE
  v_wallet_id UUID;
  v_current_balance NUMERIC;
  v_total_cost NUMERIC;
  v_listing_id UUID;
  v_delivery_request_id UUID;
BEGIN
  -- 1. Validate Offer
  SELECT listing_id INTO v_listing_id
  FROM public.resale_offers
  WHERE id = p_offer_id AND buyer_id = p_buyer_id AND status = 'accepted';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Offer not found or not accepted by this buyer.';
  END IF;

  -- 2. Lock and get wallet
  v_total_cost := p_item_price + p_delivery_fee;
  
  SELECT id, balance INTO v_wallet_id, v_current_balance
  FROM public.wallets
  WHERE profile_id = p_buyer_id
  FOR UPDATE; -- Row-level lock to prevent double-spending

  IF v_current_balance < v_total_cost THEN
    RAISE EXCEPTION 'Insufficient wallet balance. Please add funds.';
  END IF;

  -- 3. Deduct funds from Wallet
  UPDATE public.wallets
  SET balance = balance - v_total_cost
  WHERE id = v_wallet_id;

  -- 4. Record Transaction
  INSERT INTO public.transactions (wallet_id, amount, type, status, description)
  VALUES (v_wallet_id, -v_total_cost, 'payment', 'completed', 'Escrow for Resale Purchase & Delivery');

  -- 5. Create Escrow Hold
  INSERT INTO public.escrow_holds (buyer_id, wallet_id, target_listing_id, item_price, delivery_fee, status)
  VALUES (p_buyer_id, v_wallet_id, v_listing_id, p_item_price, p_delivery_fee, 'held');

  -- 6. Create Delivery Request
  INSERT INTO public.delivery_requests (requester_id, dropoff_location, pickup_location, compensation, status, linked_listing_id)
  VALUES (p_buyer_id, p_dropoff_location, p_pickup_location, p_delivery_fee, 'pending', v_listing_id)
  RETURNING id INTO v_delivery_request_id;

  RETURN v_delivery_request_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ------------------------------------------------------------------------------
-- 3. Release Escrow on Delivery Completion
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.release_escrow_on_delivery()
RETURNS TRIGGER AS $$
DECLARE
  v_escrow_id UUID;
  v_item_price NUMERIC;
  v_delivery_fee NUMERIC;
  v_seller_id UUID;
  v_seller_wallet_id UUID;
  v_runner_id UUID;
  v_runner_wallet_id UUID;
BEGIN
  -- Only trigger if status changed to 'delivered' and it is linked to a listing
  IF NEW.status = 'delivered' AND OLD.status != 'delivered' AND NEW.linked_listing_id IS NOT NULL THEN
    
    -- Find the active escrow hold
    SELECT id, item_price, delivery_fee 
    INTO v_escrow_id, v_item_price, v_delivery_fee
    FROM public.escrow_holds
    WHERE target_listing_id = NEW.linked_listing_id AND status = 'held'
    FOR UPDATE;

    IF FOUND THEN
      -- Mark escrow as released
      UPDATE public.escrow_holds SET status = 'released' WHERE id = v_escrow_id;

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
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_release_escrow_on_delivery
  AFTER UPDATE OF status ON public.delivery_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.release_escrow_on_delivery();

COMMIT;
