import type { Metadata } from "next";
import { EnquiryForm } from "@/components/enquiry-form";

export const metadata: Metadata = {
  title: "Book a Shoot — TUMTUM PHOTOS",
  description: "Tell us about your graduation shoot and we'll get back to you within one working day.",
};

export default function EnquiryPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="font-serif font-bold text-3xl sm:text-4xl mb-4">
            Book Your Graduation Shoot
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Fill in the form below and we'll reply within one working day.
          </p>
        </div>

        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 sm:p-8 shadow-sm">
          <EnquiryForm />
        </div>
      </div>
    </div>
  );
}