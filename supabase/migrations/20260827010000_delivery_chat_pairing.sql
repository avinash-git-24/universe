-- ==============================================================================
-- Migration: Secure Delivery Chat Pairing (Requester <-> Assigned Runner)
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.create_delivery_conversation(
  p_other_user_id UUID, 
  p_request_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_initiator_id UUID;
  v_conversation_id UUID;
  v_req_record RECORD;
BEGIN
  v_initiator_id := auth.uid();
  IF v_initiator_id IS NULL THEN
    RAISE EXCEPTION 'UNAUTHENTICATED';
  END IF;

  IF p_other_user_id IS NULL OR v_initiator_id = p_other_user_id THEN
    RAISE EXCEPTION 'INVALID_PARTICIPANT';
  END IF;

  -- 1. Check if conversation already exists between these two users for this request
  IF p_request_id IS NOT NULL THEN
    SELECT c.id INTO v_conversation_id
    FROM public.conversations c
    JOIN public.conversation_participants cp1 ON c.id = cp1.conversation_id AND cp1.profile_id = v_initiator_id
    JOIN public.conversation_participants cp2 ON c.id = cp2.conversation_id AND cp2.profile_id = p_other_user_id
    WHERE c.request_id = p_request_id
    LIMIT 1;
  ELSE
    SELECT c.id INTO v_conversation_id
    FROM public.conversations c
    JOIN public.conversation_participants cp1 ON c.id = cp1.conversation_id AND cp1.profile_id = v_initiator_id
    JOIN public.conversation_participants cp2 ON c.id = cp2.conversation_id AND cp2.profile_id = p_other_user_id
    WHERE c.request_id IS NULL AND c.listing_id IS NULL
    LIMIT 1;
  END IF;

  IF v_conversation_id IS NOT NULL THEN
    RETURN v_conversation_id;
  END IF;

  -- 2. Create new conversation
  INSERT INTO public.conversations (request_id)
  VALUES (p_request_id)
  RETURNING id INTO v_conversation_id;

  -- 3. Add both participants
  INSERT INTO public.conversation_participants (conversation_id, profile_id)
  VALUES 
    (v_conversation_id, v_initiator_id),
    (v_conversation_id, p_other_user_id)
  ON CONFLICT DO NOTHING;

  RETURN v_conversation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;

GRANT EXECUTE ON FUNCTION public.create_delivery_conversation(UUID, UUID) TO authenticated, service_role;
