# Fithub

Fithub is a multi-gym management SaaS web application for gym owners. It is designed to replace manual gym records with a secure dashboard for members, plans, attendance, payments, renewals, expiry tracking, and analytics.

> **Important:** this project stores local secrets in `.env.local`, and that file is ignored by git. Do not commit `.env.local` or any `.env.*` file.

## Current Status

Phase 2 is scaffolded:

- Next.js full-stack app structure
- TypeScript strict mode
- Tailwind CSS setup
- Environment variable template
- Supabase browser, server, and admin client helpers
- Health API endpoint
- Basic UI primitives
- Documentation foundation

Phase 3 and 4 are also implemented:

- Supabase PostgreSQL schema and RLS migrations
- Owner signup, login, logout, callback handling
- Protected route proxy
- First-gym onboarding flow
- Authenticated dashboard shell

Implementation will continue phase by phase.

## Tech Stack

- Next.js App Router
- TypeScript
- Supabase PostgreSQL
- Supabase Auth
- Tailwind CSS
- Zod
- Recharts
- Vercel deployment

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

5. Open:

```text
http://localhost:3000
```

## Environment Variables

All URLs, API keys, database connection strings, ports, and secret values must come from `.env.local` in development and provider environment settings in production. See [docs/environment.md](docs/environment.md).

## Database

Database schema and RLS setup are documented in [docs/database.md](docs/database.md).

## Authentication

Authentication setup is documented in [docs/auth.md](docs/auth.md).

## API

REST routes are documented in [docs/api.md](docs/api.md).

## Deployment

Production deployment is documented in [docs/deployment.md](docs/deployment.md).

## Setup Checklist

Beginner-friendly setup steps are documented in [docs/setup-checklist.md](docs/setup-checklist.md).

## Service Signups

Required external accounts and credentials are listed in [docs/service-signups.md](docs/service-signups.md).

## Health Check

```text
GET /api/health
```

This endpoint confirms required environment variable presence without exposing secret values.

## Next Phase

Phase 3 will create the Supabase PostgreSQL schema, migrations, indexes, constraints, RLS policies, and seed data.
