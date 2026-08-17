-- ------------------------------------------------------------------------------
-- Phase 2D: Chat Security Hardening
-- ------------------------------------------------------------------------------

BEGIN;

-- 1. Database-Level Duplicate Prevention for Marketplace
ALTER TABLE public.conversations
  ADD COLUMN buyer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

CREATE UNIQUE INDEX idx_unique_marketplace_conversation 
  ON public.conversations (listing_id, buyer_id) 
  WHERE listing_id IS NOT NULL AND buyer_id IS NOT NULL;

-- 2. Lock Down Direct Client Inserts
-- Drop the overly permissive insert policies
DROP POLICY IF EXISTS "Users can insert conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can insert participant records" ON public.conversation_participants;

-- Replace with heavily restricted policies
-- Client applications MUST NOT insert directly. They must use the secure RPC functions.
CREATE POLICY "Prevent direct inserts on conversations" ON public.conversations
  FOR INSERT WITH CHECK (false);

CREATE POLICY "Prevent direct inserts on participants" ON public.conversation_participants
  FOR INSERT WITH CHECK (false);

-- 3. Secure Server-Side Creation (PostgreSQL RPC)

-- RPC for Marketplace Conversations
CREATE OR REPLACE FUNCTION public.create_marketplace_conversation(p_listing_id UUID)
RETURNS UUID AS $$
DECLARE
  v_buyer_id UUID;
  v_seller_id UUID;
  v_status text;
  v_conversation_id UUID;
BEGIN
  v_buyer_id := auth.uid();
  IF v_buyer_id IS NULL THEN
    RAISE EXCEPTION 'UNAUTHENTICATED';
  END IF;

  SELECT seller_id, status INTO v_seller_id, v_status
  FROM public.resale_listings
  WHERE id = p_listing_id;

  IF v_seller_id IS NULL THEN
    RAISE EXCEPTION 'NOT_FOUND';
  END IF;

  IF v_status NOT IN ('active', 'reserved') THEN
    RAISE EXCEPTION 'INVALID_STATUS';
  END IF;

  IF v_buyer_id = v_seller_id THEN
    RAISE EXCEPTION 'CANNOT_CONTACT_SELF';
  END IF;

  -- Check existing conversation
  SELECT id INTO v_conversation_id
  FROM public.conversations
  WHERE listing_id = p_listing_id AND buyer_id = v_buyer_id;

  IF v_conversation_id IS NOT NULL THEN
    RETURN v_conversation_id;
  END IF;

  -- Insert new conversation
  BEGIN
    INSERT INTO public.conversations (listing_id, buyer_id)
    VALUES (p_listing_id, v_buyer_id)
    RETURNING id INTO v_conversation_id;

    INSERT INTO public.conversation_participants (conversation_id, profile_id)
    VALUES 
      (v_conversation_id, v_buyer_id),
      (v_conversation_id, v_seller_id);
      
    RETURN v_conversation_id;
  EXCEPTION WHEN unique_violation THEN
    -- Fallback for exact race condition
    SELECT id INTO v_conversation_id
    FROM public.conversations
    WHERE listing_id = p_listing_id AND buyer_id = v_buyer_id;
    
    RETURN v_conversation_id;
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- RPC for Delivery Conversations
CREATE OR REPLACE FUNCTION public.create_delivery_conversation(p_other_user_id UUID, p_request_id UUID)
RETURNS UUID AS $$
DECLARE
  v_initiator_id UUID;
  v_conversation_id UUID;
BEGIN
  v_initiator_id := auth.uid();
  IF v_initiator_id IS NULL THEN
    RAISE EXCEPTION 'UNAUTHENTICATED';
  END IF;
  
  SELECT c.id INTO v_conversation_id
  FROM public.conversations c
  JOIN public.conversation_participants cp1 ON c.id = cp1.conversation_id AND cp1.profile_id = v_initiator_id
  JOIN public.conversation_participants cp2 ON c.id = cp2.conversation_id AND cp2.profile_id = p_other_user_id
  WHERE c.request_id = p_request_id
  LIMIT 1;

  IF v_conversation_id IS NOT NULL THEN
    RETURN v_conversation_id;
  END IF;

  -- Create new
  INSERT INTO public.conversations (request_id)
  VALUES (p_request_id)
  RETURNING id INTO v_conversation_id;

  INSERT INTO public.conversation_participants (conversation_id, profile_id)
  VALUES 
    (v_conversation_id, v_initiator_id),
    (v_conversation_id, p_other_user_id);

  RETURN v_conversation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMIT;
