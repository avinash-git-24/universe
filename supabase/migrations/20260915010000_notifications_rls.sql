-- ------------------------------------------------------------------------------
-- Notifications RLS & Auto-Notification on Request Creation
-- ------------------------------------------------------------------------------

-- 1. Ensure users can insert and delete their own notifications
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'notifications' AND policyname = 'Users can insert their own notifications'
  ) THEN
    CREATE POLICY "Users can insert their own notifications"
    ON public.notifications FOR INSERT
    WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'notifications' AND policyname = 'Users can delete their own notifications'
  ) THEN
    CREATE POLICY "Users can delete their own notifications"
    ON public.notifications FOR DELETE
    USING (auth.uid() = user_id);
  END IF;
END $$;

-- 2. Trigger to automatically notify requester when request is created
CREATE OR REPLACE FUNCTION public.handle_request_created()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.notifications (user_id, title, message, type, reference_id, is_read)
  VALUES (
    NEW.requester_id,
    '🚀 Request Broadcasted',
    'Your delivery request is live on campus radar! Looking for nearby student runners.',
    'status_broadcasted',
    NEW.id,
    false
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_request_created_notification ON public.delivery_requests;
CREATE TRIGGER on_request_created_notification
  AFTER INSERT ON public.delivery_requests
  FOR EACH ROW EXECUTE PROCEDURE public.handle_request_created();
