-- ------------------------------------------------------------------------------
-- Phase 5C: Notifications & Real-Time Updates
-- ------------------------------------------------------------------------------

-- 1. Enable Supabase Realtime for required tables
-- Supabase uses a publication called `supabase_realtime` to broadcast changes.
BEGIN;
  -- Create publication if it doesn't exist (Supabase usually has this by default, but safe to ensure)
  -- DO NOT CREATE it manually, just add tables to it.
  ALTER PUBLICATION supabase_realtime ADD TABLE public.delivery_requests;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
COMMIT;

-- 2. Function to automatically create notifications on request status changes
CREATE OR REPLACE FUNCTION public.handle_request_status_change()
RETURNS TRIGGER AS $$
DECLARE
    notification_title TEXT;
    notification_message TEXT;
    notification_type TEXT;
BEGIN
    -- Only trigger if the status has actually changed
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        
        -- Determine notification content based on the new status
        IF NEW.status = 'accepted' THEN
            notification_title := 'Request Accepted';
            notification_message := 'A runner has accepted your delivery request.';
            notification_type := 'status_accepted';
        ELSIF NEW.status = 'picked_up' THEN
            notification_title := 'Order Picked Up';
            notification_message := 'Your runner has picked up the items and is on the way.';
            notification_type := 'status_picked_up';
        ELSIF NEW.status = 'delivered' THEN
            notification_title := 'Delivery Complete';
            notification_message := 'Your order has been delivered successfully!';
            notification_type := 'status_delivered';
        ELSIF NEW.status = 'cancelled' THEN
            notification_title := 'Request Cancelled';
            notification_message := 'Your delivery request was cancelled.';
            notification_type := 'status_cancelled';
        ELSE
            -- We don't want to notify on other statuses (e.g. pending)
            RETURN NEW;
        END IF;

        -- Insert the notification for the student (requester)
        INSERT INTO public.notifications (user_id, title, message, type, reference_id)
        VALUES (NEW.requester_id, notification_title, notification_message, notification_type, NEW.id);
        
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Attach the trigger to the delivery_requests table
DROP TRIGGER IF EXISTS on_request_status_changed ON public.delivery_requests;
CREATE TRIGGER on_request_status_changed
    AFTER UPDATE OF status ON public.delivery_requests
    FOR EACH ROW EXECUTE PROCEDURE public.handle_request_status_change();

-- 4. Notification RLS Policies (Ensure users can update their own to mark as read)
-- Note: SELECT and UPDATE are already handled in the init migration.
-- Let's just ensure UPDATE allows setting is_read to true.
-- (The existing policy in init.sql is: "Users can update their own notifications")
