import type { Metadata } from "next";
import { LoginForm } from "@/components/login-form";

export const metadata: Metadata = {
  title: "Sign In — TUMTUM PHOTOS",
  description: "Sign in to your account to manage your enquiries and gallery access.",
};

export default function LoginPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-10">
          <h1 className="font-serif font-bold text-3xl sm:text-4xl mb-2">
            Welcome Back
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Sign in to your account to manage your enquiries and gallery access.
          </p>
        </div>

        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 sm:p-8 shadow-sm">
          <LoginForm />
        </div>

        <p className="text-center text-sm text-neutral-500 dark:text-neutral-400 mt-6">
          Don't have an account?{" "}
          <a href="/signup" className="text-primary-600 dark:text-primary-400 hover:underline font-medium">
            Create one
          </a>
        </p>
      </div>
    </div>
  );
}