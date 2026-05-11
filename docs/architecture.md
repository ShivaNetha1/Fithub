# Architecture

## Overview

Fithub is a full-stack Next.js SaaS application backed by Supabase PostgreSQL and Supabase Auth.

```text
Browser
  -> Next.js pages and client components
  -> Next.js API routes
  -> Supabase Auth and PostgreSQL
```

## Application Layers

- `app/`: pages, layouts, route groups, and API route handlers.
- `components/`: reusable UI and feature components.
- `lib/`: environment, API helpers, Supabase clients, utilities.
- `types/`: generated and hand-maintained TypeScript types.
- `supabase/migrations/`: SQL migration files.
- `supabase/seed.sql`: sample development data.
- `docs/`: setup, architecture, and deployment documentation.

## Tenant Model

Each authenticated owner has a user profile linked to `auth.users`. Owners can create one or more gyms. Every business table links back to a gym and is protected by Row Level Security.

The primary access rule is:

```text
auth.uid() owns gym -> owner can access rows for that gym
```

## API Model

The app will expose REST APIs under `app/api/*`. Route handlers will:

- validate request bodies with Zod
- resolve the authenticated Supabase user
- query only owner-scoped records
- return consistent JSON success/error shapes
- avoid exposing service-role behavior to browser code

## Deployment

Recommended production deployment:

- Vercel Pro for the Next.js app
- Supabase Pro for PostgreSQL/Auth/backups

Free tiers are suitable for development and demos, but not recommended for real commercial production traffic.
