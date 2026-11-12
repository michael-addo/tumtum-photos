import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-client';
import { getPublicImageUrl } from '@/lib/gallery';

export interface GalleryImage {
  id: string;
  src: string;
  alt: string;
  collection: string;
  width: number;
  height: number;
  caption?: string;
  featured?: boolean;
}

export interface GalleryCollection {
  slug: string;
  title: string;
}

export interface GalleryData {
  collections: GalleryCollection[];
  images: GalleryImage[];
}

export const revalidate = 3600;

export async function GET() {
  if (!supabase) {
    return NextResponse.json({
      collections: [
        { slug: 'solo', title: 'Solo' },
        { slug: 'duo', title: 'Duo' },
        { slug: 'location', title: 'On Location' },
      ],
      images: [],
    });
  }

  try {
    // Fetch collections
    const { data: collections, error: collectionsError } = await supabase
      .from('gallery_collections')
      .select('slug, title')
      .order('sort_order');

    if (collectionsError) throw collectionsError;

    // Fetch images
    const { data: images, error: imagesError } = await supabase
      .from('gallery_images')
      .select('*')
      .order('sort_order');

    if (imagesError) throw imagesError;

    const data: GalleryData = {
      collections: (collections || []).map(c => ({
        slug: c.slug,
        title: c.title,
      })),
      images: (images || []).map(img => ({
        id: img.id,
        src: getPublicImageUrl(img.path),
        alt: img.alt_text,
        collection: img.collection_slug,
        width: img.width,
        height: img.height,
        caption: img.caption || undefined,
        featured: img.featured,
      })),
    };

    return NextResponse.json(data);
  } catch (error) {
    console.error('Gallery error:', error);
    return NextResponse.json(
      { error: 'gallery_unavailable', message: 'Could not load gallery data.' },
      { status: 500 },
    );
  }
}
