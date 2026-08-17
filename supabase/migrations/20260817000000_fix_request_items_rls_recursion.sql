-- ==============================================================================
-- Fix: Infinite recursion in request_items RLS policy
--
-- Root cause:
--   The "Users can view items of requests they can view" policy on request_items
--   queries delivery_requests. When getStudentRequests does a nested join
--   items:request_items(*), Postgres evaluates the request_items RLS, which
--   queries delivery_requests, which evaluates delivery_requests RLS, causing
--   infinite recursion (error code 42P17).
--
-- Fix:
--   Replace the recursive policy with a direct ownership check.
-- ==============================================================================

BEGIN;

DROP POLICY IF EXISTS "Users can view items of requests they can view"
  ON public.request_items;

CREATE POLICY "Users can view items of their own or assigned requests"
  ON public.request_items
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.delivery_requests dr
      WHERE dr.id = public.request_items.request_id
        AND dr.requester_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM public.delivery_assignments da
      WHERE da.request_id = public.request_items.request_id
        AND da.runner_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM public.delivery_requests dr
      WHERE dr.id = public.request_items.request_id
        AND dr.status = 'pending'
    )
  );

NOTIFY pgrst, 'reload schema';

COMMIT;
