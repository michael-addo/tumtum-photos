import Link from "next/link";
import { PackageCard } from "@/components/package-card";
import { Hero } from "@/components/hero";
import { getGallery } from "@/lib/gallery";

export const revalidate = 3600;

const PACKAGES = [
  {
    name: "Solo Portrait",
    price: 400,
    pictures: 5,
    description: "Perfect for individual graduation portraits.",
    features: [
      "30-minute studio session",
      "5 high-resolution edited pictures",
      "Online gallery access",
      "1 outfit change",
    ],
  },
  {
    name: "Duo Session",
    price: 500,
    pictures: 10,
    description: "Share the moment with a friend or family member.",
    features: [
      "45-minute session",
      "10 high-resolution edited pictures",
      "Online gallery access",
      "Multiple outfit changes",
    ],
    highlighted: true,
    badge: "Most Popular",
  },
  {
    name: "Group Shoot",
    price: 600,
    pictures: 15,
    description: "Capture the whole graduation class or family.",
    features: [
      "60-minute session",
      "15 high-resolution edited pictures",
      "Online gallery access",
      "Group + individual shots",
    ],
  },
  {
    name: "Premium Package",
    price: 700,
    pictures: 10,
    description: "Everything in Duo, plus a premium 12×16 frame.",
    features: [
      "45-minute session",
      "10 high-resolution edited pictures",
      "12×16 premium frame included",
      "Online gallery access",
      "Priority editing",
    ],
  },
];

export default async function Home() {
  const gallery = await getGallery();

  return (
    <div>
      <Hero />

      <section id="packages" className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="font-serif font-bold text-3xl sm:text-4xl mb-4">
            Graduation Shoot Packages
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
            Choose the package that fits your moment. All prices include editing and
            online gallery access.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {PACKAGES.map((pkg) => (
            <PackageCard key={pkg.name} {...pkg} />
          ))}
        </div>
      </section>

      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-neutral-50 dark:bg-neutral-900/50 rounded-2xl">
        <div className="text-center mb-12">
          <h2 className="font-serif font-bold text-3xl sm:text-4xl mb-4">Our Work</h2>
          <p className="text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
            A glimpse of recent graduation shoots.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {gallery.images
            .filter((img) => img.featured)
            .slice(0, 4)
            .map((img) => (
              <div key={img.id} className="relative aspect-[3/4] rounded-lg overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center">
                  <span className="text-white/80 text-sm text-center px-4">
                    {img.caption}
                  </span>
                </div>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
              </div>
            ))}
        </div>

        <div className="text-center mt-8">
          <Link
            href="/gallery"
            className="inline-flex items-center justify-center rounded-lg border-2 border-primary-600 px-6 py-2.5 text-sm font-semibold text-primary-600 hover:bg-primary-600 hover:text-white transition-colors"
          >
            View Full Gallery
          </Link>
        </div>
      </section>

      <section id="contact" className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-serif font-bold text-3xl sm:text-4xl mb-4">
            Ready to Book Your Shoot?
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 mb-8">
            Fill in the form below and we'll get back to you within one working day.
          </p>
          <Link
            href="/enquiry"
            className="inline-flex items-center justify-center rounded-lg bg-primary-600 px-8 py-3 text-base font-semibold text-white hover:bg-primary-700 transition-colors"
          >
            Start Your Enquiry
          </Link>
        </div>
      </section>
    </div>
  );
}