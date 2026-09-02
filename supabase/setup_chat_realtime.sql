-- ==============================================================================
-- UniVerse — Chat Realtime & Messaging Full Setup
-- Run this script in your Supabase Cloud SQL Editor (Dashboard > SQL Editor)
-- ==============================================================================

BEGIN;

-- 1. Ensure conversation & message tables exist
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id UUID REFERENCES public.delivery_requests(id) ON DELETE SET NULL,
  listing_id UUID REFERENCES public.resale_listings(id) ON DELETE SET NULL,
  buyer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.conversation_participants (
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  last_read_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (conversation_id, profile_id)
);

CREATE TABLE IF NOT EXISTS public.messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  message_type TEXT DEFAULT 'text',
  metadata JSONB,
  status TEXT DEFAULT 'sent' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 2. Enable Row Level Security
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- 3. Participant Helper Function (SECURITY DEFINER to avoid RLS recursion)
CREATE OR REPLACE FUNCTION public.is_conversation_participant(conv_id UUID, usr_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.conversation_participants
    WHERE conversation_id = conv_id AND profile_id = usr_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 4. Policies on conversations
DROP POLICY IF EXISTS "Users can view their conversations" ON public.conversations;
CREATE POLICY "Users can view their conversations" ON public.conversations
  FOR SELECT USING (
    public.is_conversation_participant(id, auth.uid()) OR 
    buyer_id = auth.uid() OR
    public.is_admin(auth.uid())
  );

DROP POLICY IF EXISTS "Allow authenticated to insert conversations" ON public.conversations;
CREATE POLICY "Allow authenticated to insert conversations" ON public.conversations
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can update their conversations" ON public.conversations;
CREATE POLICY "Users can update their conversations" ON public.conversations
  FOR UPDATE USING (
    public.is_conversation_participant(id, auth.uid()) OR public.is_admin(auth.uid())
  );

-- 5. Policies on conversation_participants
DROP POLICY IF EXISTS "Users can view their participant records" ON public.conversation_participants;
CREATE POLICY "Users can view their participant records" ON public.conversation_participants
  FOR SELECT USING (
    profile_id = auth.uid() OR 
    public.is_conversation_participant(conversation_id, auth.uid()) OR 
    public.is_admin(auth.uid())
  );

DROP POLICY IF EXISTS "Allow authenticated to insert participants" ON public.conversation_participants;
CREATE POLICY "Allow authenticated to insert participants" ON public.conversation_participants
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can update their own participant records" ON public.conversation_participants;
CREATE POLICY "Users can update their own participant records" ON public.conversation_participants
  FOR UPDATE USING (profile_id = auth.uid());

-- 6. Policies on messages
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON public.messages;
CREATE POLICY "Users can view messages in their conversations" ON public.messages
  FOR SELECT USING (
    public.is_conversation_participant(conversation_id, auth.uid()) OR 
    sender_id = auth.uid() OR
    public.is_admin(auth.uid())
  );

DROP POLICY IF EXISTS "Users can send messages to their conversations" ON public.messages;
CREATE POLICY "Users can send messages to their conversations" ON public.messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid()
  );

DROP POLICY IF EXISTS "Users can update message status" ON public.messages;
CREATE POLICY "Users can update message status" ON public.messages
  FOR UPDATE USING (
    public.is_conversation_participant(conversation_id, auth.uid()) OR 
    sender_id = auth.uid() OR
    public.is_admin(auth.uid())
  );

-- 7. Realtime Replication & Publication
ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER TABLE public.conversation_participants REPLICA IDENTITY FULL;
ALTER TABLE public.conversations REPLICA IDENTITY FULL;

-- Add to supabase_realtime publication
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'conversation_participants'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.conversation_participants;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'conversations'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
  END IF;
END $$;

-- 8. Single conversation deduplication RPC
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

  -- If self-chat
  IF v_initiator_id = p_other_user_id THEN
    SELECT c.id INTO v_conversation_id
    FROM public.conversations c
    JOIN public.conversation_participants cp ON c.id = cp.conversation_id AND cp.profile_id = v_initiator_id
    LIMIT 1;

    IF v_conversation_id IS NOT NULL THEN
      IF p_request_id IS NOT NULL THEN
        UPDATE public.conversations
        SET request_id = p_request_id, updated_at = now()
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

  -- Check if conversation exists between the 2 users
  SELECT c.id INTO v_conversation_id
  FROM public.conversations c
  JOIN public.conversation_participants cp1 ON c.id = cp1.conversation_id AND cp1.profile_id = v_initiator_id
  JOIN public.conversation_participants cp2 ON c.id = cp2.conversation_id AND cp2.profile_id = p_other_user_id
  LIMIT 1;

  IF v_conversation_id IS NOT NULL THEN
    IF p_request_id IS NOT NULL THEN
      UPDATE public.conversations
      SET request_id = p_request_id, updated_at = now()
      WHERE id = v_conversation_id;
    END IF;
    RETURN v_conversation_id;
  END IF;

  -- Create new conversation
  INSERT INTO public.conversations (request_id)
  VALUES (p_request_id)
  RETURNING id INTO v_conversation_id;

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
