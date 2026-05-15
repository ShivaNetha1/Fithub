# Fithub

Fithub is a multi-gym management SaaS for gym owners. It replaces manual registers with a secure owner workspace for gym setup, members, plans, payments, attendance, renewals, expiry tracking, and analytics.

> Important: local secrets live in `.env.local`, which is ignored by Git. Do not commit `.env.local`, `.env.*`, Supabase secret keys, or database URLs.

## Project Status

The project is now a working clean SaaS foundation with authentication, onboarding, protected app routes, database-backed gym operations, and deployment-ready configuration.

Current state:

- Next.js App Router application with TypeScript
- Supabase Auth integrated across browser, server, middleware, and route handlers
- Supabase PostgreSQL schema, indexes, triggers, helper functions, views, and RLS policies
- Owner signup, login, logout, password reset, invite acceptance, and email confirmation flows
- First-gym onboarding flow that creates the owner workspace and default plans
- Protected dashboard and operational pages for members, plans, payments, attendance, analytics, and settings
- API routes for dashboard data, members, membership plans, payments, attendance, subscriptions, gyms, and analytics
- Vercel-ready deployment setup
- Branded Supabase email templates supported through token-hash confirmation links

## Key Features

- **Owner authentication**
  - Email/password signup and login
  - Supabase invite flow for admin-created users
  - Forgot password and reset password flow
  - Session-aware redirects for authenticated users

- **Invite-to-workspace flow**
  - User receives Supabase invite email
  - User clicks the invite link
  - App verifies the `token_hash` at `/auth/confirm`
  - Invite user is sent to `/auth/reset-password?next=/onboarding`
  - After setting a password, user is sent to `/onboarding`
  - After gym setup, user lands on `/dashboard`

- **Signup-to-workspace flow**
  - User clicks Create account
  - If email confirmation is disabled, user goes directly to `/onboarding`
  - If email confirmation is enabled, confirmation email verifies through `/auth/confirm`
  - Confirmed user goes to `/onboarding`
  - After gym setup, user lands on `/dashboard`

- **Gym onboarding**
  - Captures gym name, phone, email, city, state, country, currency, and timezone
  - Creates the gym record under the authenticated owner
  - Seeds default membership plans
  - Marks `users.onboarding_completed = true`

- **Gym operations**
  - Dashboard summary
  - Member management
  - Membership plans
  - Payments
  - Attendance
  - Analytics
  - Settings shell

- **Security and access control**
  - Protected app routes through Next.js proxy middleware
  - Supabase RLS policies for owner-owned gym data
  - Server-side `requireUser` checks for protected layouts and actions
  - Environment validation through Zod
  - Admin Supabase client helper for server-only privileged work

## Recent Auth and Onboarding Changes

The latest work focused on making Supabase email auth reliable and removing login-page detours.

Changes made:

- Added `/auth/confirm` route for server-side Supabase `token_hash` verification.
- Added client helper logic for legacy hash-fragment auth links.
- Updated invite routing so invited users must set a password first.
- Updated signup routing so normal signup users go to onboarding, not password setup.
- Made `/auth/confirm` and `/auth/reset-password` public routes so middleware does not block email links.
- Updated middleware so authenticated users without onboarding are sent to `/onboarding`.
- Updated the home page redirect so non-onboarded users are sent to onboarding.
- Kept `/auth/callback` as a compatibility fallback for older Supabase links.

## Tech Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Supabase Auth
- Supabase PostgreSQL
- Supabase SSR helpers
- Tailwind CSS
- Zod
- Recharts
- Lucide React
- Vercel

## Important Routes

| Route | Purpose |
| --- | --- |
| `/` | Public entry page with session-aware redirect |
| `/auth/signup` | Owner account creation |
| `/auth/login` | Owner login |
| `/auth/confirm` | Supabase token-hash email verification |
| `/auth/callback` | Legacy Supabase callback compatibility |
| `/auth/forgot-password` | Request password reset email |
| `/auth/reset-password` | Set or reset password |
| `/auth/logout` | Server-side logout |
| `/onboarding` | First gym workspace setup |
| `/dashboard` | Authenticated owner dashboard |
| `/members` | Member management |
| `/plans` | Membership plans |
| `/payments` | Payments |
| `/attendance` | Attendance |
| `/analytics` | Analytics |
| `/settings` | Settings |

## Supabase Configuration

Recommended Auth settings:

- **Site URL**

```text
https://fithub-pi.vercel.app
```

- **Redirect URLs**

```text
https://fithub-pi.vercel.app/**
https://fithub-pi.vercel.app/auth/confirm
https://fithub-pi.vercel.app/auth/callback
https://fithub-pi.vercel.app/auth/reset-password
https://*-shivanetha.vercel.app/**
http://localhost:3001/**
```

For Supabase email templates, prefer `/auth/confirm` links with `{{ .TokenHash }}`.

Invite user template button/fallback URL:

```html
{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=invite&next=/onboarding
```

Confirm signup template button/fallback URL:

```html
{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=signup&next=/onboarding
```

Password recovery template button/fallback URL:

```html
{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/dashboard
```

After changing email templates, resend fresh invites or confirmations. Old email links may still use the previous redirect behavior.

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create a local environment file:

```bash
cp .env.example .env.local
```

3. Fill in Supabase and database values in `.env.local`.

4. Start the app:

```bash
npm run dev
```

If another project uses port 3000, run Next on port 3001:

```bash
npm run dev -- -p 3001
```

5. Open:

```text
http://localhost:3001
```

## Environment Variables

All URLs, API keys, database connection strings, ports, and secret values must come from `.env.local` in development and deployment provider environment settings in production.

See [docs/environment.md](docs/environment.md).

## Database

Database schema and RLS setup are in:

- [supabase/migrations/0001_initial_schema.sql](supabase/migrations/0001_initial_schema.sql)
- [supabase/migrations/0002_seed_membership_plans.sql](supabase/migrations/0002_seed_membership_plans.sql)
- [docs/database.md](docs/database.md)

## Verification

Use these checks before pushing changes:

```bash
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run build
```

On non-Windows shells, `npm run typecheck`, `npm run lint`, and `npm run build` are equivalent.

## Documentation

- [Architecture](docs/architecture.md)
- [Authentication](docs/auth.md)
- [API](docs/api.md)
- [Database](docs/database.md)
- [Deployment](docs/deployment.md)
- [Environment](docs/environment.md)
- [Setup checklist](docs/setup-checklist.md)
- [Service signups](docs/service-signups.md)

## Health Check

```text
GET /api/health
```

This endpoint confirms required environment variable presence without exposing secret values.

## Next Priorities

- End-to-end browser testing for invite, signup, reset password, onboarding, and dashboard entry.
- Polish production email templates in Supabase.
- Add automated tests for auth route handlers and onboarding actions.
- Expand role/team support if gyms need staff accounts beyond the owner.
- Continue improving dashboard analytics and operational workflows.
