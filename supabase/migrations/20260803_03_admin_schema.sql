-- ------------------------------------------------------------------------------
-- Phase 5D: Admin Dashboard Schema Updates
-- ------------------------------------------------------------------------------

BEGIN;

-- 1. Add 'admin' to user_role ENUM
-- Note: Postgres ALTER TYPE ADD VALUE cannot be executed inside a transaction block in older versions,
-- but Supabase supports it in newer Postgres versions. If it fails, run it separately.
COMMIT;
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'admin';
BEGIN;

-- 2. Add account_status to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS account_status TEXT DEFAULT 'active' NOT NULL;

-- 3. Create Admin RLS helper function
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = user_id AND role = 'admin'::user_role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Admin RLS Policies for Profiles
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can update all profiles" ON public.profiles FOR UPDATE USING (public.is_admin(auth.uid()));

-- 5. Admin RLS Policies for Delivery Requests
CREATE POLICY "Admins can view all requests" ON public.delivery_requests FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can update all requests" ON public.delivery_requests FOR UPDATE USING (public.is_admin(auth.uid()));

-- 6. Admin RLS Policies for Assignments
CREATE POLICY "Admins can view all assignments" ON public.delivery_assignments FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can update all assignments" ON public.delivery_assignments FOR UPDATE USING (public.is_admin(auth.uid()));

COMMIT;
