-- Verify role values in user_profiles
SELECT id, email, role, created_at FROM public.user_profiles ORDER BY created_at;