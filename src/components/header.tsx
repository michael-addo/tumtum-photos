import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img
              src="/logo.png"
              alt="TUMTUM PHOTOS logo"
              className="h-10 w-10 rounded-full object-contain"
            />
            <span className="font-serif font-bold text-xl tracking-tight">
              TUMTUM <span className="text-primary-600">PHOTOS</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/#packages"
              className="text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              Packages
            </Link>
            <Link
              href="/gallery"
              className="text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              Gallery
            </Link>
            <Link
              href="/#contact"
              className="text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              Contact
            </Link>
            <Link
              href="/enquiry"
              className="text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              Book a Shoot
            </Link>
            <Link
              href="/login"
              className="text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              Account
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              href="/signup"
              className="hidden sm:inline-flex items-center justify-center rounded-full bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 transition-colors"
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}