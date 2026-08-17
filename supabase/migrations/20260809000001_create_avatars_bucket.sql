-- Insert the avatars bucket if it doesn't exist
insert into storage.buckets (id, name, public) 
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Drop existing policies if any to avoid errors on rerun
drop policy if exists "Avatar images are publicly accessible." on storage.objects;
drop policy if exists "Users can upload their own avatar." on storage.objects;
drop policy if exists "Users can update their own avatar." on storage.objects;
drop policy if exists "Users can delete their own avatar." on storage.objects;

-- Policy 1: Anyone can view avatars
create policy "Avatar images are publicly accessible." 
  on storage.objects for select 
  using ( bucket_id = 'avatars' );

-- Policy 2: Authenticated users can upload an avatar in their own user folder
create policy "Users can upload their own avatar." 
  on storage.objects for insert 
  to authenticated
  with check ( 
    bucket_id = 'avatars' and 
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy 3: Authenticated users can update their own avatar
create policy "Users can update their own avatar." 
  on storage.objects for update
  to authenticated
  using ( 
    bucket_id = 'avatars' and 
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy 4: Authenticated users can delete their own avatar
create policy "Users can delete their own avatar." 
  on storage.objects for delete
  to authenticated
  using ( 
    bucket_id = 'avatars' and 
    (storage.foldername(name))[1] = auth.uid()::text
  );
