-- Initial schema for Tumum Photos Supabase database
-- Run this in your Supabase SQL Editor or via: npx supabase db push

-- ============================================
-- User Profiles (extends Supabase Auth)
-- ============================================
create table public.user_profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  role text not null default 'viewer' check (role in ('admin', 'viewer')),
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_user_profiles_email on public.user_profiles(email);
create index idx_user_profiles_role on public.user_profiles(role);

-- ============================================
-- Enquiries
-- ============================================
create table public.enquiries (
  id uuid default gen_random_uuid() primary key,
  name text not null check (char_length(name) <= 120),
  email text not null check (char_length(email) <= 254),
  phone text check (char_length(phone) <= 40),
  shoot_type text not null check (shoot_type in ('solo', 'duo', 'group', 'after-party', 'dinner', 'location', 'other')),
  event_date date,
  budget text check (budget in ('ghc-400', 'ghc-500', 'ghc-600', 'ghc-700', 'ghc-1000-plus', 'unsure')),
  message text not null check (char_length(message) >= 10 and char_length(message) <= 4000),
  ip_address inet,
  honeypot boolean not null default false,
  created_at timestamptz not null default now()
);

create index idx_enquiries_created_at on public.enquiries(created_at desc);
create index idx_enquiries_shoot_type on public.enquiries(shoot_type);
create index idx_enquiries_email on public.enquiries(email);

-- ============================================
-- Gallery Collections & Images
-- ============================================
create table public.gallery_collections (
  slug text primary key,
  title text not null,
  description text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.gallery_images (
  id text primary key,
  collection_slug text not null references public.gallery_collections(slug) on delete restrict,
  storage_bucket_id text not null,
  path text not null,
  alt_text text not null,
  caption text,
  width integer not null check (width > 0),
  height integer not null check (height > 0),
  featured boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_gallery_images_collection on public.gallery_images(collection_slug);
create index idx_gallery_images_featured on public.gallery_images(featured) where featured = true;
create index idx_gallery_images_sort on public.gallery_images(collection_slug, sort_order);

-- ============================================
-- Row Level Security (RLS)
-- ============================================
alter table public.user_profiles enable row level security;
alter table public.enquiries enable row level security;
alter table public.gallery_collections enable row level security;
alter table public.gallery_images enable row level security;

-- user_profiles policies
create policy "Users can view own profile" on public.user_profiles for select using (auth.uid() = id);
create policy "Admins can view all profiles" on public.user_profiles for select using (public.is_admin(auth.uid()));

-- enquiries policies
create policy "Anyone can insert enquiries" on public.enquiries for insert with check (true);
create policy "Admins can view enquiries" on public.enquiries for select using (public.is_admin(auth.uid()));
create policy "Admins can delete enquiries" on public.enquiries for delete using (public.is_admin(auth.uid()));

-- gallery_collections policies
create policy "Public can view collections" on public.gallery_collections for select using (true);
create policy "Admins can manage collections" on public.gallery_collections for all using (public.is_admin(auth.uid()));

-- gallery_images policies
create policy "Public can view gallery images" on public.gallery_images for select using (true);
create policy "Admins can manage gallery images" on public.gallery_images for all using (public.is_admin(auth.uid()));

-- ============================================
-- Triggers for updated_at
-- ============================================
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger handle_user_profiles_updated_at
  before update on public.user_profiles
  for each row execute procedure public.handle_updated_at();

create trigger handle_gallery_images_updated_at
  before update on public.gallery_images
  for each row execute procedure public.handle_updated_at();

create trigger handle_gallery_collections_updated_at
  before update on public.gallery_collections
  for each row execute procedure public.handle_updated_at();

-- ============================================
-- Helper Views & Functions
-- ============================================
create or replace view public.vw_gallery_images as
select
  gi.id,
  gi.collection_slug,
  gc.title as collection_title,
  gi.storage_bucket_id,
  gi.path,
  gi.alt_text,
  gi.caption,
  gi.width,
  gi.height,
  gi.featured,
  gi.sort_order,
  gi.created_at,
  gi.updated_at
from public.gallery_images gi
join public.gallery_collections gc on gi.collection_slug = gc.slug
order by gi.collection_slug, gi.sort_order;

create or replace function public.get_current_user_role()
returns text as $$
  select role from public.user_profiles where id = auth.uid();
$$ language sql stable security definer;

create or replace function public.is_admin(user_id uuid)
returns boolean as $$
  select exists (select 1 from public.user_profiles up where up.id = user_id and up.role = 'admin');
$$ language sql stable security definer;

create or replace function public.promote_to_admin(user_uuid uuid)
returns void as $$
begin
  insert into public.user_profiles (id, email, role, display_name)
  values (
    user_uuid,
    (select email from auth.users where id = user_uuid),
    'admin',
    null
  )
  on conflict (id) do update set
    role = 'admin',
    updated_at = now();
end;
$$ language plpgsql security definer;
