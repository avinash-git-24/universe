-- ==============================================================================
-- UniVerse: RLS Policy Fixes + Missing Policies
-- Fixes:
--   1. Runners can now UPDATE delivery_requests status (accept, pick_up, etc.)
--   2. Runners can UPDATE delivery_requests they are assigned to
--   3. Profiles INSERT policy added (for safety alongside trigger)
--   4. request_status enum gets 'in_transit' value added
--   5. account_status column added to profiles (missing from init)
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. Add 'in_transit' to request_status enum (if not already present)
-- ------------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum
    WHERE enumlabel = 'in_transit'
      AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'request_status')
  ) THEN
    ALTER TYPE request_status ADD VALUE 'in_transit' AFTER 'picked_up';
  END IF;
END;
$$;

-- ------------------------------------------------------------------------------
-- 2. Add account_status column to profiles (if missing)
-- ------------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'profiles'
      AND column_name  = 'account_status'
  ) THEN
    ALTER TABLE public.profiles
      ADD COLUMN account_status TEXT NOT NULL DEFAULT 'active';
  END IF;
END;
$$;

-- ------------------------------------------------------------------------------
-- 3. Drop the restrictive UPDATE policy on delivery_requests
--    (it only allowed requesters to update, blocking runners from accepting)
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can update their own requests" ON public.delivery_requests;

-- 3a. Requesters can update their own requests (cancel, edit while pending)
CREATE POLICY "Requesters can update their own requests"
  ON public.delivery_requests
  FOR UPDATE
  USING (auth.uid() = requester_id);

-- 3b. Runners can update status of requests they are ASSIGNED to
CREATE POLICY "Runners can update assigned request status"
  ON public.delivery_requests
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.delivery_assignments
      WHERE request_id = public.delivery_requests.id
        AND runner_id  = auth.uid()
    )
  );

-- 3c. Any authenticated runner can accept a PENDING request
--     (the acceptRequest() function sets status='accepted' before creating assignment)
CREATE POLICY "Runners can accept pending requests"
  ON public.delivery_requests
  FOR UPDATE
  USING (
    status = 'pending'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id   = auth.uid()
        AND role IN ('runner', 'student')  -- allow all authenticated users to accept
    )
  );

-- ------------------------------------------------------------------------------
-- 4. Profiles INSERT policy (safety net alongside trigger)
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

CREATE POLICY "Users can insert their own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ------------------------------------------------------------------------------
-- 5. Allow runners to view ALL pending requests regardless of role
--    (fixes issue where role = 'student' couldn't see requests on runner page)
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Runners can view pending requests" ON public.delivery_requests;

CREATE POLICY "Authenticated users can view pending requests"
  ON public.delivery_requests
  FOR SELECT
  USING (
    status = 'pending'
    AND auth.uid() IS NOT NULL
  );

-- ------------------------------------------------------------------------------
-- 6. Allow all authenticated users to view requests they are assigned to
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Runners can view accepted requests they are assigned to" ON public.delivery_requests;

CREATE POLICY "Users can view requests they are assigned to"
  ON public.delivery_requests
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.delivery_assignments
      WHERE request_id = public.delivery_requests.id
        AND runner_id  = auth.uid()
    )
  );
