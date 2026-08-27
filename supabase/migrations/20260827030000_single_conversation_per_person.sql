-- ==============================================================================
-- Migration: Ensure Exactly One Conversation Per Unique User Pair
-- ==============================================================================

BEGIN;

-- Update create_delivery_conversation to enforce 1-on-1 deduplication at the database level
CREATE OR REPLACE FUNCTION public.create_delivery_conversation(
  p_other_user_id UUID,
  p_request_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_initiator_id UUID;
  v_conversation_id UUID;
BEGIN
  v_initiator_id := auth.uid();
  IF v_initiator_id IS NULL THEN
    RAISE EXCEPTION 'UNAUTHENTICATED';
  END IF;

  IF p_other_user_id IS NULL THEN
    RAISE EXCEPTION 'INVALID_USER_ID';
  END IF;

  -- 1. If self-chat (e.g. developer testing their own delivery request)
  IF v_initiator_id = p_other_user_id THEN
    SELECT c.id INTO v_conversation_id
    FROM public.conversations c
    JOIN public.conversation_participants cp ON c.id = cp.conversation_id AND cp.profile_id = v_initiator_id
    LIMIT 1;

    IF v_conversation_id IS NOT NULL THEN
      IF p_request_id IS NOT NULL THEN
        UPDATE public.conversations
        SET request_id = p_request_id, updated_at = timezone('utc'::text, now())
        WHERE id = v_conversation_id;
      END IF;
      RETURN v_conversation_id;
    END IF;

    INSERT INTO public.conversations (request_id)
    VALUES (p_request_id)
    RETURNING id INTO v_conversation_id;

    INSERT INTO public.conversation_participants (conversation_id, profile_id)
    VALUES (v_conversation_id, v_initiator_id)
    ON CONFLICT (conversation_id, profile_id) DO NOTHING;

    RETURN v_conversation_id;
  END IF;

  -- 2. Check if ANY conversation already exists between these 2 distinct users (1 chat per person pair)
  SELECT c.id INTO v_conversation_id
  FROM public.conversations c
  JOIN public.conversation_participants cp1 ON c.id = cp1.conversation_id AND cp1.profile_id = v_initiator_id
  JOIN public.conversation_participants cp2 ON c.id = cp2.conversation_id AND cp2.profile_id = p_other_user_id
  LIMIT 1;

  -- 3. If existing conversation found, update request_id if a new one was provided, then return
  IF v_conversation_id IS NOT NULL THEN
    IF p_request_id IS NOT NULL THEN
      UPDATE public.conversations
      SET request_id = p_request_id,
          updated_at = timezone('utc'::text, now())
      WHERE id = v_conversation_id;
    END IF;
    RETURN v_conversation_id;
  END IF;

  -- 4. Create new conversation record
  INSERT INTO public.conversations (request_id)
  VALUES (p_request_id)
  RETURNING id INTO v_conversation_id;

  -- 5. Add both participants
  INSERT INTO public.conversation_participants (conversation_id, profile_id)
  VALUES 
    (v_conversation_id, v_initiator_id),
    (v_conversation_id, p_other_user_id)
  ON CONFLICT (conversation_id, profile_id) DO NOTHING;

  RETURN v_conversation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION public.create_delivery_conversation(UUID, UUID) TO authenticated, service_role, anon;

COMMIT;
