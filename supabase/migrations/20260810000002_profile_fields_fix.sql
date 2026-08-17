-- Safely add department and semester fields to the profiles table
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS department TEXT,
  ADD COLUMN IF NOT EXISTS semester TEXT;

-- Force PostgREST to reload its schema cache so the new columns are immediately recognized by the API
NOTIFY pgrst, 'reload schema';
