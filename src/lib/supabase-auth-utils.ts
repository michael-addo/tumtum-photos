import { supabase } from './supabase-client';

export interface SignInResult {
  success: boolean;
  error?: string;
  session?: any;
  user?: any;
}

export async function signInWithEmail(email: string, password: string): Promise<SignInResult> {
  if (!supabase) {
    return { success: false, error: 'Supabase not configured' };
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, session: data.session, user: data.user };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { success: false, error: message };
  }
}

export async function signInWithMagicLink(email: string): Promise<SignInResult> {
  if (!supabase) {
    return { success: false, error: 'Supabase not configured' };
  }

  try {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/admin`,
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { success: false, error: message };
  }
}

export async function signOut(): Promise<SignInResult> {
  if (!supabase) {
    return { success: false, error: 'Supabase not configured' };
  }

  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { success: false, error: message };
  }
}

export async function resetPassword(email: string): Promise<SignInResult> {
  if (!supabase) {
    return { success: false, error: 'Supabase not configured' };
  }

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/admin/reset-password`,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { success: false, error: message };
  }
}

export async function getCurrentSession(): Promise<any> {
  if (!supabase) {
    return null;
  }

  try {
    const { data } = await supabase.auth.getSession();
    return data.session;
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
}

export async function isAuthenticated(): Promise<boolean> {
  const session = await getCurrentSession();
  return !!session;
}

export async function isAdmin(): Promise<boolean> {
  const session = await getCurrentSession();

  if (!session) {
    return false;
  }

  if (!supabase) {
    return false;
  }

  try {
    const { data } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    return data?.role === 'admin';
  } catch (error) {
    console.error('Error checking admin role:', error);
    return false;
  }
}

