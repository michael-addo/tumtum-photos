"use client";

import { useState, type FormEvent } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";

const enquirySchema = z.object({
  name: z.string().min(2, "Please tell us your name.").max(120),
  email: z.string().email("That email address doesn't look right."),
  phone: z.string().max(40).optional(),
  shootType: z.enum(["solo", "duo", "group", "after-party", "dinner", "location", "other"]),
  eventDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD").optional(),
  budget: z.enum(["ghc-400", "ghc-500", "ghc-600", "ghc-700", "ghc-1000-plus", "unsure"]).optional(),
  message: z.string().min(10, "Tell us at least 10 characters about what you have in mind."),
});

type EnquiryFormValues = z.infer<typeof enquirySchema>;

const SHOOT_TYPES: { value: EnquiryFormValues["shootType"]; label: string }[] = [
  { value: "solo", label: "Solo Portrait" },
  { value: "duo", label: "Duo Session" },
  { value: "group", label: "Group Shoot" },
  { value: "after-party", label: "After Party" },
  { value: "dinner", label: "Dinner" },
  { value: "location", label: "On Location" },
  { value: "other", label: "Other" },
];

const BUDGETS: { value: EnquiryFormValues["budget"]; label: string; price?: number }[] = [
  { value: "ghc-400", label: "GHC 400 – 5 pictures", price: 400 },
  { value: "ghc-500", label: "GHC 500 – 10 pictures", price: 500 },
  { value: "ghc-600", label: "GHC 600 – 15 pictures", price: 600 },
  { value: "ghc-700", label: "GHC 700 – Premium (+ frame)", price: 700 },
  { value: "ghc-1000-plus", label: "GHC 1000+", price: 1000 },
  { value: "unsure", label: "Not sure yet" },
];

export function EnquiryForm() {
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<EnquiryFormValues>({
    resolver: zodResolver(enquirySchema),
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const shootType = watch("shootType");

  async function onSubmit(data: EnquiryFormValues) {
    setError(null);
    try {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        if (json.error === "rate_limited") {
          setError(`Too many messages. Please try again in ${json.retryAfter} seconds.`);
          return;
        }
        setError(json.message ?? "Something went wrong. Please try again.");
        return;
      }
      setSubmitted(true);
    } catch {
      setError("Network error. Please check your connection and try again.");
    }
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <CheckCircle className="h-12 w-12 text-primary-600 dark:text-primary-400 mb-4" />
        <h3 className="font-serif font-bold text-2xl mb-2">Thank you!</h3>
        <p className="text-neutral-600 dark:text-neutral-400 max-w-md">
          We've received your enquiry and will get back to you within one working day.
        </p>
        <button
          type="button"
          onClick={() => setSubmitted(false)}
          className="mt-6 text-sm text-primary-600 dark:text-primary-400 hover:underline"
        >
          Submit another enquiry
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      {error && (
        <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-800 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300" role="alert">
          <AlertCircle className="inline-block mr-2 h-4 w-4 -mt-0.5" />
          {error}
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
          Full Name *
        </label>
        <input
          {...register("name")}
          id="name"
          type="text"
          placeholder="e.g. Ama Mensah"
          className={`w-full rounded-lg border ${errors.name ? "border-red-500" : "border-neutral-300 dark:border-neutral-700"} bg-white dark:bg-neutral-900 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-600`}
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? "name-error" : undefined}
        />
        {errors.name && <p id="name-error" className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            Email *
          </label>
          <input
            {...register("email")}
            id="email"
            type="email"
            placeholder="ama@example.com"
            className={`w-full rounded-lg border ${errors.email ? "border-red-500" : "border-neutral-300 dark:border-neutral-700"} bg-white dark:bg-neutral-900 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-600`}
            aria-invalid={!!errors.email}
          />
          {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            Phone (optional)
          </label>
          <input
            {...register("phone")}
            id="phone"
            type="tel"
            placeholder="024 XXX XXXX"
            className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-600"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
          Shoot Type *
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {SHOOT_TYPES.map((st) => (
            <label
              key={st.value}
              className={`flex cursor-pointer items-center rounded-lg border px-3 py-2.5 text-sm transition-colors ${
                shootType === st.value
                  ? "border-primary-600 bg-primary-50 text-primary-700 dark:bg-primary-950/30 dark:text-primary-400"
                  : "border-neutral-200 dark:border-neutral-800 hover:border-primary-300"
              }`}
            >
              <input
                {...register("shootType")}
                type="radio"
                value={st.value}
                className="sr-only"
              />
              {st.label}
            </label>
          ))}
        </div>
        {errors.shootType && <p className="mt-1 text-xs text-red-600">{errors.shootType.message}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="eventDate" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            Event Date (optional)
          </label>
          <input
            {...register("eventDate")}
            id="eventDate"
            type="date"
            className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-600"
          />
        </div>
        <div>
          <label htmlFor="budget" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            Budget (optional)
          </label>
          <select
            {...register("budget")}
            id="budget"
            className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-600"
          >
            <option value="">Select a budget</option>
            {BUDGETS.map((b) => (
              <option key={b.value} value={b.value}>
                {b.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
          Message *
        </label>
        <textarea
          {...register("message")}
          id="message"
          rows={4}
          placeholder="Tell us about your graduation date, venue, and any special requests..."
          className={`w-full rounded-lg border ${errors.message ? "border-red-500" : "border-neutral-300 dark:border-neutral-700"} bg-white dark:bg-neutral-900 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-600 resize-none`}
          aria-invalid={!!errors.message}
        />
        {errors.message && <p className="mt-1 text-xs text-red-600">{errors.message.message}</p>}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary-600 px-6 py-3 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60 transition-colors"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Sending…
          </>
        ) : (
          "Send Enquiry"
        )}
      </button>

      <p className="text-center text-xs text-neutral-500 dark:text-neutral-400">
        By submitting you agree to be contacted regarding your enquiry.
      </p>
    </form>
  );
}