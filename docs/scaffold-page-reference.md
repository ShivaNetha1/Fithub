# Scaffold Landing Page — Reference Archive

> Archived on 2026-06-09 before replacing with production landing page.
> This page was the developer-facing scaffold shown to new visitors during the build phase.

## What it did

- Displayed **FitHub** branding with a "Phase 2 scaffold" badge
- Showed a headline: *"Multi-gym operations, built as a clean SaaS dashboard."*
- Provided **Create account** and **Login** buttons linked to `/auth/signup` and `/auth/login`
- Listed build phases 2–7 (Project foundation → Analytics and deployment)
- Displayed an **Environment readiness** panel showing configured/missing `.env` variables
- Server-side: redirected authenticated users to `/onboarding` or `/dashboard`
- Included `<ClientAuthRedirect />` for client-side session detection

## Key utilities used

- `getEnvStatus()` from `@/lib/config/env-status` — returns which env vars are set
- `createClient()` from `@/lib/supabase/server` — server Supabase client
- `ClientAuthRedirect` from `@/components/auth/client-auth-redirect`

---

## app/page.tsx (full source)

```tsx
import { Activity, Database, Dumbbell, KeyRound, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { ClientAuthRedirect } from "@/components/auth/client-auth-redirect";
import { getEnvStatus } from "@/lib/config/env-status";
import { createClient } from "@/lib/supabase/server";

const phaseItems = [
  "Project foundation",
  "Supabase schema",
  "Authentication",
  "Owner dashboard",
  "Members, payments, attendance",
  "Analytics and deployment"
];

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from("users")
      .select("onboarding_completed")
      .eq("id", user.id)
      .maybeSingle();

    if (profile && !profile.onboarding_completed) {
      redirect("/onboarding");
    } else {
      redirect("/dashboard");
    }
  }

  const envStatus = getEnvStatus();
  const configuredCount = envStatus.filter((item) => item.configured).length;

  return (
    <main className="min-h-screen">
      <ClientAuthRedirect />
      <section className="border-b border-[var(--border)] bg-[var(--panel)]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-md bg-[var(--primary)] text-[var(--primary-foreground)]">
              <Dumbbell size={22} aria-hidden="true" />
            </div>
            <div>
              <p className="text-lg font-semibold leading-tight">Fithub</p>
              <p className="text-sm text-[var(--muted)]">Gym owner workspace</p>
            </div>
          </div>
          <div className="hidden items-center gap-2 rounded-md border border-[var(--border)] px-3 py-2 text-sm text-[var(--muted)] sm:flex">
            <ShieldCheck size={16} aria-hidden="true" />
            Phase 2 scaffold
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-8 px-6 py-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-8">
          <div>
            <p className="mb-3 inline-flex items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--panel)] px-3 py-1 text-sm text-[var(--muted)]">
              <Activity size={15} aria-hidden="true" />
              Production foundation in progress
            </p>
            <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-normal sm:text-5xl">
              Multi-gym operations, built as a clean SaaS dashboard.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--muted)]">
              This workspace is ready for the next phase: database schema, RLS,
              authentication, APIs, and the owner-facing management screens.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/auth/signup"
                className="inline-flex h-10 items-center justify-center rounded-md bg-[var(--primary)] px-4 text-sm font-medium text-white hover:bg-[#0f6853]"
              >
                Create account
              </Link>
              <Link
                href="/auth/login"
                className="inline-flex h-10 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--panel)] px-4 text-sm font-medium hover:bg-[var(--panel-strong)]"
              >
                Login
              </Link>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {phaseItems.map((item, index) => (
              <div
                key={item}
                className="rounded-md border border-[var(--border)] bg-[var(--panel)] p-4"
              >
                <p className="text-sm text-[var(--muted)]">Phase {index + 2}</p>
                <p className="mt-1 font-medium">{item}</p>
              </div>
            ))}
          </div>
        </div>

        <aside className="rounded-md border border-[var(--border)] bg-[var(--panel)] p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-semibold">Environment readiness</p>
              <p className="mt-1 text-sm text-[var(--muted)]">
                {configuredCount} of {envStatus.length} required variables are configured.
              </p>
            </div>
            <div className="flex size-10 items-center justify-center rounded-md bg-[var(--panel-strong)] text-[var(--primary)]">
              <KeyRound size={20} aria-hidden="true" />
            </div>
          </div>

          <div className="mt-5 divide-y divide-[var(--border)] border-y border-[var(--border)]">
            {envStatus.map((item) => (
              <div key={item.key} className="flex items-center justify-between gap-3 py-3">
                <span className="break-all text-sm">{item.key}</span>
                <span
                  className={
                    item.configured
                      ? "rounded-md bg-[#dff4ea] px-2 py-1 text-xs font-medium text-[#145c43]"
                      : "rounded-md bg-[#f8e4dc] px-2 py-1 text-xs font-medium text-[#8f3d1f]"
                  }
                >
                  {item.configured ? "Set" : "Missing"}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-5 flex items-start gap-3 rounded-md bg-[var(--panel-strong)] p-4 text-sm text-[var(--muted)]">
            <Database className="mt-0.5 shrink-0 text-[var(--accent)]" size={18} aria-hidden="true" />
            <p>
              Real credentials should go in your local `.env.local` and deployment
              provider environment settings. They are intentionally ignored by Git.
            </p>
          </div>
        </aside>
      </section>
    </main>
  );
}
```

---

## app/globals.css (at time of archive)

```css
@import "tailwindcss";

:root {
  --background: #f7f7f4;
  --foreground: #18211f;
  --muted: #69736f;
  --panel: #ffffff;
  --panel-strong: #f0f4ef;
  --border: #d8ded9;
  --primary: #147d64;
  --primary-foreground: #ffffff;
  --accent: #c46f2b;
  --danger: #b42318;
}

* {
  box-sizing: border-box;
}

html {
  min-height: 100%;
}

body {
  min-height: 100%;
  margin: 0;
  background: var(--background);
  color: var(--foreground);
  font-family:
    Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
    sans-serif;
}

a {
  color: inherit;
  text-decoration: none;
}

button,
input,
select,
textarea {
  font: inherit;
}

::selection {
  background: #b7e4d5;
  color: #0b372d;
}

@layer components {
  .input-like {
    height: 2.75rem;
    width: 100%;
    border-radius: 0.375rem;
    border: 1px solid var(--border);
    background: #ffffff;
    padding: 0 0.75rem;
    font-size: 0.875rem;
    outline: none;
    transition:
      border-color 150ms ease,
      box-shadow 150ms ease;
  }

  .input-like:focus {
    border-color: var(--primary);
    box-shadow: 0 0 0 2px #b7e4d5;
  }

  .btn-primary,
  .btn-secondary {
    display: inline-flex;
    height: 2.5rem;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    border-radius: 0.375rem;
    padding: 0 1rem;
    font-size: 0.875rem;
    font-weight: 500;
    transition:
      background-color 150ms ease,
      border-color 150ms ease;
  }

  .btn-primary {
    background: var(--primary);
    color: var(--primary-foreground);
  }

  .btn-primary:hover {
    background: #0f6853;
  }

  .btn-secondary {
    border: 1px solid var(--border);
    background: var(--panel);
    color: var(--foreground);
  }

  .btn-secondary:hover {
    background: var(--panel-strong);
  }
}
```

---

## How to restore

To bring back the scaffold page temporarily (e.g., for checking env readiness on a new deployment):

1. Copy the `page.tsx` source above into `app/page.tsx`
2. Ensure `@/lib/config/env-status` still exports `getEnvStatus()`
3. Run `npm run dev`

Alternatively, create a dedicated `/dev/status` route using this code so it doesn't conflict with the production landing page.
