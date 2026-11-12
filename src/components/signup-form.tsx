"use client";

import { useState, type FormEvent } from "react";
import { Loader2, CheckCircle, AlertCircle, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/lib/supabase-client";

export function SignupForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (!supabase) {
      setError("Supabase is not configured.");
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/login`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    if (data.session) {
      // User is already signed in (email confirmations disabled)
      window.location.href = "/";
    } else {
      // Email confirmation required
      setSuccess(true);
    }
    setLoading(false);
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <CheckCircle className="h-12 w-12 text-primary-600 dark:text-primary-400 mb-4" />
        <h3 className="font-serif font-bold text-2xl mb-2">Account Created!</h3>
        <p className="text-neutral-600 dark:text-neutral-400 max-w-md">
          We sent a confirmation email to <strong>{email}</strong>. Please verify your email address, then sign in.
        </p>
        <a
          href="/login"
          className="mt-6 inline-flex items-center justify-center rounded-lg bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 transition-colors"
        >
          Go to Sign In
        </a>
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

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
          Password *
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Min. 8 characters"
            required
            className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-4 py-2.5 pr-10 text-sm outline-none focus:ring-2 focus:ring-primary-600"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
          Confirm Password *
        </label>
        <input
          id="confirmPassword"
          type={showPassword ? "text" : "password"}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Repeat your password"
          required
          className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-600"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary-600 px-6 py-3 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60 transition-colors"
      >
        {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating account…</> : "Create Account"}
      </button>
    </form>
  );
}