import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";

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

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "data", "gallery.json");
    const raw = await fs.readFile(filePath, "utf8");
    const data = JSON.parse(raw) as GalleryData;
    return NextResponse.json(data);
  } catch (error) {
    console.error("Gallery error:", error);
    return NextResponse.json(
      { error: "gallery_unavailable", message: "Could not load gallery data." },
      { status: 500 },
    );
  }
}