# Environment Configuration

Fithub never stores production credentials in source code. Keep real values in `.env.local` for local development and in the deployment provider environment settings for production.

## Files

- `.env.example`: safe template committed to source control.
- `.env.local`: local secrets, ignored by Git.
- Vercel Environment Variables: production secrets and URLs.
- Supabase Dashboard: database, auth, API keys, and SQL migrations.

## Required Variables

| Variable | Purpose | Where to get it |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Browser/server Supabase project URL | Supabase Dashboard > Project Settings > API |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Browser-safe publishable key for authenticated access | Supabase Dashboard > Project Settings > API Keys |
| `SUPABASE_SECRET_KEY` | Server-only privileged key for admin API operations | Supabase Dashboard > Project Settings > API Keys |
| `DATABASE_URL` | PostgreSQL pooled connection string | Supabase Dashboard > Project Settings > Database |

## Optional Variables

| Variable | Default | Purpose |
| --- | --- | --- |
| `APP_NAME` | `Fithub` | Display and metadata name |
| `APP_ENV` | `development` | Runtime environment |
| `PORT` | `3000` | Local server port |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` | Public app URL |
| `DIRECT_URL` | empty | Direct database URL if a migration tool needs it |
| `CURRENCY_CODE` | `INR` | Default display currency |
| `EXPIRY_SOON_DAYS` | `7` | Membership expiry warning window |
| `RATE_LIMIT_WINDOW_MS` | `60000` | API rate limit window |
| `RATE_LIMIT_MAX_REQUESTS` | `120` | API rate limit request count |

## Supabase Key Safety

- `NEXT_PUBLIC_*` variables are visible to the browser and must only contain public-safe values.
- `SUPABASE_SECRET_KEY` bypasses Row Level Security and must only be used in server-only code.
- Never paste service role keys into browser components, client hooks, or public logs.

Legacy Supabase projects may show `anon` and `service_role` keys. The app supports `NEXT_PUBLIC_SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY` as fallbacks, but new projects should prefer publishable and secret keys.

## Local Development

Create `.env.local`:

```bash
cp .env.example .env.local
```

Then paste values from Supabase.

## Production

In Vercel:

1. Open Project Settings.
2. Go to Environment Variables.
3. Add the same variables from `.env.example`.
4. Use production Supabase values.
5. Redeploy after saving changes.
