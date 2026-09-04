-- ==============================================================================
-- Migration: Bulletproof Chat System (Conversation Creation + Safe Messaging)
-- Fixes:
-- 1. Conversation creation failing due to RLS or missing/broken RPCs
-- 2. "Chat" button on active runner (e.g. Raj Kumar) not opening conversation
-- 3. Messages not sending due to missing participation check permissions
-- 4. Idempotent & crash-proof execution in Supabase SQL Editor
-- ==============================================================================

-- 1. Deduplicate conversation_participants before applying any constraints
DELETE FROM public.conversation_participants a
USING public.conversation_participants b
WHERE a.ctid < b.ctid
  AND a.conversation_id = b.conversation_id
  AND a.profile_id = b.profile_id;

-- 2. Ensure unique index on (conversation_id, profile_id)
CREATE UNIQUE INDEX IF NOT EXISTS conversation_participants_conv_profile_uniq_idx
  ON public.conversation_participants (conversation_id, profile_id);

-- 3. Helper: Check if user is conversation participant (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.is_conversation_participant(conv_id UUID, usr_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.conversation_participants
    WHERE conversation_id = conv_id AND profile_id = usr_id
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

GRANT EXECUTE ON FUNCTION public.is_conversation_participant(UUID, UUID) TO authenticated, service_role, anon;

-- 4. Master RPC: get_or_create_delivery_conversation (SECURITY DEFINER)
-- Bypasses RLS to reliably find or create 1-on-1 conversations between two users.
CREATE OR REPLACE FUNCTION public.get_or_create_delivery_conversation(
  p_other_user_id UUID,
  p_request_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_my_id UUID;
  v_conv_id UUID;
BEGIN
  v_my_id := auth.uid();
  IF v_my_id IS NULL THEN
    RAISE EXCEPTION 'UNAUTHENTICATED';
  END IF;

  IF p_other_user_id IS NULL THEN
    RAISE EXCEPTION 'INVALID_OTHER_USER';
  END IF;

  -- 4a. Self-chat case
  IF v_my_id = p_other_user_id THEN
    SELECT c.id INTO v_conv_id
    FROM public.conversations c
    JOIN public.conversation_participants cp ON c.id = cp.conversation_id
    WHERE cp.profile_id = v_my_id
    LIMIT 1;

    IF v_conv_id IS NOT NULL THEN
      IF p_request_id IS NOT NULL THEN
        UPDATE public.conversations
        SET request_id = p_request_id, updated_at = NOW()
        WHERE id = v_conv_id;
      END IF;
      RETURN v_conv_id;
    END IF;

    INSERT INTO public.conversations (request_id, updated_at)
    VALUES (p_request_id, NOW())
    RETURNING id INTO v_conv_id;

    INSERT INTO public.conversation_participants (conversation_id, profile_id)
    VALUES (v_conv_id, v_my_id)
    ON CONFLICT (conversation_id, profile_id) DO NOTHING;

    RETURN v_conv_id;
  END IF;

  -- 4b. Find existing conversation shared by both users
  SELECT cp1.conversation_id INTO v_conv_id
  FROM public.conversation_participants cp1
  JOIN public.conversation_participants cp2 ON cp1.conversation_id = cp2.conversation_id
  WHERE cp1.profile_id = v_my_id AND cp2.profile_id = p_other_user_id
  LIMIT 1;

  -- If conversation already exists, update request_id if provided & return
  IF v_conv_id IS NOT NULL THEN
    IF p_request_id IS NOT NULL THEN
      UPDATE public.conversations
      SET request_id = p_request_id, updated_at = NOW()
      WHERE id = v_conv_id;
    END IF;
    RETURN v_conv_id;
  END IF;

  -- 4c. Create new conversation
  INSERT INTO public.conversations (request_id, updated_at)
  VALUES (p_request_id, NOW())
  RETURNING id INTO v_conv_id;

  -- 4d. Add both participants (atomic)
  INSERT INTO public.conversation_participants (conversation_id, profile_id)
  VALUES 
    (v_conv_id, v_my_id),
    (v_conv_id, p_other_user_id)
  ON CONFLICT (conversation_id, profile_id) DO NOTHING;

  RETURN v_conv_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION public.get_or_create_delivery_conversation(UUID, UUID) TO authenticated, service_role, anon;

-- 5. Backwards-compatible alias: create_delivery_conversation
CREATE OR REPLACE FUNCTION public.create_delivery_conversation(
  p_other_user_id UUID,
  p_request_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
BEGIN
  RETURN public.get_or_create_delivery_conversation(p_other_user_id, p_request_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION public.create_delivery_conversation(UUID, UUID) TO authenticated, service_role, anon;

-- 6. Safe message sending RPC (SECURITY DEFINER)
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

  -- Auto-heal: Ensure sender is a participant
  INSERT INTO public.conversation_participants (conversation_id, profile_id)
  VALUES (p_conversation_id, v_sender_id)
  ON CONFLICT (conversation_id, profile_id) DO NOTHING;

  -- Insert the message
  INSERT INTO public.messages (
    conversation_id, sender_id, content, image_url, message_type, metadata
  ) VALUES (
    p_conversation_id, v_sender_id, p_content, p_image_url, p_message_type, p_metadata
  ) RETURNING * INTO v_msg;

  -- Update conversation updated_at
  UPDATE public.conversations
  SET updated_at = NOW()
  WHERE id = p_conversation_id;

  RETURN v_msg;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION public.send_message_safe(UUID, TEXT, TEXT, TEXT, JSONB) TO authenticated, service_role, anon;

-- 7. Ensure RLS policies on messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view messages in their conversations" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages to their conversations" ON public.messages;
DROP POLICY IF EXISTS "Participants can insert messages" ON public.messages;
DROP POLICY IF EXISTS "Authenticated participants can send messages" ON public.messages;

CREATE POLICY "Users can view messages in their conversations" ON public.messages
  FOR SELECT USING (
    public.is_conversation_participant(conversation_id, auth.uid()) OR public.is_admin(auth.uid())
  );

CREATE POLICY "Authenticated participants can send messages" ON public.messages
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL
    AND sender_id = auth.uid()
    AND public.is_conversation_participant(conversation_id, auth.uid())
  );

-- 8. Safe Realtime activation without duplicate errors
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
  END IF;
END $$;

-- 9. Table permissions
GRANT ALL ON TABLE public.conversations TO authenticated, service_role, anon;
GRANT ALL ON TABLE public.conversation_participants TO authenticated, service_role, anon;
GRANT ALL ON TABLE public.messages TO authenticated, service_role, anon;
