-- ==============================================================================
-- UniVerse — Setup 4-Digit Delivery OTP Verification
-- Run this script in your Supabase SQL Editor (Dashboard > SQL Editor)
-- ==============================================================================

BEGIN;

-- 1. Add delivery_otp column to delivery_requests
ALTER TABLE public.delivery_requests
ADD COLUMN IF NOT EXISTS delivery_otp VARCHAR(6) DEFAULT lpad((floor(random() * 9000) + 1000)::text, 4, '0');

-- 2. Populate OTP for all existing requests that don't have one
UPDATE public.delivery_requests
SET delivery_otp = lpad((floor(random() * 9000) + 1000)::text, 4, '0')
WHERE delivery_otp IS NULL;

-- 3. Trigger to auto-generate a 4-digit OTP when a new request is created
CREATE OR REPLACE FUNCTION public.generate_delivery_otp()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.delivery_otp IS NULL OR NEW.delivery_otp = '' THEN
    NEW.delivery_otp := lpad((floor(random() * 9000) + 1000)::text, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS on_delivery_request_generate_otp ON public.delivery_requests;
CREATE TRIGGER on_delivery_request_generate_otp
  BEFORE INSERT ON public.delivery_requests
  FOR EACH ROW EXECUTE FUNCTION public.generate_delivery_otp();

-- 4. Secure RPC function for Runner to verify OTP and complete delivery
CREATE OR REPLACE FUNCTION public.verify_and_complete_delivery(
  p_request_id UUID,
  p_entered_otp TEXT
)
RETURNS JSONB AS $$
DECLARE
  v_runner_id UUID;
  v_actual_otp TEXT;
  v_current_status TEXT;
  v_is_assigned BOOLEAN;
BEGIN
  v_runner_id := auth.uid();
  IF v_runner_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'UNAUTHENTICATED', 'message', 'You must be logged in.');
  END IF;

  -- 1. Check that runner is assigned to this active delivery
  SELECT EXISTS (
    SELECT 1 FROM public.delivery_assignments
    WHERE request_id = p_request_id
      AND runner_id = v_runner_id
      AND status = 'active'
  ) INTO v_is_assigned;

  IF NOT v_is_assigned THEN
    -- Also allow admin
    IF NOT public.is_admin(v_runner_id) THEN
      RETURN jsonb_build_object('success', false, 'error', 'NOT_ASSIGNED', 'message', 'You are not the assigned runner for this delivery.');
    END IF;
  END IF;

  -- 2. Fetch current status and actual OTP
  SELECT status, delivery_otp INTO v_current_status, v_actual_otp
  FROM public.delivery_requests
  WHERE id = p_request_id;

  IF v_current_status = 'delivered' THEN
    RETURN jsonb_build_object('success', true, 'message', 'This request is already delivered.');
  END IF;

  IF v_current_status = 'cancelled' THEN
    RETURN jsonb_build_object('success', false, 'error', 'CANCELLED', 'message', 'This delivery request was cancelled.');
  END IF;

  -- 3. Validate entered OTP against actual OTP
  IF trim(p_entered_otp) != trim(v_actual_otp) THEN
    RETURN jsonb_build_object('success', false, 'error', 'INVALID_OTP', 'message', 'Invalid Delivery PIN! Please ask the student for the 4-digit code.');
  END IF;

  -- 4. Mark request delivered and assignment completed
  UPDATE public.delivery_requests
  SET status = 'delivered', updated_at = now()
  WHERE id = p_request_id;

  UPDATE public.delivery_assignments
  SET status = 'completed', completed_at = now()
  WHERE request_id = p_request_id AND status = 'active';

  RETURN jsonb_build_object('success', true, 'message', 'Delivery successfully verified and completed!');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- 5. Grant execute permissions on the verification function
GRANT EXECUTE ON FUNCTION public.verify_and_complete_delivery(UUID, TEXT) TO authenticated, service_role;

COMMIT;
