import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-client';
import { requireAdmin } from '@/lib/admin-guard';

export const dynamic = 'force-dynamic';

export async function GET() {
  const admin = await requireAdmin();
  if (admin instanceof NextResponse) return admin;

  if (!supabase) {
    return NextResponse.json(
      { error: 'not_configured', message: 'Supabase is not configured.' },
      { status: 503 },
    );
  }

  try {
    const [{ data: collections, error: cErr }, { data: images, error: iErr }] =
      await Promise.all([
        supabase.from('gallery_collections').select('*').order('sort_order'),
        supabase.from('gallery_images').select('*').order('sort_order'),
      ]);

    if (cErr) throw cErr;
    if (iErr) throw iErr;

    return NextResponse.json({ collections: collections || [], images: images || [] });
  } catch (error) {
    console.error('Admin gallery fetch error:', error);
    return NextResponse.json(
      { error: 'internal_error', message: 'Could not load gallery data.' },
      { status: 500 },
    );
  }
}

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

  const { action } = body;

  // Create a new gallery image record (the file itself must already be uploaded)
  if (action === 'create_image') {
    const { id, collection_slug, storage_bucket_id, path, alt_text, caption, width, height, featured, sort_order } = body;
    if (!id || !collection_slug || !storage_bucket_id || !path || !alt_text || !width || !height) {
      return NextResponse.json(
        { error: 'bad_request', message: 'Missing required fields: id, collection_slug, storage_bucket_id, path, alt_text, width, height.' },
        { status: 400 },
      );
    }
    const { data, error } = await supabase
      .from('gallery_images')
      .insert({
        id,
        collection_slug,
        storage_bucket_id,
        path,
        alt_text,
        caption: caption || null,
        width: Number(width),
        height: Number(height),
        featured: Boolean(featured),
        sort_order: sort_order != null ? Number(sort_order) : 0,
      })
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json({ image: data }, { status: 201 });
  }

  // Create a new collection
  if (action === 'create_collection') {
    const { slug, title, description, sort_order } = body;
    if (!slug || !title) {
      return NextResponse.json(
        { error: 'bad_request', message: 'Missing required fields: slug, title.' },
        { status: 400 },
      );
    }
    const { data, error } = await supabase
      .from('gallery_collections')
      .insert({
        slug,
        title,
        description: description || null,
        sort_order: sort_order != null ? Number(sort_order) : 0,
      })
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json({ collection: data }, { status: 201 });
  }

  return NextResponse.json(
    { error: 'bad_request', message: `Unknown action: ${action}` },
    { status: 400 },
  );
}