import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-client';
import { requireAdmin } from '@/lib/admin-guard';

export const dynamic = 'force-dynamic';

// PATCH /api/admin/gallery/[id]?kind=image|collection
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const admin = await requireAdmin();
  if (admin instanceof NextResponse) return admin;

  if (!supabase) {
    return NextResponse.json(
      { error: 'not_configured', message: 'Supabase is not configured.' },
      { status: 503 },
    );
  }

  const url = new URL(req.url);
  const kind = url.searchParams.get('kind') || 'image';

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: 'bad_request', message: 'Invalid JSON body.' },
      { status: 400 },
    );
  }

  try {
    if (kind === 'collection') {
      const { title, description, sort_order } = body;
      const { data, error } = await supabase
        .from('gallery_collections')
        .update({
          title: title ?? undefined,
          description: description ?? undefined,
          sort_order: sort_order != null ? Number(sort_order) : undefined,
        })
        .eq('slug', params.id)
        .select()
        .single();
      if (error) throw error;
      return NextResponse.json({ collection: data });
    }

    // image
    const { collection_slug, storage_bucket_id, path, alt_text, caption, width, height, featured, sort_order } = body;
    const { data, error } = await supabase
      .from('gallery_images')
      .update({
        collection_slug: collection_slug ?? undefined,
        storage_bucket_id: storage_bucket_id ?? undefined,
        path: path ?? undefined,
        alt_text: alt_text ?? undefined,
        caption: caption ?? undefined,
        width: width != null ? Number(width) : undefined,
        height: height != null ? Number(height) : undefined,
        featured: featured != null ? Boolean(featured) : undefined,
        sort_order: sort_order != null ? Number(sort_order) : undefined,
      })
      .eq('id', params.id)
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json({ image: data });
  } catch (error) {
    console.error('Admin gallery update error:', error);
    return NextResponse.json(
      { error: 'internal_error', message: 'Could not update gallery item.' },
      { status: 500 },
    );
  }
}

// DELETE /api/admin/gallery/[id]?kind=image|collection
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const admin = await requireAdmin();
  if (admin instanceof NextResponse) return admin;

  if (!supabase) {
    return NextResponse.json(
      { error: 'not_configured', message: 'Supabase is not configured.' },
      { status: 503 },
    );
  }

  const url = new URL(req.url);
  const kind = url.searchParams.get('kind') || 'image';

  try {
    if (kind === 'collection') {
      const { count, error } = await supabase
        .from('gallery_images')
        .select('id', { count: 'exact', head: true })
        .eq('collection_slug', params.id);
      if (count && count > 0) {
        return NextResponse.json(
          { error: 'conflict', message: `Cannot delete collection "${params.id}": ${count} image(s) are assigned to it. Reassign them first.` },
          { status: 409 },
        );
      }
      const { error: delError } = await supabase
        .from('gallery_collections')
        .delete()
        .eq('slug', params.id);
      if (delError) throw delError;
      return NextResponse.json({ ok: true });
    }

    const { error } = await supabase.from('gallery_images').delete().eq('id', params.id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Admin gallery delete error:', error);
    return NextResponse.json(
      { error: 'internal_error', message: 'Could not delete gallery item.' },
      { status: 500 },
    );
  }
}