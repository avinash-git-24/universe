-- ==============================================================================
-- UniVerse — Restore Function Permissions for Authenticated App Users
-- Resolves "permission denied for function user_is_assigned_runner" and all RLS helper evaluations
-- Run this script in your Supabase SQL Editor (Dashboard > SQL Editor)
-- ==============================================================================

BEGIN;

-- 1. Grant execute permissions to authenticated and service_role roles so RLS policies and app features work
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated, service_role;

-- 2. Revoke execute from unauthenticated (anon) and PUBLIC to maintain security
REVOKE EXECUTE ON ALL FUNCTIONS IN SCHEMA public FROM anon, PUBLIC;

-- 3. Explicitly ensure helper functions have immutable search_path
DO $$
DECLARE
  func RECORD;
BEGIN
  FOR func IN 
    SELECT n.nspname, p.proname, pg_get_function_identity_arguments(p.oid) as args
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
  LOOP
    BEGIN
      EXECUTE format('ALTER FUNCTION %I.%I(%s) SET search_path = public, pg_temp', func.nspname, func.proname, func.args);
    EXCEPTION WHEN OTHERS THEN
    END;
  END LOOP;
END $$;

COMMIT;
