import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center">
                <span className="text-white font-serif font-bold">T</span>
              </div>
              <span className="font-serif font-bold text-lg">
                TUMTUM <span className="text-primary-600">PHOTOS</span>
              </span>
            </div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Graduation photography that captures your moment.
            </p>
          </div>

          <div>
            <h3 className="font-serif font-semibold mb-4">Contact</h3>
            <ul className="space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
              <li>
                <a href="tel:0242249621" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  0242 249 621
                </a>
              </li>
              <li>
                <a href="mailto:hello@tumtum-photos.example" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  hello@tumtum-photos.example
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-serif font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/enquiry" className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  Book a Shoot
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  Gallery
                </Link>
              </li>
              <li>
                <a href="https://tumtum-photos.vercel.app" className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  Terms &amp; Conditions
                </a>
              </li>
              <li>
                <Link href="/login" className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  Sign In
                </Link>
              </li>
              <li>
                <Link href="/signup" className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  Create Account
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-neutral-200 dark:border-neutral-800 text-center text-sm text-neutral-500 dark:text-neutral-400">
          &copy; {new Date().getFullYear()} TUMTUM PHOTOS. All rights reserved.
        </div>
      </div>
    </footer>
  );
}