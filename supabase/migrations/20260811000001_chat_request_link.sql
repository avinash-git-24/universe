-- ------------------------------------------------------------------------------
-- Phase X: Link Chat Conversations to Delivery Requests
-- ------------------------------------------------------------------------------

BEGIN;

-- Add request_id to conversations table
ALTER TABLE public.conversations
  ADD COLUMN request_id UUID REFERENCES public.delivery_requests(id) ON DELETE CASCADE;

-- Conversations RLS is already: Users can view their conversations (via conversation_participants).
-- This means any existing conversation participant can view the request_id.

COMMIT;
