"use client";

import { Dumbbell, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";

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

  useEffect(() => {
    // If we land on the auth page but already have a session (e.g. from an invite/magic link redirect)
    // auto-route the user to the correct destination.
    const supabase = createClient();
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        supabase
          .from("users")
          .select("onboarding_completed")
          .eq("id", session.user.id)
          .maybeSingle()
          .then(({ data }) => {
            if (data && !data.onboarding_completed) {
              router.replace(`/auth/reset-password?next=${nextPath}`);
            } else {
              router.replace(nextPath);
            }
          });
      }
    });

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && (event === "SIGNED_IN" || event === "PASSWORD_RECOVERY")) {
        supabase
          .from("users")
          .select("onboarding_completed")
          .eq("id", session.user.id)
          .maybeSingle()
          .then(({ data }) => {
            if (data && !data.onboarding_completed) {
              router.replace(`/auth/reset-password?next=${nextPath}`);
            } else {
              router.replace(nextPath);
            }
          });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router, searchParams, nextPath]);

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

  // async function handleOAuthSignIn() {
  //   setError(null);
  //   setMessage(null);
  //   setLoading(true);

  //   try {
  //     const supabase = createClient();
  //     const redirectTo = `${window.location.origin}/auth/callback?next=${isSignup ? ONBOARDING_PATH : nextPath}`;

  //     const { error: oauthError } = await supabase.auth.signInWithOAuth({
  //       provider: "google",
  //       options: {
  //         redirectTo
  //       }
  //     });

  //     if (oauthError) {
  //       setError(oauthError.message);
  //     }
  //   } catch (authError) {
  //     setError(
  //       authError instanceof Error
  //         ? authError.message
  //         : "Authentication failed. Check your environment configuration."
  //     );
  //   } finally {
  //     setLoading(false);
  //   }
  // }

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

              {/*
              <button
                type="button"
                onClick={handleOAuthSignIn}
                disabled={loading}
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-white px-4 text-sm font-medium text-slate-900 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Continue with Google
              </button>
              */}
            </form>

            <p className="mt-4 text-center text-sm">
              <Link className="font-medium text-[var(--primary)] hover:underline" href="/auth/forgot-password">
                Forgot password?
              </Link>
            </p>

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

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      const supabase = createClient();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      });

      if (resetError) {
        setError(resetError.message);
        return;
      }

      setMessage("If your email is registered, a password reset link has been sent.");
    } catch (authError) {
      setError(
        authError instanceof Error
          ? authError.message
          : "Password reset failed. Check your environment configuration."
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
            Reset your account password and continue managing your gym.
          </p>
          <p className="mt-4 text-base leading-7 text-[var(--muted)]">
            Enter the email address you used to register, and we’ll send you a secure reset link.
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
              <h1 className="text-2xl font-semibold">Forgot password</h1>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                Enter your email to receive a password reset link.
              </p>
            </div>

            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium">Email</span>
                <input
                  required
                  type="email"
                  name="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                  className="h-11 w-full rounded-md border border-[var(--border)] bg-white px-3 text-sm outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[#b7e4d5]"
                  placeholder="owner@example.com"
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
                Send reset link
              </button>
            </form>

            <p className="mt-5 text-center text-sm text-[var(--muted)]">
              Remembered your password?{" "}
              <Link className="font-medium text-[var(--primary)] hover:underline" href="/auth/login">
                Back to login
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const redirectError = searchParams.get("error");
    const description = searchParams.get("error_description");

    if (redirectError) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setError(description ? decodeURIComponent(description) : redirectError);
      setLoading(false);
      return;
    }

    const supabase = createClient();

    // Check if a valid session is already present (from Invite link or Magic link)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setIsReady(true);
        setLoading(false);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN" || session) {
          setIsReady(true);
          setLoading(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [searchParams]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({ password });

      if (updateError) {
        setError(updateError.message);
        return;
      }

      setMessage("Password successfully set. Redirecting to your workspace...");
      const nextDest = searchParams.get("next") || APP_HOME;
      window.setTimeout(() => {
        router.replace(nextDest);
      }, 1400);
    } catch (authError) {
      setError(
        authError instanceof Error
          ? authError.message
          : "Unable to save password. Please try again or request a new link."
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
          <p className="text-4xl font-semibold leading-tight">Set or reset your password</p>
          <p className="mt-4 text-base leading-7 text-[var(--muted)]">
            Create a secure password for your account to continue accessing your gym workspace.
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
              <h1 className="text-2xl font-semibold">Set password</h1>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                {loading
                  ? "Validating secure link..."
                  : isReady
                  ? "Enter a secure password to complete your account setup."
                  : "Your secure link must be validated before you can set a password."}
              </p>
            </div>

            {error ? (
              <div className="mt-6 rounded-md border border-[#f1b8ad] bg-[#fff0ed] px-3 py-2 text-sm text-[var(--danger)]">
                {error}
              </div>
            ) : null}

            {message ? (
              <div className="mt-6 rounded-md border border-[#a9dcc5] bg-[#edfff6] px-3 py-2 text-sm text-[#145c43]">
                {message}
              </div>
            ) : null}

            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium">New password</span>
                <input
                  required
                  minLength={8}
                  type="password"
                  name="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="new-password"
                  className="h-11 w-full rounded-md border border-[var(--border)] bg-white px-3 text-sm outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[#b7e4d5]"
                  placeholder="Minimum 8 characters"
                  disabled={!isReady || loading}
                />
              </label>

              <button
                type="submit"
                disabled={!isReady || loading}
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-medium text-white transition hover:bg-[#0f6853] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? <Loader2 size={17} className="animate-spin" aria-hidden="true" /> : null}
                Set password
              </button>
            </form>

            <p className="mt-5 text-center text-sm text-[var(--muted)]">
              Remembered your password?{" "}
              <Link className="font-medium text-[var(--primary)] hover:underline" href="/auth/login">
                Back to login
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
