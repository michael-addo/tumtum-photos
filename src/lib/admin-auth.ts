import { supabase } from '@/lib/supabase-client';

export async function signInWithEmail(email: string, password: string) {
  if (!supabase) throw new Error('Supabase not configured');
  return await supabase.auth.signInWithPassword({ email, password });
}

export async function signUpWithEmail(email: string, password: string) {
  if (!supabase) throw new Error('Supabase not configured');
  return await supabase.auth.signUp({ email, password });
}

export async function signOut() {
  if (!supabase) throw new Error('Supabase not configured');
  return await supabase.auth.signOut();
}

export async function resetPasswordForEmail(email: string) {
  if (!supabase) throw new Error('Supabase not configured');
  return await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/admin/reset-password`,
  });
}