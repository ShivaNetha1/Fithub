# Authentication

Fithub uses Supabase Auth for owner signup, login, logout, and session management.

## Implemented Routes

| Route | Purpose |
| --- | --- |
| `/auth/signup` | Owner account creation |
| `/auth/login` | Owner login |
| `/auth/callback` | Supabase email/OAuth callback handler |
| `/auth/logout` | Server-side logout |
| `/dashboard` | Protected owner dashboard |
| `/onboarding` | Protected first-gym setup |

## Route Protection

Next.js `proxy.ts` refreshes Supabase sessions and protects private routes.

Public routes:

- `/`
- `/api/health`
- `/auth/login`
- `/auth/signup`
- `/auth/callback`

All other app routes require a valid owner session.

## Supabase Auth Settings

In Supabase Dashboard > Authentication > URL Configuration:

Set Site URL for local development:

```text
http://localhost:3000
```

Add Redirect URLs:

```text
http://localhost:3000/auth/callback
http://127.0.0.1:3000/auth/callback
https://your-vercel-domain.vercel.app/auth/callback
https://your-custom-domain.com/auth/callback
```

Only add production URLs after deployment.

## Email Confirmation

If Supabase email confirmation is enabled, signup will show a confirmation message and the owner must verify email before login.

If email confirmation is disabled for local development, signup signs the owner in immediately and redirects to `/onboarding`.
