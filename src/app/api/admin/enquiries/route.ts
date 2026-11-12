import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-client';

export async function GET(req: NextRequest) {
  if (!supabase) {
    return NextResponse.json(
      { error: 'unauthorized', message: 'Authentication required.' },
      { status: 401 },
    );
  }

  // Get session
  const { data: { session }, error: authError } = await supabase.auth.getSession();

  if (authError || !session) {
    return NextResponse.json(
      { error: 'unauthorized', message: 'Authentication required.' },
      { status: 401 },
    );
  }

  // Verify user has admin role
  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', session.user.id)
    .single();

  if (profileError || !profile || (profile.role !== 'admin' && profile.role !== 'super_admin')) {
    return NextResponse.json(
      { error: 'forbidden', message: 'Admin access required.' },
      { status: 403 },
    );
  }

  const rawLimit = req.nextUrl.searchParams.get('limit');
  const limit = rawLimit ? Math.min(1000, Math.max(1, Number(rawLimit) || 200)) : 200;

  try {
    const { data: enquiries, error } = await supabase
      .from('enquiries')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return NextResponse.json({ enquiries });
  } catch (error) {
    console.error('Admin enquiries error:', error);
    return NextResponse.json(
      { error: 'internal_error', message: 'Could not load enquiries.' },
      { status: 500 },
    );
  }
}