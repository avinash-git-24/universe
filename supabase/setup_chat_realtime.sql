-- ==============================================================================
-- UniVerse — Chat Realtime & Messaging Complete Setup (Self-Contained)
-- Run this script in your Supabase Cloud SQL Editor (Dashboard > SQL Editor)
-- ==============================================================================

BEGIN;

-- 1. Helper Function: is_admin (Safe definition for text/enum role)
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = user_id AND role::text = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. Ensure conversation table and all required columns exist
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.conversations
  ADD COLUMN IF NOT EXISTS request_id UUID REFERENCES public.delivery_requests(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS listing_id UUID REFERENCES public.resale_listings(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS buyer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- 3. Ensure participants table exists
CREATE TABLE IF NOT EXISTS public.conversation_participants (
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  last_read_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (conversation_id, profile_id)
);

-- 4. Ensure messages table and all required columns exist
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.messages
  ADD COLUMN IF NOT EXISTS image_url TEXT,
  ADD COLUMN IF NOT EXISTS message_type TEXT DEFAULT 'text',
  ADD COLUMN IF NOT EXISTS metadata JSONB,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'sent';

-- 5. Enable Row Level Security
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- 6. Participant Helper Function (SECURITY DEFINER to avoid RLS recursion)
CREATE OR REPLACE FUNCTION public.is_conversation_participant(conv_id UUID, usr_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.conversation_participants
    WHERE conversation_id = conv_id AND profile_id = usr_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 7. Policies on conversations
DROP POLICY IF EXISTS "Users can view their conversations" ON public.conversations;
CREATE POLICY "Users can view their conversations" ON public.conversations
  FOR SELECT USING (
    public.is_conversation_participant(id, auth.uid()) OR 
    (buyer_id IS NOT NULL AND buyer_id = auth.uid()) OR
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

-- 8. Policies on conversation_participants
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

-- 9. Policies on messages
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

-- 10. Realtime Replication & Publication
ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER TABLE public.conversation_participants REPLICA IDENTITY FULL;
ALTER TABLE public.conversations REPLICA IDENTITY FULL;

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

COMMIT;
