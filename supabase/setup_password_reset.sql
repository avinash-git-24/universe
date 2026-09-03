-- ==============================================================================
-- UniVerse: Reset Student Password Function with pgcrypto extension support
-- ==============================================================================

create extension if not exists "pgcrypto" with schema extensions;

create or replace function public.reset_student_password(
  p_email text,
  p_new_password text
)
returns jsonb
language plpgsql
security definer
set search_path = public, auth, extensions
as $$
declare
  v_user_id uuid;
  v_clean_email text;
begin
  v_clean_email := lower(trim(p_email));

  if v_clean_email not like '%@marwadiuniversity.ac.in' then
    return jsonb_build_object('success', false, 'error', 'Only @marwadiuniversity.ac.in emails are allowed.');
  end if;

  if length(p_new_password) < 6 then
    return jsonb_build_object('success', false, 'error', 'Password must be at least 6 characters.');
  end if;

  select id into v_user_id from auth.users where lower(email) = v_clean_email;
  
  if v_user_id is null then
    return jsonb_build_object('success', false, 'error', 'No student account found with this email.');
  end if;

  update auth.users
  set encrypted_password = extensions.crypt(p_new_password, extensions.gen_salt('bf')),
      email_confirmed_at = coalesce(email_confirmed_at, now()),
      updated_at = now()
  where id = v_user_id;

  return jsonb_build_object('success', true, 'message', 'Password updated successfully!');
end;
$$;

grant execute on function public.reset_student_password(text, text) to anon, authenticated, service_role;
notify pgrst, 'reload schema';
