-- Migration: add 'super_admin' role level
-- Run: npx supabase db push --remote
-- Note: the existing check constraint only allows 'admin'/'viewer'. We add 'super_admin'.
-- The is_admin() security-definer function already treats any role != 'viewer' as admin,
-- so existing RLS policies continue to work without modification.

ALTER TABLE public.user_profiles
  DROP CONSTRAINT IF EXISTS user_profiles_role_check;

ALTER TABLE public.user_profiles
  ADD CONSTRAINT user_profiles_role_check CHECK (role IN ('super_admin', 'admin', 'viewer'));

-- Promote the original admin to super_admin
UPDATE public.user_profiles
SET role = 'super_admin'
WHERE role = 'admin';