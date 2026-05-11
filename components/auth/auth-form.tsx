"use client";

import { Dumbbell, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";

import { APP_HOME, ONBOARDING_PATH } from "@/lib/auth/paths";
import { createClient } from "@/lib/supabase/browser";

type AuthMode = "login" | "signup";

type AuthFormProps = {
  mode: AuthMode;
};

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isSignup = mode === "signup";
  const nextPath = searchParams.get("next") || APP_HOME;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    const password = String(formData.get("password") ?? "");
    const fullName = String(formData.get("fullName") ?? "").trim();

    try {
      const supabase = createClient();

      if (isSignup) {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName
            },
            emailRedirectTo: `${window.location.origin}/auth/callback?next=${ONBOARDING_PATH}`
          }
        });

        if (signUpError) {
          setError(signUpError.message);
          return;
        }

        if (!data.session) {
          setMessage("Check your email to confirm your account, then return to login.");
          return;
        }

        router.replace(ONBOARDING_PATH);
        router.refresh();
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (signInError) {
        setError(signInError.message);
        return;
      }

      router.replace(nextPath);
      router.refresh();
    } catch (authError) {
      setError(
        authError instanceof Error
          ? authError.message
          : "Authentication failed. Check your environment configuration."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen bg-[var(--background)] lg:grid-cols-[0.95fr_1.05fr]">
      <section className="hidden border-r border-[var(--border)] bg-[var(--panel)] px-10 py-8 lg:flex lg:flex-col">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-md bg-[var(--primary)] text-white">
            <Dumbbell size={22} aria-hidden="true" />
          </span>
          <span>
            <span className="block text-lg font-semibold">Fithub</span>
            <span className="block text-sm text-[var(--muted)]">Gym owner workspace</span>
          </span>
        </Link>

        <div className="mt-auto max-w-md pb-8">
          <p className="text-4xl font-semibold leading-tight">
            Keep memberships, payments, and attendance in one calm dashboard.
          </p>
          <p className="mt-4 text-base leading-7 text-[var(--muted)]">
            Built for gym owners who want fewer registers, faster renewals, and a clearer
            view of daily operations.
          </p>
        </div>
      </section>

      <section className="flex min-h-screen items-center justify-center px-5 py-10">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <Link href="/" className="inline-flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-md bg-[var(--primary)] text-white">
                <Dumbbell size={22} aria-hidden="true" />
              </span>
              <span className="font-semibold">Fithub</span>
            </Link>
          </div>

          <div className="rounded-md border border-[var(--border)] bg-[var(--panel)] p-6 shadow-sm">
            <div>
              <h1 className="text-2xl font-semibold">
                {isSignup ? "Create your owner account" : "Login to your gym workspace"}
              </h1>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                {isSignup
                  ? "Start with your owner profile. You will add your gym next."
                  : "Use your gym owner email and password to continue."}
              </p>
            </div>

            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              {isSignup ? (
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium">Full name</span>
                  <input
                    required
                    minLength={2}
                    name="fullName"
                    autoComplete="name"
                    className="h-11 w-full rounded-md border border-[var(--border)] bg-white px-3 text-sm outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[#b7e4d5]"
                    placeholder="Aarav Sharma"
                  />
                </label>
              ) : null}

              <label className="block">
                <span className="mb-1.5 block text-sm font-medium">Email</span>
                <input
                  required
                  type="email"
                  name="email"
                  autoComplete="email"
                  className="h-11 w-full rounded-md border border-[var(--border)] bg-white px-3 text-sm outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[#b7e4d5]"
                  placeholder="owner@example.com"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-sm font-medium">Password</span>
                <input
                  required
                  minLength={8}
                  type="password"
                  name="password"
                  autoComplete={isSignup ? "new-password" : "current-password"}
                  className="h-11 w-full rounded-md border border-[var(--border)] bg-white px-3 text-sm outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[#b7e4d5]"
                  placeholder="Minimum 8 characters"
                />
              </label>

              {error ? (
                <div className="rounded-md border border-[#f1b8ad] bg-[#fff0ed] px-3 py-2 text-sm text-[var(--danger)]">
                  {error}
                </div>
              ) : null}

              {message ? (
                <div className="rounded-md border border-[#a9dcc5] bg-[#edfff6] px-3 py-2 text-sm text-[#145c43]">
                  {message}
                </div>
              ) : null}

              <button
                disabled={loading}
                type="submit"
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-medium text-white transition hover:bg-[#0f6853] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? <Loader2 size={17} className="animate-spin" aria-hidden="true" /> : null}
                {isSignup ? "Create account" : "Login"}
              </button>
            </form>

            <p className="mt-5 text-center text-sm text-[var(--muted)]">
              {isSignup ? "Already have an account?" : "New to Fithub?"}{" "}
              <Link
                className="font-medium text-[var(--primary)] hover:underline"
                href={isSignup ? "/auth/login" : "/auth/signup"}
              >
                {isSignup ? "Login" : "Create account"}
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
