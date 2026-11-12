-- Seed data for Tumtum Photos
-- Run after 001_initial_schema.sql

-- Insert default gallery collections
insert into public.gallery_collections (slug, title, description, sort_order)
values
  ('solo', 'Solo', 'Individual graduation portraits', 1),
  ('duo', 'Duo', 'Graduations with a partner or family member', 2),
  ('location', 'On Location', 'Outdoor graduation photography', 3);

-- Note: Gallery images should be uploaded to Supabase Storage manually
-- After upload, insert records into public.gallery_images like:
-- insert into public.gallery_images (id, collection_slug, storage_bucket_id, path, alt_text, caption, width, height, featured, sort_order)
-- values ('photo-id', 'solo', 'gallery-public', 'solo/photo.jpg', 'Alt text', 'Caption', 1600, 1067, true, 1);
