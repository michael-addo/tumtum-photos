import fs from "node:fs/promises";
import path from "node:path";
import { config } from "./config.js";

export interface GalleryCollection {
  slug: string;
  title: string;
}

export interface GalleryImage {
  id: string;
  src: string;
  alt: string;
  caption: string;
  collection: string;
  width: number;
  height: number;
  featured: boolean;
}

export interface Gallery {
  collections: GalleryCollection[];
  images: GalleryImage[];
}

let cached: Promise<Gallery> | undefined;

function nonEmptyString(value: unknown): string | null {
  return typeof value === "string" && value.trim() !== "" ? value.trim() : null;
}

function positiveNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : null;
}

async function loadGallery(): Promise<Gallery> {
  const file = path.join(config.dataDir, "gallery.json");
  const raw = await fs.readFile(file, "utf8");
  const parsed: unknown = JSON.parse(raw);

  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    throw new Error(`${file} must contain a JSON object.`);
  }

  const source = parsed as Record<string, unknown>;
  const rawImages = Array.isArray(source.images) ? source.images : [];

  const images: GalleryImage[] = [];
  const seenIds = new Set<string>();

  for (const [index, entry] of rawImages.entries()) {
    if (typeof entry !== "object" || entry === null) continue;
    const item = entry as Record<string, unknown>;

    const id = nonEmptyString(item.id);
    const src = nonEmptyString(item.src);
    const alt = nonEmptyString(item.alt);
    const collection = nonEmptyString(item.collection);
    const width = positiveNumber(item.width);
    const height = positiveNumber(item.height);

    if (!id || !src || !alt || !collection || !width || !height) {
      console.warn(`[gallery] skipping image #${index}: missing id, src, alt, collection, width, or height`);
      continue;
    }
    if (seenIds.has(id)) {
      console.warn(`[gallery] skipping image #${index}: duplicate id "${id}"`);
      continue;
    }

    seenIds.add(id);
    images.push({
      id,
      src,
      alt,
      collection,
      width,
      height,
      caption: nonEmptyString(item.caption) ?? "",
      featured: item.featured === true,
    });
  }

  if (images.length === 0) {
    throw new Error(`${file} contains no usable images.`);
  }

  const collections: GalleryCollection[] = [];
  const declared = Array.isArray(source.collections) ? source.collections : [];

  for (const entry of declared) {
    if (typeof entry !== "object" || entry === null) continue;
    const item = entry as Record<string, unknown>;
    const slug = nonEmptyString(item.slug);
    const title = nonEmptyString(item.title);
    if (slug && title && !collections.some((c) => c.slug === slug)) {
      collections.push({ slug, title });
    }
  }

  // Any collection referenced by an image but not declared still gets a filter.
  for (const image of images) {
    if (!collections.some((c) => c.slug === image.collection)) {
      collections.push({ slug: image.collection, title: image.collection });
    }
  }

  return { collections, images };
}

export function getGallery(): Promise<Gallery> {
  if (!cached) {
    cached = loadGallery().catch((error: unknown) => {
      cached = undefined;
      throw error;
    });
  }
  return cached;
}
