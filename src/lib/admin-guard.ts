import { NextResponse } from 'next/server';
import { supabase } from './supabase-client';

export interface AdminSession {
  userId: string;
  role: 'super_admin' | 'admin' | 'viewer';
}

/**
 * Verifies the request is from an authenticated admin.
 * Returns an AdminSession on success, or a NextResponse error on failure.
 * Safe to call from API routes (no `await` needed on the error path).
 */
export async function requireAdmin(): Promise<AdminSession | NextResponse> {
  if (!supabase) {
    return NextResponse.json(
      { error: 'not_configured', message: 'Supabase is not configured.' },
      { status: 503 },
    );
  }

  const { data: { session }, error: authError } = await supabase.auth.getSession();

  if (authError || !session) {
    return NextResponse.json(
      { error: 'unauthorized', message: 'Authentication required.' },
      { status: 401 },
    );
  }

  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', session.user.id)
    .single();

  if (profileError || !profile) {
    return NextResponse.json(
      { error: 'forbidden', message: 'Admin access required.' },
      { status: 403 },
    );
  }

  const role = profile.role as 'super_admin' | 'admin' | 'viewer';
  if (role !== 'admin' && role !== 'super_admin') {
    return NextResponse.json(
      { error: 'forbidden', message: 'Admin access required.' },
      { status: 403 },
    );
  }

  return { userId: session.user.id, role };
}