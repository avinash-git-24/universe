-- ==============================================================================
-- Fix: Mutual RLS recursion between delivery_requests and delivery_assignments
-- ==============================================================================

BEGIN;

CREATE OR REPLACE FUNCTION public.is_requester_of_request(p_request_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $func$
  SELECT EXISTS (
    SELECT 1 FROM public.delivery_requests
    WHERE id = p_request_id
      AND requester_id = auth.uid()
  );
$func$;

DROP POLICY IF EXISTS "Requesters can view assignments for their requests"
  ON public.delivery_assignments;

CREATE POLICY "Requesters can view assignments for their requests"
  ON public.delivery_assignments
  FOR SELECT
  TO authenticated
  USING (public.is_requester_of_request(request_id));

NOTIFY pgrst, 'reload schema';

COMMIT;
