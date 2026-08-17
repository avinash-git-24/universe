-- ==============================================================================
-- PHASE 2F: UniVerse Resale Favorites
-- ==============================================================================

-- 1. Create the resale_favorites table
CREATE TABLE IF NOT EXISTS public.resale_favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    listing_id UUID NOT NULL REFERENCES public.resale_listings(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    -- Prevent duplicate saves
    UNIQUE(user_id, listing_id)
);

-- 2. Indexes for fast lookups
CREATE INDEX IF NOT EXISTS resale_favorites_user_id_idx ON public.resale_favorites(user_id);
CREATE INDEX IF NOT EXISTS resale_favorites_listing_id_idx ON public.resale_favorites(listing_id);

-- 3. Row Level Security
ALTER TABLE public.resale_favorites ENABLE ROW LEVEL SECURITY;

-- SELECT: Users can only see their own favorites
CREATE POLICY "Favorites: users can view their own favorites"
    ON public.resale_favorites
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

-- INSERT: Users can insert for themselves
CREATE POLICY "Favorites: users can insert their own favorites"
    ON public.resale_favorites
    FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

-- DELETE: Users can delete their own favorites
CREATE POLICY "Favorites: users can delete their own favorites"
    ON public.resale_favorites
    FOR DELETE
    TO authenticated
    USING (user_id = auth.uid());

-- UPDATE: No policy. Updates are not permitted on this join table.

-- 4. Reload cache
NOTIFY pgrst, 'reload schema';
