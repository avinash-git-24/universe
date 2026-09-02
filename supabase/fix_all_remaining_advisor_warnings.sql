-- ==============================================================================
-- UniVerse — Fix All Remaining Supabase Security Advisor Warnings
-- ==============================================================================

BEGIN;

-- ==============================================================================
-- 1. FIX: RLS Policy Always True on public.conversations
-- Drop ALL old policies on public.conversations and recreate clean, strict policies
-- ==============================================================================

DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN 
    SELECT policyname 
    FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'conversations'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.conversations', pol.policyname);
  END LOOP;
END $$;

-- Explicitly enable RLS
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- Recreate strict RLS policies on public.conversations
CREATE POLICY "conversations_select_policy" ON public.conversations
  FOR SELECT TO authenticated
  USING (
    public.is_conversation_participant(id, auth.uid()) OR 
    (buyer_id IS NOT NULL AND buyer_id = auth.uid()) OR
    public.is_admin(auth.uid())
  );

CREATE POLICY "conversations_insert_policy" ON public.conversations
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() IS NOT NULL AND 
    (buyer_id IS NULL OR buyer_id = auth.uid())
  );

CREATE POLICY "conversations_update_policy" ON public.conversations
  FOR UPDATE TO authenticated
  USING (
    public.is_conversation_participant(id, auth.uid()) OR public.is_admin(auth.uid())
  )
  WITH CHECK (
    public.is_conversation_participant(id, auth.uid()) OR public.is_admin(auth.uid())
  );

-- ==============================================================================
-- 2. FIX: Public Bucket Allows Listing on storage.objects
-- Remove broad SELECT policies from storage.objects table so buckets cannot be enumerated
-- Public images will continue to load 100% via direct CDN URLs (/storage/v1/object/public/...)
-- ==============================================================================

DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN 
    SELECT policyname 
    FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND cmd = 'SELECT'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', pol.policyname);
  END LOOP;
END $$;

-- Ensure buckets are public for CDN direct access
UPDATE storage.buckets SET public = true WHERE id IN ('avatars', 'chat_images', 'resale-listing-images');

-- ==============================================================================
-- 3. FIX: Signed-In Users Can Execute SECURITY DEFINER Function
-- Redefine create_delivery_conversation as SECURITY INVOKER (runs with caller auth)
-- ==============================================================================

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

  -- 1. Self-chat handling
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

  -- 2. Check existing conversation between both users
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

  -- 3. Create fresh conversation
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
$$ LANGUAGE plpgsql SECURITY INVOKER SET search_path = public, pg_temp;

-- Grant execution to authenticated users
GRANT EXECUTE ON FUNCTION public.create_delivery_conversation(UUID, UUID) TO authenticated, service_role;

COMMIT;
