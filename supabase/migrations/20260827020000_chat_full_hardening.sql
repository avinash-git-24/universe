-- ------------------------------------------------------------------------------
-- Comprehensive Chat Security, Permissions & RPC Migration
-- ------------------------------------------------------------------------------

BEGIN;

-- 1. Ensure columns exist on conversations
ALTER TABLE public.conversations
  ADD COLUMN IF NOT EXISTS request_id UUID REFERENCES public.delivery_requests(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS listing_id UUID REFERENCES public.resale_listings(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS buyer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- 2. Ensure RLS is enabled
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- 3. Fix helper functions with search_path and SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.is_conversation_participant(conv_id UUID, usr_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.conversation_participants
    WHERE conversation_id = conv_id AND profile_id = usr_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 4. RLS Policies on conversations
DROP POLICY IF EXISTS "Users can view their conversations" ON public.conversations;
DROP POLICY IF EXISTS "Prevent direct inserts on conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can insert their own conversations" ON public.conversations;
DROP POLICY IF EXISTS "Allow authenticated to insert conversations" ON public.conversations;

CREATE POLICY "Users can view their conversations" ON public.conversations
  FOR SELECT USING (
    public.is_conversation_participant(id, auth.uid()) OR 
    (buyer_id IS NOT NULL AND buyer_id = auth.uid()) OR
    public.is_admin(auth.uid())
  );

CREATE POLICY "Allow authenticated to insert conversations" ON public.conversations
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their conversations" ON public.conversations
  FOR UPDATE USING (
    public.is_conversation_participant(id, auth.uid()) OR public.is_admin(auth.uid())
  );

-- 5. RLS Policies on conversation_participants
DROP POLICY IF EXISTS "Users can view their participant records" ON public.conversation_participants;
DROP POLICY IF EXISTS "Prevent direct inserts on participants" ON public.conversation_participants;
DROP POLICY IF EXISTS "Allow authenticated to insert participants" ON public.conversation_participants;
DROP POLICY IF EXISTS "Users can update their own participant records" ON public.conversation_participants;

CREATE POLICY "Users can view their participant records" ON public.conversation_participants
  FOR SELECT USING (
    profile_id = auth.uid() OR 
    public.is_conversation_participant(conversation_id, auth.uid()) OR 
    public.is_admin(auth.uid())
  );

CREATE POLICY "Allow authenticated to insert participants" ON public.conversation_participants
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own participant records" ON public.conversation_participants
  FOR UPDATE USING (profile_id = auth.uid());

-- 6. RLS Policies on messages
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages to their conversations" ON public.messages;

CREATE POLICY "Users can view messages in their conversations" ON public.messages
  FOR SELECT USING (
    public.is_conversation_participant(conversation_id, auth.uid()) OR public.is_admin(auth.uid())
  );

CREATE POLICY "Users can send messages to their conversations" ON public.messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid() AND 
    public.is_conversation_participant(conversation_id, auth.uid())
  );

-- 7. Robust Delivery Conversation RPC
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

  IF v_initiator_id = p_other_user_id THEN
    RAISE EXCEPTION 'CANNOT_CHAT_WITH_SELF';
  END IF;

  -- Check if conversation already exists between these 2 users (optionally matching request)
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
    LIMIT 1;
  END IF;

  IF v_conversation_id IS NOT NULL THEN
    RETURN v_conversation_id;
  END IF;

  -- Create new conversation
  INSERT INTO public.conversations (request_id)
  VALUES (p_request_id)
  RETURNING id INTO v_conversation_id;

  INSERT INTO public.conversation_participants (conversation_id, profile_id)
  VALUES 
    (v_conversation_id, v_initiator_id),
    (v_conversation_id, p_other_user_id);

  RETURN v_conversation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 8. Permissions
GRANT ALL ON TABLE public.conversations TO authenticated, service_role, anon;
GRANT ALL ON TABLE public.conversation_participants TO authenticated, service_role, anon;
GRANT ALL ON TABLE public.messages TO authenticated, service_role, anon;
GRANT EXECUTE ON FUNCTION public.create_delivery_conversation(UUID, UUID) TO authenticated, service_role, anon;
GRANT EXECUTE ON FUNCTION public.is_conversation_participant(UUID, UUID) TO authenticated, service_role, anon;

COMMIT;
