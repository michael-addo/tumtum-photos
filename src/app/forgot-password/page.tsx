import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/reset-password-form";

export const metadata: Metadata = {
  title: "Reset Password — TUMTUM PHOTOS",
  description: "Reset your password to regain access to your account.",
};

export default function ForgotPasswordPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-10">
          <h1 className="font-serif font-bold text-3xl sm:text-4xl mb-2">
            Reset Your Password
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Enter your email and we'll send you a link to reset your password.
          </p>
        </div>

        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 sm:p-8 shadow-sm">
          <ResetPasswordForm />
        </div>

        <p className="text-center text-sm text-neutral-500 dark:text-neutral-400 mt-6">
          <a href="/login" className="text-primary-600 dark:text-primary-400 hover:underline font-medium">
            ← Back to Sign In
          </a>
        </p>
      </div>
    </div>
  );
}