import Link from "next/link";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export interface Package {
  name: string;
  price: number;
  pictures: number;
  description: string;
  features: string[];
  highlighted?: boolean;
  badge?: string;
}

export function PackageCard({
  name,
  price,
  pictures,
  description,
  features,
  highlighted,
  badge,
}: Package) {
  return (
    <div
      className={cn(
        "relative rounded-xl border bg-white dark:bg-neutral-900 p-6 shadow-sm transition-all hover:shadow-lg hover:-translate-y-1",
        highlighted
          ? "border-primary-600 dark:border-primary-400 ring-2 ring-primary-600/20"
          : "border-neutral-200 dark:border-neutral-800",
      )}
    >
      {badge && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center rounded-full bg-accent-500 px-3 py-1 text-xs font-semibold text-neutral-900">
          {badge}
        </span>
      )}

      <div className="text-center">
        <h3 className="font-serif font-bold text-xl">{name}</h3>
        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{description}</p>
      </div>

      <div className="mt-4 flex items-baseline justify-center gap-1">
        <span className="text-4xl font-bold text-primary-600 dark:text-primary-400">
          GHC {price}
        </span>
        <span className="text-sm text-neutral-500 dark:text-neutral-400">/ shoot</span>
      </div>

      <p className="mt-1 text-center text-sm font-medium text-neutral-700 dark:text-neutral-300">
        {pictures} {pictures === 1 ? "picture" : "pictures"}
      </p>

      <ul className="mt-4 space-y-2">
        {features.map((feature, i) => (
          <li key={i} className="flex items-start gap-2 text-sm">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary-600 dark:text-primary-400" />
            <span className="text-neutral-700 dark:text-neutral-300">{feature}</span>
          </li>
        ))}
      </ul>

      <Link
        href="/enquiry"
        className={cn(
          "mt-6 inline-flex w-full items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors",
          highlighted
            ? "bg-primary-600 text-white hover:bg-primary-700"
            : "bg-neutral-100 text-neutral-900 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-white dark:hover:bg-neutral-700",
        )}
      >
        Select Package
      </Link>
    </div>
  );
}