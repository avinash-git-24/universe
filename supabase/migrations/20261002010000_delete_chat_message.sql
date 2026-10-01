-- ==============================================================================
-- Migration: Delete Chat Message for Everyone (WhatsApp-style)
-- Allows the message sender (or campus admin) to delete a message for both sides.
-- Enables REPLICA IDENTITY FULL so realtime DELETE events carry conversation_id.
-- ==============================================================================

-- 1. Ensure REPLICA IDENTITY FULL so postgres_changes DELETE events include conversation_id
ALTER TABLE public.messages REPLICA IDENTITY FULL;

-- 2. Master RPC: delete_message_for_everyone (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.delete_message_for_everyone(p_message_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_user_id UUID;
  v_sender_id UUID;
  v_conv_id UUID;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'UNAUTHENTICATED';
  END IF;

  SELECT sender_id, conversation_id INTO v_sender_id, v_conv_id
  FROM public.messages
  WHERE id = p_message_id;

  IF v_sender_id IS NULL THEN
    -- Message already deleted or doesn't exist
    RETURN TRUE;
  END IF;

  -- Security check: Only sender or system admin can delete the message
  IF v_sender_id <> v_user_id AND NOT public.is_admin(v_user_id) THEN
    RAISE EXCEPTION 'UNAUTHORIZED: Only the message sender can delete this message for everyone';
  END IF;

  -- Delete message
  DELETE FROM public.messages
  WHERE id = p_message_id;

  -- Touch conversation timestamp
  UPDATE public.conversations
  SET updated_at = NOW()
  WHERE id = v_conv_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION public.delete_message_for_everyone(UUID) TO authenticated, service_role, anon;

-- 3. RLS policy on public.messages for DELETE
DROP POLICY IF EXISTS "Senders can delete their own messages" ON public.messages;
CREATE POLICY "Senders can delete their own messages" ON public.messages
  FOR DELETE USING (
    sender_id = auth.uid() OR public.is_admin(auth.uid())
  );
