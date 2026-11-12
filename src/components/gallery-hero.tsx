'use client';

import { useEffect, useState } from 'react';
import { getPublicImageUrl, getThumbnailUrl } from '@/lib/gallery';
import type { GalleryImage } from '@/lib/gallery';

const SLIDE_MS = 4500;

export function GalleryHero({ images }: { images: GalleryImage[] }) {
  const [active, setActive] = useState(0);
  const [ready, setReady] = useState(false);

  const featured = images.filter((img) => img.featured);
  const slides = featured.length > 0 ? featured : images;

  useEffect(() => {
    if (slides.length === 0) return;
    setReady(true);
    const id = setInterval(() => {
      setActive((prev) => (prev + 1) % slides.length);
    }, SLIDE_MS);
    return () => clearInterval(id);
  }, [slides.length]);

  if (slides.length === 0) {
    return (
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900 via-primary-800 to-primary-950" />
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-32">
          <div className="max-w-3xl">
            <span className="inline-flex items-center rounded-full bg-accent-500/20 border border-accent-400/30 px-4 py-1.5 text-sm font-medium text-accent-300 mb-6">
              🎓 Graduation Photography
            </span>
            <h1 className="font-serif font-bold text-4xl sm:text-5xl lg:text-6xl leading-tight text-white">
              Capture the Moment of{' '}
              <span className="text-accent-400">Graduation</span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-neutral-300 max-w-2xl">
              Solo, duo, group, and on-location shoots. Packages from GHC 400 with
              professional editing and fast delivery.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden">
      {slides.map((img, i) => {
        const isActive = i === active;
        return (
          <div
            key={img.id}
            className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
            style={{ opacity: isActive ? 1 : 0 }}
            aria-hidden={!isActive}
          >
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${getThumbnailUrl(img.src, 1200)})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10" />
          </div>
        );
      })}

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-32">
        <div className="max-w-3xl">
          <span className="inline-flex items-center rounded-full bg-accent-500/20 border border-accent-400/30 px-4 py-1.5 text-sm font-medium text-accent-300 mb-6">
            🎓 Graduation Photography
          </span>
          <h1 className="font-serif font-bold text-4xl sm:text-5xl lg:text-6xl leading-tight text-white drop-shadow-lg">
            Capture the Moment of{' '}
            <span className="text-accent-400">Graduation</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-neutral-200 max-w-2xl drop-shadow">
            {slides[active]?.caption || 'Solo, duo, group, and on-location shoots.'}
          </p>
          <p className="mt-2 text-sm text-neutral-300 drop-shadow">
            {slides[active]?.collection} · {slides.length} featured photo
            {slides.length === 1 ? '' : 's'}
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <a
              href="/#packages"
              className="inline-flex items-center justify-center rounded-lg bg-accent-500 px-8 py-3.5 text-base font-semibold text-neutral-900 hover:bg-accent-400 transition-colors"
            >
              View Packages
            </a>
            <a
              href="/enquiry"
              className="inline-flex items-center justify-center rounded-lg border-2 border-white/30 px-8 py-3.5 text-base font-semibold text-white hover:bg-white/10 transition-colors"
            >
              Book a Consultation
            </a>
          </div>

          <div className="mt-10 flex flex-wrap gap-8 text-white/90">
            <div>
              <p className="text-2xl font-bold text-white">GHC 400</p>
              <p className="text-sm">Starting price</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">0242 249 621</p>
              <p className="text-sm">Call or WhatsApp</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">1 Day</p>
              <p className="text-sm">Editing turnaround</p>
            </div>
          </div>
        </div>
      </div>

      {/* Slide indicators */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2">
        {slides.map((_, i) => (
          <span
            key={i}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === active ? 'w-8 bg-accent-400' : 'w-1.5 bg-white/40'
            }`}
          />
        ))}
      </div>
    </section>
  );
}