# Service Signups and Credentials

This is the complete external account checklist for Fithub.

## Required for Development

### 1. Supabase

Create an account and project:

```text
https://supabase.com
```

You will need:

| Value | Put in `.env.local` as | Where to find it |
| --- | --- | --- |
| Project URL | `NEXT_PUBLIC_SUPABASE_URL` | Project Settings > API |
| Publishable key | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Project Settings > API Keys |
| Secret key | `SUPABASE_SECRET_KEY` | Project Settings > API Keys |
| Database connection string | `DATABASE_URL` | Project Settings > Database / Connect |
| Direct DB connection string | `DIRECT_URL` | Project Settings > Database / Connect |
| Database password | inside DB URLs only | The password you set when creating the project |

Legacy fallback names supported:

| Legacy Supabase value | Supported env variable |
| --- | --- |
| `anon` key | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| `service_role` key | `SUPABASE_SERVICE_ROLE_KEY` |

Prefer the newer publishable/secret keys for new projects.

### 2. GitHub

Create or use an account:

```text
https://github.com
```

Needed for:

- version control
- connecting the repo to Vercel
- future collaboration

No app API key is required for Fithub v1.

## Required for Deployment

### 3. Vercel

Create an account:

```text
https://vercel.com
```

Needed for:

- hosting the Next.js app
- production environment variables
- production URL

You will configure the same values from `.env.example` in Vercel Project Settings > Environment Variables.

Vercel will provide:

| Value | Put as |
| --- | --- |
| Production app URL | `NEXT_PUBLIC_APP_URL` |
| Environment variables | Same names as `.env.example` |

## Optional Later

### 4. Custom Domain Provider

Only needed when you want a branded URL like:

```text
app.yourgymbrand.com
```

Examples:

- Namecheap
- GoDaddy
- Cloudflare
- Google Domains/Squarespace Domains

You will need DNS access, not an API key.

### 5. Email Provider

Supabase Auth can send basic auth emails, but production apps usually use a dedicated SMTP provider later.

Possible providers:

- Resend
- Postmark
- SendGrid
- Amazon SES

Not required for the first functional version unless you want branded transactional emails immediately.

### 6. Payment Gateway

Not required for Fithub v1 because payments are manual records.

Possible future providers:

- Razorpay
- Stripe

## Do Not Share Publicly

Never paste these in chat, GitHub, frontend files, screenshots, or browser code:

- `SUPABASE_SECRET_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_URL`
- `DIRECT_URL`
- database password
- deployment tokens
