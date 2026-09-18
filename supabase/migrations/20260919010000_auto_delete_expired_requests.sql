-- Migration: 20260919010000_auto_delete_expired_requests.sql
-- Description: Automatically delete and clean up unaccepted delivery requests older than 6 hours.

-- 1. Enable DELETE policy for requesters on their pending delivery requests
DROP POLICY IF EXISTS "Users can delete their own pending requests" ON public.delivery_requests;
CREATE POLICY "Users can delete their own pending requests"
  ON public.delivery_requests
  FOR DELETE
  USING (auth.uid() = requester_id AND status = 'pending');

-- 2. Function to safely purge all unaccepted pending requests older than 6 hours
CREATE OR REPLACE FUNCTION public.cleanup_expired_delivery_requests()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count integer;
BEGIN
  -- Delete pending requests that have been waiting for more than 6 hours without acceptance
  DELETE FROM public.delivery_requests
  WHERE status = 'pending'
    AND created_at < (now() - interval '6 hours');

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- 3. Grant execute permissions on cleanup function
GRANT EXECUTE ON FUNCTION public.cleanup_expired_delivery_requests() TO authenticated, service_role, anon;
