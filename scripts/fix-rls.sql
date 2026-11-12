drop policy if exists "Admins can view all profiles" on public.user_profiles;
drop policy if exists "Admins can view enquiries" on public.enquiries;
drop policy if exists "Admins can delete enquiries" on public.enquiries;
drop policy if exists "Admins can manage collections" on public.gallery_collections;
drop policy if exists "Admins can manage gallery images" on public.gallery_images;

create policy "Admins can view all profiles" on public.user_profiles
  for select using (public.is_admin(auth.uid()));

create policy "Admins can view enquiries" on public.enquiries
  for select using (public.is_admin(auth.uid()));

create policy "Admins can delete enquiries" on public.enquiries
  for delete using (public.is_admin(auth.uid()));

create policy "Admins can manage collections" on public.gallery_collections
  for all using (public.is_admin(auth.uid()));

create policy "Admins can manage gallery images" on public.gallery_images
  for all using (public.is_admin(auth.uid()));