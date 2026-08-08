-- Create user_settings table
create table if not exists public.user_settings (
  user_id uuid references public.profiles(id) on delete cascade primary key,
  notify_request_updates boolean default true,
  notify_delivery_updates boolean default true,
  notify_chat_messages boolean default true,
  profile_visibility text default 'public',
  activity_visibility text default 'public',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.user_settings enable row level security;

-- Drop existing policies if any
drop policy if exists "Users can view own settings" on public.user_settings;
drop policy if exists "Users can update own settings" on public.user_settings;
drop policy if exists "Users can insert own settings" on public.user_settings;

-- Create Policies
create policy "Users can view own settings"
  on public.user_settings for select
  using ( auth.uid() = user_id );

create policy "Users can update own settings"
  on public.user_settings for update
  using ( auth.uid() = user_id );

create policy "Users can insert own settings"
  on public.user_settings for insert
  with check ( auth.uid() = user_id );

-- Trigger for updated_at
create trigger handle_updated_at before update on public.user_settings
  for each row execute procedure moddatetime (updated_at);

-- Create a secure RPC function to delete the authenticated user's account
create or replace function public.delete_own_account()
returns void
language plpgsql
security definer -- Elevates privileges so it can delete from auth.users
set search_path = public
as $$
declare
  v_user_id uuid;
begin
  -- Get the currently authenticated user's ID
  v_user_id := auth.uid();
  
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  -- Delete from auth.users (which cascades to profiles, settings, etc.)
  delete from auth.users where id = v_user_id;
end;
$$;
