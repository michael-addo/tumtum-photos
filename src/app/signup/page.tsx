import type { Metadata } from "next";
import { SignupForm } from "@/components/signup-form";

export const metadata: Metadata = {
  title: "Create Account — TUMTUM PHOTOS",
  description: "Create your account to manage your enquiries and gallery access.",
};

export default function SignupPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-10">
          <h1 className="font-serif font-bold text-3xl sm:text-4xl mb-2">
            Create Your Account
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Sign up to manage your enquiries and gallery access.
          </p>
        </div>

        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 sm:p-8 shadow-sm">
          <SignupForm />
        </div>

        <p className="text-center text-sm text-neutral-500 dark:text-neutral-400 mt-6">
          Already have an account?{" "}
          <a href="/login" className="text-primary-600 dark:text-primary-400 hover:underline font-medium">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}