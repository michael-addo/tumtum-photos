"use client";

import { useState, type FormEvent } from "react";
import { Loader2, CheckCircle, AlertCircle, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/lib/supabase-client";

export function ResetPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!supabase) {
      setError("Supabase is not configured.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    });

    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
    setLoading(false);
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <CheckCircle className="h-12 w-12 text-primary-600 dark:text-primary-400 mb-4" />
        <h3 className="font-serif font-bold text-2xl mb-2">Check Your Email</h3>
        <p className="text-neutral-600 dark:text-neutral-400 max-w-md">
          We sent a password reset link to <strong>{email}</strong>. Click the link in the email to reset your password.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      {error && (
        <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-800 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300" role="alert">
          <AlertCircle className="inline-block mr-2 h-4 w-4 -mt-0.5" />
          {error}
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
          Email Address *
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-600"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary-600 px-6 py-3 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60 transition-colors"
      >
        {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Sending…</> : "Send Reset Link"}
      </button>
    </form>
  );
}