-- ------------------------------------------------------------------------------
-- Broadcast New Delivery Request Notifications to Campus Runners & Students
-- ------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.handle_request_created()
RETURNS TRIGGER AS $$
BEGIN
  -- 1. Notify the requester that their delivery request was broadcasted
  IF NOT EXISTS (
    SELECT 1 FROM public.notifications 
    WHERE user_id = NEW.requester_id AND reference_id = NEW.id AND type = 'status_broadcasted'
  ) THEN
    INSERT INTO public.notifications (user_id, title, message, type, reference_id, is_read)
    VALUES (
      NEW.requester_id,
      '🚀 Request Broadcasted',
      'Your delivery request is live on campus radar! Looking for nearby student runners.',
      'status_broadcasted',
      NEW.id,
      false
    );
  END IF;

  -- 2. Notify all other campus members / runners about this new order opportunity
  INSERT INTO public.notifications (user_id, title, message, type, reference_id, is_read)
  SELECT 
    p.id,
    '📦 New Delivery Request Nearby!',
    'A student just requested an order (' || COALESCE(NEW.pickup_location, 'Campus') || ' ➔ ' || COALESCE(NEW.dropoff_location, 'Hostel') || '). Tap to accept & earn!',
    'new_request_available',
    NEW.id,
    false
  FROM public.profiles p
  WHERE p.id <> NEW.requester_id
    AND NOT EXISTS (
      SELECT 1 FROM public.notifications n
      WHERE n.user_id = p.id AND n.reference_id = NEW.id AND n.type = 'new_request_available'
    );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure trigger is active
DROP TRIGGER IF EXISTS on_request_created_notification ON public.delivery_requests;
CREATE TRIGGER on_request_created_notification
  AFTER INSERT ON public.delivery_requests
  FOR EACH ROW EXECUTE PROCEDURE public.handle_request_created();
