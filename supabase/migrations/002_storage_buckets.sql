-- Storage buckets and access policies for Tumtum Photos
-- Run after 001_initial_schema.sql

-- Create storage buckets
insert into storage.buckets (id, name, public)
values ('gallery-public', 'gallery-public', true),
       ('gallery-private', 'gallery-private', false),
       ('enquiry-attachments', 'enquiry-attachments', false);

-- Policy: Allow public read access to gallery-public bucket
create policy "Allow public read access" on storage.objects
  for select using (bucket_id = 'gallery-public');

create policy "Allow authenticated list access" on storage.objects
  for select using (bucket_id = 'gallery-public');

-- Policy: Only admins can upload to gallery buckets (uses security-definer is_admin() to avoid RLS recursion)
create policy "Only admins can upload to gallery-public" on storage.objects
  for insert with check (
    bucket_id = 'gallery-public'
    and auth.uid() is not null
    and public.is_admin(auth.uid())
  );

create policy "Only admins can update gallery-public" on storage.objects
  for update using (
    bucket_id = 'gallery-public'
    and auth.uid() is not null
    and public.is_admin(auth.uid())
  );

create policy "Only admins can delete gallery-public" on storage.objects
  for delete using (
    bucket_id = 'gallery-public'
    and auth.uid() is not null
    and public.is_admin(auth.uid())
  );

-- Policy: Hide private bucket objects
create policy "Hide gallery-private objects" on storage.objects
  for all using (false);

-- Policy: Only admins can upload/delete from private bucket
create policy "Only admins can upload to gallery-private" on storage.objects
  for insert with check (
    bucket_id = 'gallery-private'
    and auth.uid() is not null
    and public.is_admin(auth.uid())
  );

create policy "Only admins can delete gallery-private" on storage.objects
  for delete using (
    bucket_id = 'gallery-private'
    and auth.uid() is not null
    and public.is_admin(auth.uid())
  );

-- Policy: Only admins can access enquiry attachments
create policy "Only admins can access enquiry attachments" on storage.objects
  for all using (
    bucket_id = 'enquiry-attachments'
    and auth.uid() is not null
    and public.is_admin(auth.uid())
  );