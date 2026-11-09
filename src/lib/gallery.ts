import fs from "node:fs/promises";
import path from "node:path";
import type { GalleryData } from "@/app/api/gallery/route";

const CACHE_KEY = "gallery:data";

let cached: GalleryData | null = null;

export async function getGallery(): Promise<GalleryData> {
  if (cached) return cached;

  const filePath = path.join(process.cwd(), "data", "gallery.json");
  const raw = await fs.readFile(filePath, "utf8");
  const data = JSON.parse(raw) as GalleryData;
  cached = data;
  return data;
}