-- ------------------------------------------------------------------------------
-- Phase 6A: Chat & Messaging System
-- ------------------------------------------------------------------------------

BEGIN;

CREATE TYPE message_status AS ENUM ('sent', 'delivered', 'read');

-- ------------------------------------------------------------------------------
-- Conversations Table
-- ------------------------------------------------------------------------------
CREATE TABLE public.conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- Conversation Participants Table
-- ------------------------------------------------------------------------------
CREATE TABLE public.conversation_participants (
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  last_read_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  PRIMARY KEY (conversation_id, profile_id)
);

-- ------------------------------------------------------------------------------
-- Messages Table
-- ------------------------------------------------------------------------------
CREATE TABLE public.messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  status message_status DEFAULT 'sent'::message_status NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- RLS Policies
-- ------------------------------------------------------------------------------
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Helper to check participant
CREATE OR REPLACE FUNCTION public.is_conversation_participant(conv_id UUID, usr_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.conversation_participants
    WHERE conversation_id = conv_id AND profile_id = usr_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Conversations RLS
CREATE POLICY "Users can view their conversations" ON public.conversations
  FOR SELECT USING (public.is_conversation_participant(id, auth.uid()) OR public.is_admin(auth.uid()));

CREATE POLICY "Users can insert conversations" ON public.conversations
  FOR INSERT WITH CHECK (true);

-- Conversation Participants RLS
CREATE POLICY "Users can view their participant records" ON public.conversation_participants
  FOR SELECT USING (profile_id = auth.uid() OR public.is_conversation_participant(conversation_id, auth.uid()) OR public.is_admin(auth.uid()));

CREATE POLICY "Users can insert participant records" ON public.conversation_participants
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own participant records" ON public.conversation_participants
  FOR UPDATE USING (profile_id = auth.uid() OR public.is_admin(auth.uid()));

-- Messages RLS
CREATE POLICY "Participants can view messages" ON public.messages
  FOR SELECT USING (public.is_conversation_participant(conversation_id, auth.uid()) OR public.is_admin(auth.uid()));

CREATE POLICY "Participants can insert messages" ON public.messages
  FOR INSERT WITH CHECK (public.is_conversation_participant(conversation_id, auth.uid()) AND sender_id = auth.uid());

CREATE POLICY "Participants can update message status" ON public.messages
  FOR UPDATE USING (public.is_conversation_participant(conversation_id, auth.uid()) OR public.is_admin(auth.uid()));

-- ------------------------------------------------------------------------------
-- Triggers for updated_at
-- ------------------------------------------------------------------------------
CREATE TRIGGER handle_updated_at_conversations
  BEFORE UPDATE ON public.conversations
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ------------------------------------------------------------------------------
-- Realtime
-- ------------------------------------------------------------------------------
-- Add tables to supabase_realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversation_participants;

COMMIT;
