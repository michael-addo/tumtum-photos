import Link from "next/link";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary-900 via-primary-800 to-primary-950" />
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-72 h-72 bg-accent-500 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary-400 rounded-full blur-3xl" />
      </div>

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-32">
        <div className="max-w-3xl">
          <span className="inline-flex items-center rounded-full bg-accent-500/20 border border-accent-400/30 px-4 py-1.5 text-sm font-medium text-accent-300 mb-6">
            🎓 Graduation Photography
          </span>
          <h1 className="font-serif font-bold text-4xl sm:text-5xl lg:text-6xl leading-tight text-white">
            Capture the Moment of{" "}
            <span className="text-accent-400">Graduation</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-neutral-300 max-w-2xl">
            Solo, duo, group, and on-location shoots. Packages from GHC 400 with
            professional editing and fast delivery.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <Link
              href="/#packages"
              className="inline-flex items-center justify-center rounded-lg bg-accent-500 px-8 py-3.5 text-base font-semibold text-neutral-900 hover:bg-accent-400 transition-colors"
            >
              View Packages
            </Link>
            <Link
              href="/enquiry"
              className="inline-flex items-center justify-center rounded-lg border-2 border-white/30 px-8 py-3.5 text-base font-semibold text-white hover:bg-white/10 transition-colors"
            >
              Book a Consultation
            </Link>
          </div>

          <div className="mt-10 flex flex-wrap gap-8 text-white/80">
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
    </section>
  );
}