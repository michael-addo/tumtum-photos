-- Migration 005: super_admin support, helper functions for admin management
-- Run: npx supabase db push --remote

-- 1. Update is_admin() to accept both 'super_admin' and 'admin' roles
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = user_id AND up.role IN ('super_admin', 'admin')
  );
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- 2. Add is_super_admin() helper
CREATE OR REPLACE FUNCTION public.is_super_admin(user_id uuid)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = user_id AND up.role = 'super_admin'
  );
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- 3. Update promote_to_admin() to only allow super_admin callers
CREATE OR REPLACE FUNCTION public.promote_to_admin(user_uuid uuid)
RETURNS void AS $$
BEGIN
  IF NOT public.is_super_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Only super admins can promote users to admin';
  END IF;

  INSERT INTO public.user_profiles (id, email, role, display_name)
  VALUES (
    user_uuid,
    (SELECT email FROM auth.users WHERE id = user_uuid),
    'admin',
    NULL
  )
  ON CONFLICT (id) DO UPDATE SET
    role = 'admin',
    updated_at = now();
END;
$$ LANGUAGE PLPGSQL SECURITY DEFINER;

-- 4. RPC to look up a user by email (for admin lookup)
CREATE OR REPLACE FUNCTION public.get_user_by_email(email_input text)
RETURNS TABLE(id text, email text) AS $$
  SELECT up.id::text, up.email
  FROM public.user_profiles up
  WHERE up.email = email_input;
$$ LANGUAGE SQL STABLE SECURITY DEFINER;