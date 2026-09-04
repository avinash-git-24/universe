-- ============================================================
-- FIX: Chat messages not sending / runner-to-student messaging broken
-- Root cause: is_conversation_participant runs without SECURITY DEFINER
-- meaning it can't bypass RLS to check participation, causing INSERT to fail.
-- Solution: Make all helper functions SECURITY DEFINER + add safe send RPC.
-- ============================================================

BEGIN;

-- 1. Rebuild is_conversation_participant with SECURITY DEFINER so it can
--    reliably query conversation_participants without being blocked by RLS.
CREATE OR REPLACE FUNCTION public.is_conversation_participant(conv_id UUID, usr_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.conversation_participants
    WHERE conversation_id = conv_id AND profile_id = usr_id
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

GRANT EXECUTE ON FUNCTION public.is_conversation_participant(UUID, UUID) TO authenticated, service_role, anon;

-- 2. A safe, atomic "send message" RPC that:
--    a) Verifies the caller is authenticated
--    b) Auto-adds caller as participant if missing (self-heal)
--    c) Inserts the message
--    d) Touches conversation updated_at
CREATE OR REPLACE FUNCTION public.send_message_safe(
  p_conversation_id UUID,
  p_content TEXT,
  p_image_url TEXT DEFAULT NULL,
  p_message_type TEXT DEFAULT 'text',
  p_metadata JSONB DEFAULT NULL
)
RETURNS public.messages AS $$
DECLARE
  v_sender_id UUID;
  v_msg public.messages;
BEGIN
  v_sender_id := auth.uid();

  IF v_sender_id IS NULL THEN
    RAISE EXCEPTION 'UNAUTHENTICATED';
  END IF;

  -- Auto-heal: add participant if missing (handles race conditions)
  INSERT INTO public.conversation_participants (conversation_id, profile_id)
  VALUES (p_conversation_id, v_sender_id)
  ON CONFLICT (conversation_id, profile_id) DO NOTHING;

  -- Insert the message
  INSERT INTO public.messages (conversation_id, sender_id, content, image_url, message_type, metadata)
  VALUES (p_conversation_id, v_sender_id, p_content, p_image_url, p_message_type, p_metadata)
  RETURNING * INTO v_msg;

  -- Touch conversation timestamp
  UPDATE public.conversations
  SET updated_at = NOW()
  WHERE id = p_conversation_id;

  RETURN v_msg;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION public.send_message_safe(UUID, TEXT, TEXT, TEXT, JSONB) TO authenticated, service_role;

-- 3. Drop old overly strict messages INSERT policy and replace with a
--    permissive one that allows any authenticated participant to send.
DROP POLICY IF EXISTS "Users can send messages to their conversations" ON public.messages;
DROP POLICY IF EXISTS "Participants can insert messages" ON public.messages;

CREATE POLICY "Authenticated participants can send messages" ON public.messages
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND sender_id = auth.uid()
    AND public.is_conversation_participant(conversation_id, auth.uid())
  );

-- 4. Ensure conversation_participants has unique constraint (required for ON CONFLICT)
ALTER TABLE public.conversation_participants 
  DROP CONSTRAINT IF EXISTS conversation_participants_conversation_id_profile_id_key;

ALTER TABLE public.conversation_participants
  ADD CONSTRAINT conversation_participants_conversation_id_profile_id_key
  UNIQUE (conversation_id, profile_id);

-- 5. Make sure Realtime is enabled for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

COMMIT;
