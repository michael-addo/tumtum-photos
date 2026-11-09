import Link from "next/link";
import { getGallery } from "@/lib/gallery";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gallery — TUMTUM PHOTOS",
  description: "Browse our graduation photography portfolio.",
};

export default async function GalleryPage() {
  const gallery = await getGallery();

  const collections = gallery.collections;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="font-serif font-bold text-3xl sm:text-4xl mb-4">Our Gallery</h1>
        <p className="text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
          Browse our recent graduation shoots by collection.
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-3 mb-10">
        <button className="rounded-full bg-primary-600 px-5 py-2 text-sm font-semibold text-white">
          All
        </button>
        {collections.map((c) => (
          <button
            key={c.slug}
            className="rounded-full border border-neutral-300 dark:border-neutral-700 px-5 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            {c.title}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {gallery.images.map((img) => (
          <div
            key={img.id}
            className="group relative aspect-[3/4] rounded-lg overflow-hidden bg-neutral-200 dark:bg-neutral-800"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center p-4 text-center">
              <div>
                <p className="text-white/90 text-sm font-medium">{img.caption}</p>
                <p className="text-white/60 text-xs mt-1">{img.collection}</p>
              </div>
            </div>
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
          </div>
        ))}
      </div>
    </div>
  );
}