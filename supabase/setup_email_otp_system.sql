-- ==============================================================================
-- UniVerse: Automated Student Password Reset & Secret OTP Verification
-- ==============================================================================

-- 1. Create OTP storage table
create table if not exists public.student_password_reset_otps (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  otp_code text not null,
  expires_at timestamp with time zone not null,
  is_used boolean default false,
  created_at timestamp with time zone default now()
);

create index if not exists idx_student_otps_email_exp on public.student_password_reset_otps(email, expires_at);

alter table public.student_password_reset_otps enable row level security;

-- Drop previous policies if any
drop policy if exists "Service and anon can access otps" on public.student_password_reset_otps;
create policy "Service and anon can access otps"
  on public.student_password_reset_otps for all
  using (true)
  with check (true);

-- 2. RPC: Generate and store a fresh 6-digit recovery OTP
create or replace function public.generate_and_store_recovery_otp(p_email text)
returns text
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_otp text;
  v_clean_email text;
  v_user_exists boolean;
begin
  v_clean_email := lower(trim(p_email));

  -- Check if user exists in auth.users
  select exists(select 1 from auth.users where lower(email) = v_clean_email) into v_user_exists;

  -- Generate 6-digit random string (100000 to 999999)
  v_otp := (floor(random() * 900000 + 100000))::text;

  -- Invalidate any previous unused OTPs for this email
  update public.student_password_reset_otps
  set is_used = true
  where lower(email) = v_clean_email and is_used = false;

  -- Insert fresh OTP (valid for 15 minutes)
  insert into public.student_password_reset_otps (email, otp_code, expires_at, is_used)
  values (v_clean_email, v_otp, now() + interval '15 minutes', false);

  return v_otp;
end;
$$;

-- 3. RPC: Verify OTP code only (Step 2)
create or replace function public.verify_recovery_otp_code(p_email text, p_otp text)
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_clean_email text;
  v_clean_otp text;
  v_otp_valid boolean;
begin
  v_clean_email := lower(trim(p_email));
  v_clean_otp := trim(p_otp);

  select exists(
    select 1 from public.student_password_reset_otps
    where lower(email) = v_clean_email
      and otp_code = v_clean_otp
      and is_used = false
      and expires_at > now()
  ) into v_otp_valid;

  if not v_otp_valid then
    return jsonb_build_object('success', false, 'error', 'Invalid or expired 6-digit OTP code.');
  end if;

  return jsonb_build_object('success', true, 'message', 'OTP verified successfully!');
end;
$$;

-- 4. RPC: Final password update after OTP verification (Step 3)
create or replace function public.verify_and_update_student_password(
  p_email text,
  p_otp text,
  p_new_password text
)
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_clean_email text;
  v_clean_otp text;
  v_otp_id uuid;
  v_user_id uuid;
begin
  v_clean_email := lower(trim(p_email));
  v_clean_otp := trim(p_otp);

  if length(p_new_password) < 6 then
    return jsonb_build_object('success', false, 'error', 'Password must be at least 6 characters.');
  end if;

  -- Verify OTP
  select id into v_otp_id from public.student_password_reset_otps
  where lower(email) = v_clean_email
    and otp_code = v_clean_otp
    and is_used = false
    and expires_at > now()
  order by created_at desc
  limit 1;

  if v_otp_id is null then
    return jsonb_build_object('success', false, 'error', 'Invalid or expired OTP code. Please request a new code.');
  end if;

  -- Mark OTP as used
  update public.student_password_reset_otps
  set is_used = true
  where id = v_otp_id;

  -- Find user in auth.users
  select id into v_user_id from auth.users where lower(email) = v_clean_email;

  if v_user_id is null then
    return jsonb_build_object('success', false, 'error', 'No student account found with this email address.');
  end if;

  -- Update user password in auth.users
  begin
    update auth.users
    set encrypted_password = extensions.crypt(p_new_password, extensions.gen_salt('bf')),
        email_confirmed_at = coalesce(email_confirmed_at, now()),
        updated_at = now()
    where id = v_user_id;
  exception when others then
    update auth.users
    set encrypted_password = crypt(p_new_password, gen_salt('bf')),
        email_confirmed_at = coalesce(email_confirmed_at, now()),
        updated_at = now()
    where id = v_user_id;
  end;

  return jsonb_build_object('success', true, 'message', 'Password updated successfully!');
end;
$$;

-- Grant permissions
grant all on table public.student_password_reset_otps to anon, authenticated, service_role;
grant execute on function public.generate_and_store_recovery_otp(text) to anon, authenticated, service_role;
grant execute on function public.verify_recovery_otp_code(text, text) to anon, authenticated, service_role;
grant execute on function public.verify_and_update_student_password(text, text, text) to anon, authenticated, service_role;

notify pgrst, 'reload schema';
