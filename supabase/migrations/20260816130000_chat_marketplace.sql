-- ------------------------------------------------------------------------------
-- Phase 2D: Marketplace Messaging Schema Extension
-- ------------------------------------------------------------------------------

BEGIN;

-- Add listing_id to support marketplace messaging
ALTER TABLE public.conversations
  ADD COLUMN listing_id UUID REFERENCES public.resale_listings(id) ON DELETE CASCADE;

-- Ensure a conversation belongs to either a delivery request, a resale listing, or neither (direct message), but not both.
ALTER TABLE public.conversations
  ADD CONSTRAINT conversations_exclusive_context 
  CHECK (NOT (request_id IS NOT NULL AND listing_id IS NOT NULL));

COMMIT;
