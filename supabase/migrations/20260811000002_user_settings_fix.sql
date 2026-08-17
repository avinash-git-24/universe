-- Safely create user_settings table if it does not already exist
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

-- Ensure RLS is enabled
alter table public.user_settings enable row level security;

-- Safely recreate policies
drop policy if exists "Users can view own settings" on public.user_settings;
drop policy if exists "Users can update own settings" on public.user_settings;
drop policy if exists "Users can insert own settings" on public.user_settings;

create policy "Users can view own settings"
  on public.user_settings for select
  using ( auth.uid() = user_id );

create policy "Users can update own settings"
  on public.user_settings for update
  using ( auth.uid() = user_id );

create policy "Users can insert own settings"
  on public.user_settings for insert
  with check ( auth.uid() = user_id );

-- Force PostgREST to reload its schema cache so the table is immediately recognized by the API
NOTIFY pgrst, 'reload schema';
