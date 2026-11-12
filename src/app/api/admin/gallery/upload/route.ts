import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-client';
import { requireAdmin } from '@/lib/admin-guard';

export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/gallery/upload
 * Body: { path: string, contentType: string, bucket?: string }
 * Returns a signed upload URL so the client can PUT the file directly to
 * Supabase Storage (avoids the 4.5 MB function body limit).
 */
export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (admin instanceof NextResponse) return admin;

  if (!supabase) {
    return NextResponse.json(
      { error: 'not_configured', message: 'Supabase is not configured.' },
      { status: 503 },
    );
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: 'bad_request', message: 'Invalid JSON body.' },
      { status: 400 },
    );
  }

  const { path, contentType, bucket } = body;
  if (!path) {
    return NextResponse.json(
      { error: 'bad_request', message: 'Missing required field: path.' },
      { status: 400 },
    );
  }

  const bucketId = bucket || 'gallery-public';

  try {
    const { data, error } = await supabase.storage
      .from(bucketId)
      .createSignedUploadUrl(path, { upsert: true });

    if (error || !data) {
      return NextResponse.json(
        { error: 'upload_error', message: error?.message || 'Could not create upload URL.' },
        { status: 500 },
      );
    }

    return NextResponse.json({
      signedUrl: data.signedUrl,
      token: data.token,
      path: data.path,
      bucket: bucketId,
      publicUrl: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucketId}/${path}`,
    });
  } catch (error) {
    console.error('Admin gallery upload error:', error);
    return NextResponse.json(
      { error: 'internal_error', message: 'Could not create upload URL.' },
      { status: 500 },
    );
  }
}