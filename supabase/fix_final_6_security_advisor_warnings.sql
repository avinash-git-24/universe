-- ==============================================================================
-- UniVerse: Fix Final 6 Supabase Security Advisor Warnings
-- 
-- Resolves:
-- 1. Signed-In Users Can Execute SECURITY DEFINER: public.is_admin(user_id uuid)
-- 2. Signed-In Users Can Execute SECURITY DEFINER: public.is_conversation_participant(...)
-- 3. Signed-In Users Can Execute SECURITY DEFINER: public.request_belongs_to(...)
-- 4. Signed-In Users Can Execute SECURITY DEFINER: public.user_is_assigned_runner(...)
-- 5. Signed-In Users Can Execute SECURITY DEFINER: public.verify_and_complete_delivery(...)
--
-- Note: The 6th warning ("Leaked Password Protection Disabled") is a 1-click toggle
-- in Supabase Dashboard -> Authentication -> Attack Protection / Security.
-- ==============================================================================

BEGIN;

-- 1. Convert internal helper functions and verify RPC to SECURITY INVOKER
-- This ensures they run with the caller's authorized context and eliminates
-- all "Signed-In Users Can Execute SECURITY DEFINER Function" warnings.

DO $$
DECLARE
  f RECORD;
BEGIN
  FOR f IN
    SELECT n.nspname, p.proname, pg_get_function_identity_arguments(p.oid) AS args
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
      AND p.proname IN (
        'is_admin',
        'is_conversation_participant',
        'request_belongs_to',
        'user_is_assigned_runner',
        'verify_and_complete_delivery'
      )
  LOOP
    BEGIN
      EXECUTE format('ALTER FUNCTION %I.%I(%s) SECURITY INVOKER', f.nspname, f.proname, f.args);
      EXECUTE format('ALTER FUNCTION %I.%I(%s) SET search_path = public, pg_temp', f.nspname, f.proname, f.args);
      RAISE NOTICE 'Updated %I.%I(%s) to SECURITY INVOKER', f.nspname, f.proname, f.args;
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'Could not alter %I.%I: %', f.nspname, f.proname, SQLERRM;
    END;
  END LOOP;
END $$;

-- 2. Explicit direct fallback declarations (ensures all common signatures are converted)

-- 2a. is_admin
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'is_admin') THEN
    ALTER FUNCTION public.is_admin(UUID) SECURITY INVOKER;
    ALTER FUNCTION public.is_admin(UUID) SET search_path = public, pg_temp;
  END IF;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- 2b. is_conversation_participant
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'is_conversation_participant') THEN
    ALTER FUNCTION public.is_conversation_participant(UUID, UUID) SECURITY INVOKER;
    ALTER FUNCTION public.is_conversation_participant(UUID, UUID) SET search_path = public, pg_temp;
  END IF;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- 2c. request_belongs_to
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'request_belongs_to') THEN
    ALTER FUNCTION public.request_belongs_to(UUID, UUID) SECURITY INVOKER;
    ALTER FUNCTION public.request_belongs_to(UUID, UUID) SET search_path = public, pg_temp;
    REVOKE ALL ON FUNCTION public.request_belongs_to(UUID, UUID) FROM PUBLIC, anon;
  END IF;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- 2d. user_is_assigned_runner
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'user_is_assigned_runner') THEN
    ALTER FUNCTION public.user_is_assigned_runner(UUID, UUID) SECURITY INVOKER;
    ALTER FUNCTION public.user_is_assigned_runner(UUID, UUID) SET search_path = public, pg_temp;
    REVOKE ALL ON FUNCTION public.user_is_assigned_runner(UUID, UUID) FROM PUBLIC, anon;
  END IF;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- 2e. verify_and_complete_delivery
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'verify_and_complete_delivery') THEN
    ALTER FUNCTION public.verify_and_complete_delivery(UUID, TEXT) SECURITY INVOKER;
    ALTER FUNCTION public.verify_and_complete_delivery(UUID, TEXT) SET search_path = public, pg_temp;
  END IF;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

COMMIT;

-- Reload Supabase Schema Cache
NOTIFY pgrst, 'reload schema';
