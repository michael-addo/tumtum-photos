import { supabase } from './supabase-client';
import type { Database } from './database.types';

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

// Generate public URL for gallery images
export function getPublicImageUrl(path: string): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  if (!url) return `/images/placeholder.jpg`;
  return `${url}/storage/v1/object/public/gallery-public/${path}`;
}

// Generate a resized thumbnail URL using Supabase's image transformation API.
// Falls back to the original public URL when Supabase is not configured.
export function getThumbnailUrl(path: string, width = 400): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  if (!url) return `/images/placeholder.jpg`;
  return `${url}/storage/v1/render/image/public/gallery-public/${path}?width=${width}&quality=80`;
}

// Enquiry form validation constants
export const SHOOT_TYPES = ['solo', 'duo', 'group', 'after-party', 'dinner', 'location', 'other'] as const;
export const BUDGETS = ['ghc-400', 'ghc-500', 'ghc-600', 'ghc-700', 'ghc-1000-plus', 'unsure'] as const;

export type ShootType = typeof SHOOT_TYPES[number];
export type Budget = typeof BUDGETS[number];

// Fallback data when Supabase is not configured (e.g., build time)
const FALLBACK_GALLERY: GalleryData = {
  collections: [
    { slug: 'solo', title: 'Solo' },
    { slug: 'duo', title: 'Duo' },
    { slug: 'location', title: 'On Location' },
  ],
  images: [],
};

export async function getGallery(): Promise<GalleryData> {
  if (!supabase) return FALLBACK_GALLERY;

  try {
    // Fetch collections
    const { data: collections, error: collectionsError } = await supabase
      .from('gallery_collections')
      .select('slug, title')
      .order('sort_order');

    if (collectionsError) {
      console.error('[gallery] Collections fetch error:', collectionsError.message);
      return FALLBACK_GALLERY;
    }

    // Fetch images
    const { data: images, error: imagesError } = await supabase
      .from('gallery_images')
      .select('*')
      .order('sort_order');

    if (imagesError) {
      console.error('[gallery] Images fetch error:', imagesError.message);
      return FALLBACK_GALLERY;
    }

    const data: GalleryData = {
      collections: (collections || []).map((c: any) => ({
        slug: c.slug,
        title: c.title,
      })),
      images: (images || []).map((img: any) => ({
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

    return data;
  } catch (error) {
    console.error('Gallery error:', error instanceof Error ? error.message : error);
    return FALLBACK_GALLERY;
  }
}
